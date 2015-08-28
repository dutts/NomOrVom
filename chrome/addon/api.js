// toilet-paper-icon_32 from Rokey (http://www.iconarchive.com/show/smooth-icons-by-rokey/toilet-paper-icon.html)
// 48-fork-and-knife-icon by Glyphish (http://glyphish.com/)

function ShowElement(element) {
	element.style.display = '';
}

function HideElement(element) {
	element.style.display = 'none';
}

function AppendImg(element, filename) {
    var img = document.createElement('img');
    img.src = chrome.extension.getURL(filename);
    element.appendChild(img);
}

function ApplyFilter(ratingFilterRange, restaurantEntries, excludeNoData) {
	excludeNoData = typeof excludeNoData !== 'undefined' ? excludeNoData : true;
	Array.prototype.forEach.call(restaurantEntries, function (el, i) {
		var ratingElement = el.querySelectorAll('div#nomorvom[data-rating]');
		if (ratingElement.length) {
			var rating = Number(ratingElement[0].getAttribute('data-rating'));
			if ( (rating < 0 && excludeNoData == false) || (rating >= Number(ratingFilterRange[0]) && rating <= Number(ratingFilterRange[1])) ) { 
				ShowElement(el); 
			}
			else { HideElement(el); }
		}
		else { HideElement(el); }
	});
}

var restaurantEntries = document.querySelectorAll('div.restaurant:not(.offlineRestaurant)');

var config = document.createElement('div');
config.id = "nomorvom_config"

var sliderLabel = document.createElement('p');
sliderLabel.id = "nomorvom_config_title";
sliderLabel.appendChild(document.createTextNode("Move the sliders to filter results by hygiene rating:"));
config.appendChild(sliderLabel);

var scoreFilterSlider = document.createElement('div');
scoreFilterSlider.id = "scoreFilterSlider";
$(scoreFilterSlider).slider({
	range: true,
	values: [0, 5],
	min: 0,
	max: 5,
	step: 1,
	slide: function( event, ui ) {
		ApplyFilter(ui.values, restaurantEntries);
	}
});

var vals = $(scoreFilterSlider).slider("option", "max") - $(scoreFilterSlider).slider("option", "min");

// Space out values
for (var i = 0; i <= vals; i++) {
	var el = $('<label>'+(i)+'</label>').css('left',(i/vals*100)+'%');

	$(scoreFilterSlider).append(el);
}

config.appendChild(scoreFilterSlider);

var excludeNoDataLabel = document.createElement('p');
excludeNoDataLabel.id = "nomorvom_config_excludeNoData";
excludeNoDataLabel.appendChild(document.createTextNode("Exclude 'No Result' Entries:"));

var excludeNoDataCheckbox = document.createElement('input');
excludeNoDataCheckbox.type = "checkbox"
excludeNoDataCheckbox.id = "nomorvom_config_excludeNoData_checkbox";
excludeNoDataCheckbox.checked = true;
excludeNoDataCheckbox.addEventListener('change', function() {
	ApplyFilter($(scoreFilterSlider).slider("values"), restaurantEntries, excludeNoDataCheckbox.checked);
});
excludeNoDataLabel.appendChild(excludeNoDataCheckbox);

config.appendChild(excludeNoDataLabel);

var restaurantsDiv = document.querySelector("div.restaurants");
restaurantsDiv.insertBefore(config, restaurantsDiv.firstChild);

/// new stuff

var port = chrome.runtime.connect({name:"scorelookup"});

