"use strict";

var firstname_input = document.getElementById("signup-firstname");
firstname_input.focus();

var form = document.getElementById("form-structure");

async function handle_form(response) {
  const json_response = await response.json();
  if (!json_response.errors) {
    // If there are no errors, send the user to the login page so they can
    // now login
    window.location.href = '/login';
  } else {
    var firstname = document.getElementById('firstname-error');
    var surname = document.getElementById('surname-error');
    var username = document.getElementById('username-error');
    var password = document.getElementById('password-error');

    firstname.innerHTML = "";
    surname.innerHTML = "";
    username.innerHTML = "";
    password.innerHTML = "";

    // For each error, place the appropriate error message in the correct
    // place
    json_response.errors.forEach((res) => {
      switch (res.msg) {
        case 'firstname':
          firstname.innerHTML = "Please enter a first name";
          break;
        case 'surname':
          surname.innerHTML = "Please enter a surname";
          break;
        case 'username':
          username.innerHTML = "Please enter a username";
          break;
        case 'password':
          password.innerHTML = "Password must be 5 or more characters";
          break;
        case 'alreadyexists':
          username.innerHTML = "Username already exists";
          break;
        default:
          break;
      }
    });
  }
}

// When the form submit button is pressed
form.addEventListener("submit", function (event) {
  event.preventDefault();

  var form_data = new FormData(form);

  var object = {};
  form_data.forEach((value, key) => { object[key] = value; });

  // stringify the json
  var json = JSON.stringify(object);
  // Send a POST request to the server containing the form data as json
  fetch('/signup', { method: 'POST',
                     body: json,
                     headers: { 'Content-Type': 'application/json' },
                     credentials: 'include'
                   } ).then(handle_form);
});
