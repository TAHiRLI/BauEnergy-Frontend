import React, { useRef, useState, useEffect } from "react";

const VideoPlayer = ({onVideoEnd}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Play the video
  const handlePlay = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
    }
  };

  // Pause the video
  const handlePause = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Handle when video ends
  const handleVideoEnd = () => {
    onVideoEnd()
    setIsPlaying(false);
  };

  // Handle seeking and save playback position
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      // Prevent user from seeking forward
      if (video.currentTime > video._lastTime + 1) {
        video.currentTime = video._lastTime;
      }
      video._lastTime = video.currentTime;
      console.log("🚀 ~ handleTimeUpdate ~  video._lastTime :",  video._lastTime )

      // Save playback position
      localStorage.setItem("videoCurrentTime", video.currentTime);
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
    <div style={{ textAlign: "center",  }}>
      <video
        ref={videoRef}
        src="http://localhost:7000/assets/videos/demo2.mp4"
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => {
          const video = videoRef.current;
          if (video) video._lastTime = video.currentTime;
        }}
        style={{
          width: "100%",
        }}
      />
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          style={{
            padding: "10px 20px",
            margin: "5px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={handleSkipBack}
          style={{
            padding: "10px 20px",
            margin: "5px",
            backgroundColor: "#FFA500",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Back 10s
        </button>
        <button
          onClick={handleRestart}
          style={{
            padding: "10px 20px",
            margin: "5px",
            backgroundColor: "#FF5733",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Restart
        </button>

      </div>
    </div>
  );
};

export default VideoPlayer;
