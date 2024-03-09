var mysql = require("mysql2");

var db = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "password",
	database: "bodylift",
	connectTimeout: 60000,
});

db.connect((err) => {
	if (err) throw err;
	console.log("Database Connected");
});

exports.databaseConnection = db;
