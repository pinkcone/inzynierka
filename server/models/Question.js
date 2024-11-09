const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('single', 'multiple'),
    defaultValue: 'single',
  },
  setId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Sets',
      key: 'id'
    }
  }
});

module.exports = Question;
