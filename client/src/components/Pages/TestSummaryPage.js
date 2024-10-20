import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../../styles/TestSummaryPage.module.css';

const TestSummaryPage = () => {
    const location = useLocation();
    const { selectedAnswers, questions } = location.state || {selectedAnswers: {}, questions: []};

    let totalPoints = 0;
    questions.forEach((question, index) => {
        if (selectedAnswers[index] === question.correctAnswerIndex) {
            totalPoints++;
        }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((totalPoints / totalQuestions) * 100);

    return (
        <div className={styles.summaryPage}>
            <h1>Podsumowanie testu</h1>
            <div className={styles.questionsSummary}>
                {questions.map((question, index) => (
                    <div key={index} className={styles.questionBlock}>
                        <h3>{question.question}</h3>
                        <ul>
                            {question.answers.map((answer, answerIndex) => (
                                <li
                                    key={answerIndex}
                                    className={`
                                        ${styles.answer} 
                                        ${answerIndex === question.correctAnswerIndex ? styles.correct : ''} 
                                        ${selectedAnswers[index] === answerIndex ? styles.selected : ''}
                                    `}
                                >
                                    {answer}
                                </li>
                            ))}
                        </ul>
                        <p>
                            {selectedAnswers[index] === question.correctAnswerIndex
                                ? 'Prawidłowa odpowiedź! (+1 punkt)'
                                : 'Błędna odpowiedź! (0 punktów)'}
                        </p>
                    </div>
                ))}
            </div>
            <p>Wynik: {totalPoints} / {totalQuestions} ({percentage}%)</p>
        </div>
    );
};

export default TestSummaryPage;
