"use strict";
var sqlite = require("sqlite");
var db;
create();

async function create() {
  try {
    db = await sqlite.open("./db.sqlite");
    await db.run("create table animals (id, breed)");
    await db.run("insert into animals values (42,'dog')");
    await db.run("insert into animals values (53,'fish')");
    var as = await db.all("select * from animals");
    console.log(as);
  } catch (error) {
    console.log(error);
  }
}
