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
  'message:delivered': (data: { chatId: number; messageId: number }) => void;
  'typing:update': (data: TypingIndicator) => void;
  'user:online': (data: OnlineStatusUpdate) => void;
  'chat:created': (data: { chatId: number; participants: number[] }) => void;
  'chat:joined': (data: { chatId: number }) => void;
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
      if (this.socket && this.connected && this.socket.connected) {
        console.log('📋 [WebSocket] Using existing stable connection');
        resolve(this.socket);
        return;
      }

      // Clean up any existing connection first
      if (this.socket) {
        console.log('🧹 [WebSocket] Cleaning up existing connection');
        this.socket.disconnect();
        this.socket = null;
      }

      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      console.log('🔗 [WebSocket] Creating new connection to:', baseUrl);
      
      this.socket = io(baseUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true, // This sends cookies automatically
        autoConnect: true,
        forceNew: false, // Don't force new connection if one exists
        timeout: 20000, // 20 second timeout
        reconnection: true, // Enable auto-reconnection
        reconnectionDelay: 1000, // Wait 1s before reconnecting
        reconnectionAttempts: 5, // Try 5 times
        reconnectionDelayMax: 5000, // Max 5s delay
      });

      this.socket.on('connect', () => {
        console.log('✅ [WebSocket] Connected successfully with ID:', this.socket?.id);
        console.log('🌍 [WebSocket] Connected to server:', baseUrl);
        console.log('🔧 [WebSocket] Connection transport:', this.socket?.io.engine.transport.name);
        this.connected = true;
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ [WebSocket] Disconnected:', reason);
        console.log('🔍 [WebSocket] Disconnect details:', {
          reason,
          socketId: this.socket?.id,
          connected: this.connected
        });
        this.connected = false;
        
        // Auto-reconnect logic
        if (reason === 'io server disconnect') {
          console.log('🚫 [WebSocket] Server initiated disconnect - not reconnecting');
          return;
        }
        
        this.handleReconnect();
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('❌ [WebSocket] Connection error:', error);
        console.log('🔍 [WebSocket] Error details:', {
          message: error?.message || 'Unknown error',
          type: error?.type || 'connection_error',
          description: error?.description || 'WebSocket connection failed',
          context: error?.context || 'websocket_connect',
          baseUrl,
          withCredentials: true
        });
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

  // Event listeners with debugging
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (this.socket) {
      console.log(`🎧 [WebSocket] Registering listener for event: ${event as string}`);
      this.socket.on(event as string, (data: any) => {
        console.log(`📨 [WebSocket] Event received: ${event as string}`, data);
        (callback as any)(data);
      });
    } else {
      console.warn(`⚠️ [WebSocket] Cannot register listener for ${event as string} - socket not available`);
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
    console.log('📨 [WebSocket] Joining chat room:', chatId);
    const success = this.emit('chat:join', { chatId });
    if (success) {
      console.log('✅ [WebSocket] Successfully sent join request for chat:', chatId);
    } else {
      console.error('❌ [WebSocket] Failed to send join request for chat:', chatId);
    }
  }

  leaveChat(chatId: number) {
    console.log('📵 [WebSocket] Leaving chat room:', chatId);
    const success = this.emit('chat:leave', { chatId });
    if (success) {
      console.log('✅ [WebSocket] Successfully sent leave request for chat:', chatId);
    } else {
      console.error('❌ [WebSocket] Failed to send leave request for chat:', chatId);
    }
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

// Singleton instance with HMR persistence
let websocketService: WebSocketService;

// Preserve WebSocket connection across Hot Module Reloads
if (import.meta.hot) {
  if (import.meta.hot.data.websocketService) {
    console.log('🔄 [WebSocket] Reusing existing service across HMR');
    websocketService = import.meta.hot.data.websocketService;
  } else {
    console.log('🆕 [WebSocket] Creating new service instance');
    websocketService = new WebSocketService();
    import.meta.hot.data.websocketService = websocketService;
  }
  
  import.meta.hot.dispose(() => {
    console.log('♻️ [WebSocket] HMR dispose - preserving connection');
    // Don't disconnect on HMR, just preserve the instance
  });
} else {
  websocketService = new WebSocketService();
}

export default websocketService;
