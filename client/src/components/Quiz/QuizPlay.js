import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { SocketContext } from '../../contexts/SocketContext';
import CountdownScreen from './screens/CountdownScreen';
import QuestionScreen from './screens/QuestionScreen';
import StartWaitingScreen from './screens/StartWaitingScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import FinalCountdownScreen from './screens/FinalCountdownScreen';
import ResultsScreen from './screens/ResultsScreen';
import BetweenWaitingScreen from './screens/BetweenWaitingScreen';

const QuizPlay = () => {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const name =
    location.state?.name || localStorage.getItem('username') || 'Anonim';

  const [screen, setScreen] = useState('waiting');
  const [countdown, setCountdown] = useState(0);
  const [question, setQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [answerResult, setAnswerResult] = useState(false);
  const questionStartTimeRef = useRef(null);
  const [questionTime, setQuestionTime] = useState(30);
  useEffect(() => {
    if (!code || !name) {
      navigate('/join-quiz');
      return;
    }

    socket.emit('joinQuizRoom', { code, name });

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

    socket.on('showQuestion', ({ question, questionTime }) => {
      setScreen('question');
      setQuestion(question);
      setQuestionTime(questionTime);
      questionStartTimeRef.current = Date.now();
      const interval = setInterval(() => {
        setQuestionTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('showLeaderboard', ({ leaderboard, userResult }) => {
      setScreen('leaderboard');
      setLeaderboard(leaderboard);
      setAnswerResult(userResult);
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
    const timeElapsed = (currentTime - questionStartTimeRef.current) / 1000;
    const timeInSeconds = Math.round(timeElapsed * 100) / 100;

    socket.emit('submitAnswer', {
      code,
      questionId: question.id,
      answerId,
      time: timeInSeconds,
    });

    setScreen('waiting-between');
  };

  switch (screen) {
    case 'countdown':
      return <CountdownScreen countdown={countdown} />;
    case 'question':
      return (
        <QuestionScreen question={question} questionTime={questionTime} handleAnswerClick={handleAnswerClick} />
      );
    case 'waiting':
      return <StartWaitingScreen />;
    case 'leaderboard':
       return <LeaderboardScreen leaderboard={leaderboard} answerResult={answerResult}/>;
    case 'finalCountdown':
      return <FinalCountdownScreen countdown={countdown} />;
    case 'results':
      return <ResultsScreen results={results} />;
      case 'waiting-between':
        return <BetweenWaitingScreen />; 
    default:
      <QuestionScreen question={question} handleAnswerClick={handleAnswerClick} />
  }
};

export default QuizPlay;
