import React, { useState } from "react";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import Questions from "../../components/Questions/Questions";
import { useAuth } from "../../context/authContext";
import { fileService } from "../../APIs/Services/file.service";

const TutorialPage = () => {
  const [isEnded, setIsEnded] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(null);

  const [showQuestions, setShowQuestions] = useState(false);

  const handleVideoEnd = () => {
    setIsEnded(true); // Enable moving forward
  };
  const {user} = useAuth();

  const handleCertificateGet =async ()=>{
    try {
        console.log(user?.authState);
        await fileService.getCertificate(user?.authState?.teamMember)
    } catch (error) {
      console.log("🚀 ~ handleCertificateGet ~ error:", error)
      
    }
  }
  return (
    <div>
      {showQuestions ? (
        <Questions isSuccessful={isSuccessful} setIsSuccessful={setIsSuccessful} />
      ) : (
        <VideoPlayer onVideoEnd={handleVideoEnd} />
      )}
      <button
        onClick={() => setShowQuestions((x) => !x)}
        disabled={!isEnded}
        style={{
          padding: "10px 20px",
          margin: "5px",
          backgroundColor: isEnded ? "#4CAF50" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: isEnded ? "pointer" : "not-allowed",
        }}
      >
        {showQuestions ? "Go Back" : "Take Test"}
      </button>
      {isSuccessful && (
        <button
          onClick={handleCertificateGet}
          style={{
            padding: "10px 20px",
            margin: "5px",
            backgroundColor: isEnded ? "#4CAF50" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isEnded ? "pointer" : "not-allowed",
          }}
        >Get certificate</button>
      )}
    </div>
  );
};

export default TutorialPage;
