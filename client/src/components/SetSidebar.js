import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const SetSidebar = ({ onSectionClick, activeSection, setName, onClose }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/mysets');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="set-name">
          <h3>{setName}</h3>
        </div>
        <button className="back-button" onClick={handleBackClick}>
          <FaArrowLeft />
          Powrót
        </button>
      </div>
      <ul>
        <li>
          <button
            className={`sidebar-button ${activeSection === 'addQuestion' ? 'active' : ''}`}
            onClick={() => onSectionClick('addQuestion')}
          >
            Dodaj pytanie
          </button>
        </li>
        <li>
          <button
            className={`sidebar-button ${activeSection === 'manage' ? 'active' : ''}`}
            onClick={() => onSectionClick('manage')}
          >
            Zarządzaj prywatnością
          </button>
        </li>
        <li>
          <button
            className={`sidebar-button ${activeSection === 'addCollaborator' ? 'active' : ''}`}
            onClick={() => onSectionClick('addCollaborator')}
          >
            Dodaj współtwórcę
          </button>
        </li>
        <li>
          <button
            className={`sidebar-button ${activeSection === 'deleteSet' ? 'active' : ''}`}
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
