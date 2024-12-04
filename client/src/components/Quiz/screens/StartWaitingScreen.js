import React from 'react';
import styles from '../../../styles/StartWaitingScreen.module.css';

const StartWaitingScreen = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h2>Oczekiwanie na rozpoczęcie Quizu</h2>
                <div className={styles.dots}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
};

export default StartWaitingScreen;
