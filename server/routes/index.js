var express = require('express');
var router = express.Router();


// ADD ROUTES
router.use('/test', require('./test'));
router.use('/user', require('./user'));
router.use('/games', require('./games'));
//router.use('/gamesx', require('./gamesx'));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
