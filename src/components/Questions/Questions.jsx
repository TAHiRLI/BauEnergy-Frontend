import "survey-core/defaultV2.min.css";

import { AuthActions, useAuth } from "../../context/authContext";
import React, { useRef, useState } from "react";

import Cookies from "universal-cookie";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { userSerivce } from "../../APIs/Services/user.service";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import image3 from "../../assets/images/certificateImage3.jpg";
import { PDFDocument } from "pdf-lib";

const cookies = new Cookies();

const Questions = ({ isSuccessful, setIsSuccessful, setScorePercentage }) => {
  const { t } = useTranslation();
    const { user, dispatch } = useAuth();

    async function compressPDF(pdfBlob) {
      const pdfDoc = await PDFDocument.load(await pdfBlob.arrayBuffer());
      
      // Set compression for each page
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        page.setFontSize(10);
      });
    
      // Save compressed PDF
      const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
    
      return new Blob([compressedBytes], { type: "application/pdf" });
    }
  
  // Define the survey JSON
  const surveyJson = {
    title: t("Quiz:Test Your Knowledge"),
    description: t("Quiz:Answer all questions correctly to pass the test."),
    showProgressBar: "top",
    progressBarType: "questions",
    showTimerPanel: "top",
    firstPageIsStarted: true,
    startSurveyText: t("Quiz:Start Quiz"),
    completedHtml: `<p>${t("Thank you for completing the quiz!")}</p>`,
    pages: [
      {
        elements: [
          {
            type: "html",
            html: `${t("You are about to start the quiz.")} <br/>${t("Click on")} <b>${t("Start Quiz")}</b> ${t("to begin.")}`,
          },
        ],
      },
      {
        title: "Quiz Questions",
        questions: [
          {
            type: "radiogroup",
            name: "q1",
            title: "Как часто необходимо повторять инструктаж по технике безопасности?",
            choices: ["Раз в 6 месяцев", "Раз в 12 месяцев", "Раз в 2 года", "Только перед первым входом на объект"],
            correctAnswer: "Раз в 12 месяцев",
          },
          {
            type: "radiogroup",
            name: "q2",
            title: "Какие средства индивидуальной защиты обязательны на строительной площадке?",
            choices: ["Только защитная каска", "Защитная каска и защитные очки", "Защитная каска и защитная обувь", "Только защитная обувь"],
            correctAnswer: "Защитная каска и защитная обувь",
          },
          {
            type: "radiogroup",
            name: "q3",
            title: "Какое минимальное безопасное расстояние нужно соблюдать от электрических компонентов, если отсутствует дополнительная информация?",
            choices: ["1 метр", "3 метра", "5 метров", "10 метров"],
            correctAnswer: "5 метров",
          },
          {
            type: "radiogroup",
            name: "q4",
            title: "Что нужно сделать, если вы зависите от активных физических приспособлений (например, кардиостимулятора)?",
            choices: ["Ничего не делать", "Сообщить ответственному лицу", "Только зарегистрироваться", "Снять устройство перед входом"],
            correctAnswer: "Сообщить ответственному лицу",
          },
          {
            type: "radiogroup",
            name: "q5",
            title: "Что нужно сделать перед началом работы в замкнутом пространстве?",
            choices: ["Отключить источник энергии", "Проверить наличие спасательного оборудования", "Убедиться, что атмосфера безопасна", "Все перечисленное"],
            correctAnswer: "Все перечисленное",
          },
          
        ],
      },
    ],
  };

  const handleCertificateGet = async () => {
    try {
      const certificateDiv = document.getElementById("certificate");
      const instructionsDiv = document.getElementById("instructions");
  
      if (!certificateDiv || !instructionsDiv) {
        alert("Certificate element not found!");
        return;
      }
  
      const SCALE_FACTOR = 1; // Reduce this to 0.5 or 0.7 for better compression
      const canvasCertificate = await html2canvas(certificateDiv, { scale: SCALE_FACTOR });
      const canvasInstructions = await html2canvas(instructionsDiv, { scale: SCALE_FACTOR });
  
      let imgDataCertificate = canvasCertificate.toDataURL("image/jpeg", 0.5);
      let imgDataInstructions = canvasInstructions.toDataURL("image/jpeg", 0.5);
  
      const pdf = new jsPDF("portrait", "pt", "a4");
      pdf.addImage(imgDataCertificate, "JPEG", 20, 20, 550, 780);
      pdf.addPage();
      pdf.addImage(imgDataInstructions, "JPEG", 20, 20, 550, 780);
  
      const pdfBlob = pdf.output("blob");
  
      // 🔹 Compress PDF before upload
      const compressedBlob = await compressPDF(pdfBlob);
      await uploadCompressedPDF(compressedBlob);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
  

  async function uploadCompressedPDF(pdfBlob) {
    const pdfFile = new File([pdfBlob], "certificate.pdf", { type: "application/pdf" });
    console.log("Compressed File Size:", pdfFile.size);
  
    if (pdfFile.size > 5 * 1024 * 1024) { // If still too large, retry compression
      alert("File is still too big! Try reducing quality further.");
    }
  
    const formData = new FormData();
    formData.append("Files", pdfFile);
  
    try {
      await userSerivce.uploadUserDocument(user.userId, [pdfFile]);
      console.log("File uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
    }
  }
  

  // State to track the survey instance and completion status
  const surveyRef = useRef(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize the survey model
  const survey = new Model(surveyJson);
  surveyRef.current = survey;

  // Handle survey completion
  survey.onComplete.add(async(sender) => {
    // Get all questions
    const allQuestions = sender.getAllQuestions();

    // Calculate the number of correct answers
    const correctAnswers = allQuestions.filter((q) => q.isAnswerCorrect()).length;

    // Calculate the total number of questions
    const totalQuestions = allQuestions.length;

    // Calculate the percentage score
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    setScorePercentage(scorePercentage);

    // Show success or error message based on score
    if (correctAnswers === totalQuestions) {
      setIsSuccessful(true);
      Swal.fire(t("messages:Success"), t("You scored 100%! Well done!"), "success");
      await userSerivce.CompletedTest();
      
      dispatch({ type: AuthActions.success, payload: {...user, hasCompletedTest: true , hasCompletedTutorial: true, } });
      cookies.set('user', JSON.stringify({...user, hasCompletedTest: true, hasCompletedTutorial: true,}), {
        expires: new Date(dayjs(user.expiration)),
        path: '/',
      });
    } else {
      setIsSuccessful(false);
      Swal.fire(t("Your Score"), `You scored ${scorePercentage}%. Keep practicing!`, "info");
    }

    setIsCompleted(true); // Mark survey as completed
    handleCertificateGet()
  });

  // Reset survey for retrying
  const handleRetry = () => {
    surveyRef.current.clear(); // Clear survey responses
    setIsCompleted(false); // Reset completion state
    setIsSuccessful(null);
  };

  return (
    <div className="flex justify-center">
      {isSuccessful == null ? (
        <Survey model={survey} />
      ) : (
        isSuccessful == false && (
          <button
            onClick={handleRetry}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {t("Quiz:Try Again")}
          </button>
        )
      )}
    </div>
  );
};

export default Questions;
