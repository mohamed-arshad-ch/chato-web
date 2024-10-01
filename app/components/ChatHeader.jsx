// components/ChatScreen/ChatHeader.jsx

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ChatHeader = ({ selectedUser }) => {
  if (!selectedUser) return null;

  return (
    <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
      <Avatar>
        <AvatarImage src={selectedUser.user.avatar} alt={selectedUser.user.username} />
        <AvatarFallback>{selectedUser.user.username[0]}</AvatarFallback>
      </Avatar>
      <h2 className="text-xl font-semibold">{selectedUser.user.username}</h2>
    </div>
  );
};

export default ChatHeader;
