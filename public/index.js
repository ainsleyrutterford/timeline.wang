"use strict";

fetch('/user', { method: 'GET', credentials: 'include' } ).then(handle_user);

async function handle_user(response) {
  var navbar = document.getElementById("right-navbar");
  if (response.ok) {
    const user = await response.json();
    navbar.innerHTML += "<li class=\"navbar-right\"><a href=\"/logout\">Log out</a></li>";
  } else {
    navbar.innerHTML += "<li class=\"navbar-right\"><a href=\"/signup\">Sign up</a></li>";
    navbar.innerHTML += "<li class=\"navbar-right\"><a href=\"/login\">Log in</a></li>";
  }
}
