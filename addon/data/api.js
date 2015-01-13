// http://www.just-eat.co.uk/area/nn6-creaton

function Poop(element) {
    var img = document.createElement('img');
    img.src = self.options.prefixDataURI + 'poop.png';
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
	
	var loaderImg = document.createElement('img');
    loaderImg.src = self.options.prefixDataURI + 'ajax-loader.gif';
    scorePlaceholder.appendChild(loaderImg);
	
    _this.append(scorePlaceholder);

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function (data, status) {
			if (data.establishments.length > 0) {
				scorePlaceholder.removeChild(loaderImg);
				var rating = data.establishments[0].RatingValue;
				//var img = document.createElement('img');
				//img.src = self.options.prefixDataURI + rating + '.png';
				//_this.append(img);
				for (var i = 0; i < rating; i++) {
					Thumb(scorePlaceholder);
				}
				for (var i = 0; i < 5 - rating; i++) {
					Poop(scorePlaceholder);
				}
			}
        },
        error: function (error) { },
        beforeSend: function (xhr) { xhr.setRequestHeader('x-api-version', 2); }
    });
});