import React, { useState } from 'react';

const ManageSet = ({ setId, initialName, initialPrivacy, onClose, onUpdate, onSetUpdated }) => {
  const [name, setName] = useState(initialName);
  const [isPublic, setIsPublic] = useState(initialPrivacy);
  const [keyWords, setKeyWords] = useState('');
  const [message, setMessage] = useState('');

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

      onUpdate({ name, isPublic });
      onSetUpdated();
      setMessage('Zestaw został zaktualizowany!');
      onClose();
    } catch (error) {
      console.error(error);
      setMessage('Błąd: ' + error.message);
    }
  };

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
          value={isPublic} 
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
