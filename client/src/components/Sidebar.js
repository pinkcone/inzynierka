import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; 
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="sidebar">
      <Link to="/mysets" className="sidebar-link">Moje Zestawy</Link>
      <a href="/tests" className="sidebar-link">TU COŚ BĘDZIE</a>
      <a href="/materials" className="sidebar-link">TU TEZ</a>
    </div>
  );
};

export default Sidebar;
