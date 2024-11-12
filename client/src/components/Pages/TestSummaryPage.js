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
                    // Parsowanie JSON dla selectedAnswer i questionScores
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
        <div className={styles.summaryContainer}>
            <h2>Podsumowanie Testu: {name}</h2>
            <p>Kod testu: {testDetails.code}</p>
            <p>Twój wynik: {score} / test</p>
            <div className={styles.questionResults}>
                {Object.keys(selectedAnswer).map((questionId) => {
                    const userAnswers = selectedAnswer[questionId];
                    const correct = correctAnswers[questionId] || [];
                    const scoreForQuestion = questionScores[questionId] || 0;

                    return (
                        <div key={questionId} className={styles.questionItem}>
                            <h3>Pytanie {questionId}</h3>
                            <p>Twoje odpowiedzi: {userAnswers.join(', ')}</p>
                            <p>Prawidłowe odpowiedzi: {correct.join(', ')}</p>
                            <p>
                                Wynik pytania: {scoreForQuestion === 1 ? 'Prawidłowo' : scoreForQuestion > 0 ? 'Częściowo prawidłowo' : 'Błędnie'}
                            </p>
                        </div>
                    );
                })}
            </div>
            <button onClick={() => navigate('/mytests')}>Powrót do testów</button>
        </div>
    );
};

export default TestSummaryPage;
