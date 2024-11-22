import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import styles from '../../styles/TestPage.module.css';

const TestPage = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timer, setTimer] = useState(null);
    const [testFinished, setTestFinished] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const responseInfo = await fetch(`/api/tests/${code}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (responseInfo.ok) {
                    const dataInfo = await responseInfo.json();
                    setTimer(dataInfo.duration);

                    const responseQuestions = await fetch(`/api/tests/${code}/get-questions`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    });

                    if (responseQuestions.ok) {
                        const dataQuestions = await responseQuestions.json();
                        setQuestions(dataQuestions.questions);
                    } else {
                        setError('Nie udało się pobrać pytań do testu.');
                    }
                } else {
                    setError('Nie udało się pobrać danych testu.');
                }
            } catch (err) {
                setError(`Wystąpił błąd: ${err.message}`);
            }
        };

        fetchTestDetails();
    }, [code]);

    const submitTestResults = async (finalAnswers) => {
        try {
            const response = await fetch(`/api/completed-tests/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    selectedAnswer: finalAnswers,
                    code,
                }),
            });

            if (!response.ok) {
                throw new Error('Nie udało się wysłać wyników testu.');
            }

            const responseData = await response.json();
            const testId = responseData.completedTest.id;

            navigate(`/test-summary/${testId}`, { state: { selectedAnswers: finalAnswers, questions } });
        } catch (error) {
            setError(`Wystąpił błąd podczas wysyłania wyników: ${error.message}`);
        }
    };

    useEffect(() => {
        if (testFinished) {
            const finalAnswers = prepareSelectedAnswers();
            console.log("Final answers after test finished: ", finalAnswers);
            submitTestResults(finalAnswers);
        }
    }, [testFinished, questions, navigate]);


    const endTest = useCallback(() => {
        setTestFinished(true);
    }, []);



    useEffect(() => {
        if (timer === null) return;

        const countdown = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    endTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [timer, endTest]);


    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            endTest();
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleAnswerSelect = (answerIndex) => {
        const question = questions[currentQuestion];

        setSelectedAnswers((prev) => {
            if (question.type === 'multiple') {
                const currentAnswers = prev[currentQuestion] || [];
                if (currentAnswers.includes(answerIndex)) {
                    return {
                        ...prev,
                        [currentQuestion]: currentAnswers.filter((index) => index !== answerIndex),
                    };
                } else {
                    return {
                        ...prev,
                        [currentQuestion]: [...currentAnswers, answerIndex],
                    };
                }
            } else {
                return {
                    ...prev,
                    [currentQuestion]: [answerIndex],
                };
            }
        });
    };

    const prepareSelectedAnswers = () => {
        const formattedAnswers = {};

        questions.forEach((question, questionIndex) => {
            const userAnswers = selectedAnswers[questionIndex] || [];

            formattedAnswers[question.id] = userAnswers.length > 0
                ? userAnswers.map((index) => question.Answers[index]?.id)
                : [0];
        });

        return formattedAnswers;
    };



    const goToQuestion = (questionIndex) => {
        setCurrentQuestion(questionIndex);
    };

    const handleFinishTest = () => {
        endTest();
    };

    return (
        <div className={styles.appContainer}>
            <Navbar />
            <div className={styles.testPage}>
                <div className={styles.sidebarLeft}>
                    <div className={styles.timer}>
                        Czas pozostały:<br /> {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                    </div>
                </div>
                <div className={styles.testContainer}>
                    {error && <p className={styles.error}>{error}</p>}
                    {questions && questions.length > 0 ? (
                        <div className={styles.questionContainer}>
                            <h3>{questions[currentQuestion].content}</h3>
                            <div className={styles.answers}>
                                {questions[currentQuestion].Answers.map((answer, index) => (
                                    <button
                                        key={index}
                                        className={`${styles.answerButton} ${selectedAnswers[currentQuestion]?.includes(index) ? styles.selected : ''}`}
                                        onClick={() => handleAnswerSelect(index)}
                                    >
                                        {answer.content}
                                    </button>

                                ))}
                            </div>
                        </div>
                    ) : (
                        !error && <p>Ładowanie pytań...</p>
                    )}
                    <div className={styles.navigation}>
                        <button
                            className={styles.navButton}
                            onClick={handlePrevQuestion}
                            disabled={currentQuestion === 0}
                        >
                            Poprzednie pytanie
                        </button>
                        {currentQuestion === questions.length - 1 ? (
                            <button
                                className={`${styles.navButton} ${styles.finishButton}`}
                                onClick={handleFinishTest}
                            >
                                Zakończ test
                            </button>
                        ) : (
                            <button
                                className={styles.navButton}
                                onClick={handleNextQuestion}
                                disabled={currentQuestion === questions.length - 1}
                            >
                                Następne pytanie
                            </button>
                        )}
                    </div>
                </div>
                <div className={styles.sidebarRight}>
                    <p>Numer pytania:</p>
                    <div className={styles.questionMap}>
                        {questions.map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.mapTile} ${selectedAnswers[index] !== undefined ? styles.answered : ''} ${currentQuestion === index ? styles.current : ''}`}
                                onClick={() => goToQuestion(index)}
                            >
                                {index + 1}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPage;
