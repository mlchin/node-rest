var _settings = require('./_settings');
var PORT = process.env.PORT || 3000;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var User = require('./models/userModel');
mongoose.Promise = global.Promise;
mongoose.connect(_settings.mongoConnect);

// declare routes here
var index = require('./routes/index');
var users = require('./routes/users');
var setupRoutes = require('./routes/setupRoutes');
var apiRoutes = require('./routes/apiRoutes');

var app = express();

// setup jwt
app.set('jwtSecret', _settings.secret);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// use routes here
app.use('/', index);
app.use('/users', users);
app.use('/setup', setupRoutes);
app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error(req.originalUrl + ' Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log('Raspberry Pi REST API Server');
console.log('============================');
console.log('Welcome. Server started on port %d', PORT);
console.log('\n'+'Hit CTRL+C to stop the server'+'\n');
  
process.on('SIGINT', function(){
  // Trap Ctrl+C call... do cleanup here
  console.log('\n'+'You pressed Ctrl+C');
  console.log('Bye! Bye!');
  
  process.exit(0);
});

module.exports = app;
