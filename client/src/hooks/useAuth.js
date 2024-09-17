import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken); 
        setIsAuthenticated(true); 
      } catch (error) {
        console.error('Błąd dekodowania tokena:', error);
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token'); 
    setIsAuthenticated(false); 
    setUser(null); 

    navigate('/'); 

    setTimeout(() => {
      window.location.reload(); 
    }, 100); 
  };

  return { isAuthenticated, user, logout };
};

export default useAuth;