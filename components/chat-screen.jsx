"use client";
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import {
  Plus,
  Send,
  Image as ImageIcon,
  Smile,
  MessageSquarePlus,
  Search,
  Check,
  Mic,
  Play,
  Pause,
  DollarSign,
} from "lucide-react";

const initialUsers = [
  { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Jane Smith", lastMessage: "Can we meet tomorrow?", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Bob Johnson", lastMessage: "Thanks for your help!", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, name: "Alice Brown", lastMessage: "See you later!", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, name: "Charlie Davis", lastMessage: "Don't forget about our meeting", avatar: "/placeholder.svg?height=40&width=40" },
]

const initialMessages = [
  { id: 1, senderId: 1, type: "text", content: "Hey, how are you?", timestamp: new Date(Date.now() - 1000 * 60 * 5), status: "read" },
  { id: 2, senderId: 0, type: "text", content: "I'm good, thanks! How about you?", timestamp: new Date(Date.now() - 1000 * 60 * 4), status: "read" },
  { id: 3, senderId: 1, type: "image", content: "/placeholder.svg?height=200&width=300", timestamp: new Date(Date.now() - 1000 * 60 * 3), status: "read" },
  { id: 4, senderId: 0, type: "text", content: "Nice picture! Here's a voice message.", timestamp: new Date(Date.now() - 1000 * 60 * 2), status: "delivered" },
  { id: 5, senderId: 0, type: "voice", content: "voice-message-1.mp3", timestamp: new Date(Date.now() - 1000 * 60 * 1), status: "sent", isPaid: false, duration: 15 },
]

export function ChatScreenComponent() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const messagesEndRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    setUsers(initialUsers)
    setMessages(initialMessages)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime)
      audio.addEventListener('timeupdate', updateTime)
      return () => audio.removeEventListener('timeupdate', updateTime);
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        senderId: 0,
        type: "text",
        content: message,
        timestamp: new Date(),
        status: "sent",
      }
      setMessages([...messages, newMessage])
      setMessage("")

      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg))
      }, 1000)

      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: "read" } : msg))
      }, 2000)
    }
  }

  const handleStartNewChat = () => {
    if (selectedUser) {
      console.log("Starting new chat with:", selectedUser.name)
      setIsNewChatOpen(false)
      setSelectedUser(null)
      setSearchQuery("")
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newMessage = {
          id: messages.length + 1,
          senderId: 0,
          type: "image",
          content: e.target?.result,
          timestamp: new Date(),
          status: "sent",
        }
        setMessages([...messages, newMessage])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording)
    // Implement actual voice recording logic here
    if (isRecording) {
      const newMessage = {
        id: messages.length + 1,
        senderId: 0,
        type: "voice",
        content: "voice-message-" + (messages.length + 1) + ".mp3",
        timestamp: new Date(),
        status: "sent",
        isPaid: false,
        duration: 10, // Example duration
      }
      setMessages([...messages, newMessage])
    }
  }

  const handlePlayVoice = (messageId) => {
    if (isPlaying === messageId) {
      audioRef.current?.pause()
      setIsPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = "/path/to/voice/messages/" + messages.find(m => m.id === messageId)?.content
        audioRef.current.play()
        setIsPlaying(messageId)
      }
    }
  }

  const handlePayVoice = (messageId) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, isPaid: true } : msg))
  }

  const handleSeek = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const MessageStatus = ({
    status
  }) => {
    if (status === "sent") {
      return <Check className="h-4 w-4 text-gray-400" />;
    } else if (status === "delivered") {
      return (
        (<div className="flex">
          <Check className="h-4 w-4 text-gray-400" />
          <Check className="h-4 w-4 text-gray-400 -ml-3" />
        </div>)
      );
    } else if (status === "read") {
      return (
        (<div className="flex">
          <Check className="h-4 w-4 text-blue-500" />
          <Check className="h-4 w-4 text-blue-500 -ml-3" />
        </div>)
      );
    }
    return null
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    (<div className="flex h-screen bg-gray-100">
      {/* Left sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        <div
          className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chats</h2>
          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
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
                    onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <ScrollArea className="h-[300px]">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => setSelectedUser(user)}>
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <Button onClick={handleStartNewChat} disabled={!selectedUser}>
                  Start Chat
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="h-[calc(100vh-73px)]">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-4 p-4 hover:bg-gray-100 cursor-pointer"
              onClick={() => setSelectedUser(user)}>
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser && (
          <div
            className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
              <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
          </div>
        )}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === 0 ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.senderId === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                  {msg.type === "text" && <p>{msg.content}</p>}
                  {msg.type === "image" && (
                    <img src={msg.content} alt="Sent image" className="max-w-full rounded" />
                  )}
                  {msg.type === "voice" && (
                    <div className="w-64 space-y-2">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlayVoice(msg.id)}
                          disabled={!msg.isPaid && msg.senderId !== 0}
                          className="text-white hover:text-gray-200">
                          {isPlaying === msg.id ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>
                        <span className="text-sm">
                          {isPlaying === msg.id
                            ? `${formatTime(currentTime)} / ${formatTime(msg.duration || 0)}`
                            : formatTime(msg.duration || 0)}
                        </span>
                      </div>
                      <Slider
                        value={[isPlaying === msg.id ? currentTime : 0]}
                        max={msg.duration}
                        step={0.1}
                        onValueChange={handleSeek}
                        disabled={!msg.isPaid && msg.senderId !== 0}
                        className="w-full" />
                      {!msg.isPaid && msg.senderId !== 0 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePayVoice(msg.id)}
                          className="w-full mt-2">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pay to Listen
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-1">
                    <p
                      className={`text-xs ${
                        msg.senderId === 0 ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.senderId === 0 && (
                      <div className="ml-2">
                        <MessageStatus status={msg.status} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                  <Plus className="h-6 w-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="flex justify-around">
                  <label htmlFor="image-upload">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-gray-700"
                      as="span">
                      <ImageIcon className="h-6 w-6" />
                    </Button>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={handleVoiceRecording}>
                    <Mic className="h-6 w-6" />
                  </Button>
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
              }} />
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
              onClick={handleSendMessage}>
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      <audio ref={audioRef} onEnded={() => setIsPlaying(null)} />
    </div>)
  );
}