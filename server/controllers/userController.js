const Uzytkownik = require('../models/User');

// Pula dostępnych zdjęć (URL)
const zdjeciaPula = [
  'https://example.com/zdjecie1.jpg',
  'https://example.com/zdjecie2.jpg',
  'https://example.com/zdjecie3.jpg',
];

// Funkcja losująca zdjęcie z puli
const wylosujZdjecie = () => {
  const randomIndex = Math.floor(Math.random() * zdjeciaPula.length);
  return zdjeciaPula[randomIndex];
};

// Dodawanie nowego użytkownika
const createUser = (req, res) => {
  Uzytkownik.create({
    email: req.body.email,
    haslo: req.body.haslo,
    nazwaUzytkownika: req.body.nazwaUzytkownika,
    zdjecie: wylosujZdjecie(),
  })
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      res.status(500).send('Błąd podczas dodawania użytkownika.');
    });
};

module.exports = {
  createUser,
};
