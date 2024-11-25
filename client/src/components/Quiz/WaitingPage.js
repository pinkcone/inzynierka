import React from 'react';
import styles from '../../styles/WaitingPage.module.css'; 


const WaitingPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <h1>Idziesz jak błyskawica!</h1>
        <p>Nie bądź taki, zaczekaj na innych uczestników. Twoja odpowiedź jest już zapisana!</p>
        <div className={styles.lightning}></div>
        <p className={styles.waitingText}>Nie martw się, wszystko jest na dobrej drodze! 😊</p>
      </div>
    </div>
  );
};

export default WaitingPage;
