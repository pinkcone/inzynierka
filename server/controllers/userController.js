const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Lista dostępnych obrazków profilowych
const profileImages = [
  '/images/profile_pictures/picture_1.png',
  '/images/profile_pictures/picture_2.png',
  '/images/profile_pictures/picture_3.png',
  '/images/profile_pictures/picture_4.png',
  '/images/profile_pictures/picture_5.png',
  '/images/profile_pictures/picture_6.png'
];

// Funkcja losująca obrazek profilowy
const randImages = () => {
  const randomIndex = Math.floor(Math.random() * profileImages.length);
  const selectedImage = profileImages[randomIndex];

  console.log('Wylosowany obrazek:', selectedImage);

  return selectedImage;
};

// Funkcja tworzenia użytkownika
const createUser = (req, res) => {
  User.create({
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
  const { email, username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik z tym emailem już istnieje' });
    }

    const existingUsernameUser = await User.findOne({ where: { username } });
    if (existingUsernameUser) {
      return res.status(400).json({ message: 'Nazwa użytkownika jest już zajęta' });
    }

    const newUser = await User.create({
      email,
      username,
      password,
      role: role || 'user',
      image: randImages()
    });

    // Generowanie tokenu JWT po rejestracji
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        image: newUser.image // Dodanie obrazka do tokenu
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Rejestracja zakończona sukcesem!',
      token, 
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        image: newUser.image
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Funkcja logowania użytkownika
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Użytkownik nie istnieje' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Nieprawidłowe hasło' });
    }
  
    // Generowanie tokenu JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        image: user.image 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Zalogowano pomyślnie',
      token, 
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        image: user.image
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

module.exports = {
  createUser,
  registerUser,
  loginUser
};
