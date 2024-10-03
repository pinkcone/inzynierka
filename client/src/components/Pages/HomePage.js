import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import { FaSearch } from 'react-icons/fa';
import styles from '../../styles/HomePage.module.css'; 
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce'; // Dodaj debounce

const HomePage = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();  

  const fetchPublicSets = async () => {
    try {
      const response = await fetch(`/api/sets/public?keyword=${searchTerm}`);  
      if (response.ok) {
        const data = await response.json();
        setSets(data);
        setError(''); // Reset błędu po znalezieniu zestawów
      } else {
        setError('Nie znaleziono żadnych zestawów.');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas pobierania zestawów.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function (zapobiega wielokrotnym zapytaniom przy szybkim wpisywaniu)
  const debouncedFetchSets = debounce(() => {
    fetchPublicSets();
  }, 500); // Opóźnienie 500 ms

  useEffect(() => {
    debouncedFetchSets();
    const token = localStorage.getItem('token');  
    setIsLoggedIn(!!token);
  }, [searchTerm]);

  // Clean up debounce po zakończeniu komponentu
  useEffect(() => {
    return () => {
      debouncedFetchSets.cancel();
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPublicSets(); 
  };

  const handleNavigate = (setId) => {
    if (isLoggedIn) {
      navigate(`/page-set/${setId}`);  
    } else {
      alert('Aby zobaczyć zawartość zestawu, musisz być zalogowanym użytkownikiem.');
    }
  };

  return (
    <div className={styles.homeContainer}>
      <Navbar />
      <div className={styles.contentWrapper}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.welcomeText}>
            <h1>Witamy na stronie głównej!</h1>
            <p>Poniżej możesz wyszukać publiczne zestawy na podstawie słów kluczowych.</p>
          </div>

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Szukaj..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}  
            />
            <button className={styles.searchButton} onClick={handleSearch}>
              <FaSearch />
            </button>
          </div>

          <div className={styles.setsContainer}>
            {loading ? (
              <p>Ładowanie...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              sets.length > 0 ? (
                sets.map((set) => (
                  <div key={set.id} className={styles.setItem}>
                    <h3>{set.name}</h3>
                    <p>{set.keyWords}</p>
                    <button 
                      className={styles.setButton}
                      onClick={() => handleNavigate(set.id)} 
                    >
                      Zobacz zestaw
                    </button>
                  </div>
                ))
              ) : (
                <p>Nie znaleziono publicznych zestawów.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
