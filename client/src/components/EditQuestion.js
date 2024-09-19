import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditQuestion = () => {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const [questionContent, setQuestionContent] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    console.log('Parametr id:', id); 

    const fetchQuestion = async () => {
      if (!id) {
        console.error('Brak id w URL');
        setError('Brak ID pytania w URL.');
        setLoading(false);
        return;
      }

      try {
        console.log('Pobieranie pytania o ID:', id); 
        const response = await fetch(`/api/questions/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setQuestionContent(data.content);
          console.log('Treść pytania:', data.content); 
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Nie udało się pobrać pytania.');
        }
      } catch (err) {
        console.error('Błąd podczas pobierania pytania:', err);
        setError('Wystąpił błąd podczas pobierania pytania.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) {
      console.error('Brak id w URL');
      setError('Brak ID pytania w URL.');
      return;
    }

    try {
      const response = await fetch(`/api/questions/edit/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: questionContent })
      });

      if (response.ok) {
        alert('Pytanie zostało zaktualizowane.');
        navigate(`/page-set/${id}`); 
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nie udało się zaktualizować pytania.');
      }
    } catch (err) {
      console.error('Błąd podczas aktualizacji pytania:', err);
      setError('Wystąpił błąd podczas aktualizacji pytania.');
    }
  };

  if (loading) {
    return <p>Ładowanie...</p>;
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <h2>Edytuj Pytanie</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <textarea 
            value={questionContent} 
            onChange={(e) => setQuestionContent(e.target.value)} 
          />
          <button type="submit">Zapisz zmiany</button>
        </form>
      </div>
    </div>
  );
};

export default EditQuestion;
