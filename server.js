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
var https       = require('https');
var fs          = require('fs');

// Set our client ID for the imgur API
imgur.setClientId('4e62d0b8bda287e');

const { check, validationResult } = require('express-validator/check');

// Number of rounds bcrypt uses to salt passwords
const saltRounds = 10;

// Create an express application.
var app = express();

// Use helmet and compression
app.use(helmet());
app.use(compression());

// Use the 'local' passport strategy
passport.use(new Strategy(
  async function(username, password, cb) {
    find_by_username(username, async function(err, user) {
      if (err) { return cb(err); }
      // If there is no user, send the message 'username'. This is then
      // interpreted by the client-side and the correct error message is
      // displayed.
      if (!user) { return cb(null, false, { message: 'username' }); }
      // Decrypt the password to compare
      const match = await bcrypt.compare(password, user.password);
      // If the password is incorrect, send the message 'password'. As
      // before, this is intepreted by the client-side.
      if (!match) { return cb(null, false, { message: 'password' }); }
      // If successful, return the newly logged in user
      return cb(null, user);
    });
  }));

// Used by passport
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

// used by passport
passport.deserializeUser(function(id, cb) {
  // Find the user in the database from their id
  find_by_id(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// These are used for cookie and request parsing, and session handling
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({limit: '10mb', extended: true}));
app.use(require('body-parser').json({limit: '10mb', extended: true}));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(require('connect-flash')());

// Initialize Passport and restore authentication state, if any, from the
// session
app.use(passport.initialize());
app.use(passport.session());

// Serve static files in the 'public' directory
app.use(express.static('public'));

// Define routes.
app.get('/',
  function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });

app.get('/timeline',
  function(req, res) {
    res.sendFile(__dirname + '/public/timeline.html');
  });

app.get('/about',
  function(req, res) {
    res.sendFile(__dirname + '/public/about.html');
  });

app.get('/login',
  function(req, res) {
    res.sendFile(__dirname + '/public/login.html');
  });

// When a user tries to log in, the client-side sends a POST /login request
app.post('/login', function (req, res, next) {
  // Use passport to authenticate the user
  passport.authenticate('local', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      // If there is no user, send an error message to the client-side
      res.json(info);
    } else {
      req.login(user, function (err) {
        if (err) { return next(err); }
        // If there is no error, send an empty message to the client-side
        // and it interprets this as no errors
        res.json({ message: '' });
      });
    }
  }) (req, res, next);
});

app.get('/signup',
  function(req, res) {
    res.sendFile(__dirname + '/public/signup.html');
  });

app.post('/signup',
  [
    // Validation for each of the inputs
    // The messages are interpreted by the client-side
    check('firstname')
    .isLength({ min: 1 })
    .withMessage('firstname'),
    check('surname')
    .isLength({ min: 1 })
    .withMessage('surname'),
    check('username')
    .isLength({ min: 1 })
    .withMessage('username'),
    check('password')
    .isLength({ min: 5 })
    .withMessage('password')
  ],
  async function(req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are errors, send them to the client-side
      res.json({ errors: errors.array() });
    } else {
      const body = req.body;
      // Try and register the user in the database
      var success = await register_user(body.username, body.password, body.firstname, body.surname);
      if (success) {
        // If successful, send the client-side a success message
        res.json({ success: 'yes' });
      } else {
        // If it was not successful, the user already existed. Create an object
        // that represents this error, and send it to the client-side
        const user_error = [{ location: 'body',
                              param:    'username',
                              value:    '',
                              msg:      'alreadyexists' }];
        // Send the response
        res.json({ errors: user_error });
      }
    }
  });

app.post('/contribute',
  [
    // Validation for each of the inputs
    // The messages are interpreted by the client-side
    check('title')
    .isLength({ min: 1 })
    .withMessage('title_min')
    .isLength({ max: 50 })
    .withMessage('title_max'),
    check('description')
    .isLength({ min: 1 })
    .withMessage('description_min')
    .isLength({ max: 450 })
    .withMessage('description_max'),
    check('date')
    .isLength({ min: 1 })
    .withMessage('date'),
  ],
  function (req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else {
      const body = req.body;
      // Use moment to format the current date in a string that we can store
      // in the database
      var time = moment().format("HH:mm:ss-YYYY-MM-DD");
      // Upload the image to imgur
      imgur.uploadBase64(body.image)
        .then(function (json) {
          // If successful, add the contribution to the database
          add_contribution(body.title, body.date, body.description, json.data.link, req.user.id, time);
          // Send a response to the client-side containing no errors
          res.json({ errors: '' });
        })
        .catch(function (err) {
          console.error(err.message);
        });
    }
  });

// Used to check if a user is logged in or not
app.get('/user',
  async function (req, res) {
    var user = req.user;
    if (user) {
      // Attach a joindate tag to the user object and then send the user
      // object back to the client-side. This date is in the form
      // "May 20th 2019" and can be used on any page.
      var join_date = moment(user.joindate, "YYYY-MM-DD");
      user.joindate = moment(join_date).format('MMMM Do YYYY');
      res.json(user);
    } else {
      // If there is no user currently logged in, send a 204 status telling
      // the client-side that no user is logged in
      res.status(204).send('No user');
    }
  });

// Used to fetch the contributions of a single user by the client-side
app.get('/contributions',
  async function (req, res) {
    var user_id = req.user.id;
    // Send a response containing the contributions corresponding to
    // the user_id
    var contributions = await get_contributions(user_id);
    res.json(contributions);
  });

// Used to fetch all contributions
app.get('/all_contributions',
  async function (req, res) {
    // Send a response containing all contributions that exist in the database
    var contributions = await get_all_contributions();
    res.json(contributions);
  });

