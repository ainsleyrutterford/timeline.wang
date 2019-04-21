"use strict";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
let dpi = window.devicePixelRatio;

canvas.width = window.innerWidth * dpi;
canvas.height = window.innerHeight * dpi;
canvas.style.width = window.innerWidth + "px";
canvas.style.height = window.innerHeight + "px";

ctx.textAlign = "center";
ctx.font='bold 10em sans-serif';

ctx.scale(dpi, dpi);

var text = {
  x: canvas.width/dpi * 2,
  y: (canvas.height/2)/dpi,
  draw: function() {
    ctx.fillText("Fuck you", this.x, this.y);
    this.x -= 10;
    if (this.x < -canvas.width/dpi) {
      this.x = canvas.width/dpi * 2;
    }
  }
};

function draw() {
  ctx.clearRect(0,0, canvas.width, canvas.height);
  text.draw();

  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
