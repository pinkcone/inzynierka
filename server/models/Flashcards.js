const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Set = require('./Set');
const Question = require('./Question');
const User = require('./User');

const Flashcards = sequelize.define('Flashcards', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  currentLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
    validate: {
      min: 1,
      max: 7
    }
  },
  lastReviewed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastEvaluation: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isIn: [[1, 0, -1]]
    }
  },
  streak: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});
Flashcards.belongsTo(User, { foreignKey: 'userId' });
Flashcards.belongsTo(Set, { foreignKey: 'setId' });
Flashcards.belongsTo(Question, { foreignKey: 'questionId' });

module.exports = Flashcards;
