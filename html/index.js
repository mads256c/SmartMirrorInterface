document.addEventListener('DOMContentLoaded', OnDocumentLoad, false);

let greetingText;

let weatherTemperatureText;
let weatherIcon;

let timeText;

function OnDocumentLoad() {
    greetingText = document.getElementById("greeting");

    weatherTemperatureText = document.getElementById("weather-temperature");
    weatherIcon = document.getElementById("weather-icon");

    timeText = document.getElementById("time-text");

    OnUpdate();
    setInterval(OnUpdate, 1000);
}

function OnUpdate() {
    UpdateTime();
}

function UpdateTime() {
    let now = new Date();
    timeText.innerText = now.toLocaleTimeString('en-US', {
        hour12: false,
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