const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const UserGroup = sequelize.define('userGroup', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = UserGroup;