import React, { useState, useRef, useEffect, useCallback } from "react";

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
  useUploadChatFileMutation,
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

  // File upload mutation
  const [uploadFile] = useUploadChatFileMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [editMessage] = useEditMessageMutation();
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unreadIndicatorRef = useRef<HTMLDivElement>(null);
  const [showUnreadIndicator, setShowUnreadIndicator] = useState(false);

  // Handle unread message indicator visibility
  useEffect(() => {
    setShowUnreadIndicator(unreadMessages.length > 0 && !isTabVisible);
  }, [unreadMessages.length, isTabVisible]);

  // Handle emoji selection for input
  const handleEmojiSelect = useCallback(async (emoji: string) => {
    // Check if it's a single emoji and the input is empty - send as emoji message
    if (!newMessage.trim() && /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D]+$/u.test(emoji)) {
      // Send emoji directly as a message
      if (activeChat && isConnected) {
        try {
          await sendMessage(emoji, "TEXT");
          setShowMainEmojiPicker(false);
          return;
        } catch (error) {
          console.error('Failed to send emoji message:', error);
        }
      }
    }
    
    // Otherwise add to input text
    setNewMessage(prev => prev + emoji);
    setShowMainEmojiPicker(false);
  }, [newMessage, activeChat, isConnected, sendMessage]);

  // Handle message reaction
  const handleMessageReaction = useCallback(async (messageId: number, emoji: string) => {
    if (!activeChat || !currentUser) return;
    
    try {
      console.log('👍 [Chat] Adding reaction:', { messageId, emoji });
      
      // Call the API to add/remove reaction
      await addReaction({ 
        messageId, 
        emoji, 
        chatId: activeChat.id 
      }).unwrap();
      
      console.log(`✅ [Chat] Added ${emoji} reaction to message ${messageId}`);
      
      setShowEmojiPicker(null);
      setSelectedMessage(null);
      
    } catch (error) {
      console.error('❌ Failed to add reaction:', error);
      
      // Try to remove the reaction if it already exists
      try {
        await removeReaction({ 
          messageId, 
          emoji, 
          chatId: activeChat.id 
        }).unwrap();
        console.log(`✅ [Chat] Removed ${emoji} reaction from message ${messageId}`);
      } catch (removeError) {
        console.error('❌ Failed to remove reaction:', removeError);
      }
    }
  }, [activeChat, currentUser, addReaction, removeReaction]);

  // Handle quick reaction (double tap or long press)
  const handleQuickReaction = useCallback(async (messageId: number, emoji: string = '❤️') => {
    // Show floating reaction animation
    setFloatingReaction({ messageId, emoji, show: true });
    
    // Hide animation after delay
    setTimeout(() => {
      setFloatingReaction(null);
    }, 1000);
    
    await handleMessageReaction(messageId, emoji);
  }, [handleMessageReaction]);


  const handleMouseUp = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Handle message deletion
  const handleDeleteMessage = useCallback(async (messageId: number) => {
    if (!activeChat) return;
    
    try {
      console.log('🗑️ [Chat] Deleting message:', messageId);
      
      await deleteMessage({ 
        messageId, 
        chatId: activeChat.id 
      }).unwrap();
      
      console.log('✅ [Chat] Message deleted successfully');
      setSelectedMessage(null);
      
    } catch (error) {
      console.error('❌ Failed to delete message:', error);
    }
  }, [activeChat, deleteMessage]);

  // Handle message edit
  const handleEditMessage = useCallback((message: Message) => {
    console.log('✏️ [Chat] Edit message:', message.id);
    setEditingMessage(message.id);
    setEditingContent(message.content || '');
    setSelectedMessage(null);
  }, []);

  // Save edited message
  const handleSaveEdit = useCallback(async (messageId: number) => {
    if (!activeChat || !editingContent.trim()) return;
    
    try {
      console.log('💾 [Chat] Saving edited message:', messageId);
      
      await editMessage({ 
        messageId, 
        content: editingContent.trim(),
        chatId: activeChat.id 
      }).unwrap();
      
      console.log('✅ [Chat] Message edited successfully');
      setEditingMessage(null);
      setEditingContent('');
      
    } catch (error) {
      console.error('❌ Failed to edit message:', error);
    }
  }, [activeChat, editingContent, editMessage]);

  // Cancel message edit
  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setEditingContent('');
  }, []);

  // Setup scroll to unread functionality
  useEffect(() => {
    if (unreadIndicatorRef.current && firstUnreadMessageId) {
      const scrollToUnreadMessage = () => {
        const unreadElement = document.querySelector(
          `[data-message-id="${firstUnreadMessageId}"]`
        );
        if (unreadElement) {
          unreadElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          console.log(
            "📍 [Chat] Scrolled to first unread message:",
            firstUnreadMessageId
          );
        }
      };

      // Store the scroll function for context to use
      const currentScrollRef = unreadIndicatorRef.current;
      if (currentScrollRef) {
        // Make the scroll function available
        (currentScrollRef as any).scrollToUnread = scrollToUnreadMessage;
      }
    }
  }, [firstUnreadMessageId, scrollToUnread]);

  // Smooth auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        // Use requestAnimationFrame for smoother scrolling with proper timing
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Double RAF for better timing
            messagesEndRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          });
        });
      }
    };

    // Longer delay to allow for message animation to start
    const timer = setTimeout(scrollToBottom, 150);

    // Cleanup function
    return () => {
      clearTimeout(timer);
    };
  }, [messages]);

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
    if (!content || content.trim() === '') return false;
    
    // Remove whitespace and check if it's only emojis (1-3 emojis max for large display)
    const trimmed = content.trim();
    const emojiRegex = /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D\s]{1,6}$/u;
    const emojiCount = (trimmed.match(/[\p{Emoji_Presentation}\p{Emoji}]/gu) || []).length;
    
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
  
  const handleMessageTap = useCallback((messageId: number) => {
    const now = Date.now();
    const timeDiff = now - lastTapTime;
    
    if (timeDiff < 300 && tapCount === 1) {
      // Double tap detected - add heart reaction
      handleQuickReaction(messageId, '❤️');
      setTapCount(0);
    } else {
      setTapCount(1);
      setLastTapTime(now);
      
      // Reset tap count after delay
      setTimeout(() => {
        setTapCount(0);
      }, 300);
    }
  }, [lastTapTime, tapCount, handleQuickReaction]);

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

          // Upload file to server
          const uploadResult = await uploadFile({
            file: attachedFile.file,
            chatId: activeChat.id,
          }).unwrap();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        className="flex-1 pl-2 sm:pl-4 pr-0 py-2 overflow-y-auto scroll-hide bg-white space-y-2 sm:space-y-4"
        style={{ scrollBehavior: "smooth" }}
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
          <>
            {Object.entries(groupMessagesByDate()).map(
              ([dateKey, dayMessages]) => (
                <div key={dateKey}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-6">
                    <div className="bg-green-100 text-green-800 text-xs px-4 py-2 rounded-full font-medium shadow-sm">
                      {dateKey}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  {dayMessages.map((message, index) => {
                    const isCurrentUser = message.senderId === currentUser?.id;
                    const isUnread = !isCurrentUser && !message.isRead;
                    const prevMessage =
                      index > 0 ? dayMessages[index - 1] : null;
                    const nextMessage =
                      index < dayMessages.length - 1
                        ? dayMessages[index + 1]
                        : null;
                    const isGrouped = shouldGroupMessage(message, prevMessage);
                    const isGroupedWithNext = nextMessage
                      ? shouldGroupMessage(nextMessage, message)
                      : false;
                    const showAvatar = !isCurrentUser && !isGrouped;

                    return (
                      <div
                        key={`${message.id}-${message.createdAt}-${index}`}
                        className={`relative ${
                          newMessageIds.has(message.id)
                            ? message.messageType === "IMAGE"
                              ? "message-image-enter"
                              : "message-enter"
                            : "message-stable"
                        }`}
                        style={{
                          animationDelay: newMessageIds.has(message.id)
                            ? `${index * 0.05}s`
                            : "0s",
                        }}
                        onTransitionEnd={() => {
                          // Ensure smooth transition to stable state after CSS transition completes
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
                        {/* Unread messages divider */}
                        {firstUnreadMessageId === message.id &&
                          unreadMessages.length > 0 && (
                            <div
                              className="flex items-center justify-center my-4"
                              ref={unreadIndicatorRef}
                            >
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                              <div className="px-4 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                                {unreadMessages.length} unread message
                                {unreadMessages.length > 1 ? "s" : ""}
                              </div>
                              <div className="flex-1 h-px bg-gradient-to-r from-blue-400 via-transparent to-transparent"></div>
                            </div>
                          )}

                        {/* Message container */}
                        <div
                          className={`flex items-start gap-1 sm:gap-2 ${
                            isCurrentUser
                              ? "justify-end pr-0 -mr-1"
                              : "justify-start pl-0"
                          } ${
                            isUnread
                              ? "bg-blue-50/30 -mx-2 sm:-mx-4 px-2 sm:px-4 py-2 rounded-lg"
                              : ""
                          } ${isGrouped ? "mb-1" : "mb-4"}`}
                          onMouseDown={() => handleOptionsMouseDown(message.id)}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          onClick={() => handleMessageTap(message.id)}
                        >
                          {/* Avatar space */}
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

                          {/* Message content */}
                          <div
                            className={`relative group ${
                              isCurrentUser
                                ? "max-w-[85%] sm:max-w-[75%] md:max-w-[320px] lg:max-w-[400px]"
                                : "w-full max-w-[85%] sm:max-w-[75%] md:max-w-[320px] lg:max-w-[400px]"
                            }`}
                          >
                            {/* Reply indicator */}
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
                                        message.replyTo.sender.id ===
                                        currentUser?.id
                                          ? "yourself"
                                          : `${
                                              message.replyTo.sender
                                                .firstName || "User"
                                            } ${
                                              message.replyTo.sender.lastName ||
                                              ""
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

                            {/* Main message bubble */}
                            <div
                              className={`${
                                message.messageType === "TEXT"
                                  ? isEmojiOnlyMessage(message.content || '')
                                    ? "inline-block bg-transparent border-0 shadow-none px-1 py-1" // Special styling for emoji-only
                                    : "inline-block"
                                  : "block w-full"
                              } ${
                                // Skip normal padding for emoji-only messages
                                message.messageType === "TEXT" && isEmojiOnlyMessage(message.content || '')
                                  ? ""
                                  : "px-2 sm:px-4 py-2"
                              } relative ${
                                // Base styling - skip background for emoji-only messages
                                message.messageType === "TEXT" && isEmojiOnlyMessage(message.content || '')
                                  ? "" // No background for emoji-only
                                  : isCurrentUser
                                  ? "bg-blue-500 text-white"
                                  : isUnread
                                  ? "bg-white border border-blue-200 text-gray-900 shadow-md"
                                  : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                              } ${
                                // Dynamic border radius based on grouping
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
                              {/* Message content */}
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
                                        onClick={() =>
                                          handleSaveEdit(message.id)
                                        }
                                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <p className={`whitespace-pre-wrap leading-relaxed break-words ${
                                      isEmojiOnlyMessage(message.content || '')
                                        ? "text-4xl sm:text-5xl" // Large emoji display
                                        : "text-xs sm:text-sm" // Normal text size
                                    }`}>
                                      {message.content}
                                    </p>
                                    {message.isEdited && (
                                      <span className="text-xs text-gray-400 italic ml-2">
                                        (edited)
                                      </span>
                                    )}
                                  </div>
                                ))}
                              {message.messageType === "IMAGE" && (
                                <div className="w-full relative">
                                  <img
                                    src={(() => {
                                      let imageUrl = message.fileUrl;
                                      // Fix old messages with relative URLs
                                      if (
                                        imageUrl &&
                                        imageUrl.startsWith("/uploads/")
                                      ) {
                                        const backendUrl =
                                          import.meta.env.VITE_BACKEND_URL ||
                                          "http://localhost:4000";
                                        imageUrl = `${backendUrl}${imageUrl}`;
                                      }
                                      return imageUrl;
                                    })()}
                                    alt="Shared image"
                                    className="message-image w-full max-w-[280px] sm:max-w-[350px] h-[200px] sm:h-[250px] rounded-lg object-cover cursor-pointer hover:opacity-95 transition-all duration-200 bg-gray-200"
                                    style={{
                                      opacity: 1,
                                      transform: "scale(1)",
                                    }}
                                    onClick={() => {
                                      let imageUrl = message.fileUrl;
                                      if (
                                        imageUrl &&
                                        imageUrl.startsWith("/uploads/")
                                      ) {
                                        const backendUrl =
                                          import.meta.env.VITE_BACKEND_URL ||
                                          "http://localhost:4000";
                                        imageUrl = `${backendUrl}${imageUrl}`;
                                      }
                                      window.open(imageUrl, "_blank");
                                    }}
                                    onError={(e) => {
                                      console.error(
                                        "❌ Image failed to load:",
                                        message.fileUrl
                                      );
                                      // Smooth fade to error state
                                      const target =
                                        e.currentTarget as HTMLImageElement;
                                      target.style.opacity = "0";
                                      setTimeout(() => {
                                        target.style.display = "none";
                                        const fallback =
                                          document.createElement("div");
                                        fallback.className =
                                          "w-full max-w-[280px] sm:max-w-[350px] h-[200px] sm:h-[250px] bg-gray-200 rounded-lg flex items-center justify-center opacity-0";
                                        fallback.innerHTML =
                                          '<span class="text-gray-500 text-sm">Failed to load image</span>';
                                        target.parentElement?.appendChild(
                                          fallback
                                        );
                                        // Fade in error state
                                        setTimeout(() => {
                                          fallback.style.opacity = "1";
                                          fallback.style.transition =
                                            "opacity 0.3s ease";
                                        }, 10);
                                      }, 200);
                                    }}
                                    onLoad={() => {
                                      console.log(
                                        "✅ Image loaded successfully:",
                                        message.fileUrl
                                      );
                                    }}
                                  />
                                </div>
                              )}
                              {message.messageType === "FILE" && (
                                <div
                                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 min-w-[200px] max-w-[280px] sm:max-w-[350px] w-full cursor-pointer hover:bg-opacity-80 transition-all duration-200 rounded-lg border border-gray-200/50"
                                  onClick={() => {
                                    if (message.fileUrl) {
                                      let fileUrl = message.fileUrl;
                                      if (fileUrl.startsWith("/uploads/")) {
                                        const backendUrl =
                                          import.meta.env.VITE_BACKEND_URL ||
                                          "http://localhost:4000";
                                        fileUrl = `${backendUrl}${fileUrl}`;
                                      }
                                      window.open(fileUrl, "_blank");
                                    }
                                  }}
                                >
                                  <div
                                    className={`p-3 rounded-full flex-shrink-0 ${
                                      isCurrentUser
                                        ? "bg-white/20"
                                        : "bg-blue-50"
                                    }`}
                                  >
                                    <GoPaperclip
                                      className={`h-5 w-5 ${
                                        isCurrentUser
                                          ? "text-white"
                                          : "text-blue-600"
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <div
                                      className={`font-medium text-sm truncate ${
                                        isCurrentUser
                                          ? "text-white"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {message.fileName || "Uploaded file"}
                                    </div>
                                    <div
                                      className={`text-xs flex items-center gap-2 ${
                                        isCurrentUser
                                          ? "text-white/70"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      <span>
                                        {message.fileSize
                                          ? `${(
                                              message.fileSize /
                                              (1024 * 1024)
                                            ).toFixed(1)} MB`
                                          : "File"}
                                      </span>
                                      <span>•</span>
                                      <span className="text-xs opacity-75">
                                        Click to download
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {message.messageType === "LINK" && (
                                <a
                                  href={message.content}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-sm underline hover:no-underline ${
                                    isCurrentUser
                                      ? "text-blue-100"
                                      : "text-blue-600"
                                  }`}
                                >
                                  {message.content}
                                </a>
                              )}

                              {/* Message reactions */}
                              {message.reactions && message.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {message.reactions.map((reaction, reactionIndex) => (
                                    <button
                                      key={`${reaction.emoji}-${reactionIndex}`}
                                      onClick={() => handleMessageReaction(message.id, reaction.emoji)}
                                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
                                      title={`${reaction.count} ${reaction.count === 1 ? 'person' : 'people'} reacted with ${reaction.emoji}`}
                                    >
                                      <span>{reaction.emoji}</span>
                                      <span className="text-gray-600">{reaction.count}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Floating reaction animation */}
                              {floatingReaction && floatingReaction.messageId === message.id && (
                                <div 
                                  className={`absolute ${isCurrentUser ? 'left-1/2' : 'right-1/2'} top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30`}
                                  style={{
                                    animation: 'floatUp 1s ease-out forwards'
                                  }}
                                >
                                  <div className="text-4xl animate-bounce">
                                    {floatingReaction.emoji}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Time and status */}
                            <div
                              className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                                isCurrentUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span className="text-xs">
                                {formatTime(message.createdAt)}
                              </span>
                              {isCurrentUser && (
                                <span className="ml-1">
                                  {getMessageStatusIcon(message)}
                                </span>
                              )}
                            </div>

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
                                    onClick={() =>
                                      handleDeleteMessage(message.id)
                                    }
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
                                      onClick={() => handleMessageReaction(message.id, emoji)}
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
                                        onClick={() => handleMessageReaction(message.id, emoji)}
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
                    );
                  })}
                </div>
              )
            )}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={"/images/chat.png"}
                  className="h-8 w-8 rounded-full object-cover"
                  alt="Typing"
                />
                <div className="bg-gray-200 rounded-full px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
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
                    Replying to {replyingTo.senderName}
                  </div>
                  <div className="text-sm text-gray-600 truncate max-w-[300px]">
                    {replyingTo.messageType === "TEXT"
                      ? replyingTo.content
                      : replyingTo.messageType === "IMAGE"
                      ? "📷 Image"
                      : replyingTo.messageType === "FILE"
                      ? `📄 ${replyingTo.content}`
                      : replyingTo.content}
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
                          {isUploading && (
                            <div className="text-blue-500 animate-pulse">
                              Sending...
                            </div>
                          )}
                        </div>
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
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleInputChange(e as any);
                  }}
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
                onMouseDown={() => setIsRecordingVoice(true)}
                onMouseUp={() => setIsRecordingVoice(false)}
                onMouseLeave={() => setIsRecordingVoice(false)}
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
        </div>
      </div>

      {/* Floating scroll to unread button */}
      {showUnreadIndicator && unreadMessages.length > 0 && (
        <div className="absolute bottom-20 right-4">
          <button
            onClick={() => {
              const unreadElement = document.querySelector(
                `[data-message-id="${firstUnreadMessageId}"]`
              );
              if (unreadElement) {
                unreadElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
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
        />
      )}
    </div>
  );
};

export default Chat;
