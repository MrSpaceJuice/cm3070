var express = require("express");
var router = express.Router();

var db = require("../database").databaseConnection;

router.get("", function (req, res) {
	var lastWorkout;
	var recommended;

	var sqlStr = `SELECT workouts.*, 
					category1.exercise_name AS cat1_exercise, 
					category2.exercise_name AS cat2_exercise, 
					category3.exercise_name AS cat3_exercise, 
					category4.exercise_name AS cat4_exercise, 
					category5.exercise_name AS cat5_exercise, 
					category6.exercise_name AS cat6_exercise, 
					category7.exercise_name AS cat7_exercise, 
					category8.exercise_name AS cat8_exercise, 
					category9.exercise_name AS cat9_exercise, 
					category1.goal_reps AS cat1_goal, 
					category2.goal_reps AS cat2_goal,
					category3.goal_reps AS cat3_goal, 
					category4.goal_reps AS cat4_goal, 
					category5.goal_reps AS cat5_goal, 
					category6.goal_reps AS cat6_goal, 
					category7.goal_reps AS cat7_goal, 
					category8.goal_reps AS cat8_goal, 
					category9.goal_reps AS cat9_goal, 
					category1.level AS ex1_level,
					category2.level AS ex2_level,
					category3.level AS ex3_level,
					category4.level AS ex4_level,
					category5.level AS ex5_level,
					category6.level AS ex6_level,
					category7.level AS ex7_level,
					category8.level AS ex8_level,
					category9.level AS ex9_level
				FROM workouts 
					JOIN category1 ON workouts.exercise1=category1.id 
					JOIN category2 ON workouts.exercise2=category2.id 
					JOIN category3 ON workouts.exercise3=category3.id 
					JOIN category4 ON workouts.exercise4=category4.id 
					JOIN category5 ON workouts.exercise5=category5.id 
					JOIN category6 ON workouts.exercise6=category6.id 
					JOIN category7 ON workouts.exercise7=category7.id 
					JOIN category8 ON workouts.exercise8=category8.id 
					JOIN category9 ON workouts.exercise9=category9.id 
				WHERE workouts.user_id = ${req.session.userId}
				ORDER BY id DESC LIMIT 1;`;

	db.query(sqlStr, async function (err, result) {
		if (err) {
			throw err;
		} else {
			lastWorkout = result[0];
			recommended = await calcRecommended(lastWorkout);
			req.session.recEx1 = recommended.cat1_exercise;
			req.session.recEx2 = recommended.cat2_exercise;
			req.session.recEx3 = recommended.cat3_exercise;
			req.session.recEx4 = recommended.cat4_exercise;
			req.session.recEx5 = recommended.cat5_exercise;
			req.session.recEx6 = recommended.cat6_exercise;
			req.session.recEx7 = recommended.cat7_exercise;
			req.session.recEx8 = recommended.cat8_exercise;
			req.session.recEx9 = recommended.cat9_exercise;
			res.render("pages/home", {
				username: req.session.username,
				lastWorkout: lastWorkout,
				recommended: recommended,
			});
		}
	});
});

router.get("/profile", async(req, res) => {
	var sqlStr = `SELECT username, last_name, first_name, email 
					FROM user
					WHERE id=${req.session.userId}`

	db.query(sqlStr, (err, result) => {
		if (err) {
			throw err;
		} else {
			res.render("pages/profile", {user: result[0]})
		}
	});
})

router.get("/new-workout", async (req, res) => {
	var exData = []

	for (let i = 0; i < 9; i++) {
		getExData = () => {
			var sqlStr = `SELECT * FROM category${i+1};`

			return new Promise((resolve, reject) => {
				db.query(sqlStr, function (err, result) {
					if (err) {
						return reject(err);
					} else {
						return resolve(result);
					}
				})
			})
		}
		exData[i] = await getExData();
	}

	res.render("pages/new-workout", { ex1: exData[0], 
										ex2: exData[1], 
										ex3: exData[2], 
										ex4: exData[3],
										ex5: exData[4],
										ex6: exData[5],
										ex7: exData[6],
										ex8: exData[7],
										ex9: exData[8],
										recEx1: req.session.recEx1,
										recEx2: req.session.recEx2,
										recEx3: req.session.recEx3,
										recEx4: req.session.recEx4,
										recEx5: req.session.recEx5,
										recEx6: req.session.recEx6,
										recEx7: req.session.recEx7,
										recEx8: req.session.recEx8,
										recEx9: req.session.recEx9});
});

