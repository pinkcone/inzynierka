const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User'); // Import modelu User

const Set = sequelize.define('Set', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  keyWords: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Relacja: Set należy do User
Set.belongsTo(User, { foreignKey: 'ownerId' });  // ownerId jako klucz obcy

module.exports = Set;
