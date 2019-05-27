"use strict";

var username_input = document.getElementById("login-username");
username_input.focus();

var form = document.getElementById("form-structure");

async function handle_form(response) {
  const json_response = await response.json();
  if (!json_response.message) {
    // If there are no errors, the user has successfully logged in and can be
    // redirected to the home page
    window.location.href = '/';
  } else {
    var username = document.getElementById('username-error');
    var password = document.getElementById('password-error');
    var username_input = document.getElementById('login-username');

    username.innerHTML = "";
    password.innerHTML = "";

    // Place the error message in the correct place
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

// When the form is submitted
form.addEventListener("submit", function (event) {
  // Prevent the form from submitting
  event.preventDefault();

  var form_data = new FormData(form);

  var object = {};
  form_data.forEach((value, key) => { object[key] = value; });

  // stringify the json object
  var json = JSON.stringify(object);
  // Send a POST request to the server containing the form data
  fetch('/login', { method: 'POST',
                    body: json,
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  } ).then(handle_form);
});
