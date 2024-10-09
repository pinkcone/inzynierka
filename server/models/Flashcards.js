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
    defaultValue: 4, // Domyślny poziom startowy fiszki
    validate: {
      min: 1,
      max: 7
    }
  },
  lastReviewed: {
    type: DataTypes.DATE,
    allowNull: true // Data ostatniego przeglądu fiszki
  },
  lastEvaluation: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, // 1 dla poprawnej, 0 dla neutralnej, -1 dla negatywnej
    validate: {
      isIn: [[1, 0, -1]] // Dozwolone wartości: 1 (poprawna), 0 (neutralna), -1 (negatywna)
    }
  },
  streak: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0 // Seria poprawnych odpowiedzi pod rząd
  }
});
Flashcards.belongsTo(User, { foreignKey: 'userId' });
Flashcards.belongsTo(Set, { foreignKey: 'setId' });
Flashcards.belongsTo(Question, { foreignKey: 'questionId' });

module.exports = Flashcards;
