import * as apiCore from './apiSlice';

// Updated types for backend integration
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  profile?: {
    avatar?: string;
    phone?: string;
    work?: string;
    education?: string;
    resident?: string;
  };
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  id: number;
  senderId: number;
  chatId: number;
  content?: string;
  messageType: 'text' | 'image' | 'file' | 'link';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  isRead: boolean;
  isEdited?: boolean;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    profile?: {
      avatar?: string;
    };
  };
}

export interface Chat {
  id: number;
  name?: string; // For group chats
  isGroup: boolean;
  groupAvatar?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  unreadCount: number;
  participants: {
    id: number;
    userId: number;
    chatId: number;
    joinedAt: string;
    isAdmin?: boolean;
    user: User;
  }[];
}

export interface CreateChatRequest {
  participantIds: number[];
  isGroup?: boolean;
  name?: string;
}

export interface SendMessageRequest {
  chatId: number;
  content?: string;
  messageType: 'text' | 'image' | 'file' | 'link';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
}

export interface GetChatsResponse {
  chats: Chat[];
  total: number;
}

export interface GetMessagesResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export interface TypingIndicator {
  chatId: number;
  userId: number;
  isTyping: boolean;
}

export interface OnlineStatusUpdate {
  userId: number;
  isOnline: boolean;
  lastSeen?: string;
}

export const chatApi = apiCore.apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all chats for current user
    getChats: builder.query<GetChatsResponse, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 20, search }) => ({
        url: 'chat',
        params: { page, limit, search },
      }),
      providesTags: ['Chat'],
    }),

    // Get specific chat by ID
    getChat: builder.query<Chat, number>({
      query: (chatId) => `chat/${chatId}`,
      providesTags: (result, error, chatId) => [{ type: 'Chat', id: chatId }],
    }),

    // Get messages for a specific chat
    getMessages: builder.query<GetMessagesResponse, { 
      chatId: number; 
      page?: number; 
      limit?: number;
      lastMessageId?: number;
    }>({
      query: ({ chatId, page = 1, limit = 50, lastMessageId }) => ({
        url: `chat/${chatId}/messages`,
        params: { page, limit, lastMessageId },
      }),
      providesTags: (result, error, { chatId }) => [
        { type: 'Message', id: `chat-${chatId}` },
      ],
      // Merge new messages with existing ones for pagination
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.chatId}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          messages: [...currentCache.messages, ...newItems.messages],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg?.page !== previousArg?.page;
      },
    }),

    // Create a new chat
    createChat: builder.mutation<Chat, CreateChatRequest>({
      query: (body) => ({
        url: 'chat',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),

    // Send a message
    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: ({ chatId, ...body }) => ({
        url: `chat/${chatId}/messages`,
        method: 'POST',
        body,
      }),
      // Optimistically update the UI
      async onQueryStarted({ chatId, ...message }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          chatApi.util.updateQueryData('getMessages', { chatId }, (draft) => {
            const optimisticMessage = {
              id: Date.now(), // Temporary ID
              senderId: -1, // Will be updated
              chatId,
              isRead: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              sender: {
                id: -1,
                firstName: 'You',
                lastName: '',
              },
              ...message,
            } as Message;
            
            draft.messages.unshift(optimisticMessage);
          })
        );

        try {
          const { data: newMessage } = await queryFulfilled;
          
          // Update with real message data
          dispatch(
            chatApi.util.updateQueryData('getMessages', { chatId }, (draft) => {
              const index = draft.messages.findIndex(msg => msg.id === Date.now());
              if (index !== -1) {
                draft.messages[index] = newMessage;
              }
            })
          );

          // Update chat list with new last message
          dispatch(
            chatApi.util.updateQueryData('getChats', {}, (draft) => {
              const chat = draft.chats.find(c => c.id === chatId);
              if (chat) {
                chat.lastMessage = newMessage;
                chat.updatedAt = newMessage.createdAt;
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Message', id: `chat-${chatId}` },
        { type: 'Chat', id: chatId },
      ],
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation<void, { chatId: number; messageIds: number[] }>({
      query: ({ chatId, messageIds }) => ({
        url: `chat/${chatId}/read`,
        method: 'POST',
        body: { messageIds },
      }),
      async onQueryStarted({ chatId, messageIds }, { dispatch }) {
        // Optimistically update read status
        dispatch(
          chatApi.util.updateQueryData('getMessages', { chatId }, (draft) => {
            draft.messages.forEach(message => {
              if (messageIds.includes(message.id)) {
                message.isRead = true;
              }
            });
          })
        );

        // Update unread count in chat list
        dispatch(
          chatApi.util.updateQueryData('getChats', {}, (draft) => {
            const chat = draft.chats.find(c => c.id === chatId);
            if (chat) {
              chat.unreadCount = Math.max(0, chat.unreadCount - messageIds.length);
            }
          })
        );
      },
    }),

    // Upload file for chat
    uploadChatFile: builder.mutation<{ fileUrl: string; fileName: string; fileSize: number; mimeType: string }, 
      { file: File; chatId: number }>({
      query: ({ file, chatId }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', chatId.toString());
        
        return {
          url: 'chat/upload',
          method: 'POST',
          body: formData,
        };
      },
    }),

    // Get all users (for creating new chats)
    getUsers: builder.query<User[], { search?: string; excludeIds?: number[] }>({
      query: ({ search, excludeIds }) => ({
        url: 'users',
        params: { 
          search, 
          exclude: excludeIds?.join(','),
          limit: 50 
        },
      }),
      providesTags: ['User'],
    }),

    // Delete a message
    deleteMessage: builder.mutation<void, { chatId: number; messageId: number }>({
      query: ({ chatId, messageId }) => ({
        url: `chat/${chatId}/messages/${messageId}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ chatId, messageId }, { dispatch }) {
        dispatch(
          chatApi.util.updateQueryData('getMessages', { chatId }, (draft) => {
            const index = draft.messages.findIndex(msg => msg.id === messageId);
            if (index !== -1) {
              draft.messages.splice(index, 1);
            }
          })
        );
      },
    }),

    // Update typing status
    updateTypingStatus: builder.mutation<void, TypingIndicator>({
      query: (body) => ({
        url: 'chat/typing',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatQuery,
  useGetMessagesQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useUploadChatFileMutation,
  useGetUsersQuery,
  useDeleteMessageMutation,
  useUpdateTypingStatusMutation,
} = chatApi;
