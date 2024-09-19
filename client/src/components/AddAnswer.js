import React, { useState } from 'react';

const AddAnswer = ({ questionId, onAnswerAdded }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

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
        onAnswerAdded(); 
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nie udało się dodać odpowiedzi.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas dodawania odpowiedzi.');
    }
  };

  return (
    <div className="add-answer-form">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Treść odpowiedzi"
          required
        />
        <button type="submit">Dodaj odpowiedź</button>
        {error && <div className="alert alert-danger">{error}</div>}
      </form>
    </div>
  );
};

export default AddAnswer;
