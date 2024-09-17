import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importuj useNavigate
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../styles/MySets.css';

const MySets = () => {
  const [sets, setSets] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Inicjalizuj useNavigate

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch('/api/sets', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSets(data);
        } else {
          setError('Nie udało się pobrać zestawów.');
        }
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania zestawów.');
      }
    };

    fetchSets();
  }, []);

  const handleDelete = async (setId) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten zestaw?')) {
      try {
        const response = await fetch(`/api/sets/delete/${setId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setSets(sets.filter((set) => set.id !== setId));
          setMessage('Zestaw został usunięty.');
        } else {
          const errorData = await response.json();
          setMessage(`Nie udało się usunąć zestawu: ${errorData.message}`);
        }
      } catch (error) {
        setMessage('Wystąpił błąd podczas usuwania zestawu.');
      }
    }
  };

  const handleOpen = (setId) => {
    navigate(`/page-set/${setId}`); // Przekierowuje na stronę PageSet
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <div className="content">
          <h2 className="text-center mb-4">Moje zestawy</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          {sets.length > 0 ? (
            <ul className="list-group">
              {sets.map((set) => (
                <li key={set.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{set.name}</span>
                  <div>
                    <button 
                      onClick={() => handleDelete(set.id)} 
                      className="btn btn-danger btn-sm ml-2"
                    >
                      Usuń
                    </button>
                    <button 
                      onClick={() => handleOpen(set.id)} 
                      className="btn btn-primary btn-sm ml-2"
                    >
                      Otwórz
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center">Brak zestawów.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySets;
