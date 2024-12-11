import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import styles from '../../styles/Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    username: '',
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
      username: '',
      password: ''
    };

    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
      valid = false;
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = 'Podaj poprawny adres email';
      valid = false;
    }

    if (!formData.username) {
      newErrors.username = 'Nazwa użytkownika jest wymagana';
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
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Rejestracja zakończona sukcesem!');
        setFormData({
          email: '',
          username: '',
          password: ''
        });
        navigate('/');
      } else {
        setMessage(data.message || 'Wystąpił błąd podczas rejestracji.');
      }
    } catch (error) {
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div className={styles.containerRegister}>
      <div className={styles.registerCard}>
        <h2 className={styles.registerTitle}>Rejestracja</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.mb3}>
            <label htmlFor="email" className={styles.label}>Email:</label>
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
            <label htmlFor="username" className={styles.label}>Nazwa użytkownika:</label>
            <input
              type="text"
              id="username"
              name="username"
              className={`${styles.formControl} ${errors.username ? styles.isInvalid : ''}`}
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className={styles.invalidFeedback}>{errors.username}</div>}
          </div>

          <div className={styles.mb3}>
            <label htmlFor="password" className={styles.label}>Hasło:</label>
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

          <button type="submit" className={styles.btnPrimary}>Zarejestruj się</button>
          <p className={styles.loginLink}>Masz już konto? <Link to={"/login"} >Zaloguj się!</Link></p>
        </form>

        {message && <p className={styles.registerMessage}>{message}</p>}
      </div>
    </div>
  );
};

export default Register;
