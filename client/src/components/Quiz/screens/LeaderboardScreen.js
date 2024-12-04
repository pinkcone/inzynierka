import React from 'react';
import styles from '../../../styles/StartWaitingScreen.module.css';

const LeaderboardScreen = ({leaderboard, answerResult}) => {
    console.log(answerResult);
    return (
        <div className={styles.container}>
            <div className={styles.content}>
            {answerResult === true ? (
                    <h2 className={styles.resultMessageCorrect}>Odpowiedź poprawna! Tak trzymaj!</h2>
                ) : (
                    <h2 className={styles.resultMessageWrong}>Niestety, błędna odpowiedź.</h2>
                )}
                <h2>Ranking: </h2>
                <ul className={styles.leaderboard}>
                    {leaderboard.map((participant, index) => (
                        <li key={index} className={styles.leaderboardItem}>
                            <h3 className={styles.span}>{index + 1}. {participant.name}</h3> <h3> {participant.score} pkt</h3>
                            {participant.streak > 0 ? (<p>&#128293;</p>):(<></>)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LeaderboardScreen;