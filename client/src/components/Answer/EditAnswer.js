import React, { useEffect, useState } from 'react';

const EditAnswer = ({ answerId, onClose, onAnswerEdited }) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

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
        body: JSON.stringify({ content: answer })
      });
      if (response.ok) {
        alert('Odpowiedź została zaktualizowana.');
        onAnswerEdited();
        onClose();
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
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <textarea 
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button type="submit">Zapisz zmiany</button>
      </form>
    </div>
  );
};

export default EditAnswer;
