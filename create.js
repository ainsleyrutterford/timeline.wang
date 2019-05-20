"use strict";
var sqlite = require("sqlite");
create();

async function create() {
  try {

    var db = await sqlite.open("./db.sqlite");

    await db.run("PRAGMA foreign_keys = ON");

    await db.run("create table if not exists users (id INTEGER PRIMARY KEY AUTOINCREMENT, \
                                      username VARCHAR(25) UNIQUE NOT NULL,               \
                                      password VARCHAR(255) NOT NULL,                     \
                                      firstname VARCHAR(255) NOT NULL,                    \
                                      surname VARCHAR(255) NOT NULL,                      \
                                      contributions INTEGER,                              \
                                      joindate TEXT NOT NULL)");

    await db.run("create table if not exists contributions \
                    (id INTEGER PRIMARY KEY AUTOINCREMENT, \
                     contributor_id INT NOT NULL,          \
                     contribution_date TEXT NOT NULL,      \
                     title VARCHAR(80) NOT NULL,           \
                     image_source VARCHAR(255),            \
                     description VARCHAR(255),             \
                     likes INTEGER NOT NULL,               \
                     FOREIGN KEY (contributor_id) REFERENCES users(id) ON DELETE CASCADE)");

    var as = await db.all("select * from users");

    console.log(as);
  } catch (error) {
    console.log(error);
  }
}

async function insert() {
  var db = await sqlite.open("./db.sqlite");
  // Using prepared statements to prevent SQL injection attacks
  var ps = await db.prepare("insert into users (username, password, firstname, surname, contributions, joindate) \
                       values ( ?, ?, ?, ?, ?, ?)");
  await ps.run("jamesssss", "testpass2ssss", "Jamesssss", "OReillyss", 350, "2029-05-20");
}