router.post("/new-workout/post", (req, res) => {
	var sqlStr = `INSERT INTO workouts(user_id, 
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
					VALUES (${req.session.userId}, 
							NOW(), 
							${req.body.exercise1}, 
							${req.body.exercise2}, 
							${req.body.exercise3}, 
							${req.body.exercise4},
							${req.body.exercise5},
							${req.body.exercise6},
							${req.body.exercise7},
							${req.body.exercise8},
							${req.body.exercise9});`
	db.query(sqlStr, (err, result) => {
		if (err) {
			throw err;
		} else {
			// res.send(result)
			res.redirect("/home/current-workout")
		}
	});

});

router.get("/current-workout", (req, res) => {
	var sqlStr = `SELECT workouts.*, 
					category1.exercise_name AS cat1_exercise, 
					category2.exercise_name AS cat2_exercise, 
					category3.exercise_name AS cat3_exercise, 
					category4.exercise_name AS cat4_exercise, 
					category5.exercise_name AS cat5_exercise, 
					category6.exercise_name AS cat6_exercise, 
					category7.exercise_name AS cat7_exercise, 
					category8.exercise_name AS cat8_exercise, 
					category9.exercise_name AS cat9_exercise, 
					category1.goal_reps AS cat1_goal, 
					category2.goal_reps AS cat2_goal,
					category3.goal_reps AS cat3_goal, 
					category4.goal_reps AS cat4_goal,
					category5.goal_reps AS cat5_goal,
					category6.goal_reps AS cat6_goal,
					category7.goal_reps AS cat7_goal,
					category8.goal_reps AS cat8_goal,
					category9.goal_reps AS cat9_goal,
					category1.video AS cat1_video,
					category2.video AS cat2_video,
					category3.video AS cat3_video,
					category4.video AS cat4_video,
					category5.video AS cat5_video,
					category6.video AS cat6_video,
					category7.video AS cat7_video,
					category8.video AS cat8_video,
					category9.video AS cat9_video
				FROM workouts 
					JOIN category1 ON workouts.exercise1=category1.id 
					JOIN category2 ON workouts.exercise2=category2.id 
					JOIN category3 ON workouts.exercise3=category3.id 
					JOIN category4 ON workouts.exercise4=category4.id 
					JOIN category5 ON workouts.exercise5=category5.id 
					JOIN category6 ON workouts.exercise6=category6.id 
					JOIN category7 ON workouts.exercise7=category7.id 
					JOIN category8 ON workouts.exercise8=category8.id 
					JOIN category9 ON workouts.exercise9=category9.id 
				WHERE workouts.user_id = ${req.session.userId}
				ORDER BY id DESC LIMIT 1;`;
	db.query(sqlStr, (err, result) => {
		if (err) {
			throw err;
		} else {
			res.render("pages/current-workout", {currentWorkout: result[0]})
		}
	});
})

