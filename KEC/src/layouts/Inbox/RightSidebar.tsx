import React from 'react';
import { useChat } from './ChatContext';

const RightSidebar = () => {
  const { activeChat, messages } = useChat();

  // Filter messages for files and images
  const sharedFiles = messages.filter(msg => msg.messageType === 'file' || msg.messageType === 'image');
  const sharedPhotos = messages.filter(msg => msg.messageType === 'image');
  const sharedDocuments = messages.filter(msg => msg.messageType === 'file');

  if (!activeChat) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">Select a chat to view shared files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Shared Content</h3>
        <span className="text-xs text-gray-500">
          {sharedFiles.length} items
        </span>
      </div>
      
      {/* Shared Photos */}
      {sharedPhotos.length > 0 ? (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Photos ({sharedPhotos.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {sharedPhotos.slice(0, 6).map((message) => (
              <div key={message.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={message.fileUrl || '/images/default-image.png'} 
                  alt={message.fileName || 'Shared photo'}
                  className="w-full h-full object-cover hover:opacity-80 cursor-pointer"
                  onClick={() => window.open(message.fileUrl, '_blank')}
                />
              </div>
            ))}
          </div>
          {sharedPhotos.length > 6 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              +{sharedPhotos.length - 6} more photos
            </p>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Photos</h4>
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No photos shared yet</p>
          </div>
        </div>
      )}

      {/* Shared Files */}
      {sharedDocuments.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Documents ({sharedDocuments.length})
          </h4>
          <div className="space-y-2">
            {sharedDocuments.slice(0, 5).map((message) => (
              <div 
                key={message.id} 
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => window.open(message.fileUrl, '_blank')}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {message.fileName || 'Unknown file'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'} • {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {sharedDocuments.length > 5 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              +{sharedDocuments.length - 5} more files
            </p>
          )}
        </div>
      ) : (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Documents</h4>
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No documents shared yet</p>
          </div>
        </div>
      )}

      {/* Chat Info */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Chat Info</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Participants: {activeChat.participants?.length || 0}</p>
          <p>Created: {new Date(activeChat.createdAt || Date.now()).toLocaleDateString()}</p>
          {activeChat.isGroup && (
            <p>Group Chat: {activeChat.name}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
