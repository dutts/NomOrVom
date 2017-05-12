// toilet-paper-icon_32 from Rokey (http://www.iconarchive.com/show/smooth-icons-by-rokey/toilet-paper-icon.html)
// 48-fork-and-knife-icon by Glyphish (http://glyphish.com/)

function showElement(element) {
	element.style.display = '';
}

function hideElement(element) {
	element.style.display = 'none';
}

function removeElement(elementSelector, parentElement) {
	parentElement = typeof parentElement !== 'undefined' ? parentElement : document;
	var el = parentElement.querySelector(elementSelector);
	el.parentNode.removeChild(el);
}

function appendImg(element, filename) {
    var img = document.createElement('img');
    img.src = chrome.extension.getURL(filename);
    element.appendChild(img);
}

function applyFilter(restaurantEntries) {
	var ratingFilterRange = document.getElementById('nov-cfg-filter-slider').noUiSlider.get();
    var excludeNoData = document.getElementById("nov-cfg-exclude-filter").checked;
	Array.prototype.forEach.call(restaurantEntries, (el, i) => {
		var ratingElement = el.querySelectorAll('.nov-score[data-rating]');
	    if (ratingElement.length) {
	        var rating = Number(ratingElement[0].getAttribute('data-rating'));
	        if (isNaN(rating)) {
	        	// Scottish results are "Pass" "NeedsImprovement" so can't filter just yet
	        	showElement(el);
	        }
	        else if ((rating < 0 && excludeNoData == false) ||
	            (rating >= Number(ratingFilterRange[0]) && rating <= Number(ratingFilterRange[1]))) {
				showElement(el); 
	        } else {
	            hideElement(el);
	        }
	    } else {
	        hideElement(el);
	    }
	});
}

function applyResult(placeholderSelector, restaurantScore) {
	var restaurantScorePlaceholder = document.querySelector(placeholderSelector);
	restaurantScorePlaceholder.setAttribute('data-rating', restaurantScore.rating);
	removeElement('.nov-score .nov-loading', restaurantScorePlaceholder);
	removeElement('.nov-score .nov-progress', restaurantScorePlaceholder);
	if (restaurantScore.rating > -1) {
		for (var i = 0; i < restaurantScore.rating; i++) {
			appendImg(restaurantScorePlaceholder, '48-fork-and-knife-icon.png');
		}
		for (var i = 0; i < 5 - restaurantScore.rating; i++) {
			appendImg(restaurantScorePlaceholder, 'toilet-paper-icon_32.png');
		}
	}
	var resultText = document.createElement('div');
	resultText.className = "nov-rating"
	if (restaurantScore.rating == "AwaitingInspection" || restaurantScore.rating == "Awaiting inspection") {
		resultText.innerHTML = "This takeaway is awaiting inspection";					
		restaurantScore.rating = 0;
	}
	else if (restaurantScore.rating == "Exempt") {
		resultText.innerHTML = "This takeaway is exempt from inspection";					
		restaurantScore.rating = 0;		
	}
	else if (restaurantScore.rating == "Awaiting publication") {
		resultText.innerHTML = "This takeaway's rating is awaiting publication";					
		restaurantScore.rating = 0;		
	}		
	else {
		if (restaurantScore.rating == -1) {
			resultText.innerHTML = "Sorry, no food hygiene data found";
		}
		else if (restaurantScore.rating == "Pass") {
			hideElement(document.querySelector(".nov-cfg-inner"));
			resultText.innerHTML = `FHIS - Pass<br/>Rated on ${restaurantScore.date.substring(0, 10)}`;
		}
		else if (restaurantScore.rating == "Pass and Eatsafe") {
			hideElement(document.querySelector(".nov-cfg-inner"))
			resultText.innerHTML = `FHIS - Pass and Eatsafe<br/>Rated on ${restaurantScore.date.substring(0, 10)}`;
		}
		else if (restaurantScore.rating == "Improvement Required") {
			hideElement(document.querySelector(".nov-cfg-inner"))
			resultText.innerHTML = `FHIS - Improvement Required<br/>Rated on ${restaurantScore.date.substring(0, 10)}`;
		}
		else {
			resultText.innerHTML = `Hygiene Score : ${restaurantScore.rating}/5<br/>Rated on ${restaurantScore.date.substring(0, 10)}`;
		}
	}
	restaurantScorePlaceholder.appendChild(resultText);
}

function createScorePlaceholderElement(loadingImageSource) {
    var scorePlaceholder = document.createElement('div');
	scorePlaceholder.className = "nov-score";
	var loadingText = document.createElement('p');
	loadingText.className = "nov-loading";
	loadingText.textContent = "Loading food scores...";
    var loaderImg = document.createElement('div');
	loaderImg.className = "nov-progress";
	var img = new Image();
	img.onload = () => {
  		loaderImg.appendChild(img);
	};
	img.src = loadingImageSource;
	scorePlaceholder.appendChild(loadingText);
	scorePlaceholder.appendChild(loaderImg);
	scorePlaceholder.setAttribute('data-rating', -1);
	return scorePlaceholder;
}

