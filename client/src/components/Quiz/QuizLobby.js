import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../styles/QuizLobby.module.css';
import { SocketContext } from '../../contexts/SocketContext';

const QuizLobby = () => {
  const { quizId } = useParams();
  const [quizCode, setQuizCode] = useState('');
  const [quizName, setQuizName] = useState('');
  const [questionTime, setQuestionTime] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const socket = useContext(SocketContext);

  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  useEffect(() => {
    socket.emit('createQuiz', { quizId });

    socket.on('quizCreated', ({ code, name, questionTime, questionCount }) => {
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
  }, [quizId, socket, quizStarted, quizCode]);

  useEffect(() => {
    // Gdy isMuted zmieni się na false, spróbuj odtworzyć audio
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = volume;
      if (!isMuted) {
        audioRef.current.play().catch(err => console.error("Nie udało się odtworzyć audio:", err));
      }
    }
  }, [isMuted, volume]);

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

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <div className={styles.appContainer}>
      <audio ref={audioRef} autoPlay loop muted>
        <source src="/sounds/KeepTheQuizAlive.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Ikona głośnika w prawym górnym rogu */}
      <div className={styles.soundControl}>
        <div className={styles.soundIcon} onClick={toggleMute}>
          {isMuted ? '🔇' : '🔊'}
        </div>
        {!isMuted && (
          <div className={styles.volumeSlider}>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))} 
            />
          </div>
        )}
      </div>

      <div className={styles.content}>
        {error && <div className={styles.alertDanger}>{error}</div>}
        <div className={styles.puzzlecontainer}>
          <div className={`${styles.puzzlepiece} ${styles.left}`} onClick={handleCopyLinkToClipboard}>
            <h3>Dołącz do quizu na:<br /> www.learnify.fun/join-quiz</h3>
          </div>
          <div className={`${styles.puzzlepiece} ${styles.right} ${styles.code}`} onClick={handleCopyCodeToClipboard}>
            <h3>
              <span>Kod quizu:</span><br /><strong>{quizCode}</strong>
            </h3>
          </div>
        </div>

        <div className={styles.quizDetails}>
          <p>Nazwa quizu: <strong>{quizName}</strong></p>
          <p>Ilość pytań: <strong>{questionCount}</strong></p>
          <p>Czas na odpowiedź: <strong>{questionTime} sekund</strong></p>
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
