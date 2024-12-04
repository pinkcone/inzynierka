import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from '../../styles/QuizLobby.module.css';
import { SocketContext } from '../../contexts/SocketContext';

const QuizLobby = () => {
  const { quizId } = useParams();
  const [quizCode, setQuizCode] = useState('');
  const [quizName, setQuizName] = useState('');
  const [questionTime, setQuestionTime] = useState(0);
  const [questionCount, setQuestionCount] = useState(0)
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const socket = useContext(SocketContext);

  useEffect(() => {
    console.log('wysylam zadnie stworzenia quizu: ', quizId);

    socket.emit('createQuiz', { quizId });
    console.log('wysylano zadnie stworzenia quizu: ', quizId);
    socket.on('quizCreated', ({ code, name, questionTime, questionCount }) => {
      console.log('stworzono quiz:  ', code);
      setQuizCode(code);
      setQuizName(name);
      setQuestionTime(questionTime);
      setQuestionCount(questionCount);
    });
    socket.on('participantsList', (participantsList) => {
      setParticipants(participantsList);
    });

    socket.on('error', (data) => {
      console.error(data.message);
      setError(data.message);
    });

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

    socket.emit('joinQuiz', { code: quizCode, name: organizerName });

    socket.emit('startQuiz', { code: quizCode });

    navigate(`/quiz/play/${quizCode}`, { state: { name: organizerName } });
  };

  const handleCopyCodeToClipboard = () => {
    navigator.clipboard
      .writeText(quizCode)
      .then(() => {
        alert("Kod quizu skopiowany do schowka!");
      })
      .catch((error) => {
        console.error("Nie udało się skopiować kodu do schowka:", error);
      });
  };
  const handleCopyLinkToClipboard = () => {
    navigator.clipboard
      .writeText("www.learnify.fun/join-quiz")
      .then(() => {
        alert("Link skopiowany do schowka!");
      })
      .catch((error) => {
        console.error("Nie udało się skopiować linku do schowka:", error);
      });
  };
  return (
    <div className={styles.appContainer}>
      <div className={styles.content}>
        {error && <div className={styles.alertDanger}>{error}</div>}

        <div class={styles.puzzlecontainer}>
          <div className={`${styles.puzzlepiece} ${styles.left} `} onClick={handleCopyLinkToClipboard}>
            <h3>Dołącz do quizu na:<br /> www.learnify.fun/join-quiz</h3>
          </div>
          <div class={`${styles.puzzlepiece} ${styles.right} ${styles.code}`} onClick={handleCopyCodeToClipboard}>
            <h3>
              <span>Kod quizu:</span><br /><strong>{quizCode}</strong>
            </h3>
          </div>
          
        </div>
        

        <div className={styles.quizDetails}>
          <p>
            Nazwa quizu: <strong>{quizName}</strong>
          </p>
          <p>
            Ilość pytań: <strong>{questionCount}</strong>
          </p>
          <p>
            Czas na odpowiedź: <strong>{questionTime} sekund</strong>
          </p>

        </div>
        <div className={styles.buttonStart}>
            <button className={styles.button} onClick={handleStartQuiz}>START</button>
          </div>
          <div className={styles.participantsList}>
            <h3>Uczestnicy:</h3>
            {participants.length > 0 ? (
              <ul>
                {participants.map((participant, index) => (
                  <li key={index} className={styles.participant}>{participant.name}</li>
                ))}
              </ul>
            ) : (
              <p>Brak uczestników.</p>
            )}
          </div>
          

      </div>
    </div>
  );
};

export default QuizLobby;
