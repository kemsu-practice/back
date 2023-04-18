const {Game, Field, Shot} = require("../models");

module.exports = {
  normalizeGame: async (game, currentUser) => {
    const playerUser = game.enemy === currentUser?.id ? game.enemyUser : game.playerUser;
    const enemyUser = game.enemy === currentUser?.id ? game.playerUser : game.enemyUser;
    const playerStatus = game.enemy === currentUser?.id ? game.enemyStatus : game.playerStatus;
    const enemyStatus = game.enemy === currentUser?.id ? game.playerStatus : game.enemyStatus;
    const enemyShots = enemyUser?.id ? await Shot.findAll({
      where: {player: enemyUser?.id, game: game.id},
      include: [
        'Field'
      ]
    }) : [];
    const playerShots = playerUser?.id ? await Shot.findAll({
      where: {player: playerUser?.id, game: game.id}, include: [
        'Field'
      ]
    }) : [];
    const playerFields = currentUser?.id ? await Field.findAll({where: {player: currentUser?.id, game: game.id}}) : [];
    const result = {
      id: game.id,
      status: game.status,
      enemy: enemyUser ? enemyUser.id : null,
      player: playerUser ? playerUser.id : null,
      turn: game.turn,
      enemyUser: enemyUser ? {id: enemyUser.id, name: enemyUser.name} : null,
      playerUser: playerUser ? {id: playerUser.id, name: playerUser.name} : null,
      playerStatus,
      enemyStatus,
      enemyShots,
      playerShots,
      playerFields
    }
    return result;
  }
}
