const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize'); // Upewnij się, że importujesz Op, jeśli go używasz
const validator = require('validator'); // Upewnij się, że biblioteka validator jest zaimportowana


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

  // Walidacja emaila
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Niepoprawny format emaila' });
  }

  // Walidacja hasła (minimum 6 znaków, maksymalnie 20)
  if (!validator.isLength(password, { min: 6, max: 20 })) {
    return res.status(400).json({ message: 'Hasło musi mieć od 6 do 20 znaków' });
  }

  // Walidacja nazwy użytkownika (od 3 do 20 znaków)
  if (!validator.isLength(username, { min: 3, max: 20 })) {
    return res.status(400).json({ message: 'Nazwa użytkownika musi mieć od 3 do 20 znaków' });
  }

  try {
    // Sprawdzenie, czy użytkownik z podanym emailem już istnieje
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik z tym emailem już istnieje' });
    }

    // Sprawdzenie, czy nazwa użytkownika jest już zajęta
    const existingUsernameUser = await User.findOne({ where: { username } });
    if (existingUsernameUser) {
      return res.status(400).json({ message: 'Nazwa użytkownika jest już zajęta' });
    }

    // Tworzenie nowego użytkownika
    const newUser = await User.create({
      email,
      username,
      password,
      role: role || 'user',
      image: randImages() // Losowy obrazek profilowy
    });

    // Generowanie tokenu JWT po rejestracji
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        image: newUser.image
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Odpowiedź po udanej rejestracji
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
    console.error(error);
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


//Edycja danych użytkownika
const updateUser = async (req, res) => {
  const { username, email, password } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Walidacja emaila
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Niepoprawny format emaila' });
      }

      const existingEmailUser = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
      if (existingEmailUser) {
        return res.status(400).json({ message: 'Email jest już używany' });
      }

      user.email = email; // Aktualizacja emaila
    }

    // Walidacja nazwy użytkownika
    if (username) {
      if (!validator.isLength(username, { min: 3, max: 20 })) {
        return res.status(400).json({ message: 'Nazwa użytkownika musi mieć od 3 do 20 znaków' });
      }

      const existingUsernameUser = await User.findOne({ where: { username, id: { [Op.ne]: userId } } });
      if (existingUsernameUser) {
        return res.status(400).json({ message: 'Nazwa użytkownika jest już zajęta' });
      }

      user.username = username; // Aktualizacja nazwy użytkownika
    }

    // Walidacja hasła
    if (password) {
      if (!validator.isLength(password, { min: 6, max: 20 })) {
        return res.status(400).json({ message: 'Hasło musi mieć od 6 do 20 znaków' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt); // Aktualizacja hasła
    }

    // Zapisanie zmian
    await user.save();

    res.status(200).json({
      message: 'Dane użytkownika zaktualizowane pomyślnie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
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
  loginUser,
  updateUser
};
