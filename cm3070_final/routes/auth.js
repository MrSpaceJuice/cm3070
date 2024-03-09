var express = require("express");
var router = express.Router();

var db = require("../database").databaseConnection;

router.get("", (req, res) => {
	res.render("pages/login");
});

router.post("/authenticate", (req, res, next) => {
	var sqlStr = `SELECT * FROM user 
				WHERE username='${req.body.username}'`;
	db.query(sqlStr, (err, result) => {
		if (err) {
			throw err;
		} else {
			if (result[0].password == req.body.password) {
				res.locals.username = result[0].username;
				res.locals.userId = result[0].id;
				next();
			} else {
				res.status(401).send("Auth Failed.");
			}
		}
	});
},
	(req, res) => {
		req.session.loggedIn = true;
		req.session.username = res.locals.username;
		req.session.userId = res.locals.userId;
		res.redirect("/");
	}
);

router.get("/signup", (req, res) => {
	res.render('pages/signup')
})
router.post("/signup/post", (req, res, next) => {
	var sqlStr=`INSERT INTO user (username, first_name, last_name, email, password)
					VALUES ('${req.body.username}', 
							'${req.body.firstName}',
							'${req.body.lastName}',
							'${req.body.email}',
							'${req.body.password}');`

	db.query(sqlStr, (err, result) => {
		if (err) {
			throw err;
		} else {
			next()
		}
	});
},
	(req, res) => {
		var sqlStr =  `INSERT INTO workouts (user_id, 
											date, 
											exercise1,
											exercise2, 
											exercise3, 
											exercise4,
											exercise5,
											exercise6,
											exercise7,
											exercise8,
											exercise9)
						VALUES ((select id from user order by id desc limit 1), NOW(), 1, 1, 1, 1, 1, 1, 1, 1, 1);`

		db.query(sqlStr, (err, result) => {
			if (err) {
				throw err
			} else {
				res.redirect("/auth")
			}
		})

		
	}
);

router.delete('/logout', (req, res) => {
	if (req.session) {
		req.session.destroy(err => {
			if (err) {
				res.status(400).send('Unable to log out')
			} else {
				res.redirect("/")
			}
		});
	} else {
		res.end()
	}
})

module.exports = router;
