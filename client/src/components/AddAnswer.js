import React, { useState } from 'react';

const AddAnswer = ({ questionId }) => {
  const [formData, setFormData] = useState({
    content: '',
    isTrue: false
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'isTrue' ? e.target.checked : e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, questionId })
      });

      if (response.ok) {
        setMessage('Odpowiedź została dodana!');
        setFormData({ content: '', isTrue: false });
      } else {
        setMessage('Wystąpił błąd podczas dodawania odpowiedzi.');
      }
    } catch (error) {
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div className="container">
      <h2>Dodaj Odpowiedź</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="content">Treść odpowiedzi:</label>
          <input
            type="text"
            id="content"
            name="content"
            className="form-control"
            value={formData.content}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="isTrue">Poprawna:</label>
          <input
            type="checkbox"
            id="isTrue"
            name="isTrue"
            checked={formData.isTrue}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Dodaj Odpowiedź</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AddAnswer;
