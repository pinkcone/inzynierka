import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const EditAnswer = () => {
  const { id } = useParams(); 
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Parametr id:', id); 

    const fetchAnswer = async () => {
      if (!id) {
        console.error('Brak id w URL');
        setError('Brak ID odpowiedzi w URL.');
        return;
      }

      try {
        console.log('Pobieranie odpowiedzi o ID:', id); 
        const response = await fetch(`/api/answers/${id}`, { 
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
  }, [id]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) {
      console.error('Brak id w URL');
      setError('Brak ID odpowiedzi w URL.');
      return;
    }

    try {
      const response = await fetch(`/api/answers/edit/${id}`, { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: answer })
      });
      if (response.ok) {
        alert('Odpowiedź została zaktualizowana.');
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
