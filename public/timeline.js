"use strict";

fetch('/all_contributions', { method: 'GET', credentials: 'include' } ).then(handle);

let contributions = [];
let earliest, latest;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
let dpi = window.devicePixelRatio;
let focal_length = 500;
let y_center, x_center;
let camera_x = 0, camera_y = 0, camera_z = 0;
let paused = false;

async function handle(response) {
  const json_response = await response.json();

  var sorted = json_response.sort(function(a, b) {
    return a.serialised_hist_date - b.serialised_hist_date;
  });
  earliest = sorted[0].serialised_hist_date;
  latest = sorted[json_response.length - 1].serialised_hist_date;

  for (var i = 0; i < json_response.length; i++) {
    var r = json_response[i];
    var descriptions = get_lines(ctx, r.description, 6000);
    contributions.push(new Contribution(r.title,
                                        r.historical_date,
                                        r.serialised_hist_date,
                                        descriptions,
                                        r.image_source,
                                        r.contributor_username));
  }
  // Render the first frame.
  window.requestAnimationFrame(draw);
}

// Scale the canvas to be the correct resolution for the window. Also takes
// retina screens into account.
function scale_canvas() {
  // Set the canvas width to the window width times the device pixel ratio
  // which is 1 for 1080p screens and 2 for retina screens. Do the same for
  // the height.
  canvas.width = window.innerWidth * dpi;
  canvas.height = (window.innerHeight - 5) * dpi;

  // Set the canvas style width and height to the same as the window width
  // and height.
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = (window.innerHeight - 5) + "px";

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

// function taken from an answer from:
// https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
function get_lines(ctx, text, max_width) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
    var word = words[i];
    var width = ctx.measureText(currentLine + " " + word).width;
    if (width < max_width) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function Contribution(title, historical_date, serial_date, descriptions, image_source, contributor_username) {
  console.log(title);
  this.x_3D   = (Math.random() * 2) - 1;
  this.y_3D   = (Math.random() * 2) - 1;
  this.z_3D   = (((serial_date - earliest) / (latest - earliest)) * 100) + 70;
  this.title  = title;
  this.date   = historical_date;
  this.user   = contributor_username;

  this.descriptions = descriptions;

  const image = new Image();
  image.src   = image_source;

  this.draw = function() {
    var relative_x = this.x_3D - camera_x;
    var relative_y = this.y_3D - camera_y;
    var relative_z = this.z_3D - camera_z;
    var x = focal_length * (relative_x / relative_z) + x_center;
    var y = focal_length * (relative_y / relative_z) + y_center;

    if (relative_z > 0.1) {
      ctx.font = 'bold ' + 20 / relative_z + 'em sans-serif';
      var alpha = (100 - relative_z) / 100;
      ctx.globalAlpha = (alpha < 0) ? 0 : alpha;
      var size = 2000 / relative_z;
      ctx.drawImage(image, x - size, y, size, size);
      ctx.fillText(historical_date, x + (250 / relative_z), y + (250 / relative_z));
      ctx.fillText(title, x + ctx.measureText(historical_date).width + 2 * (250 / relative_z), y + (250 / relative_z));
      ctx.font = 'bold ' + 14 / relative_z + 'em sans-serif';
      this.descriptions.forEach((description, index) => {
        ctx.fillText(description, x + (250 / relative_z), y + ((630 + (index) * 370) / relative_z));
      });
    }
  };
}

function draw_positions() {
  ctx.font = 'bold 0.8em sans-serif';
  ctx.globalAlpha = 1;
  ctx.fillText('camera x: ' + camera_x.toFixed(2), 9, 18);
  ctx.fillText('camera y: ' + camera_y.toFixed(2), 9, 35);
  ctx.fillText('camera z: ' + camera_z.toFixed(2), 9, 52);
}

function draw_year() {
  var serial_date = (((camera_z - 40)/100) * (latest - earliest)) + earliest;
  var new_date = moment("0000-01-01", "YYYY-MM-DD").add(Math.floor(serial_date), 'days');
  ctx.font = 'bold 2em sans-serif';
  ctx.globalAlpha = 1;
  ctx.textAlign = "right";
  ctx.fillText(new_date.format("MMMM YYYY"), 250, 35);
  ctx.textAlign = "left";
}

// The draw() function. Calls itself repeatedly.
function draw() {
  var gradient = ctx.createRadialGradient(x_center, y_center, 0, x_center, y_center, 500);
  gradient.addColorStop(0, "white");
  gradient.addColorStop(1, "#eff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  contributions.forEach(contribution => contribution.draw());
  if (!paused) {
    camera_z += 0.1;
  }
  // draw_positions();
  draw_year();
  window.requestAnimationFrame(draw);
}

// An EventListener for window resizing. The canvas must then be scaled to
// fit the window again.
window.addEventListener('resize', function(e) {
  scale_canvas();
});

window.addEventListener('wheel', function(e) {
  camera_z += e.deltaY / 50;
});

window.addEventListener('mousemove', function (e) {
  var rect = canvas.getBoundingClientRect();
  var mouse_x = e.clientX - rect.left;
  var mouse_y = e.clientY - rect.top ;
  const width  = canvas.width  / dpi;
  const height = canvas.height / dpi;
  camera_x = -2 + 4 * (width  - mouse_x) / width ;
  camera_y = -2 + 4 * (height - mouse_y) / height;
});

// Use keydown for pausing as it feels more responsive.
window.addEventListener('keydown', function(e) {
  // We use a switch statement incase we want to add any functionality
  // later on.
  switch (e.keyCode) {
    case 32: // Spacebar
      paused = !paused;
      break;
    default:
      break;
  }
});

// Keydown does not work for the escape buttons so we use keyup in this case.
window.addEventListener('keyup', function(e) {
  switch (e.keyCode) {
    case 27: // Escape
      window.location.href = '/';
      break;
    default:
      break;
  }
});
