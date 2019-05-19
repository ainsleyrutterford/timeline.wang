"use strict";
var sqlite = require("sqlite");
var db;
create();

async function create() {
  try {
    db = await sqlite.open("./db.sqlite");
    await db.run("create table users (id, username, password)");
    await db.run("insert into users values (1, 'ainsley', 'testpass')");
    await db.run("insert into users values (2, 'james', 'testpass2')");
    var as = await db.all("select * from users");
    console.log(as);
  } catch (error) {
    console.log(error);
  }
}
