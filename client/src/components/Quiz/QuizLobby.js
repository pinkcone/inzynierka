// QuizLobby.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from '../../styles/QuizLobby.module.css';
import { SocketContext } from '../../contexts/SocketContext'; // Upewnij się, że ścieżka jest poprawna

const QuizLobby = () => {
  const { quizId } = useParams();
  const [quizCode, setQuizCode] = useState('');
  const [quizName, setQuizName] = useState('');
  const [questionTime, setQuestionTime] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const socket = useContext(SocketContext);

  useEffect(() => {
    console.log('wysylam zadnie stworzenia quizu: ', quizId);

    // Emituj zdarzenie 'createQuiz'
    socket.emit('createQuiz', { quizId });
    console.log('wysylano zadnie stworzenia quizu: ', quizId);
    // Nasłuchuj na zdarzenie 'quizCreated'
    socket.on('quizCreated', ({ code, name, questionTime }) => {
      console.log('stworzono quiz:  ', code);
      setQuizCode(code);
      setQuizName(name);
      setQuestionTime(questionTime);
    });

    // Nasłuchuj na aktualizacje listy uczestników
    socket.on('participantsList', (participantsList) => {
      setParticipants(participantsList);
    });

    // Obsługa błędów
    socket.on('error', (data) => {
      console.error(data.message);
      setError(data.message);
    });

    // Czyszczenie nasłuchiwaczy
    return () => {
      if (!quizStarted) {
        socket.emit('cancelQuiz', { code: quizCode });
      }
      socket.off('quizCreated');
      socket.off('participantsList');
      socket.off('error');
    };
  }, [quizId, socket]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    const organizerName = localStorage.getItem('username') || 'Host';

    // Host dołącza do quizu jako uczestnik
    socket.emit('joinQuiz', { code: quizCode, name: organizerName });

    // Emituj zdarzenie 'startQuiz'
    socket.emit('startQuiz', { code: quizCode });

    // Przekieruj hosta do 'QuizPlay'
    navigate(`/quiz/play/${quizCode}`, { state: { name: organizerName } });
  };

  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <Sidebar />
        <div className={styles.content}>
          <h2>Lobby Quizu: {quizName}</h2>
          {error && <div className={styles.alertDanger}>{error}</div>}
          <p>
            Kod quizu: <strong>{quizCode}</strong>
          </p>
          <p>
            Czas na pytanie: <strong>{questionTime} sekund</strong>
          </p>

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

          <button className={styles.button} onClick={handleStartQuiz}>
            Rozpocznij quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizLobby;
