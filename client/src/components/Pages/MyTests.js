import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from '../../styles/MySets.module.css';

const MyTests = () => {

  const [tests, setTests] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleDeleteTest = async (code) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten test?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tests/delete/${code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setMessage('Test został pomyślnie usunięty.');

        setTests((prevTests) => prevTests.filter((test) => test.code !== code));
      } else {
        const data = await response.json();
        setError(data.message || 'Nie udało się usunąć testu.');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      setError('Wystąpił błąd podczas usuwania testu.');
    }
  };

  const handleOpenTest = (code) => {
    navigate(`/test-start/${code}`);
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
                <ul className={styles.listGroup}>
                  {tests.map((test) => (
                      <li key={test.code} className={styles.listGroupItem}>
                        <span>{test.name}</span>
                        <span>{test.Set.name}</span>
                        <span>Liczba pytań: {test.questionCount}</span>
                        <span>Czas trwania: {test.duration / 60} minut</span>
                        <div>
                          <button
                              onClick={() => handleOpenTest(test.code)}
                              className={styles.button}
                          >
                            Otwórz test
                          </button>
                          <button
                              onClick={() => handleDeleteTest(test.code)}
                              className={`${styles.button} ${styles.deleteButton}`}
                          >
                            Usuń test
                          </button>
                        </div>
                      </li>
                  ))}
                </ul>
            ) : (
                <p>Brak testów do wyświetlenia.</p>
            )}
          </div>
        </div>
      </div>
  );
};

export default MyTests;
