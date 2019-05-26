"use strict";

var form = document.getElementById("form-structure");

async function handle_form(response) {
  const json_response = await response.json();
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

  var object = {};
  form_data.forEach((value, key) => { object[key] = value; });

  var json = JSON.stringify(object);
  fetch('/login', { method: 'POST',
                    body: json,
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  } ).then(handle_form);
});
