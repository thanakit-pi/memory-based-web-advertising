// Chrome Extension: Distraction Sub-system
// content.js
// Created by Thanakit
// Last updated: 20/02/2020

// Assign URL for the result
const url = chrome.runtime.getURL('result.txt');

// Get a text from result.txt, after receiving the message from background.js
// Get a text from local storage and match the output from result.txt
// If it is image update and the texts do not match, update the image with the new result
// If it is tab update, update the image with the result in local storage
chrome.runtime.onMessage.addListener(
    function(request) {
        if (request.message === "UpdateImage") {
			fetch(url).then(r => r.text()).then(function (chunk) {
				//console.log("Result: " + chunk);
				chrome.storage.local.get(['result'], function (response) {
					//console.log("Storage: " + response.result);
					if ((response.result !== "" && response.result !== chunk) || response.result == 'undefined') {
						GetImage(chunk);
						chrome.storage.local.set({'result': chunk});
					}
				});
			});
        } else if (request.message === "UpdateTab") {
			chrome.storage.local.get(['result'], function (response) {
				//console.log("Storage: " + response.result);
				if (response.result !== "" || response.result == 'undefined') {
					GetImage(response.result);
				}
			});
		}
    }
);

// Send an Ajax request to get the URL from local database
function GetImage(chunk) {
    // This is the client-side script.
    var entry = "text=" + chunk;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', "http://localhost/research/get-image.php", true);
    //Send the proper header information along with the request
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // Track the state changes of the request.
    xhr.onreadystatechange = function () {
        var DONE = 4; // status 4: the request is done
        var OK = 200; // status 200: a successful return
        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
				if (!!xhr.responseText) ShowImage(xhr.responseText);
            } else {
                console.log("GetImage: FAILED");
            }
        }
    };
	
    // Send the request to send-data.php
    xhr.send(entry);
};

// Replace the old image on current page with the new one
function ShowImage(response) {
	let banner = document.getElementById("ads-banner");
	if (banner !== null) {
		banner.remove();
	}
	let imgurl = response.substr(0, response.indexOf(','));
	let altname = response.substr(response.indexOf(',') + 1);
	let href = "";
	if (imgurl.includes("https://images-na.ssl-images-amazon.com/images/")) {
		href = "https://www.amazon.co.jp/s?k=" + altname;
	} else {
		href = "https://search.rakuten.co.jp/search/mall/" + altname;
	}
	let body = document.body;
	let div = '<div id="ads-banner" style="position: fixed; float: right; right: 60px; top: 120px; width: auto; max-width: 225px; margin: 0 0 0 110px; z-index: 2; border: 1px solid #aaa; padding: 5px; background-color: white; box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);"></div>';
	let alt = '<div id="tagname" style="width: 200px; margin-left: auto; margin-right: auto;">'.concat(altname,'</div>');
	let img = '<a href="'.concat(href,'"><img src="', imgurl, '" style="max-width: 200px;" class="act-r-image"', '></a>');
	body.insertAdjacentHTML("afterbegin", div);
	banner = document.getElementById("ads-banner");
	banner.insertAdjacentHTML("afterbegin", img);
	banner.insertAdjacentHTML("afterbegin", alt);
};