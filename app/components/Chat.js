// components/ChatScreen/ChatScreen.jsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus,Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserList from "./UserList";
import NewChatDialog from "./NewChatDialog";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob,setRecordedBlob] = useState(null)
    const [isChatOpen,setIsChatOpen] = useState(false)
  const [audioChunks, setAudioChunks] = useState([]);

  const [currentTime, setCurrentTime] = useState(0)
  const [recordingDuration, setRecordingDuration] = useState(0)
 
  let mediaRecorder = useRef(null);
  


  let mediaStream = useRef(null);
 
  let chunks = useRef([]);


  const audioRef = useRef(null)
  const recordingTimerRef = useRef(null)
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user =
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  const [socket, setSocket] = useState(null);

  // State to track the current room ID
  const [currentRoomId, setCurrentRoomId] = useState(null);

  // Function to generate conversation room IDs
  const getConversationRoomId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `conversation_${sortedIds[0]}_${sortedIds[1]}`;
  };

  // Fetch all users for starting a new chat
  const [allUsers, setAllUsers] = useState([]);


  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime)
      audio.addEventListener('timeupdate', updateTime)
      return () => audio.removeEventListener('timeupdate', updateTime)
    }
  }, [])

  const handleVoiceRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }
  const startRecording = async () => {
    if (isRecording) return; // Prevent multiple recordings


    setRecordedBlob(null)
    setIsRecording(true);

    setRecordingDuration(0);
    setAudioChunks([]); // Reset previous chunks
    try {
        const stream = await navigator.mediaDevices.getUserMedia(
          { audio: true }
        );
        mediaStream.current = stream;
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.current.push(e.data);
          }
        };
        mediaRecorder.current.onstop = () => {
          const recordedBlob = new Blob(
            chunks.current, { type: 'audio/webm' }
          );
         
          setRecordedBlob(recordedBlob)
             // Upload the audioBlob to the server
      

     
         
          chunks.current = [];
        };
        mediaRecorder.current.start();

         // Start the recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Microphone access denied or unavailable.');
        setIsRecording(false);
        console.error('Error accessing microphone:', error);
      }
 
  };

  const stopRecording = () => {
    if (!isRecording) return;

    setIsRecording(false);
   

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
        
      }
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => {
          track.stop();
        });
      }


      
    
  };

  useEffect(()=>{
  
  

   if(recordedBlob !=null){
    const formData = new FormData();
    formData.append('file', recordedBlob, 'voice-message.webm'); // Adjust field name as per your backend
    formData.append('received_user', selectedUser.user.id); // Include the receiver's ID
    formData.append('duration', recordingDuration); // Include the receiver's ID

    fetch('http://localhost:1337/api/messages/voice', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: Do not set 'Content-Type' header when sending FormData
      },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to upload voice message');
        return res.json();
      })
      .then((data) => {
      
        setMessages([...messages, data]);
        // The message will be received via Socket.IO and added to the chat
      })
      .catch((err) => console.error('Error uploading voice message:', err));
   }

  },[recordedBlob])

  useEffect(() => {
    
    
    if (isNewChatOpen) {
      fetch("http://localhost:1337/api/messages/all-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          // Exclude the current user from the list
          const otherUsers = data.filter((u) => u.id !== user.id);
          setAllUsers(otherUsers);
        })
        .catch((err) => console.error(err));
    }
  }, [isNewChatOpen, token, user.id]);

  // Initialize Socket.IO and fetch users
  useEffect(() => {
    if (!token) {
      router.push("/");
    } else {
      // Initialize Socket.IO client
      const socketInstance = io("http://localhost:1337", {
        auth: {
          token: token,
        },
      });
      setSocket(socketInstance);

      socketInstance.emit("join_user_room", `user_${user.id}`);

      // Fetch the list of chatted users
      fetch("http://localhost:1337/api/messages/chat-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          // Ensure that each user item includes lastMessage and unreadCount
          const usersWithLastMessage = data.map((userItem) => ({
            ...userItem,
            lastMessage: userItem.lastMessage || {
              content: "",
              duration:userItem.duration,
              createdAt: new Date().toISOString(),
            },
            unreadCount: userItem.unreadCount || 0,
          }));
          setUsers(usersWithLastMessage);
        })
        .catch((err) => console.error(err));

      return () => {
        // Disconnect socket on component unmount
        socketInstance.disconnect();
      };
    }
  }, [token, router, user.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle incoming messages
  useEffect(() => {
    if (socket) {
      const handleMessage = (newMessage) => {
        const senderId = newMessage.created_user.id;
        const receiverId = newMessage.received_user.id;

        // Check if the message is for the current conversation
        if (
          selectedUser &&
          ((senderId === user.id && receiverId === selectedUser.user.id) ||
            (senderId === selectedUser.user.id && receiverId === user.id))
        ) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          scrollToBottom();
        } else {
          // Update unread counts for other conversations
          setUsers((prevUsers) => {
            const otherUserId = senderId === user.id ? receiverId : senderId;
            const userExists = prevUsers.some((userItem) => userItem.user.id === otherUserId);
            if (userExists) {
              return prevUsers.map((userItem) => {
                if (userItem.user.id === otherUserId) {
                  let newUnreadCount = userItem.unreadCount || 0;
                  newUnreadCount += 1;
                  return {
                    ...userItem,
                    lastMessage: {
                      content: newMessage.content,
                      duration:newMessage.duration || null,
                      createdAt: newMessage.createdAt,
                    },
                    unreadCount: newUnreadCount,
                  };
                }
                return userItem;
              });
            } else {
              // Add the new user to the list
              const newUserItem = {
                user:
                  newMessage.created_user.id === user.id
                    ? newMessage.received_user
                    : newMessage.created_user,
                lastMessage: {
                  content: newMessage.content,
                  createdAt: newMessage.createdAt,
                },
                unreadCount: 1,
              };
              return [newUserItem, ...prevUsers];
            }
          });
        }
      };

      socket.on("new_message", handleMessage);

      // Handle message read event (sender side)
      socket.on("messages_read", (data) => {
        const { userId } = data;
        // Update messages to show they are read
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.created_user.id === user.id && msg.received_user.id === userId
              ? { ...msg, isRead: true }
              : msg
          )
        );
      });

      return () => {
        socket.off("new_message", handleMessage);
        socket.off("messages_read");
      };
    }
  }, [socket, selectedUser, user.id]);


  





  



  const handleSendMessage = () => {
    if (message.trim() && selectedUser) {
      const newMessage = {
        received_user: selectedUser.user.id,
        content: message,
      };

      fetch("http://localhost:1337/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMessage),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to send message");
          return res.json();
        })
        .then((data) => {
          // Message will be added via the real-time event
          setMessage("");

          // Optimistically update the users state
          setUsers((prevUsers) => {
            const userExists = prevUsers.some(
              (userItem) => userItem.user.id === selectedUser.user.id
            );
            if (userExists) {
              return prevUsers.map((userItem) => {
                if (userItem.user.id === selectedUser.user.id) {
                  return {
                    ...userItem,
                    lastMessage: {
                      content: data.content,
                      duration:data.duration || null,
                      createdAt: data.createdAt,
                    },
                  };
                }
                return userItem;
              });
            } else {
              // Add the new user to the list
              return [
                {
                  user: selectedUser.user,
                  lastMessage: {
                    content: data.content,
                    duration:data.duration || null,
                    createdAt: data.createdAt,
                  },
                  unreadCount: 0,
                },
                ...prevUsers,
              ];
            }
          });
        })
        .catch((err) => console.error(err));
    }
  };

  const handleUserClick = (userItem) => {
    setIsChatOpen(true)
    // Leave previous room if any
    if (currentRoomId && socket) {
      socket.emit("leave_room", currentRoomId);
    }

    setSelectedUser(userItem);

    // Join new room
    const roomId = getConversationRoomId(user.id, userItem.user.id);
    setCurrentRoomId(roomId);

    if (socket) {
      socket.emit("join_room", roomId);
    }

    // Fetch messages with the selected user
    fetch(`http://localhost:1337/api/messages/to/${userItem.user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.data || []); // Ensure messages is an array
        scrollToBottom();

        // Mark messages as read
        fetch("http://localhost:1337/api/messages/mark-as-read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId: userItem.user.id }),
        })
          .then(() => {
            // Emit a 'messages_read' event via Socket.IO to notify the sender in real-time
            if (socket) {
              socket.emit("messages_read", {
                userId: userItem.user.id,
              });
            }

            // Update message statuses in the frontend
            setMessages((prevMessages) =>
              prevMessages.map((msg) => {
                if (msg.created_user.id === userItem.user.id) {
                  return { ...msg, isRead: true };
                }
                return msg;
              })
            );

            // Reset unread count in users list
            setUsers((prevUsers) =>
              prevUsers.map((u) => {
                if (u.user.id === userItem.user.id) {
                  return { ...u, unreadCount: 0 };
                }
                return u;
              })
            );
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  };


 

  const handleNewChatUserClick = (u) => {
    // Create a userItem for consistency
    const userItem = {
      user: {
        id: u.id,
        username: u.username,
        avatar: u.avatar || "/placeholder.svg", // Ensure avatar is provided
      },
      lastMessage: {
        content: "",
        duration:null,
        createdAt: new Date().toISOString(),
      },
      unreadCount: 0,
    };

    // Close the dialog
    setIsNewChatOpen(false);
    setSearchQuery("");

    // Add the selected user to the users list if not already present
    setUsers((prevUsers) => {
      const userExists = prevUsers.some((item) => item.user.id === userItem.user.id);
      if (!userExists) {
        return [userItem, ...prevUsers];
      }
      return prevUsers;
    });

    // Set as selected user
    handleUserClick(userItem);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && selectedUser) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result;

        // Send image message
        const newMessage = {
          received_user: selectedUser.user.id,
          content: imageData, // You might want to handle image uploads differently
          data_type: 'image', // Assuming your backend differentiates message types
        };

        fetch("http://localhost:1337/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newMessage),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to send image message");
            return res.json();
          })
          .then((data) => {
            // Image message will be added via the real-time event
          })
          .catch((err) => console.error(err));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chats</h2>
          <NewChatDialog
            isOpen={isNewChatOpen}
            onOpenChange={setIsNewChatOpen}
            allUsers={allUsers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onUserSelect={handleNewChatUserClick}
          />
        </div>
        <ScrollArea className="h-[calc(100vh-73px)]">
          <UserList users={users} onUserClick={handleUserClick} />
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader selectedUser={selectedUser} />
        <ScrollArea className="flex-1 p-4">
          <MessageList
            messages={messages}
            currentUserId={user.id}
            
          />
          <div ref={messagesEndRef} />
        </ScrollArea>
        <div className="p-4 border-t border-gray-200 bg-white">
          <ChatInput
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
          
            isRecording={isRecording}
          
            handleImageUpload={handleImageUpload}
            handleVoiceRecording={handleVoiceRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            recordingDuration={recordingDuration}
          />
        </div>
      </div>
    
    </div>
  );
};

export default ChatScreen;
