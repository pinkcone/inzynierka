const app = require('./app');
const sequelize = require('./config/sequelize');
const { User, Set, Question, Answer, Report } = require('./models/associations'); // Importujemy modele z relacjami

sequelize.sync({ force: false })
  .then(() => {
    console.log('Modele zostały zsynchronizowane z bazą danych.');
  })
  .catch(err => {
    console.error('Błąd synchronizacji modeli:', err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
