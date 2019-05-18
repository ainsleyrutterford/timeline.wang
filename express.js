"use strict";

// Import the express module and create an express application.
var express = require('express');
var app = express();

// Import the sqlite module.
var sqlite = require("sqlite");

// Serve static files in the 'public' directory.
app.use(express.static('public'));

// Start the server on port 3000.
app.listen(3000, function() {
  console.log('Server listening on port 3000...');
});

// Example function to fetch all animals from a database. Change this to suit
// our needs.
async function fetch() {
  try {
    var db = await sqlite.open("./db.sqlite");
    var as = await db.all("select * from animals");
    console.log(as);
  } catch (error) {
    console.log(error);
  }
}

// Example function to insert an animal into a database. Change this to suit
// our needs.
async function insert() {
  try {
    var db = await sqlite.open("./db.sqlite");
    // Using prepared statements to prevent SQL injection attacks
    db.run("insert into animals values (?,?)", 64, "cat");
  } catch (error) {
    console.log(error);
  }
}

// Example function to update a single row in a database. Change this to suit
// our needs.
async function update() {
  var db = await sqlite.open("./db.sqlite");
  // Using prepared statements to prevent SQL injection attacks
  db.run("update animals set breed=? where id=?", "terrier", 42);
}
