var express = require('express');
var router = express.Router();

//DEL var ObjectId = require('mongodb').ObjectId;

const utils = require('../lib/utils');
const mongo = require('../lib/mongo');

const debug = require('debug')('app:category');

/**
 * TODO
 * Add a new game
 */
router.post('/:id', function (req, res) {
  var id = req.params.id;

  // check parameters
  //DEL if (!req.body.name || !req.body.owner) {
  if (!utils.checkParams(req, ['name', 'owner', 'category'])) {
    return sendError(400, 'Bad parameters', res);
  }

  // find game
  req.db.collection('games').findOne(
    { name: req.body.name },
    function (err, doc) {
      // if error, return 500
      if (err) return sendError(500, 'Error when db.findOne ' + err.message, res);

      // TODO check the user already exists and status == 1

      // the game object
      var game = {
        name: req.body.name,
        description: req.body.description || '',
        category: req.body.category,
        tags: req.body.tags || [],
        owner: req.body.owner,
        updated_at: new Date()
      };

      // values to initialize if insert
      var gameOnInsert = {
        status: 1,
        nlikes: 0,
        created_at: game.updated_at
      };

      // create game
      req.db.collection('games').update(
        { guid: id },
        {
          $set: game,
          $setOnInsert: gameOnInsert
        },
        { upsert: true },
        function (err, doc) {
          // if error, return 500
          if (err) return res.status(500).send('Error when db.insert ' + err.message);

          debug(game);
          res.jsonp(game);
        }
      );  // Insert
    }
  ); // find one
});

/**
 * List categories under a FREE condition
 * if no parameter passed, all games ar listed
 * the 'q' query must be a valid JSON query condition in MongoBD format
 * endpoint method: GET
 * example : /games/list?q={"nlikes":{"$lt":15}}
 */
router.get('/list', function (req, res, next) {
  debug('GET /category/list');

  debug('category/list endpoint! Query Chain passed:', req.query.q);

  var gameQuery = {};
  if (req.query.q) {
    debug('Query condition:q=', req.query.q);

    try {
      gameQuery = JSON.parse(req.query.q);
    }
    catch (e) {
      debug(' Bad JSON format, NO Query Done!: NO records listed');
      gameQuery = { _id: null };
    }
  };

  debug('JSON Query passed: ', gameQuery);

  // find game
  req.db.collection('gameCategories').find(
    gameQuery,
    function (err, cursor) {
      // if error, return 500
      if (err) return res.status(500).send('Error when db.find ' + err.message);

      // walk cursor
      var games = [];
      cursor.each(function (err, doc) {
        if (doc == null) {
          debug(games);
          return res.jsonp(games);
        }

        games.push(doc);
      });
    }
  );
});

//DEL
// /**
//  * TODO
//list ONE game (by Id of the Game)
//  * parameter: game
//  * GET /game/:game
//  */
// router.get('/:id', function (req, res, next) {
//   var id = req.params.id;
//   debug(id);

//   // find game
//   req.db.collection('games').findOne(
//     { guid: id },
//     function (err, doc) {
//       // if error, return 500
//       if (err) return res.status(500).send('Error when db.findOne ' + err.message);

//       // Game not found
//       if (!doc) return res.status(404).send('Not found');

//       debug(doc);
//       return res.jsonp(doc);
//     }
//   );
// });


/**
 *
 * Set a GAME unavailable (status : '3' => deleted)
 * DELETE   /game/del
 * parameter:  game  (game id)
 *
 */
router.delete('/:id', function (req, res) {
  const id = req.params.id;

  // find game
  req.db.collection('games').findOne(
    { guid: id },
    function (err, doc) {
      // if error, return 500
      if (err) return res.status(500).send('Error when db.findOne ' + err.message);

      // Game not found
      if (!doc) return res.status(404).send('Not Found');

      // game found -- UPdate status: set to 3 => Deleted
      req.db.collection('games').update(
        { guid: id },
        { $set: { status: 3 } },
        true,
        true,
        function (err, doc) {
          // if error, return 500
          if (err) return res.status(500).send('Error when db.update ' + err.message);

          debug(doc);
          res.jsonp(doc);
        }
      );  // update end
    }
  ); // find one
});


/**
 *
 */
function sendError (error, message, res) {
  debug(error, '-', message);
  res.status(400).send('Bad parameters');
}

module.exports = router;
  