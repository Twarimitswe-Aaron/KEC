import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { 
  useGetChatsQuery, 
  useGetMessagesQuery, 
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  Chat,
  Message
} from '../../state/api/chatApi';
import { useGetUserQuery, UserState } from '../../state/api/authApi';
import websocketService from '../../services/websocket';

export interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  currentUser: UserState | null;
  messages: Message[];
  setActiveChat: (chat: Chat) => void;
  sendMessage: (content: string, messageType?: string, fileData?: { fileUrl: string; fileName: string; fileSize: number; fileMimeType: string }, replyToId?: number) => Promise<boolean>;
  markAsRead: (messageIds: number[]) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  isLoading: boolean;
  isConnected: boolean;
  typingUsers: number[];
  onlineUsers: number[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}


export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // API hooks
  const { data: currentUser } = useGetUserQuery();
  const { data: chatsData, isLoading: chatsLoading } = useGetChatsQuery({});

  // Debug loaded chat data and auto-select first valid chat
  useEffect(() => {
    if (chatsData && chatsData.chats) {
      console.log('💬 [ChatContext] Loaded chats:', chatsData.chats.length);

      // Explicitly type firstValidChat so TypeScript knows this is a Chat when set
      let firstValidChat: Chat | null = null;
      chatsData.chats.forEach((chat, index) => {
        console.log(`💬 [ChatContext] Chat ${index}:`, {
          id: chat.id,
          name: chat.name,
          isGroup: chat.isGroup,
          participantsCount: chat.participants?.length || 0,
          participants: chat.participants?.map(p => ({
            id: p.id,
            userId: p.user?.id,
            userName: `${p.user?.firstName} ${p.user?.lastName}`
          }))
        });
        
        // Show detailed participant info for the first chat
        if (index === 0 && chat.participants) {
          console.log('🔍 [ChatContext] Detailed participants for Chat', chat.id, ':', chat.participants);
        }
        
        // Track first valid chat (has participants)
        if (firstValidChat === null && chat.participants && chat.participants.length > 0) {
          firstValidChat = chat;
        }
      });
      
      // Auto-select first valid chat if no active chat is selected
      if (firstValidChat && !activeChat) {
        const chatToSelect: Chat = firstValidChat;
        console.log('🎯 [ChatContext] Auto-selecting first valid chat:', chatToSelect.id);
        setActiveChat(chatToSelect);
      }
    }
    
    if (currentUser) {
      console.log('👤 [ChatContext] Current user:', {
        id: currentUser.id,
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        email: currentUser.email
      });
    }
  }, [chatsData, currentUser, activeChat]);
  const { data: messagesData, isLoading: messagesLoading, error: messagesError, refetch: refetchMessages } = useGetMessagesQuery(
    { chatId: activeChat?.id || 0 },
    { skip: !activeChat }
  );

  // Handle messages API error
  useEffect(() => {
    if (messagesError && activeChat) {
      console.error('❌ [ChatContext] Failed to load messages for chat:', activeChat.id, messagesError);
      
      // If 403 Forbidden, clear the active chat
      if ('status' in messagesError && messagesError.status === 403) {
        console.warn('🔒 [ChatContext] Access denied to chat, clearing selection');
        setActiveChat(null);
      }
    }
  }, [messagesError, activeChat]);
  const [sendMessageMutation] = useSendMessageMutation();
  const [markMessagesAsReadMutation] = useMarkMessagesAsReadMutation();

  // Message handler with current activeChat reference and debounced refetch
  const handleNewMessage = useCallback((message: any) => {
    console.log('🔥 New message received:', JSON.stringify(message, null, 2));
    console.log('📝 Message content:', message?.content);
    console.log('🆔 Message chatId:', message?.chatId);
    console.log('🎯 Current activeChat:', activeChat?.id);
    console.log('👤 Message sender:', message?.senderId, 'Current user:', currentUser?.id);
    
    // Only refetch for messages from OTHER users to avoid conflicts with optimistic updates
    if (activeChat && String(message.chatId) === String(activeChat.id)) {
      // Skip refetch for own messages (RTK Query optimistic updates handle this)
      if (message.senderId === currentUser?.id) {
        console.log('� [ChatContext] Skipping refetch for own message (handled by optimistic update)');
        return; 
      }
      
      console.log('� Message from other user - scheduling refresh...');
      
      // Clear existing timeout to debounce multiple rapid messages
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      
      // Debounced refetch to prevent multiple rapid calls
      refetchTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Refetching messages after debounce (other user message)...');
        refetchMessages();
      }, 150); // Slightly longer delay with debouncing
    } else {
      console.log('❌ Message not for current chat or no active chat');
    }
  }, [activeChat, refetchMessages, currentUser]);

  // WebSocket connection
  useEffect(() => {
    if (currentUser) {
      console.log('🔗 [ChatContext] Attempting WebSocket connection for user:', currentUser.id);
      websocketService.connect().then(() => {
        console.log('✅ [ChatContext] WebSocket connected successfully');
        setIsConnected(true);
        
        // Set up event listeners
        websocketService.on('message:new', handleNewMessage);
        
        // Listen for connection confirmation events
        websocketService.on('chat:joined', (data) => {
          console.log('✅ [ChatContext] Successfully joined chat room:', data.chatId);
        });
        
        websocketService.on('error', (error) => {
          console.error('❌ [ChatContext] WebSocket error:', error);
        });

        websocketService.on('typing:update', (data) => {
          setTypingUsers(prev => {
            if (data.isTyping) {
              return [...prev.filter(id => id !== data.userId), data.userId];
            } else {
              return prev.filter(id => id !== data.userId);
            }
          });
        });

        websocketService.on('user:online', (data) => {
          setOnlineUsers(prev => {
            if (data.isOnline) {
              return [...prev.filter(id => id !== data.userId), data.userId];
            } else {
              return prev.filter(id => id !== data.userId);
            }
          });
        });
      }).catch(console.error);

      return () => {
        websocketService.disconnect();
        setIsConnected(false);
        // Clear any pending refetch timeouts
        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current);
        }
      };
    }
  }, [currentUser, handleNewMessage]);

  // Join/leave chat rooms when active chat changes
  useEffect(() => {
    if (activeChat && isConnected) {
      // Only join if it's a real chat (not temp)
      const chatId = typeof activeChat.id === 'string' && (activeChat.id as string).startsWith('temp_') 
        ? null 
        : Number(activeChat.id);
        
      if (chatId !== null) {
        websocketService.joinChat(chatId);
        return () => {
          websocketService.leaveChat(chatId);
        };
      }
    }
  }, [activeChat, isConnected]);

  const sendMessage = useCallback(async (
    content: string, 
    messageType: string = 'TEXT', 
    fileData?: { fileUrl: string; fileName: string; fileSize: number; fileMimeType: string },
    replyToId?: number
  ): Promise<boolean> => {
    if (!activeChat || !currentUser) return false;

    try {
      console.log('🔧 [ChatContext] Sending message:', { content, messageType, replyToId, hasFileData: !!fileData });
      
      const messagePayload: any = {
        chatId: activeChat.id,
        content: content || undefined,
        messageType: messageType as 'TEXT' | 'IMAGE' | 'FILE' | 'LINK'
      };

      if (fileData) {
        messagePayload.fileUrl = fileData.fileUrl;
        messagePayload.fileName = fileData.fileName;
        messagePayload.fileSize = fileData.fileSize;
        messagePayload.fileMimeType = fileData.fileMimeType;
      }

      if (replyToId) {
        messagePayload.replyToId = replyToId;
        console.log('💬 [ChatContext] Adding reply reference:', replyToId);
      }

      console.log('📤 [ChatContext] Final message payload:', messagePayload);
      
      await sendMessageMutation(messagePayload).unwrap();
      console.log('✅ [ChatContext] Message sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }, [activeChat, currentUser, sendMessageMutation]);

  const markAsRead = useCallback(async (messageIds: number[]) => {
    if (!activeChat || messageIds.length === 0) return;

    try {
      await markMessagesAsReadMutation({
        chatId: activeChat.id,
        messageIds,
      }).unwrap();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [activeChat, markMessagesAsReadMutation]);

  const handleSetActiveChat = useCallback((chat: Chat) => {
    console.log('🎯 [ChatContext] Setting active chat:', {
      chatId: chat.id,
      chatName: chat.name,
      isGroup: chat.isGroup,
      participantsCount: chat.participants?.length || 0,
      participants: chat.participants?.map(p => ({
        id: p.id,
        userId: p.user?.id,
        userName: `${p.user?.firstName} ${p.user?.lastName}`,
        isCurrentUser: p.user?.id === currentUser?.id
      })),
      currentUserId: currentUser?.id
    });

    // Validate chat has participants
    if (!chat.participants || chat.participants.length === 0) {
      console.warn('⚠️ [ChatContext] Trying to select chat with no participants! Chat ID:', chat.id);
      // Try to find this chat in loaded chats to get fresh data
      const freshChat = chatsData?.chats.find(c => c.id === chat.id);
      if (freshChat && freshChat.participants && freshChat.participants.length > 0) {
        console.log('✅ [ChatContext] Found fresh chat data with participants:', freshChat.participants.length);
        setActiveChat(freshChat);
        return;
      } else {
        console.error('❌ [ChatContext] Chat not found in loaded chats or still has no participants');
        return;
      }
    }
    
    setActiveChat(chat);
    
    // Mark unread messages as read
    if (chat.unreadCount > 0 && messagesData?.messages) {
      const unreadMessageIds = messagesData.messages
        .filter(msg => !msg.isRead && msg.senderId !== currentUser?.id)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
      }
    }
  }, [messagesData, currentUser, markAsRead]);

  const handleSetIsTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
    if (activeChat && currentUser && isConnected) {
      websocketService.updateTypingStatus(activeChat.id, currentUser.id, typing);
    }
  }, [activeChat, currentUser, isConnected]);

  const value: ChatContextType = {
    chats: chatsData?.chats || [],
    activeChat,
    currentUser: currentUser || null,
    messages: messagesData?.messages || [],
    setActiveChat: handleSetActiveChat,
    sendMessage,
    markAsRead,
    isTyping,
    setIsTyping: handleSetIsTyping,
    isLoading: chatsLoading || messagesLoading,
    isConnected,
    typingUsers,
    onlineUsers,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
