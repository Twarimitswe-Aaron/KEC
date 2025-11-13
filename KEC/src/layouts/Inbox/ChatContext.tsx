import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  sendMessage: (content: string, messageType?: string) => Promise<boolean>;
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

  // API hooks
  const { data: currentUser } = useGetUserQuery();
  const { data: chatsData, isLoading: chatsLoading } = useGetChatsQuery({});
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useGetMessagesQuery(
    { chatId: activeChat?.id || 0 },
    { skip: !activeChat }
  );
  const [sendMessageMutation] = useSendMessageMutation();
  const [markMessagesAsReadMutation] = useMarkMessagesAsReadMutation();

  // Message handler with current activeChat reference
  const handleNewMessage = useCallback((message: any) => {
    console.log('🔥 New message received:', JSON.stringify(message, null, 2));
    console.log('📝 Message content:', message?.content);
    console.log('🆔 Message chatId:', message?.chatId);
    console.log('🎯 Current activeChat:', activeChat?.id);
    console.log('👤 Message sender:', message?.senderId, 'Current user:', currentUser?.id);
    
    // Refetch messages for the current chat (both own and other users)
    if (activeChat && String(message.chatId) === String(activeChat.id)) {
      console.log('📥 Message received - refreshing...');
      // Small delay to prevent race conditions with optimistic updates
      setTimeout(() => {
        refetchMessages();
      }, 100);
    } else {
      console.log('❌ Message not for current chat or no active chat');
    }
  }, [activeChat, refetchMessages, currentUser]);

  // WebSocket connection
  useEffect(() => {
    if (currentUser) {
      websocketService.connect().then(() => {
        setIsConnected(true);
        
        // Set up event listeners
        websocketService.on('message:new', handleNewMessage);

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

  const sendMessage = useCallback(async (content: string, messageType: string = 'TEXT'): Promise<boolean> => {
    if (!activeChat || !currentUser) return false;

    try {
      // Always use API mutation for sending messages to ensure optimistic updates work
      await sendMessageMutation({
        chatId: activeChat.id,
        content,
        messageType: messageType as any,
      }).unwrap();
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
