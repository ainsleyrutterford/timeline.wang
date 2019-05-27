window.onclick = function(event) {
  var logo = document.getElementById("wanglogo-container");
  var links = document.querySelector(".nav-links");
  var subnav = document.querySelector(".sub-navbar");
  var jsmenu = document.getElementById("js-menu");
  var seethru = document.getElementById("seethrough-navbar");
  var rightnav = document.getElementById("right-navbar");
  if (event.target !== logo    &&
      event.target !== links   &&
      event.target !== subnav  &&
      event.target !== jsmenu  &&
      event.target !== seethru &&
      event.target !== rightnav) {
    window.location.href = '/timeline';
  }
};

window.addEventListener("keydown", function (event) {
  if ((event.keyCode >= 65 && event.keyCode <=90) || event.keyCode === 32) {
    window.location.href = '/timeline';
  }
});
