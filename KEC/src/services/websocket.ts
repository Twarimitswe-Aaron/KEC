import { io, Socket } from 'socket.io-client';

// Temporary interfaces until backend is ready
interface Message {
  id: number;
  senderId: number;
  content: string;
  messageType: string;
  createdAt: string;
  sender: any;
}

interface TypingIndicator {
  chatId: number;
  userId: number;
  isTyping: boolean;
}

interface OnlineStatusUpdate {
  userId: number;
  isOnline: boolean;
}

export interface WebSocketEvents {
  // Incoming events
  'message:new': (message: Message) => void;
  'message:read': (data: { chatId: number; messageIds: number[]; userId: number }) => void;
  'typing:update': (data: TypingIndicator) => void;
  'user:online': (data: OnlineStatusUpdate) => void;
  'chat:created': (data: { chatId: number; participants: number[] }) => void;
  'connect': () => void;
  'disconnect': () => void;
  'error': (error: any) => void;

  // Outgoing events
  'message:send': (data: { chatId: number; content: string; messageType: string }) => void;
  'message:typing': (data: TypingIndicator) => void;
  'user:status': (data: { isOnline: boolean }) => void;
  'chat:join': (chatId: number) => void;
  'chat:leave': (chatId: number) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.connected) {
        resolve(this.socket);
        return;
      }

      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      
      this.socket = io(baseUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true, // This sends cookies automatically
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('📡 WebSocket connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('📡 WebSocket disconnected:', reason);
        this.connected = false;
        
        // Auto-reconnect logic
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          return;
        }
        
        this.handleReconnect();
      });

      this.socket.on('connect_error', (error) => {
        console.error('📡 WebSocket connection error:', error);
        this.connected = false;
        reject(error);
        this.handleReconnect();
      });

      // Connection timeout
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`📡 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error('📡 Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.reconnectAttempts = 0;
    }
  }

  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  // Event listeners
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (this.socket) {
      this.socket.on(event as string, callback as any);
    }
  }

  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event as string, callback as any);
      } else {
        this.socket.off(event as string);
      }
    }
  }

  // Emit events
  emit<K extends keyof WebSocketEvents>(event: K, data?: any) {
    if (this.socket && this.connected) {
      this.socket.emit(event as string, data);
      return true;
    }
    console.warn('📡 Cannot emit event - WebSocket not connected');
    return false;
  }

  // Chat-specific methods
  joinChat(chatId: number) {
    this.emit('chat:join', { chatId });
  }

  leaveChat(chatId: number) {
    this.emit('chat:leave', { chatId });
  }

  sendMessage(chatId: number, content: string, messageType: string = 'text') {
    return this.emit('message:send', { chatId, content, messageType });
  }

  updateTypingStatus(chatId: number, userId: number, isTyping: boolean) {
    this.emit('message:typing', { chatId, userId, isTyping });
  }

  updateOnlineStatus(isOnline: boolean) {
    this.emit('user:status', { isOnline });
  }

  // Get socket instance for custom usage
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;
