import React, { useState } from 'react';
import styles from '../../styles/PageSet.module.css';

const CreateTestAutomatic = ({ onClose }) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [totalTime, setTotalTime] = useState('');
  const [error, setError] = useState('');

  const handleGenerateTest = () => {
    const numQuestions = parseInt(numberOfQuestions, 10);
    const time = parseInt(totalTime, 10);
    
    if (numQuestions <= 0 || time <= 0) {
      setError('Liczba pytań i czas muszą być dodatnie.');
      return;
    }
    
    console.log('Do generowanie testu automatycznego przekazuje:', numQuestions, 'Czas:', time);
    setError(''); 
    onClose(); 
  };

  return (
    <div className={styles.automaticPopup}>
      <button className={styles.popupClose} onClick={onClose}>X</button>
      <h3>Generowanie testu automatycznie</h3>

      <label>
        Liczba pytań:
        <input
          type="number"
          value={numberOfQuestions}
          onChange={(e) => setNumberOfQuestions(e.target.value)}
          min="1" 
        />
      </label>

      <label>
        Czas na cały test (minuty):
        <input
          type="number"
          value={totalTime}
          onChange={(e) => setTotalTime(e.target.value)}
          min="1" 
        />
      </label>

      {error && <p className={styles.error}>{error}</p>} 

      <button onClick={handleGenerateTest}>Generuj test</button>
    </div>
  );
};

export default CreateTestAutomatic;
