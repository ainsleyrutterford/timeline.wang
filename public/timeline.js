"use strict";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
let dpi = window.devicePixelRatio;
let focal_length = 500;
let y_center, x_center;
let global_z;

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
  y_center = (canvas.height / 2) / dpi;
  x_center = (canvas.width  / 2) / dpi;

 // Center align text.
  ctx.textAlign = "center";
  // Large sans-serif text.
  ctx.font = 'bold 10em sans-serif';

  // Scale the context by the device pixel ratio.
  ctx.scale(dpi, dpi);
}

// Scale the canvas first.
scale_canvas();

function Text(x_3D, y_3D, z_3D, text) {
  this.x_3D = x_3D;
  this.y_3D = y_3D;
  this.z_3D = z_3D;
  this.text = text;
  this.draw = function() {
    var x = focal_length * this.x_3D/this.z_3D + x_center;
    var y = focal_length * this.y_3D/this.z_3D + y_center;
    this.z_3D -= 0.1;
    this.font_size = 20/this.z_3D;
    ctx.font = 'bold ' + this.font_size + 'em sans-serif';
    if (this.z_3D > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, ' + (100-this.z_3D)/100 + ')';
      ctx.fillText(text, x, y);
    }
  }
}

let words = [new Text( 1,  1,  80, "wong"),
             new Text( 0,  0,  90, "wing"),
             new Text(-1,  1,  70, "wung"),
             new Text(-1, -1, 100, "wang")]

// The draw() function. Calls itself repeatedly.
function draw() {
  ctx.clearRect(0,0, canvas.width, canvas.height);
  words.forEach(function(word) { word.draw(); });
  window.requestAnimationFrame(draw);
}

// Render the first frame.
window.requestAnimationFrame(draw);

// An EventListener for window resizing. The canvas must then be scaled to
// fit the window again.
window.addEventListener('resize', function(e) {
  scale_canvas();
});
