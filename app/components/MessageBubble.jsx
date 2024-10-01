// components/ChatScreen/MessageBubble.jsx

import React from 'react';
import { Check, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioPlayer from './AudioPlayer';

const MessageBubble = ({ message, isSentByCurrentUser }) => {
  return (
    <div className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isSentByCurrentUser
            ? 'bg-gray-200 text-gray-900'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        {message.data_type === 'voice' ? (
          <AudioPlayer message={message} isSentByCurrentUser={isSentByCurrentUser}  />
        ) : message.data_type === 'image' ? (
          <img src={message.content} alt="Sent image" className="max-w-full rounded" />
        ) : (
          <p>{message.content}</p>
        )}
        <div className="flex items-center justify-between">
          <p
            className={`text-xs mt-1 ${
              isSentByCurrentUser ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {isSentByCurrentUser && (
            <div className="text-xs mt-1">
              {message.isRead ? (
                <div className="flex">
                  <Check className="h-4 w-4 text-blue-500" />
                  <Check className="h-4 w-4 text-blue-500 -ml-3" />
                </div>
              ) : (
                <div className="flex">
                  <Check className="h-4 w-4 text-gray-400" />
                  <Check className="h-4 w-4 text-gray-400 -ml-3" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
