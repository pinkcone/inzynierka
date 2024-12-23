const app = require('./app');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const sequelize = require('./config/sequelize');
const { User, Set, Question, Answer, Report } = require('./models/associations');


const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
require('./socket')(io);

sequelize.sync({ force: false })
  .then(() => {
    console.log('Modele zostały zsynchronizowane z bazą danych.');
  })
  .catch(err => {
    console.error('Błąd synchronizacji modeli:', err);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
