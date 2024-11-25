import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../../styles/QuizPlay.module.css';

const QuizPlay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { code } = location.state || {};
  const socketRef = useRef(null);

  const [screen, setScreen] = useState('countdown'); // 'countdown', 'question', 'waiting', 'leaderboard', 'results'
  const [countdown, setCountdown] = useState(0);
  const [question, setQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) {
      navigate('/join-quiz');
      return;
    }

    socketRef.current = io('http://localhost:5000');

    // Dołącz do pokoju
    socketRef.current.emit('joinQuizRoom', { code });

    // Odbieraj ekran odliczania
    socketRef.current.on('showCountdown', ({ countdown }) => {
      setScreen('countdown');
      setCountdown(countdown);

      // Odliczanie
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    // Odbieraj pytanie
    socketRef.current.on('showQuestion', ({ question }) => {
      setScreen('question');
      setQuestion(question);
    });

    // Odbieraj tablicę rankingową
    socketRef.current.on('showLeaderboard', ({ leaderboard }) => {
      setScreen('leaderboard');
      setLeaderboard(leaderboard);
    });

    // Odbieraj wyniki końcowe
    socketRef.current.on('quizEnded', ({ results }) => {
      setScreen('results');
      setResults(results);
    });

    // Obsługa błędów
    socketRef.current.on('error', (data) => {
      console.error(data.message);
      setError(data.message);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [code, navigate]);

  const handleAnswerClick = (answerId) => {
    // Wyślij odpowiedź do serwera
    socketRef.current.emit('submitAnswer', {
      code,
      questionId: question.id,
      answerId,
      time: new Date().getTime(), // Możesz użyć do pomiaru czasu odpowiedzi
    });
    setScreen('waiting');
  };

  // Renderowanie różnych ekranów
  if (screen === 'countdown') {
    return (
      <div className={styles.container}>
        <h2>Przygotuj się!</h2>
        <p>Quiz rozpocznie się za {countdown} sekund</p>
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
