import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');


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
      password: ''
    };

 
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
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
        setMessage('Zalogowano pomyślnie!');  
        setFormData({
          email: '',
          password: ''
        }); 
      } else {
        setMessage(data.message || 'Wystąpił błąd podczas logowania.');
      }
    } catch (error) {
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit} className="form-group">
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

        <button type="submit" className="btn btn-primary">Zaloguj się</button>
      </form>

      {message && <p className="mt-3">{message}</p>}  {}
    </div>
  );
};

export default Login;
