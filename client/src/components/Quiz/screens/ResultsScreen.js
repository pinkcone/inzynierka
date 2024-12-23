import React, { useState, useEffect } from 'react';
import styles from '../../../styles/StartWaitingScreen.module.css';
import Confetti from 'react-confetti';

const ResultsScreen = ({ results }) => {
    const [visibleParticipants, setVisibleParticipants] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (!results || results.length === 0) return;

        let currentIndex = results.length - 1;
        const interval = setInterval(() => {
            if (currentIndex < 0) {
                clearInterval(interval);
                return;
            }

            const participant = results[currentIndex];
            if (participant) {
                setVisibleParticipants((prev) => [participant, ...prev]);

                if (currentIndex <= 2) {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 999999);
                }
            }

            currentIndex -= 1;
        }, 2000);

        return () => clearInterval(interval);
    }, [results]);

    return (
        <div className={styles.container}>
            {showConfetti && <Confetti />}
            <div className={styles.content}>
                <h2>Ranking: </h2>
                <ul className={styles.leaderboard}>
                    {visibleParticipants.map((participant) => {
                        const rank = results.findIndex((p) => p === participant) + 1;

                        return (
                            <li key={participant.name} className={styles.leaderboardItem}>
                                <h3 className={styles.span}>
                                    {rank}. {participant?.name || 'Brak danych'}
                                </h3>
                                <h3>{participant?.score || 0} pkt</h3>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default ResultsScreen;
