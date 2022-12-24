const express = require('express');
const router = express.Router();
const {Game, Field, Shot} = require("../models");
const passport = require("passport");
const {checkField, getSize} = require("../services/checkField");
const {normalizeGame} = require("../services/normalizeGame");

/* GET games listing. */
router.get('/', async function (req, res) {
  const games = await Game.findAll({include: ['playerUser', 'enemyUser'], order: [['createdAt', 'DESC']]});
  const gamesList = games.map(game => ({
    id: game.id,
    enemy: game.enemy ? {
      id: game.enemyUser?.id,
      name: game.enemyUser?.name,
    } : null,
    player: game.player ? {
      id: game.playerUser?.id,
      name: game.playerUser?.name,
    } : null,
    createdAt: game.createdAt
  }))
  res.json({games: gamesList})
});

/* POST new game */
router.post('/', passport.authenticate('jwt', {session: false}), async function (req, res) {
  const {user} = req.user;
  const game = await Game.create({
    enemy: null,
    player: user.id,
    status: Game.STATUS_BEFORE_START,
    playerStatus: Game.PLAYER_STATUS_PREPARING
  });
  res.json({game: await normalizeGame(game, user)})
});

/* GET game */
router.get('/:id', passport.authenticate('jwt', {session: false}), async function (req, res) {
  const {user} = req.user;
  const game = await Game.findByPk(req.params.id, {include: ['playerUser', 'enemyUser']});
  res.json({game: await normalizeGame(game, user)})
});

/* GET game */
router.post('/:id/join', passport.authenticate('jwt', {session: false}), async function (req, res) {
  const {user} = req.user;
  const game = await Game.findByPk(req.params.id, {include: ['playerUser', 'enemyUser']});
  if (game.player === user.id) {
    res.json({game: await normalizeGame(game, user), error: 'Вы и так создатель этой игры'})
    return
  }
  if (game.enemy) {
    res.json({game: await normalizeGame(game, user), error: 'Противник тут и так есть'})
    return
  }
  game.enemy = user.id;
  game.enemyStatus = Game.PLAYER_STATUS_PREPARING;
  await game.save();

  {
    const game = await Game.findByPk(req.params.id, {include: ['playerUser', 'enemyUser']});
    res.json({game: await normalizeGame(game, user)})
  }
});

router.post('/:id/field', passport.authenticate('jwt', {session: false}), async function (req, res) {
  const {user} = req.user;
  const game = await Game.findByPk(req.params.id, {include: ['playerUser', 'enemyUser']});
  if (game.status !== Game.STATUS_BEFORE_START) {
    res.json({game: await normalizeGame(game, user), error: 'Стадия расстановки прошла'})
    return
  }

  if (game.player !== user.id && game.enemy !== user.id) {
    res.json({game: await normalizeGame(game, user), error: 'Вы не участвуете в игре'})
    return
  }

  const existedField = await Field.findOne({where: {game: game.id, player: user.id}})
  if (existedField) {
    res.json({game: await normalizeGame(game, user), error: 'Вы уже отправили поле'})
    return
  }

  const errors = checkField(req.body.cells)
  if (errors.length > 0) {
    res.json({game: await normalizeGame(game, user), error: 'Есть ошибки в расстановке кораблей', errors})
    return
  }

  const promises = req.body.cells.map(cell => {
    if (!cell.filled || !cell.row || !cell.col) {
      return;
    }
    return Field.create({
      game: game.id, player: user.id,
      row: cell.row,
      col: cell.col,
      size: getSize(req.body.cells, cell),
      status: Field.STATUS_ALIVE,
    })
  })
  await Promise.all(promises)

  if (game.player === user.id) {
    game.playerStatus = Game.PLAYER_STATUS_READY;
    await game.save();
  }
  if (game.enemy === user.id) {
    game.enemyStatus = Game.PLAYER_STATUS_READY;
    await game.save();
  }

  if (game.player && game.enemy) {
    const existedPlayerField = await Field.findOne({where: {game: game.id, player: game.player}})
    const existedEnemyField = await Field.findOne({where: {game: game.id, player: game.enemy}})
    if (existedPlayerField && existedEnemyField) {
      game.status = Game.STATUS_STARTED;
      game.turn = game.player;
      await game.save();
    }
  }

  res.json({game: await normalizeGame(game, user)})
});

router.post('/:id/shot', passport.authenticate('jwt', {session: false}), async function (req, res) {
  const {user} = req.user;
  const game = await Game.findByPk(req.params.id, {include: ['playerUser', 'enemyUser']});
  if (game.status !== Game.STATUS_STARTED) {
    res.json({game: await normalizeGame(game, user), error: 'Игра еще не началась'})
    return
  }

  if (game.player !== user.id && game.enemy !== user.id) {
    res.json({game: await normalizeGame(game, user), error: 'Вы не участвуете в игре'})
    return
  }

  if(game.turn !== user.id) {
    res.json({game: await normalizeGame(game, user), error: 'Не ваш ход'})
    return
  }

  const existedShot = await Shot.findOne({
    where: {
      game: game.id,
      player: user.id,
      row: req.body.row,
      col: req.body.col
    }
  })
  if (existedShot) {
    res.json({game: await normalizeGame(game, user), error: 'Вы уже стреляли сюда'})
    return
  }

  const enemyUser = game.enemy !== user.id ? game.enemy : game.player;
  await Shot.create({
    game: game.id,
    player: enemyUser, row: req.body.row, col: req.body.col
  });

  const field = await Field.findOne({where: {game: game.id, player: enemyUser, row: req.body.row, col: req.body.col}})
  if (field) {
    res.json({game: await normalizeGame(game, user), result: 'Вы попали по кораблю'})
    return
  }

  game.turn = enemyUser;
  await game.save();

  res.json({game: await normalizeGame(game, user), result: 'Вы промахнулись'})
});

module.exports = router;
