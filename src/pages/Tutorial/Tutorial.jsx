import React, { useState } from "react";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import Questions from "../../components/Questions/Questions";
import { useAuth } from "../../context/authContext";
import { fileService } from "../../APIs/Services/file.service";
import { userSerivce } from "../../APIs/Services/user.service";
import { AuthActions } from "../../context/authContext";
const TutorialPage = () => {
  const { user, dispatch } = useAuth();

  const [isEnded, setIsEnded] = useState(user.hasCompletedTutorial);
  const [isSuccessful, setIsSuccessful] = useState(null);
  const [hasCertificate, setHasCertificate] = useState(() => (user.hasCompletedTutorial == false ? null : true));
  const [scorePercentage, setScorePercentage] =  useState(0);
  const [showQuestions, setShowQuestions] = useState(false);

  const handleVideoEnd = () => {
    setIsEnded(true); // Enable moving forward
  };

  const handleCertificateGet = async () => {
    try {
      console.log(user);
      await userSerivce.CompletedTutorial();
      dispatch({ type: AuthActions.completedTutorial });

      await fileService.getCertificate(user?.authState?.teamMember, scorePercentage);
    } catch (error) {
      console.log("🚀 ~ handleCertificateGet ~ error:", error);
    }
  };
  return (
    <div className=" mt-3">
      {showQuestions ? (
        <Questions setScorePercentage ={setScorePercentage} isSuccessful={isSuccessful} setIsSuccessful={setIsSuccessful} />
      ) : (
        <VideoPlayer onVideoEnd={handleVideoEnd} />
      )}

      <div className="flex justify-center mt-3">

      {
        !isSuccessful &&
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
      }
      
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
        >
          {hasCertificate ? "Renew Certificate":"Get certificate"}
        </button>
      )}
      </div>
     
    </div>
  );
};

export default TutorialPage;
