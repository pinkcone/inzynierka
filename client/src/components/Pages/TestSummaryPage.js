import React, { useEffect, useState } from 'react';
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
                const response = await fetch(`http://localhost:5000/api/completed-tests/get-test/${id}`, {
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

    if (!testSummary) {
        return error ? <p>{error}</p> : <p>Ładowanie podsumowania...</p>;
    }

    const { completedTest, correctAnswers } = testSummary;
    const { name, selectedAnswer, questionScores, score, Test: testDetails } = completedTest;

    return (
        <div className={styles.summaryPage}>
            <div className={styles.summaryHeader}>
                <h1>Podsumowanie Testu: {name}</h1>
            </div>
            <div className={styles.questionsSummary}>
                <h2>Kod testu: {testDetails.code}</h2>
                <p>Twój wynik: {score} / test</p>
                {Object.keys(selectedAnswer).map((questionId) => {
                    const userAnswers = selectedAnswer[questionId];
                    const correct = correctAnswers[questionId] || [];
                    const scoreForQuestion = questionScores[questionId] || 0;

                    return (
                        <div key={questionId} className={styles.questionBlock}>
                            <h3>Pytanie {questionId}</h3>
                            <ul>
                                <li className={styles.answer}>
                                    <strong>Twoje odpowiedzi:</strong>
                                    <span className={styles.selected}>{userAnswers.join(', ')}</span>
                                </li>
                                <li className={styles.answer}>
                                    <strong>Prawidłowe odpowiedzi:</strong>
                                    <span className={styles.correct}>{correct.join(', ')}</span>
                                </li>
                                <li className={styles.answer}>
                                    <strong>Wynik pytania:</strong>
                                    {scoreForQuestion === 1
                                        ? <span className={styles.correct}>Prawidłowo</span>
                                        : scoreForQuestion > 0
                                            ? 'Częściowo prawidłowo'
                                            : 'Błędnie'}
                                </li>
                            </ul>
                        </div>
                    );
                })}
                <button onClick={() => navigate('/mytests')}>Powrót do testów</button>
            </div>
        </div>
    );
};

export default TestSummaryPage;
