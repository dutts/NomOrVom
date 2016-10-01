function LookupRating(id, name, address, postFunc) {
	var url = "http://api.ratings.food.gov.uk/Establishments?name=" + encodeURIComponent(name) + "&address=" + encodeURIComponent(address); 

	var rating = 0;
	var ratingDate = '';

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4)
		{
			var resp = JSON.parse(xhr.responseText);
			if (resp.establishments.length > 0) {
				rating = resp.establishments[0].RatingValue;
				ratingDate = resp.establishments[0].RatingDate;
			}
			else {
				rating = -1;
			}
			//console.log(restaurant.id + " " + rating);
			postFunc(id, rating, ratingDate);
		}
	};
	xhr.open("GET", url, true);
	xhr.setRequestHeader('x-api-version', 2);
	xhr.setRequestHeader('Content-Type','application/json');
	xhr.setRequestHeader('Accept','application/json');
	xhr.send();
} 

var parseHTML = function(str) {
	var tmp = document.implementation.createDocument();
	tmp.documentElement.appendChild(str)
	return tmp.body.children;
}

chrome.runtime.onConnect.addListener(function(port){
	if(port.name == "scorelookup") {
		port.onMessage.addListener(function(restaurant) {
			var postcodeRegexp = /[A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1} [0-9][A-Z]{2}/;
			var postcodeIndex = restaurant.address.search(postcodeRegexp);
			var address;
			if (postcodeIndex === -1) {
				// this should never happen
				address = restaurant.address;
			}
			else {
				address = restaurant.address.substring(postcodeIndex);
			}
			LookupRating(restaurant.id, restaurant.name, address, function(id, rating, ratingDate) { 
				port.postMessage({id:id, rating:rating, date:ratingDate});
			});
	  	});
	}
	if(port.name == "linkedPageScoreLookup") {
		port.onMessage.addListener(function(restaurant) {
			//console.log(restaurant.name + " " + restaurant.fullPageUri);
			
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {
				if (xhr.readyState == 4)
				{
					var pageDoc = xhr.responseXML;
					var addressElement = pageDoc.querySelector('span.address');

					var restaurantAddress = "";

					var streetAddressElement = addressElement.querySelector('span[itemprop="streetAddress"]');
					if (streetAddressElement) restaurantAddress += streetAddressElement.innerHTML.trim();

					var addressLocalityElement = addressElement.querySelector('span[itemprop="addressLocality"]')
					if (addressLocalityElement) restaurantAddress += ", " + addressLocalityElement.innerHTML.trim(); 

					var postcodeElement = addressElement.querySelector('span[itemprop="postalCode"]');
					if (postcodeElement) restaurantAddress += ", " + postcodeElement.innerHTML.trim();

					var postcodeRegexp = /[A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1} [0-9][A-Z]{2}/;
					var postcodeIndex = restaurantAddress.search(postcodeRegexp);
					var address;
					if (postcodeIndex === -1) {
						// this should never happen
						address = restaurantAddress;
					}
					else {
						address = restaurantAddress.substring(postcodeIndex);
					}
			
					LookupRating(restaurant.id, restaurant.name, address, function(id, rating, ratingDate) { 
						port.postMessage({id:id, rating:rating, date:ratingDate});
					});		
				}
			};
			xhr.open("GET", restaurant.fullPageUri);
			xhr.responseType = "document";
			xhr.send();
	  	});
  	}
});