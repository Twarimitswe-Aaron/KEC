import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import { 
  useGetChatsQuery, 
  useGetMessagesQuery, 
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  Chat,
  Message,
  chatApi
} from '../../state/api/chatApi';
import { useGetUserQuery, UserState } from '../../state/api/authApi';
import websocketService from '../../services/websocket';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../state/store';

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
  // Unread message functionality
  unreadMessages: Message[];
  firstUnreadMessageId: number | null;
  markAllAsRead: () => void;
  scrollToUnread: () => void;
  isTabVisible: boolean;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}


export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [lastReadMessageId, setLastReadMessageId] = useState<number | null>(null);
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unreadScrollRef = useRef<(() => void) | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  // Handle tab visibility for Instagram-like unread behavior
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
      console.log('👁️ [ChatContext] Tab visibility changed:', !document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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
  const { data: messagesData, isLoading: messagesLoading, error: messagesError } = useGetMessagesQuery(
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


  // WebSocket connection with proper event listener cleanup
  useEffect(() => {
    if (currentUser) {
      console.log('🔗 [ChatContext] Attempting WebSocket connection for user:', currentUser.id);
      
      // Check if already connected to avoid unnecessary reconnections
      if (websocketService.isConnected()) {
        console.log('📋 [ChatContext] WebSocket already connected, setting up listeners only');
        setIsConnected(true);
      }
      
      // Move handleNewMessage inside useEffect to avoid dependency issues
      const handleNewMessageLocal = (message: any) => {
        console.log('🔥 [ChatContext] New message received in real-time:', {
          messageId: message?.id,
          chatId: message?.chatId, 
          senderId: message?.senderId,
          content: message?.content
        });
        
        // Validate message structure
        if (!message || !message.chatId || !message.id) {
          console.warn('⚠️ [ChatContext] Invalid message structure:', message);
          return;
        }
        
        // Update cache immediately for real-time experience
        try {
          dispatch(
            chatApi.util.updateQueryData('getMessages', { chatId: message.chatId }, (draft) => {
              // Check if message already exists to prevent duplicates
              const existingMessage = draft.messages.find(msg => msg.id === message.id);
              if (!existingMessage) {
                console.log('✨ [ChatContext] Adding new message to cache:', message.id);
                // Add new message to the end of the array (newest last)
                draft.messages.push({
                  id: message.id,
                  chatId: message.chatId,
                  senderId: message.senderId,
                  content: message.content || '',
                  messageType: message.messageType || 'TEXT',
                  createdAt: message.createdAt || new Date().toISOString(),
                  updatedAt: message.updatedAt || new Date().toISOString(),
                  isRead: false, // New messages from others are unread
                  isDelivered: true,
                  sender: message.sender || null,
                  replyToId: message.replyToId || null,
                  replyTo: message.replyTo || null,
                  fileUrl: message.fileUrl || null,
                  fileName: message.fileName || null,
                  fileSize: message.fileSize || null,
                  fileMimeType: message.fileMimeType || null
                });
                
                // Sort messages by creation time to maintain order
                draft.messages.sort((a, b) => 
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
              } else {
                console.log('📝 [ChatContext] Message already exists, updating:', message.id);
                // Update existing message
                Object.assign(existingMessage, message);
              }
            })
          );
          
          // Also update chat list to show latest message
          dispatch(
            chatApi.util.updateQueryData('getChats', {}, (draft) => {
              const chat = draft.chats.find(c => c.id === message.chatId);
              if (chat) {
                // Update last message info - assign the complete message object
                chat.lastMessage = message;
                chat.lastMessageTime = message.createdAt || new Date().toISOString();
                
                // Increment unread count if not from current user
                if (message.senderId !== currentUser?.id) {
                  chat.unreadCount = (chat.unreadCount || 0) + 1;
                }
                
                // Move chat to top of the list
                const chatIndex = draft.chats.findIndex(c => c.id === message.chatId);
                if (chatIndex > 0) {
                  const [movedChat] = draft.chats.splice(chatIndex, 1);
                  draft.chats.unshift(movedChat);
                }
              }
            })
          );
          
          // Force cache invalidation to ensure UI updates
          if (message.chatId) {
            dispatch(chatApi.util.invalidateTags([
              { type: 'Message', id: message.chatId },
              { type: 'Chat', id: 'LIST' }
            ]));
          }
          
          console.log('✅ [ChatContext] Real-time message cache updated successfully with invalidation');
          
        } catch (error) {
          console.error('❌ [ChatContext] Failed to update message cache:', error);
        }
      };
      
      // Define event handlers that we can properly clean up
      const messageHandler = (message: any) => {
        console.log('🔥 [ChatContext] Message received via WebSocket:', message);
        handleNewMessageLocal(message);
      };

      const chatJoinedHandler = (data: any) => {
        console.log('✅ [ChatContext] Successfully joined chat room:', data.chatId);
      };

      const errorHandler = (error: any) => {
        console.error('❌ [ChatContext] WebSocket error:', error);
      };

      const typingHandler = (data: any) => {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(id => id !== data.userId), data.userId];
          } else {
            return prev.filter(id => id !== data.userId);
          }
        });
      };

      const onlineHandler = (data: any) => {
        setOnlineUsers(prev => {
          if (data.isOnline) {
            return [...prev.filter(id => id !== data.userId), data.userId];
          } else {
            return prev.filter(id => id !== data.userId);
          }
        });
      };

      const messageReadHandler = (data: any) => {
        console.log('📖 [ChatContext] Messages marked as read in real-time:', data);
        
        // Update message cache to mark messages as read
        if (data.chatId && data.messageIds) {
          (dispatch as any)(
            chatApi.util.updateQueryData('getMessages', { chatId: data.chatId }, (draft) => {
              data.messageIds.forEach((messageId: number) => {
                const message = draft.messages.find(msg => msg.id === messageId);
                if (message) {
                  message.isRead = true;
                  console.log('✅ [ChatContext] Marked message as read:', messageId);
                }
              });
            })
          );

          // Update chat unread count
          (dispatch as any)(
            chatApi.util.updateQueryData('getChats', {}, (draft) => {
              const chat = draft.chats.find(c => c.id === data.chatId);
              if (chat) {
                chat.unreadCount = Math.max(0, (chat.unreadCount || 0) - data.messageIds.length);
              }
            })
          );
        }
      };

      const messageDeliveredHandler = (data: { chatId: number; messageId: number }) => {
        console.log('📨 [ChatContext] Message delivered status update:', data);
        
        if (data.chatId && data.messageId) {
          (dispatch as any)(
            chatApi.util.updateQueryData('getMessages', { chatId: data.chatId }, (draft) => {
              const message = draft.messages.find(msg => msg.id === data.messageId);
              if (message) {
                message.isDelivered = true;
                console.log('✅ [ChatContext] Marked message as delivered:', data.messageId);
              }
            })
          );
        }
      };

      websocketService.connect().then(() => {
        console.log('✅ [ChatContext] WebSocket connected successfully');
        setIsConnected(true);
        
        // Set up event listeners with proper references for cleanup
        websocketService.on('message:new', messageHandler);
        websocketService.on('chat:joined', chatJoinedHandler);
        websocketService.on('error', errorHandler);
        websocketService.on('typing:update', typingHandler);
        websocketService.on('user:online', onlineHandler);
        websocketService.on('message:read', messageReadHandler);
        websocketService.on('message:delivered', messageDeliveredHandler);
        
        console.log('🎧 [ChatContext] All WebSocket event listeners registered');
      }).catch((error) => {
        console.error('❌ [ChatContext] WebSocket connection failed:', error);
        setIsConnected(false);
      });

      return () => {
        console.log('🧹 [ChatContext] Cleaning up WebSocket event listeners');
        // Clean up event listeners properly
        websocketService.off('message:new', messageHandler);
        websocketService.off('chat:joined', chatJoinedHandler);
        websocketService.off('error', errorHandler);
        websocketService.off('typing:update', typingHandler);
        websocketService.off('user:online', onlineHandler);
        websocketService.off('message:read', messageReadHandler);
        websocketService.off('message:delivered', messageDeliveredHandler);
        
        // Don't disconnect on cleanup in development (HMR)
        if (!import.meta.hot) {
          console.log('🔌 [ChatContext] Disconnecting WebSocket (production mode)');
          websocketService.disconnect();
        } else {
          console.log('🏠 [ChatContext] Keeping WebSocket connected (development HMR)');
        }
        setIsConnected(false);
        
        // Clear any pending refetch timeouts
        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current);
        }
      };
    }
  }, [currentUser?.id]); // Use stable ID instead of the whole object

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


  const handleSetIsTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
    if (activeChat && currentUser && isConnected) {
      websocketService.updateTypingStatus(activeChat.id, currentUser.id, typing);
    }
  }, [activeChat, currentUser, isConnected]);

  // Instagram-like unread message functionality
  const unreadMessages = useMemo(() => {
    if (!currentUser || !messagesData?.messages) return [];
    return messagesData.messages.filter(msg => 
      msg.senderId !== currentUser.id && !msg.isRead
    );
  }, [messagesData?.messages, currentUser]);

  const firstUnreadMessageId = useMemo(() => {
    if (unreadMessages.length === 0) return null;
    // Find the first unread message (oldest)
    const sortedUnread = [...unreadMessages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sortedUnread[0]?.id || null;
  }, [unreadMessages]);

  // Mark all unread messages as read (Instagram behavior)
  const markAllAsRead = useCallback(() => {
    if (unreadMessages.length > 0) {
      const unreadIds = unreadMessages.map((msg: Message) => msg.id);
      console.log('📖 [ChatContext] Marking all messages as read:', unreadIds.length);
      markAsRead(unreadIds);
      setLastReadMessageId(unreadMessages[unreadMessages.length - 1]?.id || null);
    }
  }, [unreadMessages, markAsRead]);

  // Scroll to unread messages function
  const scrollToUnread = useCallback(() => {
    if (unreadScrollRef.current) {
      console.log('📍 [ChatContext] Scrolling to unread messages');
      unreadScrollRef.current();
    }
  }, []);

  // Auto-mark as read when tab is visible and chat is active
  useEffect(() => {
    if (isTabVisible && activeChat && unreadMessages.length > 0) {
      console.log('👁️ [ChatContext] Tab visible - auto-marking messages as read');
      // Small delay to ensure user actually sees the messages
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTabVisible, activeChat, unreadMessages.length, markAllAsRead]);

  // Enhanced handleSetActiveChat with unread handling
  const handleSetActiveChatWithUnread = useCallback((chat: Chat) => {
    console.log('🎯 [ChatContext] Setting active chat with unread handling:', {
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
    
    // Instagram-like behavior: Only mark as read if tab is visible
    if (isTabVisible && chat.unreadCount > 0 && messagesData?.messages) {
      const unreadMessageIds = messagesData.messages
        .filter(msg => !msg.isRead && msg.senderId !== currentUser?.id)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        console.log('📖 [ChatContext] Tab visible - marking unread messages as read:', unreadMessageIds.length);
        setTimeout(() => markAsRead(unreadMessageIds), 500); // Small delay for better UX
        setLastReadMessageId(unreadMessageIds[unreadMessageIds.length - 1]);
      }
    }
  }, [messagesData, currentUser?.id, markAsRead, isTabVisible, chatsData]);

  const value: ChatContextType = {
    chats: chatsData?.chats || [],
    activeChat,
    currentUser: currentUser || null,
    messages: messagesData?.messages || [],
    setActiveChat: handleSetActiveChatWithUnread,
    sendMessage,
    markAsRead,
    isTyping,
    setIsTyping: handleSetIsTyping,
    isLoading: chatsLoading || messagesLoading,
    isConnected,
    typingUsers,
    onlineUsers,
    // Unread message functionality
    unreadMessages,
    firstUnreadMessageId,
    markAllAsRead,
    scrollToUnread,
    isTabVisible,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// useChat hook moved to separate file: src/hooks/useChat.ts

// Fast Refresh compatibility
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('🔄 [ChatContext] Hot module reloaded');
  });
}
