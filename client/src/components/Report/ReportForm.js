import React, { useState, useEffect } from 'react';
import styles from '../../styles/PageSet.module.css';

const ReportForm = ({ setId, onClose }) => {
  const [hasReported, setHasReported] = useState(false);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState(''); 
  const [messageType, setMessageType] = useState(''); 

  useEffect(() => {
    const checkIfReported = async () => {
      try {
        const response = await fetch(`/api/report/check/${setId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();
        if (data.reported) {
          setHasReported(true);
        }
      } catch (err) {
        setMessage('Wystąpił błąd podczas sprawdzania zgłoszenia.');
        setMessageType('error');
      }
    };

    checkIfReported();
  }, [setId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasReported) {
      setMessage('Ten zestaw został już zgłoszony przez Ciebie.');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch(`/api/report/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ setId, description }),
      });

      if (response.ok) {
        setMessage('Zgłoszenie zostało pomyślnie wysłane.');
        setMessageType('success');
        setTimeout(() => {
          onClose(); 
        }, 2000); 
      } else {
        const data = await response.json();
        setMessage(data.message || 'Wystąpił błąd podczas wysyłania zgłoszenia.');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Wystąpił błąd podczas wysyłania zgłoszenia.');
      setMessageType('error');
    }
  };

  return (
    <div className="report-form-container">
      <div className="report-form">
        <button className={styles.popupClose} onClick={onClose}>
          X 
        </button>

        <h2>Zgłoś zestaw</h2>

        {message && (
          <div className={messageType === 'success' ? styles.successMessage : styles.errorMessage}>
            {message}
          </div>
        )}

        {hasReported ? (
          <div className={styles.successMessage}>
            <p>Ten zestaw został już zgłoszony przez Ciebie.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Podaj powód zgłoszenia"
              required
            />
            <button type="submit">Zgłoś</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportForm;
