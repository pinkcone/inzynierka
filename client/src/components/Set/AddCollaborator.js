import React, { useState } from 'react';

const AddCollaborator = ({ setId, onClose, onCollaboratorAdded }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/collaborators/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ setId, email }),
      });

      if (!response.ok) throw new Error('Nie udało się dodać współtwórcy.');

      onCollaboratorAdded();
      setMessage('Współtwórca został dodany!');
      onClose();
    } catch (error) {
      console.error(error);
      setMessage('Błąd: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="collaboratorEmail">Email współtwórcy:</label>
        <input 
          id="collaboratorEmail"
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
      </div>
      <button type="submit">Dodaj współtwórcę</button>
      <button type="button" onClick={onClose}>Anuluj</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default AddCollaborator;
