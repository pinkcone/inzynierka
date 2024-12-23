const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      questionTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
        comment: 'Czas na jedno pytanie w sekundach',
      },
});
module.exports = Quiz;

