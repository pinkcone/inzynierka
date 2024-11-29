import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import AddSet from '../Set/AddSet';
import styles from '../../styles/MySets.module.css';
import debounce from 'lodash.debounce';

const MySets = () => {
  const [sets, setSets] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showAddSetPopup, setShowAddSetPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchSets = async (page = 1) => {
    try {
      const response = await fetch(`/api/sets?keyword=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=9`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSets(data.sets);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        if (data.sets.length === 0) setError('Brak zestawów.');
        else setError('');
      } else {
        setError('Błąd podczas pobierania zestawów.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania zestawów.');
    }
  };

  const debouncedFetchSets = debounce(fetchSets, 500);

  useEffect(() => {
    debouncedFetchSets(currentPage);
    return () => debouncedFetchSets.cancel();
  }, [searchTerm, currentPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddSet = (newSet) => {
    setSets((prevSets) => [...prevSets, newSet]);
    setError('');
    setShowAddSetPopup(false);
  };

  const handleOpen = (setId) => {
    navigate(`/page-set/${setId}`);
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
          <div className={styles.actionSection}>
            <div className={styles.addbtn}>
              <button onClick={handleAddSetClick} className={styles.crudbutton}>
                Dodaj zestaw
              </button>
            </div>
            <h2 className={styles.textCenter}>Moje zestawy</h2>
            <input
              type="text"
              placeholder="Wyszukaj zestaw..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          {showAddSetPopup && (
            <div className={styles.popupOverlay}>
              <div className={styles.popup}>
                <button className={styles.popupClose} onClick={closePopup}>
                  X
                </button>
                <AddSet onAddSet={handleAddSet} />
              </div>
            </div>
          )}
          {error && <div className={styles.alertDanger}>{error}</div>}
          {message && <div className={styles.alertSuccess}>{message}</div>}

          {sets.length > 0 && (
            <div className={styles.setsGroup}>
              {sets.map((set) => (
                <div onClick={() => handleOpen(set.id)} key={set.id} className={styles.setItem}>
                  <h3>{set.name}</h3>
                </div>
              ))}
            </div>
          )}

          <div className={styles.pagination}>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Poprzednia
            </button>
            <span>{currentPage}/{totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Następna
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySets;
