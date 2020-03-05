// Chrome Extension: Distraction Sub-system
// popup.js
// Created by Thanakit
// Last updated: 20/02/2020

'use strict';

// Detect clicking of popup page (popup.html)
// If it is "start", send a message to background.js to activate the system
// It it is "stop", stop background.js from re-sending an Ajax request
function click(e) {
  if (e.target.id === "start") {
	  chrome.storage.local.set({key: "activated"});
	  chrome.runtime.sendMessage({message: "Activated"});
  } else {
	  chrome.storage.local.clear();
  }
  window.close();
};

//  Checking if boxes are clicked
document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
});
