"use strict";

var username_input = document.getElementById("login-username");
username_input.focus();

var form = document.getElementById("form-structure");

async function handle_form(response) {
  const json_response = await response.json();
  if (!json_response.message) {
    window.location.href = '/';
  } else {
    var username = document.getElementById('username-error');
    var password = document.getElementById('password-error');
    var username_input = document.getElementById('login-username');

    username.innerHTML = "";
    password.innerHTML = "";

    switch (json_response.message) {
      case 'Missing credentials':
        if (username_input.value === '') {
          username.innerHTML = "Please enter a username";
        } else {
          password.innerHTML = "Please enter a password";
        }
        break;
      case 'username':
        username.innerHTML = "Username does not exist";
        break;
      case 'password':
        password.innerHTML = "Incorrect password";
        break;
      default:
        break;
    }
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
