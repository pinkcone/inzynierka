import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import styles from '../../styles/TestSummaryPage.module.css';

const TestSummaryPage = () => {
//     const location = useLocation();
//     const { selectedAnswers = {}, questions = [] } = location.state || {};
//     const navigate = useNavigate();
//
//     const handleNavigate = () => {
//         navigate('/');
//     };

    return (
        <div className={styles.summaryPage}>
            <div className={styles.summaryHeader}>
                <h1>Podsumowanie testu</h1>
            </div>
            {/*<div className={styles.questionsSummary}>*/}
            {/*    <h1>Wynik: {totalPoints} / {totalQuestions} ({percentage}%)</h1>*/}
            {/*    {questions.map((question, index) => (*/}
            {/*        <div key={index} className={styles.questionBlock}>*/}
            {/*            <h3>{question.question}</h3>*/}
            {/*            <ul>*/}
            {/*                {question.answers.map((answer, answerIndex) => (*/}
            {/*                    <li*/}
            {/*                        key={answerIndex}*/}
            {/*                        className={`*/}
            {/*                            ${styles.answer} */}
            {/*                            ${answerIndex === question.correctAnswerIndex ? styles.correct : ''} */}
            {/*                            ${selectedAnswers[index] === answerIndex ? styles.selected : ''}*/}
            {/*                        `}*/}
            {/*                    >*/}
            {/*                        {answer}*/}
            {/*                    </li>*/}
            {/*                ))}*/}
            {/*            </ul>*/}
            {/*            <p>*/}
            {/*                {selectedAnswers[index] === question.correctAnswerIndex*/}
            {/*                    ? 'Prawidłowa odpowiedź! (1 punkt)'*/}
            {/*                    : 'Błędna odpowiedź! (0 punktów)'}*/}
            {/*            </p>*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</div>*/}
            {/*<button onClick={handleNavigate}>*/}
            {/*    Zakończ przegląd*/}
            {/*</button>*/}
        </div>
    );
};
export default TestSummaryPage;
