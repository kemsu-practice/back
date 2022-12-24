'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Field extends Model {
    static STATUS_ALIVE = 1;
    static associate(models) {
    }
  }
  Field.init({
    player: DataTypes.INTEGER,
    game: DataTypes.INTEGER,
    row: DataTypes.INTEGER,
    col: DataTypes.INTEGER,
    size: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Field',
  });
  return Field;
};
