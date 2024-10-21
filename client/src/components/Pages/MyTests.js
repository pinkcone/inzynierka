import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from '../../styles/MySets.module.css';

const MyTests = () => {
  // Zdefiniowane na sztywno testy
  const [tests] = useState([
    { testId: 1, testName: 'klasa 4', setName: 'historia' },
    { testId: 2, testName: 'klasa4B', setName: 'historia' },
    { testId: 3, testName: 'Test  1', setName: 'kolosPWO' },
  ]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Funkcja do otwierania testu
  const handleOpenTest = (testId) => {
    navigate(`/test/${testId}`);
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

          {tests.length > 0 && (
            <ul className={styles.listGroup}>
              {tests.map((test) => (
                <li key={test.testId} className={styles.listGroupItem}>
                  <span>Test: {test.testName}</span>
                  <span>Zestaw: {test.setName}</span>
                  <div>
                    <button
                      onClick={() => handleOpenTest(test.testId)}
                      className={styles.button}
                    >
                      Otwórz test
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

export default MyTests;


/*
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from '../../styles/Sets.module.css';

const MyTests = () => {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/tests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            setError('Brak testów.');
          } else {
            setTests(data);
            setError('');
          }
        } else {
          setError('Błąd podczas pobierania testów.');
        }
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania testów.');
      }
    };

    fetchTests();
  }, []);

  const handleOpenTest = (testId) => {
    navigate(`/test/${testId}`);
  };

  const handleStartTest = async (testId) => {
    try {
      const response = await fetch(`/api/tests/start/${testId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Test uruchomiony:', data);
        navigate(`/test/${testId}`);
      } else {
        console.error('Błąd podczas uruchamiania testu:', response.statusText);
      }
    } catch (error) {
      console.error('Błąd podczas uruchamiania testu:', error);
    }
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

          {tests.length > 0 && (
            <ul className={styles.listGroup}>
              {tests.map((test) => (
                <li key={test.testId} className={styles.listGroupItem}>
                  <span>Test: {test.testName}</span>
                  <span>Zestaw: {test.setName}</span>
                  <div>
                    <button
                      onClick={() => handleOpenTest(test.testId)}
                      className={styles.button}
                    >
                      Otwórz test
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

export default MyTests;

*/