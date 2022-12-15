require('dotenv').config()

const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post(
  '/login',
  async (req, res, next) => {
    passport.authenticate(
      'local',
      async (err, user, info) => {
        try {
          if (err || !user) {
            return res.status(400).json(info);
          }
          req.login(
            user,
            {session: false},
            async (error) => {
              if (error) return next(error);
              const body = {id: user.id, name: user.name};
              const accessToken = jwt.sign({user: body}, process.env.JWT_SECRET);
              return res.json({accessToken, ...body});
            }
          );
        } catch (error) {
          return next(error);
        }
      })(req, res, next)
  }
);

router.post(
  '/signup',
  passport.authenticate('signup', {session: false}),
  async (req, res) => {
    res.json({
      message: 'Успешная регистрация',
      user: req.user
    })
  });

router.get(
  '/profile',
  passport.authenticate('jwt', {session: false}),
  (req, res, next) => {
    res.json({
      message: 'You made it to the secure route',
      user: req.user,
      token: req.query.secret_token
    })
  }
);

module.exports = router;
