import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  useGetChatsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useRenameChatMutation,
  useUpdateChatAvatarMutation,
  useAddParticipantsMutation,
  useRemoveParticipantMutation,
  useDeleteChatMutation,
  Chat,
  Message,
  chatApi,
} from "../../state/api/chatApi";
import { useGetUserQuery, UserState } from "../../state/api/authApi";
import websocketService from "../../services/websocket";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../state/store";

export interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  currentUser: UserState | null;
  messages: Message[];
  setActiveChat: (chat: Chat) => void;
  sendMessage: (
    content: string,
    messageType?: string,
    fileData?: {
      fileUrl: string;
      fileName: string;
      fileSize: number;
      fileMimeType: string;
    },
    replyToId?: number
  ) => Promise<boolean>;
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
  // Group Management
  renameChat: (chatId: number, name: string) => Promise<boolean>;
  updateChatAvatar: (chatId: number, avatarUrl: string) => Promise<boolean>;
  addParticipants: (
    chatId: number,
    participantIds: number[]
  ) => Promise<boolean>;
  removeParticipant: (chatId: number, userId: number) => Promise<boolean>;
  deleteChat: (chatId: number) => Promise<boolean>;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

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
  const [lastReadMessageId, setLastReadMessageId] = useState<number | null>(
    null
  );
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unreadScrollRef = useRef<(() => void) | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  // Handle tab visibility for Instagram-like unread behavior
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
      console.log("👁️ [ChatContext] Tab visibility changed:", !document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // API hooks
  const { data: currentUser } = useGetUserQuery();
  const { data: chatsData, isLoading: chatsLoading } = useGetChatsQuery({});

  // Debug loaded chat data and auto-select first valid chat
  useEffect(() => {
    if (chatsData && chatsData.chats) {
      let firstValidChat: Chat | null = null;
      chatsData.chats.forEach((chat, index) => {
        // Track first valid chat (has participants)
        if (
          firstValidChat === null &&
          chat.participants &&
          chat.participants.length > 0
        ) {
          firstValidChat = chat;
        }
      });

      // Auto-select first valid chat if no active chat is selected
      if (firstValidChat && !activeChat) {
        const chatToSelect: Chat = firstValidChat;
        setActiveChat(chatToSelect);
      }
    }
  }, [chatsData, currentUser, activeChat]);
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
  } = useGetMessagesQuery(
    { chatId: activeChat?.id || 0 },
    { skip: !activeChat }
  );

  // Handle messages API error
  useEffect(() => {
    if (messagesError && activeChat) {
      console.error(
        "❌ [ChatContext] Failed to load messages for chat:",
        activeChat.id,
        messagesError
      );

      // If 403 Forbidden, clear the active chat
      if ("status" in messagesError && messagesError.status === 403) {
        console.warn(
          "🔒 [ChatContext] Access denied to chat, clearing selection"
        );
        setActiveChat(null);
      }
    }
  }, [messagesError, activeChat]);
  const [sendMessageMutation] = useSendMessageMutation();
  const [markMessagesAsReadMutation] = useMarkMessagesAsReadMutation();
  const [renameChatMutation] = useRenameChatMutation();
  const [updateChatAvatarMutation] = useUpdateChatAvatarMutation();
  const [addParticipantsMutation] = useAddParticipantsMutation();
  const [removeParticipantMutation] = useRemoveParticipantMutation();
  const [deleteChatMutation] = useDeleteChatMutation();

  // WebSocket connection with proper event listener cleanup
  useEffect(() => {
    if (currentUser) {
      // Check if already connected to avoid unnecessary reconnections
      if (websocketService.isConnected()) {
        setIsConnected(true);
      }

      // Move handleNewMessage inside useEffect to avoid dependency issues
      const handleNewMessageLocal = (message: any) => {
        console.log("🔥 [ChatContext] New message received in real-time:", {
          messageId: message?.id,
          chatId: message?.chatId,
          senderId: message?.senderId,
          content: message?.content,
        });

        // Play notification sound for incoming messages
        if (message?.senderId !== currentUser?.id) {
          try {
            const audio = new Audio(
              "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
            );
            audio.volume = 0.5;
            audio
              .play()
              .catch((e) =>
                console.warn("Error playing notification sound:", e)
              );
          } catch (e) {
            console.warn("Audio playback failed:", e);
          }
        }

        // Validate message structure
        if (!message || !message.chatId || !message.id) {
          console.warn("⚠️ [ChatContext] Invalid message structure:", message);
          return;
        }

        // Update cache immediately for real-time experience
        try {
          dispatch(
            chatApi.util.updateQueryData(
              "getMessages",
              { chatId: message.chatId },
              (draft) => {
                // Robust deduplication using a Map
                // This handles both new duplicates and cleans up any existing ones
                // It also handles type mismatches (string vs number IDs)
                const messageMap = new Map();

                // Add existing messages to Map
                draft.messages.forEach((msg) => {
                  messageMap.set(String(msg.id), msg);
                });

                // Add/Update the new message
                // This ensures we always have the latest version
                messageMap.set(String(message.id), {
                  id: message.id,
                  chatId: message.chatId,
                  senderId: message.senderId,
                  content: message.content || "",
                  messageType: message.messageType || "TEXT",
                  createdAt: message.createdAt || new Date().toISOString(),
                  updatedAt: message.updatedAt,
                  isRead: message.isRead || false,
                  isDelivered: message.isDelivered || true,
                  fileUrl: message.fileUrl,
                  fileName: message.fileName,
                  fileSize: message.fileSize,
                  fileMimeType: message.fileMimeType,
                  replyToId: message.replyToId,
                  replyTo: message.replyTo,
                  reactions: message.reactions || [],
                });

                // Convert back to array
                draft.messages = Array.from(messageMap.values());

                console.log(
                  "✨ [ChatContext] Message added/updated. Total messages:",
                  draft.messages.length
                );

                // Sort messages by creation time to maintain order
                draft.messages.sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );
              }
            )
          );

          // Also update chat list to show latest message
          dispatch(
            chatApi.util.updateQueryData("getChats", {}, (draft) => {
              const chat = draft.chats.find((c) => c.id === message.chatId);
              if (chat) {
                // Update last message info - assign the complete message object
                chat.lastMessage = message;
                chat.lastMessageTime =
                  message.createdAt || new Date().toISOString();

                // Increment unread count if not from current user
                if (message.senderId !== currentUser?.id) {
                  chat.unreadCount = (chat.unreadCount || 0) + 1;
                }

                // Move chat to top of the list
                const chatIndex = draft.chats.findIndex(
                  (c) => c.id === message.chatId
                );
                if (chatIndex > 0) {
                  const [movedChat] = draft.chats.splice(chatIndex, 1);
                  draft.chats.unshift(movedChat);
                }
              }
            })
          );

          console.log(
            "✅ [ChatContext] Real-time message cache updated successfully"
          );
        } catch (error) {
          console.error(
            "❌ [ChatContext] Failed to update message cache:",
            error
          );
        }
      };

      // Define event handlers that we can properly clean up
      const messageHandler = (message: any) => {
        handleNewMessageLocal(message);
      };

      const chatJoinedHandler = (data: any) => {};

      const errorHandler = (error: any) => {
        console.error("❌ [ChatContext] WebSocket error:", error);
      };

      const typingHandler = (data: any) => {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return [...prev.filter((id) => id !== data.userId), data.userId];
          } else {
            return prev.filter((id) => id !== data.userId);
          }
        });
      };

      const onlineHandler = (data: any) => {
        setOnlineUsers((prev) => {
          if (data.isOnline) {
            return [...prev.filter((id) => id !== data.userId), data.userId];
          } else {
            return prev.filter((id) => id !== data.userId);
          }
        });
      };

      const reactionAddedHandler = (data: any) => {
        console.log("😀 [ChatContext] Reaction added via WebSocket:", data);

        // Update the message in the cache
        if (messagesData?.messages) {
          const updatedMessages = messagesData.messages.map((msg) => {
            if (msg.id === data.messageId) {
              const existingReactions = msg.reactions || [];
              const existingReaction = existingReactions.find(
                (r: any) => r.emoji === data.emoji
              );

              let newReactions;
              if (existingReaction) {
                // Increment count if reaction already exists
                newReactions = existingReactions.map((r: any) =>
                  r.emoji === data.emoji
                    ? {
                        ...r,
                        count: r.count + 1,
                        users: [...(r.users || []), data.userId],
                      }
                    : r
                );
              } else {
                // Add new reaction
                newReactions = [
                  ...existingReactions,
                  {
                    emoji: data.emoji,
                    count: 1,
                    users: [data.userId],
                  },
                ];
              }

              console.log("🔄 [ChatContext] Updated message reactions:", {
                messageId: msg.id,
                oldReactions: existingReactions,
                newReactions,
              });

              return { ...msg, reactions: newReactions };
            }
            return msg;
          });

          // Update the cached data
          // Update the cached data
          if (activeChat?.id) {
            (dispatch as any)(
              chatApi.util.updateQueryData(
                "getMessages",
                { chatId: activeChat.id },
                (draft: any) => {
                  const message = draft.messages?.find(
                    (m: any) => m.id === data.messageId
                  );
                  if (message) {
                    const existingReactions = message.reactions || [];
                    const existingReaction = existingReactions.find(
                      (r: any) => r.emoji === data.emoji
                    );

                    if (existingReaction) {
                      existingReaction.count += 1;
                      if (!existingReaction.users) existingReaction.users = [];
                      if (!existingReaction.users.includes(data.userId)) {
                        existingReaction.users.push(data.userId);
                      }
                    } else {
                      if (!message.reactions) message.reactions = [];
                      message.reactions.push({
                        emoji: data.emoji,
                        count: 1,
                        users: [data.userId],
                      });
                    }
                  }
                }
              )
            );
          }
        }
      };

      const reactionRemovedHandler = (data: any) => {
        console.log("😐 [ChatContext] Reaction removed via WebSocket:", data);

        // Update the message in the cache
        if (messagesData?.messages) {
          const updatedMessages = messagesData.messages.map((msg) => {
            if (msg.id === data.messageId) {
              const existingReactions = msg.reactions || [];
              const existingReaction = existingReactions.find(
                (r: any) => r.emoji === data.emoji
              );

              let newReactions;
              if (existingReaction && existingReaction.count > 1) {
                // Decrement count if more than 1
                newReactions = existingReactions.map((r: any) =>
                  r.emoji === data.emoji
                    ? {
                        ...r,
                        count: r.count - 1,
                        users: (r.users || []).filter(
                          (uid: number) => uid !== data.userId
                        ),
                      }
                    : r
                );
              } else if (existingReaction) {
                // Remove reaction entirely if count would be 0
                newReactions = existingReactions.filter(
                  (r: any) => r.emoji !== data.emoji
                );
              } else {
                // Reaction not found, no change
                newReactions = existingReactions;
              }

              console.log(
                "🔄 [ChatContext] Updated message reactions after removal:",
                {
                  messageId: msg.id,
                  oldReactions: existingReactions,
                  newReactions,
                }
              );

              return { ...msg, reactions: newReactions };
            }
            return msg;
          });

          // Update the cached data
          // Update the cached data
          if (activeChat?.id) {
            (dispatch as any)(
              chatApi.util.updateQueryData(
                "getMessages",
                { chatId: activeChat.id },
                (draft: any) => {
                  const message = draft.messages?.find(
                    (m: any) => m.id === data.messageId
                  );
                  if (message && message.reactions) {
                    const reactionIndex = message.reactions.findIndex(
                      (r: any) => r.emoji === data.emoji
                    );

                    if (reactionIndex !== -1) {
                      const reaction = message.reactions[reactionIndex];
                      if (reaction.count > 1) {
                        reaction.count -= 1;
                        if (reaction.users) {
                          reaction.users = reaction.users.filter(
                            (uid: number) => uid !== data.userId
                          );
                        }
                      } else {
                        // Remove the reaction entirely if count is 0
                        message.reactions.splice(reactionIndex, 1);
                      }
                    }
                  }
                }
              )
            );
          }
        }
      };

      const messageReadHandler = (data: any) => {
        console.log(
          "📖 [ChatContext] Messages marked as read in real-time:",
          data
        );

        // Update message cache to mark messages as read
        if (data.chatId && data.messageIds) {
          (dispatch as any)(
            chatApi.util.updateQueryData(
              "getMessages",
              { chatId: data.chatId },
              (draft) => {
                data.messageIds.forEach((messageId: number) => {
                  const message = draft.messages.find(
                    (msg) => msg.id === messageId
                  );
                  if (message) {
                    message.isRead = true;
                    console.log(
                      "✅ [ChatContext] Marked message as read:",
                      messageId
                    );
                  }
                });
              }
            )
          );

          // Update chat unread count
          (dispatch as any)(
            chatApi.util.updateQueryData("getChats", {}, (draft) => {
              const chat = draft.chats.find((c) => c.id === data.chatId);
              if (chat) {
                chat.unreadCount = Math.max(
                  0,
                  (chat.unreadCount || 0) - data.messageIds.length
                );
              }
            })
          );
        }
      };

      const messageDeliveredHandler = (data: {
        chatId: number;
        messageId: number;
      }) => {
        console.log("📨 [ChatContext] Message delivered status update:", data);

        if (data.chatId && data.messageId) {
          (dispatch as any)(
            chatApi.util.updateQueryData(
              "getMessages",
              { chatId: data.chatId },
              (draft) => {
                const message = draft.messages.find(
                  (msg) => msg.id === data.messageId
                );
                if (message) {
                  message.isDelivered = true;
                  console.log(
                    "✅ [ChatContext] Marked message as delivered:",
                    data.messageId
                  );
                }
              }
            )
          );
        }
      };

      const messageDeletedHandler = (data: {
        chatId: number;
        messageId: number;
      }) => {
        console.log("🗑️ [ChatContext] Message deleted via WebSocket:", data);

        if (data.chatId && data.messageId) {
          (dispatch as any)(
            chatApi.util.updateQueryData(
              "getMessages",
              { chatId: data.chatId },
              (draft) => {
                const messageIndex = draft.messages.findIndex(
                  (msg) => msg.id === data.messageId
                );
                if (messageIndex !== -1) {
                  draft.messages.splice(messageIndex, 1);
                  console.log(
                    "✅ [ChatContext] Removed deleted message from cache:",
                    data.messageId
                  );
                }
              }
            )
          );

          // Update chat's last message if the deleted message was the last one
          (dispatch as any)(
            chatApi.util.updateQueryData("getChats", {}, (draft) => {
              const chat = draft.chats.find((c) => c.id === data.chatId);
              if (chat && chat.lastMessage?.id === data.messageId) {
                // Clear last message - it will be updated by the next message or backend
                chat.lastMessage = undefined as any;
                console.log(
                  "🔄 [ChatContext] Cleared lastMessage for chat:",
                  data.chatId
                );
              }
            })
          );
        }
      };

      websocketService
        .connect()
        .then(() => {
          setIsConnected(true);

          // Set up event listeners with proper references for cleanup
          websocketService.on("message:new", messageHandler);
          websocketService.on("chat:joined", chatJoinedHandler);
          websocketService.on("error", errorHandler);
          websocketService.on("typing:update", typingHandler);
          websocketService.on("user:online", onlineHandler);
          websocketService.on("message:read", messageReadHandler);
          websocketService.on("message:delivered", messageDeliveredHandler);
          websocketService.on("message:deleted", messageDeletedHandler);
          websocketService.on("reaction:added", reactionAddedHandler);
          websocketService.on("reaction:removed", reactionRemovedHandler);

          // Group Chat Events
          websocketService.on("chat:updated", (data: any) => {
            console.log("🔄 [ChatContext] Chat updated:", data);
            // RTK Query invalidation handles the data update, we just need to log or trigger side effects if needed
            if (activeChat?.id === data.chatId) {
              if (data.type === "rename") {
                setActiveChat((prev) =>
                  prev ? { ...prev, name: data.name } : null
                );
              } else if (data.type === "avatar") {
                setActiveChat((prev) =>
                  prev ? { ...prev, groupAvatar: data.groupAvatar } : null
                );
              }
            }
          });

          websocketService.on("participant:added", (data: any) => {
            console.log("👥 [ChatContext] Participants added:", data);
            // RTK Query handles this via tag invalidation
          });

          websocketService.on("participant:removed", (data: any) => {
            console.log("👋 [ChatContext] Participant removed:", data);
            if (data.userId === currentUser.id) {
              // If current user was removed, clear active chat if it's the one removed from
              if (activeChat?.id === data.chatId) {
                setActiveChat(null);
              }
            }
          });

          websocketService.on("chat:deleted", (data: any) => {
            console.log("🗑️ [ChatContext] Chat deleted:", data);
            if (activeChat?.id === data.chatId) {
              setActiveChat(null);
            }
          });

          websocketService.on("chat:added", (data: any) => {
            console.log("✨ [ChatContext] Added to new chat:", data);
            // RTK Query invalidation will fetch the new chat
          });

          websocketService.on("chat:removed", (data: any) => {
            console.log("🚫 [ChatContext] Removed from chat:", data);
            if (activeChat?.id === data.chatId) {
              setActiveChat(null);
            }
          });
        })
        .catch((error) => {
          console.error("❌ [ChatContext] WebSocket connection failed:", error);
          setIsConnected(false);
        });

      return () => {
        // Clean up event listeners properly
        websocketService.off("message:new", messageHandler);
        websocketService.off("chat:joined", chatJoinedHandler);
        websocketService.off("error", errorHandler);
        websocketService.off("typing:update", typingHandler);
        websocketService.off("user:online", onlineHandler);
        websocketService.off("message:read", messageReadHandler);
        websocketService.off("message:delivered", messageDeliveredHandler);
        websocketService.off("message:deleted", messageDeletedHandler);
        websocketService.off("reaction:added", reactionAddedHandler);
        websocketService.off("reaction:removed", reactionRemovedHandler);

        // Don't disconnect on cleanup in development (HMR)
        if (!import.meta.hot) {
          websocketService.disconnect();
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
      const chatId =
        typeof activeChat.id === "string" &&
        (activeChat.id as string).startsWith("temp_")
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

  const sendMessage = useCallback(
    async (
      content: string,
      messageType: string = "TEXT",
      fileData?: {
        fileUrl: string;
        fileName: string;
        fileSize: number;
        fileMimeType: string;
      },
      replyToId?: number
    ): Promise<boolean> => {
      if (!activeChat || !currentUser) return false;

      try {
        console.log("🔧 [ChatContext] Sending message:", {
          content,
          messageType,
          replyToId,
          hasFileData: !!fileData,
        });

        const messagePayload: any = {
          chatId: activeChat.id,
          content: content || undefined,
          messageType: messageType as "TEXT" | "IMAGE" | "FILE" | "LINK",
          senderId: currentUser.id,
        };

        if (fileData) {
          messagePayload.fileUrl = fileData.fileUrl;
          messagePayload.fileName = fileData.fileName;
          messagePayload.fileSize = fileData.fileSize;
          messagePayload.fileMimeType = fileData.fileMimeType;
        }

        if (replyToId) {
          messagePayload.replyToId = replyToId;
          console.log("💬 [ChatContext] Adding reply reference:", replyToId);
        }

        console.log("📤 [ChatContext] Final message payload:", messagePayload);

        await sendMessageMutation(messagePayload).unwrap();
        console.log("✅ [ChatContext] Message sent successfully");
        return true;
      } catch (error) {
        console.error("Failed to send message:", error);
        return false;
      }
    },
    [activeChat, currentUser, sendMessageMutation]
  );

  const markAsRead = useCallback(
    async (messageIds: number[]) => {
      if (!activeChat || messageIds.length === 0) return;

      try {
        await markMessagesAsReadMutation({
          chatId: activeChat.id,
          messageIds,
        }).unwrap();
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
    },
    [activeChat, markMessagesAsReadMutation]
  );

  // Debounced typing indicator to reduce WebSocket traffic
  const handleSetIsTyping = useCallback(
    (typing: boolean) => {
      setIsTyping(typing);

      if (!activeChat || !currentUser || !isConnected) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing status immediately if starting to type
      if (typing) {
        websocketService.updateTypingStatus(
          activeChat.id,
          currentUser.id,
          true
        );

        // Auto-clear typing status after 1.5 seconds of no activity
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          websocketService.updateTypingStatus(
            activeChat.id,
            currentUser.id,
            false
          );
        }, 1500);
      } else {
        // Send "stopped typing" immediately
        websocketService.updateTypingStatus(
          activeChat.id,
          currentUser.id,
          false
        );
      }
    },
    [activeChat, currentUser, isConnected]
  );

  // Instagram-like unread message functionality
  const unreadMessages = useMemo(() => {
    if (!currentUser || !messagesData?.messages) return [];
    return messagesData.messages.filter(
      (msg) => msg.senderId !== currentUser.id && !msg.isRead
    );
  }, [messagesData?.messages, currentUser]);

  const firstUnreadMessageId = useMemo(() => {
    if (unreadMessages.length === 0) return null;
    // Find the first unread message (oldest)
    const sortedUnread = [...unreadMessages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sortedUnread[0]?.id || null;
  }, [unreadMessages]);

  // Mark all unread messages as read (Instagram behavior)
  const markAllAsRead = useCallback(() => {
    if (unreadMessages.length > 0) {
      const ids = unreadMessages.map((m) => m.id);
      markAsRead(ids);
    }
  }, [unreadMessages, markAsRead]);

  // --- Group Chat Management Methods ---

  const renameChat = useCallback(
    async (chatId: number, name: string) => {
      try {
        await renameChatMutation({ chatId, name }).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to rename chat:", error);
        return false;
      }
    },
    [renameChatMutation]
  );

  const updateChatAvatar = useCallback(
    async (chatId: number, avatarUrl: string) => {
      try {
        await updateChatAvatarMutation({ chatId, avatarUrl }).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to update chat avatar:", error);
        return false;
      }
    },
    [updateChatAvatarMutation]
  );

  const addParticipants = useCallback(
    async (chatId: number, participantIds: number[]) => {
      try {
        await addParticipantsMutation({ chatId, participantIds }).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to add participants:", error);
        return false;
      }
    },
    [addParticipantsMutation]
  );

  const removeParticipant = useCallback(
    async (chatId: number, userId: number) => {
      try {
        await removeParticipantMutation({ chatId, userId }).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to remove participant:", error);
        return false;
      }
    },
    [removeParticipantMutation]
  );

  const deleteChat = useCallback(
    async (chatId: number) => {
      try {
        await deleteChatMutation(chatId).unwrap();
        if (activeChat?.id === chatId) {
          setActiveChat(null);
        }
        return true;
      } catch (error) {
        console.error("Failed to delete chat:", error);
        return false;
      }
    },
    [deleteChatMutation, activeChat]
  );
  // Scroll to unread messages function
  const scrollToUnread = useCallback(() => {
    if (unreadScrollRef.current) {
      console.log("📍 [ChatContext] Scrolling to unread messages");
      unreadScrollRef.current();
    }
  }, []);

  // Auto-mark as read when tab is visible and chat is active
  useEffect(() => {
    if (isTabVisible && activeChat && unreadMessages.length > 0) {
      // Small delay to ensure user actually sees the messages
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTabVisible, activeChat, unreadMessages.length, markAllAsRead]);

  // Enhanced handleSetActiveChat with unread handling
  const handleSetActiveChatWithUnread = useCallback(
    (chat: Chat) => {
      console.log(
        "🎯 [ChatContext] Setting active chat with unread handling:",
        {
          chatId: chat.id,
          chatName: chat.name,
          isGroup: chat.isGroup,
          participantsCount: chat.participants?.length || 0,
          participants: chat.participants?.map((p) => ({
            id: p.id,
            userId: p.user?.id,
            userName: `${p.user?.firstName} ${p.user?.lastName}`,
            isCurrentUser: p.user?.id === currentUser?.id,
          })),
          currentUserId: currentUser?.id,
        }
      );

      // Validate chat has participants
      if (!chat.participants || chat.participants.length === 0) {
        console.warn(
          "⚠️ [ChatContext] Trying to select chat with no participants! Chat ID:",
          chat.id
        );
        // Try to find this chat in loaded chats to get fresh data
        const freshChat = chatsData?.chats.find((c) => c.id === chat.id);
        if (
          freshChat &&
          freshChat.participants &&
          freshChat.participants.length > 0
        ) {
          console.log(
            "✅ [ChatContext] Found fresh chat data with participants:",
            freshChat.participants.length
          );
          setActiveChat(freshChat);
          return;
        } else {
          console.error(
            "❌ [ChatContext] Chat not found in loaded chats or still has no participants"
          );
          return;
        }
      }

      setActiveChat(chat);

      // Instagram-like behavior: Only mark as read if tab is visible
      if (isTabVisible && chat.unreadCount > 0 && messagesData?.messages) {
        const unreadMessageIds = messagesData.messages
          .filter((msg) => !msg.isRead && msg.senderId !== currentUser?.id)
          .map((msg) => msg.id);

        if (unreadMessageIds.length > 0) {
          console.log(
            "📖 [ChatContext] Tab visible - marking unread messages as read:",
            unreadMessageIds.length
          );
          setTimeout(() => markAsRead(unreadMessageIds), 500); // Small delay for better UX
          setLastReadMessageId(unreadMessageIds[unreadMessageIds.length - 1]);
        }
      }
    },
    [messagesData, currentUser?.id, markAsRead, isTabVisible, chatsData]
  );

  // Deduplicate messages to prevent "same key" errors in UI
  const messages = useMemo(() => {
    if (!messagesData?.messages) return [];
    const seen = new Set();
    return messagesData.messages.filter((msg) => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  }, [messagesData?.messages]);

  const value: ChatContextType = {
    chats: chatsData?.chats || [],
    activeChat,
    currentUser: currentUser || null,
    messages: messages,
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
    // Group Management
    renameChat,
    updateChatAvatar,
    addParticipants,
    removeParticipant,
    deleteChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// useChat hook moved to separate file: src/hooks/useChat.ts

// Fast Refresh compatibility
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("🔄 [ChatContext] Hot module reloaded");
  });
}
