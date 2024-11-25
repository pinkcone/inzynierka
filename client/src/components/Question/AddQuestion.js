import React, { useState } from 'react';

const AddQuestion = ({ setId, onQuestionAdded }) => {
  const [formData, setFormData] = useState({ content: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/questions/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, setId })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Pytanie zostało dodane!');
        setFormData({ content: '' });
        onQuestionAdded(result.id); 
      } else {
        setMessage('Wystąpił błąd podczas dodawania pytania.');
      }
    } catch (error) {
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div className="container">
      <h2>Dodaj pytanie</h2>
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
            required={true}
          />
        </div>
        <button type="submit" className="btn btn-primary">Dodaj Pytanie</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AddQuestion;
