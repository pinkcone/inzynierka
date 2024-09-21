import React, { useState } from 'react';
import '../styles/Flashcards.css';
import Navbar from "./Navbar";

const Flashcards = () => {
    const [currentCard, setCurrentCard] = useState(0);
    const cards = ['Pytanie 1', 'Pytanie 2', 'Pytanie 3'];

    const nextCard = () => {
        setCurrentCard((prevCard) => (prevCard + 1) % cards.length);
    };

    const prevCard = () => {
        setCurrentCard((prevCard) => (prevCard - 1 + cards.length) % cards.length);
    };

    return (
        <div className="flashcards-container">
            <Navbar />
            <h2>Fiszki</h2>
            <div className="card">
                <button onClick={prevCard} className="arrow left">&#9664;</button>
                <div className="card-content">{cards[currentCard]}</div>
                <button onClick={nextCard} className="arrow right">&#9654;</button>
            </div>
            <div className="emotions">
                <span>&#128512;</span> {/* Uśmiechnięta twarz */}
                <span>&#128528;</span> {/* Neutralna twarz */}
                <span>&#128577;</span> {/* Smutna twarz */}
            </div>
        </div>
    );
};

export default Flashcards;
