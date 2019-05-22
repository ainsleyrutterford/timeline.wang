"use strict";

fetch('/user',          { method: 'GET' } ).then(handle_user);

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
    var navbar = document.querySelector(".navbar");
    var name = document.querySelector(".name");
    var username = document.querySelector(".username");
    var contributions = document.querySelector(".number-contributions");
    var date = document.querySelector(".date-joined");

    title.innerHTML = user.username;
    navbar.innerHTML += "<li class=\"navbar-right\"><a href=\"/logout\">Log out</a></li>";
    name.innerHTML = user.firstname + " " + user.surname;
    username.innerHTML = user.username;
    contributions.innerHTML += user.contributions + " contributions";
    date.innerHTML += "Member since " + user.joindate;

    fetch('/contributions', { method: 'GET' } ).then(handle_contributions);
  } else {
    window.location.href = '/login';
  }
}
