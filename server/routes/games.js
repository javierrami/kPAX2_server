var express = require('express');
var router = express.Router();
var {ObjectId} = require('mongodb'); //like ObjectId=require('mongodb').ObjectId;

var auxliar = require ('./aux.js');  // Imports aux functions 

/**
 * Add a new game
 */
router.post('/', function (req, res) {

	// check parameters
	if (!req.body.name || !req.body.owner_id) {
		// 400 - bad request
		return res.status(400).send('Bad parameters')
	}

	// find game
	req.db.collection('games').findOne(
		{ name: req.body.name },
		function (err, doc) {

			// if error, return
			if (err) {
				// 500
				return res.status(500).send(err.message)
			}
			// if found, error
			else if (doc) {
				// 400 - conflict
				return res.status(409).send('game ' + req.body.name  + 'already exists')
			}

			var now = new Date()

			// create new game - only a few of fields
			var game = {
				name: req.body.name,
				owner: req.body.owner_id,
				status: 1,
				nlikes: 0,
				created_at: now,
				updated_at: now
			}

			// create game
			req.db.collection('games').insert(
				game,
				function (err, doc) {
					// if error, return
					if (err) {
						// 500
						return res.status(500).send(err.message)
					}

					res.jsonp(game)
				}
			)
		}
	) // find one
})

/**
 * list games under a FREE condition 
 * if no parameter passed, all games ar listed 
 * the 'q' query must be a valid JSON query condition in MongoBD format
 * endpoint method: GET
 * example : /games/list?q={"nlikes":{"$lt":15}}
 */
router.get('/list', function(req, res, next) {
	
	console.log("games/list endpoint! Query Chain passed: %s",req.query.q);

	if (typeof(req.query.q) != 'undefined' )
		{
		 	if (auxliar.IsJsonString(req.query.q) ) {
		 		console.log('Query condition:q=  %s ', req.query.q)
				var gameQuery = JSON.parse(req.query.q);
				}
				else 
				{
					console.log(' Bad JSON format, NO Query Done!: NO records listed')
					var gameQuery = {"_id":null};
				}	
		} else {
		  	console.log(' q Query condition not defined: all records listed')
			var gameQuery = {};

		};

	console.log('JSON Query passed: ', gameQuery);

	// find game
	req.db.collection('games').find(
		gameQuery,
		function (err, cursor) {

			// check error
			if (err) {
				return res.status(500).send(err.message)
			}

			var games = []

			// walk cursor
			cursor.each(function (err, doc) {

				// end
				if (doc == null) {
					return res.jsonp(games)
				}

				games.push(doc)
			})
		}
	)
})


/**
 * list ALL the games in the system
 * No parameters needed
 * endpoint: GET 	/games/lista
 */
router.get('/listall', function(req, res, next) {
	// find game
	req.db.collection('games').find(
		{},
		function (err, cursor) {

			// check error
			if (err) {
				return res.status(500).send(err.message)
			}

			var games = []

			// walk cursor
			cursor.each(function (err, doc) {

				// end
				if (doc == null) {
					return res.jsonp(games)
				}

				games.push(doc)
			})
		}
	)
})

/**
 * list ONE game (by Id of the Game)
 * parameter: game_id
 * GET /game/:game_id
 */
router.get('/:game_id', function(req, res, next) {
	var gameId = req.params.game_id;
	console.log(gameId);
	// find game
	req.db.collection('games').find(
	//		{"_id" : gameId},
	//		{"_id" : new BSON.ObjectID(gameId)},
		{"_id" : new ObjectId(gameId)},

		function (err, cursor) {

			// check error
			if (err) {
				return res.status(500).send(err.message)
			}

			var games = []

			// walk cursor
			cursor.each(function (err, doc) {

				// end
				if (doc == null) {
					return res.jsonp(games)
				}

				games.push(doc)
			})
		}
	)
})


/**
 * 
 * Simple ADD like ( just increases by 1 nlike counter)
 * PUT   /game/like
 * parameter:  name  (game name)
 * 
 */
