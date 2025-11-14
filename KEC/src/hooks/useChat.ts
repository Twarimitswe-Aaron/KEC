import { useContext } from 'react';
import { ChatContext, ChatContextType } from '../layouts/Inbox/ChatContext';

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
