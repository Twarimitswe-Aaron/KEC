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

// Removed Chat and ChatContextType interfaces to avoid conflicts with chatApi.ts
// Use the interfaces from ../../state/api/chatApi.ts instead

export type FilterType = 'All' | 'Unread' | 'Favorites' | 'Contacts' | 'Non-contacts' | 'Groups' | 'Drafts';
