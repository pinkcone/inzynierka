import React from 'react';
import styles from '../../styles/PopupConfirmation.module.css';

const PopupConfirmation = ({ message, onConfirm, onCancel }) => {
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <p>{message}</p>
        <div className={styles.actions}>
          <button onClick={onConfirm} className={styles.confirm}>Tak</button>
          <button onClick={onCancel} className={styles.cancel}>Nie</button>
        </div>
      </div>
    </div>
  );
};

export default PopupConfirmation;
