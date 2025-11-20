import * as apiCore from "./apiSlice";

// Updated types for backend integration
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "teacher" | "student";
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
  messageType: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "LINK";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  duration?: number; // Duration in seconds for voice/audio messages
  isRead: boolean;
  isDelivered?: boolean;
  isEdited?: boolean;
  replyToId?: number; // ID of the message being replied to
  replyTo?: {
    id: number;
    content?: string;
    messageType: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "LINK";
    fileUrl?: string; // For displaying image thumbnails in reply preview
    fileName?: string; // For displaying file names in reply preview
    fileSize?: number; // For displaying file sizes in reply preview
    fileMimeType?: string; // For determining file types in reply preview
    duration?: number; // For displaying audio duration in reply preview
    sender: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
  reactions?: {
    emoji: string;
    count: number;
    users: number[]; // Array of user IDs who reacted with this emoji
  }[];
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
  lastMessageTime?: string;
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
  messageType: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "LINK";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  replyToId?: number; // ID of the message being replied to
  senderId?: number; // For optimistic updates only
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
    getChats: builder.query<
      GetChatsResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 20, search }) => ({
        url: "chat",
        params: { page, limit, search },
      }),
      providesTags: ["Chat"],
      keepUnusedDataFor: 300, // Keep cached for 5 minutes
    }),

    // Get specific chat by ID
    getChat: builder.query<Chat, number>({
      query: (chatId) => `chat/${chatId}`,
      providesTags: (_result, _error, chatId) => [{ type: "Chat", id: chatId }],
    }),

    // Get messages for a specific chat
    getMessages: builder.query<
      GetMessagesResponse,
      {
        chatId: number;
        page?: number;
        limit?: number;
        lastMessageId?: number;
      }
    >({
      query: ({ chatId, page = 1, limit = 50, lastMessageId }) => ({
        url: `chat/${chatId}/messages`,
        params: { page, limit, lastMessageId },
      }),
      providesTags: (_result, _error, { chatId }) => [
        { type: "Message", id: `chat-${chatId}` },
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
      keepUnusedDataFor: 600, // Keep messages for 10 minutes
    }),

    // Create a new chat
    createChat: builder.mutation<Chat, CreateChatRequest>({
      query: (body) => ({
        url: "chat",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chat"],
    }),

    // Send a message
    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: ({ chatId, senderId, ...body }) => ({
        url: `chat/${chatId}/messages`,
        method: "POST",
        body,
      }),
      // No optimistic updates - rely on WebSocket for instant delivery
      async onQueryStarted(args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log("✅ [RTK Query] Message sent successfully");
        } catch (error) {
          console.error("❌ [RTK Query] Message send failed:", error);
        }
      },
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Message", id: `chat-${chatId}` },
        { type: "Chat", id: chatId },
      ],
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation<
      void,
      { chatId: number; messageIds: number[] }
    >({
      query: ({ chatId, messageIds }) => ({
        url: `chat/${chatId}/read`,
        method: "POST",
        body: { messageIds },
      }),
      async onQueryStarted({ chatId, messageIds }, { dispatch }) {
        // Optimistically update read status
        dispatch(
          chatApi.util.updateQueryData("getMessages", { chatId }, (draft) => {
            draft.messages.forEach((message) => {
              if (messageIds.includes(message.id)) {
                message.isRead = true;
              }
            });
          })
        );

        // Update unread count in chat list
        dispatch(
          chatApi.util.updateQueryData("getChats", {}, (draft) => {
            const chat = draft.chats.find((c) => c.id === chatId);
            if (chat) {
              chat.unreadCount = Math.max(
                0,
                chat.unreadCount - messageIds.length
              );
            }
          })
        );
      },
    }),

    // Upload file for chat
    uploadChatFile: builder.mutation<
      { fileUrl: string; fileName: string; fileSize: number; mimeType: string },
      { file: File; chatId: number }
    >({
      query: ({ file, chatId }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("chatId", chatId.toString());

        return {
          url: "chat/upload",
          method: "POST",
          body: formData,
        };
      },
    }),

    // Get all users (for creating new chats)
    getUsers: builder.query<User[], { search?: string; excludeIds?: number[] }>(
      {
        query: ({ search, excludeIds }) => ({
          url: "chat/users/search",
          params: {
            search,
            exclude: excludeIds?.join(","),
            limit: 50,
          },
        }),
        providesTags: ["User"],
      }
    ),

    // Delete a message
    deleteMessage: builder.mutation<
      void,
      { chatId: number; messageId: number }
    >({
      query: ({ chatId, messageId }) => ({
        url: `chat/${chatId}/messages/${messageId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ chatId, messageId }, { dispatch }) {
        dispatch(
          chatApi.util.updateQueryData("getMessages", { chatId }, (draft) => {
            const index = draft.messages.findIndex(
              (msg) => msg.id === messageId
            );
            if (index !== -1) {
              draft.messages.splice(index, 1);
            }
          })
        );
      },
    }),

    // Edit a message
    editMessage: builder.mutation<
      Message,
      { chatId: number; messageId: number; content: string }
    >({
      query: ({ chatId, messageId, content }) => ({
        url: `chat/${chatId}/messages/${messageId}`,
        method: "PATCH",
        body: { content },
      }),
      async onQueryStarted({ chatId, messageId, content }, { dispatch }) {
        // Optimistic update
        dispatch(
          chatApi.util.updateQueryData("getMessages", { chatId }, (draft) => {
            const message = draft.messages.find((msg) => msg.id === messageId);
            if (message) {
              message.content = content;
              message.isEdited = true;
              message.updatedAt = new Date().toISOString();
            }
          })
        );
      },
    }),

    // Add reaction to message
    addReaction: builder.mutation<
      void,
      { chatId: number; messageId: number; emoji: string }
    >({
      query: ({ chatId, messageId, emoji }) => ({
        url: `chat/${chatId}/messages/${messageId}/reactions`,
        method: "POST",
        body: { emoji },
      }),
      async onQueryStarted(
        { chatId, messageId, emoji },
        { dispatch, queryFulfilled }
      ) {
        // Optimistically increment reaction count
        const patchResult = dispatch(
          chatApi.util.updateQueryData("getMessages", { chatId }, (draft) => {
            const msg = draft.messages.find((m) => m.id === messageId);
            if (!msg) return;
            const reactions = (msg.reactions = (msg.reactions ??
              ([] as any)) as any);
            const existing = reactions.find((r: any) => r.emoji === emoji);
            if (existing) {
              existing.count = (existing.count || 0) + 1;
            } else {
              reactions.push({ emoji, count: 1, users: [] as number[] } as any);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch (e) {
          // Revert on failure
          patchResult.undo();
        }
      },
    }),

    // Remove reaction from message
    removeReaction: builder.mutation<
      void,
      { chatId: number; messageId: number; emoji: string }
    >({
      query: ({ chatId, messageId, emoji }) => ({
        url: `chat/${chatId}/messages/${messageId}/reactions`,
        method: "DELETE",
        body: { emoji },
      }),
      async onQueryStarted(
        { chatId, messageId, emoji },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          chatApi.util.updateQueryData("getMessages", { chatId }, (draft) => {
            const msg = draft.messages.find((m) => m.id === messageId);
            if (!msg || !msg.reactions) return;
            const reactions = msg.reactions as any[];
            const existing = reactions.find((r: any) => r.emoji === emoji);
            if (existing) {
              existing.count = Math.max(0, (existing.count || 0) - 1);
            }
            msg.reactions = reactions.filter((r: any) =>
              r.emoji === emoji ? (r.count || 0) > 0 : true
            ) as any;
          })
        );
        try {
          await queryFulfilled;
        } catch (e) {
          patchResult.undo();
        }
      },
    }),

    // Update typing status
    updateTypingStatus: builder.mutation<void, TypingIndicator>({
      query: (body) => ({
        url: "chat/typing",
        method: "POST",
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
  useEditMessageMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
  useUpdateTypingStatusMutation,
} = chatApi;
