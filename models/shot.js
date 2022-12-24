'use strict';
const {
  Model, Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shot extends Model {
    static associate(models) {
      Shot.belongsTo(models.Field, {
        foreignKey: 'game',
        targetKey: 'game',
        scope: {
          [Op.and]: [
            sequelize.where(sequelize.col("Field.col"), Op.eq, sequelize.col("Shot.col")),
            sequelize.where(sequelize.col("Field.row"), Op.eq, sequelize.col("Shot.row")),
            sequelize.where(sequelize.col("Field.game"), Op.eq, sequelize.col("Shot.game")),
            sequelize.where(sequelize.col("Field.player"), Op.eq, sequelize.col("Shot.player")),
          ]
        },
      });
    }
  }
  Shot.init({
    player: DataTypes.INTEGER,
    game: DataTypes.INTEGER,
    row: DataTypes.INTEGER,
    col: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Shot',
  });
  return Shot;
};
