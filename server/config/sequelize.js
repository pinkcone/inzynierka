const { Sequelize } = require('sequelize');

// Połączenie z bazą danych
const sequelize = new Sequelize('inzynierka', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

sequelize.authenticate()
  .then(() => {
    console.log('Połączono z bazą danych MySQL.');
  })
  .catch(err => {
    console.error('Błąd połączenia z bazą danych:', err);
  });

module.exports = sequelize;
