import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from '../../styles/MySets.module.css';

const MyTests = () => {

  const [tests, setTests] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmPopupContent, setConfirmPopupContent] = useState('');
  const [onConfirm, setOnConfirm] = useState(() => () => { });

  useEffect(() => {
    const fetchUserTests = async () => {
      try {
        const response = await fetch('/api/tests/get-all-tests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTests(data);
          console.log(data);
        } else {
          console.log(response);
          setError('Nie udało się pobrać testów.');
        }
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania testów.' + err);
      }
    };

    fetchUserTests();
  }, []);

  const handleDeleteTest = (code) => {
    setConfirmPopupContent('Czy na pewno chcesz usunąć ten test?');
    setOnConfirm(() => () => confirmDeleteTest(code));
    setShowConfirmPopup(true);
  };

  const confirmDeleteTest = async (code) => {
    try {
      const response = await fetch(`/api/tests/delete/${code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setMessage('Test został pomyślnie usunięty.');
        setTimeout(() => setMessage(''), 3000);
        setTests((prevTests) => prevTests.filter((test) => test.code !== code));
      } else {
        const data = await response.json();
        setError(data.message || 'Nie udało się usunąć testu.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      setError('Wystąpił błąd podczas usuwania testu.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setShowConfirmPopup(false);
    }
  };

  const handleOpenTest = (code) => {
    navigate(`/test-start/${code}`);
  };

  const handleOpenSet = (setId) => {
    window.location.href =`page-set/${setId}`;
  };

  const handleViewHistory = (testCode) => {
    navigate(`/test-history/${testCode}`);
  };

  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <Sidebar />
        <div className={styles.content}>
          <h2 className={styles.textCenter}>Moje testy</h2>
          {error && <div className={styles.alertDanger}>{error}</div>}
          {message && <div className={styles.alertSuccess}>{message}</div>}

          {tests.length > 0 ? (
            <div className={styles.testList}>
              {tests.map((test) => (
                <div key={test.code} className={styles.testCard}>
                  <h3 className={styles.testName}>{test.name}</h3>
                  <p onClick={() => handleOpenSet(test.Set.id)}><strong>Zestaw:</strong> {test.Set.name}</p>
                  <p><strong>Liczba pytań:</strong> {test.questionCount}</p>
                  <p><strong>Czas trwania:</strong> {test.duration / 60} minut</p>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleOpenTest(test.code)}
                      className={styles.button}
                    >
                      Rozwiąż
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test.code)}
                      className={`${styles.button} ${styles.deleteButton}`}
                    >
                      Usuń
                    </button>
                    <button
                        onClick={() => handleViewHistory(test.code)}
                        className={styles.button}
                    >
                      Historia
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
              <p>Brak testów do wyświetlenia.</p>
          )}
          {showConfirmPopup && (
            <div className={styles.popupOverlay}>
              <div className={styles.popup}>
                <button className={styles.popupClose} onClick={() => setShowConfirmPopup(false)}>X</button>
                <p>{confirmPopupContent}</p>
                <button onClick={() => {
                  onConfirm();
                }}>Potwierdź
                </button>
                <button onClick={() => setShowConfirmPopup(false)}>Anuluj</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTests;