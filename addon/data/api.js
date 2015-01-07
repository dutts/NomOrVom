// http://www.just-eat.co.uk/area/nn6-creaton

function Poop(element) {
    var img = document.createElement('img');
    img.src = self.options.prefixDataURI + 'poop.png';
    element.append(img);
}

function Thumb(element) {
    var img = document.createElement('img');
    img.src = self.options.prefixDataURI + 'good.png';
    element.append(img);
}

$("article").each(function () {
    var _this = $(this);
    var name = $("h3.restaurantDetailsName a:first", this).text(); 
    var address = $("address:first", this).text();

    var url = "http://api.ratings.food.gov.uk/Establishments?name=" + encodeURIComponent(name) + "&address=" + encodeURIComponent(address);

    //var scorePlaceholder = document.createElement('span');
    //$(scorePlaceholder).append("xxx");
    //$(this).append(scorePlaceholder);

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function (data, status) {
            var rating = data.establishments[0].RatingValue;
            //var img = document.createElement('img');
            //img.src = self.options.prefixDataURI + rating + '.png';
            //_this.append(img);
            for (var i = 0; i < rating; i++) {
                Thumb(_this);
            }
            for (var i = 0; i < 5 - rating; i++) {
                Poop(_this);
            }
        },
        error: function (error) { alert(error); },
        beforeSend: function (xhr) { xhr.setRequestHeader('x-api-version', 2); }
    });
});