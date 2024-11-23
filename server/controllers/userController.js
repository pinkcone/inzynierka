const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const validator = require('validator');


const profileImages = [
  '/images/profile_pictures/picture_1.png',
  '/images/profile_pictures/picture_2.png',
  '/images/profile_pictures/picture_3.png',
  '/images/profile_pictures/picture_4.png',
  '/images/profile_pictures/picture_5.png',
  '/images/profile_pictures/picture_6.png'
];

const randImages = () => {
  const randomIndex = Math.floor(Math.random() * profileImages.length);
  const selectedImage = profileImages[randomIndex];

  console.log('Wylosowany obrazek:', selectedImage);

  return selectedImage;
};

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


const registerUser = async (req, res) => {
  const { email, username, password, role } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Niepoprawny format emaila' });
  }

  if (!validator.isLength(password, { min: 6, max: 20 })) {
    return res.status(400).json({ message: 'Hasło musi mieć od 6 do 20 znaków' });
  }

  if (!validator.isLength(username, { min: 3, max: 20 })) {
    return res.status(400).json({ message: 'Nazwa użytkownika musi mieć od 3 do 20 znaków' });
  }

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
      image: randImages(),
      isActive: true
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        image: newUser.image
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
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
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return res.status(400).json({ message: 'Email jest wymagany' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Nieprawidłowy format adresu e-mail' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Hasło jest wymagane' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Użytkownik nie istnieje' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Nieprawidłowe hasło' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Twoje konto jest nieaktywne. Skontaktuj się z administratorem.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        image: user.image 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
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


const updateUser = async (req, res) => {
  const { username, email, password } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Niepoprawny format emaila' });
      }

      const existingEmailUser = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
      if (existingEmailUser) {
        return res.status(400).json({ message: 'Email jest już używany' });
      }

      user.email = email; 
    }

    if (username) {
      if (!validator.isLength(username, { min: 3, max: 20 })) {
        return res.status(400).json({ message: 'Nazwa użytkownika musi mieć od 3 do 20 znaków' });
      }

      const existingUsernameUser = await User.findOne({ where: { username, id: { [Op.ne]: userId } } });
      if (existingUsernameUser) {
        return res.status(400).json({ message: 'Nazwa użytkownika jest już zajęta' });
      }

      user.username = username; 
    }

    if (password) {
      if (!validator.isLength(password, { min: 6, max: 20 })) {
        return res.status(400).json({ message: 'Hasło musi mieć od 6 do 20 znaków' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt); 
    }

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



const getAllUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Brak dostępu. Musisz być administratorem.' });
  }

  try {
    const { keyword = '', page = 1, pageSize = 10 } = req.query;

    const whereClause = {
      [Op.or]: [
        { username: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } }
      ]
    };

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'username', 'email', 'role', 'image', 'isActive'],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / pageSize);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono użytkowników.' });
    }

    res.status(200).json({
      users: rows,
      currentPage: parseInt(page),
      totalPages,
      totalUsers: count
    });
  } catch (error) {
    console.error('Błąd serwera:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};


const updateUserRole = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Brak dostępu. Musisz być administratorem.' });
  }

  const userId = req.params.id; 
  const { role } = req.body; 

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: 'Rola użytkownika została zaktualizowana pomyślnie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};


const deleteUser = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Brak dostępu. Musisz być administratorem.' });
  }
  
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    await user.destroy();
    res.status(200).json({ message: 'Użytkownik został usunięty pomyślnie' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};


const changeActive = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Brak dostępu. Musisz być administratorem.' });
  }

  const userId = req.params.id; 

  try {
    const user = await User.findByPk(userId); 

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Nie można zmienić statusu aktywności dla administratora.' });
    }

    user.isActive = !user.isActive;
    await user.save(); 

    res.status(200).json({
      message: `Użytkownik został ${user.isActive ? 'aktywowany' : 'dezaktywowany'}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};


module.exports = {
  createUser,
  registerUser,
  loginUser,
  updateUser,
  getAllUsers,
  updateUserRole,
  deleteUser,
  changeActive
};
