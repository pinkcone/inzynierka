import React, { useEffect, useState } from 'react';
import styles from '../../styles/AdminDashboard.module.css';
import { FaSearch } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import PopupConfirmation from './PopupConfirmation';

const SetList = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  const fetchSets = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/sets/allsets?keyword=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSets(data.sets);
        setCurrentPage(parseInt(data.currentPage));
        setTotalPages(parseInt(data.totalPages));
        setError('');
      } else {
        setSets([]);
        setError('Nie znaleziono żadnych zestawów.');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas pobierania zestawów.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchSets = debounce((page) => {
    fetchSets(page);
  }, 500);

  useEffect(() => {
    debouncedFetchSets(currentPage);
    return () => {
      debouncedFetchSets.cancel();
    };
  }, [searchTerm, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDelete = (setId) => {
    setSetToDelete(setId);
    setShowPopup(true);
  };


  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/sets/forcedelete/${setToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMessage('Zestaw został pomyślnie usunięty.');
        setMessageType('success');
        setSets(sets.filter((set) => set.id !== setToDelete));
      } else {
        setMessage('Błąd podczas usuwania zestawu.');
        setMessageType('error');
      }

      setShowPopup(false);

      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    } catch (error) {
      setMessage('Wystąpił błąd podczas usuwania zestawu.');
      setMessageType('error');
      setShowPopup(false);
    }
  };

  const cancelDelete = () => {
    setShowPopup(false);
  };

  return (
    <div className={styles.listContainer}>
      <h3>Lista zestawów</h3>

      {message && (
        <div className={messageType === 'success' ? styles.successMessage : styles.errorMessage}>
          {message}
        </div>
      )}

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Szukaj po nazwie zestawu lub słowach kluczowych"
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.searchButton} onClick={handleSearch}>
          <FaSearch />
        </button>
      </div>

      {loading && <div>Ładowanie...</div>}
      {error && <div>Błąd: {error}</div>}

      {!loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th> 
              <th>Nazwa</th>
              <th>Autor</th>
              <th>Publiczny</th>
              <th>Słowa kluczowe</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {sets.length > 0 ? (
              sets.map((set, index) => (
                <tr key={index}>
                  <td>{set.id}</td> 
                  <td>{set.name}</td>
                  <td>{set.owner || 'Nieznany'}</td>
                  <td>{set.isPublic ? 'Tak' : 'Nie'}</td>
                  <td>{set.keyWords || 'Brak'}</td>
                  <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(set.id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Brak dostępnych zestawów</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

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

      {showPopup && (
        <PopupConfirmation
          message="Czy na pewno chcesz usunąć ten zestaw?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default SetList;
