import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar'; 
import useAuth from '../../hooks/useAuth'; 
import { FaEdit, FaSave } from 'react-icons/fa'; 
import styles from '../../styles/UserProfile.module.css'; 

const UserProfile = () => {
  const { user } = useAuth(); 
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [editingField, setEditingField] = useState(null); 
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUsername(user.username);
      setPassword(''); 
    }
  }, [user]);

  const handleEdit = (field) => {
    setEditingField(field);
  };

  const handleSave = async (field) => {
    const token = localStorage.getItem('token');
    const updatedData = {};

    if (field === 'email') updatedData.email = email;
    if (field === 'username') updatedData.username = username;
    if (field === 'password') updatedData.password = password;

    try {
      const response = await fetch(`/api/users/update-user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Dane zostały zaktualizowane pomyślnie!');
        setMessageType('success'); 
        setEditingField(null); 
      } else {
        setMessage(data.message || 'Nie udało się zaktualizować danych');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Błąd:', error);
      setMessage('Wystąpił błąd podczas aktualizacji danych');
      setMessageType('error');
    }

    setTimeout(() => {
      setMessage('');
    }, 3000); 
  };

  if (!user) {
    return <p>Ładowanie danych użytkownika...</p>;
  }

  return (
    <div className={styles.homeContainer}>
      <Navbar />
      <div className={styles.profileContent}>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Profil użytkownika</h3>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.avatarContainer}>
                    <img 
                      src={user.image || '/images/profile_pictures/picture_1.png'} 
                      alt="User Avatar" 
                      className={styles.avatar} 
                    />
                  </div>

                  {message && (
                    <div className={messageType === 'success' ? styles.successMessage : styles.errorMessage}>
                      {message}
                    </div>
                  )}

                  <table className="table">
                    <tbody>
                      <tr>
                        <td><strong>Email:</strong></td>
                        <td>
                          {editingField === 'email' ? (
                            <input 
                              type="email" 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              className={`${styles.inputField} form-control`}
                            />
                          ) : (
                            <span>{email}</span>
                          )}
                        </td>
                        <td>
                          {editingField === 'email' ? (
                            <FaSave 
                              onClick={() => handleSave('email')} 
                              style={{ cursor: 'pointer' }} 
                            />
                          ) : (
                            <FaEdit 
                              onClick={() => handleEdit('email')} 
                              style={{ cursor: 'pointer' }} 
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Nazwa użytkownika:</strong></td>
                        <td>
                          {editingField === 'username' ? (
                            <input 
                              type="text" 
                              value={username} 
                              onChange={(e) => setUsername(e.target.value)} 
                              className={`${styles.inputField} form-control`}
                            />
                          ) : (
                            <span>{username}</span>
                          )}
                        </td>
                        <td>
                          {editingField === 'username' ? (
                            <FaSave 
                              onClick={() => handleSave('username')} 
                              style={{ cursor: 'pointer' }} 
                            />
                          ) : (
                            <FaEdit 
                              onClick={() => handleEdit('username')} 
                              style={{ cursor: 'pointer' }} 
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Hasło:</strong></td>
                        <td>
                          {editingField === 'password' ? (
                            <input 
                              type="password" 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              className={`${styles.inputField} form-control`}
                            />
                          ) : (
                            <span>********</span> 
                          )}
                        </td>
                        <td>
                          {editingField === 'password' ? (
                            <FaSave 
                              onClick={() => handleSave('password')} 
                              style={{ cursor: 'pointer' }} 
                            />
                          ) : (
                            <FaEdit 
                              onClick={() => handleEdit('password')} 
                              style={{ cursor: 'pointer' }} 
                            />
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