router.put('/like', function (req, res) {

	// check parameters
	if (!req.body.name) {
		// 400 - bad request
		console.log('** No Parameters. Game name required');
		return res.status(400).send('Bad parameters. Game name required ')

	}

	// find game
	req.db.collection('games').findOne(
		{ name: req.body.name },
		function (err, doc) {

			// if error, return
			if (err) {
				// 500
				return res.status(500).send(err.message); 
			}
			// if NOT found, update
			else if (!doc) {
				// Game not Found
				return res.status(404).send('game ' + req.body.name  + 'NOT exists')
			}

			else {
			// game found -- UPdate nlikes +1
			req.db.collection('games').update(
				//update_filter,
				{'name': req.body.name },{$inc:{'nlikes': +1}}, true, true,
				function (err, doc) {
					// if error, return
					if (err) {
						// 500
						return res.status(500).send(err.message)
					}
					// Nothing Here
				}
			)  // update end



			res.jsonp(doc); // put ENDs ; sends a response needed to END the Update.  Response with a record updated info
			console.log(doc)

			}
			

		}
	) // find one
})






/**
 *  'Complex' ADD like && Plus user / Date info 
 *  POST  /game/like
 * 	Parameters: user_id , game_id 
 *  nlike ++ 
 *	additional info of user and date of 'like' added
 */


router.post('/like', function (req, res) {

	// check parameters
	if (!req.body.game_id || !req.body.user_id) {
		// 400 - bad request
		console.log('** No Parameters. Game name required');
		return res.status(400).send('Bad parameters. Game name required ')

	}


	var gameId = req.body.game_id;
	var userId = req.body.user_id;

	// find game
	req.db.collection('games').findOne(
		{"_id" : new ObjectId(gameId)},
		
		function (err, doc) {

			// if error, return
			if (err) {
				// 500
				return res.status(500).send(err.message); 
			}
			// if NOT found, update
			else if (!doc) {
				// Game not Found
				return res.status(404).send('game ' + req.body.name  + ' NOT exists')
			}

			else {
			// game found -- UPdate nlikes +1

			var userDateInfo = {'uid': userId, 'date': new Date()};
			req.db.collection('games').update(
				//update_filter,
				{"_id" : new ObjectId(gameId)},
				{
					$inc:{'nlikes': +1}, 
					$push:{ulike:userDateInfo }
				},
					true,
					true,
				function (err, doc) {
					// if error, return
					if (err) {
						// 500
						return res.status(500).send(err.message)
					}
					else {
						// Nothing Here
					}
					 
				}
			)  // update end



			res.jsonp(doc); // post ENDs ; sends a response needed to END the Update.  Response with a record updated info
			console.log(doc)

			}
			

		}
	) // find one
})









/**
 * 
 * Set a GAME unavailable (status : '3' => deleted) 
 * DELETE   /game/
 * parameter:  game_id  (game id)
 * 
 */
router.post('/del', function (req, res) {

	// check parameters
	if (!req.body.game_id) {
		// 400 - bad request
		console.log('** No Parameters. Game name required');
		return res.status(400).send('Bad parameters. Game Id required ')

	}

	var gameId = req.body.game_id;

	// find game
	req.db.collection('games').findOne(
		{"_id" : new ObjectId(gameId)},
		function (err, doc) {

			// if error, return
			if (err) {
				// 500
				return res.status(500).send(err.message); 
			}
			// if NOT found, update
			else if (!doc) {
				// Game not Found
				return res.status(404).send('Game ' + req.body.game_id  + 'NOT exists')
			}

			else {
			// game found -- UPdate status: set to 3 => Deleted
			req.db.collection('games').update(
				//update_filter,
				{"_id" : new ObjectId(gameId)},
				{
					$set:{'status': 3}
				},
					true,
					true,
				function (err, doc) {
					// if error, return
					if (err) {
						// 500
						return res.status(500).send(err.message)
					}
					// Nothing Here
				}
			)  // update end



			res.jsonp(doc); // delete ENDs ; sends a response needed to END the Update.  Response with a record updated info
			console.log(doc)

			}
			

		}
	) // find one
})






//*

/* GET games listing. */
router.get('/', function(req, res, next) {
	  res.send('respond with a resource');
	});







module.exports = router;

/*

// Aux Function
function IsJsonString(str) {
	// For testing if str is a well formed JSON chain 
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

*/