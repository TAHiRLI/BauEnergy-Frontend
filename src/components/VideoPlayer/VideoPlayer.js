import React, { useRef, useState, useEffect } from "react";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import { IconButton } from "@mui/material";
import Replay10Icon from "@mui/icons-material/Replay10";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import { FastForward, SkipNext } from "@mui/icons-material";

const VideoPlayer = ({ onVideoEnd }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Load saved playback position from localStorage on component mount
  useEffect(() => {
    const savedTime = localStorage.getItem("videoCurrentTime");
    if (savedTime) {
      const video = videoRef.current;
      if (video) {
        video.currentTime = parseFloat(savedTime);
      }
    }
  }, []);

  // Save playback position on unmount or when the video time updates
  useEffect(() => {
    const savePlaybackPosition = () => {
      const video = videoRef.current;
      if (video) {
        localStorage.setItem("videoCurrentTime", video.currentTime);
      }
    };

    window.addEventListener("beforeunload", savePlaybackPosition);
    return () => {
      savePlaybackPosition();
      window.removeEventListener("beforeunload", savePlaybackPosition);
    };
  }, []);

  // Update progress and duration
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setProgress((video.currentTime / video.duration) * 100);
      setDuration(video.duration);
      localStorage.setItem("videoCurrentTime", video.currentTime);
    }
  };

  // Handle play and pause
  const handlePlay = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Handle when video ends
  const handleVideoEnd = () => {
    onVideoEnd();
    setIsPlaying(false);
  };

  // Handle seeking via timeline
  const handleTimelineChange = (e) => {
    const video = videoRef.current;
    const newTime = (e.target.value / 100) * duration;
    if (video) {
      video.currentTime = newTime;
      setProgress((newTime / duration) * 100);
    }
  };

  // Restart the video
  const handleRestart = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      localStorage.setItem("videoCurrentTime", "0");
      handlePlay();
    }
  };

  // Skip back 10 seconds
  const handleSkipBack = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(video.currentTime - 10, 0);
    }
  };

  return (
    <div style={{ textAlign: "center" }} className="relative group mt-3">
      <video
        ref={videoRef}
        src="http://localhost:7000/assets/videos/demo2.mp4"
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ width: "100%" }}
      />
      {/* Timeline */}

      <div className="bg-black bg-opacity-50 absolute bottom-0 w-full p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ">
        <IconButton onClick={handleRestart} title="Restart">
          <FastRewindIcon fontSize={"large"} color="primary" />
        </IconButton>
        <IconButton onClick={handleSkipBack} title="Back 10 seconds">
          <FirstPageIcon fontSize={"large"} color="primary" />
        </IconButton>
        <IconButton onClick={isPlaying ? handlePause : handlePlay} title={isPlaying ? "Pause" : "Play"}>
          {!isPlaying ? (
            <PlayCircleIcon fontSize={"large"} color="primary" />
          ) : (
            <PauseCircleIcon fontSize={"large"} color="primary" />
          )}
        </IconButton>
        <IconButton disabled title="Back 10 seconds">
          <SkipNext fontSize={"large"} sx={{ color: "#8c97a1" }} />
        </IconButton>
        <IconButton disabled>
          <FastForward fontSize={"large"} sx={{ color: "#8c97a1" }} />
        </IconButton>

        <div>
          <input

            type="range"
            min="0"
            max="100"
            value={progress}
            style={{
              width: "100%",
              appearance: "none",
              height: "5px",
              background: "#ddd",
              borderRadius: "5px",
              outline: "none",
              cursor: "pointer",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
