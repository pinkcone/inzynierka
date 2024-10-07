import React, { useState, useEffect } from 'react';
import styles from '../../styles/PageSet.module.css';

const CreateTestManual = ({ setId, onClose }) => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [totalTime, setTotalTime] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/questions/set/${setId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setQuestions(data);  
        } else {
          setError('Nie udało się pobrać pytań.');
        }
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania pytań.');
      }
    };

    fetchQuestions();
  }, [setId]);

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

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((q) => q !== questionId);
      }
      return [...prev, questionId];
    });
  };

  const handleCreateTest = () => {
    if (totalTime === '' || totalTime <= 0) {
      setTimeError('Musisz wprowadzić poprawny czas większy niż zero.');
      return;
    }

    console.log('Tworzenie testu z pytaniami:', selectedQuestions, 'Czas:', totalTime);
    onClose();
  };

  return (
    <div className={styles.manualPopup}>
      <button className={styles.popupClose} onClick={onClose}>X</button>
      <h3>Tworzenie testu ręcznie </h3> 
      
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

      <h4>Wybierz pytania:</h4>

      {error && <p className={styles.error}>{error}</p>} 

      {questions.length > 0 ? (
        questions.map((question) => (
          <div key={question.id}>
            <input
              type="checkbox"
              checked={selectedQuestions.includes(question.id)}
              onChange={() => handleQuestionSelect(question.id)}
            />
            {question.content}
          </div>
        ))
      ) : (
        <p>Brak pytań w zestawie.</p>
      )}

      <button onClick={handleCreateTest}>Utwórz test</button>
    </div>
  );
};

export default CreateTestManual;
