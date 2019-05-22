"use strict";

var moment = require('moment');

var date = moment("00:30:00-22-05-2019", "hh:mm:ss-DD-MM-YYYY");

var time = moment().format("hh:mm:ss-DD-MM-YYYY");

console.log(moment(date).fromNow());
console.log(time);
