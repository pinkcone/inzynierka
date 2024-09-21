import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from '../styles/Sidebar.module.css'; // Import modułu CSS

const Sidebar = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className={styles.sidebar}> {/* Użycie klasy z modułu CSS */}
      <Link to="/mysets" className={styles['sidebar-link']}>Moje Zestawy</Link> {/* Użycie klasy z modułu CSS */}
      <a href="/tests" className={styles['sidebar-link']}>TU COŚ BĘDZIE</a> {/* Użycie klasy z modułu CSS */}
      <a href="/materials" className={styles['sidebar-link']}>TU TEZ</a> {/* Użycie klasy z modułu CSS */}
    </div>
  );
};

export default Sidebar;
