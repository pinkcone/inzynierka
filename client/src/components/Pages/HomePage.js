import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import { FaSearch } from 'react-icons/fa';
import styles from '../../styles/HomePage.module.css'; 

const HomePage = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPublicSets = async () => {
    try {
      const response = await fetch('/api/sets/public'); 
      if (!response.ok) {
        throw new Error('Nie udało się pobrać zestawów.');
      }
      const data = await response.json();
      setSets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicSets();
  }, []);

  return (
    <div className={styles.homeContainer}>
      <Navbar />
      <div className={styles.contentWrapper}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.welcomeText}>
            <h1>Witamy na stronie głównej!</h1>
            <p>Poniżej wyszukasz materiały na podstawie słów kluczowych.</p>
          </div>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Szukaj..."
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>
              <FaSearch />
            </button>
          </div>
          <div className={styles.setsList}>
            {loading && <p>Ładowanie zestawów...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && sets.length === 0 && <p>Brak publicznych zestawów.</p>}
            {!loading && !error && sets.length > 0 && (
              <ul>
                {sets.map(set => (
                  <li key={set.id} className={styles.setItem}>
                    <h3>{set.name}</h3>
                    <p>{set.description || 'Brak opisu'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
