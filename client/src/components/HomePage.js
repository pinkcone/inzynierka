import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { FaSearch } from 'react-icons/fa';
import styles from '../styles/HomePage.module.css'; // Import modułu CSS

const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      <Navbar />
      <div className={styles.contentWrapper}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.welcomeText}>
            <h1>Witamy na stronie głównej!</h1>
            <p>Poniżej wyszukasz materiały na podstawie słów kluczowych.</p>
          </div>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Szukaj..."
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>
              <FaSearch />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
