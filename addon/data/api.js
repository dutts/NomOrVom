// toilet-paper-icon_32 from Rokey (http://www.iconarchive.com/show/smooth-icons-by-rokey/toilet-paper-icon.html)
// 48-fork-and-knife-icon by Glyphish (http://glyphish.com/)
// test 
// cfx run --binary-args="-url http://www.just-eat.co.uk/area/nn1-northampton"

function AppendImg(element, filename) {
    var img = document.createElement('img');
    img.src = self.options.prefixDataURI + filename;
    element.appendChild(img);
}

function ApplyFilter(ratingFilterRange, restaurantEntries) {
	restaurantEntries.each(function () {
		if (ratingFilterRange[0] > 0 || ratingFilterRange[1] < 5) {
			var ratingElement = $("div#nomorvom[data-rating]", this);
			if (ratingElement.length) {
				var rating = $("div#nomorvom[data-rating]", this).attr("data-rating");
				if ((rating < ratingFilterRange[0]) || (rating > ratingFilterRange[1])) { 
					$(this).hide(); 
				}
			}
		}
		else { $(this).show(); }
	});
}

var restaurantEntries = $("article");

var config = document.createElement('div');
config.id = "nomorvom_config"
config.style.border = "thin dashed red";
config.style.padding = "5px 10px 25px 10px";
config.style.margin = "5px";

var title = document.createElement('p');
title.id = "nomorvom_config_title";
title.appendChild(document.createTextNode("Move the sliders to filter results by hygiene rating:"));

config.appendChild(title);

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
})

//
// Add labels to slider whose values 
// are specified by min, max and whose
// step is set to 1
//

// Get the number of possible values
var vals = $(scoreFilterSlider).slider("option", "max") - $(scoreFilterSlider).slider("option", "min");

// Space out values
for (var i = 0; i <= vals; i++) {
	var el = $('<label>'+(i)+'</label>').css('left',(i/vals*100)+'%');

	$(scoreFilterSlider).append(el);
}

config.appendChild(scoreFilterSlider);

$("div#SearchResults").prepend(config);

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
    
    var rating = 0;

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function (data, status) {
			if (data.establishments.length > 0) {
				scorePlaceholder.removeChild(loadingText);
				scorePlaceholder.removeChild(loaderImg);
				rating = data.establishments[0].RatingValue;	
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
			
			var ratingFilterRange = $(scoreFilterSlider).slider("values");
			if ((rating < ratingFilterRange[0]) || (rating > ratingFilterRange[1])) {
				_this.hide();
			}
			else
			{
				_this.show();
			}
        },
        error: function (error) { },
        beforeSend: function (xhr) { xhr.setRequestHeader('x-api-version', 2); }
    });
});