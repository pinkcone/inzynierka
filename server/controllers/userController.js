const Uzytkownik = require('../models/User');

const profileImages = [
  '/images/profile_pictures/picture_1.png'
];

const randImages = () => {
  const randomIndex = Math.floor(Math.random() * profileImages.length);
  return profileImages[randomIndex]; 
};

// Funkcja do tworzenia użytkownika
const createUser = (req, res) => {
  Uzytkownik.create({
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
    image: randImages(),
  })
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      res.status(500).send('Błąd podczas dodawania użytkownika.');
    });
};

// Funkcja rejestracji użytkownika
const registerUser = async (req, res) => {
  const { email, username, password, role, image } = req.body;

  try {
    // Sprawdzenie, czy użytkownik z podanym emailem już istnieje
    const existingUser = await Uzytkownik.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik z tym emailem już istnieje' });
    }

    // Tworzenie nowego użytkownika
    const newUser = await Uzytkownik.create({
      email,
      username,
      password,  // Hasło zostanie zahashowane dzięki hookowi Sequelize
      role: role || 'user',  // Rola domyślnie to 'user'
      image: image || '/images/profile_pictures/picture_1.png'  // Opcjonalne zdjęcie
    });

    // Odpowiedź z utworzonym użytkownikiem (bez hasła)
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      image: newUser.image
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Eksportowanie obu funkcji
module.exports = {
  createUser,
  registerUser
};
