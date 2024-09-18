import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddSet = () => {
  const [formData, setFormData] = useState({
    name: '',
    isPublic: true,
    keyWords: ''
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sets/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Zestaw został utworzony!');
        setFormData({ name: '', isPublic: true, keyWords: '' });
        navigate('/mysets');
      } else {
        setMessage('Wystąpił błąd podczas tworzenia zestawu.');
      }
    } catch (error) {
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div className="container">
      <h2>Utwórz Zestaw</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name">Nazwa:</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="isPublic">Publiczny:</label>
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="keyWords">Słowa kluczowe:</label>
          <input
            type="text"
            id="keyWords"
            name="keyWords"
            className="form-control"
            value={formData.keyWords}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Utwórz Zestaw</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AddSet;
