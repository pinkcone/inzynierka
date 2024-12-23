const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User');
const Set = require('./Set');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    setId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    checked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    checkedById: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'oczekujące',
        allowNull: false,
    },
}, {
    timestamps: true,
    hooks: {
        beforeUpdate: async (report, options) => {
            if (report.checkedById) {
                const adminUser = await User.findByPk(report.checkedById);
                if (!adminUser || adminUser.role !== 'admin') {
                    throw new Error('Tylko administrator może sprawdzić zgłoszenie.');
                }
            }
        },
    },
});

module.exports = Report;
