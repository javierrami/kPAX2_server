var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;

const utils = require('./utils');

const debug = require('debug')('app:games');

/**
 * Add a new game
 */
router.post('/', function (req, res) {

  // check parameters
  //DEL if (!req.body.name || !req.body.owner) {
  if (!checkParams(req, ['name', 'owner'])) {
    return res.status(400).send('Bad parameters');
  }

  // find game
  req.db.collection('games').findOne(
    { name: req.body.name },
    function (err, doc) {
      // if error, return 500
      if (err) return res.status(500).send('Error when db.findOne ' + err.message);

      // game already exists
      if (doc) return res.status(409).send('Already exists');

      // TODO check the user already exists and status == 1

      // create new game - only a few of fields
      var now = new Date();
      var game = {
        name: req.body.name,
        owner: req.body.owner,
        status: 1,
        nlikes: 0,
        created_at: now,
        updated_at: now
      };

      // create game
      req.db.collection('games').insert(
        game,
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
 * list games under a FREE condition
 * if no parameter passed, all games ar listed
 * the 'q' query must be a valid JSON query condition in MongoBD format
 * endpoint method: GET
 * example : /games/list?q={"nlikes":{"$lt":15}}
 */
router.get('/list', function (req, res, next) {

  debug('games/list endpoint! Query Chain passed:', req.query.q);

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
  req.db.collection('games').find(
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
//  * list ALL the games in the system
//  * No parameters needed
//  * endpoint: GET   /games/lista
//  */
// router.get('/listall', function (req, res, next) {
//   // find game
//   req.db.collection('games').find(
//     {},
//     function (err, cursor) {
//
//       // check error
//       if (err) {
//         return res.status(500).send(err.message);
//       }
//
//       var games = [];
//
//       // walk cursor
//       cursor.each(function (err, doc) {
//
//         // end
//         if (doc == null) {
//           return res.jsonp(games);
//         }
//
//         games.push(doc);
//       });
//     }
//   );
// });

/**
 * list ONE game (by Id of the Game)
 * parameter: game
 * GET /game/:game
 */
router.get('/:id', function (req, res, next) {
  var gameId = req.params.id;
  debug(gameId);

  // find game
  req.db.collection('games').find(
    { _id: new ObjectId(gameId) },
    function (err, doc) {
      // if error, return 500
      if (err) return res.status(500).send('Error when db.find ' + err.message);

      // Game not found
      if (!doc) return res.status(404).send('Not found');

      debug(doc);
      return res.jsonp(doc);
    }
  );
});

//DEL
// /**
//  *
//  * Simple ADD like ( just increases by 1 nlike counter)
//  * PUT   /game/like
//  * parameter:  name  (game name)
//  *
//  */
// router.put('/like', function (req, res) {
//
//   // check parameters
//   if (!req.body.name) {
//     // 400 - bad request
//     debug('** No Parameters. Game name required');
//     return res.status(400).send('Bad parameters. Game name required ');
//
//   }
//
//   // find game
//   req.db.collection('games').findOne(
//     { name: req.body.name },
//     function (err, doc) {
//
//       // if error, return
//       if (err) {
//         // 500
//         return res.status(500).send(err.message);
//       }
//
//       if (!doc) {
//         // Game not Found
//         return res.status(404).send('game ' + req.body.name  + 'NOT exists');
//       }
//
//       // game found -- UPdate nlikes +1
//       req.db.collection('games').update(
//         { name: req.body.name },
//         { $inc: { nlikes: +1 } },
//         true,
//         true,
//         function (err, doc) {
//           // if error, return
//           if (err) {
//             // 500
//             return res.status(500).send(err.message);
//           }
//
//           res.jsonp(doc); // put ENDs ; sends a response needed to END the Update.  Response with a record updated info
//           debug(doc);
//         }
//       );  // update end
//     }
//   ); // find one
// });

//DEL
// /**
//  *  'Complex' ADD like && Plus user / Date info
//  *  POST  /game/like
//  *   Parameters: user , game
//  *  nlike ++
//  *  additional info of user and date of 'like' added
//  *  a user can add as much likes as he wants with this endpoint
//  */
// router.post('/likeOld', function (req, res) {
//
//   // check parameters
//   if (!req.body.game || !req.body.user) {
//     // 400 - bad request
//     debug('** No Parameters. Game name required');
//     return res.status(400).send('Bad parameters. Game name required ');
//   }
//
//   var gameId = req.body.game;
//   var userId = req.body.user;
//
//   // find game
//   req.db.collection('games').findOne(
//     { _id: new ObjectId(gameId) },
//
//     function (err, doc) {
//
//       // if error, return
//       if (err) {
//         // 500
//         return res.status(500).send(err.message);
//       }
//
//       if (!doc) {
//         // Game not Found
//         return res.status(404).send('game ' + req.body.name  + ' NOT exists');
//       }
//
//       // game found -- UPdate nlikes +1
//
//       var userDateInfo = { uid: userId, date: new Date() };
//       req.db.collection('games').update(
//         { _id: new ObjectId(gameId) },
//         {
//           $inc: { nlikes: +1 },
//           $push: { ulike: userDateInfo }
//         },
//           true,
//           true,
//         function (err, doc) {
//           // if error, return
//           if (err) {
//             // 500
//             return res.status(500).send(err.message);
//           }
//
//           res.jsonp(doc); // post ENDs ; sends a response needed to END the Update.  Response with a record updated info
//           debug(doc);
//
//         }
//       ); // update end
//     }
//   ); // find one
// });

/**
 *
 * Set a GAME unavailable (status : '3' => deleted)
 * DELETE   /game/del
 * parameter:  game  (game id)
 *
 */
router.delete('/:id', function (req, res) {
  var gameId = req.params.id;

  // find game
  req.db.collection('games').findOne(
    { _id: new ObjectId(gameId) },
    function (err, doc) {
      // if error, return 500
      if (err) return res.status(500).send('Error when db.findOne ' + err.message);

      // Game not found
      if (!doc) return res.status(404).send('Not Found');

      // game found -- UPdate status: set to 3 => Deleted
      req.db.collection('games').update(
        { _id: new ObjectId(gameId) },
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

// **  like A (very complex nlike marker)

/**
 *  'VERY Complex' ADD like && Plus user / Date info
 *  POST  /game/:game_id/like
 *   Parameters:
        (in the URL) :   game       Game  identifier
         (in the body):   user        user identifier
 *  nlike ++
 *  additional info of user and date of 'like' added
 *  if the like is still market : do nothing
 *   if the like is new  : save user * date/time info + increases by ONe the like counter !
 *
 *  IF user ya tiene un like registrado , no se repite ni se incrementa el marcador de likes
 *  ELSE  se registra el usuario y fecha/hora del registro y se incremeta en uno el contador de likes
 */
router.post('/:game/like', function (req, res) {
  var gameId = req.params.game;
  var userId = req.body.user;

  debug('gameId:', gameId);
  debug('userId:', userId);

  if (!req.params.game || !req.body.user) {
    // 400 - bad request
    debug('** No Parameters. gameId & userId required');
    return res.status(400).send('Bad parameters. gameId & userId required ');
  }

  // find game
  req.db.collection('games').findOne(
    { _id: new ObjectId(gameId) },

    function (err, doc) {
      // if error, return 500
      if (err) return res.status(500).send('Error when db.findOne ' + err.message);

      // Game not found
      if (!doc) return res.status(404).send('Not found');

      // comprovam si l'usuari té ja aquest like enregistrat
      req.db.collection('games').findOne(
        { _id: ObjectId(gameId), 'ulike.uid': userId },
        function (err, docLike) {
          // if error, return 500
          if (err) return res.status(500).send('Error when db.findOne ' + err.message);

          // Already marked +1
          if (docLike) return res.jsonp(doc);

          req.db.collection('games').update(
            { _id: new ObjectId(gameId) },
            {
              $inc: { nlikes: +1 },
              $push: { ulike: { uid: userId, date: new Date() } }
            },
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
      ); // FindOne  (gameId + userId)
    }
  ); // find one
});

//  like A end

router.post('/:game/unlike', function (req, res) {

  // unmark the LIKE of a game & // decrease the like marker by one
  // check parameters
  //req.params.game

  var gameId = req.params.game;
  var userId = req.body.user;

  debug('gameId:', gameId);
  debug('userId:', userId);

  if (!req.params.game || !req.body.user) {
    // 400 - bad request
    debug('** No Parameters. gameId & userId required');
    return res.status(400).send('Bad parameters. gameId & userId required ');
  }

  // find game
  req.db.collection('games').findOne(
    { _id: new ObjectId(gameId) },

    function (err, doc) {
      // if error, return 500
      if (err) return res.status(500).send('Error when db.findOne ' + err.message);

      // Game not found
      if (!doc) return res.status(404).send('Not found');

      // game found -- UPdate nlikes -1
      // comprovam si l'usuari té ja aquest like enregistrat
      req.db.collection('games').findOne(
        { _id: ObjectId(gameId), 'ulike.uid': userId },
        function (err, docLike) {
          // if error, return 500
          if (err) return res.status(500).send('Error when db.findOne ' + err.message);

          // If not document, user never marked +1
          if (!docLike) return res.jsonp(doc);

          // var userDateInfo = {'uid': userId, 'date': new Date()};
          req.db.collection('games').update(
            { _id: ObjectId(gameId) },
            {
              $inc: { nlikes: -1 },
              $pull: { ulike: { uid: userId } }
            },
            { multi: true }, // TODO: why multi?
            function (err, doc) {
              // if error, return 500
              if (err) return res.status(500).send('Error when db.update ' + err.message);

              debug(doc);
              res.jsonp(doc);
            }
          );
        }
      ); // FindOne  (gameId + userId)
    }
  ); // find one
});

//  UNlike  end

module.exports = router;
