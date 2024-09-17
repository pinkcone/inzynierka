import React, { useState } from 'react';

const AddQuestion = ({ setId }) => {
  const [formData, setFormData] = useState({
    content: '',
    type: 'single'
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/quiz/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, setId })
      });

      if (response.ok) {
        setMessage('Pytanie zostało dodane!');
        setFormData({ content: '', type: 'single' });
      } else {
        setMessage('Wystąpił błąd podczas dodawania pytania.');
      }
    } catch (error) {
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div className="container">
      <h2>Dodaj Pytanie</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="content">Treść pytania:</label>
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
          <label htmlFor="type">Typ:</label>
          <select
            id="type"
            name="type"
            className="form-control"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="single">Jednokrotnego wyboru</option>
            <option value="multiple">Wielokrotnego wyboru</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Dodaj Pytanie</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AddQuestion;
