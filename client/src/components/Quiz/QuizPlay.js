// QuizPlay.js
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { SocketContext } from '../../contexts/SocketContext';
import styles from '../../styles/QuizPlay.module.css';

const QuizPlay = () => {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const name =
    location.state?.name || localStorage.getItem('username') || 'Anonim';

  const [screen, setScreen] = useState('waiting'); // 'waiting', 'countdown', 'question', 'leaderboard', 'finalCountdown', 'results'
  const [countdown, setCountdown] = useState(0);
  const [question, setQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const questionStartTimeRef = useRef(null); // Referencja do czasu rozpoczęcia pytania

  useEffect(() => {
    if (!code || !name) {
      navigate('/join-quiz');
      return;
    }

    // Dołącz do pokoju quizu
    socket.emit('joinQuizRoom', { code, name });

    // Nasłuchuj na zdarzenia
    socket.on('showCountdown', ({ countdown }) => {
      setScreen('countdown');
      setCountdown(countdown);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('showQuestion', ({ question }) => {
      setScreen('question');
      setQuestion(question);
      questionStartTimeRef.current = Date.now(); // Zapisz czas rozpoczęcia pytania
    });

    socket.on('showLeaderboard', ({ leaderboard }) => {
      setScreen('leaderboard');
      setLeaderboard(leaderboard);
      // Serwer automatycznie wyśle kolejne pytanie po opóźnieniu
    });

    socket.on('startFinalCountdown', ({ countdown }) => {
      setScreen('finalCountdown');
      setCountdown(countdown);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('quizEnded', ({ results }) => {
      setResults(results);
      setScreen('results');
    });

    socket.on('error', (data) => {
      setError(data.message);
    });

    socket.on('quizCanceled', (data) => {
      alert(data.message);
      navigate('/join-quiz');
    });

    // Czyszczenie nasłuchiwaczy
    return () => {
      socket.off('showCountdown');
      socket.off('showQuestion');
      socket.off('showLeaderboard');
      socket.off('startFinalCountdown');
      socket.off('quizEnded');
      socket.off('error');
      socket.off('quizCanceled');
    };
  }, [code, name, navigate, socket]);

  const handleAnswerClick = (answerId) => {
    const currentTime = Date.now();
    const timeElapsed = (currentTime - questionStartTimeRef.current) / 1000; // Czas w sekundach
    const timeInSeconds = Math.round(timeElapsed * 100) / 100; // Zaokrąglenie do dwóch miejsc po przecinku

    socket.emit('submitAnswer', {
      code,
      questionId: question.id,
      answerId,
      time: timeInSeconds,
    });

    setScreen('waiting');
  };

  // Renderowanie różnych ekranów
  if (screen === 'countdown') {
    return (
      <div className={styles.container}>
        <h2>Przygotuj się!</h2>
        <p>Pytanie rozpocznie się za {countdown} sekund...</p>
      </div>
    );
  }

  if (screen === 'question') {
    return (
      <div className={styles.container}>
        <h2>{question.content}</h2>
        <div className={styles.answers}>
          {question.answers.map((answer) => (
            <button key={answer.id} onClick={() => handleAnswerClick(answer.id)}>
              {answer.content}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'waiting') {
    return (
      <div className={styles.container}>
        <h2>Oczekiwanie na pozostałych uczestników...</h2>
      </div>
    );
  }

  if (screen === 'leaderboard') {
    return (
      <div className={styles.container}>
        <h2>Ranking</h2>
        <ul>
          {leaderboard.map((participant, index) => (
            <li key={index}>
              {participant.name}: {participant.score} pkt
            </li>
          ))}
        </ul>
        <p>Następne pytanie rozpocznie się za chwilę...</p>
      </div>
    );
  }

  if (screen === 'finalCountdown') {
    return (
      <div className={styles.container}>
        <h2>Przygotuj się!</h2>
        <p>Wyniki końcowe pojawią się za {countdown} sekund...</p>
      </div>
    );
  }

  if (screen === 'results') {
    return (
      <div className={styles.container}>
        <h2>Wyniki końcowe</h2>
        <ul>
          {results.map((participant, index) => (
            <li key={index}>
              {participant.name}: {participant.score} pkt
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};

export default QuizPlay;
