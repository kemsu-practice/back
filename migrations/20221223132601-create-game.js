'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      player: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      enemy: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      playerStatus:{
        type: Sequelize.INTEGER
      },
      enemyStatus:{
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.INTEGER
      },
      result: {
        type: Sequelize.INTEGER
      },
      turn: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Games');
  }
};
