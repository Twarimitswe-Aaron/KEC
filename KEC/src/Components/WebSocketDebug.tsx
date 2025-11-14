import React from 'react';
import { useChat } from '../layouts/Inbox/ChatContext';

export const WebSocketDebug: React.FC = () => {
  const { isConnected, onlineUsers, typingUsers } = useChat();

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-xs z-50">
      <div className="flex items-center gap-2 mb-1">
        <div 
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
        />
        <span>{isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}</span>
      </div>
      <div>Online Users: {onlineUsers.length}</div>
      <div>Typing Users: {typingUsers.length}</div>
    </div>
  );
};
