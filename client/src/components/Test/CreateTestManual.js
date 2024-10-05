import React, { useState } from 'react';
import styles from '../../styles/PageSet.module.css';

const CreateTestManual = ({ onClose }) => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [totalTime, setTotalTime] = useState('');

  const handleQuestionSelect = (question) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(question)) {
        return prev.filter((q) => q !== question);
      }
      return [...prev, question];
    });
  };

  const handleCreateTest = () => {
    console.log('Tworzenie testu z pytaniami tu bedzie:', selectedQuestions, 'Czas:', totalTime);
    onClose();
  };

  return (
    <div className={styles.manualPopup}>
      <button className={styles.popupClose} onClick={onClose}>X</button>
      <h3>Tworzenie testu ręcznie</h3>
      
      <label>
        Czas na cały test (minuty):
        <input
          type="number"
          value={totalTime}
          onChange={(e) => setTotalTime(e.target.value)}
          min="1" 
        />
      </label>

      <h4>Wybierz pytania:</h4>
      {/* tu endpoincik damy */}
      {['Pytanie 1', 'Pytanie 2', 'Pytanie 3'].map((question) => (
        <div key={question}>
          <input
            type="checkbox"
            checked={selectedQuestions.includes(question)}
            onChange={() => handleQuestionSelect(question)}
          />
          {question}
        </div>
      ))}

      <button onClick={handleCreateTest}>Utwórz test</button>
    </div>
  );
};

export default CreateTestManual;
