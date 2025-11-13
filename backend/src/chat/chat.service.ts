import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkMessagesReadDto } from './dto/mark-read.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

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
      const existingChat = await this.prisma.chat.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: { in: allParticipantIds }
            }
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

      if (existingChat) return existingChat;
    }

    // Create new chat
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

    // Add unreadCount for consistency with frontend interface
    return {
      ...chat,
      unreadCount: 0 // New chat has no unread messages
    };
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

    console.log('📝 [ChatService] Creating message with data:', {
      chatId: actualChatId,
      senderId: userId,
      ...normalizedDto
    });

    // Create message
    const message = await this.prisma.message.create({
      data: {
        chatId: actualChatId,
        senderId: userId,
        ...normalizedDto
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

    // Create read records (use createMany to handle duplicates)
    await this.prisma.messageRead.createMany({
      data: messageIds.map(messageId => ({
        messageId,
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
}
