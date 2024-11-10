const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Brak autoryzacji. Musisz być zalogowany.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Brak dostępu. Tylko administratorzy mają dostęp.' });
  }

  next();
};

module.exports = adminAuthMiddleware;
