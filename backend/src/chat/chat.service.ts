import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkMessagesReadDto } from './dto/mark-read.dto';
// TODO: Create proper DTOs for edit and reaction functionality
// import { EditMessageDto } from './dto/edit-message.dto';
// import { AddReactionDto } from './dto/add-reaction.dto';

@Injectable()
export class ChatService {
  private chatGateway: any = null;

  constructor(
    private prisma: PrismaService
  ) {}

  // Method to set the gateway reference from the gateway itself
  setChatGateway(gateway: any) {
    this.chatGateway = gateway;
    console.log('✅ [ChatService] ChatGateway reference set successfully');
  }

  async createChat(userId: number, createChatDto: CreateChatDto) {
    const { participantIds, isGroup = false, name, groupAvatar } = createChatDto;
    
    // Add current user to participants if not included
    const allParticipantIds = [...new Set([userId, ...participantIds])];
    
    // Validate participants exist
    const users = await this.prisma.user.findMany({
      where: { id: { in: allParticipantIds } },
    });
    
    if (users.length !== allParticipantIds.length) {
      throw new BadRequestException('Some participants do not exist');
    }

    // For one-on-one chats, check if chat already exists
    if (!isGroup && allParticipantIds.length === 2) {
      console.log('🔍 [ChatService] Looking for existing 1-on-1 chat between users:', allParticipantIds);
      
      // More precise query to find existing chat
      const existingChat = await this.prisma.chat.findFirst({
        where: {
          isGroup: false,
          AND: [
            {
              participants: {
                some: { userId: allParticipantIds[0] }
              }
            },
            {
              participants: {
                some: { userId: allParticipantIds[1] }
              }
            }
          ]
        },
        include: {
          participants: {
            include: { user: { include: { profile: true } } }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: { include: { profile: true } }
            }
          }
        }
      });

      if (existingChat) {
        console.log('✅ [ChatService] Found existing chat:', {
          id: existingChat.id,
          participantsCount: existingChat.participants.length,
          participants: existingChat.participants.map(p => ({ id: p.id, userId: p.userId }))
        });
        
        // Validate that the existing chat has the correct participants
        if (existingChat.participants.length !== 2) {
          console.error('❌ [ChatService] Existing chat has wrong participant count:', existingChat.participants.length);
        }
        
        return existingChat;
      }
      
      console.log('🆕 [ChatService] No existing chat found, creating new one');
    }

    // Create new chat
    console.log('🆕 [ChatService] Creating new chat with participants:', allParticipantIds);
    
