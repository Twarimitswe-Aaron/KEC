import React, { useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { BsPeopleFill } from 'react-icons/bs';
import { IoArrowBack } from 'react-icons/io5';
import { useGetUserQuery } from '../../state/api/authApi';
import { useGetAllUsersQuery } from '../../state/api/userApi';
import { useCreateChatMutation } from '../../state/api/chatApi';
import { useChat } from './ChatContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface LeftSideInboxProps {
  onCloseSidebar: () => void;
}


const LeftSideInbox: React.FC<LeftSideInboxProps> = ({ onCloseSidebar }) => {
  const { data: currentUser } = useGetUserQuery();
  const { data: allUsers, isLoading, error } = useGetAllUsersQuery();
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();
  const { setActiveChat } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Get the previous route for back navigation
  const previousRoute = location.state?.from || '/dashboard';

  // Filter users based on search and exclude current user
  const filteredUsers = allUsers?.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = user.name.toLowerCase();
    const matchesSearch = fullName.includes(searchLower) || user.email.toLowerCase().includes(searchLower);
    const isNotCurrentUser = user.id !== currentUser?.id;
    return matchesSearch && isNotCurrentUser;
  }) || [];

  // Handle back navigation
  const handleGoBack = () => {
    navigate(previousRoute);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle user selection to start a chat
  const handleUserSelect = async (user: any) => {
    if (isCreatingChat) return; // Prevent duplicate requests
    
    try {
      // Call the real backend API to create or find existing chat
      const response = await createChat({
        participantIds: [user.id],
        isGroup: false
      });
      
      if ('data' in response && response.data) {
        // Successfully created or found chat
        setActiveChat(response.data as any);
        onCloseSidebar();
      } else if ('error' in response) {
        // Handle API error
        console.error('Failed to create chat:', response.error);
        
        // Show user-friendly error message
        alert('Failed to start chat. Please try again.');
      }
      
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Failed to start chat. Please check your connection and try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Loading Users...</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Fetching users from database...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Error Loading Users</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-sm">Failed to load users from database</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 underline text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Go Back"
          >
            <IoArrowBack size={20} />
          </button>
          <BsPeopleFill className="text-blue-600" size={24} />
          <h1 className="text-xl font-semibold text-gray-800">Select User to Chat</h1>
        </div>
        <span className="text-sm text-gray-500">({filteredUsers.length} users)</span>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No users found matching your search.' : 'No users available.'}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user as any)}
              className={`flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50 ${
                isCreatingChat ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar || '/images/default-avatar.png'}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                  }}
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 truncate">
                    {user.email}
                  </p>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSideInbox;