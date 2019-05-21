"use strict";

var form = document.getElementById("form");

async function handle(response) {
  const json_response = await response.json();
  if (!json_response.errors) {
    window.location.href = '/';
  } else {
    console.log(json_response.errors);
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  var form_data = new FormData(form);
  var object = {};
  form_data.forEach((value, key) => { object[key] = value; });
  var json = JSON.stringify(object);
  fetch('/contribute', { method: 'POST',
                         body: json,
                         headers: { 'Content-Type': 'application/json' }
                       } ).then(handle);
});
