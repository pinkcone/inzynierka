// socketHandlers/quizHandler.js
const Quiz = require('../models/Quiz'); // Import modeli
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { v4: uuidv4 } = require('uuid');
const activeQuizzes = {}; // Centralne przechowywanie aktywnych quizów

module.exports = (io, socket) => {
  // Obsługa zdarzenia tworzenia quizu
  socket.on('createQuiz', async ({ quizId }) => {
    try {
      console.log('Otrzymano quizId:', quizId);

      // Generuj unikalny kod quizu
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
        questionTime: quiz.questionTime, // Dodaj czas na pytanie
        questions: quiz.Questions, // Użyj pytań pobranych z asocjacji
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

      // Wyślij aktualną listę uczestników (powinna być pusta)
      socket.emit('participantsList', []);
    } catch (error) {
      console.error('Błąd podczas tworzenia quizu:', error);
      socket.emit('error', { message: 'Błąd podczas tworzenia quizu.' });
    }
  });

  // Obsługa zdarzenia dołączania do quizu
  socket.on('joinQuiz', ({ code, name }) => {
    console.log('Otrzymano joinQuiz od socket.id:', socket.id, 'z kodem:', code, 'i nazwą:', name);
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

  // Obsługa zdarzenia rozpoczęcia quizu
  socket.on('startQuiz', ({ code }) => {
    const quiz = activeQuizzes[code];
    if (quiz && quiz.organizerSocketId === socket.id) {
      quiz.isStarted = true;
      io.to(code).emit('quizStarted');
      // Rozpocznij logikę wysyłania pytań
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
      // Quiz zakończony
      io.to(code).emit('quizEnded', { results: getQuizResults(quiz) });
      // Usuń quiz z activeQuizzes
      delete activeQuizzes[code];
      return;
    }

    // Wyślij ekran odliczania
    io.to(code).emit('showCountdown', { countdown: 20 });

    // Po 20 sekundach wyślij pytanie
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
    }, 20000); // 20 sekund
  }

  // Obsługa zdarzenia przesłania odpowiedzi przez uczestnika
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

      // Sprawdź, czy wszyscy odpowiedzieli
      const totalParticipants = Object.keys(quiz.participants).length;
      const totalAnswers = Object.keys(quiz.currentAnswers).length;

      if (totalAnswers === totalParticipants) {
        // Wszyscy odpowiedzieli, przejdź do następnego etapu
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
        participant.score = (participant.score || 0) + 1; // Możesz dostosować punktację
      }
    }

    // Wyślij wyniki do uczestników
    const leaderboard = getLeaderboard(quiz);

    io.to(code).emit('showLeaderboard', { leaderboard });

    // Przejdź do następnego pytania po 20 sekundach
    quiz.currentQuestionIndex += 1;
    setTimeout(() => {
      sendQuestionToParticipants(quiz);
    }, 20000); // 20 sekund
  }

  // Funkcja do generowania tablicy rankingowej
  function getLeaderboard(quiz) {
    const participants = Object.values(quiz.participants);

    // Posortuj uczestników według wyniku malejąco
    participants.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Zwróć top 5
    return participants.slice(0, 5).map((participant) => ({
      name: participant.name,
      score: participant.score || 0,
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

  // Obsługa zdarzenia dołączenia do pokoju quizu
  socket.on('joinQuizRoom', ({ code, name }) => {
    const quiz = activeQuizzes[code];
    if (quiz) {
      // Dodaj uczestnika, jeśli jeszcze nie istnieje
      if (!quiz.participants[socket.id]) {
        quiz.participants[socket.id] = {
          name: name || 'Anonim',
          score: 0,
        };
      }
      socket.join(code);
    } else {
      socket.emit('error', {
        message: 'Quiz o podanym kodzie nie istnieje.',
      });
    }
  });

  // Obsługa odłączenia uczestnika
  socket.on('disconnect', () => {
    // Przeszukaj wszystkie aktywne quizy
    for (const code in activeQuizzes) {
      const quiz = activeQuizzes[code];
      if (quiz.participants[socket.id]) {
        // Usuń uczestnika
        delete quiz.participants[socket.id];
        // Wyślij zaktualizowaną listę uczestników
        const participantsList = Object.values(quiz.participants).map((p) => ({
          name: p.name,
        }));
        io.to(code).emit('participantsList', participantsList);
      }
    }
  });

  // Inne obsługi zdarzeń...
};
