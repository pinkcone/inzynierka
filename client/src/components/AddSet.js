import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AddSet.module.css'; // Import modułu CSS

const AddSet = ({ onAddSet }) => {
  const [formData, setFormData] = useState({
    name: '',
    isPublic: true,
    keyWords: ''
  });

  const [nameError, setNameError] = useState('');
  const [keyWordsError, setKeyWordsError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Resetujemy błędy przy zmianie wartości
    if (e.target.name === 'name') {
      setNameError('');
    } else if (e.target.name === 'keyWords') {
      setKeyWordsError('');
    }
  };

  const validate = () => {
    let isValid = true;

    if (!formData.name.trim()) {
      setNameError('Nazwa zestawu jest wymagana.');
      isValid = false;
    }

    if (!formData.keyWords.trim()) {
      setKeyWordsError('Słowa kluczowe są wymagane.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja formularza
    if (!validate()) {
      return;
    }

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
        const newSet = await response.json();
        setMessage('Zestaw został utworzony!');
        setFormData({ name: '', isPublic: true, keyWords: '' });

        if (onAddSet) {
          onAddSet(newSet);
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Logowanie błędów
        setMessage(errorData.message || 'Wystąpił błąd podczas tworzenia zestawu.');
      }
    } catch (error) {
      console.error('Network error:', error); // Logowanie błędów sieci
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Utwórz Zestaw</h2>
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.mb3}>
          <label htmlFor="name">Nazwa:</label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.formControl}
            value={formData.name}
            onChange={handleChange}
          />
          {nameError && <div className="alert alert-danger">{nameError}</div>}
        </div>
        <div className={styles.mb3}>
          <label htmlFor="isPublic">Publiczny:</label>
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          />
        </div>
        <div className={styles.mb3}>
          <label htmlFor="keyWords">Słowa kluczowe:</label>
          <input
            type="text"
            id="keyWords"
            name="keyWords"
            className={styles.formControl}
            value={formData.keyWords}
            onChange={handleChange}
          />
          {keyWordsError && <div className="alert alert-danger">{keyWordsError}</div>}
        </div>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Utwórz Zestaw</button>
      </form>
    </div>
  );
};

export default AddSet;
