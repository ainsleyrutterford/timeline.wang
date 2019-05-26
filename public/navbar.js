"use strict";

fetch('/user', { method: 'GET', credentials: 'include' } ).then(handle_user);

async function handle_user(response) {
  var navbar = document.getElementById("right-navbar");
  if (response.ok) {
    const user = await response.json();
    navbar.innerHTML = "<li>"                                                  +
                         "<a href=\"/logout\" class=\"nav-links\">Log out</a>"       +
                       "</li>";
  } else {
    navbar.innerHTML = "<li>"                                                  +
                         "<a href=\"/signup\" class=\"nav-links\">Sign up</a>" +
                       "</li>"                                                 +
                       "<li>"                                                  +
                         "<a href=\"/login\" class=\"nav-links\">Log in</a>"   +
                       "</li>";
  }
}
