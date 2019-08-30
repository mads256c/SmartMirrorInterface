document.addEventListener('DOMContentLoaded', OnDocumentLoad, false);

let greetingText;

let weatherTemperatureText;
let weatherIcon;
let weatherDescriptionText;

let timeText;

let config;
let lang;

function OnDocumentLoad() {
    greetingText = document.getElementById("greeting");

    weatherTemperatureText = document.getElementById("weather-temperature");
    weatherIcon = document.getElementById("weather-icon");
    weatherDescriptionText = document.getElementById("weather-description");

    timeText = document.getElementById("time-text");


    GetConfig();
}
function GetLanguage(){

    let request = new XMLHttpRequest();

    request.addEventListener("load", function() {
        console.log(request.responseText);
        if (request.status === 200){
            config = JSON.parse(request.responseText);
            OnReady();
        }
        else
        {
            OnError();
        }

    }, false);

    request.addEventListener("error", function () {
        OnError();
    }, false);

    request.open("GET", "http://localhost:9615/getlanguage", true);
    request.send();
}

function GetConfig() {

    let request = new XMLHttpRequest();

    request.addEventListener("load", function() {
        console.log(request.responseText);
        if (request.status === 200){
            config = JSON.parse(request.responseText);
            OnReady();
        }
        else
        {
            OnError();
        }

    }, false);

    request.addEventListener("error", function () {
        OnError();
    }, false);

    request.open("GET", "http://localhost:9615/getconfig", true);
    request.send();
}

function OnError() {
    console.log("Could not get configuration");
    greetingText.innerText = "Could not get configuration";
    document.body.style.animationPlayState = "running";
}

function OnReady() {

    UpdateTime();
    UpdateWeather();
    setInterval(UpdateTime, 1000 * 5);
    setInterval(UpdateWeather, 1000 * 60 * 10);

    document.body.style.animationPlayState = "running";
}

function UpdateTime() {
    let now = new Date();
    timeText.innerText = now.toLocaleTimeString(config.interface.locale.layout, {
        hour12: lang.hourformat,
        hour: "numeric",
        minute: "numeric"
    });

    let hours = now.getHours();

    if (hours > 5 && hours < 10)
    {
        greetingText.innerText = lang.greetings[0];
    }
    else if (hours > 10 && hours < 14)
    {
        greetingText.innerText = lang.greetings[1];
    }
    else if (hours > 14 && hours < 18)
    {
        greetingText.innerText = lang.greetings[2];
    }
    else if (hours > 18 && hours < 22)
    {
        greetingText.innerText = lang.greetings[3];
    }
    else
    {
        greetingText.innerText = lang.greetings[4];
    }
}

function UpdateWeather() {

    let city = config.interface.weather.city;
    let countryCode = config.interface.weather.countryCode;
    let apiKey = config.interface.weather.apiKey;

    let request = new XMLHttpRequest();

    request.addEventListener("load", function() {
        if (request.status === 200){
            let weatherData = JSON.parse(request.responseText);
            console.log(weatherData);
            weatherTemperatureText.innerText = (weatherData.main.temp - 273.15).toFixed(0) + '\xB0';
            weatherDescriptionText.innerText = weatherData.weather[0].description;

            let className = "fas fa-4x d-inline-block align-middle ";

            switch (weatherData.weather[0].icon) {

                case "01d":
                    className += "fa-sun";
                    break;

                case "01n":
                    className += "fa-moon";
                    break;

                case "02d":
                    className += "fa-cloud-sun";
                    break;

                case "02n":
                    className += "fa-cloud-moon";
                    break;

                case "03d":
                case "03n":
                case "04d":
                case "04n":
                    className += "fa-cloud";
                    break;

                case "09d":
                    className += "fa-cloud-showers-heavy";
                    break;

                case "10d":
                    className += "fa-cloud-sun-rain";
                    break;

                case "10n":
                    className += "fa-cloud-moon-rain";
                    break;

                case "11d":
                case "11n":
                    className += "fa-bolt";
                    break;

                case "13d":
                case "13n":
                    className += "fa-snowflake";
                    break;

                case "50d":
                case "50n":
                    className += "fa-smog";
                    break;

                default:
                    className += "fa-times-circle";
                    console.log("Invalid icon: ", weatherData.weather[0].icon);
                    break;
            }

            weatherIcon.className = className;
        }
        else
        {
            console.log("Error getting weather data", request.responseText);
        }

    }, false);

    request.addEventListener("error", function () {
        console.log("Error getting weather data", request.responseText);
    }, false);

    request.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + countryCode + "&appid=" + apiKey, true);
    request.send();
}
