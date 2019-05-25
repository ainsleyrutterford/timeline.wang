"use strict";

fetch('/user', { method: 'GET', credentials: 'include' } ).then(handle_user);

var avatar = document.querySelector(".avatar");
var number = Math.floor(Math.random()*4)+1;
avatar.src = "avatars/avatar-" + number + ".png";

async function handle_contributions(response) {
  const json_response = await response.json();
  var contributions_container = document.querySelector(".contributions");
  var html = "";
  for (var i = 0; i < json_response.length; i++) {
    html += "<div class=\"contribution\">\
               <div class=\"image-and-description\"> \
                 <img class=\"contribution-image\" src=\"" + json_response[i].image_source + "\"/> \
                 <div class=\"date-title-text\"> \
                   <div class=\"date-title\">\
                     <div class=\"historical-date\">" + json_response[i].historical_date + "</div> \
                     <div class=\"contribution-title\">" + json_response[i].title + "</div> \
                   </div>\
                   <div class=\"description\">"+ json_response[i].description +"</div> \
                 </div>\
               </div>\
               <div class=\"contribution-date\">"+ json_response[i].contribution_date +"</div> \
             </div>";
  }
  contributions_container.innerHTML += html;
}

async function handle_user(response) {
  if (response.ok) {
    const user = await response.json();

    var title = document.querySelector("title");
    var name = document.querySelector(".name");
    var username = document.querySelector(".username");
    var contributions = document.querySelector(".number-contributions");
    var date = document.querySelector(".date-joined");

    title.innerHTML = user.username;
    name.innerHTML = user.firstname + " " + user.surname;
    username.innerHTML = user.username;
    contributions.innerHTML += user.contributions + " contributions";
    date.innerHTML += "Member since " + user.joindate;

    fetch('/contributions', { method: 'GET', credentials: 'include' } ).then(handle_contributions);
  } else {
    window.location.href = '/login';
  }
}

async function handle_form(response) {
  const json_response = await response.json();
  if (!json_response.errors) {
    window.location.href = '/profile';
  } else {
    // var form = document.getElementById("form");
    // var html = "<div id=\"errors-container\"><ul id=\"error-list\">";
    // for (var i = 0; i < json_response.errors.length; i++) {
    //   html += "<li class=\"error-response\">" + json_response.errors[i].msg + "</li>";
    // }
    // html += "</ul></div>";
    // form.innerHTML = html + form.innerHTML;

    // All of the text above will be changed so removed it for now.
    var title_error = document.getElementById("title-error");
    var date_error = document.getElementById("date-error");
    var description_error = document.getElementById("description-error");

    title_error.innerHTML = "";
    date_error.innerHTML = "";
    description_error.innerHTML = "";

    for (var i = 0; i < json_response.errors.length; i++) {
      switch (json_response.errors[i].msg) {
        case ("title_min"):
          title_error.innerHTML = "Please enter a title";
          break;
        case ("title_max"):
          title_error.innerHTML = "Titles must be less than 40 characters";
          break;
        case ("description_min"):
          description_error.innerHTML = "Please enter a description";
          break;
        case ("description_max"):
          description_error.innerHTML = "Maximum 300 characters";
          break;
        case ("date"):
          date_error.innerHTML = "Please enter a date";
          break;
        default:
          break;
      }
    }
  }
}

var modal = document.getElementById("modal-id");
var button = document.getElementById("contribution-button");

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  } else if (event.target.id == button.id || event.target.parentNode.id == button.id) {
    // had to use id as it wasn't working otherwise.
    modal.style.display = "block";
  }
}

var form = document.getElementById("form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var image_error = document.getElementById("image-error");
  image_error.innerHTML = "";

  var file   = document.querySelector('input[type=file]').files[0];
  var reader = new FileReader();

  reader.addEventListener("load", function () {
    var image = reader.result;
    image = image.split(","); // removing the "data:image/png;base64,"

    if ((image[0] !== "data:image/png;base64") && (image[0] !== "data:image/jpeg;base64")) {
      var error = document.getElementById("image-error");
      error.innerHTML = "Should be .png .jpg .jpeg";
    }

    var form_data = new FormData(form);
    form_data.append('image', image[1]);

    var object = {};
    form_data.forEach((value, key) => { object[key] = value; });

    var json = JSON.stringify(object);
    fetch('/contribute', { method: 'POST',
                           body: json,
                           headers: { 'Content-Type': 'application/json' },
                           credentials: 'include'
                         } ).then(handle_form);
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  } else {
    var error = document.getElementById("image-error");
    error.innerHTML = "Please select an image";
  }
});

var file_upload = document.getElementById("custom-file-upload");

file_upload.addEventListener("change", function () {
  var file_name= document.querySelector('input[type=file]').files[0].name;
  file_upload.innerHTML = "<input type=\"file\" name=\"image\">" + file_name;
});
