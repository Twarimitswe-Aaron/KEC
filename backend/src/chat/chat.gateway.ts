import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

interface TypingData {
  chatId: number;
  userId: number;
  isTyping: boolean;
}

interface JoinChatData {
  chatId: number;
}

interface SendMessageData {
  chatId: number;
  content: string;
  messageType: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<number, string>(); // userId -> socketId
  private userSockets = new Map<string, number>(); // socketId -> userId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Try to get token from auth header first (JWT)
      let token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      // If no JWT token, try to extract from cookies
      if (!token) {
        const cookies = client.handshake.headers.cookie;
        if (cookies) {
          // Parse cookies to extract auth token
          const cookieObj = cookies.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          
          // Look for the specific auth cookie name used by your app
          token = cookieObj['jwt_access'];
        }
      }
      
      if (!token) {
        this.logger.warn('Client attempted to connect without token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      
      // Ensure userId exists before proceeding
      if (!client.userId) {
        this.logger.warn('Invalid token payload - no userId');
        client.disconnect();
        return;
      }
      
      // Track user connection
      this.connectedUsers.set(client.userId, client.id);
      this.userSockets.set(client.id, client.userId);

      // Update user online status
      await this.chatService.updateUserStatus(client.userId, true);

      // Auto-join user to all their existing chat rooms
      await this.autoJoinUserChats(client);

      // Broadcast user online status to relevant chats
      this.broadcastUserOnlineStatus(client.userId, true);

      this.logger.log(`User ${client.userId} connected with socket ${client.id}`);
    } catch (error) {
      this.logger.error('Authentication failed', error);
      client.disconnect();
    }
  }

  private async autoJoinUserChats(client: AuthenticatedSocket) {
    try {
      if (!client.userId) return;
      
      // Get all chats for this user
      const userChats = await this.chatService.getUserChats(client.userId, 1, 100); // Get up to 100 chats
      
      // Join all chat rooms
      userChats.chats.forEach(chat => {
        const roomName = `chat:${chat.id}`;
        client.join(roomName);
      });

      this.logger.log(`User ${client.userId} auto-joined ${userChats.chats.length} chat rooms`);
    } catch (error) {
      this.logger.error(`Failed to auto-join chats for user ${client.userId}`, error);
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remove user from tracking
      this.connectedUsers.delete(client.userId);
      this.userSockets.delete(client.id);

      // Update user offline status
      await this.chatService.updateUserStatus(client.userId, false);

      // Broadcast user offline status
      this.broadcastUserOnlineStatus(client.userId, false);

      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('chat:join')
  handleJoinChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: JoinChatData) {
    if (!client.userId) return;

    const roomName = `chat:${data.chatId}`;
    client.join(roomName);
    this.logger.log(`User ${client.userId} joined chat ${data.chatId}`);
  }

  @SubscribeMessage('chat:leave')
  handleLeaveChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: JoinChatData) {
    if (!client.userId) return;

    const roomName = `chat:${data.chatId}`;
    client.leave(roomName);
    this.logger.log(`User ${client.userId} left chat ${data.chatId}`);
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: SendMessageData) {
    if (!client.userId) return;

    try {
      this.logger.log(`📨 Received message: "${data.content}" for chat ${data.chatId} from user ${client.userId}`);
      
      const message = await this.chatService.sendMessage(client.userId, data.chatId, {
        content: data.content,
        messageType: data.messageType as any,
      });

      this.logger.log(`💾 Saved message to DB: ${JSON.stringify({id: message.id, content: message.content, chatId: message.chatId})}`);

      // Broadcast message to all participants in the chat
      this.server.to(`chat:${data.chatId}`).emit('message:new', message);
      
      this.logger.log(`📡 Broadcasted message to room chat:${data.chatId}`);
    } catch (error) {
      this.logger.error('Failed to send message', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('message:typing')
  handleTyping(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: TypingData) {
    if (!client.userId) return;

    // Broadcast typing indicator to other participants
    client.to(`chat:${data.chatId}`).emit('typing:update', {
      chatId: data.chatId,
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('user:status')
  async handleUserStatus(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { isOnline: boolean }) {
    if (!client.userId) return;

    await this.chatService.updateUserStatus(client.userId, data.isOnline);
    this.broadcastUserOnlineStatus(client.userId, data.isOnline);
  }

  private async broadcastUserOnlineStatus(userId: number, isOnline: boolean) {
    // Get all chats where this user is a participant
    const userChats = await this.chatService.getUserChats(userId);
    
    // Get all other participants from these chats
    const participantIds = new Set<number>();
    userChats.chats.forEach(chat => {
      chat.participants.forEach(participant => {
        if (participant.userId !== userId) {
          participantIds.add(participant.userId);
        }
      });
    });

    // Broadcast to connected participants
    participantIds.forEach(participantId => {
      const socketId = this.connectedUsers.get(participantId);
      if (socketId) {
        this.server.to(socketId).emit('user:online', {
          userId,
          isOnline,
          lastSeen: new Date().toISOString(),
        });
      }
    });
  }

  // Method to send message to specific user
  sendMessageToUser(userId: number, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // Method to broadcast to chat participants
  broadcastToChat(chatId: number, event: string, data: any, excludeUserId?: number) {
    this.server.to(`chat:${chatId}`).emit(event, data);
  }

  // Method to get online users count
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Method to check if user is online
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }
}
