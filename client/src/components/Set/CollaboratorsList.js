import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/PageSet.module.css';

const CollaboratorsList = ({ setId }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);  
  const [collaboratorToDelete, setCollaboratorToDelete] = useState(null); 

  const fetchCollaborators = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokenu uwierzytelniającego. Zaloguj się ponownie.');
      }

      const response = await axios.get(`/api/sets/${setId}/collaborators`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCollaborators(response.data.collaborators);
    } catch (err) {
      setErrorMessage('Nie udało się załadować współtwórców.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async () => {
    if (!collaboratorToDelete) return;

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokenu uwierzytelniającego. Zaloguj się ponownie.');
      }

      await axios.delete(`/api/sets/${setId}/collaborators/${collaboratorToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCollaborators((prev) => prev.filter((collab) => collab.id !== collaboratorToDelete));
      setSuccessMessage('Współtwórca usunięty pomyślnie.');
    } catch (err) {
      setErrorMessage('Nie udało się usunąć współtwórcy.');
      console.error(err.message);
    } finally {
      setLoading(false);
      setShowModal(false);  
    }
  };

  const handleDeleteClick = (userId) => {
    setCollaboratorToDelete(userId); 
    setShowModal(true); 
  };

  const handleCancelDelete = () => {
    setShowModal(false); 
    setCollaboratorToDelete(null);
  };

  useEffect(() => {
    fetchCollaborators();
  }, [setId]);

  if (loading) return <p>Ładowanie...</p>;

  return (
    <div>
      {(successMessage || errorMessage) && (
        <div className={`${styles.alert} ${successMessage ? styles.alertSuccess : styles.alertDanger}`}>
          {successMessage || errorMessage}
        </div>
      )}

      <h3>Lista współtwórców</h3>
      {collaborators.length === 0 ? (
        <p>Twój zestaw nie posiada współtwórców.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Data dodania</th>
              <th>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {collaborators.map(({ id, email, addedAt }) => (
              <tr key={id}>
                <td>{email}</td>
                <td>{new Date(addedAt).toLocaleString()}</td>
                <td>
                  <button
                    className={styles.buttonDelete}
                    onClick={() => handleDeleteClick(id)} 
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h4>Czy na pewno chcesz usunąć tego współtwórcę?</h4>
            <div>
              <button className={styles.button} onClick={handleCancelDelete}>Anuluj</button>
              <button className={styles.button} onClick={removeCollaborator}>Potwierdź</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorsList;
