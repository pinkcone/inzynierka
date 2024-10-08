import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '../../styles/SetSidebar.module.css';

const FlashcardSidebar = ({ onSectionClick, activeSection, onClose }) => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <button className={styles.backButton} onClick={handleBackClick}>
                    <FaArrowLeft />
                    Powrót
                </button>
            </div>
            <ul>
                <li>
                    <button
                        className={`${styles.sidebarButton} ${activeSection === 'chooseSet' ? styles.active : ''}`}
                        onClick={() => onSectionClick('chooseSet')}
                    >
                        Wybierz zestaw
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

export default FlashcardSidebar;
