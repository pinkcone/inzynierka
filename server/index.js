const express = require('express');
const app = express();
const db = require('./database/db'); // Import połączenia z bazą danych pliku db.js

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
