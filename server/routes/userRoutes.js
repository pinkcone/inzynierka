const express = require('express');
const router = express.Router();
const { createUser, registerUser, loginUser } = require('../controllers/userController'); // Sprawdź import

// Trasa do dodawania użytkownika
router.post('/add-user', createUser);

// Trasa do rejestracji użytkownika
router.post('/register', registerUser);

// Trasa do logowania użytkownika
router.post('/login', loginUser); 

module.exports = router;
