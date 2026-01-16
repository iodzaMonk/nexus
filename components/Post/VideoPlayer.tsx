"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  isActive?: boolean;
  className?: string;
}

export default function VideoPlayer({
  src,
  isActive,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Default to false, let events update it
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (isActive ?? true) {
      const playPromise = videoRef.current?.play();
      // Handle play promise rejection silently or log it
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented
        });
      }
    } else {
      videoRef.current?.pause();
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling play
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className="relative w-full h-full group bg-black cursor-pointer"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        className={cn("w-full h-full object-contain", className)}
        loop
        muted={isMuted} /* React controls muted prop */
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Play/Pause Overlay Icon (shows briefly or when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}
