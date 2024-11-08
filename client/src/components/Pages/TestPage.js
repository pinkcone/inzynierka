import React, {useState, useEffect, useCallback, useMemo} from 'react';
import styles from '../../styles/TestPage.module.css';
import Navbar from '../Navbar/Navbar';
import {useNavigate} from 'react-router-dom';

const TestPage = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timer, setTimer] = useState(30);
    const [testFinished, setTestFinished] = useState(false);

    const navigate = useNavigate();

    const questions = useMemo(() => [
        {
            question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,',
            answers: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,', 'Odpowiedź 2', 'Odpowiedź 3', 'Odpowiedź 4'],
            correctAnswerIndex: 0,
        },
        {
            question: 'Pytanie 2',
            answers: ['Odpowiedź 1', 'Odpowiedź 2', 'Odpowiedź 3', 'Odpowiedź 4'],
            correctAnswerIndex: 1,
        },
        {
            question: 'Pytanie 3',
            answers: ['Odpowiedź 1', 'Odpowiedź 2', 'Odpowiedź 3', 'Odpowiedź 4'],
            correctAnswerIndex: 2,
        },
        {
            question: 'Pytanie 4',
            answers: ['Odpowiedź 1', 'Odpowiedź 2', 'Odpowiedź 3', 'Odpowiedź 4'],
            correctAnswerIndex: 2,
        },
        {
            question: 'Pytanie 5',
            answers: ['Odpowiedź 1', 'Odpowiedź 2', 'Odpowiedź 3', 'Odpowiedź 4', 'Odpowiedź 2', 'Odpowiedź 2'],
            correctAnswerIndex: 4,
        },

    ], []);

    const endTest = useCallback(() => {
        setTestFinished(true);

        setTimeout(() => {
            navigate('/test-summary', {state: {selectedAnswers, questions}})
        }, 0)
    }, [selectedAnswers, questions, navigate]);

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    endTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [endTest]);

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
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion]: answerIndex,
        }));
    };

    const goToQuestion = (questionIndex) => {
        setCurrentQuestion(questionIndex);
    };

    const handleFinishTest = () => {
        endTest();
    };

    return (
        <div className={styles.appContainer}>
            <Navbar/>
            <div className={styles.testPage}>
                <div className={styles.sidebarLeft}>
                    <div className={styles.timer}>
                        Czas pozostały:<br/> {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                    </div>
                </div>
                <div className={styles.testContainer}>
                    <div className={styles.questionContainer}>
                        <h3>{questions[currentQuestion].question}</h3>
                        <div className={styles.answers}>
                            {questions[currentQuestion].answers.map((answer, index) => (
                                <button
                                    key={index}
                                    className={`${styles.answerButton} ${selectedAnswers[currentQuestion] === index ? styles.selected : ''}`}
                                    onClick={() => handleAnswerSelect(index)}
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </div>
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