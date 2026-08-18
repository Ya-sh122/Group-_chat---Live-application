const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Message = sequelize.define('message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: true // True because a message might be only an image
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true // True because not all messages have images
  }
});

module.exports = Message;