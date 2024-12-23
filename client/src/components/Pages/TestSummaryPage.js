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
            console.log("Rozpoczęto pobieranie podsumowania testu...");
            try {
                if (!id) {
                    console.warn("Brak ID testu w parametrze URL.");
                    setError('Brak id zakończonego testu.');
                    return;
                }

                console.log("ID testu:", id);
                const response = await fetch(`/api/completed-tests/get-test/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                console.log("Status odpowiedzi z backendu:", response.status);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Błąd odpowiedzi z backendu:", errorText);
                    setError('Nie udało się pobrać danych podsumowania testu.');
                    return;
                }

                const data = await response.json();
                console.log("Dane otrzymane z backendu:", data);

                if (typeof data.completedTest.selectedAnswer === 'string') {
                    console.log("Parsuję selectedAnswer...");
                    data.completedTest.selectedAnswer = JSON.parse(data.completedTest.selectedAnswer);
                } else {
                    console.warn("selectedAnswer już jest obiektem:", data.completedTest.selectedAnswer);
                }

                if (typeof data.completedTest.questionScores === 'string') {
                    console.log("Parsuję questionScores...");
                    data.completedTest.questionScores = JSON.parse(data.completedTest.questionScores);
                } else {
                    console.warn("questionScores już jest obiektem:", data.completedTest.questionScores);
                }

                console.log("Dane po parsowaniu:", data);
                setTestSummary(data);
            } catch (err) {
                console.error("Błąd podczas pobierania danych:", err.message);
                setError(`Wystąpił błąd: ${err.message}`);
            }
        };

        fetchTestSummary();
    }, [id]);

    if (!testSummary || !testSummary.questions) {
        console.log("Brak danych lub pytania są puste:", { testSummary, error });
        return error ? <p>{error}</p> : <p>Ładowanie podsumowania...</p>;
    }

    const { completedTest, questions, correctAnswers } = testSummary;
    const { selectedAnswer, questionScores, score, Test: testDetails } = completedTest;

    const totalPoints = Array.isArray(questions) ? questions.length : 0;

    console.log("Renderowanie podsumowania testu...");
    console.log("Test Details:", testDetails);
    console.log("Total Points:", totalPoints);
    console.log("Selected Answers:", selectedAnswer);
    console.log("Question Scores:", questionScores);

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.summaryContainer}>
                <div className={styles.summaryHeader}>
                    <h1>Podsumowanie Testu: {testDetails.name}</h1>
                    <p>
                        Twój wynik: {Math.round(score * 100) / 100} / {totalPoints}
                    </p>
                </div>
                <div className={styles.questionsSummary}>
                    {questions.map((question) => {
                        console.log("Pytanie:", question);
                        const userAnswers = selectedAnswer[question.id] || [];
                        const correct = correctAnswers[question.id] || [];
                        const scoreForQuestion = questionScores[question.id] || 0;

                        let displayContent = question.content || '';
                        let imageUrl = null;
                        const imageTagIndex = displayContent.indexOf('[Image]:');
                        if (imageTagIndex !== -1) {
                            imageUrl = displayContent.slice(imageTagIndex + '[Image]:'.length).trim();
                            displayContent = displayContent.slice(0, imageTagIndex).trim();
                        }

                        console.log("Obraz URL:", imageUrl);
                        console.log("Odpowiedzi użytkownika:", userAnswers);
                        console.log("Poprawne odpowiedzi:", correct);
                        console.log("Wynik za pytanie:", scoreForQuestion);

                        return (
                            <div key={question.id} className={styles.questionBlock}>
                                <h3>{displayContent}</h3>
                                {imageUrl && (
                                    <img
                                        src={imageUrl}
                                        alt="Obraz do pytania"
                                        style={{ maxWidth: '200px', height: 'auto', marginTop: '10px' }}
                                    />
                                )}
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
                                    Wynik pytania: {Math.round(scoreForQuestion * 100) / 100} / 1
                                </p>
                            </div>
                        );
                    })}
                    <button className={styles.crudbutton} onClick={() => navigate('/mytests')}>Powrót do testów</button>
                </div>
            </div>
        </div>
    );
};

export default TestSummaryPage;
