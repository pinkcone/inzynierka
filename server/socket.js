const quizHandler = require('./socketHandlers/quizHandler');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Użytkownik połączony:', socket.id);

    quizHandler(io, socket);

    socket.on('disconnect', () => {
      console.log('Użytkownik rozłączony:', socket.id);
    });
  });
};
