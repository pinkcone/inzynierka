const { Sequelize } = require('sequelize');

// Połączenie z bazą danych
const sequelize = new Sequelize('inzynierka', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

//konfiguracja na serwerze
// const sequelize = new Sequelize('inzynierka', 'dbusernew', 'tajnehaslo420', {
//     host: '127.0.0.1',
//     dialect: 'mysql'
// });

sequelize.authenticate()
  .then(() => {
    console.log('Połączono z bazą danych MySQL.');
  })
  .catch(err => {
    console.error('Błąd połączenia z bazą danych:', err);
  });

module.exports = sequelize;