import React, { useState, useRef, useEffect, useCallback } from "react";

import { MdOutlinePhoneInTalk } from "react-icons/md";
import { FiSend } from "react-icons/fi";
import { GoDeviceCameraVideo } from "react-icons/go";
import { GoPaperclip } from "react-icons/go";
import { BsEmojiSmile } from "react-icons/bs";
import { MdInfoOutline } from "react-icons/md";
import { CiMenuKebab } from "react-icons/ci";
import { BsReply, BsThreeDots } from "react-icons/bs";
import { MdClose, MdCheck, MdDoneAll, MdSchedule, MdMic, MdMicOff } from "react-icons/md";
import { useChat } from './ChatContext';
import { Message, useUploadChatFileMutation } from '../../state/api/chatApi';

interface ChatProps {
  onToggleRightSidebar: () => void;
}

interface ReplyingToMessage {
  id: number;
  content: string;
  senderName: string;
  messageType: string;
}

interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

const Chat: React.FC<ChatProps> = ({ onToggleRightSidebar }) => {
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
    isConnected 
  } = useChat();
  
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<ReplyingToMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMainEmojiPicker, setShowMainEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // File upload mutation
  const [uploadFile] = useUploadChatFileMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WhatsApp/Instagram style time formatting
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(dateString);
    const timeString = date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (messageDate.toDateString() === today.toDateString()) {
      return timeString; // "2:30 PM"
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeString}`; // "Yesterday 2:30 PM"
    } else {
      const diffInDays = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffInDays < 7) {
        return `${messageDate.toLocaleDateString([], { weekday: 'short' })} ${timeString}`; // "Mon 2:30 PM"
      } else {
        return `${messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeString}`; // "Nov 10 2:30 PM"
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
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const diffInDays = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffInDays < 7) {
        return messageDate.toLocaleDateString([], { weekday: 'long' });
      } else {
        return messageDate.toLocaleDateString([], { 
          weekday: 'long',
          month: 'long', 
          day: 'numeric',
          year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    }
  };

  // Group messages by date with consecutive message grouping
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = formatDateSeparator(message.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };
  
  // Check if messages should be grouped (same sender, within 5 minutes)
  const shouldGroupMessage = (currentMsg: Message, prevMsg: Message | null): boolean => {
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
    return messages.filter(msg => msg.senderId !== currentUser.id && !msg.isRead).length;
  };
  
  // Common emoji reactions
  const commonReactions = ['❤️', '😂', '😮', '😢', '😠', '👍', '👎', '🔥'];
  
  // Main emoji picker emojis
  const mainEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
    '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
    '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
    '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
    '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
    '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👂',
    '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅'
  ];
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  const handleSendMessage = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (newMessage.trim() && activeChat) {
      const messageContent = newMessage.trim();
      const success = await sendMessage(messageContent);
      if (success) {
        setNewMessage("");
        setReplyingTo(null);
        setIsTyping(false);
      }
    }
  };
  
  // Handle message reactions
  const handleReaction = useCallback(async (messageId: number, emoji: string) => {
    // TODO: Implement reaction API call
    console.log(`React to message ${messageId} with ${emoji}`);
    setShowEmojiPicker(null);
  }, []);
  
  // Handle emoji selection for message input
  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowMainEmojiPicker(false);
  }, []);
  
  // Handle message reply
  const handleReply = useCallback((message: Message) => {
    const senderName = message.senderId === currentUser?.id 
      ? 'You' 
      : `${message.sender?.firstName} ${message.sender?.lastName}`;
      
    setReplyingTo({
      id: message.id,
      content: message.content || message.fileName || 'Media',
      senderName,
      messageType: message.messageType
    });
    setSelectedMessage(null);
  }, [currentUser]);
  
  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !activeChat) return;
    
    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Upload file first
        const uploadResult = await uploadFile({
          file,
          chatId: activeChat.id
        }).unwrap();
        
        // Determine message type based on file type
        let messageType: 'IMAGE' | 'FILE' = 'FILE';
        if (file.type.startsWith('image/')) {
          messageType = 'IMAGE';
        }
        
        // Send message with file info
        await sendMessage('', messageType, {
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          fileMimeType: uploadResult.mimeType
        });
      }
    } catch (error) {
      console.error('File upload failed:', error);
      // You might want to show a toast notification here
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [activeChat, uploadFile, sendMessage]);
  
  // Handle long press for message options
  const handleMouseDown = useCallback((messageId: number) => {
    const timer = setTimeout(() => {
      setSelectedMessage(messageId);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  }, []);
  
  const handleMouseUp = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);
  
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
    if (!activeChat) return null;
    
    if (activeChat.isGroup) {
      return {
        name: activeChat.name || 'Group Chat',
        avatar: activeChat.groupAvatar,
        isOnline: false,
        lastSeen: 'Group'
      };
    }
    
    const participant = activeChat.participants.find(p => p.user.id !== currentUser?.id);
    if (participant) {
      return {
        name: `${participant.user.firstName} ${participant.user.lastName}`,
        avatar: participant.user.profile?.avatar,
        isOnline: onlineUsers.includes(participant.user.id),
        lastSeen: participant.user.isOnline ? 'Online' : participant.user.lastSeen || 'Last seen recently'
      };
    }
    
    return null;
  };

  const participant = getChatParticipant();

  // Show loading state if no active chat
  if (!activeChat) {
    return (
      <div className="flex w-full flex-col h-full bg-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
            <p className="text-sm">Choose from your existing conversations or start a new one</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white text-black border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={participant?.avatar || '/images/chat.png'}
              alt={participant?.name || 'Chat'}
              className="w-10 h-10 rounded-full object-cover"
            />
            {participant?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{participant?.name || 'Unknown'}</h3>
              {getUnreadCount() > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {getUnreadCount()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {typingUsers.length > 0 ? (
                <span className="text-blue-500">Typing...</span>
              ) : (
                <span>{participant?.lastSeen}</span>
              )}
              {!isConnected && (
                <span className="text-red-500">• Offline</span>
              )}
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
      <div className="flex-1 p-4 overflow-y-auto bg-white space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          <>
            {Object.entries(groupMessagesByDate()).map(([dateKey, dayMessages]) => (
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
                  const prevMessage = index > 0 ? dayMessages[index - 1] : null;
                  const isGrouped = shouldGroupMessage(message, prevMessage);
                  const showAvatar = !isCurrentUser && !isGrouped;
                  
                  return (
                    <div key={message.id} className="relative">
                      {/* Message container */}
                      <div
                        className={`flex items-end gap-2 mb-1 ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        } ${isUnread ? 'bg-blue-50/30 -mx-4 px-4 py-2 rounded-lg' : ''} ${
                          isGrouped ? 'mb-0.5' : 'mb-2'
                        }`}
                        onMouseDown={() => handleMouseDown(message.id)}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {/* Avatar space */}
                        <div className={`w-8 ${!isCurrentUser ? 'block' : 'hidden'}`}>
                          {showAvatar && (
                            <div className="relative">
                              <img
                                src={message.sender?.profile?.avatar || '/images/chat.png'}
                                className="h-8 w-8 rounded-full object-cover"
                                alt={`${message.sender?.firstName} Avatar`}
                              />
                              {isUnread && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Message content */}
                        <div className={`max-w-[75%] relative group`}>
                          {/* Reply indicator */}
                          {message.replyToId && (
                            <div className={`mb-2 p-2 border-l-4 rounded-r-lg text-xs ${
                              isCurrentUser 
                                ? 'border-blue-300 bg-blue-50/50' 
                                : 'border-gray-300 bg-gray-50'
                            }`}>
                              <div className="text-gray-600 font-medium mb-1">
                                Replying to {message.replyToId === currentUser?.id ? 'yourself' : 'them'}
                              </div>
                              <div className="text-gray-500 truncate">
                                {/* Reply content would come from API */}
                                Original message content...
                              </div>
                            </div>
                          )}

                          {/* Main message bubble */}
                          <div
                            className={`inline-block px-4 py-2 rounded-2xl relative ${
                              isCurrentUser
                                ? "bg-blue-500 text-white rounded-br-md"
                                : isUnread 
                                  ? "bg-white border border-blue-200 text-gray-900 shadow-md rounded-bl-md"
                                  : "bg-white border border-gray-200 text-gray-900 shadow-sm rounded-bl-md"
                            } ${isGrouped && isCurrentUser ? 'rounded-br-2xl' : ''} ${
                              isGrouped && !isCurrentUser ? 'rounded-bl-2xl' : ''
                            }`}
                          >
                            {/* Message content */}
                            {message.messageType === "TEXT" && (
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                            )}
                            {message.messageType === "IMAGE" && (
                              <div className="relative">
                                <img
                                  src={message.fileUrl}
                                  alt="Shared image"
                                  className="max-w-[280px] max-h-[300px] rounded-lg object-cover cursor-pointer hover:opacity-95"
                                  onClick={() => window.open(message.fileUrl, '_blank')}
                                />
                              </div>
                            )}
                            {message.messageType === "FILE" && (
                              <div className="flex items-center gap-3 p-2 min-w-[200px]">
                                <div className="p-2 bg-gray-100 rounded-full">
                                  <GoPaperclip className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm truncate">{message.fileName}</div>
                                  <div className="text-xs text-gray-500">
                                    {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB` : 'File'}
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
                                  isCurrentUser ? "text-blue-100" : "text-blue-600"
                                }`}
                              >
                                {message.content}
                              </a>
                            )}

                            {/* Message reactions */}
                            {/* TODO: Display actual reactions from API */}
                            <div className="flex gap-1 mt-1">
                              {/* Example reactions - replace with actual data */}
                            </div>
                          </div>

                          {/* Time and status */}
                          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                            isCurrentUser ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-xs">{formatTime(message.createdAt)}</span>
                            {isCurrentUser && (
                              <span className="ml-1">
                                {getMessageStatusIcon(message)}
                              </span>
                            )}
                          </div>

                          {/* Hover actions */}
                          <div className={`absolute top-0 ${
                            isCurrentUser ? '-left-20' : '-right-20'
                          } opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white shadow-lg rounded-full p-1`}>
                            <button
                              onClick={() => handleReply(message)}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <BsReply className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <BsEmojiSmile className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <BsThreeDots className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>

                          {/* Emoji picker */}
                          {showEmojiPicker === message.id && (
                            <div className={`absolute z-50 mt-2 ${
                              isCurrentUser ? 'right-0' : 'left-0'
                            } bg-white border border-gray-200 rounded-lg shadow-lg p-2`}>
                              <div className="flex gap-1">
                                {commonReactions.map((emoji, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleReaction(message.id, emoji)}
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
                            <div className={`absolute z-50 mt-2 ${
                              isCurrentUser ? 'right-0' : 'left-0'
                            } bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]`}>
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
                              {isCurrentUser && (
                                <button
                                  onClick={() => {
                                    // TODO: Implement delete
                                    setSelectedMessage(null);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm text-red-600"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Current user avatar */}
                        <div className={`w-8 ${isCurrentUser ? 'block' : 'hidden'}`}>
                          {showAvatar && isCurrentUser && (
                            <img
                              src={currentUser?.profile?.avatar || '/images/user-avatar.png'}
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
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={'/images/chat.png'}
                  className="h-8 w-8 rounded-full object-cover"
                  alt="Typing"
                />
                <div className="bg-gray-200 rounded-full px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                    {replyingTo.messageType === 'TEXT' 
                      ? replyingTo.content 
                      : replyingTo.messageType === 'IMAGE' 
                        ? '📷 Image' 
                        : replyingTo.messageType === 'FILE'
                          ? `📄 ${replyingTo.content}`
                          : replyingTo.content
                    }
                  </div>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <MdClose className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-end gap-3">
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
              className={`p-3 rounded-full transition-all duration-200 ${
                isUploading 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
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
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  disabled={!isConnected}
                  rows={1}
                  className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none max-h-32 disabled:bg-gray-50"
                  style={{ 
                    minHeight: '48px',
                    height: 'auto'
                  }}
                />

                {/* Emoji button */}
                <button 
                  onClick={() => setShowMainEmojiPicker(!showMainEmojiPicker)}
                  className={`p-3 transition-colors ${
                    showMainEmojiPicker ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <BsEmojiSmile className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Voice/Send button */}
            {newMessage.trim() ? (
              <button
                onClick={handleSendMessage}
                disabled={!isConnected}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <FiSend className="h-5 w-5" />
              </button>
            ) : (
              <button
                onMouseDown={() => setIsRecordingVoice(true)}
                onMouseUp={() => setIsRecordingVoice(false)}
                onMouseLeave={() => setIsRecordingVoice(false)}
                className={`p-3 rounded-full transition-all duration-200 transform ${
                  isRecordingVoice 
                    ? 'bg-red-500 text-white scale-105' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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
                <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              </div>
              <span className="text-sm font-medium">Recording... Release to send</span>
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
              📎 Uploading file(s)...
            </div>
          )}
        </div>
      </div>
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