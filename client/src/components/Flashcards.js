import React, { useState } from 'react';
import styles from '../styles/Flashcards.module.css';
import Navbar from './Navbar/Navbar';

const Flashcards = () => {
    const [currentCard, setCurrentCard] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const cards = [
        { question: 'Pytanie 1', answer: 'Odpowiedź 1' },
        { question: 'Pytanie 2', answer: 'Odpowiedź 2' },
        { question: 'Pytanie 3', answer: 'Odpowiedź 3' },
    ];

    const nextCard = (event) => {
        event.stopPropagation();  // Zatrzymaj propagację, aby nie obracać karty
        setCurrentCard((prevCard) => (prevCard + 1) % cards.length);
        setFlipped(false);  // Resetuj obrót przy zmianie karty
    };

    const prevCard = (event) => {
        event.stopPropagation();  // Zatrzymaj propagację, aby nie obracać karty
        setCurrentCard((prevCard) => (prevCard - 1 + cards.length) % cards.length);
        setFlipped(false);  // Resetuj obrót przy zmianie karty
    };

    const flipCard = () => {
        setFlipped(!flipped);
    };

    return (
        <div className={styles.appContainer}>
            <Navbar />
            <div className={styles.flashcardsContainer}>
                <h2>Fiszki</h2>
                <div className={`${styles.card} ${flipped ? styles.flipped : ''}`} onClick={flipCard}>
                    <div className={styles.cardInner}>
                        <div className={styles.cardFront}>
                            {cards[currentCard].question}
                        </div>
                        <div className={styles.cardBack}>
                            {cards[currentCard].answer}
                        </div>
                    </div>
                    <button onClick={prevCard} className={`${styles.arrow} ${styles.left}`}>&#9664;</button>
                    <button onClick={nextCard} className={`${styles.arrow} ${styles.right}`}>&#9654;</button>
                </div>
                <div className={styles.emotions}>
                    <span>&#128512;</span> {/* Uśmiechnięta twarz */}
                    <span>&#128528;</span> {/* Neutralna twarz */}
                    <span>&#128577;</span> {/* Smutna twarz */}
                </div>
            </div>
        </div>
    );
};

export default Flashcards;
