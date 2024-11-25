import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from '../../styles/QuizLobby.module.css';

const QuizLobby = () => {
    const { quizId } = useParams();
    const [quizCode, setQuizCode] = useState('');
    const [quizName, setQuizName] = useState('');
    const [questionTime, setQuestionTime] = useState(0);
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState('');
    const socketRef = useRef(null);
  
    useEffect(() => {
      socketRef.current = io('http://localhost:5000'); // Upewnij się, że adres jest poprawny
  
      console.log('quizId:', quizId);
  
      // Po załadowaniu komponentu, wywołujemy zdarzenie createQuiz
      socketRef.current.emit('createQuiz', {
        quizId
      });
  
      // Odbieramy kod i nazwę quizu z serwera
      socketRef.current.on('quizCreated', ({ code, name, questionTime }) => {
        setQuizCode(code);
        setQuizName(name);
        setQuestionTime(questionTime);
      });

    // Odbieramy informacje o nowych uczestnikach
    socketRef.current.on('newParticipant', ({ name }) => {
      setParticipants((prevParticipants) => [...prevParticipants, { name }]);
    });

    // Odbieramy aktualną listę uczestników (na wypadek odświeżenia strony)
    socketRef.current.on('participantsList', (participantsList) => {
      setParticipants(participantsList);
    });

    // Obsługa błędów
    socketRef.current.on('error', (data) => {
      console.error(data.message);
      setError(data.message);
    });

    // Czyszczenie po odłączeniu
    return () => {
        socketRef.current.disconnect();
      };
    }, [quizId]);
    const handleStartQuiz = () => {
        socketRef.current.emit('startQuiz', { code: quizCode });
      };
  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <Sidebar />
        <div className={styles.content}>
          <h2>Lobby Quizu: {quizName}</h2>
          {error && <div className={styles.alertDanger}>{error}</div>}
          <p>Kod quizu: <strong>{quizCode}</strong></p>
          <p>Czas na pytanie: <strong>{questionTime} sekund</strong></p>

          <h3>Uczestnicy:</h3>
          {participants.length > 0 ? (
            <ul>
              {participants.map((participant, index) => (
                <li key={index}>{participant.name}</li>
              ))}
            </ul>
          ) : (
            <p>Brak uczestników.</p>
          )}

          {/* Możesz dodać przycisk do rozpoczęcia quizu */}
          <button className={styles.button} onClick={() => handleStartQuiz()}>
            Rozpocznij quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizLobby;
