const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Brak autoryzacji. Token nie został dostarczony.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Przechowujemy dane użytkownika w obiekcie req
    next(); // Kontynuujemy wykonanie następnej funkcji
  } catch (error) {
    res.status(401).json({ message: 'Nieprawidłowy token.' });
  }
};

module.exports = authMiddleware;
