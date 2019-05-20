"use strict";

// Import modules.
var express     = require('express');
var sqlite      = require("sqlite");
var helmet      = require('helmet');
var compression = require('compression');
var passport    = require('passport');
var Strategy    = require('passport-local').Strategy;
var bcrypt      = require('bcrypt');

const saltRounds = 10;

// Create an express application.
var app = express();

// Use these middleware modules.
app.use(helmet());
app.use(compression());

passport.use(new Strategy(
  async function(username, password, cb) {
    find_by_username(username, async function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false, { message: 'Username does not exist' }); }
      const match = await bcrypt.compare(password, user.password);
      if (!match) { return cb(null, false, { message: 'Incorrect password' }); }
      return cb(null, user);
    });
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  find_by_id(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(require('connect-flash')());

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function(req, res) {
    res.render('index', { user: req.user });
  });

app.get('/timeline',
  function(req, res) {
    res.render('timeline', { user: req.user });
  });

app.get('/about',
  function(req, res) {
    res.render('about', { user: req.user });
  });

app.get('/login',
  function(req, res) {
    res.render('login', { message: req.flash('error') });
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login',
                                   failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/signup',
  function(req, res) {
    res.render('signup', { message: req.flash('signup-error') });
  });

app.post('/signup',
  async function(req, res) {
    const body = req.body;
    var success = await register_user(body.username, body.password);
    if (success) {
      req.flash('error', 'You can now log in!');
      res.redirect('/login');
    } else {
      req.flash('signup-error', 'Username already exists');
      res.redirect('/signup');
    }
    res.end();
  });

app.get('/logout',
  function(req, res) {
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    res.render('profile', { user: req.user });
  });

// Serve static files in the 'public' directory.
app.use(express.static('public'));

// Start the server on port 3000.
app.listen(process.env.PORT || 3000, function() {
  console.log('Server listening on port 3000...');
});

async function find_by_username(username, cb) {
  try {
    var db = await sqlite.open("./db.sqlite");
    // Using prepared statements to prevent SQL injection attacks
    var user = await db.all("select * from users where username=?", username);
    if (user.length === 0) {
      return cb(null, null);
    } else {
      return cb(null, user[0]);
    }
  } catch (error) {
    console.log(error);
  }
}

async function find_by_id(id, cb) {
  try {
    var db = await sqlite.open("./db.sqlite");
    // Using prepared statements to prevent SQL injection attacks
    var user = await db.all("select * from users where id=?", id);
    if (user.length === 0) {
      cb(new Error('User ' + id + ' does not exist'));
    } else {
      cb(null, user[0]);
    }
  } catch (error) {
    console.log(error);
  }
}

async function register_user(username, password) {
  try {
    var db = await sqlite.open("./db.sqlite");

    var user = await db.all("select * from users where username=?", username);
    if (user.length === 0) {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        db.run("insert into users (username, password) values (?, ?)", username, hash);
      });
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}
