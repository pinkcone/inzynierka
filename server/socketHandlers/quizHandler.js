const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { v4: uuidv4 } = require('uuid');

const activeQuizzes = {};

module.exports = (io, socket) => {
  socket.on('createQuiz', async ({ quizId }) => {
    console.log('Otrzymano quizId:', quizId);
    try {
      let existingQuizCode = null;
      for (const code in activeQuizzes) {
        const quiz = activeQuizzes[code];
        if (quiz.quizId === quizId) {
          existingQuizCode = code;
          break;
        }
      }

      if (existingQuizCode) {
        const existingQuiz = activeQuizzes[existingQuizCode];

        socket.join(existingQuizCode);

        socket.emit('quizCreated', {
          code: existingQuizCode,
          name: existingQuiz.name,
          questionTime: existingQuiz.questionTime,
          questionCount: existingQuiz.questionCount,
        });

        return;
      }

      let code;
      do {
        code = uuidv4().slice(0, 6).toUpperCase();
        console.log('Wygenerowany kod quizu:', code);
      } while (activeQuizzes[code]);

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
      if (!quiz || !Array.isArray(quiz.Questions)) {
        socket.emit('error', { message: 'Quiz nie zawiera pytań.' });
        return;
      }
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
        questionCount: quiz.Questions.length,
      };

      socket.join(code);

      socket.emit('quizCreated', {
        code,
        name: quiz.name,
        questionTime: quiz.questionTime,
        questionCount: quiz.Questions.length,
      });
    } catch (error) {
      console.error('Błąd podczas tworzenia quizu:', error);
      socket.emit('error', { message: 'Błąd podczas tworzenia quizu.' });
    }
  });

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
        name,
        lastAnswer: null,
        time: 0,
        score: 0,
        streak: 0,
      };

      socket.join(code);
      socket.emit('joinedQuiz', { message: 'Dołączyłeś do quizu.' });
      console.log('Wysłano joinedQuiz do socket.id:', socket.id);

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

  socket.on('joinQuizRoom', ({ code, name }) => {
    const quiz = activeQuizzes[code];
    if (quiz) {
      if (!quiz.participants[socket.id]) {
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

  socket.on('startQuiz', ({ code }) => {
    const quiz = activeQuizzes[code];
    console.log("startuje do gówno kurewko")
    if (quiz && quiz.organizerSocketId === socket.id) {
      quiz.isStarted = true;
      io.to(code).emit('quizStarted');
      sendQuestionToParticipants(quiz);
    } else {
      socket.emit('error', {
        message: 'Nie masz uprawnień do rozpoczęcia tego quizu.',
      });
    }
  });

  function sendQuestionToParticipants(quiz) {
    const code = quiz.code;
    const questionIndex = quiz.currentQuestionIndex;
    console.log("wysylam pytanko", questionIndex);
    if (questionIndex >= quiz.questions.length) {
      return;
    }

    io.to(code).emit('showCountdown', { countdown: 5 });

    setTimeout(() => {
      const question = quiz.questions[questionIndex];

      const questionTime = quiz.questionTime || 30;
      io.to(code).emit('showQuestion', {
        question: {
          id: question.id,
          content: question.content,
          answers: question.Answers.map((answer) => ({
            id: answer.id,
            content: answer.content,
          })),
        },
        questionTime: questionTime
      });

      quiz.currentAnswers = {};

      quiz.answerTimer = setTimeout(() => {
        console.log('Upłynął czas na odpowiedź, obliczam wyniki...');
        calculateResultsAndProceed(quiz);
      }, questionTime * 1000);

    }, 5000);
  }

  socket.on('submitAnswer', ({ code, questionId, answerId, time }) => {
    const quiz = activeQuizzes[code];
    if (quiz && quiz.isStarted) {
      const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
      if (currentQuestion.id !== questionId) {
        socket.emit('error', { message: 'To pytanie nie jest już aktywne.' });
        return;
      }

      quiz.currentAnswers[socket.id] = {
        answerId,
        time,
      };

      const totalParticipants = Object.keys(quiz.participants).length;
      const totalAnswers = Object.keys(quiz.currentAnswers).length;

      if (totalAnswers === totalParticipants) {
        if (quiz.answerTimer) {
          clearTimeout(quiz.answerTimer);
          quiz.answerTimer = null;
        }
        calculateResultsAndProceed(quiz);
      }
    } else {
      socket.emit('error', { message: 'Quiz nie jest aktywny.' });
    }
  });

  function calculateResultsAndProceed(quiz) {
    const code = quiz.code;
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];

    const correctAnswers = currentQuestion.Answers.filter(
      (answer) => answer.isTrue
    ).map((answer) => answer.id);

    const userResults = {};
    for (const socketId in quiz.currentAnswers) {
      const participant = quiz.participants[socketId];
      const answer = quiz.currentAnswers[socketId];

      if (correctAnswers.includes(answer.answerId)) {
        const maxTime = quiz.questionTime || 30;
        const timeTaken = answer.time;
        const points =
          Math.max(0, Math.round(((maxTime - timeTaken) * 500) / maxTime)) + 500;
        participant.score = (participant.score || 0) + points;
        participant.streak = (participant.streak || 0) + 1;
        userResults[socketId] = true;
      } else {
        participant.streak = 0;
        userResults[socketId] = false;
      }
    }

    const leaderboard = getLeaderboard(quiz);

    if (quiz.currentQuestionIndex + 1 >= quiz.questions.length) {
      io.to(code).emit('startFinalCountdown', { countdown: 10 });

      setTimeout(() => {
        io.to(code).emit('quizEnded', { results: getQuizResults(quiz) });
        delete activeQuizzes[code];
      }, 10000);
    } else {
      for (const socketId in quiz.participants) {
        const userResult = userResults[socketId];
        io.to(socketId).emit('showLeaderboard', {
          leaderboard: leaderboard.slice(0, 5),
          userResult,
        });
      }

      quiz.currentQuestionIndex += 1;
      setTimeout(() => {
        sendQuestionToParticipants(quiz);
      }, 5000);
    }
  }

  function getLeaderboard(quiz) {
    const participants = Object.values(quiz.participants);

    participants.sort((a, b) => (b.score || 0) - (a.score || 0));

    return participants.map((participant) => ({
      name: participant.name,
      score: participant.score || 0,
      streak: participant.streak || 0,
    }));
  }

  function getQuizResults(quiz) {
    const participants = Object.values(quiz.participants);

    participants.sort((a, b) => (b.score || 0) - (a.score || 0));

    return participants.map((participant) => ({
      name: participant.name,
      score: participant.score || 0,
    }));
  }

  socket.on('disconnect', () => {
    console.log(`Użytkownik rozłączony: ${socket.id}`);
    for (const code in activeQuizzes) {
      const quiz = activeQuizzes[code];
      if (quiz.organizerSocketId === socket.id) {
        if (!quiz.isStarted) {
          delete activeQuizzes[code];
          console.log(
            `Quiz o kodzie ${code} został usunięty z powodu rozłączenia hosta.`
          );
          io.to(code).emit('quizCanceled', {
            message: 'Quiz został anulowany, ponieważ host się rozłączył.',
          });
        }
      }
      if (quiz.participants[socket.id]) {
        delete quiz.participants[socket.id];
        const participantsList = Object.values(quiz.participants).map((p) => ({
          name: p.name,
        }));
        io.to(code).emit('participantsList', participantsList);
      }
    }
  });

  socket.on('cancelQuiz', ({ code }) => {
    const quiz = activeQuizzes[code];
    if (quiz) {
      if (!quiz.isStarted) {
        delete activeQuizzes[code];
        console.log(`Quiz o kodzie ${code} został anulowany przez hosta.`);
        io.to(code).emit('quizCanceled', {
          message: 'Quiz został anulowany przez hosta.',
        });
      }
    }
  });
};
