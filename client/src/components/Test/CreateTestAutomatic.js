import React, { useState } from 'react';
import styles from '../../styles/PageSet.module.css';

const CreateTestAutomatic = ({ setId, onClose }) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [totalTime, setTotalTime] = useState('');
  const [questionsError, setQuestionsError] = useState('');
  const [timeError, setTimeError] = useState('');

  const handleQuestionsChange = (e) => {
    const value = e.target.value;

    if (!/^[0-9]*$/.test(value)) {
      setQuestionsError('Liczba pytań musi być dodatnią liczbą całkowitą.');
      setNumberOfQuestions(''); 
    } else {
      setQuestionsError(''); 
      setNumberOfQuestions(value);
    }
  };

  const handleTimeChange = (e) => {
    const value = e.target.value;

    if (!/^[0-9]*$/.test(value)) {
      setTimeError('Czas musi być dodatnią liczbą całkowitą.');
      setTotalTime(''); 
    } else {
      setTimeError(''); 
      setTotalTime(value);
    }
  };

  const handleGenerateTest = () => {
    const numQuestions = parseInt(numberOfQuestions, 10);
    const time = parseInt(totalTime, 10);
    
    if (!numQuestions || numQuestions <= 0) {
      setQuestionsError('Liczba pytań musi być większa niż zero.');
    }

    if (!time || time <= 0) {
      setTimeError('Czas musi być większy niż zero.');
    }

    if (numQuestions > 0 && time > 0) {
      setQuestionsError('');
      setTimeError('');

      console.log('Generowanie testu automatycznego:');
      console.log('ID zestawu:', setId);
      console.log('Liczba pytań:', numQuestions, 'Czas:', time);

      onClose(); 
    }
  };

  return (
    <div className={styles.automaticPopup}>
      <button className={styles.popupClose} onClick={onClose}>X</button>
      <h3>Generowanie testu automatycznie </h3> 
      
      <label>
        Liczba pytań:
        <input
          type="text"
          value={numberOfQuestions}
          onChange={handleQuestionsChange}
          placeholder="Wprowadź liczbę pytań"
        />
      </label>
      {questionsError && <p className={styles.error}>{questionsError}</p>} 

      <label>
        Czas na cały test (minuty):
        <input
          type="text"
          value={totalTime}
          onChange={handleTimeChange}
          placeholder="Wprowadź czas"
        />
      </label>
      {timeError && <p className={styles.error}>{timeError}</p>} 

      <button onClick={handleGenerateTest}>Generuj test</button>
    </div>
  );
};

export default CreateTestAutomatic;