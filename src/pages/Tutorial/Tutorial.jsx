import React, { useEffect, useState } from "react";
import { fileService, formatDate } from "../../APIs/Services/file.service";

import { AuthActions } from "../../context/authContext";
import Cookies from "universal-cookie";
import Questions from "../../components/Questions/Questions";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import image from "../../assets/images/certificateImage2.jpg";
import image3 from "../../assets/images/certificateImage3.jpg";
import instructions from "../../assets/images/instructions.png";
import { jsPDF } from "jspdf";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import { userSerivce } from "../../APIs/Services/user.service";

const cookies = new Cookies();

const TutorialPage = () => {
  const { t } = useTranslation();
  const { user, dispatch } = useAuth();
  console.log("🚀 ~ TutorialPage ~ user:", user);
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
      const instructionsDiv = document.getElementById("instructions");

      if (!certificateDiv || !instructionsDiv) {
        alert("Certificate element not found!");
        return;
      }
      const screenWidth = window.innerWidth;

      // Dynamically set scale factor: Increase on smaller screens
      let SCALE_FACTOR;
      if (screenWidth < 500) {
        SCALE_FACTOR = 5; // Very high quality for small screens
      } else if (screenWidth < 768) {
        SCALE_FACTOR = 4; // Medium quality for tablets
      } else {
        SCALE_FACTOR = 1; // Normal quality for large screens
      }

      // Capture the certificate and instructions using html2canvas with a scale factor for quality
      const canvasCertificate = await html2canvas(certificateDiv, {
        scale: SCALE_FACTOR,
        // Optionally force a specific width/height if needed:
        // width: YOUR_DESIRED_WIDTH,
        // height: YOUR_DESIRED_HEIGHT,
      });
      const canvasInstructions = await html2canvas(instructionsDiv, {
        scale: SCALE_FACTOR,
      });

      const imgDataCertificate = canvasCertificate.toDataURL("image/png");
      const imgDataInstructions = canvasInstructions.toDataURL("image/png");

      // Create PDF with fixed A4 size (in points)
      const pdf = new jsPDF("portrait", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Function to calculate proper dimensions and position for an image to fit into the page
      const addImageToPDF = (imgData) => {
        // Get the intrinsic dimensions of the image using jsPDF's built-in helper
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;

        // Calculate the scaling ratio so the image fits within the page while preserving aspect ratio
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;

        // Center the image on the page
        const marginX = (pageWidth - newWidth) / 2;
        const marginY = (pageHeight - newHeight) / 2;

        // Add the image with the calculated dimensions and margins
        pdf.addImage(imgData, "PNG", marginX, marginY, newWidth, newHeight);
      };

      // Add the certificate image on the first page
      addImageToPDF(imgDataCertificate);

      // Add a new page and the instructions image on the second page
      pdf.addPage();
      addImageToPDF(imgDataInstructions);

      // Save the PDF
      pdf.save("certificate.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
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
              <img src={image3} className="!w-full h-auto" alt="certificate Image" />
              <div className=" text-[1.5vw] absolute top-[48%] left-[50%] -translate-x-1/2 w-3/4  ">
                <p className="fullanme w-full text-nowrap  text-[5vw]  text-center z-2">{userData?.fullName}</p>
                <p className="flex justify-between">
                  <span>Test: </span> <span>Eingangsunterweisung Deutschland</span>
                </p>
                <p className=" text-[1.5vw] flex justify-between ">
                  <span>Ergebnis:</span> <span>(Bestanden)</span>
                </p>
                <p className=" text-[1.5vw] flex justify-between">
                  <span>Zertifikat gültig bis:</span> <span>{scorePercentage} %</span>
                </p>
              </div>

              <p className="absollute absolute text-[2vw] top-[78%] right-[66%] ">{formatDate(new Date())}</p>
              <p className="absollute absolute text-[1.2vw] top-[82%] right-[69%] ">DATUM</p>
            </div>

            <div
              id="instructions"
              className="instructions aspect-[794/1122] border border-solid border-gray-500  mt-3 mx-10 p-2"
            >
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
                  предоставленных местах проживания. Это включает уборку жилых помещений, правильное использование
                  бытовой техники и соблюдение санитарных норм.
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
                  Я {userData?.fullName} подтверждаю, что ознакомлен с изложенными выше условиями, полностью их принимаю
                  и обязуюсь соблюдать их в полном объеме!{" "}
                </p>
              </div>
              
            </div>
                        
            <div
              id="instructions"
              className="instructions aspect-[794/1122] border border-solid border-gray-500  mt-3 mx-10 p-2"
            >
              <img src={instructions} className="w-[15vw] ms-5" alt="" srcset="" />

              <div className="p-5  text-[1.5vw] flex flex-col gap-y-2">
                <p className=" mt-6 font-bold">Bedingungen:</p>
                <p>
                  Verbot des Konsums von Drogen und Alkohol während der Dienstreise
                  Der Konsum jeglicher Drogen und Alkohol ist während der gesamten Dauer der 
                  Dienstreise strengstens untersagt. Ein Verstoß gegen diese Regel kann 
                  disziplinarische Maßnahmen bis hin zur Beendigung des Arbeitsverhältnisses nach sich ziehen
                </p>
                <p>
                  Sauberkeit und Ordnung in den Unterkünften
                  Die Bewohner sind verpflichtet, in den zur Verfügung gestellten Unterkünften Sauberkeit und 
                  Ordnung zu gewährleisten. Dazu gehören die Reinigung der Wohnräume, der sachgemäße Umgang mit 
                  Haushaltsgeräten sowie die Einhaltung der hygienischen Vorschriften.
                </p>

                <p>
                  Sauberkeit und Ordnung der Transportmittel
                  Die für Arbeit oder Fahrten bereitgestellten Fahrzeuge müssen stets in einem sauberen und ordentlichen 
                  Zustand gehalten werden. Die Mitarbeiter sind verpflichtet, regelmäßig Müll zu entsorgen und sich um 
                  den technischen Zustand der Fahrzeuge zu kümmern
                </p>
                <p>
                  Äußeres Erscheinungsbild — saubere Arbeitskleidung, gepflegte Frisur und Bart
                  Jeder Mitarbeiter ist verpflichtet, ein gepflegtes äußeres Erscheinungsbild zu wahren. Die 
                  ArbeitsKitovung muss sauber und ordentlich sein, die persönliche Hygiene ist auf hohem 
                  Niveau zu halten (gepflegte Frisur und Bart).   
                </p>
                <p>
                  Sauberkeit und Ordnung am Arbeitsplatz
                  Der Arbeitsplatz muss sauber und organisiert sein. Abfall ist Kitovt zu entsorgen, und Arbeitsgeräte 
                  sind an den dafür vorgesehenen Plätzen aufzubewahren, um Störungen und Unfälle zu vermeiden.
                </p>

                <p>
                  Ich, {userData?.fullName}  bestätige hiermit, dass ich die oben genannten Bedingungen gelesen habe, sie 
                  vollständig akzeptiere und mich verpflichte, diese in vollem Umfang einzuhalten!{" "}
                </p>  
              </div>
              
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TutorialPage;
