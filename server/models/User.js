const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt'); // Upewnij się, że zaimportowałeś bcrypt
const sequelize = require('../config/sequelize'); // Import połączenia

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Walidacja emaila
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'), // rola jest enumem: user lub admin
    defaultValue: 'user',
  },
  image: {
    type: DataTypes.STRING, // obrazek jest losowany z dostępnej puli
    allowNull: false,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      // Sprawdzamy, czy hasło istnieje i haszujemy je
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

module.exports = User;
