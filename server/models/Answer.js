const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Question = require('./Question'); // Import modelu Question

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isTrue: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  questionId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Questions',
      key: 'id'
    }
  }
});

// Relacja: Answer należy do Question
Answer.belongsTo(Question, { foreignKey: 'questionId' });

module.exports = Answer;
