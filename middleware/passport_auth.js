require('dotenv').config()

const passport = require('passport')
const passportJWT = require("passport-jwt")
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const VkontakteStrategy = require('passport-vkontakte').Strategy
const LocalStrategy = require('passport-local').Strategy
const { User } = require("../models");

module.exports.initPassport = function (app) {
  app.use(passport.initialize());

  passport.use('jwt', new JWTStrategy({
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET // Specify a JWT secret in .env file
    },
    function (jwtPayload, done) {
      // find the user in db if needed.
      // This functionality may be omitted if you store everything you'll need in JWT payload.
      return done(null, jwtPayload);
    }
  ));

  // Passport Strategy for login via login
  passport.use('signup',
    new LocalStrategy(
      {
        usernameField: "login",
        passwordField: "password",
        session: false // Use JWT and not session
      },
      async (login, password, done) => {
        let user = await User.findOne(
          {
            where: { login: login },
          })
        if (user) {
          // Username doesn't exist
          return done(null, false, { message: 'Логин занят' })
        }
        user = User.build({
          login: login,
          name: login
        })
        await user.setPassword(password)
        await user.save()
        // Login is successful
        done(null, { id: user.id, name: user.name });
      }
    )
  )

  passport.use('local',
    new LocalStrategy(
      {
        usernameField: "login",
        passwordField: "password",
        session: false
      },
      async (login, password, done) => {
        const user = await User.findOne(
          {
            where: { login: login },
          })
        if (!user) {
          // Пользователь не найден
          return done(null, false, { message: 'Неверный логин или пароль' })
        }
        if (!await user.isValidPassword(password)) {
          // Пароль не подошел
          return done(null, false, { message: 'Неверный логин или пароль' })
        }
        // Успешный вход
        done(null, { id: user.id, name: user.name });
      }
    )
  )


// Passport strategy for login via facebook
  passport.use(new VkontakteStrategy({
      clientID: process.env.VK_APP_ID,
      clientSecret: process.env.VK_APP_SECRET,
      callbackURL: process.env.BASE_SERVER_URL + '/api/v1/auth/facebook/callback',
      profileFields: ['id', 'first_name', 'last_name', 'email', 'picture'],
      passReqToCallback: true
    },
    function (req, accessToken, refreshToken, profile, done) {
      process.nextTick(async function () {
        console.log("VKontakte authentication triggered")
        try {
          let user = await User.findOne(
            {
              where: { vkontakte_id: profile.id },
            })
          if(!user) {
            user = User.build({
              vkontakte_id: profile.id,
              name: profile._json.first_name
            })
            await user.save();
          }

          done(null, { id: user.id, name: user.name });
        } catch (err) {
          return done(null, null, {message: 'Unknown error'})
        }
      });
    }
  ));
}