router.put("/current-workout/update", (req, res) => {
	var sqlStr = `UPDATE workouts 
					SET ex1_set1 = ${req.body.ex1_set1},
						ex1_set2 = ${req.body.ex1_set2},
						ex1_set3 = ${req.body.ex1_set3},
						ex2_set1 = ${req.body.ex2_set1},
						ex2_set2 = ${req.body.ex2_set2},
						ex2_set3 = ${req.body.ex2_set3},
						ex3_set1 = ${req.body.ex3_set1},
						ex3_set2 = ${req.body.ex3_set2},
						ex3_set3 = ${req.body.ex3_set3},
						ex4_set1 = ${req.body.ex4_set1},
						ex4_set2 = ${req.body.ex4_set2},
						ex4_set3 = ${req.body.ex4_set3},
						ex5_set1 = ${req.body.ex5_set1},
						ex5_set2 = ${req.body.ex5_set2},
						ex5_set3 = ${req.body.ex5_set3},
						ex6_set1 = ${req.body.ex6_set1},
						ex6_set2 = ${req.body.ex6_set2},
						ex6_set3 = ${req.body.ex6_set3},
						ex7_set1 = ${req.body.ex7_set1},
						ex7_set2 = ${req.body.ex7_set2},
						ex7_set3 = ${req.body.ex7_set3},
						ex8_set1 = ${req.body.ex8_set1},
						ex8_set2 = ${req.body.ex8_set2},
						ex8_set3 = ${req.body.ex8_set3},
						ex9_set1 = ${req.body.ex9_set1},
						ex9_set2 = ${req.body.ex9_set2},
						ex9_set3 = ${req.body.ex9_set3}
					WHERE id = ${req.body.workoutId}`

	db.query(sqlStr, (err, result) => {
		if (err) {
			throw err;
		} else {
			res.redirect("/home/results")
		}
	});
})


router.get("/results", (req, res) => {
	var feedback = []

	var sqlStr = `SELECT workouts.*, 
					category1.exercise_name AS cat1_exercise, 
					category2.exercise_name AS cat2_exercise, 
					category3.exercise_name AS cat3_exercise, 
					category4.exercise_name AS cat4_exercise, 
					category5.exercise_name AS cat5_exercise, 
					category6.exercise_name AS cat6_exercise, 
					category7.exercise_name AS cat7_exercise, 
					category8.exercise_name AS cat8_exercise, 
					category9.exercise_name AS cat9_exercise, 
					category1.goal_reps AS cat1_goal, 
					category2.goal_reps AS cat2_goal,
					category3.goal_reps AS cat3_goal, 
					category4.goal_reps AS cat4_goal, 
					category5.goal_reps AS cat5_goal, 
					category6.goal_reps AS cat6_goal, 
					category7.goal_reps AS cat7_goal, 
					category8.goal_reps AS cat8_goal, 
					category9.goal_reps AS cat9_goal
				FROM workouts 
					JOIN category1 ON workouts.exercise1=category1.id 
					JOIN category2 ON workouts.exercise2=category2.id 
					JOIN category3 ON workouts.exercise3=category3.id 
					JOIN category4 ON workouts.exercise4=category4.id 
					JOIN category5 ON workouts.exercise5=category5.id 
					JOIN category6 ON workouts.exercise6=category6.id 
					JOIN category7 ON workouts.exercise7=category7.id 
					JOIN category8 ON workouts.exercise8=category8.id 
					JOIN category9 ON workouts.exercise9=category9.id 
				WHERE workouts.user_id = ${req.session.userId}
				ORDER BY id DESC LIMIT 1;`;

	db.query(sqlStr, async function (err, result) {
		if (err) {
			throw err;
		} else {
			lastWorkout = result[0];
			feedback = await calcFeedback(lastWorkout);
			res.render("pages/results", {lastWorkout: lastWorkout, feedback: feedback})
		};
	})
});

