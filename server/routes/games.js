var express = require('express');
var router = express.Router();
var {ObjectId} = require('mongodb'); //like ObjectId=require('mongodb').ObjectId;

var auxliar = require ('./aux.js');  // Imports aux functions

/**
 * Add a new game
 */
router.post('/', function (req, res) {

	// check parameters
	if (!req.body.name || !req.body.owner) {
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
				owner: req.body.owner,
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
			)  // Insert
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
 * parameter: game
 * GET /game/:game
 */
router.get('/:game', function(req, res, next) {
	var gameId = req.params.game;
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
 * 	Parameters: user , game
 *  nlike ++
 *	additional info of user and date of 'like' added
 *  a user can add as much likes as he wants with this endpoint
 */


router.post('/likeOld', function (req, res) {

	// check parameters
	if (!req.body.game || !req.body.user) {
		// 400 - bad request
		console.log('** No Parameters. Game name required');
		return res.status(400).send('Bad parameters. Game name required ')

	}


	var gameId = req.body.game;
	var userId = req.body.user;

	// find game
	req.db.collection('games').findOne(
		{"_id" : new ObjectId(gameId)},

		function (err, doc) {

			// if error, return
			if (err) {
				// 500
				return res.status(500).send(err.message);
			}
			// if NOT error, update
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
 * DELETE   /game/del
 * parameter:  game  (game id)
 *
 */
router.post('/del', function (req, res) {

	// check parameters
	if (!req.body.game) {
		// 400 - bad request
		console.log('** No Parameters. Game name required');
		return res.status(400).send('Bad parameters. Game Id required ')

	}

	var gameId = req.body.game;

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
				return res.status(404).send('Game ' + req.body.game  + 'NOT exists')
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


/* GET param listing. */
router.get('/:param1/likeTest', function(req, res, next) {

	  res.send('respond with a resource. The param passed to the endpoint : ' + req.params.param1);
	});

/* POST with param in URL . */
router.post('/:param1/unlikeTest', function(req, res, next) {

	  res.send('respond with a resource. The param passed to the endpoint : ' + req.params.param1 + ' doesnt like to mr: ' + req.body.user + ' \r\n');
	});










// **  like A (very complex nlike marker)

/**
 *  'VERY Complex' ADD like && Plus user / Date info
 *  POST  /game/:game_id/like
 * 	Parameters:
				(in the URL) : 	game 			Game  identifier
 				(in the body): 	user  			user identifier
 *  nlike ++
 *	additional info of user and date of 'like' added
 *  if the like is still market : do nothing
 * 	if the like is new  : save user * date/time info + increases by ONe the like counter !
 *
 *  IF user ya tiene un like registrado , no se repite ni se incrementa el marcador de likes
 *	ELSE  se registra el usuario y fecha/hora del registro y se incremeta en uno el contador de likes
 */


router.post('/:game/like', function (req, res) {
	/* POST with param :game in URL . */
	// check parameters
	//req.params.game

	var gameId = req.params.game;
	var userId = req.body.user;

	console.log ('gameId: ' + gameId  + '\r\n');
	console.log ('userId: ' + userId  + '\r\n');


	if (!req.params.game || !req.body.user) {
		// 400 - bad request
		console.log('** No Parameters. gameId & userId required');
		return res.status(400).send('Bad parameters. gameId & userId required ')

	}



	// find game
	req.db.collection('games').findOne(
		{"_id" : new ObjectId(gameId)},

		function (err, doc) {

			// if error, return
			if (err) {
				// 500
				return res.status(500).send(err.message);
			}
			// if NOT error, update
			else if (!doc) {
				// Game not Found
				return res.status(400).send('game ' + req.params.game + ' NOT exists')
			}

			else {
			// game found -- UPdate nlikes +1



			// comprovam si l'usuari té ja aquest like enregistrat
			req.db.collection('games').findOne(
					 {
			            "_id" : ObjectId(gameId),
			            'ulike.uid': userId
			      	 },

					function (err, doc) {

						// if error, return
						if (err) {
							// 500
							return res.status(500).send(err.message);
						}
						// if NOT error, update
						else if (doc) {
							// Game + user like found
							console.log('ATENTION PLEASE: The user: ' +  userId  + '  are repeating the like for the game:  ' + gameId + ' Nothing done!! \r\n')
							// Do nothing here
							return
							//return res.status(404).send('This like is still reported Game: ' + gameId  + ' user ' + userId + '\r\n');
						}

						else {
							// el juego existe  y
							// El usuario todavia no ha reportado ningun like --> UPdate nlikes +1
							// registrar usuario y fecha/hora del like

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









							}

						}

					) // FindOne  (gameId + userId)





			res.jsonp(doc); // post ENDs ; sends a response needed to END the Update.  Response with a record updated info
			console.log(doc)

			}


		}


	) // find one
})

//  like A end










router.post('/:game/unlike', function (req, res) {
	// unmark the LIKE of a game & // decrease the like marker by one
	/* POST with param :game in URL . */
	// check parameters
	//req.params.game

	var gameId = req.params.game;
	var userId = req.body.user;

	console.log ('gameId: ' + gameId  + '\r\n');
	console.log ('userId: ' + userId  + '\r\n');


	if (!req.params.game || !req.body.user) {
		// 400 - bad request
		console.log('** No Parameters. gameId & userId required');
		return res.status(400).send('Bad parameters. gameId & userId required ')

	}



	// find game
	req.db.collection('games').findOne(
		{"_id" : new ObjectId(gameId)},

		function (err, doc) {

			// if error, return
			if (err) {
				// 500
				return res.status(500).send(err.message);
			}
			// if NOT error, update
			else if (!doc) {
				// Game not Found
				return res.status(400).send('game ' + req.params.game + ' NOT exists')
			}

			else {
			// game found -- UPdate nlikes -1



			// comprovam si l'usuari té ja aquest like enregistrat
			req.db.collection('games').findOne(
					 {
			            "_id" : ObjectId(gameId),
			            'ulike.uid': userId
			      	 },

					function (err, doc) {

						// if error, return
						if (err) {
							// 500
							return res.status(500).send(err.message);
						}
						// if NOT error, update
						else if (doc) {
							// Game + user like found

							// UNMARK THE LIKE + DECREASE THE LIKE MARKER BY ONE

							// var userDateInfo = {'uid': userId, 'date': new Date()};
							req.db.collection('games').update(
								//update_filter,
							    {"_id" : ObjectId(gameId)},

						        {
						        	$inc:{nlikes:-1}
						         	,$pull:{ulike:{ "uid" : userId}}
						        }
							    , {multi:true} ,
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







							//return res.status(404).send('This like is still reported Game: ' + gameId  + ' user ' + userId + '\r\n');
						}

						else {
							// el juego existe  y
							// El usuario todavia no ha reportado ningun like --> UPdate nlikes +1
							// registrar usuario y fecha/hora del like
							console.log('ATENTION PLEASE: The user: ' +  userId  + '  never marked the game:  ' + gameId + ' with a like!. Nothing to do here!! \r\n')
							// do nothing HERE
							return

							}

						}

					) // FindOne  (gameId + userId)





			res.jsonp(doc); // post ENDs ; sends a response needed to END the Update.  Response with a record updated info
			console.log(doc)

			}


		}


	) // find one
})

//  UNlike  end


















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
