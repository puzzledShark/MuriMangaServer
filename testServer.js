var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var configDB = require('./config/database.js');

//mongoose.connect(configDB.url);

//require('./config/passport')(passport);

app.configure(function() {

	//setup express
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms

	app.set('view engine', 'ejs');

	//passport setup
	app.use(express.session({secret: 'eatcake' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());

});


require('./app/routes.js')(app,passport);



app.listen(port);
console.log('Server online on port ' + port);
