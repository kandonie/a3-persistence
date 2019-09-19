// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var errorhandler = require('errorhandler');
var LocalStrategy = require('passport-local').Strategy;
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// default error-handler
function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
}

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Dreams (dream TEXT)');
    console.log('New table Dreams created!');
    
    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")');
    });
  }
  else {
    console.log('Database "Dreams" ready to go!');
    db.each('SELECT * from Dreams', function(err, row) {
      if ( row ) {
        console.log('record:', row);
      }
    });
  }
});

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/views/login.html');
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/index', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/getDreams', function(request, response) {
  db.all('SELECT * from Dreams', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

app.post('/login',
    passport.authenticate('local', { successRedirect: '/index',
        failureRedirect: '/', failureFlash: 'Invalid Username or Password' }));

// listen for requests
const listener = app.listen(3000, function() {
    console.log('Your app is listening on port ' + 3000);
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        const user1 = 'cs4241';

        if (!user1) {
            return done(null, false, {message: "Incorrect user"});
        } else if (user1.password === 'cs4241') {
            return done(null, {username, password});
        } else {
            return done(null, false, {message: "Incorrect password"});
        }
    }
));

passport.serializeUser( ( user, done ) => done( null, user.username ) );

passport.deserializeUser( ( username, done ) => {
    const user = 'cs4241';
    console.log( 'deserializing:', username );

    if( user !== undefined ) {
        done( null, user )
    }else{
        done( null, false, { message:'user not found; session not restored' })
    }
});