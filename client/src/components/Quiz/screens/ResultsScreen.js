import React, { useState, useEffect } from 'react';
import styles from '../../../styles/StartWaitingScreen.module.css';
import Confetti from 'react-confetti';

const ResultsScreen = ({ results }) => {
    const [visibleParticipants, setVisibleParticipants] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (!results || results.length === 0) return;

        let currentIndex = results.length - 1; // Start from the last participant
        const interval = setInterval(() => {
            if (currentIndex < 0) {
                clearInterval(interval); // Stop the interval when done
                return;
            }

            const participant = results[currentIndex];
            if (participant) {
                // Add the current participant to the visible list
                setVisibleParticipants((prev) => [participant, ...prev]);

                // Show confetti for index 2, 1, and 0
                if (currentIndex <= 2) {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 999999); // Hide confetti after 2 seconds
                }
            }

            currentIndex -= 1; // Move to the previous participant
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
                        // Calculate the actual rank based on the original results array
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
