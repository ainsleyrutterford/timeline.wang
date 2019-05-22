"use strict";

fetch('/contributions', { method: 'GET' } ).then(handle);

async function handle(response) {
  const json_response = await response.json();
  var contributions_container = document.querySelector(".contributions");
  var html = "";
  for (var i = 0; i < json_response.length; i++) {
    html += "<div class=\"contribution\">\
               <div class=\"image-and-description\"> \
                 <img class=\"contribution-image\" src=\"" + json_response[i].image_source + "\"/> \
                 <div class=\"date-title-text\"> \
                   <div class=\"date-title\">\
                     <div class=\"historical-date\">" + json_response[i].historical_date + "</div> \
                     <div class=\"contribution-title\">" + json_response[i].title + "</div> \
                   </div>\
                   <div class=\"description\">"+ json_response[i].description +"</div> \
                 </div>\
               </div>\
               <div class=\"contribution-date\">"+ json_response[i].contribution_date +"</div> \
             </div>";
  }
  contributions_container.innerHTML += html;
}
