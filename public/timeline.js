"use strict";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
let dpi = window.devicePixelRatio;
let y_center;

// Scale the canvas to be the correct resolution for the window. Also takes
// retina screens into account.
function scale_canvas() {
  // Set the canvas width to the window width times the device pixel ratio
  // which is 1 for 1080p screens and 2 for retina screens. Do the same for
  // the height.
  canvas.width = window.innerWidth * dpi;
  canvas.height = window.innerHeight * dpi;

  // Set the canvas style width and height to the same as the window width
  // and height.
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  // Recenter the y_center.
  y_center = (canvas.height/2)/dpi;

 // Center align text.
  ctx.textAlign = "center";
  // Large sans-serif text.
  ctx.font='bold 10em sans-serif';

  // Scale the context by the device pixel ratio.
  ctx.scale(dpi, dpi);
}

// Scale the canvas first.
scale_canvas();

// The text object.
var text = {
  x: canvas.width/dpi * 2,
  draw: function() {
    ctx.fillText("Fuck you", this.x, y_center);
    this.x -= 10;
    if (this.x < -canvas.width/dpi) {
      this.x = canvas.width/dpi * 2;
    }
  }
};

// The draw() function. Calls itself repeatedly.
function draw() {
  ctx.clearRect(0,0, canvas.width, canvas.height);
  text.draw();
  window.requestAnimationFrame(draw);
}

// Render the first frame.
window.requestAnimationFrame(draw);

// An EventListener for window resizing. The canvas must then be scaled to
// fit the window again.
window.addEventListener('resize', function(e) {
  scale_canvas();
});
