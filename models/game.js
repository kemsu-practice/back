'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    static STATUS_BEFORE_START = 1;
    static STATUS_STARTED = 2;
    static PLAYER_STATUS_PREPARING = 0;
    static PLAYER_STATUS_READY = 1;
    static PLAYER_STATUS_ENDS = 2;

    static associate(models) {
      Game.belongsTo(models.User, {
        as: 'playerUser',
        foreignKey: 'player'
      });
      Game.belongsTo(models.User, {
        as: 'enemyUser',
        foreignKey: 'enemy'
      });
    }
  }
  Game.init({
    player: DataTypes.INTEGER,
    enemy: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    playerStatus: DataTypes.INTEGER,
    enemyStatus: DataTypes.INTEGER,
    result: DataTypes.INTEGER,
    turn: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Game',
  });
  return Game;
};
