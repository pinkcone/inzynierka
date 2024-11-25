// socket.js

const quizHandler = require('./socketHandlers/quizHandler');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Użytkownik połączony:', socket.id);

    // Przekazujemy `io` i `socket` do modułu obsługującego quiz
    quizHandler(io, socket);

    socket.on('disconnect', () => {
      console.log('Użytkownik rozłączony:', socket.id);
    });
  });
};
