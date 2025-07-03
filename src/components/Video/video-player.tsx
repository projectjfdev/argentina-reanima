"use client";

import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/libs/utils";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const CustomSlider = ({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) => (
  <motion.div
    className={cn(
      "relative w-full h-1 bg-white/20 rounded-full cursor-pointer",
      className
    )}
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      onChange(Math.min(Math.max(percentage, 0), 100));
    }}
  >
    <motion.div
      className="absolute top-0 left-0 h-full bg-white rounded-full"
      style={{ width: `${value}%` }}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
  </motion.div>
);

const isYouTubeUrl = (url: string) => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};

const VideoPlayer = ({ src, height = "100%" }: { src: string; height?: string }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleSeek = (value: number) => {
    const time = (value / 100) * duration;
    playerRef?.current?.seekTo(time, "seconds");
    setProgress(value);
  };

const playerRef = useRef<ReactPlayer>(null);

  const handleProgress = (state: any) => {
    setCurrentTime(state.playedSeconds);
    setDuration(state.loadedSeconds || state.playedSeconds + 1);
    const prog = (state.playedSeconds / (state.loadedSeconds || 1)) * 100;
    setProgress(prog);
  };


  
//   className="h-full w-full object-cover object-center"
  return (
    <motion.div
      className="relative w-full  rounded-t-xl overflow-hidden bg-[#11111198] shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm  h-full  object-cover object-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >

      {isYouTubeUrl(src) ? (
        <ReactPlayer
          ref={playerRef}
          url={src}
          playing={isPlaying}
          volume={isMuted ? 0 : volume}
          onProgress={handleProgress}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}           
          playbackRate={playbackSpeed}
          width="auto"
          // height="100%"
          height={height}
        //   style={{ aspectRatio: "16/9" }}
        />
      ) : (
          <ReactPlayer
          ref={playerRef}
          url={src}
          playing={isPlaying}
          volume={isMuted ? 0 : volume}
          onProgress={handleProgress}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}           
          playbackRate={playbackSpeed}
          width="100%"
          // height="100%"
          height={height}
        //   style={{ aspectRatio: "16/9" }}
        />
      )}

      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute bottom-0 mx-auto w-full left-0 right-0 p-4 m-2 bg-[#11111198] backdrop-blur-md rounded-2xl"
            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 20, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white text-sm">
                {formatTime(currentTime)}
              </span>
              <CustomSlider
                value={progress}
                onChange={handleSeek}
                className="flex-1"
              />
              <span className="text-white text-sm">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-[#111111d1] hover:text-white"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                </motion.div>
                <div className="flex items-center gap-x-1">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => setIsMuted(!isMuted)}
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-[#111111d1] hover:text-white"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : volume > 0.5 ? (
                        <Volume2 className="h-5 w-5" />
                      ) : (
                        <Volume1 className="h-5 w-5" />
                      )}
                    </Button>
                  </motion.div>
                  <div className="w-24">
                    <CustomSlider
                      value={volume * 100}
                      onChange={(val) => {
                        setVolume(val / 100);
                        if (val === 0) setIsMuted(true);
                        else setIsMuted(false);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full">
                {[0.5, 1, 1.5].map((speed) => (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    key={speed}
                  >
                    <Button
                      onClick={() => setPlaybackSpeed(speed)}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "text-white hover:bg-[#111111d1] hover:text-white",
                        playbackSpeed === speed && "bg-[#111111d1]"
                      )}
                    >
                      {speed}x
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoPlayer;
