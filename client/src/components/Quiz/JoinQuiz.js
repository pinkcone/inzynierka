import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../../styles/JoinQuiz.module.css';

const JoinQuiz = () => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const codeRef = useRef('');
  const nameRef = useRef('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Aktualizujemy refs za każdym razem, gdy code lub name się zmieni
  useEffect(() => {
    codeRef.current = code;
    nameRef.current = name;
  }, [code, name]);

  useEffect(() => {
    // Inicjalizujemy socket tylko raz, gdy komponent jest montowany
    socketRef.current = io('http://localhost:5000');

    // Nasłuchujemy na zdarzenie 'joinedQuiz'
    socketRef.current.on('joinedQuiz', () => {
        console.log('Otrzymano joinedQuiz, przekierowuję na QuizPlay');
      navigate(`/quiz/play/${codeRef.current}`, { state: { name: nameRef.current } });
    });

    // Nasłuchujemy na zdarzenie 'error'
    socketRef.current.on('error', (data) => {
      setError(data.message);
    });

    // Czyszczenie po odłączeniu komponentu
    return () => {
      socketRef.current.disconnect();
    };
  }, [navigate]);

  const handleJoinQuiz = () => {
    console.log('Emituje joinQuiz z kodem:', code, 'i nazwą:', name);
    socketRef.current.emit('joinQuiz', { code, name });
  };

  return (
    <div className={styles.container}>
      <h2>Dołącz do quizu</h2>
      {error && <div className={styles.alertDanger}>{error}</div>}
      <input
        type="text"
        placeholder="Kod quizu"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Twoja nazwa"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleJoinQuiz}>Dołącz</button>
    </div>
  );
};

export default JoinQuiz;
