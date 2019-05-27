"use strict";

// Send a GET request to the server
fetch('/user', { method: 'GET', credentials: 'include' } ).then(handle_user);

// Handle the response
async function handle_user(response) {
  var navbar = document.getElementById("right-navbar");
  if (response.status === 200) {
    // if a user is logged in, render 'Log out' in the top right.
    const user = await response.json();
    navbar.innerHTML = "<li>"                                                  +
                         "<a href=\"/logout\" class=\"nav-links\">Log out</a>" +
                       "</li>";
  } else {
    // If a user is not logged in, render 'Sign up' and 'Log in' in the top
    // right.
    navbar.innerHTML = "<li>"                                                  +
                         "<a href=\"/signup\" class=\"nav-links\">Sign up</a>" +
                       "</li>"                                                 +
                       "<li>"                                                  +
                         "<a href=\"/login\" class=\"nav-links\">Log in</a>"   +
                       "</li>";
  }
}
