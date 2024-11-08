import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import { FaSearch } from 'react-icons/fa';
import styles from '../../styles/HomePage.module.css'; 
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce'; 

const HomePage = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);  
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();  

  const fetchPublicSets = async (page = 1) => {
    try {
      const response = await fetch(`/api/sets/public?keyword=${searchTerm}&page=${page}&pageSize=10`);  
      if (response.ok) {
        const data = await response.json();
    
        setSets(data.sets);
        setCurrentPage(parseInt(data.currentPage));
        setTotalPages(parseInt(data.totalPages));
        setError(''); 
      } else {
        setError('Nie znaleziono żadnych zestawów.');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas pobierania zestawów.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchSets = debounce((page) => {
    fetchPublicSets(page);
  }, 500); 

  useEffect(() => {
    debouncedFetchSets(currentPage);
    const token = localStorage.getItem('token');  
    setIsLoggedIn(!!token);
  }, [searchTerm, currentPage]);

  useEffect(() => {
    return () => {
      debouncedFetchSets.cancel();
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); 
    fetchPublicSets(1); 
  };

  const handleNavigate = (setId) => {
    if (isLoggedIn) {
      navigate(`/page-set/${setId}`);  
    } else {
      navigate('/login');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={styles.pageButton} 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                &lt; Poprzednia
              </button>
              <span>{currentPage} z {totalPages}</span>
              <button 
                className={styles.pageButton} 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Następna &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
