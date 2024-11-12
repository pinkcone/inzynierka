import React, { useEffect, useState } from 'react';
import PopupConfirmation from './PopupConfirmation';  
import styles from '../../styles/AdminDashboard.module.css';
import { FaSearch } from 'react-icons/fa';
import debounce from 'lodash.debounce';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editedRoles, setEditedRoles] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async (page = 1) => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await fetch(`/api/users/admin/users?keyword=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Błąd odpowiedzi:', errorMessage);
        throw new Error('Błąd serwera');
      }

      const data = await response.json();
      setUsers(data.users);
      setCurrentPage(parseInt(data.currentPage));
      setTotalPages(parseInt(data.totalPages));
      setError('');
    } catch (error) {
      console.error('Błąd podczas pobierania użytkowników:', error);
      setError('Nie udało się pobrać użytkowników.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchUsers = debounce((page) => {
    fetchUsers(page);
  }, 500);

  useEffect(() => {
    debouncedFetchUsers(currentPage);
    return () => {
      debouncedFetchUsers.cancel();
    };
  }, [searchTerm, currentPage]);

  const handleRoleSelect = (userId, newRole) => {
    setEditedRoles(prev => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const handleSaveRoleChange = async (userId) => {
    const token = localStorage.getItem('token');
    const newRole = editedRoles[userId];

    try {
      const response = await fetch(`/api/users/admin/update-role/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Nie udało się zaktualizować roli użytkownika');
      }

      setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
      setEditedRoles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });

      setMessage('Rola użytkownika została zaktualizowana');
      setMessageType('success');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Błąd zmiany roli użytkownika:', error);
      setMessage('Wystąpił błąd podczas zmiany roli użytkownika');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDeleteUser = (userId) => {
    setUserIdToDelete(userId);
    setShowPopup(true);
  };

  const confirmDeleteUser = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/users/admin/delete-user/${userIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nie udało się usunąć użytkownika');
      }

      setUsers(users.filter(user => user.id !== userIdToDelete));
      setShowPopup(false);
      setMessage('Użytkownik został usunięty pomyślnie');
      setMessageType('success');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Błąd usuwania użytkownika:', error);
      setMessage('Wystąpił błąd podczas usuwania użytkownika');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const cancelDeleteUser = () => {
    setShowPopup(false);
    setUserIdToDelete(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={styles.listContainer}>
      <h3>Lista użytkowników</h3>

      {message && (
        <div className={messageType === 'success' ? styles.successMessage : styles.errorMessage}>
          {message}
        </div>
      )}

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Szukaj po nazwie lub emailu"
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.searchButton} onClick={handleSearch}>
          <FaSearch />
        </button>
      </div>

      {loading && <div>Ładowanie...</div>}
      {error && <div>Błąd: {error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Zdjęcie</th>
            <th>Nazwa użytkownika</th>
            <th>Email</th>
            <th>Rola</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                <img
                  src={user.image || '/images/profile_pictures/picture_1.png'}
                  alt="User avatar"
                  className={styles.avatar}
                />
              </td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={editedRoles[user.id] || user.role}
                  onChange={(e) => handleRoleSelect(user.id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button
                  onClick={() => handleSaveRoleChange(user.id)}
                  className={styles.saveButton}
                  disabled={!editedRoles[user.id] || editedRoles[user.id] === user.role}
                >
                  Zapisz zmiany
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className={styles.deleteButton}
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button 
        className={styles.pageButton}
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        >
          Poprzednia
        </button>
        <span>{currentPage} z {totalPages}</span>
        <button 
        className={styles.pageButton}
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        >
          Następna
        </button>
      </div>

      {showPopup && <PopupConfirmation onConfirm={confirmDeleteUser} onCancel={cancelDeleteUser} />}
    </div>
  );
};

export default UserList;
