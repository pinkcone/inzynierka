import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          logout('Twoja sesja wygasła. Zaloguj się ponownie.');
        } else {
          setUser(decodedToken);
          setIsAuthenticated(true);

          setIsAdmin(decodedToken.role === 'admin'); 

          const interval = setInterval(() => {
            const timeLeft = decodedToken.exp - Date.now() / 1000;
            if (timeLeft <= 0) {
              logout('Twoja sesja wygasła. Zaloguj się ponownie.');
            }
          }, 60000); 

          return () => clearInterval(interval); 
        }
      } catch (error) {
        console.error('Błąd dekodowania tokena:', error);
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      }
    }
  }, []);

  const logout = (message) => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setIsAdmin(false);

    if (message) {
      alert(message);
    }

    navigate('/');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return { isAuthenticated, user, isAdmin, logout };
};

export default useAuth;
