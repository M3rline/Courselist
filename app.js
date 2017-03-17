var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var valid = require('valid-url');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var _ = require('underscore');
var child_process = require('child_process');
var passport = require('passport');
var session = require('express-session');
var homecontroller = require('./controllers/home');
var coursecontroller = require('./controllers/course');

var jsonfile = require('jsonfile');
var fs = require('fs');
var sh = require("shorthash");
var async = require('async');
const port = process.env.PORT || 8080;

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
//static directory is public
app.use(express.static('public'));
//use bodyparser to get forms
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true,
    parameterLimit: 10000,
    limit: 1024 * 1024 * 10
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'courses',
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 720000
    }
})); // session secret
app.use(flash());
app.set('views', __dirname + '/views');

app.get('/', homecontroller.redirectHome);
app.get('/home', homecontroller.renderHome);
app.get('/course/:id',coursecontroller.renderCourse);
app.get('/pages/:pagename',homecontroller.renderPage);

var server = app.listen(port, function() {
    postload(function(err, message) {
        console.log('Finished post loading');
        console.log('Listening on port', port);
    });
});

/**
 * Postload as soon as the server starts, in order to update any changes
 * in neural networks
 * @param {any} callback 
 */
function postload(callback) {
    var textfile = fs.readFileSync('coursedetails.txt')    ;
    var jsonString = "["+textfile.slice(0,-1)+"]";
    var json  = JSON.parse(jsonString);
    jsonfile.writeFileSync('coursedetails.json',json);
    return callback(null,true);
}