router.get("/history", (req, res) => {
	var sqlStr = `SELECT *, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM workouts 
					WHERE user_id = ${req.session.userId};`

	db.query(sqlStr, (err, result) => {
		if (err) {
			throw err;
		} else {
			var dates = [];
			var ex1Data = [];
			var ex2Data = [];
			var ex3Data = [];
			var ex4Data = [];
			var ex5Data = [];
			var ex6Data = [];
			var ex7Data = [];
			var ex8Data = [];
			var ex9Data = [];

			for(i=0;i<result.length;i++){
				dates.push(result[i].date);
				ex1Reps = result[i].ex1_set1 + result[i].ex1_set2 + result[i].ex1_set3;
				ex1Data.push(ex1Reps)
				ex2Reps = result[i].ex2_set1 + result[i].ex2_set2 + result[i].ex2_set3;
				ex2Data.push(ex2Reps)
				ex3Reps = result[i].ex3_set1 + result[i].ex3_set2 + result[i].ex3_set3;
				ex3Data.push(ex3Reps)
				ex4Reps = result[i].ex4_set1 + result[i].ex4_set2 + result[i].ex4_set3;
				ex4Data.push(ex4Reps)
				ex5Reps = result[i].ex5_set1 + result[i].ex5_set2 + result[i].ex5_set3;
				ex5Data.push(ex5Reps)
				ex6Reps = result[i].ex6_set1 + result[i].ex6_set2 + result[i].ex6_set3;
				ex6Data.push(ex6Reps)
				ex7Reps = result[i].ex7_set1 + result[i].ex7_set2 + result[i].ex7_set3;
				ex7Data.push(ex7Reps)
				ex8Reps = result[i].ex8_set1 + result[i].ex8_set2 + result[i].ex8_set3;
				ex8Data.push(ex8Reps)
				ex9Reps = result[i].ex9_set1 + result[i].ex9_set2 + result[i].ex9_set3;
				ex9Data.push(ex9Reps)

			}
			res.render("pages/history", {dates: dates,
											ex1Data: ex1Data,
											ex2Data: ex2Data,
											ex3Data: ex3Data,
											ex4Data: ex4Data,
											ex5Data: ex5Data,
											ex6Data: ex6Data,
											ex7Data: ex7Data,
											ex8Data: ex8Data,
											ex9Data: ex9Data})
		}
	});

})


module.exports = router;

// this is a helper function that takes the last workout to 
// determine the suggested exercises for the next workout
async function calcRecommended(last) {
	var recommendedWorkout = {}
	var ex1RecLevel;
	var ex2RecLevel;
	var ex3RecLevel;
	var ex4RecLevel;
	var ex5RecLevel;
	var ex6RecLevel;
	var ex7RecLevel;
	var ex8RecLevel;
	var ex9RecLevel;

	if (last.ex1_set3 >= last.cat1_goal) {
		ex1RecLevel = last.ex1_level + 1
	} else {
		ex1RecLevel = last.ex1_level
	}

	if (last.ex2_set3 >= last.cat2_goal) {
		ex2RecLevel = last.ex2_level + 1
	} else {
		ex2RecLevel = last.ex2_level
	}

	if (last.ex3_set3 >= last.cat3_goal) {
		ex3RecLevel = last.ex3_level + 1
	} else {
		ex3RecLevel = last.ex3_level
	}

	if (last.ex4_set3 >= last.cat4_goal) {
		ex4RecLevel = last.ex4_level + 1
	} else {
		ex4RecLevel = last.ex4_level
	}

	if (last.ex5_set3 >= last.cat5_goal) {
		ex5RecLevel = last.ex5_level + 1
	} else {
		ex5RecLevel = last.ex5_level
	}
	if (last.ex6_set3 >= last.cat6_goal) {
		ex6RecLevel = last.ex6_level + 1
	} else {
		ex6RecLevel = last.ex6_level
	}
	if (last.ex7_set3 >= last.cat7_goal) {
		ex7RecLevel = last.ex7_level + 1
	} else {
		ex7RecLevel = last.ex7_level
	}

	if (last.ex8_set3 >= last.cat8_goal) {
		ex8RecLevel = last.ex8_level + 1
	} else {
		ex8RecLevel = last.ex8_level
	}

	if (last.ex9_set3 >= last.cat9_goal) {
		ex9RecLevel = last.ex9_level + 1
	} else {
		ex9RecLevel = last.ex9_level
	}


	getData = () => {
		var sqlStr = `SELECT category1.exercise_name AS cat1_exercise,
						category2.exercise_name AS cat2_exercise,
						category3.exercise_name AS cat3_exercise,
						category4.exercise_name AS cat4_exercise,
						category5.exercise_name AS cat5_exercise,
						category6.exercise_name AS cat6_exercise,
						category7.exercise_name AS cat7_exercise,
						category8.exercise_name AS cat8_exercise,
						category9.exercise_name AS cat9_exercise
					  FROM category1
						JOIN category2 ON category2.level = ${ex2RecLevel}
						JOIN category3 ON category3.level = ${ex3RecLevel}
						JOIN category4 ON category4.level = ${ex4RecLevel}
						JOIN category5 ON category5.level = ${ex5RecLevel}
						JOIN category6 ON category6.level = ${ex6RecLevel}
						JOIN category7 ON category7.level = ${ex7RecLevel}
						JOIN category8 ON category8.level = ${ex8RecLevel}
						JOIN category9 ON category9.level = ${ex9RecLevel}
					  WHERE category1.level = ${ex1RecLevel}`

		return new Promise((resolve, reject) => {
			db.query(sqlStr, function (err, result) {
				if (err) {
					return reject(err);
				} else {
					return resolve(result[0]);
				}
			})
		})
	}

	recommendedWorkout = await getData();

	return recommendedWorkout
}



