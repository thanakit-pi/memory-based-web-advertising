// Chrome Extension: Distraction Sub-system
// background.js
// Created by Thanakit
// Last updated: 20/02/2020

'use strict';
// Pop up a HTML page for receiving username upon installation
chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.create({
		url: 'C:/Users/Thanakit/Dropbox/distraction 1.2 (research)/main.html',
		active: true
	});
});

// Detect if tabs get updated -- send a message for content.js to show the ads
chrome.tabs.onUpdated.addListener(function(tabId, updateInfo, tab) {
	chrome.storage.local.get(['key'], function(result) {
		if (updateInfo.status === "complete" && result.key === "activated") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {message: "UpdateTab"});
			});
		}
	});
});

// Detect if tabs get highlighted -- Send a message for content.js to show the ads
chrome.tabs.onHighlighted.addListener(function(info) {
	chrome.storage.local.get(['key'], function(result) {
		if (result.key === "activated") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {message: "UpdateTab"});
			});
		}
	});
});

// Start the eye tracker and connect to Lisp server upon activation
chrome.runtime.onMessage.addListener(
	function(request) {
        if (request.message === "Activated") {
			StartEyeTracker();
			CommandNextImage();
		}
	}
);


// Send an Ajax request to local server to start the eye tracker
function StartEyeTracker(mode) {
	var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://localhost/research/eyetracker/eye-tracker.php", true);
    //Send the proper header information along with the request
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // Track the state changes of the request.
	xhr.onreadystatechange = function () {
		var DONE = 4; // status 4: the request is done
        var OK = 200; // status 200: a successful return
		if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
				console.log("successful");
			} else {
				console.log("failed");
			}
		} else {
			console.log("failed");
		}
	};
	xhr.send();
};


// Send an Ajax request to local server to connect to Lisp server and wait for response
// Send a new request after receiving the response
function CommandNextImage() {
    // This is the client-side script.
    var xhr = new XMLHttpRequest();
    xhr.open('POST', "http://localhost/research/command-next-image.php", true);
    //Send the proper header information along with the request
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // Track the state changes of the request.
    xhr.onreadystatechange = function () {
        var DONE = 4; // status 4: the request is done
        var OK = 200; // status 200: a successful return
        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
				chrome.storage.local.get(['key'], function (result) {
					if (result.key === "activated") {
						chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
							chrome.tabs.sendMessage(tabs[0].id, {message: "UpdateImage"});
						});
						//send message
						CommandNextImage();
					}
				});
            } else {
                console.log("CommandNextImage: FAILED");
            }
        }
    };
    xhr.send();
};