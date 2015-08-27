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

Array.prototype.forEach.call(restaurantEntries, function (el, i) {

    var name = el.querySelector('h2.name a').textContent.trim(); 
    var address = el.querySelector('p.address').childNodes[0].textContent.trim();

    var url = "http://api.ratings.food.gov.uk/Establishments?name=" + encodeURIComponent(name) + "&address=" + encodeURIComponent(address);

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
});