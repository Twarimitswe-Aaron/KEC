import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { GroupedVirtuoso, GroupedVirtuosoHandle } from "react-virtuoso";

import { MdOutlinePhoneInTalk } from "react-icons/md";
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
} from "react-icons/md";
import { useChat } from "../../hooks/useChat";
import {
  Message,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
} from "../../state/api/chatApi";

interface ChatProps {
  onToggleRightSidebar: () => void;
}

interface ReplyingToMessage {
  id: number;
  content: string;
  senderName: string;
  messageType: string;
}

const Chat: React.FC<ChatProps> = ({ onToggleRightSidebar }) => {
  // Track message IDs to identify new messages for smooth animation
  const [seenMessageIds, setSeenMessageIds] = useState<Set<number>>(new Set());
  const [newMessageIds, setNewMessageIds] = useState<Set<number>>(new Set());

  // Add smooth message insertion styles
  const messageAnimationStyle = `
    .message-enter {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .message-enter-active {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    
    .message-stable {
      opacity: 1;
      transform: translateY(0) scale(1);
      transition: all 0.3s ease;
    }
    
    .message-image-enter {
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.25s ease-out, transform 0.25s ease-out;
    }
    
    .message-image-enter-active {
      opacity: 1;
      transform: translateY(0);
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

  // Scroll and upload progress helpers
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesPending, setNewMessagesPending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const justSentRef = useRef(false);

  // File upload / message mutations
  const [deleteMessage] = useDeleteMessageMutation();
  const [editMessage] = useEditMessageMutation();
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unreadIndicatorRef = useRef<HTMLDivElement>(null);
  const [showUnreadIndicator, setShowUnreadIndicator] = useState(false);

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

  // Handle emoji selection for input
  const handleEmojiSelect = useCallback(
    async (emoji: string) => {
      // Check if it's a single emoji and the input is empty - send as emoji message
      if (
        !newMessage.trim() &&
        /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D]+$/u.test(emoji)
      ) {
        // Send emoji directly as a message
        if (activeChat && isConnected) {
          try {
            await sendMessage(emoji, "TEXT");
            setShowMainEmojiPicker(false);
            return;
          } catch (error) {
            console.error("Failed to send emoji message:", error);
          }
        }
      }

      // Otherwise add to input text
      setNewMessage((prev) => prev + emoji);
      setShowMainEmojiPicker(false);
    },
    [newMessage, activeChat, isConnected, sendMessage]
  );

  // Handle message reaction
  const handleMessageReaction = useCallback(
    async (messageId: number, emoji: string) => {
      if (!activeChat || !currentUser) return;

      try {
        console.log("👍 [Chat] Adding reaction:", { messageId, emoji });

        // Call the API to add/remove reaction
        await addReaction({
          messageId,
          emoji,
          chatId: activeChat.id,
        }).unwrap();

        console.log(
          `✅ [Chat] Added ${emoji} reaction to message ${messageId}`
        );

        setShowEmojiPicker(null);
        setSelectedMessage(null);
      } catch (error) {
        console.error("❌ Failed to add reaction:", error);

        // Try to remove the reaction if it already exists
        try {
          await removeReaction({
            messageId,
            emoji,
            chatId: activeChat.id,
          }).unwrap();
          console.log(
            `✅ [Chat] Removed ${emoji} reaction from message ${messageId}`
          );
        } catch (removeError) {
          console.error("❌ Failed to remove reaction:", removeError);
        }
      }
    },
    [activeChat, currentUser, addReaction, removeReaction]
  );

  // Handle quick reaction (double tap or long press)
  const handleQuickReaction = useCallback(
    async (messageId: number, emoji: string = "❤️") => {
      // Show floating reaction animation
      setFloatingReaction({ messageId, emoji, show: true });

      // Hide animation after delay
      setTimeout(() => {
        setFloatingReaction(null);
      }, 1000);

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

  // After sending a message while at bottom, re-anchor to the latest once it appears
  useEffect(() => {
    if (justSentRef.current && messages.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: Math.max(0, messages.length - 1),
        align: "end",
        behavior: "auto",
      });
      justSentRef.current = false;
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
    const now = new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(dateString);
    const timeString = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (messageDate.toDateString() === today.toDateString()) {
      return timeString; // "2:30 PM"
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeString}`; // "Yesterday 2:30 PM"
    } else {
      const diffInDays = Math.floor(
        (today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffInDays < 7) {
        return `${messageDate.toLocaleDateString([], {
          weekday: "short",
        })} ${timeString}`; // "Mon 2:30 PM"
      } else {
        return `${messageDate.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })} ${timeString}`; // "Nov 10 2:30 PM"
      }
    }
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

    // Remove whitespace and check if it's only emojis (1-3 emojis max for large display)
    const trimmed = content.trim();
    const emojiRegex =
      /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D\s]{1,6}$/u;
    const emojiCount = (
      trimmed.match(/[\p{Emoji_Presentation}\p{Emoji}]/gu) || []
    ).length;

    return emojiRegex.test(trimmed) && emojiCount >= 1 && emojiCount <= 3;
  };

  // Common emoji reactions
  const commonReactions = ["❤️", "😂", "😮", "😢", "😠", "👍", "👎", "🔥"];

  // Main emoji picker emojis
  const mainEmojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🤭",
    "🤫",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "🤑",
    "🤠",
    "😈",
    "👿",
    "👹",
    "👺",
    "🤡",
    "💩",
    "👻",
    "💀",
    "☠️",
    "👽",
    "👾",
    "🤖",
    "🎃",
    "😺",
    "😸",
    "😹",
    "😻",
    "😼",
    "😽",
    "🙀",
    "😿",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
    "👎",
    "👊",
    "✊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "✍️",
    "💅",
    "🤳",
    "💪",
    "🦾",
    "🦵",
    "🦿",
    "🦶",
    "👂",
    "🦻",
    "👃",
    "🧠",
    "🫀",
    "🫁",
    "🦷",
    "🦴",
    "👀",
    "👁️",
    "👅",
  ];

  // Handle double-tap for quick reaction
  const [lastTapTime, setLastTapTime] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [floatingReaction, setFloatingReaction] = useState<{
    messageId: number;
    emoji: string;
    show: boolean;
  } | null>(null);

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

          // If the URL is relative or uses wrong port, fix it
          if (
            fileUrl.startsWith("/uploads/") ||
            fileUrl.includes("localhost:3000")
          ) {
            const pathPart = fileUrl.includes("/uploads/")
              ? fileUrl.substring(fileUrl.indexOf("/uploads/"))
              : fileUrl;
            fileUrl = `${backendUrl}${pathPart}`;
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
      });
      setSelectedMessage(null);
      setShowEmojiPicker(null);
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
      // Fetch CSRF token (mirrors apiSlice behavior)
      let csrfToken = "";
      try {
        const res = await fetch(`${backendUrl}/csrf/token`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          csrfToken = data.csrfToken || "";
        }
      } catch {}

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
      if (!activeChat || blob.size === 0) return;
      const file = new File([blob], `voice-${Date.now()}.webm`, {
        type: blob.type,
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
      if (
        fileUrl.startsWith("/uploads/") ||
        fileUrl.includes("localhost:3000")
      ) {
        const pathPart = fileUrl.includes("/uploads/")
          ? fileUrl.substring(fileUrl.indexOf("/uploads/"))
          : fileUrl;
        fileUrl = `${backendUrl}${pathPart}`;
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
      setTimeout(() => {
        setUploadProgress((curr) => {
          const { [progressId]: _omit, ...rest } = curr;
          return rest;
        });
      }, 800);
    } catch (e) {}
  }, [activeChat, replyingTo, uploadFileWithProgress, sendMessage]);

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
      console.log("⚠️ [Chat] No active chat for participant info");
      return null;
    }

    console.log("🔍 [Chat] Debugging activeChat data:", {
      chatId: activeChat.id,
      isGroup: activeChat.isGroup,
      participantsCount: activeChat.participants?.length || 0,
      participants: activeChat.participants,
      currentUserId: currentUser?.id,
    });

    if (activeChat.isGroup) {
      console.log("👥 [Chat] Group chat participant info:", activeChat.name);
      return {
        name: activeChat.name || "Group Chat",
        avatar: activeChat.groupAvatar || "/images/chat.png",
        isOnline: true, // Groups are always "online"
        lastSeen: `${activeChat.participants?.length || 0} members`,
      };
    }

    // Check if participants array exists and has data
    if (!activeChat.participants || activeChat.participants.length === 0) {
      console.log("⚠️ [Chat] No participants array or empty participants");
      return {
        name: "Loading participants...",
        avatar: "/images/chat.png",
        isOnline: false,
        lastSeen: "Loading...",
      };
    }

    console.log(
      "🔍 [Chat] Looking for participant excluding current user ID:",
      currentUser?.id
    );
    activeChat.participants.forEach((p, index) => {
      console.log(`👤 [Chat] Participant ${index}:`, {
        participantId: p.id,
        userId: p.user?.id,
        userFirstName: p.user?.firstName,
        userLastName: p.user?.lastName,
        isCurrentUser: p.user?.id === currentUser?.id,
      });
    });

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
          ? "Online"
          : "Last seen recently",
      };
      console.log("👤 [Chat] Found 1-on-1 chat participant:", participantInfo);
      return participantInfo;
    }

    console.log(
      "⚠️ [Chat] No other participant found in chat - all participants might be current user"
    );
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
      <div className="flex items-center justify-between p-4 bg-white text-black border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
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
          <GoDeviceCameraVideo className="cursor-pointer hover:text-blue-600 transition-colors" />
          <MdOutlinePhoneInTalk className="cursor-pointer hover:text-blue-600 transition-colors" />
          <MdInfoOutline
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={onToggleRightSidebar}
          />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="relative flex-1 pl-2 sm:pl-4 pr-2 sm:pr-4 py-2 bg-white"
        style={{ height: "100%" }}
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
          <GroupedVirtuoso
            ref={virtuosoRef}
            className="scroll-hide"
            style={{ height: "100%", overflowX: "hidden" }}
            groupCounts={groupCounts}
            alignToBottom
            followOutput="smooth"
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
              const isGrouped = shouldGroupMessage(message, prevMessage as any);
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

              // Treat as image only when it's not an audio file
              const isImageMessage =
                message.messageType === "IMAGE" && !isAudioFile;

              return (
                <div
                  key={`${message.id}-${message.createdAt}-${idxInGroup}`}
                  className={`relative ${
                    newMessageIds.has(message.id)
                      ? message.messageType === "IMAGE"
                        ? "message-image-enter"
                        : "message-enter"
                      : "message-stable"
                  }`}
                  style={{
                    animationDelay: newMessageIds.has(message.id)
                      ? `${idxInGroup * 0.05}s`
                      : "0s",
                  }}
                  onTransitionEnd={() => {
                    if (newMessageIds.has(message.id)) {
                      const element = document.querySelector(
                        `[data-message-id="${message.id}"]`
                      );
                      if (element) {
                        element.classList.remove(
                          "message-enter",
                          "message-image-enter"
                        );
                        element.classList.add("message-stable");
                      }
                    }
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
                    } ${isGrouped ? "mb-1" : "mb-2"}`}
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
                        <div className="relative">
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
                          ? "max-w-[85%] sm:max-w-[75%] md:max-w-[320px] lg:max-w-[400px]"
                          : "w-full max-w-[85%] sm:max-w-[75%] md:max-w-[320px] lg:max-w-[400px]"
                      }`}
                    >
                      {message.replyToId && (
                        <div
                          className={`mb-2 p-2 border-l-4 rounded-r-lg text-xs ${
                            isCurrentUser
                              ? "border-blue-300 bg-blue-50/50"
                              : "border-gray-300 bg-gray-50"
                          }`}
                        >
                          <div className="text-gray-600 font-medium mb-1">
                            {message.replyTo
                              ? `Replying to ${
                                  message.replyTo.sender.id === currentUser?.id
                                    ? "yourself"
                                    : `${
                                        message.replyTo.sender.firstName ||
                                        "User"
                                      } ${
                                        message.replyTo.sender.lastName || ""
                                      }`.trim()
                                }`
                              : `Replying to message #${message.replyToId}`}
                          </div>
                          <div className="text-gray-500 truncate">
                            {message.replyTo
                              ? message.replyTo.messageType === "TEXT"
                                ? message.replyTo.content || "Message"
                                : message.replyTo.messageType === "IMAGE"
                                ? "📷 Image"
                                : message.replyTo.messageType === "FILE"
                                ? "📄 File"
                                : "Message"
                              : "Original message..."}
                          </div>
                        </div>
                      )}

                      <div
                        className={`${
                          message.messageType === "TEXT"
                            ? isEmojiOnlyMessage(message.content || "")
                              ? "inline-block bg-transparent border-0 shadow-none px-1 py-1"
                              : "inline-block"
                            : "block w-full"
                        } ${
                          message.messageType === "TEXT" &&
                          isEmojiOnlyMessage(message.content || "")
                            ? ""
                            : "px-2 sm:px-3 py-1.5"
                        } relative ${
                          message.messageType === "TEXT" &&
                          isEmojiOnlyMessage(message.content || "")
                            ? ""
                            : isCurrentUser
                            ? "bg-blue-500 text-white"
                            : isUnread
                            ? "bg-white border border-blue-200 text-gray-900 shadow-md"
                            : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                        } ${
                          isCurrentUser
                            ? `${
                                !isGrouped && !isGroupedWithNext
                                  ? "rounded-2xl"
                                  : !isGrouped && isGroupedWithNext
                                  ? "rounded-2xl rounded-br-md"
                                  : isGrouped && !isGroupedWithNext
                                  ? "rounded-2xl rounded-tr-md"
                                  : "rounded-xl rounded-tr-md rounded-br-md"
                              }`
                            : `${
                                !isGrouped && !isGroupedWithNext
                                  ? "rounded-2xl"
                                  : !isGrouped && isGroupedWithNext
                                  ? "rounded-2xl rounded-bl-md"
                                  : isGrouped && !isGroupedWithNext
                                  ? "rounded-2xl rounded-tl-md"
                                  : "rounded-xl rounded-tl-md rounded-bl-md"
                              }`
                        }`}
                      >
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
                              {message.isEdited && (
                                <span className="text-xs text-gray-400 italic ml-2">
                                  (edited)
                                </span>
                              )}
                            </div>
                          ))}

                        {isImageMessage && (
                          <div className="relative">
                            <a
                              href={message.fileUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={message.fileUrl || ""}
                                alt={message.fileName || "Image"}
                                loading="lazy"
                                className="message-image rounded-lg max-h-80 object-contain"
                              />
                            </a>
                          </div>
                        )}

                        {/* Voice / audio messages */}
                        {isAudioFile && (
                            <audio
                              controls
                              preload="metadata"
                              className="w-full"
                            >
                              <source
                                src={message.fileUrl || ""}
                                type={message.fileMimeType || "audio/webm"}
                              />
                              Your browser does not support the audio element.
                            </audio>
                          )}

                        {/* Generic file messages */}
                        {message.fileUrl && !isAudioFile && (
                            <a
                              href={message.fileUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50"
                            >
                              <GoPaperclip className="h-5 w-5 text-gray-500" />
                              <span className="text-xs sm:text-sm truncate max-w-[220px]">
                                {message.fileName || "File"}
                              </span>
                              {typeof message.fileSize === "number" && (
                                <span className="text-[10px] text-gray-400">
                                  {Math.round(
                                    (message.fileSize / 1024 / 1024) * 10
                                  ) / 10}{" "}
                                  MB
                                </span>
                              )}
                            </a>
                          )}

                        {/* Reactions bar */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {message.reactions.map((reaction) => (
                              <div
                                key={reaction.emoji}
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] ${
                                  isCurrentUser
                                    ? "bg-blue-600/80 text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                <span>{reaction.emoji}</span>
                                {reaction.count > 1 && (
                                  <span className="ml-1 text-[9px]">
                                    {reaction.count}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Hover actions */}
                        <div
                          className={`absolute top-0 ${
                            isCurrentUser ? "-left-24" : "-right-24"
                          } opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white shadow-lg rounded-full p-1`}
                        >
                          <button
                            onClick={() => handleReply(message)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Reply"
                          >
                            <BsReply className="h-4 w-4 text-gray-600" />
                          </button>
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
                          {isCurrentUser && message.messageType === "TEXT" && (
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
                              onClick={() => handleDeleteMessage(message.id)}
                              className="p-2 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete"
                            >
                              <MdDelete className="h-4 w-4 text-red-600" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setSelectedMessage(
                                selectedMessage === message.id
                                  ? null
                                  : message.id
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="More options"
                          >
                            <BsThreeDots className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Emoji picker */}
                        {showEmojiPicker === message.id && (
                          <div
                            className={`absolute z-50 mt-2 ${
                              isCurrentUser ? "right-0" : "left-0"
                            } bg-white border border-gray-200 rounded-lg shadow-lg p-2 emoji-picker`}
                          >
                            <div className="flex gap-1">
                              {commonReactions.map((emoji, idx) => (
                                <button
                                  key={idx}
                                  onClick={() =>
                                    handleQuickReaction(message.id, emoji)
                                  }
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Message options menu */}
                        {selectedMessage === message.id && (
                          <div
                            className={`absolute z-50 mt-2 ${
                              isCurrentUser ? "right-0" : "left-0"
                            } bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] message-menu`}
                          >
                            <button
                              onClick={() => handleReply(message)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
                            >
                              Reply
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement forward
                                setSelectedMessage(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
                            >
                              Forward
                            </button>
                            {isCurrentUser &&
                              message.messageType === "TEXT" && (
                                <button
                                  onClick={() => handleEditMessage(message)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
                                >
                                  Edit
                                </button>
                              )}
                            {isCurrentUser && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm text-red-600"
                              >
                                Delete
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
                              {commonReactions.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    handleMessageReaction(message.id, emoji)
                                  }
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg"
                                  title={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                              <div className="text-xs text-gray-500 mb-2 font-medium">
                                More emojis
                              </div>
                              <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
                                {mainEmojis.slice(0, 24).map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() =>
                                      handleMessageReaction(message.id, emoji)
                                    }
                                    className="p-1 hover:bg-gray-100 rounded transition-colors text-sm"
                                    title={`React with ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Current user avatar */}
                      <div
                        className={`w-8 ${isCurrentUser ? "block" : "hidden"}`}
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
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200">
        {/* Reply preview */}
        {replyingTo && (
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-blue-600 mb-1">
                    Replying to {replyingTo!.senderName}
                  </div>
                  <div className="text-sm text-gray-600 truncate max-w-[300px]">
                    {replyingTo!.messageType === "TEXT"
                      ? replyingTo!.content
                      : replyingTo!.messageType === "IMAGE"
                      ? "📷 Image"
                      : replyingTo!.messageType === "FILE"
                      ? `📄 ${replyingTo!.content}`
                      : replyingTo!.content}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log("❌ [Chat] Canceling reply");
                  setReplyingTo(null);
                }}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
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
              <div className="flex items-end bg-gray-100 rounded-2xl overflow-hidden">
                {/* Text input */}
                <textarea
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e, "textarea-enter");
                    }
                  }}
                  placeholder="Type a message..."
                  disabled={!isConnected}
                  rows={1}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none max-h-32 disabled:bg-gray-50 text-sm sm:text-base"
                  style={{
                    minHeight: "48px",
                    height: "auto",
                  }}
                />

                {/* Emoji button */}
                <button
                  onClick={() => setShowMainEmojiPicker(!showMainEmojiPicker)}
                  className={`p-2 sm:p-3 transition-colors ${
                    showMainEmojiPicker
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  <BsEmojiSmile className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Voice/Send button */}
            {newMessage.trim() || attachedFiles.length > 0 ? (
              <button
                onClick={(e) => handleSendMessage(e, "send-button")}
                disabled={!isConnected || isUploading || isSending}
                className={`p-2 sm:p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isUploading || isSending
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isUploading || isSending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <FiSend className="h-5 w-5" />
                )}
              </button>
            ) : (
              <button
                onMouseDown={() => startVoiceRecording()}
                onMouseUp={() => stopVoiceRecording()}
                onMouseLeave={() => stopVoiceRecording()}
                className={`p-2 sm:p-3 rounded-full transition-all duration-200 transform ${
                  isRecordingVoice
                    ? "bg-red-500 text-white scale-105"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {isRecordingVoice ? (
                  <MdMicOff className="h-5 w-5" />
                ) : (
                  <MdMic className="h-5 w-5" />
                )}
              </button>
            )}
          </div>

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

          {/* Emoji Picker */}
          {showMainEmojiPicker && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-10 gap-2">
                {mainEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
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
    </div>
  );
};

export default Chat;
