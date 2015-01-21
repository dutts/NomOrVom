// http://www.just-eat.co.uk/area/nn6-creaton

function AppendImg(element, filename) {
    var img = document.createElement('img');
    img.src = self.options.prefixDataURI + filename;
    element.appendChild(img);
}

function Thumb(element) {
    var img = document.createElement('img');
    img.src = self.options.prefixDataURI + 'good.png';
    element.appendChild(img);
}

$("article").each(function () {
    var _this = $(this);
    var name = $("h3.restaurantDetailsName a:first", this).text(); 
    var address = $("address:first", this).text();

    var url = "http://api.ratings.food.gov.uk/Establishments?name=" + encodeURIComponent(name) + "&address=" + encodeURIComponent(address);

    var scorePlaceholder = document.createElement('div');
	scorePlaceholder.style.border = "thin dashed red";
    scorePlaceholder.style.padding = "5px";
	scorePlaceholder.style.margin = "5px";
	scorePlaceholder.width = "50%";
	
	var loadingText = document.createElement('p');
	loadingText.style.fontWeight = "bold";
	loadingText.style.padding = "0px 5px";
	$(loadingText).text("Loading food scores...");
	
	var loaderImg = document.createElement('img');
    loaderImg.src = self.options.prefixDataURI + 'ajax-loader.gif';
    
	scorePlaceholder.appendChild(loadingText);
	scorePlaceholder.appendChild(loaderImg);
	
    _this.append(scorePlaceholder);

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function (data, status) {
			if (data.establishments.length > 0) {
				scorePlaceholder.removeChild(loadingText);
				scorePlaceholder.removeChild(loaderImg);
				var rating = data.establishments[0].RatingValue;
				//var img = document.createElement('img');
				//img.src = self.options.prefixDataURI + rating + '.png';
				//_this.append(img);
				for (var i = 0; i < rating; i++) {
					AppendImg(scorePlaceholder, 'good.png');
				}
				for (var i = 0; i < 5 - rating; i++) {
					AppendImg(scorePlaceholder, 'poop.png');
				}
				var resultText = document.createElement('p');
				resultText.style.fontWeight = "bold";
				resultText.style.margin = "0px 5px";
				$(resultText).text("Hygiene Score : " + rating + "/5");
				scorePlaceholder.appendChild(resultText);
			}
			else
			{
				scorePlaceholder.removeChild(loadingText);
				scorePlaceholder.removeChild(loaderImg);
				
				var resultText = document.createElement('p');
				resultText.style.fontWeight = "bold";
				resultText.style.margin = "5px 5px";
				$(resultText).text("Sorry, no food hygiene data found");
				scorePlaceholder.appendChild(resultText);
			}
        },
        error: function (error) { },
        beforeSend: function (xhr) { xhr.setRequestHeader('x-api-version', 2); }
    });
});