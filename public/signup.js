"use strict";

var firstname_input = document.getElementById("signup-firstname");
firstname_input.focus();

var form = document.getElementById("form-structure");

async function handle_form(response) {
  const json_response = await response.json();
  if (!json_response.errors) {
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

    json_response.errors.forEach((res) => {
      switch (res.msg) {
        case 'firstname':
          firstname.innerHTML = "Please enter a first name"
          break;
        case 'surname':
          surname.innerHTML = "Please enter a surname"
          break;
        case 'username':
          username.innerHTML = "Please enter a username"
          break;
        case 'password':
          password.innerHTML = "Password must be 5 or more characters"
          break;
      }
    });
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var form_data = new FormData(form);

  var object = {};
  form_data.forEach((value, key) => { object[key] = value; });

  var json = JSON.stringify(object);
  fetch('/signup', { method: 'POST',
                     body: json,
                     headers: { 'Content-Type': 'application/json' },
                     credentials: 'include'
                   } ).then(handle_form);
});