// Log a user out
app.get('/logout',
  function (req, res) {
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    res.sendFile(__dirname + '/public/profile.html');
  });

// If the server is running locally, run an http server. If no 'local'
// argument is provided at runtime, run an HTTPS serer instead, with the
// keys provided to us by Let's Encrypt.
if (process.argv[2] === 'local') {
  app.listen(process.env.PORT || 8080, function() {
    console.log('Server listening on port 8080...');
  });
} else {
  https.createServer({
      key: fs.readFileSync('/etc/letsencrypt/live/timeline.wang/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/timeline.wang/fullchain.pem'),
      passphrase: 'ainsley'
  }, app)
  .listen(process.env.PORT || 8080, function() {
    console.log('Server listening on port 8080...');
  });
}

// Find a user in the database by their username
async function find_by_username(username, cb) {
  try {
    var db = await sqlite.open("./db.sqlite");
    // Using prepared statements to prevent SQL injection attacks
    var ps = await db.prepare("select * from users where username=?");
    var user = await ps.get(username);
    await ps.finalize();
    if (!user) {
      return cb(null, null);
    } else {
      return cb(null, user);
    }
  } catch (error) {
    console.log(error);
  }
}

// Find a user in the database by their id
async function find_by_id(id, cb) {
  try {
    var db = await sqlite.open("./db.sqlite");
    // Using prepared statements to prevent SQL injection attacks
    var ps = await db.prepare("select * from users where id=?");
    var user = await ps.get(id);
    await ps.finalize();
    if (!user) {
      cb(new Error('User ' + id + ' does not exist'));
    } else {
      cb(null, user);
    }
  } catch (error) {
    console.log(error);
  }
}

// Register a user in the database
async function register_user(username, password, firstname, surname) {
  try {
    var db = await sqlite.open("./db.sqlite");
    // Using prepared statements to prevent SQL injection attacks
    var ps = await db.prepare("select * from users where username=?");
    var user = await ps.get(username);
    await ps.finalize();
    // If the user doesn't exist we can then insert them
    if (!user) {
      // Hash their password before storing it.
      await bcrypt.hash(password, saltRounds, async function(err, hash) {
        var ps = await db.prepare("insert into users (username, password, firstname, surname, contributions, joindate)" +
                                   "values ( ?, ?, ?, ?, ?, ? )");

        // Format the current time in a string that can be stored in the
        // database
        var date_string = moment().format('YYYY-MM-DD');
        await ps.run(username, hash, firstname, surname, 0, date_string);
        await ps.finalize();
      });
      // If we were successful, return true
      return true;
    } else {
      // Else, return false
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

// Add a contribution to the database
async function add_contribution(title, historical_date, description, image, user_id, contribution_date) {
  try {
    var db = await sqlite.open("./db.sqlite");
    // Using prepared statements to prevent SQL injection attacks
    var ps = await db.prepare("select username from users where id=?");
    var user = await ps.get(user_id);
    await ps.finalize();

    // This code is used to serialise the historical and contribution date
    // of each contribution. The historical date is serialised into days,
    // whilst the contribution date is serialised into seconds.
    var historical = moment(historical_date, "YYYY-MM-DD");
    var cont_date  = moment(contribution_date, "HH:mm:ss-YYYY-MM-DD");
    var beginning  = moment("0000-01-01", "YYYY-MM-DD");
    var serialised_hist_date = historical.diff(moment(beginning), 'days');
    var serialised_cont_date = cont_date.diff(moment(beginning), 'seconds');

    ps = await db.prepare("insert into contributions (contributor_id, contributor_username," +
                          "contribution_date, serialised_cont_date, historical_date,"        +
                          "serialised_hist_date, title, image_source, description, likes)"   +
                          "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    await ps.run(user_id, user.username, contribution_date, serialised_cont_date,
                 historical_date, serialised_hist_date, title, image, description, 0);
    await ps.finalize();

    ps = await db.prepare("select * from contributions where contributor_id=?");
    var contributions = await ps.all(user_id);
    await ps.finalize();

    // Update the users number of contributions
    ps = await db.prepare("update users set contributions=? where id=?");
    await ps.run(contributions.length, user_id);
    await ps.finalize();

  } catch (error) {
    console.log(error);
  }
}

// Get all contributions from a user
async function get_contributions(user_id) {
  try {
    var db = await sqlite.open("./db.sqlite");
    var ps = await db.prepare("select * from contributions where contributor_id = ?");
    var contributions = await ps.all(user_id);
    await ps.finalize();
    // Format the dates in a string that is nice fir the client-side to display.
    // The contribution date is in the form "3 days ago", the historical date
    // is in the form "20th May 2019".
    await contributions.forEach(contribution => {
      var contribution_date = moment(contribution.contribution_date, "HH:mm:ss-YYYY-MM-DD");
      var historical_date   = moment(contribution.historical_date, "YYYY-MM-DD");
      contribution.contribution_date = moment(contribution_date).fromNow();
      contribution.historical_date   = moment(historical_date).format('MMMM Do YYYY');
    });
    return contributions;
  } catch (error) {
    console.log(error);
  }
}

// Get all contributions that exist in the database
async function get_all_contributions() {
  try {
    var db = await sqlite.open("./db.sqlite");
    var ps = await db.prepare("select * from contributions");
    var contributions = await ps.all();
    await ps.finalize();
    // Format the dates in a string that is nice fir the client-side to display
    await contributions.forEach(contribution => {
      var historical_date = moment(contribution.historical_date, "YYYY-MM-DD");
      contribution.historical_date = moment(historical_date).format('MMMM Do YYYY');
    });
    return contributions;
  } catch (error) {
    console.log(error);
  }
}
