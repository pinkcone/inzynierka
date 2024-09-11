const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Import połączenia

const User = sequelize.define('User',{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isEmail: true //email validation
        }
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'), // role is an enum: user or admin
        defaultValue: 'user'
      },
    image: {
        type: DataTypes.STRING, //image is randomly drawn from the pool of available ones
        allowNull: false
      }
});

module.exports = User;