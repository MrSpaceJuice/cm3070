var express = require("express");
var app = express();
var port = 8000;

var bodyParser = require("body-parser");
var session = require("express-session");
var cookieParser = require("cookie-parser");

var methodOverride = require('method-override');

var authRouter = require("./routes/auth");
var homeRouter = require("./routes/home");

var db = require("./database").databaseConnection;

app.use(express.static('assets'))

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.use(
	session({
		secret: "bigSecret",
		name: "bodyliftSessionID",
		resave: true,
		saveUninitialized: false,
	})
);

app.use("/auth", authRouter);
app.use("/home", homeRouter);

app.get("/", (req, res) => {
	if (req.session.loggedIn) {
		res.redirect("/home");
	} else {
		res.redirect("/auth");
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
