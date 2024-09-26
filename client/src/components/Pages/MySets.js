import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import AddSet from '../Set/AddSet';
import styles from '../../styles/MySets.module.css';

const MySets = () => {
  const [sets, setSets] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showAddSetPopup, setShowAddSetPopup] = useState(false);
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
    setSets((prevSets) => [...prevSets, newSet]);
    setShowAddSetPopup(false);
  };

  const handleOpen = (setId) => {
    navigate(`/page-set/${setId}`);
  };
//nie dotykac pls
  const handleStartFlashcards = async (setId) => {
    try {
      const response = await fetch(`/api/flashcards/create-from-set/${setId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Utworzono fiszki:', data);
        navigate(`/flashcards/${setId}`); 
      } else {
        console.error('Błąd podczas tworzenia fiszek:', response.statusText);
      }
    } catch (error) {
      console.error('Błąd podczas tworzenia fiszek:', error);
    }
  };

  const handleAddSetClick = () => {
    setShowAddSetPopup(true);
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
                      onClick={() => handleOpen(set.id)}
                      className={styles.btnPrimary}
                    >
                      Otwórz
                    </button>
                    <button
                      onClick={() => handleStartFlashcards(set.id)}
                      className={styles.btnSecondary} 
                    >
                      Uruchom fiszki
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
