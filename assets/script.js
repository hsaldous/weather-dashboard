$(document).ready(function () {
    var searchHistoryContainer = $("#past-searches");
    var searchForm = $("#search-form");
    var currentWeatherContainer = $("#current-weather");
    var apiKey = "f18636ad37d32cf43ec809a1875af058";
    var baseUrl = "https://api.openweathermap.org/data/2.5/weather?";
    var fiveDayForeCastContainer = $("#five-day-forecast");
    var baseUrl2 = "https://api.openweathermap.org/data/2.5/forecast?";
    var iconBaseUrl = "http://openweathermap.org/img/w/"
    var searchHistory = [];
    var searchValueInput = $("#search-value");
    var uvIndexBaseUrl = "https://api.openweathermap.org/data/2.5/onecall?"

    searchForm.submit(function (event) {
        event.preventDefault();
        var formValues = $(this).serializeArray();
        var city = formValues[0].value;
        var searchTermDiv = $('<button type="button" class="btn past-search-term">');
        searchTermDiv.click(function (event) {
            event.preventDefault();
            var value = $(this).text();
            searchForCurrentCityWeather(value);
            searchForFiveDayForecastWeather(value);
            console.log(value);
        });
        searchHistory.push(city);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        searchTermDiv.text(city);
        searchHistoryContainer.append(searchTermDiv);
        console.log(formValues, city);
        searchForCurrentCityWeather(city);
        searchForFiveDayForecastWeather(city);
        searchValueInput.val("");
    });
    
    
    function searchForCurrentCityWeather(city) {
        currentWeatherContainer.html("");
        var fullUrl = baseUrl + "q=" + city + "&units=imperial" + "&appid=" + apiKey;
        console.log(fullUrl);
        fetch(fullUrl).then(function (response) {
            return response.json();
        })
            .then(function (data) {
                var cityName = data.name;
                var temp = data.main.temp;
                var humidity = data.main.humidity;
                var weather = data.weather;
                var iconUrl = iconBaseUrl + weather[0].icon + ".png";
                var wind = data.wind;
                console.log(data);
                var cityNameDiv = $('<h3 class="city-name">');
                var weatherDiv = $('<img class="icon-name">');
                var tempDiv = $('<h5 class="temp-name">');
                var humidityDiv = $('<h5 class="humidity-name">');
                var windDiv = $('<h5 class="wind-name">');
                cityNameDiv.text(cityName);
                weatherDiv.attr("src", iconUrl);
                tempDiv.text("Temperature: " + temp + " °F");
                humidityDiv.text("Humidity: " + humidity + "%");
                windDiv.text("Wind Speed: " + wind.speed + " MPH");
                currentWeatherContainer.append(cityNameDiv);
                currentWeatherContainer.append(weatherDiv);
                currentWeatherContainer.append(tempDiv);
                currentWeatherContainer.append(humidityDiv);
                currentWeatherContainer.append(windDiv);
            });
    };

    function searchForFiveDayForecastWeather(city) {
        fiveDayForeCastContainer.html("");
        currentWeatherContainer.html("");
        var forecastUrl = baseUrl2 + "q=" + city + "&units=imperial" + "&appid=" + apiKey;
        fetch(forecastUrl).then(function (responseFromOpenWeatherMapUnprocessed) {
            return responseFromOpenWeatherMapUnprocessed.json();
        }).then(function (data) {
            console.log("Five Day Forecast", data);
            var coords = data.city.coord;
            console.log(coords);
            getUvIndex(coords.lat, coords.lon);
            // loop through 5 day forecast data
            for (var i = 0; i < data.list.length; i++) {
                // only use weather at 3 pm
                var isThreeOClock = data.list[i].dt_txt.search("15:00:00");
                var cityName = data.city.name;
                if (isThreeOClock > -1) {
                    var forecast = data.list[i];
                    var temp = forecast.main.temp;
                    var humidity = forecast.main.humidity;
                    var weather = forecast.weather;
                    var iconUrl = iconBaseUrl + weather[0].icon + ".png";
                    var wind = forecast.wind;
                    var day = moment(forecast.dt_txt).format("dddd, MMMM Do");
                    console.log(forecast, temp, humidity, weather, wind, day);
                    var rowDiv = $('<div class="col-2">');
                    var dayDiv = $('<div class="day-name">');
                    var tempDiv = $('<div class="temp-name">');
                    var humidityDiv = $('<div class="humidity-name">');
                    var weatherDiv = $('<img class="icon-name">');
                    var windDiv = $('<div class="wind-name">');
                    weatherDiv.attr("src", iconUrl);
                    dayDiv.text(day);
                    tempDiv.text("Temperature: " + temp + " °F");
                    humidityDiv.text("Humidity: " + humidity + "%");
                    windDiv.text("Wind Speed: " + wind.speed + " MPH");
                    rowDiv.append(weatherDiv);
                    rowDiv.append(dayDiv);
                    rowDiv.append(tempDiv);
                    rowDiv.append(humidityDiv);
                    rowDiv.append(windDiv);
                    fiveDayForeCastContainer.append(rowDiv);
                }
            }
        });
    }
    
    
    function getUvIndex(lat, lon) {
        console.log(lat, lon);
        var finalUrl = uvIndexBaseUrl + "lat=" + lat + "&lon=" + lon + "&exclude=hourly,daily&appid=" + apiKey;
        fetch(finalUrl).then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log("UV DATA", data);
            var uvIndex = data.current.uvi;
            var uvIndexDiv = $('<h5 class="uv-index-div">');
            var uvIndexSpan = $('<span class="uv-index-number">');
            if (uvIndex < 2) {
                uvIndexSpan.addClass("uv-index-number-low")
            } else if (uvIndex < 5) {
                uvIndexSpan.addClass("uv-index-number-med")
            } else {
                uvIndexSpan.addClass("uv-index-number-high")
            }
            uvIndexSpan.text(uvIndex);
            uvIndexDiv.text("UV Index: ");
            uvIndexDiv.append(uvIndexSpan);
            currentWeatherContainer.append(uvIndexDiv);
        });
    }
    
    
    function retrieveSearchHistory() {
        if (localStorage.getItem("searchHistory")) {
            searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
            for (var i = 0; i < searchHistory.length; i++) {
                var searchTermDiv = $('<button type="button" class="btn past-search-term">');
                searchTermDiv.click(function (event) {
                    event.preventDefault();
                    var value = $(this).text();
                    console.log(value);
                    searchForCurrentCityWeather(value);
                    searchForFiveDayForecastWeather(value);
                });

                searchTermDiv.text(searchHistory[i]);
                searchHistoryContainer.append(searchTermDiv);
            }
        }
    }
    retrieveSearchHistory();
});



