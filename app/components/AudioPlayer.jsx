// components/ChatScreen/AudioPlayer.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const AudioPlayer = ({ message, isSentByCurrentUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      
    }
  };

  const handleSeek = (value) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-64 space-y-2">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          
          className=" "
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        <span className="text-sm">
          {formatTime(currentTime)} / {formatTime(message.duration || 0)}
        </span>
      </div>
      <Slider
        value={[currentTime]}
        max={message.duration || 0}
        step={0.1}
        onValueChange={handleSeek}
      
        className="w-full"
      />
     
      <audio ref={audioRef} src={message.content} preload="metadata"/>
    </div>
  );
};

export default AudioPlayer;
