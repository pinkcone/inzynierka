import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });

  const [message, setMessage] = useState('');  // Zmienna do przechowywania wiadomości o błędzie lub sukcesie

  // Obsługa zmiany w polach formularza
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Obsługa wysyłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),  // Konwertujemy dane do formatu JSON
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Rejestracja zakończona sukcesem!');  // Wyświetl komunikat o sukcesie
        setFormData({
          email: '',
          username: '',
          password: ''
        });  // Resetowanie formularza po udanej rejestracji
      } else {
        setMessage(data.message || 'Wystąpił błąd podczas rejestracji.');
      }
    } catch (error) {
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div>
      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Nazwa użytkownika:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Hasło:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Zarejestruj się</button>
      </form>

      {message && <p>{message}</p>}  {/* Wyświetl wiadomość o błędzie lub sukcesie */}
    </div>
  );
};

export default Register;
