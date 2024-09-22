import React from 'react';

const DeleteSet = ({ setId, onClose, onSetDeleted }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/sets/delete/${setId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        onSetDeleted();
      } else {
        const errorData = await response.json();
        console.error(errorData.message || 'Nie udało się usunąć zestawu.');
      }
    } catch (err) {
      console.error('Wystąpił błąd podczas usuwania zestawu.', err);
    }
  };

  return (
    <div>
      <h3>Czy na pewno chcesz usunąć ten zestaw?</h3>
      <button onClick={handleDelete} className="confirmButton">Tak, usuń</button>
      <button onClick={onClose} className="cancelButton">Anuluj</button>
    </div>
  );
};

export default DeleteSet;
