import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MySets = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Pobierz zestawy użytkownika z backendu
  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch('/api/quiz/sets', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // zakładam, że masz token
          },
        });
        if (!response.ok) {
          throw new Error('Wystąpił błąd podczas pobierania zestawów');
        }
        const data = await response.json();
        setSets(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  // Funkcja do usuwania zestawu
  const handleDeleteSet = async (setId) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten zestaw?')) {
      try {
        const response = await fetch(`/api/quiz/set/${setId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // zakładam, że masz token
          },
        });

        if (!response.ok) {
          throw new Error('Wystąpił błąd podczas usuwania zestawu');
        }

        // Usuń zestaw z widoku
        setSets(sets.filter((set) => set.id !== setId));
      } catch (error) {
        alert('Nie udało się usunąć zestawu');
      }
    }
  };

  // Przejście do szczegółów zestawu
  const handleViewSet = (setId) => {
    navigate(`/sets/${setId}`);
  };

  if (loading) {
    return <div>Ładowanie zestawów...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container">
      <h2>Moje Zestawy</h2>
      {sets.length === 0 ? (
        <p>Nie masz żadnych zestawów.</p>
      ) : (
        <ul className="list-group">
          {sets.map((set) => (
            <li key={set.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{set.name}</strong>
                <span> (Publiczny: {set.isPublic ? 'Tak' : 'Nie'})</span>
              </div>
              <div>
                <button className="btn btn-primary me-2" onClick={() => handleViewSet(set.id)}>
                  Zobacz szczegóły
                </button>
                <button className="btn btn-danger" onClick={() => handleDeleteSet(set.id)}>
                  Usuń
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MySets;
