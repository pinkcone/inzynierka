import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../../styles/TestSummaryPage.module.css';


const TestSummaryPage = () => {
    const [testSummary, setTestSummary] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchTestSummary = async () => {
            try {
                const response = await fetch(`/api/completed-tests/get-test/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    data.completedTest.selectedAnswer = JSON.parse(data.completedTest.selectedAnswer);
                    data.completedTest.questionScores = JSON.parse(data.completedTest.questionScores);
                    setTestSummary(data);
                } else {
                    setError('Nie udało się pobrać danych podsumowania testu.');
                }
            } catch (err) {
                setError(`Wystąpił błąd: ${err.message}`);
            }
        };

        if (id) {
            fetchTestSummary();
        } else {
            setError('Brak id zakończonego testu.');
        }
    }, [id]);

    // Dodanie zabezpieczenia, że testSummary oraz questions są dostępne
    if (!testSummary || !testSummary.questions) {
        return error ? <p>{error}</p> : <p>Ładowanie podsumowania...</p>;
    }

    const { completedTest, questions, correctAnswers } = testSummary;
    const { selectedAnswer, questionScores, score, Test: testDetails } = completedTest;

    const totalPoints = Array.isArray(questions) ? questions.length : 0; // Upewniamy się, że questions jest tablicą

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.summaryContainer}>
                <div className={styles.summaryHeader}>
                    <h1>Podsumowanie Testu: {testDetails.name}</h1>
                    <p>
                        Twój wynik: {score} / {totalPoints}
                    </p>
                </div>
                <div className={styles.questionsSummary}>
                    {questions.map((question) => {
                        const userAnswers = selectedAnswer[question.id] || [];
                        const correct = correctAnswers[question.id] || [];
                        const scoreForQuestion = questionScores[question.id] || 0;

                        return (
                            <div key={question.id} className={styles.questionBlock}>
                                <h3>{question.content}</h3>
                                <ul>
                                    {question.answers.map((answer) => {
                                        const isCorrect = correct.includes(answer.id);
                                        const isSelected = userAnswers.includes(answer.id);

                                        return (
                                            <li
                                                key={answer.id}
                                                className={`${styles.answer} 
                                                        ${isCorrect ? styles.correctAnswer : ''} 
                                                        ${isSelected && !isCorrect ? styles.userAnswer : ''} 
                                                        ${isCorrect && isSelected ? styles.bothStyles : ''}`}
                                            >
                                                {answer.content}
                                            </li>
                                        );
                                    })}
                                </ul>
                                <p>
                                    Wynik pytania: {scoreForQuestion} / 1
                                </p>
                            </div>
                        );
                    })}
                    <button onClick={() => navigate('/mytests')}>Powrót do testów</button>
                </div>
            </div>
        </div>
    );

};

export default TestSummaryPage;
