const Quiz = require('../models/Quiz'); // Import modeli
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { v4: uuidv4 } = require('uuid');

const activeQuizzes = {}; // Centralne przechowywanie aktywnych quizów

module.exports = (io, socket) => {
  // Obsługa zdarzenia 'createQuiz'
  socket.on('createQuiz', async ({ quizId }) => {
    console.log('Otrzymano quizId:', quizId);
    try {
      // Sprawdź, czy quiz z danym quizId już istnieje
      let existingQuizCode = null;
      for (const code in activeQuizzes) {
        const quiz = activeQuizzes[code];
        if (quiz.quizId === quizId) {
          existingQuizCode = code;
          break;
        }
      }

      if (existingQuizCode) {
        // Quiz już istnieje, zwróć istniejący kod i dane
        const existingQuiz = activeQuizzes[existingQuizCode];

        // Dołącz organizatora do pokoju
        socket.join(existingQuizCode);

        // Wyślij kod, nazwę quizu i czas na pytanie do organizatora
        socket.emit('quizCreated', {
          code: existingQuizCode,
          name: existingQuiz.name,
          questionTime: existingQuiz.questionTime,
        });

        return;
      }

      // Jeśli quiz nie istnieje, utwórz nowy
      let code;
      do {
        code = uuidv4().slice(0, 6).toUpperCase();
        console.log('Wygenerowany kod quizu:', code);
      } while (activeQuizzes[code]);

      // Pobierz quiz z bazy danych wraz z powiązanymi pytaniami i odpowiedziami
      const quiz = await Quiz.findOne({
        where: { id: quizId },
        include: [
          {
            model: Question,
            include: [Answer],
          },
        ],
      });

      if (!quiz) {
        socket.emit('error', { message: 'Quiz nie został znaleziony.' });
        return;
      }

      if (!quiz.Questions || !quiz.Questions.length) {
        socket.emit('error', { message: 'Quiz nie zawiera pytań.' });
        return;
      }

      // Utwórz nowy aktywny quiz
      activeQuizzes[code] = {
        code,
        name: quiz.name,
        quizId,
        questionTime: quiz.questionTime,
        questions: quiz.Questions,
        participants: {},
        currentQuestionIndex: 0,
        isStarted: false,
        organizerSocketId: socket.id,
      };

      // Dołącz organizatora do pokoju
      socket.join(code);

      // Wyślij kod, nazwę quizu i czas na pytanie do organizatora
      socket.emit('quizCreated', {
        code,
        name: quiz.name,
        questionTime: quiz.questionTime,
      });
    } catch (error) {
      console.error('Błąd podczas tworzenia quizu:', error);
      socket.emit('error', { message: 'Błąd podczas tworzenia quizu.' });
    }
  });

  // Obsługa zdarzenia 'joinQuiz'
  socket.on('joinQuiz', ({ code, name }) => {
    console.log(
      'Otrzymano joinQuiz od socket.id:',
      socket.id,
      'z kodem:',
      code,
      'i nazwą:',
      name
    );
    const quiz = activeQuizzes[code];
    if (quiz) {
      // Sprawdź, czy nazwa uczestnika jest unikalna
      const nameExists = Object.values(quiz.participants).some(
        (p) => p.name === name
      );
      if (nameExists) {
        socket.emit('error', {
          message: 'Ta nazwa jest już zajęta w tym quizie.',
        });
        return;
      }

      // Dodaj uczestnika do quizu
      quiz.participants[socket.id] = {
        name,
        lastAnswer: null,
        time: 0,
        score: 0,
        streak: 0,
      };

      socket.join(code);
      socket.emit('joinedQuiz', { message: 'Dołączyłeś do quizu.' });
      console.log('Wysłano joinedQuiz do socket.id:', socket.id);

      // Wyślij aktualną listę uczestników do wszystkich w pokoju
      const participantsList = Object.values(quiz.participants).map((p) => ({
        name: p.name,
      }));
      io.to(code).emit('participantsList', participantsList);
    } else {
      socket.emit('error', {
        message: 'Quiz o podanym kodzie nie istnieje.',
      });
    }
  });

  // Obsługa zdarzenia 'joinQuizRoom'
  socket.on('joinQuizRoom', ({ code, name }) => {
    const quiz = activeQuizzes[code];
    if (quiz) {
      // Dodaj uczestnika, jeśli jeszcze nie istnieje
      if (!quiz.participants[socket.id]) {
        // Sprawdź, czy nazwa uczestnika jest unikalna
        const nameExists = Object.values(quiz.participants).some(
          (p) => p.name === name
        );
        if (nameExists) {
          socket.emit('error', {
            message: 'Ta nazwa jest już zajęta w tym quizie.',
          });
          return;
        }

        quiz.participants[socket.id] = {
          name: name || 'Anonim',
          score: 0,
          lastAnswer: null,
          time: 0,
          streak: 0,
        };
        // Wyślij zaktualizowaną listę uczestników
        const participantsList = Object.values(quiz.participants).map((p) => ({
          name: p.name,
        }));
        io.to(code).emit('participantsList', participantsList);
      }
      socket.join(code);
    } else {
      socket.emit('error', {
        message: 'Quiz o podanym kodzie nie istnieje.',
      });
    }
  });

  // Obsługa zdarzenia 'startQuiz'
  socket.on('startQuiz', ({ code }) => {
    const quiz = activeQuizzes[code];
    if (quiz && quiz.organizerSocketId === socket.id) {
      quiz.isStarted = true;
      io.to(code).emit('quizStarted');
      // Rozpocznij wysyłanie pytań
      sendQuestionToParticipants(quiz);
    } else {
      socket.emit('error', {
        message: 'Nie masz uprawnień do rozpoczęcia tego quizu.',
      });
    }
  });

  // Funkcja do wysyłania pytań do uczestników
  function sendQuestionToParticipants(quiz) {
    const code = quiz.code;
    const questionIndex = quiz.currentQuestionIndex;

    if (questionIndex >= quiz.questions.length) {
      // Brak więcej pytań, zakończ quiz
      return;
    }

    // Wyślij odliczanie przed pytaniem
    io.to(code).emit('showCountdown', { countdown: 5 }); // 5 sekund odliczania

    // Po 5 sekundach wyślij pytanie
    setTimeout(() => {
      const question = quiz.questions[questionIndex];
      // Wyślij pytanie do uczestników
      io.to(code).emit('showQuestion', {
        question: {
          id: question.id,
          content: question.content,
          answers: question.Answers.map((answer) => ({
            id: answer.id,
            content: answer.content,
          })),
        },
      });

      // Inicjalizuj obiekt przechowujący odpowiedzi uczestników
      quiz.currentAnswers = {};
    }, 5000); // 5 sekund
  }

  // Obsługa zdarzenia 'submitAnswer'
  socket.on('submitAnswer', ({ code, questionId, answerId, time }) => {
    const quiz = activeQuizzes[code];
    if (quiz && quiz.isStarted) {
      // Sprawdź, czy pytanie jest aktualne
      const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
      if (currentQuestion.id !== questionId) {
        socket.emit('error', { message: 'To pytanie nie jest już aktywne.' });
        return;
      }

      // Zapisz odpowiedź uczestnika
      quiz.currentAnswers[socket.id] = {
        answerId,
        time,
      };

      const totalParticipants = Object.keys(quiz.participants).length;
      const totalAnswers = Object.keys(quiz.currentAnswers).length;

      if (totalAnswers === totalParticipants) {
        // Wszyscy uczestnicy odpowiedzieli, przejdź do następnego etapu
        calculateResultsAndProceed(quiz);
      }
    } else {
      socket.emit('error', { message: 'Quiz nie jest aktywny.' });
    }
  });

  // Funkcja do obliczania wyników i przechodzenia do kolejnego pytania
  function calculateResultsAndProceed(quiz) {
    const code = quiz.code;
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];

    // Pobierz poprawne odpowiedzi
    const correctAnswers = currentQuestion.Answers.filter(
      (answer) => answer.isTrue
    ).map((answer) => answer.id);

    // Oblicz wyniki uczestników
    for (const socketId in quiz.currentAnswers) {
      const participant = quiz.participants[socketId];
      const answer = quiz.currentAnswers[socketId];

      if (correctAnswers.includes(answer.answerId)) {
        const maxTime = quiz.questionTime || 30;
        const timeTaken = answer.time;
        const points =
          Math.max(0, Math.round(((maxTime - timeTaken) * 500) / maxTime)) +
          500;
        participant.score = (participant.score || 0) + points;
        participant.streak = (participant.streak || 0) + 1; // Dodaj do streak
      } else {
        // Odpowiedź niepoprawna
        participant.streak = 0; // Zresetuj streak
      }
    }

    const leaderboard = getLeaderboard(quiz);

    // Sprawdź, czy to było ostatnie pytanie
    if (quiz.currentQuestionIndex + 1 >= quiz.questions.length) {
      // Zamiast wysyłać tablicę wyników, wyślij końcowe odliczanie
      io.to(code).emit('startFinalCountdown', { countdown: 10 });

      // Po 10 sekundach wyślij ostateczne wyniki
      setTimeout(() => {
        io.to(code).emit('quizEnded', { results: getQuizResults(quiz) });
        // Usuń quiz z aktywnych quizów
        delete activeQuizzes[code];
      }, 10000); // 10 sekund
    } else {
      // Wyślij tablicę wyników z 5 najlepszymi uczestnikami
      io.to(code).emit('showLeaderboard', {
        leaderboard: leaderboard.slice(0, 5),
      });

      // Przejdź do następnego pytania po 5 sekundach
      quiz.currentQuestionIndex += 1;
      setTimeout(() => {
        sendQuestionToParticipants(quiz);
      }, 5000); // 5 sekund na wyświetlenie tablicy wyników
    }
  }

  // Funkcja do generowania tablicy rankingowej
  function getLeaderboard(quiz) {
    const participants = Object.values(quiz.participants);

    // Posortuj uczestników według wyniku malejąco
    participants.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Zwróć listę uczestników
    return participants.map((participant) => ({
      name: participant.name,
      score: participant.score || 0,
      streak: participant.streak || 0,
    }));
  }

  // Funkcja do pobierania wyników końcowych quizu
  function getQuizResults(quiz) {
    const participants = Object.values(quiz.participants);

    // Posortuj uczestników według wyniku malejąco
    participants.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Zwróć wyniki wszystkich uczestników
    return participants.map((participant) => ({
      name: participant.name,
      score: participant.score || 0,
    }));
  }

  // Obsługa zdarzenia 'disconnect'
  socket.on('disconnect', () => {
    console.log(`Użytkownik rozłączony: ${socket.id}`);
    for (const code in activeQuizzes) {
      const quiz = activeQuizzes[code];
      if (quiz.organizerSocketId === socket.id) {
        // Jeśli quiz nie został jeszcze rozpoczęty, usuń go
        if (!quiz.isStarted) {
          delete activeQuizzes[code];
          console.log(
            `Quiz o kodzie ${code} został usunięty z powodu rozłączenia hosta.`
          );
          // Powiadom uczestników
          io.to(code).emit('quizCanceled', {
            message: 'Quiz został anulowany, ponieważ host się rozłączył.',
          });
        }
      }
      // Usuń uczestnika z quizu, jeśli był uczestnikiem
      if (quiz.participants[socket.id]) {
        delete quiz.participants[socket.id];
        // Wyślij zaktualizowaną listę uczestników
        const participantsList = Object.values(quiz.participants).map((p) => ({
          name: p.name,
        }));
        io.to(code).emit('participantsList', participantsList);
      }
    }
  });

  // Obsługa zdarzenia 'cancelQuiz'
  socket.on('cancelQuiz', ({ code }) => {
    const quiz = activeQuizzes[code];
    if (quiz) {
      // Sprawdź, czy quiz nie został jeszcze rozpoczęty
      if (!quiz.isStarted) {
        delete activeQuizzes[code];
        console.log(`Quiz o kodzie ${code} został anulowany przez hosta.`);
        // Opcjonalnie, powiadom uczestników o anulowaniu quizu
        io.to(code).emit('quizCanceled', {
          message: 'Quiz został anulowany przez hosta.',
        });
      }
    }
  });
};
