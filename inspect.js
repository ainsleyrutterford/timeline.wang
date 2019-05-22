"use strict";

var sqlite = require("sqlite");

inspect();

async function inspect() {
  try {
    var db = await sqlite.open("./db.sqlite");
    console.log("Users table:");
    var users = await db.all("select * from users");
    console.log(users);
    console.log("contributions table:");
    var contributions = await db.all("select * from contributions");
    console.log(contributions);
  } catch (error) {
    console.log(error);
  }
}