    const chat = await this.prisma.chat.create({
      data: {
        isGroup,
        name: isGroup ? name : null,
        groupAvatar: isGroup ? groupAvatar : null,
        participants: {
          create: allParticipantIds.map(participantId => ({
            userId: participantId,
            isAdmin: participantId === userId && isGroup, // Creator is admin for groups
          }))
        }
      },
      include: {
        participants: {
          include: { user: { include: { profile: true } } }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { include: { profile: true } }
          }
        }
      }
    });
    
    console.log('✅ [ChatService] Created new chat:', {
      id: chat.id,
      participantsCount: chat.participants.length,
      participants: chat.participants.map(p => ({ id: p.id, userId: p.userId }))
    });
    
    // Validate that participants were created successfully
    if (chat.participants.length !== allParticipantIds.length) {
      console.error('❌ [ChatService] CRITICAL: Chat created but participants count mismatch!', {
        expected: allParticipantIds.length,
        actual: chat.participants.length,
        expectedParticipants: allParticipantIds,
        actualParticipants: chat.participants.map(p => p.userId)
      });
    }

    // Final validation before returning
    if (!chat.participants || chat.participants.length === 0) {
      console.error('❌ [ChatService] CRITICAL ERROR: Chat has no participants!', chat);
      throw new Error('Chat creation failed: No participants added');
    }
    
    // Add unreadCount for consistency with frontend interface
    const finalChat = {
      ...chat,
      unreadCount: 0 // New chat has no unread messages
    };
    
    console.log('✅ [ChatService] Returning chat with participants:', {
      id: finalChat.id,
      participantsCount: finalChat.participants.length
    });
    
    return finalChat;
  }

  async getUserChats(userId: number, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause = {
      participants: {
        some: { userId }
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          {
            participants: {
              some: {
                user: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } }
                  ]
                }
              }
            }
          }
        ]
      })
    };

    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where: whereClause as any,
        include: {
          participants: {
            include: { user: { include: { profile: true, userStatus: true } } }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: { include: { profile: true } },
              readBy: { where: { userId } }
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.chat.count({ where: whereClause as any })
    ]);

    // Calculate unread count for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await this.prisma.message.count({
          where: {
            chatId: chat.id,
            senderId: { not: userId },
            readBy: {
              none: { userId }
            }
          }
        });

        return {
          ...chat,
          unreadCount,
          lastMessage: chat.messages[0] || null
        };
      })
    );

    return { chats: chatsWithUnreadCount, total };
  }

  async getChatById(userId: number, chatId: number) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: { some: { userId } }
      },
      include: {
        participants: {
          include: { user: { include: { profile: true, userStatus: true } } }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { include: { profile: true } }
          }
        }
      }
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async getChatMessages(userId: number, chatId: number | string, page = 1, limit = 50, lastMessageId?: number) {
    // Convert chatId to number if it's a string (handle frontend temp IDs)
    const actualChatId = typeof chatId === 'string' && chatId.startsWith('temp_') 
      ? null // Handle temp IDs 
      : Number(chatId);

    // If we have a temp chat ID, return empty messages
    if (actualChatId === null) {
      return { messages: [], total: 0, hasMore: false };
    }

    // Verify user is participant
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { userId, chatId: actualChatId }
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    const skip = lastMessageId ? 0 : (page - 1) * limit;
    const whereClause = {
      chatId: actualChatId,
      ...(lastMessageId && { id: { lt: lastMessageId } })
    };

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: whereClause,
        include: {
          sender: { include: { profile: true } },
          readBy: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.message.count({ where: { chatId: actualChatId } })
    ]);

    return { 
      messages: messages.reverse(), // Reverse to show oldest first
      total,
      hasMore: messages.length === limit
    };
  }

  async sendMessage(userId: number, chatId: number | string, sendMessageDto: SendMessageDto) {
    console.log('🔧 [ChatService] sendMessage called:', {
      userId,
      chatId,
      sendMessageDto,
      hasReplyToId: !!sendMessageDto.replyToId
    });
    
    // Convert chatId to number if it's a string (handle frontend temp IDs)
    const actualChatId = typeof chatId === 'string' && chatId.startsWith('temp_') 
      ? null // Handle temp IDs - we'll need to find or create the real chat
      : Number(chatId);

    // If we have a temp chat ID, we need to find or create a real chat first
    if (actualChatId === null) {
      throw new BadRequestException('Cannot send message to temporary chat. Please create a real chat first.');
    }

    // Verify user is participant
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { userId, chatId: actualChatId }
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    // Normalize messageType to uppercase (handle frontend lowercase)
    const normalizedDto = {
      ...sendMessageDto,
      messageType: sendMessageDto.messageType.toUpperCase() as any
    };

    // Validate replyToId (must exist and belong to the same chat)
    const { replyToId, ...restDto } = normalizedDto as any;
    let validReplyToId: number | undefined = undefined;
    if (replyToId) {
      const reply = await this.prisma.message.findUnique({
        where: { id: Number(replyToId) },
        select: { id: true, chatId: true }
      });
      if (reply && reply.chatId === actualChatId) {
        validReplyToId = Number(replyToId);
      } else {
        console.warn('⚠️ [ChatService] Ignoring invalid replyToId:', replyToId, 'for chat', actualChatId);
      }
    }

    const messageData: any = {
      ...restDto,
      ...(validReplyToId ? { replyToId: validReplyToId } : {})
    };

    console.log('📝 [ChatService] Creating message with data:', {
      chatId: actualChatId,
      senderId: userId,
      ...messageData
    });

    // Create message
    const message = await this.prisma.message.create({
      data: {
        chatId: actualChatId,
        senderId: userId,
        ...messageData
      },
      include: {
        sender: { include: { profile: true } },
        readBy: true
      }
    });

    console.log('✅ [ChatService] Message created successfully:', {
      id: message.id,
      replyToId: (message as any).replyToId,
      content: message.content?.substring(0, 50) + '...'
    });

    // Update chat's updatedAt
    await this.prisma.chat.update({
      where: { id: actualChatId },
      data: { updatedAt: new Date() }
    });

    // Broadcast message via WebSocket if gateway is available
    if (this.chatGateway?.server) {
      console.log('📡 [ChatService] Broadcasting message via WebSocket to room:', `chat:${actualChatId}`);
      this.chatGateway.server.to(`chat:${actualChatId}`).emit('message:new', message);
      console.log('✅ [ChatService] WebSocket broadcast completed');
    } else {
      console.warn('⚠️ [ChatService] ChatGateway not available for WebSocket broadcast');
    }

    return message;
  }

  async markMessagesAsRead(userId: number, chatId: number, markReadDto: MarkMessagesReadDto) {
    const { messageIds } = markReadDto;

    // Verify user is participant
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { userId, chatId }
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    // Filter to existing messages in this chat to avoid FK violations
    const existingMessages = await this.prisma.message.findMany({
      where: { id: { in: messageIds }, chatId }
    });

    if (existingMessages.length === 0) {
      return { success: true };
    }

    await this.prisma.messageRead.createMany({
      data: existingMessages.map((m) => ({
        messageId: m.id,
        userId
      })),
      skipDuplicates: true
    });

    return { success: true };
  }

  async deleteMessage(userId: number, chatId: number, messageId: number) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, chatId, senderId: userId }
    });

    if (!message) {
      throw new NotFoundException('Message not found or you do not have permission');
    }

    await this.prisma.message.delete({
      where: { id: messageId }
    });

    return { success: true };
  }

  async updateUserStatus(userId: number, isOnline: boolean) {
    try {
      console.log('🔧 [ChatService] Updating user status:', { userId, isOnline });
      
      // First, check if the user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!userExists) {
        console.log('❌ [ChatService] User does not exist:', userId);
        return; // Silently return if user doesn't exist
      }

      await this.prisma.userStatus.upsert({
        where: { userId },
        update: {
          isOnline,
          lastSeen: new Date()
        },
        create: {
          userId,
          isOnline,
          lastSeen: new Date()
        }
      });
      
      console.log('✅ [ChatService] User status updated successfully:', { userId, isOnline });
    } catch (error) {
      console.error('❌ [ChatService] Failed to update user status:', error);
      // Don't throw error to prevent WebSocket connection failures
    }

    return { success: true };
  }

  async getUsers(search?: string, excludeIds?: number[], limit = 50) {
    return this.prisma.user.findMany({
      where: {
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(excludeIds && { id: { notIn: excludeIds } })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profile: {
          select: {
            avatar: true,
            phone: true,
            work: true,
            education: true,
            resident: true
          }
        },
        userStatus: {
          select: {
            isOnline: true,
            lastSeen: true
          }
        }
      },
      take: limit,
      orderBy: [
        { userStatus: { isOnline: 'desc' } },
        { firstName: 'asc' }
      ]
    });
  }

  async editMessage(userId: number, chatId: number, messageId: number, body: { content: string }) {
    console.log('✏️ [ChatService] Editing message:', { userId, chatId, messageId, content: body.content });

    // First verify the message exists and belongs to the user
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chatId: Number(chatId),
        senderId: userId,
        messageType: 'TEXT' // Only allow editing text messages
      }
    });

    if (!message) {
      throw new NotFoundException('Message not found or you are not allowed to edit this message');
    }

    // Update the message
    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: body.content,
        isEdited: true,
        updatedAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: { avatar: true }
            }
          }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            messageType: true,
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Emit the updated message via WebSocket
    if (this.chatGateway) {
      this.chatGateway.server.to(`chat_${chatId}`).emit('messageEdited', updatedMessage);
    }

    console.log('✅ [ChatService] Message edited successfully:', messageId);
    return updatedMessage;
  }

  async addReaction(userId: number, chatId: number, messageId: number, body: { emoji: string }) {
    console.log('😀 [ChatService] Adding reaction:', { userId, chatId, messageId, emoji: body.emoji });

    // Verify the message exists and user has access to the chat
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chatId: Number(chatId)
      }
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is a participant in the chat
    const participant = await this.prisma.chatParticipant.findFirst({
      where: {
        userId,
        chatId: Number(chatId)
      }
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    // For now, we'll handle reactions in memory without database storage
    // In a production system, you would create a reactions table
    console.log('✅ [ChatService] Reaction validation passed - user is participant');

    // Emit the reaction via WebSocket for real-time updates
    if (this.chatGateway) {
      this.chatGateway.server.to(`chat_${chatId}`).emit('reaction:added', {
        messageId,
        emoji: body.emoji,
        userId,
        userName: `User ${userId}` // You might want to get actual name
      });
    }

    console.log('✅ [ChatService] Reaction added successfully');
    return { messageId, emoji: body.emoji, userId };
  }

  async removeReaction(userId: number, chatId: number, messageId: number, emoji: string) {
    console.log('😐 [ChatService] Removing reaction:', { userId, chatId, messageId, emoji });

    // Verify the message exists
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chatId: Number(chatId)
      }
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // For now, just emit the reaction removal via WebSocket
    // In a production system, you would remove from reactions table
    if (this.chatGateway) {
      this.chatGateway.server.to(`chat_${chatId}`).emit('reaction:removed', {
        messageId,
        emoji,
        userId
      });
    }

    console.log('✅ [ChatService] Reaction removed successfully');
    return { messageId, emoji, userId };
  }
}
