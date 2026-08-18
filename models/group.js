const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Group = sequelize.define('group', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Group;