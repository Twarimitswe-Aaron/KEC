import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { GroupedVirtuoso, GroupedVirtuosoHandle } from "react-virtuoso";
import { useNavigate } from "react-router-dom";

import { MdOutlinePhoneInTalk, MdContentCopy } from "react-icons/md";
import { FiSend } from "react-icons/fi";
import { GoDeviceCameraVideo } from "react-icons/go";
import { GoPaperclip } from "react-icons/go";
import { BsEmojiSmile } from "react-icons/bs";
import { MdInfoOutline } from "react-icons/md";
import { BsReply, BsThreeDots } from "react-icons/bs";
import {
  MdClose,
  MdCheck,
  MdDoneAll,
  MdMic,
  MdMicOff,
  MdEdit,
  MdDelete,
  MdPlayArrow,
  MdPause,
  MdStop,
  MdDownload,
} from "react-icons/md";
import {
  BsImage,
  BsFileEarmarkText,
  BsFileEarmarkPdf,
  BsFileEarmarkWord,
  BsFileEarmarkExcel,
  BsFileEarmarkPpt,
  BsFileEarmarkZip,
} from "react-icons/bs";
import { useChat } from "../../hooks/useChat";
import GroupInfoModal from "./GroupInfoModal";
import {
  Message,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
} from "../../state/api/chatApi";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { commonReactions } from "../../utils/emojiData";

// --- Helper Functions & Components ---

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getFileIcon = (fileName: string, sizeClass: string = "w-8 h-8") => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <BsFileEarmarkPdf className={`${sizeClass} text-red-500`} />;
    case "doc":
    case "docx":
      return <BsFileEarmarkWord className={`${sizeClass} text-blue-500`} />;
    case "xls":
    case "xlsx":
      return <BsFileEarmarkExcel className={`${sizeClass} text-green-500`} />;
    case "ppt":
    case "pptx":
      return <BsFileEarmarkPpt className={`${sizeClass} text-orange-500`} />;
    case "zip":
    case "rar":
    case "7z":
      return <BsFileEarmarkZip className={`${sizeClass} text-yellow-600`} />;
    default:
      return <BsFileEarmarkText className={`${sizeClass} text-gray-500`} />;
  }
};

const getFullUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  return `${backendUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

const FileMessage = React.memo(
  ({
    message,
    isCurrentUser,
  }: {
    message: Message;
    isCurrentUser: boolean;
  }) => {
    const fileName = message.fileName || "File";
    const ext = fileName.split(".").pop()?.toUpperCase() || "FILE";
    const size = formatFileSize(message.fileSize);
    const fileUrl = getFullUrl(message.fileUrl);

    return (
      <div
        className={`flex items-center gap-2 p-1 rounded-lg ${
          isCurrentUser ? "bg-black/10" : "bg-black/5"
        } max-w-[240px]`}
      >
        <div className="bg-white p-1.5 rounded-lg shadow-sm">
          {getFileIcon(fileName, "w-6 h-6")}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-xs font-medium truncate text-inherit">
            {fileName}
          </p>
          <p className="text-[10px] opacity-70">
            {size} • {ext}
          </p>
        </div>
        {fileUrl && (
          <a
            href={fileUrl}
            download={fileName}
            target="_blank"
            rel="noreferrer"
            className={`p-1 rounded-full transition-colors ${
              isCurrentUser
                ? "hover:bg-white/20 text-white"
                : "hover:bg-gray-200 text-gray-600"
            }`}
            title="Download"
          >
            <MdDownload className="w-4 h-4" />
          </a>
        )}
      </div>
    );
  }
);

const ImageMessage = React.memo(
  ({
    message,
    onClick,
  }: {
    message: Message;
    onClick: (src: string) => void;
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const imageUrl = (() => {
      let url = message.fileUrl || "/images/default-image.png";
      if (url && url.startsWith("/uploads/")) {
        const backendUrl =
          import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
        url = `${backendUrl}${url}`;
      }
      return url;
    })();

    // Reset loading state when URL changes
    useEffect(() => {
      setIsLoading(true);
      setHasError(false);
    }, [imageUrl]);

    // Check if image is already loaded (for cached images)
    useEffect(() => {
      const checkIfLoaded = () => {
        if (imgRef.current) {
          if (imgRef.current.complete) {
            if (imgRef.current.naturalWidth > 0) {
              setIsLoading(false);
            } else if (imgRef.current.naturalWidth === 0) {
              // Image exists but has no dimensions - likely an error
              setHasError(true);
              setIsLoading(false);
            }
          }
        }
      };

      // Check immediately
      checkIfLoaded();

      // Also check after a small delay (for images that load very quickly)
      const timer = setTimeout(checkIfLoaded, 100);

      // Safety timeout: hide loading after 3 seconds max
      const safetyTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn("[ImageMessage] Loading timeout for:", imageUrl);
          setIsLoading(false);
        }
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(safetyTimeout);
      };
    }, [imageUrl, isLoading]);

    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-40 bg-gray-100 rounded-lg text-gray-400">
          <BsImage className="w-8 h-8 mb-2" />
          <span className="text-xs">Image failed to load</span>
        </div>
      );
    }

    return (
      <div
        className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 min-h-[150px]"
        onClick={() => imageUrl && onClick(imageUrl)}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse z-10">
            <BsImage className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <img
          ref={imgRef}
          src={imageUrl}
          alt={message.fileName || "Image"}
          className={`block w-full h-auto transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
    );
  }
);