function createConfigElement(siteId) {
    const min = 0, max = 5;
    const tmpl =
        `<div class="nov-cfg-inner">
            <p>Move the sliders to filter results by hygiene rating: </p>
            <div id="nov-cfg-filter">
                <div id="nov-cfg-filter-slider" class="nov-cfg-filter-slider" />
            </div>
            <p class="nov-cfg-exclude">
                Exclude 'No Result' Entries:
                <input id="nov-cfg-exclude-filter" type="checkbox"/>
            </p>
        </div>`;

	var config = document.createElement('div');
	config.id = "nov-cfg"
    config.className = `nov-cfg-${siteId}`;
    config.innerHTML = tmpl;

	var handlesSlider = config.getElementsByClassName('nov-cfg-filter-slider')[0];
	noUiSlider.create(handlesSlider, {
		start: [ min, max ],
		step: 1,
		range: {
			'min': [ min ],
			'max': [ max ]
		},
		pips: {
			mode: 'count',
			values: [6],
			density: 100
		}
	});
	handlesSlider.noUiSlider.on('set', function() { applyFilter(restaurantEntries) });

    config.querySelector("#nov-cfg-exclude-filter")
        .addEventListener('change',
          	() => {
                applyFilter(restaurantEntries);
            });

	return config;
}

// Just-Eat
if (window.location.href.indexOf("just-eat.co.uk") > -1) {
	var config = createConfigElement("je");
	var restaurantsDiv = document.querySelector("div[data-ft='openRestaurantsList']");
	restaurantsDiv.insertBefore(config, restaurantsDiv.firstChild);
	var restaurantEntries = document.querySelectorAll('div.c-restaurant:not(.c-restaurant--offline)');

    var port = chrome.runtime.connect({ name: "scorelookup" });
	port.onMessage.addListener( restaurantScore => {
		applyResult("div.c-restaurant[data-nomorvom-id='"+restaurantScore.id+"'] div.nov-score", restaurantScore);
		applyFilter(restaurantEntries);
	});

	var restaurantId = 0;
	Array.prototype.forEach.call(restaurantEntries, (el, i) => {
	    var name = el.querySelector("h2[itemprop='name']").textContent.trim();
	    var address = el.querySelector('p.c-restaurant__address').textContent.trim();
		port.postMessage({id:restaurantId, name:name, address:address});
		var scorePlaceholder = createScorePlaceholderElement(chrome.extension.getURL('loading.gif'));		
		el.setAttribute('data-nomorvom-id', restaurantId);
		el.appendChild(scorePlaceholder);
	    restaurantId++;
	});
}

// Hungry House
if (window.location.href.indexOf("hungryhouse.co.uk") > -1) {
	var restaurantEntries = document.querySelectorAll('div.restaurantBlock'); 
	//var config = createConfigElement(); 
  	//var restaurantsDiv = document.querySelector("div.searchItems"); 
  	//restaurantsDiv.insertBefore(config, restaurantsDiv.firstChild);
	var port = chrome.runtime.connect({name:"hungryHouseLinkedPageScoreLookup"});
	port.onMessage.addListener( restaurantScore => {
	    var scorePlaceholder = createScorePlaceholderElement(chrome.extension.getURL('loading.gif'));
    	var restaurantElement = document.querySelector("div.restaurantBlock[data-id='"+restaurantScore.id+"'] div.restsSearchItemRes")
	    restaurantElement.appendChild(scorePlaceholder);
		applyResult("div.restaurantBlock[data-id='"+restaurantScore.id+"'] div.restsSearchItemRes div.nov-score", restaurantScore);
	});
	
	Array.prototype.forEach.call(restaurantEntries, (el, i) => {
		var restaurantId = el.getAttribute("data-id");
	    var name = el.querySelector('a.restPageLink').textContent.trim(); 
    	var pageUri = el.querySelector('a.restPageLink').getAttribute('href').trim();
		var fullPageUri = window.location.protocol + "//" + window.location.host + pageUri;
		port.postMessage({id:restaurantId, name:name, fullPageUri:fullPageUri});	    
	});
}

// Deliveroo
if (window.location.href.indexOf("deliveroo.co.uk") > -1) {
	var restaurantEntries = document.querySelectorAll('li.restaurant-index-page-tile'); 
	var port = chrome.runtime.connect({name:"deliverooLinkedPageScoreLookup"});
	port.onMessage.addListener( restaurantScore => {
		applyResult("li.restaurant-index-page-tile[data-nomorvom-id='"+restaurantScore.id+"'] div.nov-score", restaurantScore);
	});
	
	var restaurantId = 0;
	Array.prototype.forEach.call(restaurantEntries, (el, i) => {
	    var name = el.querySelector('h3.restaurant-index-page-tile--name').textContent.trim(); 
    	var pageUri = el.querySelector('a.restaurant-index-page-tile--anchor').getAttribute('href').trim();
		var fullPageUri = window.location.protocol + "//" + window.location.host + pageUri;
		port.postMessage({id:restaurantId, name:name, fullPageUri:fullPageUri});
		var scorePlaceholder = createScorePlaceholderElement(chrome.extension.getURL('loading.gif'));
		el.setAttribute('data-nomorvom-id', restaurantId);
		el.appendChild(scorePlaceholder);
		restaurantId++;	    
	});
}

