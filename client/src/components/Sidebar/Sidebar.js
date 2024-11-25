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
    <div className={styles['sidebar-container']}>
      <div className={styles['sidebar-tab']}>MENU</div>
      <div className={styles.sidebar}>
        <Link to="/mysets" className={styles['sidebar-link']}>MOJE ZESTAWY</Link>
        <Link to="/mytests" className={styles['sidebar-link']}>MOJE TESTY</Link>
        <Link to="/myquizzes" className={styles['sidebar-link']}>MOJE QUIZY</Link>
        <Link to="/myflashcards" className={styles['sidebar-link']}>MOJE FISZKI</Link>
      </div>
    </div>
  );
};

export default Sidebar;
