// components/ChatScreen/UserList.jsx

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic } from 'lucide-react';

const UserList = ({ users, onUserClick }) => {

  
console.log( users);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };
  return (
    <div>
      {users.map((userItem) => (
        <div
          key={userItem.user.id}
          className="flex items-center space-x-4 p-4 hover:bg-gray-100 cursor-pointer"
          onClick={() => onUserClick(userItem)}
        >
          <Avatar>
            <AvatarImage src={userItem.user.avatar || "/placeholder.svg"} alt={userItem.user.username} />
            <AvatarFallback>{userItem.user.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{userItem.user.username}</p>
           
              {userItem.lastMessage?.duration !=null ? <p className='flex text-sm text-gray-500 truncate'><Mic className="h-6 w-6" /> {formatTime(userItem.lastMessage?.duration)}</p> : userItem.lastMessage?.content}
           
          </div>
          {userItem.unreadCount > 0 && (
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-xs">
              {userItem.unreadCount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserList;
