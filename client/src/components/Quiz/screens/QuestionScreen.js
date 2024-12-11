import React, { useState, useEffect } from 'react';
import styles from '../../../styles/StartWaitingScreen.module.css';

const QuestionScreen = ({ question, handleAnswerClick, questionTime }) => {
    const [shuffledColors, setShuffledColors] = useState([]);

    useEffect(() => {
        const colors = ['#FF4500', '#1E90FF', '#32CD32', '#FF6347', '#6A5ACD', '#FFD000', '#FF69B4', '#40E0D0'];

        const shuffled = colors.sort(() => Math.random() - 0.5);
        setShuffledColors(shuffled);
    }, [question]);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={`${styles.timer} ${questionTime < 5 ? styles.critical : ''}`}>
                    {Math.floor((questionTime -1) / 60)}:{String((questionTime - 1 )% 60).padStart(2, '0')}
                </div>
                <h2>{question.content}</h2>
                <div className={styles.answers}>
                    {question.answers.map((answer, index) => (
                        <button
                            key={answer.id}
                            onClick={() => handleAnswerClick(answer.id)}
                            className={styles.answer}
                            style={{ backgroundColor: shuffledColors[index % shuffledColors.length] }}
                        >
                            {answer.content}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionScreen;