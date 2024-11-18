import React, { useRef, useState } from "react";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { Model } from "survey-core";

const Questions = ({isSuccessful, setIsSuccessful}) => {
  // Define the survey JSON

  const surveyJson = {
    title: "Test Your Knowledge",
    description: "Answer all questions correctly to pass the test.",
    showProgressBar: "top",
    progressBarType: "questions",
    showTimerPanel: "top",
    firstPageIsStarted: true,
    startSurveyText: "Start Quiz",
    completedHtml: "<p>Thank you for completing the quiz!</p>",

    pages: [
      {
        elements: [
          {
            type: "html",
            html: "You are about to start the quiz. <br/>Click on <b>Start Quiz</b> to begin.",
          },
        ],
      },
      {
        title: "Quiz Questions",
        questions: [
          {
            type: "radiogroup",
            name: "q1",
            title: "What is 2 + 2?",
            choices: ["2", "3", "4", "5"],
            correctAnswer: "4",
          },
          {
            type: "radiogroup",
            name: "q2",
            title: "What is the capital of France?",
            choices: ["Berlin", "Madrid", "Paris", "Rome"],
            correctAnswer: "Paris",
          },
          {
            type: "radiogroup",
            name: "q3",
            title: "What is the largest planet in our solar system?",
            choices: ["Mars", "Venus", "Earth", "Jupiter"],
            correctAnswer: "Jupiter",
          },
          {
            type: "radiogroup",
            name: "q4",
            title: "What is the boiling point of water (in °C)?",
            choices: ["90", "100", "110", "120"],
            correctAnswer: "100",
          },
          {
            type: "radiogroup",
            name: "q5",
            title: "What is the square root of 81?",
            choices: ["6", "7", "8", "9"],
            correctAnswer: "9",
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
    const results = sender.getAllQuestions().every((q) => q.isAnswerCorrect());
    if (results) {
      setIsSuccessful(true);
      alert("Congratulations! All answers are correct.");
    } else {
      setIsSuccessful(false);

      alert("Some answers are incorrect. Please try again.");
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
    <div>
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
            Try Again
          </button>
        )
      )}

    
    </div>
  );
};

export default Questions;
