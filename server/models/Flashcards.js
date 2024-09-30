const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Flashcards = sequelize.define('Flashcards', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Powiązanie z tabelą użytkowników
      key: 'id'
    }
  },
  setId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sets', // Powiązanie z tabelą zestawów
      key: 'id'
    }
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Questions', // Powiązanie z tabelą pytań
      key: 'id'
    }
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

module.exports = Flashcards;
