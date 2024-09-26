import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Flashcards.module.css';
import Navbar from './Navbar/Navbar';

const Flashcards = () => {
    const { setId } = useParams();
    const [currentCard, setCurrentCard] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [progress, setProgress] = useState([]);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    
    const fetchFlashcards = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Brak tokenu autoryzacyjnego!');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/flashcards/set/${setId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCards(data);
                setLoading(false);

                if (data.length > 0) {
                    fetchQuestion(data[currentCard].questionId);
                }
            } else {
                console.error('Błąd podczas pobierania fiszek:', response.statusText);
                setLoading(false);
            }
        } catch (error) {
            console.error('Błąd podczas pobierania fiszek:', error);
            setLoading(false);
        }
    };

    const fetchQuestion = async (questionId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/questions/${questionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setQuestion(data);
                fetchAnswers(questionId);
            } else {
                console.error('Błąd podczas pobierania pytania:', response.statusText);
            }
        } catch (error) {
            console.error('Błąd podczas pobierania pytania:', error);
        }
    };

    const fetchAnswers = async (questionId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/answers/question/correct/${questionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAnswers(data);
            } else {
                console.error('Błąd podczas pobierania odpowiedzi:', response.statusText);
            }
        } catch (error) {
            console.error('Błąd podczas pobierania odpowiedzi:', error);
        }
    };

    useEffect(() => {
        fetchFlashcards();
    }, [setId]);

    const nextCard = () => {
        setCurrentCard((prevCard) => (prevCard + 1) % cards.length);
        setFlipped(false);
        fetchQuestion(cards[currentCard].questionId);
    };

    const prevCard = () => {
        setCurrentCard((prevCard) => (prevCard - 1 + cards.length) % cards.length);
        setFlipped(false);
        fetchQuestion(cards[currentCard].questionId);
    };

    const flipCard = () => {
        setFlipped(!flipped);
    };

    const handleFeedback = async (level) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Brak tokenu autoryzacyjnego przy aktualizacji postępu!');
            return;
        }

        try {
            const newProgress = [...progress];

            await fetch(`/api/single-flashcard/update/${cards[currentCard].id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    evaluation: level === 'good' ? 1 : level === 'neutral' ? 0 : -1
                })
            });

            if (newProgress.length < cards.length) {
                newProgress.push(level === 'good' ? 'green' : level === 'neutral' ? 'yellow' : 'red');
            } else {
                newProgress[currentCard] = level === 'good' ? 'green' : level === 'neutral' ? 'yellow' : 'red';
            }

            setProgress(newProgress);
            nextCard();
        } catch (error) {
            console.error('Błąd podczas aktualizacji postępu fiszki:', error);
        }
    };

    return (
        <div className={styles.appContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <div className={styles.content}>
                    <h2>Aktualny Zestaw Fiszek</h2>

                    {loading ? (
                        <p>Ładowanie fiszek...</p>
                    ) : (
                        <>
                            <div className={styles.progressBar}>
                                {Array.from({ length: cards.length }, (_, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.progressTile} ${progress[index] ? styles[progress[index]] : ''}`}
                                    />
                                ))}
                            </div>

                            <div className={`${styles.card} ${flipped ? styles.flipped : ''}`} onClick={flipCard}>
                                <div className={styles.cardInner}>
                                    <div className={styles.cardFront}>
                                        {/* Wyświetlamy pytanie */}
                                        {question ? question.content : 'Brak fiszek do wyświetlenia'}
                                    </div>
                                    <div className={styles.cardBack}>
                                        {/* Wyświetlamy odpowiedzi */}
                                        {answers.length > 0 ? (
                                            <ul>
                                                {answers.map((answer) => (
                                                    <li key={answer.id}>{answer.content}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            'Brak odpowiedzi'
                                        )}
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); prevCard(); }} className={`${styles.arrow} ${styles.left}`}>&#9664;</button>
                                <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className={`${styles.arrow} ${styles.right}`}>&#9654;</button>
                            </div>

                            <div className={styles.emotions}>
                                <span onClick={() => handleFeedback('good')}>&#128512;</span>
                                <span onClick={() => handleFeedback('neutral')}>&#128528;</span>
                                <span onClick={() => handleFeedback('bad')}>&#128577;</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Flashcards;