const Lightbox = ({ src, onClose }: { src: string; onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <MdClose className="w-8 h-8" />
      </button>
      <img
        src={src}
        alt="Full view"
        className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

interface ChatProps {
  onToggleRightSidebar: () => void;
}

interface ReplyingToMessage {
  id: number;
  content: string;
  senderName: string;
  messageType: string;
  fileUrl?: string; // For displaying image thumbnails in reply preview
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  duration?: number;
}

const Chat: React.FC<ChatProps> = ({ onToggleRightSidebar }) => {
  // Track message IDs to identify new messages for smooth animation
  const [seenMessageIds, setSeenMessageIds] = useState<Set<number>>(new Set());
  const [newMessageIds, setNewMessageIds] = useState<Set<number>>(new Set());

  // Add smooth message insertion styles
  const messageAnimationStyle = `
    @keyframes messageEnter {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .message-enter {
      animation: messageEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    
    .message-stable {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    
    .message-image-enter {
      opacity: 0;
      transform: translateY(8px);
      animation: messageEnter 0.4s ease-out forwards;
    }
    
    /* Smooth image loading */
    .message-image {
      transition: opacity 0.2s ease-in-out;
    }
    
    .message-image-loading {
      opacity: 0.7;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes floatUp {
      0% { 
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      20% { 
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.2);
      }
      100% { 
        opacity: 0;
        transform: translate(-50%, -80%) scale(0.6);
      }
    }

    /* Highlight animation for scrolled-to messages */
    .message-highlight {
      animation: messageHighlight 2s ease-in-out;
    }

    @keyframes messageHighlight {
      0%, 100% {
        background-color: transparent;
      }
      50% {
        background-color: rgba(59, 130, 246, 0.15);
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      }
    }
  `;

  // Inject styles
  React.useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = messageAnimationStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const {
    activeChat,
    messages,
    currentUser,
    sendMessage,
    isTyping,
    setIsTyping,
    typingUsers,
    onlineUsers,
    isLoading,
    isConnected,
    // Unread message functionality
    unreadMessages,
    firstUnreadMessageId,
    markAllAsRead,
    scrollToUnread,
    isTabVisible,
  } = useChat();

  // Track new messages for animation
  useEffect(() => {
    if (messages.length > 0) {
      const currentMessageIds = new Set(messages.map((m) => m.id));
      const newIds = new Set<number>();

      currentMessageIds.forEach((id) => {
        if (!seenMessageIds.has(id)) {
          newIds.add(id);
        }
      });

      if (newIds.size > 0) {
        setNewMessageIds(newIds);
        setSeenMessageIds(currentMessageIds);

        // Remove new message animation after animation completes
        setTimeout(() => {
          setNewMessageIds(new Set());
        }, 500);
      }
    }
  }, [messages, seenMessageIds]);

  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<ReplyingToMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isSending, setIsSending] = useState(false); // Additional sending state
  const sendingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSendTime = useRef<number>(0); // Track last send time
  const MIN_SEND_INTERVAL = 1000; // Minimum 1 second between sends
  const sendingRef = useRef<boolean>(false); // Immediate sending flag to prevent race conditions
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [showMainEmojiPicker, setShowMainEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<
    Array<{
      file: File;
      previewUrl: string;
      type: "image" | "file";
      id: string;
    }>
  >([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<{
    blob: Blob;
    url: string;
    duration: number;
  } | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Navigation
  const navigate = useNavigate();

  // Scroll and upload progress helpers
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesPending, setNewMessagesPending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const justSentRef = useRef(false);
  const processingReactionsRef = useRef<Set<string>>(new Set());

  // File upload / message mutations
  const [deleteMessage] = useDeleteMessageMutation();
  const [editMessage] = useEditMessageMutation();
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const unreadIndicatorRef = useRef<HTMLDivElement>(null);
  const [showUnreadIndicator, setShowUnreadIndicator] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);

  // Handle unread message indicator visibility
  useEffect(() => {
    setShowUnreadIndicator(unreadMessages.length > 0 && !isTabVisible);
  }, [unreadMessages.length, isTabVisible]);

  // Track bottom state via virtuoso's atBottomStateChange
  useEffect(() => {
    setIsAtBottom(true);
    setNewMessagesPending(false);
    setInitialScrollDone(false);
  }, []);

  // Handle ESC key to close emoji picker
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showMainEmojiPicker) {
        setShowMainEmojiPicker(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [showMainEmojiPicker]);

  // Handle emoji selection for input
  const handleEmojiSelect = useCallback((emoji: string) => {
    // Add emoji to input text
    setNewMessage((prev) => prev + emoji);
    // Keep picker open so users can add multiple emojis
  }, []);

  // Handle message reaction (toggle: add if not exists, remove if exists)
  const handleMessageReaction = useCallback(
    async (messageId: number, emoji: string) => {
      if (!activeChat || !currentUser) {
        console.error(
          "❌ [Chat] Cannot add reaction - missing activeChat or currentUser:",
          {
            activeChat: !!activeChat,
            currentUser: !!currentUser,
            messageId,
            emoji,
          }
        );
        return;
      }

      // Prevent duplicate calls
      const reactionKey = `${messageId}-${emoji}`;
      if (processingReactionsRef.current.has(reactionKey)) {
        console.log(
          "⏸️ [Chat] Reaction already processing, skipping:",
          reactionKey
        );
        return;
      }
      processingReactionsRef.current.add(reactionKey);

      const message = messages.find((m) => m.id === messageId);
      if (!message) return;

      // Check if user already reacted with this emoji
      const userAlreadyReacted = message.reactions?.some(
        (r) => r.emoji === emoji && r.users.includes(currentUser.id)
      );

      try {
        if (userAlreadyReacted) {
          // Remove reaction if user already reacted
          console.log("🔄 [Chat] Removing reaction:", {
            messageId,
            emoji,
            chatId: activeChat.id,
          });

          await removeReaction({
            chatId: Number(activeChat.id),
            messageId,
            emoji,
          }).unwrap();

          console.log(
            `✅ [Chat] Successfully removed ${emoji} reaction from message ${messageId}`
          );
        } else {
          // Add reaction if user hasn't reacted
          console.log("👍 [Chat] Adding reaction:", {
            messageId,
            emoji,
            chatId: activeChat.id,
            currentUserId: currentUser.id,
          });

          await addReaction({
            chatId: Number(activeChat.id),
            messageId,
            emoji,
          }).unwrap();

          console.log(
            `✅ [Chat] Successfully added ${emoji} reaction to message ${messageId}`
          );
        }
      } catch (error: any) {
        // Silently ignore "already reacted" errors (race condition)
        if (
          error?.status === 400 &&
          error?.data?.message?.includes("already reacted")
        ) {
          console.log(
            `ℹ️ [Chat] Reaction ${emoji} already exists for message ${messageId} (race condition handled)`
          );
          return; // Exit silently
        }

        console.error("❌ Failed to toggle reaction:", {
          error: error?.message,
          status: error?.status,
          data: error?.data,
        });

        // Fallback: If we tried to add but it failed because it exists, try removing
        // This handles race conditions or stale state
        if (
          !userAlreadyReacted &&
          (error?.status === 409 ||
            error?.status === 400 ||
            error?.data?.message?.includes("already reacted"))
        ) {
          console.log(
            "⚠️ [Chat] Reaction actually exists (race condition), removing it..."
          );
          try {
            await removeReaction({
              chatId: Number(activeChat.id),
              messageId,
              emoji,
            }).unwrap();
            console.log(
              `✅ [Chat] Successfully removed ${emoji} reaction (fallback)`
            );
          } catch (removeError) {
            console.error(
              "❌ Failed to remove reaction (fallback):",
              removeError
            );
          }
        }
      } finally {
        // Always remove from processing set
        processingReactionsRef.current.delete(reactionKey);
      }
    },
    [activeChat, currentUser, addReaction, removeReaction, messages]
  );

  // Handle quick reaction (double tap or long press)
  const handleQuickReaction = useCallback(
    async (messageId: number, emoji: string = "❤️") => {
      console.log("⚡ [Chat] Quick reaction triggered:", { messageId, emoji });
      await handleMessageReaction(messageId, emoji);
    },
    [handleMessageReaction]
  );

  const handleMouseUp = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Handle message deletion
  const handleDeleteMessage = useCallback(
    async (messageId: number) => {
      if (!activeChat) return;

      try {
        console.log("🗑️ [Chat] Deleting message:", messageId);

        await deleteMessage({
          messageId,
          chatId: activeChat.id,
        }).unwrap();

        console.log("✅ [Chat] Message deleted successfully");
        setSelectedMessage(null);
      } catch (error) {
        console.error("❌ Failed to delete message:", error);
      }
    },
    [activeChat, deleteMessage]
  );

  // Handle message edit
  const handleEditMessage = useCallback((message: Message) => {
    console.log("✏️ [Chat] Edit message:", message.id);
    setEditingMessage(message.id);
    setEditingContent(message.content || "");
    setSelectedMessage(null);
  }, []);

  // Save edited message
  const handleSaveEdit = useCallback(
    async (messageId: number) => {
      if (!activeChat || !editingContent.trim()) return;

      try {
        console.log("💾 [Chat] Saving edited message:", messageId);

        await editMessage({
          messageId,
          content: editingContent.trim(),
          chatId: activeChat.id,
        }).unwrap();

        console.log("✅ [Chat] Message edited successfully");
        setEditingMessage(null);
        setEditingContent("");
      } catch (error) {
        console.error("❌ Failed to edit message:", error);
      }
    },
    [activeChat, editingContent, editMessage]
  );

  // Cancel message edit
  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setEditingContent("");
  }, []);

  // Scroll to a specific message (for reply navigation)
  const scrollToMessage = useCallback(
    (messageId: number) => {
      const messageIndex = messages.findIndex((m) => m.id === messageId);

      if (messageIndex !== -1 && virtuosoRef.current) {
        // Always use Virtuoso for scrolling to ensure proper alignment and virtualization handling
        virtuosoRef.current.scrollToIndex({
          index: messageIndex,
          align: "center",
          behavior: "smooth",
        });

        // Add highlight effect after a short delay to allow scroll to start
        setTimeout(() => {
          const messageElement = document.querySelector(
            `[data-message-id="${messageId}"]`
          );
          if (messageElement) {
            messageElement.classList.add("message-highlight");
            setTimeout(() => {
              messageElement.classList.remove("message-highlight");
            }, 2000);
          }
        }, 300); // Wait for scroll to likely bring item into view
      } else {
        console.warn(`[Chat] Could not find message ${messageId} to scroll to`);
      }
    },
    [messages]
  );

  // Setup scroll to unread functionality
  useEffect(() => {
    if (unreadIndicatorRef.current && firstUnreadMessageId) {
      const scrollToUnreadMessage = () => {
        const idx = messages.findIndex((m) => m.id === firstUnreadMessageId);
        if (idx >= 0) {
          virtuosoRef.current?.scrollToIndex({
            index: idx,
            align: "center",
            behavior: "smooth",
          });
          console.log(
            "📍 [Chat] Scrolled to first unread message via virtuoso:",
            firstUnreadMessageId
          );
        }
      };

      const currentScrollRef = unreadIndicatorRef.current;
      if (currentScrollRef) {
        (currentScrollRef as any).scrollToUnread = scrollToUnreadMessage;
      }
    }
  }, [firstUnreadMessageId, messages, scrollToUnread]);

  // Perform a one-time scroll to the latest message when messages first load
  useEffect(() => {
    if (!initialScrollDone && messages.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: Math.max(0, messages.length - 1),
        align: "end",
        behavior: "auto",
      });
      setInitialScrollDone(true);
    }
  }, [initialScrollDone, messages.length]);

  // Reset justSentRef after a short delay to allow followOutput to work
  useEffect(() => {
    if (justSentRef.current && messages.length > 0) {
      // Reset after a short delay to allow followOutput to trigger
      // Increased to 500ms to ensure it works reliably across browsers (Edge/Chrome)
      const timer = setTimeout(() => {
        justSentRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // When new messages arrive while not at bottom, show the "New messages" chip
  useEffect(() => {
    if (!isAtBottom && messages.length > 0) {
      setNewMessagesPending(true);
    }
  }, [messages.length, isAtBottom]);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format time for date separators
  const formatDateSeparator = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(dateString);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      const diffInDays = Math.floor(
        (today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffInDays < 7) {
        return messageDate.toLocaleDateString([], { weekday: "long" });
      } else {
        return messageDate.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
          year:
            messageDate.getFullYear() !== today.getFullYear()
              ? "numeric"
              : undefined,
        });
      }
    }
  };

  // Group messages by date with consecutive message grouping
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const dateKey = formatDateSeparator(message.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const groupedMessages = useMemo(() => groupMessagesByDate(), [messages]);

  // Virtualization helpers
  const groupsArr = useMemo(
    () =>
      Object.entries(groupedMessages).map(([dateKey, dayMessages]) => ({
        dateKey,
        dayMessages,
      })),
    [groupedMessages]
  );
  const groupCounts = useMemo(
    () => groupsArr.map((g) => g.dayMessages.length),
    [groupsArr]
  );
  const flatItems = useMemo(
    () =>
      groupsArr.flatMap((g, groupIdx) =>
        g.dayMessages.map((message, idxInGroup) => ({
          message,
          groupIdx,
          idxInGroup,
          group: g,
        }))
      ),
    [groupsArr]
  );
  const idToIndex = useMemo(() => {
    const map = new Map<number, number>();
    flatItems.forEach((it, i) => map.set(it.message.id, i));
    return map;
  }, [flatItems]);
  const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);

  // Check if messages should be grouped (same sender, within 5 minutes)
  const shouldGroupMessage = (
    currentMsg: Message,
    prevMsg: Message | null
  ): boolean => {
    if (!prevMsg) return false;
    if (currentMsg.senderId !== prevMsg.senderId) return false;

    const currentTime = new Date(currentMsg.createdAt).getTime();
    const prevTime = new Date(prevMsg.createdAt).getTime();
    const timeDiff = (currentTime - prevTime) / (1000 * 60); // minutes

    return timeDiff < 5;
  };

  // Count unread messages
  const getUnreadCount = () => {
    if (!currentUser) return 0;
    return messages.filter(
      (msg) => msg.senderId !== currentUser.id && !msg.isRead
    ).length;
  };

  // Check if message is emoji-only for special styling
  const isEmojiOnlyMessage = (content: string): boolean => {
    if (!content || content.trim() === "") return false;

    const trimmed = content.trim();

    // Count visual emojis (Emoji_Presentation or Emoji followed by selector)
    const emojiMatches =
      trimmed.match(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu) || [];
    const emojiCount = emojiMatches.length;

    // Check if the string is ONLY emojis and whitespace
    // We replace all valid emojis and whitespace with empty string
    const nonEmojiChars = trimmed.replace(
      /\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s|\u200D/gu,
      ""
    );

    // Only allow 1 emoji for large display
    return nonEmojiChars.length === 0 && emojiCount === 1;
  };

  // Handle double-tap for quick reaction
  const [lastTapTime, setLastTapTime] = useState(0);
  const [tapCount, setTapCount] = useState(0);

  const handleMessageTap = useCallback(
    (messageId: number) => {
      const now = Date.now();
      const timeDiff = now - lastTapTime;

      if (timeDiff < 300 && tapCount === 1) {
        // Double tap detected - add heart reaction
        handleQuickReaction(messageId, "❤️");
        setTapCount(0);
      } else {
        setTapCount(1);
        setLastTapTime(now);

        // Reset tap count after delay
        setTimeout(() => {
          setTapCount(0);
        }, 300);
      }
    },
    [lastTapTime, tapCount, handleQuickReaction]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
      if (sendingTimeoutRef.current) {
        clearTimeout(sendingTimeoutRef.current);
      }
    };
  }, [longPressTimer]);

  // Handle click outside to close editing and menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Close editing if clicking outside the editing area
      if (editingMessage && !target.closest(".editing-message")) {
        setEditingMessage(null);
        setEditingContent("");
      }

      // Close message menu if clicking outside
      if (selectedMessage && !target.closest(".message-menu")) {
        setSelectedMessage(null);
      }

      // Close emoji picker if clicking outside
      if (showEmojiPicker && !target.closest(".emoji-picker")) {
        setShowEmojiPicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingMessage, selectedMessage, showEmojiPicker]);

  const handleSendMessage = async (
    e?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent,
    source: string = "unknown"
  ) => {
    e?.preventDefault();

    const currentTime = Date.now();
    const timeSinceLastSend = currentTime - lastSendTime.current;

    console.log("🎯 [Chat] handleSendMessage called from:", source, {
      isUploading,
      isSending,
      sendingRef: sendingRef.current,
      timeSinceLastSend,
      timestamp: currentTime,
    });

    // Atomic check and set to prevent race conditions
    if (!activeChat || isUploading || isSending || sendingRef.current) {
      console.log("❌ [Chat] Send blocked:", {
        activeChat: !!activeChat,
        isUploading,
        isSending,
        sendingRef: sendingRef.current,
      });
      return; // Prevent multiple sends
    }

    if (timeSinceLastSend < MIN_SEND_INTERVAL) {
      console.log("❌ [Chat] Send blocked - too rapid:", {
        timeSinceLastSend,
        minInterval: MIN_SEND_INTERVAL,
      });
      return; // Prevent rapid sending
    }

    // Immediately set sending flag to prevent any other calls
    sendingRef.current = true;
    lastSendTime.current = currentTime;

    const messageContent = newMessage.trim();
    const hasFiles = attachedFiles.length > 0;
    const replyToId = replyingTo?.id;

    console.log("🚀 [Chat] Sending message:", {
      messageContent,
      hasFiles,
      replyToId,
      replyingTo: replyingTo
        ? { id: replyingTo.id, senderName: replyingTo.senderName }
        : null,
    });

    // Can't send empty message without files
    if (!messageContent && !hasFiles) {
      sendingRef.current = false; // Reset flag if nothing to send
      return;
    }

    // Remember that we just sent a message so we can re-anchor after it appears
    justSentRef.current = true;

    // Set states after atomic flag is set
    setIsUploading(true);
    setIsSending(true);

    // Clear any existing timeout
    if (sendingTimeoutRef.current) {
      clearTimeout(sendingTimeoutRef.current);
    }

    try {
      // Send text message first if there's text content
      if (messageContent) {
        console.log("📝 [Chat] Sending text message with reply:", {
          content: messageContent,
          replyToId,
        });
        const success = await sendMessage(
          messageContent,
          "TEXT",
          undefined,
          replyToId
        );
        if (!success) {
          throw new Error("Failed to send text message");
        }
        console.log("✅ [Chat] Text message sent successfully");

        // Play sent sound
        try {
          const audio = new Audio(
            "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"
          );
          audio.volume = 0.3;
          audio
            .play()
            .catch((e) => console.warn("Error playing sent sound:", e));
        } catch (e) {
          console.warn("Audio playback failed:", e);
        }
      }

      // Upload and send files one by one
      for (let i = 0; i < attachedFiles.length; i++) {
        const attachedFile = attachedFiles[i];
        try {
          console.log(
            `📤 Uploading file ${i + 1}/${attachedFiles.length}:`,
            attachedFile.file.name
          );

          // Upload file to server with progress
          setUploadProgress((prev) => ({ ...prev, [attachedFile.id]: 0 }));
          const uploadResult = await uploadFileWithProgress(
            attachedFile.file,
            activeChat.id,
            (p) =>
              setUploadProgress((prev) => ({ ...prev, [attachedFile.id]: p }))
          );

          console.log("📤 Upload result:", uploadResult);

          // Ensure the file URL has the correct backend base URL
          let fileUrl = uploadResult.fileUrl;
          const backendUrl =
            import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

          // If the URL is relative (starts with /), prepend backend URL
          if (fileUrl && fileUrl.startsWith("/")) {
            fileUrl = `${backendUrl}${fileUrl}`;
          } else if (fileUrl && !fileUrl.startsWith("http")) {
            // If it's just a filename or path without slash
            fileUrl = `${backendUrl}/${fileUrl}`;
          }

          console.log("📤 Corrected file URL:", fileUrl);

          // Send message with file info (only add reply to first file if no text message was sent)
          const shouldAddReply = !messageContent && i === 0;
          console.log("📎 [Chat] Sending file message:", {
            fileName: uploadResult.fileName,
            shouldAddReply,
            replyToId: shouldAddReply ? replyToId : undefined,
          });

          const success = await sendMessage(
            "",
            attachedFile.type === "image" ? "IMAGE" : "FILE",
            {
              fileUrl: fileUrl,
              fileName: uploadResult.fileName,
              fileSize: uploadResult.fileSize,
              fileMimeType: uploadResult.mimeType,
            },
            shouldAddReply ? replyToId : undefined
          );

          if (!success) {
            throw new Error(`Failed to send file: ${attachedFile.file.name}`);
          }
          setUploadProgress((prev) => ({ ...prev, [attachedFile.id]: 100 }));

          console.log(`✅ File sent successfully: ${attachedFile.file.name}`);
        } catch (error) {
          console.error(
            `❌ Failed to upload file ${attachedFile.file.name}:`,
            error
          );
          // Continue with other files even if one fails
        }
      }

      // Instagram behavior: Mark all unread messages as read when sending a message
      if (unreadMessages.length > 0) {
        console.log(
          "📖 [Chat] Marking unread messages as read after sending message"
        );
        markAllAsRead();
      }

      // Clear message and attachments on success with smooth transition
      console.log("🧹 [Chat] Clearing message state and reply");
      setNewMessage("");
      setReplyingTo(null);
      setIsTyping(false);
      setIsSending(false);
      sendingRef.current = false; // Reset atomic flag

      // Clear files with slight delay for smooth UI transition
      setTimeout(() => {
        clearAttachedFiles();
      }, 200);
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsSending(false);
      sendingRef.current = false; // Reset atomic flag on error
    } finally {
      setIsUploading(false);

      // Reset sending state after a short delay to prevent rapid clicks
      sendingTimeoutRef.current = setTimeout(() => {
        setIsSending(false);
        sendingRef.current = false; // Ensure atomic flag is reset
      }, 500);
    }
  };

  // Handle message reply
  const handleReply = useCallback(
    (message: Message) => {
      console.log("💬 [Chat] Reply button clicked for message:", message.id);
      console.log("💬 [Chat] Message sender data:", message.sender);

      const senderName = message.sender
        ? message.sender.id === currentUser?.id
          ? "yourself"
          : `${message.sender.firstName || "User"} ${
              message.sender.lastName || ""
            }`.trim()
        : "Unknown User";

      setReplyingTo({
        id: message.id,
        content: message.content || "",
        senderName: senderName,
        messageType: message.messageType,
        fileUrl: message.fileUrl, // Include fileUrl for image thumbnails
        fileName: message.fileName,
        fileSize: message.fileSize,
        fileMimeType: message.fileMimeType,
        duration: message.duration,
      });
      setSelectedMessage(null);
      setShowEmojiPicker(null);
      // Auto-focus the input
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 0);
    },
    [currentUser]
  );

  // Handle file selection (preview, don't upload yet)
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const newFiles = Array.from(files).map((file) => {
        const previewUrl = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "";

        return {
          file,
          previewUrl,
          type: file.type.startsWith("image/")
            ? ("image" as const)
            : ("file" as const),
          id: `${Date.now()}-${Math.random()}`,
        };
      });

      setAttachedFiles((prev) => [...prev, ...newFiles]);

      // Clear the file input
      if (event.target) {
        event.target.value = "";
      }
    },
    []
  );

  // Remove attached file
  const removeAttachedFile = useCallback((fileId: string) => {
    setAttachedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      // Clean up blob URLs to prevent memory leaks
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return updated;
    });
  }, []);

  // Clear all attached files
  const clearAttachedFiles = useCallback(() => {
    // Clean up blob URLs
    setAttachedFiles((prev) => {
      prev.forEach((f) => {
        if (f.previewUrl) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
      return [];
    });
  }, []);

  // Low-level upload helper with real progress and CSRF header
  const uploadFileWithProgress = useCallback(
    async (
      file: File,
      chatId: number,
      onProgress?: (progress: number) => void
    ): Promise<{
      fileUrl: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    }> => {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

      // Retry logic for CSRF token rotation
      const maxRetries = 2;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // Fetch CSRF token immediately before upload
          let csrfToken = "";
          try {
            const res = await fetch(`${backendUrl}/csrf/token`, {
              credentials: "include",
            });
            if (res.ok) {
              const data = await res.json();
              csrfToken = data.csrfToken || "";
              console.log(
                `🔑 [Upload] Fetched CSRF token (attempt ${attempt + 1})`
              );
            }
          } catch (e) {
            console.warn("⚠️ [Upload] Failed to fetch CSRF token:", e);
          }

          return await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${backendUrl}/chat/upload`);
            xhr.withCredentials = true;
            if (csrfToken) xhr.setRequestHeader("x-csrf-token", csrfToken);
            if (xhr.upload && onProgress) {
              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                  const percent = Math.round((e.loaded / e.total) * 100);
                  onProgress(percent);
                }
              };
            }
            xhr.onreadystatechange = () => {
              if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const json = JSON.parse(xhr.responseText);
                    resolve(json);
                  } catch {
                    reject(new Error("Invalid upload response"));
                  }
                } else {
                  reject(new Error(`Upload failed: ${xhr.status}`));
                }
              }
            };
            const form = new FormData();
            form.append("file", file);
            form.append("chatId", String(chatId));
            xhr.send(form);
          });
        } catch (error) {
          lastError = error as Error;
          console.warn(`⚠️ [Upload] Attempt ${attempt + 1} failed:`, error);

          // If it's a CSRF error and we have retries left, try again
          if (
            attempt < maxRetries &&
            (error as Error).message.includes("403")
          ) {
            console.log(`🔄 [Upload] Retrying due to CSRF error...`);
            // Small delay before retry
            await new Promise((resolve) => setTimeout(resolve, 100));
            continue;
          }

          // If not a CSRF error or no retries left, throw
          throw error;
        }
      }

      // If we exhausted all retries
      throw lastError || new Error("Upload failed after retries");
    },
    []
  );

  const startVoiceRecording = useCallback(async () => {
    try {
      if (!isConnected || !activeChat) return;
      setRecordingError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstart = () => {
        recordStartTimeRef.current = Date.now();
        setIsRecordingVoice(true);
        setRecordingDuration(0);
        // Start timer
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch (err: any) {
      setRecordingError("Microphone access denied");
      setIsRecordingVoice(false);
    }
  }, [activeChat, isConnected]);

  const stopVoiceRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    // Stop timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    try {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        recorder.stop();
      });
      recorder.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
      setIsRecordingVoice(false);

      const blob = new Blob(audioChunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });
      audioChunksRef.current = [];

      if (blob.size > 0) {
        const url = URL.createObjectURL(blob);
        setRecordedAudio({
          blob,
          url,
          duration: recordingDuration,
        });
      }
    } catch (e) {
      console.error("Error stopping recording:", e);
    }
  }, [recordingDuration]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecordingVoice(false);
    setRecordedAudio(null);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  }, []);

  const discardRecordedAudio = useCallback(() => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio.url);
    }
    setRecordedAudio(null);
    setRecordingDuration(0);
    setIsPlayingAudio(false);
  }, [recordedAudio]);

  const sendRecordedAudio = useCallback(async () => {
    if (!recordedAudio || !activeChat) return;

    try {
      const file = new File([recordedAudio.blob], `voice-${Date.now()}.webm`, {
        type: recordedAudio.blob.type,
      });
      const progressId = `voice-${Date.now()}`;
      setUploadProgress((prev) => ({ ...prev, [progressId]: 0 }));
      const uploadResult = await uploadFileWithProgress(
        file,
        activeChat.id,
        (p) => setUploadProgress((prev) => ({ ...prev, [progressId]: p }))
      );
      let fileUrl = uploadResult.fileUrl;
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

      // If the URL is relative (starts with /), prepend backend URL
      if (fileUrl && fileUrl.startsWith("/")) {
        fileUrl = `${backendUrl}${fileUrl}`;
      } else if (fileUrl && !fileUrl.startsWith("http")) {
        // If it's just a filename or path without slash
        fileUrl = `${backendUrl}/${fileUrl}`;
      }
      const replyToId = replyingTo?.id;

      // Mark that we just sent a message so the scroll logic can re-anchor to the latest
      justSentRef.current = true;

      await sendMessage(
        "",
        "FILE",
        {
          fileUrl,
          fileName: uploadResult.fileName || file.name,
          fileSize: uploadResult.fileSize || file.size,
          fileMimeType: uploadResult.mimeType || file.type,
        },
        replyToId
      );
      setReplyingTo(null);
      setUploadProgress((prev) => ({ ...prev, [progressId]: 100 }));

      // Clean up
      discardRecordedAudio();

      setTimeout(() => {
        setUploadProgress((curr) => {
          const { [progressId]: _omit, ...rest } = curr;
          return rest;
        });
      }, 800);
    } catch (e) {
      console.error("Error sending voice message:", e);
    }
  }, [
    recordedAudio,
    activeChat,
    uploadFileWithProgress,
    sendMessage,
    replyingTo,
    discardRecordedAudio,
  ]);

  // Handle long press for message options
  const handleOptionsMouseDown = useCallback((messageId: number) => {
    const timer = setTimeout(() => {
      setSelectedMessage(messageId);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  }, []);

  // Get message status icon
  const getMessageStatusIcon = (message: Message): React.JSX.Element => {
    if (message.senderId !== currentUser?.id) return <></>;

    if (message.isRead) {
      return <MdDoneAll className="text-blue-500 text-sm" />;
    } else if (message.isDelivered) {
      return <MdDoneAll className="text-gray-400 text-sm" />;
    } else {
      return <MdCheck className="text-gray-400 text-sm" />;
    }
  };

  // Removed duplicate handleKeyDown function - using inline onKeyDown in textarea

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setNewMessage(e.target.value);

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Get chat participant info (excluding current user)
  const getChatParticipant = () => {
    if (!activeChat) {
      return null;
    }

    if (activeChat.isGroup) {
      return {
        name: activeChat.name || "Group Chat",
        avatar: activeChat.groupAvatar || "/images/chat.png",
        isOnline: true, // Groups are always "online"
        lastSeen: `${activeChat.participants?.length || 0} members`,
      };
    }

    // Check if participants array exists and has data
    if (!activeChat.participants || activeChat.participants.length === 0) {
      return {
        name: "Loading participants...",
        avatar: "/images/chat.png",
        isOnline: false,
        lastSeen: "Loading...",
      };
    }

    const participant = activeChat.participants.find(
      (p) => p.user?.id !== currentUser?.id
    );
    if (participant) {
      const participantInfo = {
        name:
          `${participant.user?.firstName || ""} ${
            participant.user?.lastName || ""
          }`.trim() || "Chat Participant",
        avatar: participant.user?.profile?.avatar || "/images/chat.png",
        isOnline: onlineUsers.includes(participant.user?.id || 0),
        lastSeen: onlineUsers.includes(participant.user?.id || 0)
          ? "online"
          : (() => {
              // Use the actual lastSeen timestamp from the user data
              const lastSeenDate = participant.user?.lastSeen
                ? new Date(participant.user.lastSeen)
                : null;

              if (!lastSeenDate) {
                return "last seen recently";
              }

              const now = new Date();
              const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              );
              const lastSeenDay = new Date(
                lastSeenDate.getFullYear(),
                lastSeenDate.getMonth(),
                lastSeenDate.getDate()
              );

              const time = lastSeenDate.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });

              if (lastSeenDay.getTime() === today.getTime()) {
                // Today - show "last seen today at [time]"
                return `last seen today at ${time}`;
              } else if (lastSeenDay.getTime() === today.getTime() - 86400000) {
                // Yesterday
                return `last seen yesterday at ${time}`;
              } else {
                // Older - show date
                const date = lastSeenDate.toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                });
                return `last seen ${date}`;
              }
            })(),
      };
      return participantInfo;
    }

    return {
      name: "Chat Loading...",
      avatar: "/images/chat.png",
      isOnline: false,
      lastSeen: "Loading...",
    };
  };

  const participant = getChatParticipant();

  // Get display text for typing users
  const getTypingUsersDisplay = () => {
    if (!activeChat || typingUsers.length === 0) return "";

    const typingNames = typingUsers
      .map((userId) => {
        // Check if it's current user (shouldn't happen, but safety check)
        if (userId === currentUser?.id) return null;

        // Find the participant in the chat
        const typingParticipant = activeChat.participants.find(
          (p) => p.user.id === userId
        );
        if (typingParticipant) {
          const firstName = typingParticipant.user.firstName;
          const lastName = typingParticipant.user.lastName;
          return `${firstName} ${lastName}`.trim() || "Someone";
        }

        return "Someone";
      })
      .filter(Boolean);

    if (typingNames.length === 0) return "Someone";
    if (typingNames.length === 1) return typingNames[0];
    if (typingNames.length === 2)
      return `${typingNames[0]} and ${typingNames[1]}`;
    return `${typingNames[0]} and ${typingNames.length - 1} others`;
  };

  // Show loading state if no active chat
  if (!activeChat) {
    return (
      <div className="flex w-full flex-col h-full bg-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-semibold mb-2">
              Select a conversation
            </h3>
            <p className="text-sm">
              Choose from your existing conversations or start a new one
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white text-black">
        <div className="flex items-center gap-3">
          <div
            className="relative cursor-pointer"
            onClick={() => {
              if (activeChat?.isGroup) {
                setIsGroupInfoModalOpen(true);
              } else {
                const participantId = activeChat?.participants?.find(
                  (p) => p.user?.id !== currentUser?.id
                )?.user?.id;
                if (participantId) {
                  navigate(`/profile/${participantId}`);
                }
              }
            }}
          >
            <img
              src={participant?.avatar || "/images/chat.png"}
              alt={participant?.name || "Chat"}
              className="w-10 h-10 rounded-full object-cover"
            />
            {participant?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {participant?.name || "Loading Chat..."}
              </h3>
              {getUnreadCount() > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {getUnreadCount()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {typingUsers.length > 0 ? (
                <span className="text-blue-500">
                  {getTypingUsersDisplay()} typing...
                </span>
              ) : (
                <span>{participant?.lastSeen}</span>
              )}
              {!isConnected && <span className="text-red-500">• Offline</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xl">
          <MdInfoOutline
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={onToggleRightSidebar}
          />
        </div>
      </div>

      {/* Subtle separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="relative flex-1 flex flex-col bg-white"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-sm">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          /* Main Chat Area with WhatsApp Background */
          <div
            className="flex-1 overflow-hidden relative bg-[#efeae2]"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, #d5d5d5 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            <GroupedVirtuoso
              ref={virtuosoRef}
              className="scroll-hide"
              style={{ height: "100%", overflowX: "hidden" }}
              groupCounts={groupCounts}
              alignToBottom
              initialTopMostItemIndex={
                flatItems.length > 0 ? flatItems.length - 1 : 0
              }
              computeItemKey={(index) => {
                const item = flatItems[index];
                return item ? `msg-${item.message.id}` : `item-${index}`;
              }}
              followOutput={(isAtBottom) => {
                // Always follow output (scroll to bottom) when:
                // 1. User is at the bottom of the chat
                // 2. User just sent a message
                if (isAtBottom || justSentRef.current) {
                  return "smooth";
                }
                return false;
              }}
              increaseViewportBy={{ top: 400, bottom: 400 }}
              atBottomStateChange={(atBottom) => {
                setIsAtBottom(atBottom);
                if (atBottom) setNewMessagesPending(false);
              }}
              groupContent={(index) => (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                    {groupsArr[index]?.dateKey}
                  </div>
                </div>
              )}
              itemContent={(index) => {
                const item = flatItems[index];
                if (!item) return null;
                const { message, group, idxInGroup } = item;
                const dayMessages = group.dayMessages;
                const isCurrentUser = message.senderId === currentUser?.id;
                const isUnread = !isCurrentUser && !message.isRead;
                const prevMessage =
                  idxInGroup > 0 ? dayMessages[idxInGroup - 1] : null;
                const nextMessage =
                  idxInGroup < dayMessages.length - 1
                    ? dayMessages[idxInGroup + 1]
                    : null;
                const isGrouped = shouldGroupMessage(
                  message,
                  prevMessage as any
                );
                const isGroupedWithNext = nextMessage
                  ? shouldGroupMessage(nextMessage as any, message)
                  : false;
                const showAvatar = !isCurrentUser && !isGrouped;

                // Detect if this message represents an audio/voice file
                const isAudioFile =
                  !!message.fileUrl &&
                  ((message.fileMimeType &&
                    message.fileMimeType.toLowerCase().startsWith("audio/")) ||
                    (message.fileUrl &&
                      (message.fileUrl.toLowerCase().endsWith(".webm") ||
                        message.fileUrl.toLowerCase().endsWith(".ogg") ||
                        message.fileUrl.toLowerCase().endsWith(".mp3") ||
                        message.fileUrl.toLowerCase().endsWith(".m4a"))) ||
                    (message.fileName &&
                      (message.fileName.toLowerCase().endsWith(".webm") ||
                        message.fileName.toLowerCase().endsWith(".ogg") ||
                        message.fileName.toLowerCase().endsWith(".mp3") ||
                        message.fileName.toLowerCase().endsWith(".m4a"))));

                // Treat as image if type is IMAGE OR if it's a FILE with image mime/extension
                const isImageMessage =
                  (message.messageType === "IMAGE" ||
                    (message.messageType === "FILE" &&
                      (message.fileMimeType?.startsWith("image/") ||
                        message.fileName?.match(
                          /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i
                        )))) &&
                  !isAudioFile;

                // Debug logging for image detection

                return (
                  <div
                    key={`${message.id}-${message.createdAt}-${idxInGroup}`}
                    className={`relative ${
                      newMessageIds.has(message.id)
                        ? message.messageType === "IMAGE"
                          ? "message-image-enter"
                          : "message-enter"
                        : "message-stable"
                    } ${
                      showEmojiPicker === message.id ||
                      selectedMessage === message.id
                        ? "z-50"
                        : ""
                    }`}
                    style={{
                      animationDelay: newMessageIds.has(message.id)
                        ? `${idxInGroup * 0.05}s`
                        : "0s",
                    }}
                    data-message-id={message.id}
                  >
                    {firstUnreadMessageId === message.id &&
                      unreadMessages.length > 0 && (
                        <div
                          className="flex items-center justify-center my-3"
                          ref={unreadIndicatorRef}
                        >
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                          <div className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                            {unreadMessages.length} unread message
                            {unreadMessages.length > 1 ? "s" : ""}
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-blue-400 via-transparent to-transparent"></div>
                        </div>
                      )}

                    <div
                      className={`flex items-start gap-1 sm:gap-2 ${
                        isCurrentUser
                          ? "justify-end pr-1 sm:pr-2"
                          : "justify-start pl-0"
                      } ${
                        isUnread
                          ? "bg-blue-50/30 -mx-2 sm:-mx-4 px-2 sm:px-3 py-1.5 rounded-lg"
                          : ""
                      } ${
                        message.reactions && message.reactions.length > 0
                          ? "mb-6"
                          : isGrouped
                          ? "mb-1"
                          : "mb-2"
                      }`}
                      onMouseDown={() => handleOptionsMouseDown(message.id)}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onClick={() => handleMessageTap(message.id)}
                    >
                      <div
                        className={`w-6 sm:w-8 ${
                          !isCurrentUser ? "block" : "hidden"
                        }`}
                      >
                        {showAvatar && (
                          <div
                            className="relative cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (message.sender?.id) {
                                navigate(`/profile/${message.sender.id}`);
                              }
                            }}
                          >
                            <img
                              src={
                                message.sender?.profile?.avatar ||
                                "/images/chat.png"
                              }
                              className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover"
                              alt={`${message.sender?.firstName} Avatar`}
                            />
                            {isUnread && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                        )}
                      </div>

                      <div
                        className={`relative group ${
                          isCurrentUser
                            ? "max-w-[85%] sm:max-w-[70%] md:max-w-[60%]"
                            : "w-full max-w-[85%] sm:max-w-[70%] md:max-w-[60%]"
                        }`}
                      >
                        <div
                          className={`${
                            message.messageType === "TEXT"
                              ? isEmojiOnlyMessage(message.content || "")
                                ? "inline-block bg-transparent border-0 shadow-none px-1 py-1"
                                : "inline-block"
                              : message.messageType === "IMAGE"
                              ? "block w-full bg-transparent p-0" // Instagram-style: no bubble for images
                              : "block w-full"
                          } ${
                            message.messageType === "TEXT" &&
                            isEmojiOnlyMessage(message.content || "")
                              ? ""
                              : message.messageType === "IMAGE"
                              ? "" // No padding for images
                              : "px-2 py-1"
                          } relative ${
                            message.messageType === "TEXT" &&
                            isEmojiOnlyMessage(message.content || "")
                              ? ""
                              : message.messageType === "IMAGE" || isAudioFile
                              ? "" // No background for images or audio
                              : isCurrentUser
                              ? "bg-[#d9fdd3] text-gray-900 shadow-sm" // WhatsApp green for user
                              : isUnread
                              ? "bg-white border border-blue-200 text-gray-900 shadow-md"
                              : "bg-white text-gray-900 shadow-sm" // WhatsApp white for others
                          } ${
                            message.messageType === "IMAGE"
                              ? "rounded-[18px]"
                              : isCurrentUser
                              ? `${
                                  !isGrouped && !isGroupedWithNext
                                    ? "rounded-lg"
                                    : !isGrouped && isGroupedWithNext
                                    ? "rounded-lg rounded-br-sm"
                                    : isGrouped && !isGroupedWithNext
                                    ? "rounded-lg rounded-tr-sm"
                                    : "rounded-lg rounded-tr-sm rounded-br-sm"
                                }`
                              : `${
                                  !isGrouped && !isGroupedWithNext
                                    ? "rounded-lg"
                                    : !isGrouped && isGroupedWithNext
                                    ? "rounded-lg rounded-bl-sm"
                                    : isGrouped && !isGroupedWithNext
                                    ? "rounded-lg rounded-tl-sm"
                                    : "rounded-lg rounded-tl-sm rounded-bl-sm"
                                }`
                          }`}
                        >
                          {/* Tail for received messages */}
                          {!isCurrentUser &&
                            !isGrouped &&
                            message.messageType !== "IMAGE" && (
                              <div className="absolute top-0 -left-[8px] w-[8px] h-[13px] overflow-hidden">
                                <svg
                                  viewBox="0 0 8 13"
                                  width="8"
                                  height="13"
                                  className="fill-white"
                                >
                                  <path d="M1.533,3.568L8,12.193V1H2.812C1.042,1,0.474,2.156,1.533,3.568z" />
                                </svg>
                              </div>
                            )}

                          {/* Render Reply Preview INSIDE the bubble */}
                          {message.replyTo && (
                            <div
                              className={`mb-1 rounded overflow-hidden border-l-4 ${
                                isCurrentUser
                                  ? "bg-black/5 border-green-600"
                                  : "bg-black/5 border-purple-500"
                              } cursor-pointer`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const replyId = message.replyTo?.id;
                                if (replyId) {
                                  scrollToMessage(replyId);
                                }
                              }}
                            >
                              <div className="flex justify-between bg-black/5 p-1">
                                <div className="flex-1 min-w-0">
                                  <span
                                    className={`block text-[10px] font-bold truncate ${
                                      isCurrentUser
                                        ? "text-green-700"
                                        : "text-purple-600"
                                    }`}
                                  >
                                    {message.replyTo.sender.id ===
                                    currentUser?.id
                                      ? "You"
                                      : `${message.replyTo.sender?.firstName} ${message.replyTo.sender?.lastName}` ||
                                        "User"}
                                  </span>
                                  <div className="text-[10px] text-gray-600 truncate">
                                    {message.replyTo.messageType === "IMAGE" ? (
                                      <span className="flex items-center gap-1">
                                        <BsImage /> Photo
                                      </span>
                                    ) : message.replyTo.messageType ===
                                      "FILE" ? (
                                      <span className="flex items-center gap-1">
                                        <span className="truncate">
                                          {message.replyTo.fileName || "File"}
                                        </span>
                                      </span>
                                    ) : message.replyTo.messageType ===
                                      "AUDIO" ? (
                                      <span className="flex items-center gap-1">
                                        <MdMic /> Voice Message
                                      </span>
                                    ) : (
                                      message.replyTo.content || "Message"
                                    )}
                                  </div>
                                </div>
                                {message.replyTo.messageType === "IMAGE" &&
                                  message.replyTo.fileUrl && (
                                    <img
                                      src={message.replyTo.fileUrl}
                                      alt="Reply"
                                      className="w-8 h-8 rounded object-cover ml-2"
                                    />
                                  )}
                              </div>
                            </div>
                          )}

                          {message.messageType === "TEXT" &&
                            (editingMessage === message.id ? (
                              <div className="w-full editing-message">
                                <textarea
                                  value={editingContent}
                                  onChange={(e) =>
                                    setEditingContent(e.target.value)
                                  }
                                  className="w-full p-2 text-xs sm:text-sm bg-transparent border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  rows={2}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSaveEdit(message.id);
                                    } else if (e.key === "Escape") {
                                      handleCancelEdit();
                                    }
                                  }}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(message.id)}
                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="relative">
                                <p
                                  className={`whitespace-pre-wrap leading-relaxed break-words ${
                                    isEmojiOnlyMessage(message.content || "")
                                      ? "text-4xl sm:text-5xl"
                                      : "text-xs sm:text-sm"
                                  }`}
                                >
                                  {message.content}
                                </p>
                                <div
                                  className={`flex items-center justify-end gap-1 mt-0.5 select-none leading-none ${
                                    isCurrentUser
                                      ? "text-gray-500"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {message.isEdited && (
                                    <span className="text-[9px] italic">
                                      (edited)
                                    </span>
                                  )}
                                  <span className="text-[9px]">
                                    {formatTime(message.createdAt)}
                                  </span>
                                </div>
                              </div>
                            ))}

                          {isImageMessage && (
                            <div className="relative group">
                              <ImageMessage
                                message={message}
                                onClick={setLightboxImage}
                              />

                              {/* Quick reaction bar (appears on hover like Instagram) */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg">
                                {commonReactions
                                  .slice(0, 5)
                                  .map((emoji: string) => (
                                    <button
                                      key={emoji}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleMessageReaction(
                                          message.id,
                                          emoji
                                        );
                                      }}
                                      className="p-1 hover:scale-125 transition-transform text-lg pointer-events-auto"
                                      title={`React with ${emoji}`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowEmojiPicker(
                                      showEmojiPicker === message.id
                                        ? null
                                        : message.id
                                    );
                                  }}
                                  className="p-1 hover:scale-110 transition-transform pointer-events-auto"
                                  title="More reactions"
                                >
                                  <BsEmojiSmile className="h-4 w-4 text-gray-600" />
                                </button>
                              </div>

                              {/* Action buttons (bottom-left like Instagram) */}
                              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleReply(message);
                                  }}
                                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg pointer-events-auto"
                                  title="Reply"
                                >
                                  <BsReply className="h-4 w-4 text-gray-700" />
                                </button>
                                {isCurrentUser && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteMessage(message.id);
                                      }}
                                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors shadow-lg pointer-events-auto"
                                      title="Delete"
                                    >
                                      <MdDelete className="h-4 w-4 text-red-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedMessage(message.id);
                                      }}
                                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg pointer-events-auto"
                                      title="More options"
                                    >
                                      <BsThreeDots className="h-4 w-4 text-gray-700" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Voice / audio messages */}
                          {isAudioFile && (
                            <audio
                              controls
                              preload="metadata"
                              className="w-full min-w-[250px]"
                              src={message.fileUrl || ""}
                            >
                              Your browser does not support the audio element.
                            </audio>
                          )}

                          {/* Generic file messages (exclude images and audio) */}
                          {message.fileUrl &&
                            !isAudioFile &&
                            !isImageMessage && (
                              <FileMessage
                                message={message}
                                isCurrentUser={isCurrentUser}
                              />
                            )}

                          {/* Reactions bar - Overlay Style */}
                          {message.reactions &&
                            message.reactions.length > 0 && (
                              <div
                                className={`absolute -bottom-2 ${
                                  isCurrentUser ? "right-0" : "left-0"
                                } flex flex-wrap gap-0.5 z-10`}
                              >
                                {message.reactions.map((reaction) => {
                                  const userReacted = reaction.users.includes(
                                    currentUser?.id || 0
                                  );
                                  return (
                                    <button
                                      key={reaction.emoji}
                                      onClick={() =>
                                        handleMessageReaction(
                                          message.id,
                                          reaction.emoji
                                        )
                                      }
                                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] shadow-sm border border-white transition-all hover:scale-110 ${
                                        userReacted
                                          ? "bg-blue-100 text-blue-800 border-blue-300"
                                          : isCurrentUser
                                          ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                          : "bg-white text-gray-800 hover:bg-gray-100"
                                      }`}
                                      title={
                                        userReacted
                                          ? "Click to remove your reaction"
                                          : "Click to add this reaction"
                                      }
                                    >
                                      <span>{reaction.emoji}</span>
                                      {reaction.count > 1 && (
                                        <span className="ml-1 text-[9px] font-bold">
                                          {reaction.count}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                          {/* Hover actions - hidden for images since they have their own */}
                          {!isImageMessage && (
                            <div
                              className={`absolute top-0 ${
                                isCurrentUser
                                  ? "right-full mr-2"
                                  : "left-full ml-2"
                              } opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white shadow-lg rounded-full p-1 z-10`}
                            >
                              <button
                                onClick={() => handleReply(message)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                title="Reply"
                              >
                                <BsReply className="h-4 w-4 text-gray-600" />
                              </button>

                              {/* React button - Only for other users' messages */}
                              {!isCurrentUser && (
                                <button
                                  onClick={() =>
                                    setShowEmojiPicker(
                                      showEmojiPicker === message.id
                                        ? null
                                        : message.id
                                    )
                                  }
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                  title="React"
                                >
                                  <BsEmojiSmile className="h-4 w-4 text-gray-600" />
                                </button>
                              )}

                              {/* Copy button - For all text messages */}
                              {message.messageType === "TEXT" && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      message.content || ""
                                    );
                                    // Optional: Add toast notification here
                                    console.log("📋 Copied to clipboard");
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                  title="Copy"
                                >
                                  <MdContentCopy className="h-4 w-4 text-gray-600" />
                                </button>
                              )}

                              {isCurrentUser &&
                                message.messageType === "TEXT" && (
                                  <button
                                    onClick={() => handleEditMessage(message)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Edit"
                                  >
                                    <MdEdit className="h-4 w-4 text-gray-600" />
                                  </button>
                                )}
                              {isCurrentUser && (
                                <button
                                  onClick={() =>
                                    handleDeleteMessage(message.id)
                                  }
                                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                                  title="Delete"
                                >
                                  <MdDelete className="h-4 w-4 text-red-600" />
                                </button>
                              )}
                            </div>
                          )}

                          {/* Reaction picker */}
                          {showEmojiPicker === message.id && (
                            <div
                              className={`absolute z-50 mt-2 ${
                                isCurrentUser ? "right-0" : "left-0"
                              } bg-white border border-gray-200 rounded-lg shadow-lg p-3 emoji-picker`}
                            >
                              <div className="text-xs text-gray-500 mb-2 font-medium">
                                Quick reactions
                              </div>
                              <div className="flex gap-2 mb-3">
                                {commonReactions.map((emoji: string) => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      console.log(
                                        `🎯 [Chat] Message reaction button clicked: ${emoji} for message ${message.id}`
                                      );
                                      handleMessageReaction(message.id, emoji);
                                      setShowEmojiPicker(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg"
                                    title={`React with ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                              <div className="border-t border-gray-200 pt-2">
                                <EmojiPicker
                                  onEmojiClick={(emojiData: EmojiClickData) => {
                                    handleMessageReaction(
                                      message.id,
                                      emojiData.emoji
                                    );
                                    setShowEmojiPicker(null);
                                  }}
                                  width={300}
                                  height={300}
                                  searchPlaceHolder="Search emojis..."
                                  previewConfig={{ showPreview: false }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Current user avatar */}
                        <div
                          className={`w-8 ${
                            isCurrentUser ? "block" : "hidden"
                          }`}
                        >
                          {showAvatar && isCurrentUser && (
                            <img
                              src={
                                currentUser?.profile?.avatar ||
                                "/images/user-avatar.png"
                              }
                              className="h-8 w-8 rounded-full object-cover"
                              alt="Your Avatar"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200">
        {/* Reply preview */}
        {replyingTo && (
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <div
              className="flex items-center justify-between bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => scrollToMessage(replyingTo!.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-1 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-blue-600 mb-1">
                    Replying to {replyingTo!.senderName}
                  </div>
                  <div className="text-sm text-gray-600 truncate flex items-center gap-1">
                    {replyingTo!.messageType === "TEXT" ? (
                      <span className="truncate">{replyingTo!.content}</span>
                    ) : replyingTo!.messageType === "IMAGE" ? (
                      <span className="flex items-center gap-1">
                        <BsImage className="text-gray-500" />
                        <span>
                          Photo
                          {replyingTo!.fileSize && (
                            <span className="text-xs text-gray-400 ml-1">
                              ({formatFileSize(replyingTo!.fileSize)})
                            </span>
                          )}
                        </span>
                      </span>
                    ) : replyingTo!.messageType === "FILE" ? (
                      <span className="flex items-center gap-1">
                        {getFileIcon(replyingTo!.fileName || "")}
                        <span className="truncate">
                          {replyingTo!.fileName || "File"}
                          {replyingTo!.fileSize && (
                            <span className="text-xs text-gray-400 ml-1">
                              ({formatFileSize(replyingTo!.fileSize)})
                            </span>
                          )}
                        </span>
                      </span>
                    ) : replyingTo!.messageType === "AUDIO" ? (
                      <span className="flex items-center gap-1">
                        <MdMic className="text-gray-500" />
                        <span>
                          {replyingTo!.duration
                            ? `Voice Message (${Math.floor(
                                replyingTo!.duration / 60
                              )}:${(replyingTo!.duration % 60)
                                .toString()
                                .padStart(2, "0")})`
                            : "Voice Message"}
                        </span>
                      </span>
                    ) : replyingTo!.messageType === "LINK" ? (
                      <span className="truncate">
                        {replyingTo!.content || "Link"}
                      </span>
                    ) : (
                      <span className="truncate">{replyingTo!.content}</span>
                    )}
                  </div>
                </div>
                {/* Instagram-style image thumbnail */}
                {replyingTo!.messageType === "IMAGE" && replyingTo!.fileUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={replyingTo!.fileUrl}
                      alt="Reply preview"
                      className="w-10 h-10 rounded object-cover"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("❌ [Chat] Canceling reply");
                  setReplyingTo(null);
                }}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0 ml-2"
              >
                <MdClose className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        <div className="p-2 sm:p-4">
          {/* File Preview Area */}
          {attachedFiles.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {attachedFiles.length} file
                  {attachedFiles.length > 1 ? "s" : ""} attached
                </span>
                <button
                  onClick={clearAttachedFiles}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {attachedFiles.map((attachedFile) => (
                  <div key={attachedFile.id} className="relative group">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {attachedFile.type === "image" ? (
                        <div className="aspect-square">
                          <img
                            src={attachedFile.previewUrl}
                            alt={attachedFile.file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square flex flex-col items-center justify-center p-3 bg-gray-50">
                          <GoPaperclip className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-600 text-center truncate w-full">
                            {attachedFile.file.name}
                          </span>
                        </div>
                      )}
                      <div className="p-2 bg-white border-t border-gray-100">
                        <div className="text-xs text-gray-600 truncate">
                          {attachedFile.file.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {(attachedFile.file.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                        {typeof uploadProgress[attachedFile.id] ===
                          "number" && (
                          <div className="mt-1">
                            <div className="w-full h-1.5 bg-gray-200 rounded">
                              <div
                                className="h-1.5 bg-blue-500 rounded"
                                style={{
                                  width: `${
                                    uploadProgress[attachedFile.id] || 0
                                  }%`,
                                }}
                              />
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1">
                              {Math.round(uploadProgress[attachedFile.id] || 0)}
                              %
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={() => removeAttachedFile(attachedFile.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MdClose className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isRecordingVoice ? (
            <div className="flex items-center justify-between w-full p-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 text-red-500 animate-pulse">
                <MdMic className="h-6 w-6" />
                <span className="font-mono font-medium text-lg">
                  {Math.floor(recordingDuration / 60)}:
                  {(recordingDuration % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={cancelRecording}
                  className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                  title="Cancel recording"
                >
                  <MdDelete className="h-6 w-6" />
                </button>
                <button
                  onClick={stopVoiceRecording}
                  className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors shadow-sm"
                  title="Finish recording"
                >
                  <MdCheck className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : recordedAudio ? (
            <div className="flex items-center gap-3 w-full p-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <button
                onClick={discardRecordedAudio}
                className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                title="Discard recording"
              >
                <MdDelete className="h-6 w-6" />
              </button>
              <div className="flex-1 bg-gray-100 rounded-full h-10 flex items-center px-3 gap-3">
                <button
                  onClick={() => {
                    if (audioPreviewRef.current) {
                      if (isPlayingAudio) {
                        audioPreviewRef.current.pause();
                      } else {
                        audioPreviewRef.current.play();
                      }
                      setIsPlayingAudio(!isPlayingAudio);
                    }
                  }}
                  className="text-gray-700 hover:text-blue-600"
                >
                  {isPlayingAudio ? (
                    <MdPause className="h-6 w-6" />
                  ) : (
                    <MdPlayArrow className="h-6 w-6" />
                  )}
                </button>
                <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-blue-500 ${
                      isPlayingAudio ? "animate-pulse" : ""
                    }`}
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {Math.floor(recordedAudio.duration / 60)}:
                  {(recordedAudio.duration % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <button
                onClick={sendRecordedAudio}
                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center"
                title="Send voice message"
              >
                <FiSend className="h-5 w-5 pl-0.5" />
              </button>
              <audio
                ref={audioPreviewRef}
                src={recordedAudio.url}
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-end gap-2 sm:gap-3">
              {/* File input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />

              {/* Attachment button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
                  isUploading
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                ) : (
                  <GoPaperclip className="h-5 w-5" />
                )}
              </button>

              {/* Message input container */}
              <div className="flex-1 relative">
                <div className="flex items-center bg-gray-100 rounded-3xl px-2 py-1 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all duration-200">
                  {/* Emoji button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMainEmojiPicker(!showMainEmojiPicker);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      showMainEmojiPicker
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <BsEmojiSmile className="h-5 w-5" />
                  </button>

                  {/* Text input */}
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      isUploading ? "Uploading files..." : "Type a message..."
                    }
                    className="w-full bg-transparent border-none focus:ring-0 text-sm sm:text-base max-h-32 resize-none py-2 px-2"
                    rows={1}
                    style={{ minHeight: "40px" }}
                  />
                </div>
              </div>

              {/* Send or Mic button */}
              {newMessage.trim() || attachedFiles.length > 0 ? (
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || isUploading}
                  className={`p-2 sm:p-3 rounded-full transition-all duration-200 transform ${
                    isSending || isUploading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-md"
                  }`}
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FiSend className="h-5 w-5 pl-0.5" />
                  )}
                </button>
              ) : (
                <button
                  onClick={startVoiceRecording}
                  className="p-2 sm:p-3 rounded-full transition-all duration-200 transform bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  <MdMic className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Voice recording indicator */}
          {isRecordingVoice && (
            <div className="mt-2 flex items-center gap-2 text-red-500">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <div
                  className="w-1 h-3 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1 h-5 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1 h-2 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                Recording... Release to send
              </span>
            </div>
          )}

          {/* Enhanced Emoji Picker */}
          {showMainEmojiPicker && (
            <>
              {/* Backdrop - click to close */}
              <div
                className="fixed inset-0 bg-black/10 z-40"
                onClick={() => {
                  setShowMainEmojiPicker(false);
                }}
              />

              {/* Emoji Picker Container */}
              <div
                className="fixed bottom-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-2xl mx-auto">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">😊</span>
                      <span className="font-semibold text-gray-700">
                        Choose Emoji
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowMainEmojiPicker(false);
                      }}
                      className="p-1.5 hover:bg-white/50 rounded-full transition-colors"
                      title="Close"
                    >
                      <MdClose className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Emoji Picker */}
                  <EmojiPicker
                    onEmojiClick={(emojiData: EmojiClickData) => {
                      handleEmojiSelect(emojiData.emoji);
                    }}
                    width="100%"
                    height={400}
                    searchPlaceHolder="Search emojis..."
                    previewConfig={{ showPreview: false }}
                  />

                  {/* Footer tip */}
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      💡 Tip: Click multiple emojis or press ESC to close
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Connection status */}
          {!isConnected && (
            <div className="mt-2 text-center text-xs text-red-500">
              🔴 Connecting...
            </div>
          )}

          {/* Upload status */}
          {isUploading && (
            <div className="mt-2 text-center text-xs text-blue-500">
              📎 Sending message and files...
            </div>
          )}

          {/* Voice upload progress chip */}
          {Object.entries(uploadProgress).some(([k]) =>
            k.startsWith("voice-")
          ) && (
            <div className="mt-2 flex justify-center">
              {Object.entries(uploadProgress)
                .filter(([k]) => k.startsWith("voice-"))
                .map(([k, p]) => (
                  <div
                    key={k}
                    className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs"
                  >
                    Voice upload {Math.round(p || 0)}%
                  </div>
                ))}
            </div>
          )}

          {/* Recording error */}
          {recordingError && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2 flex items-center justify-between">
              <span>{recordingError}</span>
              <button
                onClick={() => setRecordingError(null)}
                className="text-red-600 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New messages indicator */}
      {newMessagesPending && !isAtBottom && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <button
            onClick={() => {
              virtuosoRef.current?.scrollToIndex({
                index: Math.max(0, flatItems.length - 1),
                align: "end",
                behavior: "smooth",
              });
              setNewMessagesPending(false);
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-full shadow text-sm"
          >
            New messages
          </button>
        </div>
      )}

      {/* Floating scroll to unread button */}
      {showUnreadIndicator && unreadMessages.length > 0 && (
        <div className="absolute bottom-20 right-4">
          <button
            onClick={() => {
              const id = firstUnreadMessageId;
              if (typeof id === "number") {
                const idx = idToIndex.get(id);
                if (typeof idx === "number") {
                  virtuosoRef.current?.scrollToIndex({
                    index: idx,
                    align: "center",
                    behavior: "smooth",
                  });
                }
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <span className="text-sm font-medium">{unreadMessages.length}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Overlay for closing menus */}
      {(selectedMessage || showEmojiPicker || showMainEmojiPicker) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setSelectedMessage(null);
            setShowEmojiPicker(null);
            setShowMainEmojiPicker(false);
          }}
        ></div>
      )}

      {/* Lightbox for viewing images */}
      {lightboxImage && (
        <Lightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}

      <GroupInfoModal
        isOpen={isGroupInfoModalOpen}
        onClose={() => setIsGroupInfoModalOpen(false)}
      />
    </div>
  );
};

export default Chat;
