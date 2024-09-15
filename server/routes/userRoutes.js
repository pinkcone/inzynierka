const express = require('express');
const router = express.Router();
const { createUser, registerUser } = require('../controllers/userController'); // Sprawdź import

// Trasa do dodawania użytkownika
router.post('/add-user', createUser);

// Trasa do rejestracji użytkownika
router.post('/register', registerUser);

module.exports = router;
