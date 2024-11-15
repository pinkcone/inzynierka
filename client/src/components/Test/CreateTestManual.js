import React, { useState, useEffect } from 'react';
import styles from '../../styles/PageSet.module.css';
import {useNavigate} from "react-router-dom";

const CreateTestManual = ({ setId, onClose }) => {
  const [testName, setTestName] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [totalTime, setTotalTime] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [testNameError, setTestNameError] = useState('');
  const [timeError, setTimeError] = useState('');
  const navigate = useNavigate();

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

  const handleTestNameChange = (e) => {
    setTestName(e.target.value);
  }

  const handleCreateTest = async () => {
    const time = parseInt(totalTime, 10);

    if (selectedQuestions.length === 0) {
      setError('Musisz wybrać co najmniej jedno pytanie.');
      return;
    }
    if (!time || time <= 0) {
      setTimeError('Czas musi być większy niż zero.');
      return;
    }

    try {
      const response = await fetch(`/api/tests/create-manual/${setId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          duration: time,
          questionIds: selectedQuestions,
          name: testName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Utworzono test:', data);
        navigate('/mytests');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Błąd podczas tworzenia testu.');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas tworzenia testu.');
    }
  };

  return (
    <div className={styles.manualPopup}>
      <button className={styles.popupClose} onClick={onClose}>X</button>
      <h3>Tworzenie testu ręcznie </h3>

      <label>
        Nazwa testu:
        <input
            type="text"
            value={testName}
            onChange={handleTestNameChange}
            placeholder="Wprowadź nazwę testu"
        />
      </label>
      {testNameError && <p className={styles.error}>{setTestNameError}</p>}
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
