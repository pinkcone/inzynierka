import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
// import '../styles/Register.css';

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: ''
    });
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
    <div className="container-register">
      <div className="register-card">
        <h2 className="register-title">Rejestracja</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="username">Nazwa użytkownika:</label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="password">Hasło:</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary register-button">Zarejestruj się</button>
        </form>

        {message && <p className="register-message">{message}</p>}
      </div>
    </div>
  );
};

export default Register;
