import React from 'react';
import { useChat } from '../layouts/Inbox/ChatContext';

export const ChatConnectionStatus: React.FC = () => {
  const { isConnected } = useChat();

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
};
