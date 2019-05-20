"use strict";
var sqlite = require("sqlite");
var db;
create();

async function create() {
  try {
    db = await sqlite.open("./db.sqlite");
    await db.run("create table users (id INTEGER PRIMARY KEY AUTOINCREMENT, username varchar(255) NOT NULL, password varchar(255) NOT NULL)");
    await db.run("insert into users (username, password) values ('ainsley', 'testpass' )");
    await db.run("insert into users (username, password) values ('james'  , 'testpass2')");
    var as = await db.all("select * from users");
    console.log(as);
  } catch (error) {
    console.log(error);
  }
}
