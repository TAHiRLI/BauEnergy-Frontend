import React, { useState } from "react";

import { AuthActions } from "../../context/authContext";
import Cookies from 'universal-cookie';
import Questions from "../../components/Questions/Questions";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import dayjs from 'dayjs';
import { fileService } from "../../APIs/Services/file.service";
import { useAuth } from "../../context/authContext";
import { userSerivce } from "../../APIs/Services/user.service";

const cookies = new Cookies();

const TutorialPage = () => {
  const { user, dispatch } = useAuth();
  console.log("🚀 ~ TutorialPage ~ user:", user)

  const [isEnded, setIsEnded] = useState(user.hasCompletedTutorial);
  const [isSuccessful, setIsSuccessful] = useState(null);
  const [scorePercentage, setScorePercentage] =  useState(0);
  const [showQuestions, setShowQuestions] = useState(false);

  const handleVideoEnd = async() => {
    setIsEnded(true);
    await userSerivce.CompletedTutorial();
    dispatch({ type: AuthActions.success, payload: {...user, hasCompletedTutorial: true, } });
    cookies.set('user', JSON.stringify({...user, hasCompletedTutorial: true,}), {
      expires: new Date(dayjs(user.expiration)),
      path: '/',
    });
  };

  const handleCertificateGet = async () => {
    try {
      await userSerivce.CompletedTest();
      dispatch({ type: AuthActions.success, payload: {...user, hasCompletedTest: true , hasCompletedTutorial: true, } });
      cookies.set('user', JSON.stringify({...user, hasCompletedTest: true, hasCompletedTutorial: true,}), {
        expires: new Date(dayjs(user.expiration)),
        path: '/',
      });
        console.log("🚀 ~ cookies.set ~ user.expiration:", user.expiration)
      
      
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
        (!isSuccessful || user.hasCompletedTutorial )&&
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
      
      {(isSuccessful || user.hasCompletedTest )&& (
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
          {user.hasCompletedTest ? "Renew Certificate":"Get certificate"}
        </button>
      )}
      </div>
     
    </div>
  );
};

export default TutorialPage;
