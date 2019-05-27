"use strict";

// Send a GET request requesting all contributions in the database
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
let speed = 0.1;
let space = 1;
let multiplier = 1;
let serial_date;

// Handle the request response
async function handle(response) {
  const json_response = await response.json();

  // Sort the contributions returned in the response
  var sorted = json_response.sort(function(a, b) {
    return b.serialised_hist_date - a.serialised_hist_date;
  });
  // Find the earliest and latest contribution (by historical date)
  earliest = sorted[json_response.length - 1].serialised_hist_date;
  latest = sorted[0].serialised_hist_date;

  // Create a Contribution object for each contribution received
  for (var i = 0; i < json_response.length; i++) {
    var r = json_response[i];
    // Split the description into multiple lines, each short enough to
    // fit in one contribution card
    var descriptions = get_lines(ctx, r.description, 7600);
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
  canvas.height = (window.innerHeight - 6) * dpi;

  // Set the canvas style width and height to the same as the window width
  // and height.
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = (window.innerHeight - 6) + "px";

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
// This function will split a string into multiple strings, with each string
// being shorter than the max_width specified. It is used to 'wrap' text
// as there is no function provided by javascript to do so.
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

// The Contribution object constructor
function Contribution(title, historical_date, serial_date, descriptions, image_source, contributor_username) {
  // Create random x and y coordinates.
  this.x_3D   = (Math.random() * 14) - 7;
  this.y_3D   = (Math.random() * 14) - 9;
  // Calculate the z coordinates from the serial date of the contribution.
  // This also relies on what the earliest and latest contributions are.
  this.z_3D   = (((serial_date - earliest) / (latest - earliest)) * 600) + 70;
  this.title  = title;
  this.date   = historical_date;
  this.user   = contributor_username;

  this.descriptions = descriptions;

  // Create an image from the source url in the database.
  const image = new Image();
  image.src   = image_source;

  // This is the draw function called every frame for each contribution
  this.draw = function() {
    // Calculate the relative x, y, and z coordinates compared to the camera
    var relative_x = this.x_3D - camera_x;
    var relative_y = this.y_3D - camera_y;
    var relative_z = this.z_3D - camera_z;
    // Calculating the x and y coordinates on the 2D screen given the 3D
    // coordinates
    var x = focal_length * (relative_x / relative_z) + x_center;
    var y = focal_length * (relative_y / relative_z) + y_center;

    // If the contribution isn't too close or behing you
    if (relative_z > 0.1) {
      // The font size is inversely proportional to the relative_z
      ctx.font = 'bold ' + 20 / relative_z + 'em sans-serif';
      // So is the alpha. Scale it between 1 and 0. If it is negative,
      // it is just 0
      var alpha = (100 - relative_z) / 100;
      ctx.globalAlpha = (alpha < 0) ? 0 : alpha;
      // The size of the different componenets of the contribution card are
      // inversely proportional to the relative_z
      var size = 2600 / relative_z;
      ctx.fillStyle = '#bbb';
      // Draw the card behind the contribution
      ctx.fillRect(x - size * 1.05, y - size * 0.05, size * 5.5, size * 1.1);
      ctx.fillStyle = 'black';
      // Draw the image
      ctx.drawImage(image, x - size, y, size, size);
      // Draw the historical date
      ctx.fillText(historical_date, x + (250 / relative_z), y + (250 / relative_z));
      // Draw the title
      ctx.fillText(title, x + ctx.measureText(historical_date).width + 2 * (250 / relative_z), y + (250 / relative_z));
      ctx.font = 'bold ' + 14 / relative_z + 'em sans-serif';
      // Draw the description lines
      this.descriptions.forEach((description, index) => {
        ctx.fillText(description, x + (250 / relative_z), y + ((630 + (index) * 370) / relative_z));
      });
    }
  };
}

// Draw the year in the top left corner
function draw_year() {
  // Calculate the serial date that the camera's z position corresponds to
  serial_date = ((((camera_z / multiplier) - 70)/600) * (latest - earliest)) + earliest;
  // Convert the date from the serialised format back to a nice format "May 2019".
  var new_date = moment("0000-01-01", "YYYY-MM-DD").add(Math.floor(serial_date), 'days');
  ctx.font = 'bold 2em sans-serif';
  ctx.globalAlpha = 0.7;
  ctx.textAlign = "right";
  // Draw the date
  ctx.fillText(new_date.format("MMMM YYYY"), 250, 35);
}

// Draw the help alerts in the top right corner
function draw_help() {
  ctx.font = 'bold 1em sans-serif';
  ctx.globalAlpha = 0.5;
  ctx.fillText('esc to exit', canvas.width/dpi - 13, 20);
  ctx.fillText('up/down arrows change speed', canvas.width/dpi - 13, 40);
  ctx.fillText('left/right arrows change spread', canvas.width/dpi - 13, 60);
  ctx.fillText('scroll to scrub through time', canvas.width/dpi - 13, 80);
  ctx.fillText('mouse to move camera', canvas.width/dpi - 13, 100);
  ctx.fillText('space to pause', canvas.width/dpi - 13, 120);
  ctx.textAlign = "left";
}

// Draw the timeline at the bottom of the screen
function draw_timeline() {
  var size = canvas.width/dpi * 0.75;
  var start = x_center - size/2;
  var finish = x_center - size/2 + size;
  ctx.fillRect(0, canvas.height/dpi - 30, canvas.width/dpi, 6);
  ctx.globalAlpha = 1;
  // Calculate where the position marker should be on the screen
  var position = start + (((serial_date - earliest) / (latest - earliest)) * size);
  ctx.fillRect(position - 3, canvas.height/dpi - 30, 6, 6);
}

// The draw() function. Calls itself repeatedly.
function draw() {
  // Draw the radial gradient
  var gradient = ctx.createRadialGradient(x_center, y_center, 0, x_center, y_center, 1000);
  gradient.addColorStop(0, "#555");
  gradient.addColorStop(1, "#111");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  // Draw each contribution
  contributions.forEach(contribution => contribution.draw());
  if (!paused) {
    // If not paused, move the camera forward
    camera_z += speed;
  }
  ctx.fillStyle = 'white';
  draw_year();
  draw_help();
  draw_timeline();
  // Call draw again
  window.requestAnimationFrame(draw);
}

// An EventListener for window resizing. The canvas must then be scaled to
// fit the window again.
window.addEventListener('resize', function(e) {
  scale_canvas();
});

// An EventListener for scrolling
window.addEventListener('wheel', function(e) {
  // Increase or decrease the camera_z
  camera_z += e.deltaY / 50;
});

// An EventListener for mouse movement
window.addEventListener('mousemove', function (e) {
  // Move the camera_x and camera_y positions between -10 and 10
  var rect = canvas.getBoundingClientRect();
  var mouse_x = e.clientX - rect.left;
  var mouse_y = e.clientY - rect.top ;
  const width  = canvas.width  / dpi;
  const height = canvas.height / dpi;
  camera_x = -10 + 20 * (width  - mouse_x) / width ;
  camera_y = -10 + 20 * (height - mouse_y) / height;
});

// Use keydown for pausing as it feels more responsive.
window.addEventListener('keydown', function(e) {
  // We use a switch statement incase we want to add any functionality
  // later on.
  switch (e.keyCode) {
    case 32: // Spacebar
      // toggle pause
      paused = !paused;
      break;
    case 37: // Left arrow
      // increase spread
      camera_z *= 1.015;
      contributions.forEach(contribution => {
        contribution.z_3D *= 1.015;
      });
      multiplier *= 1.015;
      break;
    case 38: // Up arrow
      // increase speed
      speed += 0.02;
      break;
    case 39: // Right arrow
      // decrease spread
      camera_z *= 0.985;
      contributions.forEach(contribution => {
        contribution.z_3D *= 0.985;
      });
      multiplier *= 0.985;
      break;
    case 40: // Down arrow
      // decrease speed
      speed -= 0.02;
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
