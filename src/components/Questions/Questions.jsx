import React, { useRef, useState } from "react";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { Model } from "survey-core";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const Questions = ({ isSuccessful, setIsSuccessful, setScorePercentage }) => {
  const { t } = useTranslation();
  
  // Define the survey JSON

  const surveyJson = {
    title: t("Quiz:Test Your Knowledge"),
    description: t("Quiz:Answer all questions correctly to pass the test."),
    showProgressBar: "top",
    progressBarType: "questions",
    showTimerPanel: "top",
    firstPageIsStarted: true,
    startSurveyText: t("Quiz:Start Quiz"),
    completedHtml: `<p>${t("Quiz:Thank you for completing the quiz!")}</p>`,
    pages: [
      {
        elements: [
          {
            type: "html",
            html: `${t("Quiz:You are about to start the quiz.")} <br/>${t("Quiz:Click on")} <b>${t("Quiz:Start Quiz")}</b> ${t("Quiz:to begin.")}`,
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
          {
            type: "radiogroup",
            name: "q6",
            title: "Какие действия запрещены при управлении транспортным средством?",
            choices: ["Использовать громкую связь", "Вводить пункт назначения в навигацию во время движения", "Пристёгиваться ремнём безопасности", "Регулировать скорость в зависимости от дорожных условий"],
            correctAnswer: "Вводить пункт назначения в навигацию во время движения",
          },
          {
            type: "radiogroup",
            name: "q7",
            title: "Что необходимо сделать перед использованием средств защиты от падения с высоты?",
            choices: ["Убедиться в отсутствии дефектов", "Прикрепить только к одному точке крепления", "Использовать только новый комплект защиты", "Проверить только визуально"],
            correctAnswer: "Убедиться в отсутствии дефектов",
          },
          {
            type: "radiogroup",
            name: "q8",
            title: "Что запрещено при выполнении подъёмных операций?",
            choices: ["Проверять оборудование перед началом работы", "Использовать оборудование без квалификации", "Назначать опасные зоны", "Использовать оборудование, прошедшее проверку"],
            correctAnswer: "Использовать оборудование без квалификации",
          },
          {
            type: "radiogroup",
            name: "q9",
            title: "Кто имеет право прекратить выполнение опасной работы?",
            choices: ["Только руководитель", "Только ответственное лицо", "Любой сотрудник", "Только старший специалист"],
            correctAnswer: "Любой сотрудник",
          },
          {
            type: "radiogroup",
            name: "q10",
            title: "Какие меры следует предпринять, чтобы избежать нахождения в опасной зоне?",
            choices: ["Двигаться только в безопасных зонах", "Заблокировать опасные зоны", "Обозначить зоны риска падения предметов", "Все перечисленное"],
            correctAnswer: "Все перечисленное",
          },
        ],
      },
    ],
  };
  

  // State to track the survey instance and completion status
  const surveyRef = useRef(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize the survey model
  const survey = new Model(surveyJson);
  surveyRef.current = survey;

  // Handle survey completion
  survey.onComplete.add((sender) => {
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
    } else {
      setIsSuccessful(false);
      Swal.fire(t("Your Score"), `You scored ${scorePercentage}%. Keep practicing!`, "info");
    }

    setIsCompleted(true); // Mark survey as completed
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
