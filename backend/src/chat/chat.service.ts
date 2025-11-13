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

    return chat;
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

  async getChatMessages(userId: number, chatId: number, page = 1, limit = 50, lastMessageId?: number) {
    // Verify user is participant
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { userId, chatId }
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    const skip = lastMessageId ? 0 : (page - 1) * limit;
    const whereClause = {
      chatId,
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
      this.prisma.message.count({ where: { chatId } })
    ]);

    return { 
      messages: messages.reverse(), // Reverse to show oldest first
      total,
      hasMore: messages.length === limit
    };
  }

  async sendMessage(userId: number, chatId: number, sendMessageDto: SendMessageDto) {
    // Verify user is participant
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { userId, chatId }
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        ...sendMessageDto
      },
      include: {
        sender: { include: { profile: true } },
        readBy: true
      }
    });

    // Update chat's updatedAt
    await this.prisma.chat.update({
      where: { id: chatId },
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
