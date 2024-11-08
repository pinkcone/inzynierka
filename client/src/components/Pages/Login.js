import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import styles from '../../styles/Login.module.css'; 

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: ''
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = {
      email: '',
      password: ''
    };

    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
      valid = false;
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = 'Podaj poprawny adres email';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setMessage('Zalogowano pomyślnie!');
        setFormData({ email: '', password: '' });
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess();
        }
        navigate('/');
      } else {
        setMessage(data.message || 'Wystąpił błąd podczas logowania.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div className={styles.containerLogin}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>Logowanie</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.mb3}>
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              className={`${styles.formControl} ${errors.email ? styles.isInvalid : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className={styles.invalidFeedback}>{errors.email}</div>}
          </div>

          <div className={styles.mb3}>
            <label htmlFor="password">Hasło:</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`${styles.formControl} ${errors.password ? styles.isInvalid : ''}`}
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className={styles.invalidFeedback}>{errors.password}</div>}
          </div>

          <button type="submit" className={styles.btnPrimary}>Zaloguj się</button>
          <p className={styles.registerLink}>Nie masz konta? <Link to={"/register"}>Zarejestruj się!</Link></p>
        </form>

        {message && <p className={styles.loginMessage}>{message}</p>}
      </div>
    </div>
  );
};

export default Login;
