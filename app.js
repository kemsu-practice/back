const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport_auth = require('./middleware/passport_auth');
const cors = require('cors')
require('dotenv').config()
const process = require('process');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const gamesRouter = require('./routes/games');

const app = express();

app.use(logger('dev'));

const corsOptions = {
  origin: true
}
app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

passport_auth.initPassport(app);

app.use('/', indexRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/games', gamesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next, done) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  done(res);
});

module.exports = app;
