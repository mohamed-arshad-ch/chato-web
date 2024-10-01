// components/ChatScreen/MessageList.jsx

import React from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, currentUserId }) => {
    console.log("messsages",messages);
    
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isSentByCurrentUser={msg.created_user.id === currentUserId}
         
        />
      ))}
    </div>
  );
};

export default MessageList;
