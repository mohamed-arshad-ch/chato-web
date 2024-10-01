// components/ChatScreen/NewChatDialog.jsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageSquarePlus } from 'lucide-react';

const NewChatDialog = ({ isOpen, onOpenChange, allUsers, searchQuery, setSearchQuery, onUserSelect }) => {
  const filteredUsers = allUsers.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <MessageSquarePlus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[300px]">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => onUserSelect(u)}
              >
                <Avatar>
                  <AvatarImage src={u.avatar || "/placeholder.svg"} alt={u.username} />
                  <AvatarFallback>{u.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{u.username}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
          <Button onClick={() => onUserSelect(null)} disabled={!allUsers.length}>
            Start Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;
