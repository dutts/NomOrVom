chrome.runtime.onConnect.addListener(function(port){
	console.assert(port.name == "scorelookup");
	port.onMessage.addListener(function(msg) {
		console.log("foo");
		//port.postMessage({resp:msg});

  		var url = "https://api.ratings.food.gov.uk/Establishments?name=" + encodeURIComponent(msg.name) + "&address=" + encodeURIComponent(msg.address); 
		var rating = 0;

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyStste == 4)
			{
				var resp = JSON.parse(xhr.responseText);
				port.postMessage({resp:resp});
				//console.log(resp);
			}
		};
		xhr.open("GET", url, true);
		xhr.send();
		/*
		var Request = require("sdk/request").Request;
		var foodLookupRequest = Request({
  			url: url,
  			headers: {'x-api-version':2, 'Content-Type':'application/json', 'Accept':'application/json'},
			onComplete: function (response) {	
				if (response.json != null) {
					if (response.json.establishments.length > 0) {
						rating = response.json.establishments[0].RatingValue;
					} 
					else {
						rating = -1;
					}
				}
				port.postMessage({id:restaurant.id, rating:rating});
			}
		});
*/
  	});
});