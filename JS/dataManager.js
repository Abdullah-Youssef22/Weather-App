const city = "Giza";
let latitude;
let longitude;
fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then(response => response.json())
    .then(data => {
        latitude = data.results[0].latitude;
        longitude = data.results[0].longitude;
        getWeather()
    });

function getWeather() {
    fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,weather_code,apparent_temperature,cloud_cover,is_day&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset&timezone=auto`
    )
        .then(response => response.json())
        .then(data => {
            displayDate();
            const current_lowest_temp = document.getElementById("current-lowest-temp");
            current_lowest_temp.innerHTML = ` Lowest: ⬇️${data.daily.temperature_2m_min[0]}Cْ   `;
            const current_temperature = document.getElementById("current-temperature");
            current_temperature.innerText = ` ${data.current.temperature_2m}Cْ    `;
            const current_highest_temp = document.getElementById("current-highest-temp");
            current_highest_temp.innerHTML = ` Highest: ⬆️${data.daily.temperature_2m_max[0]}Cْ   `;
            const current_humidity = document.getElementById("current-humidity");
            current_humidity.innerText = `${data.current.relative_humidity_2m}%`
            const current_wind_speed = document.getElementById("current-wind-speed");
            current_wind_speed.innerText = `${data.current.wind_speed_10m}`
            const current_compass_arrow = document.getElementById("current-compass-arrow");
            current_compass_arrow.style.transform = `rotate(${data.current.wind_direction_10m}deg)`;
            const current_wind_gusts = document.getElementById("current-wind-gusts");
            current_wind_gusts.innerText = `Wind Gusts: ${data.current.wind_gusts_10m}`
            const current_rain_probability = document.getElementById("current-rain-probability");
            current_rain_probability.innerText = `Raining Propaility: ${data.current.precipitation}`
            console.log(data);
            const code=data.current.weather_code;
            const isDay=data.current.is_day;
            displayWeatherAnimation(code,isDay);
            for (let i = 1; i < 7; i++) {

            }
        });
}

function displayDate() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const current_date = document.getElementById("current-date");
    const current_city = document.getElementById("current-city");
    current_city.innerText = `${city}`
    current_date.innerText = `${days[new Date().getDay()]}: ${new Date().getFullYear()} / ${new Date().getMonth() + 1} / ${new Date().getDate()}`;
}

function displayWeatherAnimation(weatherCode, isDay) {
    let animation;

    switch (weatherCode) {
    case 0:
        animation = isDay ? "☀️" : "🌙";
        break;

    case 1:
        animation = isDay ? "🌤️" : "🌙☁️";
        break;

    case 2:
        animation = "⛅";
        break;

    case 3:
        animation = "☁️";
        break;

    case 45:
    case 48:
        animation = "🌫️";
        break;

    case 51:
    case 53:
    case 55:
        animation = "🌦️";
        break;

    case 56:
    case 57:
        animation = "🌧️";
        break;

    case 61:
    case 63:
    case 65:
        animation = "🌧️";
        break;

    case 66:
    case 67:
        animation = "🌧️❄️";
        break;

    case 71:
    case 73:
    case 75:
        animation = "🌨️";
        break;

    case 77:
        animation = "❄️";
        break;

    case 80:
    case 81:
    case 82:
        animation = "🌦️";
        break;

    case 85:
    case 86:
        animation = "🌨️";
        break;

    case 95:
        animation = "⛈️";
        break;

    case 96:
    case 99:
        animation = "⛈️";
        break;

    default:
        animation = "❓";
    }

    const current_weather_animation=document.getElementById("current-weather-animation");
    current_weather_animation.innerHTML = `${animation}`;
}