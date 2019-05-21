"use strict";

var form = document.getElementById("form");

function handle(response) {
  console.log("Handling");
  console.log(response);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  var form_data = new FormData(form);
  var object = {};
  form_data.forEach((value, key) => { object[key] = value; });
  var json = JSON.stringify(object);
  fetch('/contribute', {
                method: 'POST',
                body: json,
                headers: { 'Content-Type': 'application/json' } }).then(handle);
});
