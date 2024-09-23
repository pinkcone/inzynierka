import React, { useState, useEffect } from 'react';

const ManageSet = ({ setId, onClose, onUpdate, onSetUpdated }) => {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [keyWords, setKeyWords] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); 

  const fetchSetDetails = async () => {
    try {
      const response = await fetch(`/api/sets/${setId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Nie udało się pobrać szczegółów zestawu.');
      }
      const setData = await response.json();

      setName(setData.name);
      setIsPublic(setData.isPublic);
      setKeyWords(setData.keyWords || '');
      setLoading(false);  
    } catch (error) {
      console.error(error);
      setMessage('Błąd: ' + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetDetails();
  }, [setId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/sets/edit/${setId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          isPublic,
          keyWords,
        }),
      });

      if (!response.ok) throw new Error('Nie udało się zaktualizować zestawu.');

      onUpdate({ name, isPublic, keyWords });
      onSetUpdated();
      setMessage('Zestaw został zaktualizowany!');
      onClose();
    } catch (error) {
      console.error(error);
      setMessage('Błąd: ' + error.message);
    }
  };

  if (loading) {
    return <p>Ładowanie danych zestawu...</p>; 
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="setName">Nazwa zestawu:</label>
        <input 
          id="setName"
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required
        />
      </div>
      <div>
        <label htmlFor="privacySelect">Prywatność:</label>
        <select 
          id="privacySelect"
          value={isPublic ? 'true' : 'false'} 
          onChange={(e) => setIsPublic(e.target.value === 'true')}
        >
          <option value="true">Publiczny</option>
          <option value="false">Prywatny</option>
        </select>
      </div>
      <div>
        <label htmlFor="keyWords">Słowa kluczowe:</label>
        <input 
          id="keyWords"
          type="text" 
          value={keyWords} 
          onChange={(e) => setKeyWords(e.target.value)} 
        />
      </div>
      <button type="submit">Zapisz zmiany</button>
      <button type="button" onClick={onClose}>Anuluj</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default ManageSet;
