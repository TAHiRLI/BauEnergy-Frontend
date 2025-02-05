import { FastForward, SkipNext } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";

import FastRewindIcon from "@mui/icons-material/FastRewind";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import { IconButton } from "@mui/material";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import Replay10Icon from "@mui/icons-material/Replay10";
import { useAuth } from "../../context/authContext";

const VideoPlayer = ({ onVideoEnd }) => {
  const videoRef = useRef(null);
  const { user } = useAuth();

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
    setProgress(0);
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
  const handleSkipForward = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(video.currentTime + 10, 0);
    }
  };

  return (
    <div style={{ textAlign: "center" }} className="relative group mt-3">
      <video
        ref={videoRef}
        src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/videos/tutorial.mp4`}
        // src={"https://www.w3schools.com/Html/mov_bbb.mp4"}
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ width: "100%" }}
        playsInline
      />

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
        <IconButton onClick={handleSkipForward}   disabled={!user.hasCompletedTutorial} title="Back 10 seconds">
          <SkipNext fontSize={"large"} color="primary" />
        </IconButton>
     

        <div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => {
              if (user.hasCompletedTutorial) {
                handleTimelineChange(e); // Update the timeline if the user has completed the tutorial
              }
            }}
            disabled={!user.hasCompletedTutorial} // Disable the slider if the user hasn't completed the tutorial
           
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
