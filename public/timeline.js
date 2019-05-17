"use strict";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
let dpi = window.devicePixelRatio;
let focal_length = 500;
let y_center, x_center;
let global_z = 0;

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
  canvas.style.width = (window.innerWidth-5) + "px";
  canvas.style.height = (window.innerHeight-5) + "px";

  // Recenter the y_center.
  y_center = (canvas.height / 2) / dpi;
  x_center = (canvas.width  / 2) / dpi;

  // Center align text.
  ctx.textAlign = "left";
  // Large sans-serif text.
  ctx.font = 'bold 10em sans-serif';

  // Scale the context by the device pixel ratio.
  ctx.scale(dpi, dpi);
}

// Scale the canvas first.
scale_canvas();

function Entry(x_3D, y_3D, z_3D, text, source) {
  this.x_3D   = x_3D;
  this.y_3D   = y_3D;
  this.z_3D   = z_3D;
  this.text   = text;

  const image = new Image();
  image.src   = source;

  this.draw = function() {
    var relative_z = this.z_3D - global_z;
    var x = focal_length * (this.x_3D / relative_z) + x_center;
    var y = focal_length * (this.y_3D / relative_z) + y_center;

    if (relative_z > 0) {
      ctx.font = 'bold ' + 20 / relative_z + 'em sans-serif';
      var alpha = (100 - relative_z) / 100;
      ctx.globalAlpha = (alpha < 0) ? 0 : alpha;
      var size = 200 / relative_z;
      ctx.drawImage(image, x - size, y - size, size, size);
      ctx.fillText(text, x, y);
    }
  }
}

let entries = [new Entry( 1,  1, 100, "apple", "apple.png"),
               new Entry( 0,  0, 110, "amazon", "amazon.png"),
               new Entry(-1,  1, 120, "twitter", "twitter.png"),
               new Entry(-1, -1, 130, "wang", "amazon.png")]

// The draw() function. Calls itself repeatedly.
function draw() {
  ctx.clearRect(0,0, canvas.width, canvas.height);
  entries.forEach(function(entry) { entry.draw(); });
  global_z += 0.1;
  window.requestAnimationFrame(draw);
}

// Render the first frame.
window.requestAnimationFrame(draw);

// An EventListener for window resizing. The canvas must then be scaled to
// fit the window again.
window.addEventListener('resize', function(e) {
  scale_canvas();
});

window.addEventListener('wheel', function(e) {
  const delta = Math.sign(e.deltaY);
  global_z += (delta/10);
});
