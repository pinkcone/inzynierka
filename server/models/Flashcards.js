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
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Questions', // Powiązanie z tabelą pytań
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
  }
});

module.exports = Flashcards;
