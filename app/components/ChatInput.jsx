// components/ChatScreen/ChatInput.jsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Image as ImageIcon, Send, Smile, Mic,Plus,StopCircle } from 'lucide-react';

const ChatInput = ({
  message,
  setMessage,
  handleSendMessage,
 
  isRecording,
 
  handleImageUpload,
  handleVoiceRecording,
  startRecording,
  stopRecording,
  recordingDuration
}) => {

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }


  return (
    <div className="flex items-center space-x-2">
       {isRecording ? (
              <div className="flex-1 flex items-center space-x-2 bg-red-100 p-2 rounded-md">
                <StopCircle className="h-6 w-6 text-red-500 animate-pulse" />
                <span className="text-red-500 font-medium">Recording: {formatTime(recordingDuration)}</span>
                <Button variant="destructive" size="sm" onClick={stopRecording}>
                  Stop
                </Button>
              </div>
            ) : (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                      <Plus className="h-6 w-6" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <div className="flex justify-around">
                      <label htmlFor="image-upload">
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700" as="span">
                          <ImageIcon className="h-6 w-6" />
                        </Button>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                        <Smile className="h-6 w-6" />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Input
                  type="text"
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage()
                    }
                  }}
                />
                {message.trim() ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={handleSendMessage}
                  >
                    <Send className="h-6 w-6" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={handleVoiceRecording}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                  >
                    <Mic className="h-6 w-6" />
                  </Button>
                )}
              </>
            )}
    </div>
  );
};

export default ChatInput;
