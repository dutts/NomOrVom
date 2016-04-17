chrome.runtime.onConnect.addListener(function(port){
	console.assert(port.name == "scorelookup");
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

  		var url = "http://api.ratings.food.gov.uk/Establishments?name=" + encodeURIComponent(restaurant.name) + "&address=" + encodeURIComponent(address); 

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
				console.log(restaurant.id + " " + rating);
				port.postMessage({id:restaurant.id, rating:rating, date:ratingDate});
			}
		};
		xhr.open("GET", url, true);
		xhr.setRequestHeader('x-api-version', 2);
		xhr.setRequestHeader('Content-Type','application/json');
		xhr.setRequestHeader('Accept','application/json');
		xhr.send();
  	});
});