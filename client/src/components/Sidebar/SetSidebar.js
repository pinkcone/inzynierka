import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '../../styles/SetSidebar.module.css';

const SetSidebar = ({ onSectionClick, activeSection, setName, onClose, isOwner }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSectionClick = (section) => {
    onSectionClick(section);
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
        {isOwner && (
          <>
            <li>
              <button
                className={`${styles.sidebarButton} ${activeSection === 'addQuestion' ? styles.active : ''}`}
                onClick={() => handleSectionClick('addQuestion')}
              >
                Dodaj pytanie
              </button>
            </li>
            <li>
              <button
                className={`${styles.sidebarButton} ${activeSection === 'manageSet' ? styles.active : ''}`}
                onClick={() => handleSectionClick('manageSet')}
              >
                Zarządzaj prywatnością
              </button>
            </li>
            <li>
              <button
                className={`${styles.sidebarButton} ${activeSection === 'addCollaborator' ? styles.active : ''}`}
                onClick={() => handleSectionClick('addCollaborator')}
              >
                Dodaj współtwórcę
              </button>
            </li>
            <li>
              <button
                className={`${styles.sidebarButton} ${activeSection === 'deleteSet' ? styles.active : ''}`}
                onClick={() => handleSectionClick('deleteSet')}
              >
                Usuń zestaw
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default SetSidebar;
