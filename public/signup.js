"use strict";

var form = document.getElementById("form-structure");

async function handle_form(response) {
  const json_response = await response.json();
  if (!json_response.errors) {
    window.location.href = '/login';
  } else {
    var errors = document.querySelector(".login-error");
    var html = "<ul>";
    for (var i = 0; i < json_response.errors.length; i++) {
      html += "<li>" + json_response.errors[i].msg + "</li>";
    }
    html += "</ul>";
    errors.innerHTML = html;
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