port.onMessage.addListener(function(restaurantScore) {
  	//console.log("lookup: "+ restaurantScore.id + "(" + restaurantScore.rating + ")");
    console.log(restaurantScore.resp);

	//console.log("id " + restaurantScore.id + ", rating " + restaurantScore.rating);
	// find the score placeholder for the restaurant we've got a result for
	var restaurantScorePlaceholder = $("div.restaurant[data-nomorvom-id='"+restaurantScore.id+"'] div#nomorvom");
	restaurantScorePlaceholder.attr("data-rating", restaurantScore.rating);
	$("p#nomorvom_loading", restaurantScorePlaceholder).remove();
	$("div#nomorvom_progressbar", restaurantScorePlaceholder).remove();
	
	if (restaurantScore.rating > 0) {
		for (var i = 0; i < restaurantScore.rating; i++) {
			AppendImg(restaurantScorePlaceholder, '48-fork-and-knife-icon.png');
		}
		for (var i = 0; i < 5 - restaurantScore.rating; i++) {
			AppendImg(restaurantScorePlaceholder, 'toilet-paper-icon_32.png');
		}
	}

	var resultText = document.createElement('div');
	resultText.id = "hygieneScore"
	resultText.style.fontWeight = "bold";
	resultText.style.margin = "0px 5px";

	if (restaurantScore.rating == "AwaitingInspection") {
		$(resultText).text("This takeaway is awaiting inspection");					
		restaurantScore.rating = 0;
	}	
	else {
		if (restaurantScore.rating == -1) {
			$(resultText).text("Sorry, no food hygiene data found");
		}
		else {
			$(resultText).text("Hygiene Score : " + restaurantScore.rating + "/5");
		}
	}
	restaurantScorePlaceholder.append(resultText);

	// Filter accordingly
	var ratingFilterRange = $(scoreFilterSlider).slider("values");
	//var excludeNoData =  $(excludeNoDataCheckbox).prop('checked');
	//if ( ((rating == -1) && excludeNoData) || (rating < ratingFilterRange[0]) || (rating > ratingFilterRange[1]) ) { 
	if ((restaurantScore.rating < ratingFilterRange[0]) || (restaurantScore.rating > ratingFilterRange[1])) { 
		$("div.restaurant[data-nomorvom-id='"+restaurantScore.id+"']").hide();
	}
	else
	{
		$("div.restaurant[data-nomorvom-id='"+restaurantScore.id+"']").show();
	}
});

var restaurantId = 0;

Array.prototype.forEach.call(restaurantEntries, function (el, i) {

    var name = el.querySelector('h2.name a').textContent.trim(); 
    var address = el.querySelector('p.address').childNodes[0].textContent.trim();

	port.postMessage({id:restaurantId, name:name, address:address});
    
    var scorePlaceholder = document.createElement('div');
	scorePlaceholder.id = "nomorvom"
	
	var loadingText = document.createElement('p');
	loadingText.id = "nomorvom_loading";
	loadingText.textContent = "Loading food scores...";
	
    var loaderImg = document.createElement('div');
	loaderImg.id = "nomorvom_progressbar";

	var img = new Image();
	img.onload = function() {
  		loaderImg.appendChild(img);
	};

	img.src = chrome.extension.getURL('loading.gif');
	
	scorePlaceholder.appendChild(loadingText);
	scorePlaceholder.appendChild(loaderImg);
	
	scorePlaceholder.setAttribute('data-rating', 0);
	
    el.appendChild(scorePlaceholder);
 
    restaurantId++;
/*   
    var rating = 0;

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function (data, status) {
        	var rating = -1;
        	loadingText.parentNode.removeChild(loadingText);
			loaderImg.parentNode.removeChild(loaderImg);

			var resultText = document.createElement('div');
			resultText.id = "nomorvom_hygieneScore"

			if (data.establishments.length > 0) {
				rating = data.establishments[0].RatingValue;
				for (var i = 0; i < rating; i++) {
					AppendImg(scorePlaceholder, '48-fork-and-knife-icon.png');
				}
				for (var i = 0; i < 5 - rating; i++) {
					AppendImg(scorePlaceholder, 'toilet-paper-icon_32.png');
				}
				if (rating == "AwaitingInspection") {
					resultText.textContent = "This takeaway is awaiting inspection";					
					rating = 0;
				}	
				else {
					resultText.textContent = "Hygiene Score : " + rating + "/5";
				}
			}
			else {
				resultText.textContent = "Sorry, no food hygiene data found";
				rating = -1;
			}

			scorePlaceholder.appendChild(resultText);
			scorePlaceholder.setAttribute('data-rating', rating);

			
			ApplyFilter($(scoreFilterSlider).slider("values"), restaurantEntries, document.getElementById('nomorvom_config_excludeNoData_checkbox').checked);
        },
        error: function (error) { },
        beforeSend: function (xhr) { xhr.setRequestHeader('x-api-version', 2); }
    });
*/
});