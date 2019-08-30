document.addEventListener('DOMContentLoaded', OnDocumentLoad, false);

let greetingText;

let weatherTemperatureText;
let weatherIcon;
let weatherDescriptionText;

let timeText;

let config;
let lang;

let calender;

const ical = require('node-ical');


function OnDocumentLoad() {
    greetingText = document.getElementById("greeting");

    weatherTemperatureText = document.getElementById("weather-temperature");
    weatherIcon = document.getElementById("weather-icon");
    weatherDescriptionText = document.getElementById("weather-description");

    timeText = document.getElementById("time-text");

    calender = document.getElementById("calender");

    GetConfig();
    //GetLanguage();
}
function GetLanguage(){

    let request = new XMLHttpRequest();

    request.addEventListener("load", function() {
        console.log(request.responseText);
        if (request.status === 200){
            lang = JSON.parse(request.responseText);
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
            GetLanguage();
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
    setInterval(UpdateCalender, 1000);
    NextCalenderItem();

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

function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

let calenderItems = [];
let currentCalenderItem = 0;

function UpdateCalender(){
    ical.fromURL(config.interface.calender.icalUrl, {}, function(err, data){
        calenderItems = [];

        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                let ev = data[k];
                if (data[k].type == 'VEVENT') {
                    if (sameDay(ev.start, new Date())){
                        let item = {
                            "title": ev.summary,
                            "startDate": ev.start,
                            "endDate": ev.end,
                            "location": ev.location,
                            "description": ev.description
                        };
                        calenderItems.push(item);

                    }
                }
            }
        }

        calenderItems.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return a.startDate.getTime() - b.startDate.getTime();
        });
    });
}

let isDisplayed = false;

function NextCalenderItem(oldCalenderItem){
    if (calenderItems.length >= 1)
    {
        if (currentCalenderItem >= calenderItems.length){
            currentCalenderItem = 0;
        }

        if (oldCalenderItem !== calenderItems[currentCalenderItem] || !isDisplayed){
            calender.style.animationPlayState = "running";

            setTimeout(function(){
                let child = calender.lastElementChild;
                while (child) {
                    calender.removeChild(child);
                    child = calender.lastElementChild;
                }

                let item = calenderItems[currentCalenderItem];

                let title = document.createElement("H1");
                title.className = "calender-title";
                title.innerText = item.title === "" ? "(no title)" : item.title;
                calender.appendChild(title);

                if (!(item.startDate.getHours() === 0 && item.startDate.getMinutes() === 0 && item.endDate.getHours() === 0 && item.endDate.getMinutes() === 0)){
                    let time = document.createElement("DIV");
                    time.className = "d-block";

                    let timeIcon = document.createElement("I");
                    timeIcon.className = "fas fa-clock d-inline-block";
                    time.appendChild(timeIcon);

                    let timeText = document.createElement("SPAN");


                    if (item.endDate === undefined || item.startDate === item.endDate){
                        timeText.innerText = FormattedTime(item.startDate);
                    }
                    else
                    {
                        timeText.innerText = FormattedTime(item.startDate) + " - " + FormattedTime(item.endDate);
                    }

                    timeText.className = "calender-time";
                    time.appendChild(timeText);


                    calender.appendChild(time);
                }




                if (item.location !== ""){
                    let location = document.createElement("DIV");

                    let locationIcon = document.createElement("I");
                    locationIcon.className = "fas fa-location-arrow d-inline-block";
                    location.appendChild(locationIcon);

                    let locationText = document.createElement("SPAN");
                    locationText.innerText = item.location;
                    locationText.className = "calender-location";
                    location.appendChild(locationText);

                    calender.appendChild(location);
                }



                let description = document.createElement("P");
                description.innerText = item.description;
                description.className = "calender-description";

                calender.appendChild(description);

                calender.style.animationPlayState = "paused";
                calender.style.animationName = "opacity-fade-on";
                calender.style.animationPlayState = "running";

                setTimeout(function(){
                    calender.style.animationPlayState = "paused";
                    calender.style.animationName = "opacity-fade-off";

                    isDisplayed = true;
                }, 1000);

            }, 1000);
        }

    }

    setTimeout(function(){
        currentCalenderItem++;
        NextCalenderItem(calenderItems[currentCalenderItem - 1]);
    }, 12000);
}

/**
 * @return {string}
 */
function FormattedTime(date){
    let hh = date.getHours();
    let mm = date.getMinutes();

    if (hh < 10) {
        hh = '0' + hh;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }

    return hh + ":" + mm;
}