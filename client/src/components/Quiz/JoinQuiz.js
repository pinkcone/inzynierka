import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../../contexts/SocketContext';
import styles from '../../styles/JoinQuiz.module.css';

const JoinQuiz = () => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const codeRef = useRef('');
  const nameRef = useRef('');

  useEffect(() => {
    codeRef.current = code;
    nameRef.current = name;
  }, [code, name]);

  useEffect(() => {
    // Nasłuchujemy na zdarzenie 'joinedQuiz'
    socket.on('joinedQuiz', () => {
      console.log('Otrzymano joinedQuiz, przekierowuję na QuizPlay');
      navigate(`/quiz/play/${codeRef.current}`, { state: { name: nameRef.current } });
    });

    // Nasłuchujemy na zdarzenie 'error'
    socket.on('error', (data) => {
      setError(data.message);
    });

    // Czyszczenie po odłączeniu komponentu
    return () => {
      socket.off('joinedQuiz');
      socket.off('error');
    };
  }, [navigate, socket]);

  const handleJoinQuiz = () => {
    console.log('Emituje joinQuiz z kodem:', code, 'i nazwą:', name);
    socket.emit('joinQuiz', { code, name });
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
