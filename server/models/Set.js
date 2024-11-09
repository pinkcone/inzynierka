const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

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

module.exports = Set;
