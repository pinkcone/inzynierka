import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../styles/PageSet.css';

const PageSet = () => {
  const { id } = useParams(); 
  const [set, setSet] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const response = await fetch(`/api/sets/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        if (response.ok) {
          const data = await response.json();
          setSet(data);
        } else {
          setError('Nie udało się pobrać zestawu.');
        }
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania zestawu.');
      }
    };

    fetchSet();
  }, [id]);

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <div className="content">
          <h2 className="text-center mb-4">Szczegóły zestawu</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {set ? (
            <div>
              <h3>{set.name}</h3>
              <p><strong>Publiczny:</strong> {set.isPublic ? 'Tak' : 'Nie'}</p>
              <p><strong>Słowa kluczowe:</strong> {set.keyWords}</p>
            </div>
          ) : (
            <p>Ładowanie...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageSet;
