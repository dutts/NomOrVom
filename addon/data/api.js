// toilet-paper-icon_32 from Rokey (http://www.iconarchive.com/show/smooth-icons-by-rokey/toilet-paper-icon.html)
// 48-fork-and-knife-icon by Glyphish (http://glyphish.com/)
// test 
// cfx run --binary-args="-url http://www.just-eat.co.uk/area/nn1-northampton"

function AppendImg(element, filename) {
    var img = document.createElement('img');
    img.src = self.options.prefixDataURI + filename;
    element.appendChild(img);
}

function ApplyFilter(hideLessThanThree, restaurantEntries) {
	restaurantEntries.each(function () {
		if (hideLessThanThree) {
			var ratingElement = $("div#nomorvom[data-rating]", this);
			if (ratingElement.length) {
				var rating = $("div#nomorvom[data-rating]", this).attr("data-rating");
				if (rating < 3) { $(this).hide(); }
			}
		}
		else { $(this).show(); }
	});
}

var restaurantEntries = $("article");

var checkbox = document.createElement('input');
checkbox.type = "checkbox";
checkbox.name = "hideLessThanThree";
$(checkbox).change(function() {
    ApplyFilter(checkbox.checked, restaurantEntries);
});

$("div#SearchResults").prepend(checkbox);

$(checkbox).prop('checked', true);

restaurantEntries.each(function () {
    var _this = $(this);
    var name = $("h3.restaurantDetailsName a:first", this).text(); 
    var address = $("address:first", this).text();

    var url = "http://api.ratings.food.gov.uk/Establishments?name=" + encodeURIComponent(name) + "&address=" + encodeURIComponent(address);

    var scorePlaceholder = document.createElement('div');
	scorePlaceholder.id = "nomorvom"
	scorePlaceholder.style.border = "thin dashed red";
    scorePlaceholder.style.padding = "5px";
	scorePlaceholder.style.margin = "5px";
	scorePlaceholder.width = "50%";
	
	var loadingText = document.createElement('p');
	loadingText.style.fontWeight = "bold";
	loadingText.style.padding = "0px 5px";
	$(loadingText).text("Loading food scores...");
	
    var loaderImg = document.createElement('div');
	loaderImg.id = "progressbar";
	$(loaderImg).progressbar({
      value: false
	});
	
	scorePlaceholder.appendChild(loadingText);
	scorePlaceholder.appendChild(loaderImg);
	
	$(scorePlaceholder).attr("data-rating", 0);
	
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
					AppendImg(scorePlaceholder, '48-fork-and-knife-icon.png');
				}
				for (var i = 0; i < 5 - rating; i++) {
					AppendImg(scorePlaceholder, 'toilet-paper-icon_32.png');
				}
				var resultText = document.createElement('div');
				resultText.id = "hygieneScore"
				resultText.style.fontWeight = "bold";
				resultText.style.margin = "0px 5px";
				$(resultText).text("Hygiene Score : " + rating + "/5");
				
				scorePlaceholder.appendChild(resultText);
				
				$(scorePlaceholder).attr("data-rating", rating);
			}
			else
			{
				scorePlaceholder.removeChild(loadingText);
				scorePlaceholder.removeChild(loaderImg);
				
				var resultText = document.createElement('div');
				resultText.id = "hygieneScore";
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