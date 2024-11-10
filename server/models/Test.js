const {DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');

const Test = sequelize.define("Test", {
    code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        primaryKey: true,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    hooks: {
        beforeCreate: (test) => {
            if (test.duration) {
                test.duration *= 60;
            }
        }
    }
});

module.exports = Test;