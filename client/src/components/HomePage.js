import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { FaSearch } from 'react-icons/fa';

const HomePage = () => {
  const styles = {
    homeContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    },
    contentWrapper: {
      display: 'flex',
      flex: 1,
    },
    mainContent: {
      flex: 1,
      padding: '20px',
      marginTop: '160px',  
      backgroundColor: '#f9f9f9',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    welcomeText: {
      textAlign: 'center',
      marginBottom: '40px',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '20px',
    },
    searchInput: {
      padding: '10px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      width: '300px',
      marginRight: '10px',
    },
    searchButton: {
      backgroundColor: '#007bff',
      color: '#fff',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    '@media (maxWidth: 768px)': {
      mainContent: {
        marginTop: '80px',  
      },
      searchInput: {
        width: '100%',  
      },
    }
  };

  return (
    <div style={styles.homeContainer}>
      <Navbar />
      <div style={styles.contentWrapper}>
        <Sidebar />
        <div style={styles.mainContent}>
          <div style={styles.welcomeText}>
            <h1>Witamy na stronie głównej!</h1>
            <p>Poniżej wyszukasz materiały na podstawie słów kluczowych.</p>
          </div>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Szukaj..."
              style={styles.searchInput}
            />
            <button style={styles.searchButton}>
              <FaSearch />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
