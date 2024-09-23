import React, { useState } from 'react';
import styles from '../styles/Flashcards.module.css';
import Navbar from './Navbar/Navbar';

const Flashcards = () => {
    const [currentCard, setCurrentCard] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [progress, setProgress] = useState([]); // Track progress

    // Questions and answers hardcoded for now
    const cards = [
        { question: 'Pytanie 1', answer: 'Odpowiedź 1' },
        { question: 'Pytanie 2', answer: 'Odpowiedź 2' },
        { question: 'Pytanie 3', answer: 'Odpowiedź 3' },
        { question: 'Pytanie 4', answer: 'Odpowiedź 4' },
        { question: 'Pytanie 5', answer: 'Odpowiedź 5' },

    ];

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

    const handleSidebarClick = (section) => {
        setActiveSection(section);
    };

    const handleSidebarClose = () => {
        setActiveSection('');
    };

    // Handle user feedback and update progress bar from left to right
    const handleFeedback = (level) => {
        const newProgress = [...progress];

        // If progress array has the same length as cards, we update the existing value
        if (newProgress.length < cards.length) {
            if (level === 'good') newProgress.push('green');
            else if (level === 'neutral') newProgress.push('yellow');
            else newProgress.push('red');
        } else {
            newProgress[currentCard] = level === 'good' ? 'green' : level === 'neutral' ? 'yellow' : 'red';
        }

        setProgress(newProgress);
        nextCard();
    };

    return (
        <div className={styles.appContainer}>
            <Navbar />
            <div className={styles.mainContent}>

                <div className={styles.content}>
                    <h2>Aktualny Zestaw Fiszek</h2>

                    {/* Progress Bar */}
                    <div className={styles.progressBar}>
                        {Array.from({ length: cards.length }, (_, index) => (
                            <div
                                key={index}
                                className={`${styles.progressTile} ${progress[index] ? styles[progress[index]] : ''}`} // Apply color
                            />
                        ))}
                    </div>

                    <div className={`${styles.card} ${flipped ? styles.flipped : ''}`} onClick={flipCard}>
                        <div className={styles.cardInner}>
                            <div className={styles.cardFront}>
                                {cards[currentCard].question}
                            </div>
                            <div className={styles.cardBack}>
                                {cards[currentCard].answer}
                            </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); prevCard(); }} className={`${styles.arrow} ${styles.left}`}>&#9664;</button>
                        <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className={`${styles.arrow} ${styles.right}`}>&#9654;</button>
                    </div>

                    {/* Emotion Buttons */}
                    <div className={styles.emotions}>
                        <span onClick={() => handleFeedback('good')}>&#128512;</span> {/* Good */}
                        <span onClick={() => handleFeedback('neutral')}>&#128528;</span> {/* Neutral */}
                        <span onClick={() => handleFeedback('bad')}>&#128577;</span> {/* Bad */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flashcards;
