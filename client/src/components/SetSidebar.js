import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '../styles/SetSidebar.module.css'; // Import modułu CSS

const SetSidebar = ({ onSectionClick, activeSection, setName, onClose }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/mysets');
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.setName}>
          <h3>{setName}</h3>
        </div>
        <button className={styles.backButton} onClick={handleBackClick}>
          <FaArrowLeft />
          Powrót
        </button>
      </div>
      <ul>
        <li>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'addQuestion' ? styles.active : ''}`}
            onClick={() => onSectionClick('addQuestion')}
          >
            Dodaj pytanie
          </button>
        </li>
        <li>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'manage' ? styles.active : ''}`}
            onClick={() => onSectionClick('manage')}
          >
            Zarządzaj prywatnością
          </button>
        </li>
        <li>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'addCollaborator' ? styles.active : ''}`}
            onClick={() => onSectionClick('addCollaborator')}
          >
            Dodaj współtwórcę
          </button>
        </li>
        <li>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'deleteSet' ? styles.active : ''}`}
            onClick={() => onSectionClick('deleteSet')}
          >
            Usuń zestaw
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SetSidebar;
