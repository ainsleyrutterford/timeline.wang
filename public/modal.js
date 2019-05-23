"use strict";

var form = document.getElementById("form");

async function handle(response) {
  const json_response = await response.json();
  if (!json_response.errors) {
    window.location.href = '/';
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

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var file   = document.querySelector('input[type=file]').files[0];
  var reader = new FileReader();

  reader.addEventListener("load", function () {
    var image = reader.result;
    image = image.split(","); // removing the "data:image/png;base64,"

    var form_data = new FormData(form);
    form_data.append('image', image[1]);

    var object = {};
    form_data.forEach((value, key) => { object[key] = value; });

    var json = JSON.stringify(object);
    fetch('/contribute', { method: 'POST',
                           body: json,
                           headers: { 'Content-Type': 'application/json' },
                           credentials: 'include'
                         } ).then(handle);
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
});
