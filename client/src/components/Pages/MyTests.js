import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from '../../styles/MySets.module.css';

const MyTests = () => {

  const [tests, setTests] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tests/get-all-tests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTests(data);
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

            {tests.length > 0 ? (
                <ul className={styles.listGroup}>
                  {tests.map((test) => (
                      <li key={test.code} className={styles.listGroupItem}>
                        <span>Test: {test.name}</span>
                        <div>
                          <button
                              onClick={() => handleOpenTest(test.code)}
                              className={styles.button}
                          >
                            Otwórz test
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
