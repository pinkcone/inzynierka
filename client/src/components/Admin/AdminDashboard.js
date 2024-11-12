import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import UserList from './UserList';
import SetList from './SetList';
import ReportList from './ReportList';
import styles from '../../styles/AdminDashboard.module.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className={styles.homeContainer}>
      <Navbar />
      <div className={styles.dashboardContent}>
        <div className={styles.tabs}>
          <button
            className={activeTab === 'users' ? styles.activeTab : styles.tabButton}
            onClick={() => setActiveTab('users')}
          >
            Użytkownicy
          </button>
          <button
            className={activeTab === 'sets' ? styles.activeTab : styles.tabButton}
            onClick={() => setActiveTab('sets')}
          >
            Zestawy
          </button>
          <button
            className={activeTab === 'reports' ? styles.activeTab : styles.tabButton}
            onClick={() => setActiveTab('reports')}
          >
            Zgłoszenia
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'users' && <UserList />}
          {activeTab === 'sets' && <SetList />}
          {activeTab === 'reports' && <ReportList />} 
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
