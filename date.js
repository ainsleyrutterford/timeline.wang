"use strict";

var moment = require('moment');

var date = moment("00:30:00-20-05-2019", "hh:mm:ss-DD-MM-YYYY");

var time = moment("0000-01-01", "YYYY-MM-DD");

console.log(time.diff(moment(date), 'days'));
