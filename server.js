"use strict";

// Import modules.
var express     = require('express');
var sqlite      = require("sqlite");
var helmet      = require('helmet');
var compression = require('compression');
var passport    = require('passport');
var Strategy    = require('passport-local').Strategy;
var bcrypt      = require('bcrypt');
var moment      = require('moment');
var imgur       = require('imgur');

imgur.setClientId('4e62d0b8bda287e');

const { check, validationResult } = require('express-validator/check');

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
app.use(require('body-parser').json());
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
    res.render('signup', { errors: req.errors });
  });

app.post('/signup',
  [
    check('firstname')
    .isLength({ min: 1 })
    .withMessage('You must enter a first name'),
    check('surname')
    .isLength({ min: 1 })
    .withMessage('You must enter a surname'),
    check('username')
    .isLength({ min: 1 })
    .withMessage('You must enter a username'),
    check('password')
    .isLength({ min: 5 })
    .withMessage('Your password must be at least 5 characters long')
  ],
  async function(req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('signup', { errors: errors.array() });
      return;
    }
    const body = req.body;
    var success = await register_user(body.username, body.password, body.firstname, body.surname);
    if (success) {
      req.flash('error', 'You can now log in!');
      res.redirect('/login');
    } else {
      const user_error = [{ location: 'body',
                            param:    'username',
                            value:    '',
                            msg:      'Username already exists' }];
      res.render('signup', { errors: user_error });
    }
    res.end();
  });

app.post('/contribute',
  [
    check('title')
    .isLength({ min: 1 })
    .withMessage('You must enter a title')
    .isLength({ max: 30 })
    .withMessage('Titles must be less than 30 characters'),
    check('description')
    .isLength({ min: 1 })
    .withMessage('You must enter a description')
    .isLength({ max: 120 })
    .withMessage('Descriptions must be less than 120 characters'),
    check('date')
    .isLength({ min: 1 })
    .withMessage('You must enter a date'),
  ],
  function (req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else {
      const body = req.body;
      var time = moment().format("HH:mm:ss-DD-MM-YYYY");
      imgur.uploadBase64(body.image)
        .then(function (json) {
          add_contribution(body.title, body.date, body.description, json.data.link, req.user.id, time);
        })
        .catch(function (err) {
          console.error(err.message);
        });
      res.json({ errors: '' });
    }
  });

app.get('/logout',
  function (req, res) {
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
    var ps = await db.prepare("select * from users where username=?");
    var user = await ps.all(username);
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
    var ps = await db.prepare("select * from users where id=?");
    var user = await ps.all(id);
    if (user.length === 0) {
      cb(new Error('User ' + id + ' does not exist'));
    } else {
      cb(null, user[0]);
    }
  } catch (error) {
    console.log(error);
  }
}

async function register_user(username, password, firstname, surname) {
  try {
    var db = await sqlite.open("./db.sqlite");
    var ps = await db.prepare("select * from users where username=?");
    var user = await ps.all(username);
    if (user.length === 0) {
      await bcrypt.hash(password, saltRounds, async function(err, hash) {
        var ps = await db.prepare("insert into users (username, password, firstname, surname, contributions, joindate) \
                                   values ( ?, ?, ?, ?, ?, ? )");

        var date_string = moment().format('DD-MM-YYYY');
        await ps.run(username, hash, firstname, surname, 0, date_string);
      });
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

async function add_contribution(title, date, description, image, user_id, contribution_date) {
  try {
    var db = await sqlite.open("./db.sqlite");
    var ps = await db.prepare("insert into contributions (contributor_id, contribution_date, title, image_source, description, likes) \
                               values ( ?, ?, ?, ?, ?, ? )");
    await ps.run(user_id, contribution_date, title, image, description, 0);
  } catch (error) {
    console.log(error);
  }
}
