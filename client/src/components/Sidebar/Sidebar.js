import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import styles from '../../styles/Sidebar.module.css'; 

const Sidebar = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className={styles.sidebar}>
      <Link to="/mysets" className={styles['sidebar-link']}>Moje Zestawy</Link> 
      <Link to="/flashcards" className={styles['sidebar-link']}>Fiszki</Link>
      <Link to="/" className={styles['sidebar-link']}>TU COŚ BĘDZIE</Link>
    </div>
  );
};

export default Sidebar;
