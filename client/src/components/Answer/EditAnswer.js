import React, { useEffect, useState } from 'react';

const EditAnswer = ({ answerId, onClose, onAnswerEdited }) => {
  const [answer, setAnswer] = useState('');
  const [isTrue, setIsTrue] = useState('true'); 
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); 

  useEffect(() => {
    const fetchAnswer = async () => {
      if (!answerId) {
        setError('Brak ID odpowiedzi.');
        return;
      }

      try {
        const response = await fetch(`/api/answers/${answerId}`, { 
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAnswer(data.content);
          setIsTrue(data.isTrue ? 'true' : 'false');
        } else {
          setError('Nie udało się pobrać odpowiedzi.');
        }
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania odpowiedzi.');
      }
    };

    fetchAnswer();
  }, [answerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/answers/edit/${answerId}`, { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: answer,
          isTrue: isTrue === 'true'
        })
      });

      if (response.ok) {
        setMessage('Odpowiedź została zaktualizowana.');
        onAnswerEdited(); 
        setTimeout(() => {
          setMessage('');
          onClose();
        }, 3000);
      } else {
        setError('Nie udało się zaktualizować odpowiedzi.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas aktualizacji odpowiedzi.');
    }
  };

  return (
    <div>
      <h2>Edytuj Odpowiedź</h2>
      
      {message && <div className="alert alert-success">{message}</div>}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <textarea 
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Edytuj treść odpowiedzi"
        />
        <label>
          Czy to jest poprawna odpowiedź?
          <select
            value={isTrue}
            onChange={(e) => setIsTrue(e.target.value)}
          >
            <option value="true">Poprawna</option>
            <option value="false">Fałszywa</option>
          </select>
        </label>
        <button type="submit">Zapisz zmiany</button>
      </form>
    </div>
  );
};

export default EditAnswer;
