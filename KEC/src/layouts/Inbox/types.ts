export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  time: string;
  timestamp: number;
  type: 'text' | 'image' | 'file' | 'link';
  image?: string;
  file?: {
    name: string;
    url: string;
    type: string;
    size: number;
  };
  isRead?: boolean;
  isDelivered?: boolean;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  currentUser: User;
  setActiveChat: (chat: Chat) => void;
  sendMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  markAsRead: (chatId: string, messageId: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
}

export type FilterType = 'All' | 'Unread' | 'Favorites' | 'Contacts' | 'Non-contacts' | 'Groups' | 'Drafts';
