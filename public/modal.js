"use strict";

var form = document.getElementById("form");

async function handle(response) {
  const json_response = await response.json();
  if (!json_response.errors) {
    window.location.href = '/';
  } else {
    console.log(json_response.errors);
    var errors_container = document.querySelector(".errors-container");
    var html = "<ul>";
    for (var i = 0; i < json_response.errors.length; i++) {
      html += "<li>" + json_response.errors[i].msg + "</li>";
    }
    html += "</ul>";
    errors_container.innerHTML = html;
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
