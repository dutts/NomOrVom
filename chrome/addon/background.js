chrome.runtime.onConnect.addListener(function(port){
	console.assert(port.name == "scorelookup");
	port.onMessage.addListener(function(restaurant) {

  		var url = "http://api.ratings.food.gov.uk/Establishments?name=" + encodeURIComponent(restaurant.name) + "&address=" + encodeURIComponent(restaurant.address); 

		var rating = 0;

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4)
			{
				var resp = JSON.parse(xhr.responseText);
				if (resp.establishments.length > 0) {
					rating = resp.establishments[0].RatingValue;
				}
				else {
					rating = -1;
				}
				console.log(restaurant.id + " " + rating);
				port.postMessage({id:restaurant.id, rating:rating});
			}
		};
		xhr.open("GET", url, true);
		xhr.setRequestHeader('x-api-version', 2);
		xhr.setRequestHeader('Content-Type','application/json');
		xhr.setRequestHeader('Accept','application/json');
		xhr.send();
  	});
});