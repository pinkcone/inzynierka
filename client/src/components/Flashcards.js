import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Flashcards.module.css';
import Navbar from './Navbar/Navbar';

const Flashcards = () => {
    const { setId } = useParams();
    const [currentCard, setCurrentCard] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [progress, setProgress] = useState([]); // Przechowywanie kolorów postępu
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);

    // Funkcja do pobrania fiszek z serwera
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

                // Inicjalizujemy tablicę postępu na szaro (domyślny stan)
                setProgress(Array(data.length).fill('gray'));

                // Pobieramy pierwsze pytanie i odpowiedzi
                if (data.length > 0) {
                    setCurrentCard(0);  // Ustawiamy na pierwszą fiszkę
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

    // Wywołanie pobierania pytania i odpowiedzi za każdym razem, gdy currentCard się zmieni
    useEffect(() => {
        if (cards.length > 0) {
            fetchQuestion(cards[currentCard].questionId);
        }
    }, [currentCard, cards]);

    const nextCard = () => {
        setCurrentCard((prevCard) => (prevCard + 1) % cards.length);
        setFlipped(false);
    };

    const prevCard = () => {
        setCurrentCard((prevCard) => (prevCard - 1 + cards.length) % cards.length);
        setFlipped(false);
    };

    const flipCard = () => {
        setFlipped(!flipped);
    };

    // Funkcja do wysyłania oceny na backend i aktualizacji postępu
    const handleFeedback = async (evaluation) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Brak tokenu autoryzacyjnego przy aktualizacji fiszki!');
            return;
        }

        try {
            const flashcardId = cards[currentCard].id;
            const response = await fetch(`/api/flashcards/update/${flashcardId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userRate: evaluation })
            });

            if (response.ok) {
                const updatedFlashcard = await response.json();
                console.log('Zaktualizowana fiszka:', updatedFlashcard);

                // Aktualizujemy postęp na podstawie oceny
                const newProgress = [...progress];
                if (evaluation === 1) {
                    newProgress[currentCard] = 'green';
                } else if (evaluation === 0) {
                    newProgress[currentCard] = 'yellow';
                } else if (evaluation === -1) {
                    newProgress[currentCard] = 'red';
                }
                setProgress(newProgress);

                nextCard(); // Przejście do następnej fiszki po ocenie
            } else {
                console.error('Błąd podczas aktualizacji fiszki:', response.statusText);
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji fiszki:', error);
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
                                        {/* Display question */}
                                        {question ? question.content : 'Brak fiszek do wyświetlenia'}
                                    </div>
                                    <div className={styles.cardBack}>
                                        {/* Display answer */}
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
                                <span onClick={() => handleFeedback(1)}>&#128512;</span> {/* good */}
                                <span onClick={() => handleFeedback(0)}>&#128528;</span> {/* neutral */}
                                <span onClick={() => handleFeedback(-1)}>&#128577;</span> {/* bad */}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Flashcards;
