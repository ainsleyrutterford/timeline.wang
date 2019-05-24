"use strict";

console.log("Started");
var form = document.getElementById("form");

async function handle_form(response) {
  const json_response = await response.json();
  console.log(json_response);
  if (!json_response.message) {
    window.location.href = '/';
  } else {
    var errors = document.querySelector(".login-error");
    errors.innerHTML = json_response.message;
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var form_data = new FormData(form);

  console.log("hello");

  var object = {};
  form_data.forEach((value, key) => { object[key] = value; });

  console.log("hello2");

  var json = JSON.stringify(object);
  console.log(json);
  fetch('/login', { method: 'POST',
                    body: json,
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  } ).then(handle_form);
});
