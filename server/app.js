var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// client for mongodb database
const MongoClient = require('mongodb').MongoClient

var routes = require('./routes/index');

var app = express();



// connect to databse
var database = null

var url = 'mongodb://localhost:27017/kpax2';  // For working on local DB
var url_r = 'mongodb://readwrite:1234@ds021462.mlab.com:21462/kpax2';  // For working on remote DB

//MongoClient.connect('mongodb://readwrite:1234@ds021462.mlab.com:21462/kpax2', function (err, db) {
MongoClient.connect(url, function (err, db) {
    if (err) {
        throw err;
    } 
    else {
        // async!
        database = db
        console.log("successfully connected to the database");
    }
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// first thing to do, add db to the request
app.use(function (req, res, next) {
  console.log('eo')
  req.db = database
  next()
})

// CORS Enabled 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// this middleware will be executed for every request to the app
app.use(function (req, res, next) {
  console.log('Aquest middleware s executa cada cop ');
  console.log('Time: %d', Date.now());
  
  next();
});

// add routes. this will load the index.js
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
