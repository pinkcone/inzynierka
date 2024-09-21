import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AddSet from './AddSet'; // Import AddSet
import styles from '../styles/MySets.module.css'; // Import modułu CSS

const MySets = () => {
  const [sets, setSets] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showAddSetPopup, setShowAddSetPopup] = useState(false); // Dodanie stanu do obsługi popupu
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch('/api/sets', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSets(data);
        } else {
          setError('Brak zestawów.');
        }
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania zestawów.');
      }
    };

    fetchSets();
  }, []);

  const handleAddSet = (newSet) => {
    setSets((prevSets) => [...prevSets, newSet]); // Dodanie nowego zestawu do listy
    setShowAddSetPopup(false); // Zamknięcie popupu po dodaniu zestawu
  };

  const handleDelete = async (setId) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten zestaw?')) {
      try {
        const response = await fetch(`/api/sets/delete/${setId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setSets(sets.filter((set) => set.id !== setId));
          setMessage('Zestaw został usunięty.');
        } else {
          const errorData = await response.json();
          setMessage(`Nie udało się usunąć zestawu: ${errorData.message}`);
        }
      } catch (error) {
        setMessage('Wystąpił błąd podczas usuwania zestawu.');
      }
    }
  };

  const handleOpen = (setId) => {
    navigate(`/page-set/${setId}`); 
  };

  const handleAddSetClick = () => {
    setShowAddSetPopup(true); // Otwórz popup z formularzem dodawania zestawu
  };

  const closePopup = () => {
    setShowAddSetPopup(false);
  };

  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <Sidebar />
        <div className={styles.content}>
          <h2 className={styles.textCenter}>Moje zestawy</h2>
          <button 
            onClick={handleAddSetClick} 
            className={styles.buttonPrimary}
          >
            Dodaj zestaw
          </button>
          {showAddSetPopup && (
            <div className={styles.popupOverlay}>
              <div className={styles.popup}>
                <button className={styles.closeButton} onClick={closePopup}>✖</button>
                <AddSet onAddSet={handleAddSet} />
              </div>
            </div>
          )}
          {error && <div className={styles.alertDanger}>{error}</div>}
          {message && <div className={styles.alertSuccess}>{message}</div>}

          {sets.length > 0 && (
            <ul className={styles.listGroup}>
              {sets.map((set) => (
                <li key={set.id} className={styles.listGroupItem}>
                  <span>{set.name}</span>
                  <div>
                    <button 
                      onClick={() => handleDelete(set.id)} 
                      className={styles.btnDanger}
                    >
                      Usuń
                    </button>
                    <button 
                      onClick={() => handleOpen(set.id)} 
                      className={styles.btnPrimary}
                    >
                      Otwórz
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySets;
