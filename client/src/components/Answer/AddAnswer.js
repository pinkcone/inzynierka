import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../styles/AddAnswer.module.css';

const AddAnswer = ({ questionId, onAnswerAdded }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnswers = useCallback(async () => {
    try {
      const response = await fetch(`/api/answers/question/${questionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnswers(data);
      } else {
        setError('Nie udało się pobrać odpowiedzi.');
      }
    } catch (err) {
      setError('Błąd podczas pobierania odpowiedzi.');
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/answers/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ questionId, content })
      });

      if (response.ok) {
        setContent('');
        await fetchAnswers(); 
        onAnswerAdded();  
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nie udało się dodać odpowiedzi.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas dodawania odpowiedzi.');
    }
  };

  if (loading) {
    return <p>Ładowanie odpowiedzi...</p>;
  }

  return (
    <div className={styles.addAnswerSection}>
      <h3>Odpowiedzi:</h3>
      {error && <div className={styles.alert}>{error}</div>}

      <ul className={styles.answersList}>
        {answers.length > 0 ? (
          answers.map((answer) => (
            <li key={answer.id} className={styles.answerItem}>
              {answer.content}
            </li>
          ))
        ) : (
          <li>Brak odpowiedzi do tego pytania.</li>
        )}
      </ul>

      <div className={styles.addAnswerForm}>
        <form onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Treść odpowiedzi"
            required
          />
          <button type="submit" className={styles.button}>Dodaj odpowiedź</button>
        </form>
      </div>
    </div>
  );
};

export default AddAnswer;
