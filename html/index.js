document.addEventListener('DOMContentLoaded', OnDocumentLoad, false);

let greetingText;

let weatherTemperatureText;
let weatherIcon;
let weatherDescriptionText;

let timeText;

let config;
let lang;

let calender;

let spotifyProgressBar;
let spotifyName;
let spotifyArtist;

const ical = require('node-ical');


function OnDocumentLoad() {
    greetingText = document.getElementById("greeting");

    weatherTemperatureText = document.getElementById("weather-temperature");
    weatherIcon = document.getElementById("weather-icon");
    weatherDescriptionText = document.getElementById("weather-description");

    timeText = document.getElementById("time-text");

    calender = document.getElementById("calender");

    spotifyProgressBar = document.getElementById("spotify-progress");
    spotifyName = document.getElementById("spotify-name");
    spotifyArtist = document.getElementById("spotify-artist");

    GetConfig();
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

let spotifyResponse;

function UpdateSpotify(){
    let request = new XMLHttpRequest();

    request.addEventListener("load", function() {
        if (request.status === 200){

            spotifyResponse = JSON.parse(request.responseText);

            spotifyName.innerText = spotifyResponse.item.name;
            spotifyArtist.innerText = spotifyResponse.item.artists[0].name;
            spotifyProgressBar.style.width = (spotifyResponse.progress_ms / spotifyResponse.item.duration_ms) * 100 + "%";
        }
        else
        {
            console.log("ERROR");
        }

    }, false);

    request.addEventListener("error", function () {
        console.log("ERROR");
    }, false);

    request.open("GET", "https://api.spotify.com/v1/me/player/currently-playing", true);
    request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Bearer " + config.interface.spotify.oauth);

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
    setInterval(UpdateSpotify, 1000);

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

    let name = config.interface.name;


    if (hours > 5 && hours < 10)
    {
        greetingText.innerText = lang.greetings[0] + " " + name;
    }
    else if (hours > 10 && hours < 14)
    {
        greetingText.innerText = lang.greetings[1] + " " + name;
    }
    else if (hours > 14 && hours < 18)
    {
        greetingText.innerText = lang.greetings[2] + " " + name;
    }
    else if (hours > 18 && hours < 22)
    {
        greetingText.innerText = lang.greetings[3] + " " + name;
    }
    else
    {
        greetingText.innerText = lang.greetings[4] + " " + name;
    }
}

function UpdateWeather() {

    let latitude = config.interface.weather.latitude;
    let longitude = config.interface.weather.longitude;
    let apiKey = config.interface.weather.apiKey;
    let unit;

    if (lang.units == "us"){
        unit = "\u2109";
    } else {
        unit = "\u2103";
    }

    let request = new XMLHttpRequest();

    request.addEventListener("load", function() {
        if (request.status === 200){
            let weatherData = JSON.parse(request.responseText);
            console.log(weatherData);
            weatherTemperatureText.innerText = Math.round(weatherData.currently.temperature) + " " + unit;
            weatherDescriptionText.innerText = weatherData.currently.summary;

            let className = "fas fa-4x d-inline-block align-middle ";

            switch (weatherData.currently.icon) {

                case "clear-day":
                    className += "fa-sun";
                    break;

                case "clear-night":
                    className += "fa-moon";
                    break;

                case "partly-cloudy-day":
                    className += "fa-cloud-sun";
                    break;

                case "partly-cloudy-night":
                    className += "fa-cloud-moon";
                    break;

                case "cloudy":
                    className += "fa-cloud";
                    break;

                case "sleet":
                case "rain":
                    className += "fa-cloud-showers-heavy";
                    break;

                case "snow":
                    className += "fa-snowflake";
                    break;

                case "fog":
                    className += "fa-smog";
                    break;

                default:
                    className += "fa-times-circle";
                    console.log("Invalid icon: ", weatherData.currently.icon);
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

    let apiLang = lang.lang.split("-");

    request.open("GET", "https://api.darksky.net/forecast/" + apiKey  + "/" + latitude + ","+ longitude + "?exclude=minutely,hourly,daily,alerts,flags" + "&lang=" + apiLang[0] + "&units=" + lang.units, true);
    request.send();
}

function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

let calenderItems = [];
let currentCalenderItem = 0;

let isStarted = false;

let newCalenderItems = [];

function GetCalender(i){
    ical.fromURL(config.interface.calender.icalUrls[i], {}, function(err, data){
        if (err) console.error("Calender: " + err);
        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                let ev = data[k];
                if (data[k].type === 'VEVENT') {
                    if (sameDay(ev.start, new Date()) || sameDay(ev.start, new Date(new Date().getTime() + 24 * 60 * 60 * 1000))){
                        let item = {
                            "title": ev.summary,
                            "startDate": ev.start,
                            "endDate": ev.end,
                            "location": ev.location,
                            "description": ev.description
                        };
                        newCalenderItems.push(item);
                    }
                }
            }
        }
        i++;
        if (i < config.interface.calender.icalUrls.length){
            GetCalender(i);
        }
        else
        {
            newCalenderItems.sort(function(a,b){
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return a.startDate.getTime() - b.startDate.getTime();
            });

            calenderItems = newCalenderItems;

            if (!isStarted){
                isStarted = true;
                NextCalenderItem();
            }
        }
    });
}

function UpdateCalender(){
    newCalenderItems = [];
    GetCalender(0);
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

                let day = document.createElement("H1");
                day.className = "calender-day display-4";
                day.innerText = sameDay(item.startDate, new Date()) ? lang.strings.today : lang.strings.tomorrow;
                calender.appendChild(day);

                let title = document.createElement("H1");
                title.className = "calender-title";
                title.innerText = item.title === "" ? "(no title)" : item.title;
                calender.appendChild(title);

                if (!(item.startDate.getHours() === 0 && item.startDate.getMinutes() === 0 && item.endDate.getHours() === 0 && item.endDate.getMinutes() === 0)){
                    let time = document.createElement("DIV");
                    time.className = "calender-big d-block";

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
                    location.className = "calender-big d-block";

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
