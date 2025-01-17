import React, { useEffect, useState } from "react";
import { fileService, formatDate } from "../../APIs/Services/file.service";

import { AuthActions } from "../../context/authContext";
import Cookies from "universal-cookie";
import Questions from "../../components/Questions/Questions";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import image from "../../assets/images/certificateImage2.jpg";
import instructions from "../../assets/images/instructions.png";
import { jsPDF } from "jspdf";
import {jwtDecode} from "jwt-decode";
import { useAuth } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import { userSerivce } from "../../APIs/Services/user.service";

const cookies = new Cookies();

const TutorialPage = () => {
  const { t } = useTranslation();
  const { user, dispatch } = useAuth();
  console.log("🚀 ~ TutorialPage ~ user:", user)
  const [userData, setUserData] = useState(null); 
  const decodedToken = user?.token ? jwtDecode(user.token) : null;
  const userEmail = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
  
      useEffect(() => {
      const fetchUserData = async () => {
        try {
  
          const response = await userSerivce.getByEmail(userEmail); 
          const updatedUser = response.data;
          setUserData(updatedUser);
  
        } catch (err) {
          console.error("Error fetching user data:", err);
        } 
      };
  
      if (userEmail) {
        fetchUserData();
      }
    }, [userEmail]);

    
  const [isEnded, setIsEnded] = useState(user.hasCompletedTutorial);
  const [isSuccessful, setIsSuccessful] = useState(null);
  const [scorePercentage, setScorePercentage] = useState(100);
  const [showQuestions, setShowQuestions] = useState(false);

  const handleVideoEnd = async () => {
    setIsEnded(true);
    if (user.hasCompletedTutorial) return; // to do ^ here is a problem removing the token

    await userSerivce.CompletedTutorial();
    dispatch({ type: AuthActions.success, payload: { ...user, hasCompletedTutorial: true } });
    cookies.set("user", JSON.stringify({ ...user, hasCompletedTutorial: true }), {
      expires: new Date(dayjs(user.expiration)),
      path: "/",
    });
  };

  const handleCertificateGet = async () => {
    try {
    

      const certificateDiv = document.getElementById("certificate");
      const insturctionsDiv = document.getElementById("instructions");
      if (!certificateDiv && !insturctionsDiv) {
        alert("Certificate element not found!");
        return;
      }

      const canvas = await html2canvas(certificateDiv, { scale: 2, margin:2 });
      const canvasInstructions = await html2canvas(insturctionsDiv, { scale: 2, margin:2 });
      const imgData = canvas.toDataURL("image/png");
      const imgDataInstructions = canvasInstructions.toDataURL("image/png");

      // 2) Create a PDF from the image
      const pdf = new jsPDF("portrait", "pt", "a4"); // A4 landscape
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.addPage();
      pdf.addImage(imgDataInstructions, "PNG", 0, 0, pageWidth, pageHeight);

      // 3) Prompt download
      pdf.save("certificate.pdf");
    } catch (error) {
      console.log("🚀 ~ handleCertificateGet ~ error:", error);
    }
  };
  return (
    <div className=" mt-3">
      {showQuestions ? (
        <Questions
          setScorePercentage={setScorePercentage}
          isSuccessful={isSuccessful}
          setIsSuccessful={setIsSuccessful}
        />
      ) : (
        <VideoPlayer onVideoEnd={handleVideoEnd} />
      )}

      <div className="flex justify-start mt-3">
        {(!isSuccessful || user.hasCompletedTutorial) && (
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
            {showQuestions ? t("PopUp:GoBack") : t("PopUp:TakeTest")}
          </button>
        )}
      </div>
      {(isSuccessful || user.hasCompletedTest) && (
        <>
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
            Download Certificate
          </button>

            <div className="mt-5">
              
          <div id="certificate" className="certificate relative  border border-solid border-gray-500  mx-10 p-2">
            <img src={image} className="!w-full h-auto" alt="certificate Image" />
            <p className="fullanme w-full text-nowrap absolute text-[5vw] top-[45%] text-center z-2">{userData?.fullName}</p>
            <p className="absollute absolute text-[2vw] top-[58.6%] right-[27%] ">{scorePercentage} %</p>
            <p className="absollute absolute text-[2vw] top-[78%] right-[66%] ">{formatDate(new Date())}</p>
          </div>
          <div id="instructions" className="instructions aspect-[794/1122] border border-solid border-gray-500  mt-3 mx-10 p-2">
            <img src={instructions} className="w-[15vw] ms-5" alt="" srcset="" />

            <div className="p-5  text-[1.5vw] flex flex-col gap-y-2">
              <p className=" mt-6 font-bold">Условия:</p>
              <p>
                Употребление наркотиков и алкоголя на время командировки запрещено Запрещается употребление любых
                наркотических веществ и алкоголя на протяжении всей командировки. Нарушение данного правила может
                повлечь за собой дисциплинарные меры вплоть до прекращения трудовых отношений.
              </p>
              <p>
                Содержание в местах проживания порядка и чистоты Проживающие обязаны поддерживать чистоту и порядок в
                предоставленных местах проживания. Это включает уборку жилых помещений, правильное использование бытовой
                техники и соблюдение санитарных норм.
              </p>

              <p>
                Содержание транспорта в чистоте и порядке Транспортные средства, предоставленные для работы или
                передвижения, должны находиться в чистом и опрятном состоянии. Работники обязаны своевременно убирать
                мусор и заботиться о техническом состоянии транспорта.
              </p>
              <p>
                Эстетический вид — вымытая рабочая одежда, стрижка и борода Каждый сотрудник обязан соблюдать опрятный
                внешний вид. Рабочая одежда должна быть чистой и ухоженной, а личная гигиена — на высоком уровне
                (аккуратная стрижка и борода).
              </p>
              <p>
                Содержание рабочего места в чистоте и порядке Рабочее место должно быть чистым и организованным. Мусор
                следует убирать сразу, а оборудование размещать в установленных местах для предотвращения нарушений и
                несчастных случаев.
              </p>

              <p>
              Я {userData?.fullName} подтверждаю, что ознакомлен с изложенными выше условиями, полностью их принимаю и обязуюсь соблюдать их в полном объеме!              </p>
            </div>
          </div>
          </div>

        </>
      )}
    </div>
  );
};

export default TutorialPage;
