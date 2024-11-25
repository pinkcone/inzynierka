import React, { useState, useEffect } from 'react';
import styles from '../../styles/QuizSummaryPage.module.css';

const QuizSummaryPage = () => {
  const participants = [
    { name: 'Tomasz Ziętarki', score: 10, totalQuestions: 10 },
    { name: 'Wojciech Surtel', score: 7, totalQuestions: 10 },
    { name: 'Zbysio Lach', score: 7, totalQuestions: 10 },
    { name: 'student', score: 0, totalQuestions: 10 },
    { name: 'student2', score: 2, totalQuestions: 10 }
  ];

  const nextQuestionTime = 60; 

  const [timeLeft, setTimeLeft] = useState(nextQuestionTime);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer); 
  }, [timeLeft]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  participants.sort((a, b) => b.score - a.score);

  const getPodiumLightning = (index) => {
    if (index === 0) return <div className={styles.lightningGold}></div>;
    if (index === 1) return <div className={styles.lightningSilver}></div>;
    if (index === 2) return <div className={styles.lightningBronze}></div>;
    return null;
  };

  if (!participants || participants.length === 0) {
    return <p>Brak uczestników w quizie.</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.summaryContent}>
        <h1>Brawo! Jesteś gotowy na kolejne wyzwanie!</h1>
        <p>Oto wyniki wszystkich uczestników:</p>

        <div className={styles.participantsList}>
          <ul>
            {participants.map((participant, index) => (
              <li key={index} className={styles.participant}>
                {getPodiumLightning(index)}
                <span>{participant.name}</span>
                <span>{participant.score} / {participant.totalQuestions} punktów</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.countdown}>
        <h3>Kolejne pytanie za:</h3>
        <div className={styles.timer}>{formatTime(timeLeft)}</div>
      </div>
    </div>
  );
};

export default QuizSummaryPage;
