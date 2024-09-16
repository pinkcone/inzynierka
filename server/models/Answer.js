const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Answer = sequelize.define('Answer', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content:{
        type: DataTypes.STRING,
        allowNull: false
      },
      isTrue: {
        type: DataTypes.BOOLEAN,
        defaultValue: '0'
      },
      
});

module.exports = Answer;