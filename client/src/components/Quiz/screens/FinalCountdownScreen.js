import React from 'react';
import styles from '../../../styles/StartWaitingScreen.module.css';

const FinalCountdownScreen = ({ countdown }) => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h2>To już koniec! Klasyfikacja końcowa za...</h2>
                <div className={styles.counter}>
                    <span key={countdown} className={styles.counterNumber}>
                        {countdown}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FinalCountdownScreen;