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
        defaultValue: 3600,
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