const {DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');

const CompletedTest = sequelize.define('CompletedTest', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    selectedAnswer: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
    },
    score: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    }
});

module.exports = CompletedTest;