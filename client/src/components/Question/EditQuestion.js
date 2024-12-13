import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../styles/EditQuestion.module.css';

const EditQuestion = ({ questionId, onClose, onEditComplete }) => {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const [questionContent, setQuestionContent] = useState(''); 
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!questionId) {
        setError('Brak ID pytania do edycji.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/questions/${questionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setQuestionContent(data.content);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Nie udało się pobrać pytania.');
        }
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania pytania.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionId) {
      setError('Brak ID pytania do edycji.');
      return;
    }

    try {
      const response = await fetch(`/api/questions/edit/${questionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: questionContent })
      });

      if (response.ok) {
        setMessage('Pytanie zostało zaktualizowane.'); 
        onEditComplete();  
        setTimeout(() => {
          setMessage(''); 
          onClose(); 
          navigate(`/editset/${id}`);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nie udało się zaktualizować pytania.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas aktualizacji pytania.');
    }
  };

  if (loading) {
    return <p>Ładowanie...</p>;
  }

  return (

      <div className={styles.mainContent}>
        <h2>Edytuj pytanie</h2>
        
        {message && <div className={styles.alertSuccess}>{message}</div>}
        {error && <div className={styles.alertDanger}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <textarea 
            value={questionContent} 
            onChange={(e) => setQuestionContent(e.target.value)} 
            placeholder="Edytuj treść pytania"
          />
          <button type="submit">Zapisz zmiany</button>
        </form>
      </div>

  );
};

export default EditQuestion;
