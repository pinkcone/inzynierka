import React from 'react';
import { Navigate } from 'react-router-dom';

// Funkcja sprawdzająca, czy użytkownik jest zalogowany
const isAuthenticated = () => {
    // Przykład: sprawdzanie tokena w `localStorage`
    const token = localStorage.getItem('token');
    return !!token; // Zwraca `true` jeśli token istnieje, inaczej `false`
};

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
