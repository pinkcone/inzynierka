const mysql = require('mysql2');

// Konfiguracja połączenia z bazą danych
const connection = mysql.createConnection({
  host: 'localhost',  // Adres serwera MySQL
  user: 'root',       // użytkownik MySQL
  password: '',       // Hasło do MySQL
  database: 'inzynierka' // Nazwa bazy danych
});

// Nawiązywanie połączenia
connection.connect((err) => {
  if (err) {
    console.error('Błąd połączenia z bazą danych:', err);
    return;
  }
  console.log('Połączono z bazą danych MySQL');
});

module.exports = connection;
