"use strict";

var contributions = [];

fetch('/user', { method: 'GET', credentials: 'include' } ).then(handle_user);

var avatar = document.querySelector(".avatar");
var number = Math.floor(Math.random()*4)+1;
avatar.src = "avatars/avatar-" + number + ".png";

function render_contributions() {
  var contributions_container = document.getElementById("container-for-javascript");
  var html = "";
  for (var i = 0; i < contributions.length; i++) {
    html += "<div class=\"contribution\">"                                                           +
               "<div class=\"image-and-description\">"                                               +
                 "<img class=\"contribution-image\" src=\"" + contributions[i].image_source + "\"/>" +
                 "<div class=\"date-title-text\">"                                                   +
                   "<div class=\"date-title\">"                                                      +
                     "<div class=\"historical-date\">" + contributions[i].historical_date + "</div>" +
                     "<div class=\"contribution-title\">" + contributions[i].title + "</div>"        +
                   "</div>"                                                                          +
                   "<div class=\"description\">"+ contributions[i].description +"</div>"             +
                 "</div>"                                                                            +
               "</div>"                                                                              +
               "<div class=\"contribution-date\">"+ contributions[i].contribution_date +"</div>"     +
             "</div>";
  }
  if (contributions.length === 0) {
    html = "<div id=\"no-contributions\">You have no contributions</div>";
  }
  contributions_container.innerHTML = html;
}

async function handle_contributions(response) {
  contributions = await response.json();
  render_contributions();
}

async function handle_user(response) {
  if (response.status === 200) {
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
          title_error.innerHTML = "Titles must be less than 50 characters";
          break;
        case ("description_min"):
          description_error.innerHTML = "Please enter a description";
          break;
        case ("description_max"):
          description_error.innerHTML = "Maximum 450 characters";
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
    var title_input = document.getElementById("title-textbox");
    title_input.focus();
  }
};

var form = document.getElementById("form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var image_error = document.getElementById("image-error");
  var date_error = document.getElementById("date-error");
  image_error.innerHTML = "";
  date_error.innerHTML = "";

  var file   = document.querySelector('input[type=file]').files[0];
  var reader = new FileReader();

  var date = document.getElementById('date-textbox');
  if (moment(date.value).diff(moment("1825-12-31", "YYYY-MM-DD"), 'days') < 1) {
    date_error.innerHTML = "Earliest 01/01/1826";
    return;
  }

  reader.addEventListener("load", function () {
    var image = reader.result;
    image = image.split(","); // removing the "data:image/png;base64,"

    if ((image[0] !== "data:image/png;base64") && (image[0] !== "data:image/jpeg;base64")) {
      var error = document.getElementById("image-error");
      error.innerHTML = "Should be .png .jpg .jpeg";
      return;
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
var image_text = document.getElementById("image-text");

file_upload.addEventListener("change", function () {
  var file_name= document.querySelector('input[type=file]').files[0].name;
  image_text.innerHTML = file_name;
});

var text_box = document.getElementById("description-textbox");

text_box.addEventListener('input', function () {
  var length = this.value.length;

  var current = document.getElementById("current");
  var maximum = document.getElementById("maximum");
  current.innerHTML = length;

  if (length > 450) {
    current.style.color = "#ff4f4f";
    maximum.style.color = "#ff4f4f";
  } else {
    current.style.color = "white";
    maximum.style.color = "white";
  }
});

text_box.addEventListener('keydown', function (event) {
  if (event.keyCode == 13) {
    event.preventDefault();
    var submit = document.getElementById("form-submit");
    submit.click();
  }
});

var sort_by_historical = document.getElementById("hist-date-button");

sort_by_historical.addEventListener('click', function (event) {
  sort_contributions('historical');
  render_contributions();
});

var sort_by_contribution = document.getElementById("cont-date-button");

sort_by_contribution.addEventListener('click', function (event) {
  sort_contributions('contribution');
  render_contributions();
});

function sort_contributions(sort_by) {
  if (sort_by == 'historical') {
    contributions.sort(function(a, b) {
      return a.serialised_hist_date - b.serialised_hist_date;
    });
  } else if (sort_by == 'contribution') {
    contributions.sort(function(a, b) {
      return a.serialised_cont_date - b.serialised_cont_date;
    });
  }
}
