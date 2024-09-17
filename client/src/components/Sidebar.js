import React, { useState } from 'react';
import '../styles/Sidebar.css'; 
import CreateSet from './CreateSet';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    console.log('Opening modal');
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
  };
  return (
    <div className="sidebar">
      <Link to="/my-sets" className="sidebar-link">Moje Zestawy</Link>
      <a href="/tests" className="sidebar-link">Testy</a>
      <a href="/materials" className="sidebar-link">Materiały</a>
      <button onClick={openModal} className="sidebar-link create-set-btn">
        Utwórz Zestaw
      </button>
      
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <CreateSet />
            <button className="btn btn-secondary" onClick={closeModal}>Zamknij</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
