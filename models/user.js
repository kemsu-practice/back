'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    isValidPassword = async function (password) {
      return await bcrypt.compare(password, this.password)
    }
    setPassword = async function (password) {
      this.password = await bcrypt.hash(password, 10)
    }
  }
  User.init({
    login: DataTypes.STRING,
    name: DataTypes.STRING,
    vkontakte_id: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
