"use strict";

fetch('/contributions', { method: 'GET' } ).then(handle);

async function handle(response) {
  const json_response = await response.json();
  if (!json_response.errors) {
  } else {
    var errors_container = document.querySelector(".errors-container");
    var html = "<ul>";
    for (var i = 0; i < json_response.errors.length; i++) {
      html += "<li>" + json_response.errors[i].msg + "</li>";
    }
    html += "</ul>";
    errors_container.innerHTML = html;
  }
}
