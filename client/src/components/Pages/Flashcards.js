import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../styles/Flashcards.module.css';
import Navbar from '../Navbar/Navbar';
import { useSwipeable } from 'react-swipeable'; // Import biblioteki do obsługi swipe

const Flashcards = () => {
    const { setId } = useParams();
    const [currentCard, setCurrentCard] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [progress, setProgress] = useState([]); // Przechowywanie kolorów postępu
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [visitedCards, setVisitedCards] = useState([]);

    // Funkcja do pobrania fiszek z serwera
    const fetchFlashcards = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Brak tokenu autoryzacyjnego!');
            return;
        }

        try {
            const response = await fetch(`/api/flashcards/set/${setId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();

                // Sortowanie fiszek według currentLevel od najmniejszego do największego
                const sortedCards = data.sort((a, b) => a.currentLevel - b.currentLevel);

                setCards(sortedCards);
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
            const response = await fetch(`/api/questions/${questionId}`, {
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
            const response = await fetch(`/api/answers/question/correct/${questionId}`, {
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
        // Dodaj aktualne ID karty do historii
        setVisitedCards((prevHistory) => [...prevHistory, cards[currentCard].id]);

        // Przesuń kartę zgodnie z algorytmem
        moveCard(currentCard);
        setFlipped(false);
    };

    const prevCard = () => {
        if (visitedCards.length > 0) {
            // Pobierz ostatnie ID z historii
            const lastId = visitedCards[visitedCards.length - 1];

            // Znajdź indeks karty na podstawie ID
            const lastIndex = cards.findIndex((card) => card.id === lastId);
            if (lastIndex !== -1) {
                setCurrentCard(lastIndex); // Ustaw ostatnio przeglądaną kartę
            } else {
                console.warn('Nie znaleziono karty w tablicy.');
            }

            // Usuń ostatnie ID z historii
            setVisitedCards((prevHistory) => prevHistory.slice(0, -1));
        } else {
            console.warn('Brak poprzednich kart w historii.');
        }
        setFlipped(false);
    };

    const flipCard = () => {
        setFlipped(!flipped);
    };

    const calculateNewLevel = (evaluation, lastEvaluation) => {
        let currentLevel = cards[currentCard].currentLevel;
        if (evaluation === 1) {
            return Math.min(currentLevel + 1, 7); // Zwiększenie levelu o 1, maksymalnie 7
        } else if (evaluation === -1) {
            return Math.max(currentLevel - 1, 1); // Obniżenie levelu o 1, minimalnie 1
        } else if (evaluation === 0) {
            if (lastEvaluation === 1) {
                return Math.max(currentLevel - 1, 1);
            } else {
                return Math.min(currentLevel + 1, 7);
            }
        }
        return currentLevel;
    };

    const calculateNewStreak = (evaluation) => {
        let currentStreak = cards[currentCard].streak;
        if (evaluation === 1) {
            if (currentStreak < 0) return 0;
            return currentStreak + 1;
        }
        else if (evaluation === -1) {
            if (currentStreak > 0) return 0;
            return currentStreak - 1;
        } else return 0;
    };

    const handleFeedback = async (evaluation) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Brak tokenu autoryzacyjnego przy aktualizacji fiszki!');
            return;
        }

        try {
            const flashcardId = cards[currentCard].id; // Aktualizujemy obecną fiszkę
            const lastEvaluation = cards[currentCard].lastEvaluation;

            // Obliczamy nowe wartości
            const updatedLevel = calculateNewLevel(evaluation, lastEvaluation);
            const updatedStreak = calculateNewStreak(evaluation);
            const updatedEvaluation = evaluation;
            const updatedReviewed = new Date();

            // Wysyłamy zapytanie do serwera
            const response = await fetch(`/api/flashcards/update/${flashcardId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentLevel: updatedLevel,
                    streak: updatedStreak,
                    lastEvaluation: updatedEvaluation,
                    lastReviewed: updatedReviewed,
                }),
            });

            if (response.ok) {
                const updatedCard = {
                    ...cards[currentCard],
                    currentLevel: updatedLevel,
                    streak: updatedStreak,
                    lastEvaluation: updatedEvaluation,
                    lastReviewed: updatedReviewed,
                };

                const updatedCards = [...cards];
                updatedCards[currentCard] = updatedCard;

                // Dodajemy aktualne ID do historii
                setVisitedCards((prevHistory) => [...prevHistory, updatedCard.id]);

                // Przenosimy kartę na nowe miejsce
                const newCards = [...updatedCards];
                const [cardToMove] = newCards.splice(currentCard, 1); // Usuń aktualną kartę z bieżącej pozycji
                const newPosition = calculateInsertPosition(cardToMove); // Oblicz nową pozycję
                newCards.splice(newPosition, 0, cardToMove); // Wstaw kartę na obliczoną pozycję

                // Aktualizujemy tablicę fiszek i ustawiamy pierwszą kartę
                setCards(newCards);
                setFlipped(false);
                setCurrentCard(0); // Wyświetl pierwszą kartę po przestawieniu

                console.log('Fiszka zaktualizowana lokalnie');
            } else {
                console.error('Błąd podczas aktualizacji fiszki:', response.statusText);
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji fiszki:', error);
        }
    };

    const calculateInsertPosition = (card) => {
        const totalCards = cards.length;
        let targetIndex;
        const cardLvl = card.currentLevel;

        if (cardLvl === 7) {
            targetIndex = totalCards - 1;
        } else if (cardLvl === 1) {
            targetIndex = 3;
        }
        else {
            let levelFactor = (card.currentLevel) / 7;
            let streakFactor = (card.streak) / 6;
            let priorityScore = (levelFactor + streakFactor) / 2;
            targetIndex = Math.floor(priorityScore * totalCards);
            const rand = -3 + Math.random() * (3 - (-3)); // Losowy offset
            targetIndex += rand;
            if (targetIndex < 4) targetIndex = 4;
            if (targetIndex >= totalCards) targetIndex = totalCards - 1;
        }
        return targetIndex;
    };

    const moveCard = (cardIndex) => {
        setFlipped(false);
        const updatedCards = [...cards];
        const [card] = updatedCards.splice(cardIndex, 1); // Wycinamy fiszkę

        const targetIndex = calculateInsertPosition(card);
        updatedCards.splice(targetIndex, 0, card);

        setCards(updatedCards);
        setCurrentCard(0); 
    };

    const updateProgressBar = (cards) => {
        const totalCards = cards.length;

        const colorCounts = {
            green: 0,
            yellow: 0,
            red: 0,
            gray: 0
        };

        cards.forEach(card => {
            if (!card.lastReviewed) {
                colorCounts.gray += 1; 
            } else if (card.currentLevel >= 6) {
                colorCounts.green += 1; 
            } else if (card.currentLevel >= 4) {
                colorCounts.yellow += 1; 
            } else {
                colorCounts.red += 1; 
            }
        });

        const progressBarElements = [];
        ['green', 'yellow', 'red', 'gray'].forEach(color => {
            if (colorCounts[color] > 0) {
                progressBarElements.push(
                    <div
                        key={color}
                        className={`${styles.progressTile} ${styles[color]}`}
                        style={{
                            display: 'inline-block',
                            width: `${(colorCounts[color] / totalCards) * 100}%`
                        }}
                    />
                );
            }
        });

        return progressBarElements;
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => prevCard(),
        onSwipedRight: () => nextCard(),
    });

    let displayContent = question ? question.content : '';
    let imageUrl = '';
    if (displayContent) {
        const imageTagIndex = displayContent.indexOf('[Image]:');
        if (imageTagIndex !== -1) {
            imageUrl = displayContent.slice(imageTagIndex + '[Image]:'.length).trim();
            displayContent = displayContent.slice(0, imageTagIndex).trim();
        }
    }

    return (
        <div className={styles.appContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <div className={styles.content}>
                    <div className={styles.progressBar}>
                        {updateProgressBar(cards)}
                    </div>
                    {loading ? (
                        <p>Ładowanie fiszek...</p>
                    ) : (
                        <>
                            <div {...swipeHandlers} className={`${styles.card} ${flipped ? styles.flipped : ''}`} onClick={flipCard}>
                                <div className={styles.cardInner}>
                                    <div className={styles.cardFront}>
                                        {displayContent || 'Brak fiszek do wyświetlenia'}
                                        {imageUrl && <img src={imageUrl} alt="Question image"/>}
                                    </div>
                                    <div className={styles.cardBack}>
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
                                <button onClick={(e) => { e.stopPropagation(); prevCard(); }} className={`${styles.arrow} ${styles.left}`}><img src="/images/arrow.svg" alt="Poprzednia karta" /></button>
                                <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className={`${styles.arrow} ${styles.right}`}><img src="/images/arrow.svg" alt="Następna karta" /></button>
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