function calcFeedback(last) {
	var feedback = []

	if(last.ex1_set1 >= last.cat1_goal &&
		last.ex1_set2 >= last.cat1_goal &&
		last.ex1_set3 >= last.cat1_goal){
		feedback[0] = "Goal met!  Next time try the next level."
	} else {
		feedback[0] = "Keep on trying.  You're almost there!"
	}

	if(last.ex2_set1 >= last.cat2_goal &&
		last.ex2_set2 >= last.cat2_goal &&
		last.ex2_set3 >= last.cat2_goal){
		feedback[1] = "Goal met!  Next time try the next level."
	} else {
		feedback[1] = "Keep on trying.  You're almost there!"
	}

	if(last.ex3_set1 >= last.cat3_goal &&
		last.ex3_set2 >= last.cat3_goal &&
		last.ex3_set3 >= last.cat3_goal){
		feedback[2] = "Goal met!  Next time try the next level."
	} else {
		feedback[2] = "Keep on trying.  You're almost there!"
	}

	if(last.ex4_set1 >= last.cat4_goal &&
		last.ex4_set2 >= last.cat4_goal &&
		last.ex4_set3 >= last.cat4_goal){
		feedback[3] = "Goal met!  Next time try the next level."
	} else {
		feedback[3] = "Keep on trying.  You're almost there!"
	}

	if(last.ex5_set1 >= last.cat5_goal &&
		last.ex5_set2 >= last.cat5_goal &&
		last.ex5_set3 >= last.cat5_goal){
		feedback[4] = "Goal met!  Next time try the next level."
	} else {
		feedback[4] = "Keep on trying.  You're almost there!"
	}

	if(last.ex6_set1 >= last.cat6_goal &&
		last.ex6_set2 >= last.cat6_goal &&
		last.ex6_set3 >= last.cat6_goal){
		feedback[5] = "Goal met!  Next time try the next level."
	} else {
		feedback[5] = "Keep on trying.  You're almost there!"
	}

	if(last.ex7_set1 >= last.cat7_goal &&
		last.ex7_set2 >= last.cat7_goal &&
		last.ex7_set3 >= last.cat7_goal){
		feedback[6] = "Goal met!  Next time try the next level."
	} else {
		feedback[6] = "Keep on trying.  You're almost there!"
	}

	if(last.ex8_set1 >= last.cat8_goal &&
		last.ex8_set2 >= last.cat8_goal &&
		last.ex8_set3 >= last.cat8_goal){
		feedback[7] = "Goal met!  Next time try the next level."
	} else {
		feedback[7] = "Keep on trying.  You're almost there!"
	}

	if(last.ex9_set1 >= last.cat9_goal &&
		last.ex9_set2 >= last.cat9_goal &&
		last.ex9_set3 >= last.cat9_goal){
		feedback[8] = "Goal met!  Next time try the next level."
	} else {
		feedback[8] = "Keep on trying.  You're almost there!"
	}

	return feedback
}

