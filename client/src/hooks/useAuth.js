import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
          setIsAuthenticated(false); // Ustawia stan lokalny bez wywoływania `logout`
          toast.warn('Twoja sesja wygasła. Zaloguj się ponownie.');
          navigate('/login');
        } else {
          setUser(decodedToken);
          setIsAuthenticated(true);
          setIsAdmin(decodedToken.role === 'admin');

          const interval = setInterval(() => {
            const timeLeft = decodedToken.exp - Date.now() / 1000;
            if (timeLeft <= 0) {
              setIsAuthenticated(false); // Zatrzymuje dalsze interakcje
              toast.warn('Twoja sesja wygasła. Zaloguj się ponownie.');
              navigate('/login');
            }
          }, 480000);

          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Błąd dekodowania tokena:', error);
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      }
    }
  }, [navigate]);



  const logout = (message) => {
    if (!localStorage.getItem('token')) {
      console.warn('Użytkownik już wylogowany.');
      return;
    }

    localStorage.removeItem('token');
    localStorage.setItem('logoutMessage', message);
    setIsAuthenticated(false);
    setUser(null);
    setIsAdmin(false);

    navigate('/');

    setTimeout(() => {
      window.location.reload();
    }, 100); // Krótkie opóźnienie dla bezpieczeństwa
  };



  return { isAuthenticated, user, isAdmin, logout };
};

export default useAuth;
