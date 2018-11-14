document.addEventListener('DOMContentLoaded', OnDocumentLoad, false);

let greetingText;

let weatherTemperatureText;
let weatherIcon;
let weatherDescriptionText;

let timeText;

let config;

function OnDocumentLoad() {
    greetingText = document.getElementById("greeting");

    weatherTemperatureText = document.getElementById("weather-temperature");
    weatherIcon = document.getElementById("weather-icon");
    weatherDescriptionText = document.getElementById("weather-description");

    timeText = document.getElementById("time-text");


    GetConfig();
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
    OnUpdate();
    UpdateWeather();
    setInterval(OnUpdate, 1000);
    setInterval(UpdateWeather, 1000 * 60 * 10);

    document.body.style.animationPlayState = "running";
}

function OnUpdate() {
    UpdateTime();
}

function UpdateTime() {
    let now = new Date();
    timeText.innerText = now.toLocaleTimeString(config.interface.locale.layout, {
        hour12: config.interface.locale.useMilitaryTime,
        hour: "numeric",
        minute: "numeric"
    });

    let hours = now.getHours();

    if (hours > 5 && hours < 10)
    {
        greetingText.innerText = "Good Morning";
    }
    else if (hours > 10 && hours < 14)
    {
        greetingText.innerText = "Good Dinner";
    }
    else if (hours > 14 && hours < 18)
    {
        greetingText.innerText = "Good Afternoon";
    }
    else if (hours > 18 && hours < 22)
    {
        greetingText.innerText = "Good Evening";
    }
    else
    {
        greetingText.innerText = "Good Night";
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