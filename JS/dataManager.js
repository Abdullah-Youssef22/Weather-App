const searchingForm = document.querySelector(".searching-form");
const cityInput = document.getElementById("city-name");
const dataSection = document.getElementById(
    "displaying-city-weather-section"
);
const suggestions = document.getElementById("suggestions");

let city = "";
let selectedPlace = null;


// ==================================================
// Search Suggestions
// ==================================================

cityInput.addEventListener("input", async () => {
    const value = cityInput.value.trim();

    // User changed the input, so the previous selection is no longer valid
    selectedPlace = null;

    if (value.length < 2) {
        clearSuggestions();
        return;
    }

    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                value
            )}&count=5&language=en&format=json`
        );

        if (!response.ok) {
            throw new Error("Geocoding request failed");
        }

        const data = await response.json();

        displaySuggestions(data.results || []);
    } catch (error) {
        console.error("Suggestions Error:", error);
        clearSuggestions();
    }
});


function displaySuggestions(places) {
    suggestions.innerHTML = "";

    places.forEach(place => {
        const suggestion = document.createElement("div");

        suggestion.classList.add("suggestion");

        suggestion.innerText = `${place.name}, ${place.country}`;

        suggestion.addEventListener("click", () => {
            cityInput.value = place.name;

            selectedPlace = place;

            clearSuggestions();
        });

        suggestions.appendChild(suggestion);
    });
}


function clearSuggestions() {
    suggestions.innerHTML = "";
}


// ==================================================
// Form Submit
// ==================================================

searchingForm.addEventListener("submit", async event => {
    event.preventDefault();

    city = cityInput.value.trim();

    if (!city) {
        displayError("Please enter a city");
        return;
    }

    clearSuggestions();
    clearWeatherData();

    try {
        let coordinates;

        // ------------------------------------------
        // If user selected a suggestion
        // ------------------------------------------

        if (selectedPlace) {
            coordinates = {
                latitude: selectedPlace.latitude,
                longitude: selectedPlace.longitude
            };
        }

        // ------------------------------------------
        // If user typed the city manually
        // ------------------------------------------

        else {
            coordinates = await getCoordinates(city);
        }

        // ------------------------------------------
        // Get weather
        // ------------------------------------------

        await getWeather(coordinates);

    } catch (error) {
        console.error("Search Error:", error);

        displayError(error.message);
    }
});


// ==================================================
// Get Coordinates
// ==================================================

async function getCoordinates(cityName) {

    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            cityName
        )}&count=1&language=en&format=json`
    );

    if (!response.ok) {
        throw new Error("Could not find the city");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found");
    }

    return {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude
    };
}


// ==================================================
// Get Weather
// ==================================================

async function getWeather(coordinates) {

    const { latitude, longitude } = coordinates;

    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,weather_code,apparent_temperature,cloud_cover,is_day&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset&timezone=auto`
    );

    if (!response.ok) {
        throw new Error("Weather API request failed");
    }

    const data = await response.json();

    console.log("Weather Data:", data);

    displayCurrentWeather(data);
    displayForecast(data);
}


// ==================================================
// Clear Previous Weather
// ==================================================

function clearWeatherData() {

    dataSection.classList.remove("error");

    dataSection.innerHTML = `
        <div
            class="current-data"
            id="current-data"
        ></div>

        <div
            id="forecast-contaner"
        ></div>
    `;
}


// ==================================================
// Current Weather
// ==================================================

function displayCurrentWeather(data) {

    makeCurrentDataHTML();

    const current = data.current;
    const daily = data.daily;

    displayCurrentDate();

    // Temperature
    document.getElementById(
        "current-lowest-temp"
    ).innerText =
        `Lowest: ⬇️ ${daily.temperature_2m_min[0]}°C`;

    document.getElementById(
        "current-temperature"
    ).innerText =
        `${current.temperature_2m}°C`;

    document.getElementById(
        "current-highest-temp"
    ).innerText =
        `Highest: ⬆️ ${daily.temperature_2m_max[0]}°C`;

    document.getElementById(
        "current-feels-like"
    ).innerText =
        `Feels like: ${current.apparent_temperature}°C`;


    // Humidity
    document.getElementById(
        "current-humidity"
    ).innerText =
        `Humidity: ${current.relative_humidity_2m}%`;


    // Wind
    document.getElementById(
        "current-wind-speed"
    ).innerText =
        `Wind Speed: ${current.wind_speed_10m} km/h`;

    document.getElementById(
        "current-wind-gusts"
    ).innerText =
        `Wind Gusts: ${current.wind_gusts_10m} km/h`;


    // Wind Direction
    document.getElementById(
        "current-compass-arrow"
    ).style.transform =
        `rotate(${current.wind_direction_10m}deg)`;


    // Precipitation
    document.getElementById(
        "current-rain-probability"
    ).innerText =
        `Precipitation: ${current.precipitation} mm`;


    // Weather Icon
    displayWeatherAnimation(
        false,
        current.weather_code,
        current.is_day
    );


    // Sunrise / Sunset
    displaySunData(data);
}


// ==================================================
// Current Date
// ==================================================

function displayCurrentDate() {

    const currentDate =
        document.getElementById("current-date");

    const currentCity =
        document.getElementById("current-city");

    const date = new Date();

    const dayName =
        date.toLocaleDateString("en-US", {
            weekday: "long"
        });

    const formattedDate =
        date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric"
        });

    currentCity.innerText = city;

    currentDate.innerText =
        `${dayName}: ${formattedDate}`;
}


// ==================================================
// Sunrise / Sunset
// ==================================================

function displaySunData(data) {

    const currentSun =
        document.getElementById("current-sun");

    const sunrise =
        data.daily.sunrise[0].split("T")[1];

    const sunset =
        data.daily.sunset[0].split("T")[1];

    currentSun.innerHTML = `
        <p>🌄 Sunrise: ${sunrise}</p>
        <p>🌆 Sunset: ${sunset}</p>
    `;
}


// ==================================================
// Forecast
// ==================================================

function displayForecast(data) {

    const forecastContainer =
        document.getElementById("forecast-contaner");

    const firstRow =
        document.createElement("div");

    const secondRow =
        document.createElement("div");

    firstRow.classList.add("forecast-div");
    secondRow.classList.add("forecast-div");


    // Next 6 days
    for (let i = 1; i < 7; i++) {

        const forecastCard =
            createForecastCard(data, i);

        if (i <= 3) {
            firstRow.appendChild(forecastCard);
        } else {
            secondRow.appendChild(forecastCard);
        }
    }


    forecastContainer.appendChild(firstRow);
    forecastContainer.appendChild(secondRow);
}


// ==================================================
// Create Forecast Card
// ==================================================

function createForecastCard(data, index) {

    const daily = data.daily;

    const forecastCard =
        document.createElement("div");

    forecastCard.id =
        `forecast-day-${index}`;

    forecastCard.classList.add("forecast");


    // ------------------------------------------
    // Date
    // ------------------------------------------

    const date =
        new Date(`${daily.time[index]}T12:00:00`);

    const dayName =
        date.toLocaleDateString("en-US", {
            weekday: "long"
        });

    const formattedDate =
        date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric"
        });


    // ------------------------------------------
    // Weather Icon
    // ------------------------------------------

    const weatherIcon =
        displayWeatherAnimation(
            true,
            daily.weather_code[index],
            null
        );


    forecastCard.innerHTML = `
        <div class="city">
            ${city}
        </div>

        <div class="date">
            ${dayName}: ${formattedDate}
        </div>

        <div
            class="Centered-item"
            style="font-size: 50px;"
        >
            ${weatherIcon}
        </div>

        <div>
            <span>
                Lowest:
                ⬇️ ${daily.temperature_2m_min[index]}°C
            </span>

            <span>
                Highest:
                ⬆️ ${daily.temperature_2m_max[index]}°C
            </span>
        </div>

        <div class="sun">

            <p>
                🌄 Sunrise:
                ${daily.sunrise[index].split("T")[1]}
            </p>

            <p>
                🌆 Sunset:
                ${daily.sunset[index].split("T")[1]}
            </p>

        </div>
    `;


    // ------------------------------------------
    // Precipitation
    // ------------------------------------------

    forecastCard.appendChild(
        createPrecipitationElement(daily, index)
    );


    // ------------------------------------------
    // Wind
    // ------------------------------------------

    forecastCard.appendChild(
        createWindElement(daily, index)
    );


    return forecastCard;
}


// ==================================================
// Precipitation Element
// ==================================================

function createPrecipitationElement(daily, index) {

    const precipitation =
        document.createElement("div");

    precipitation.style.cssText = `
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 15px 0;
    `;

    precipitation.innerHTML = `
        <div style="font-size: 34px;">
            🌧️
        </div>

        <div>

            <p>
                Precipitation probability:
                ${daily.precipitation_probability_max[index]}%
            </p>

            <p>
                Precipitation sum:
                ${daily.precipitation_sum[index]} mm
            </p>

        </div>
    `;

    return precipitation;
}


// ==================================================
// Wind Element
// ==================================================

function createWindElement(daily, index) {

    const wind =
        document.createElement("div");

    wind.style.cssText = `
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 15px 0;
    `;

    wind.innerHTML = `
        <div style="font-size: 34px;">
            💨
        </div>

        <div>

            <p>
                Wind Speed:
                ${daily.wind_speed_10m_max[index]} km/h
            </p>

            <p>
                Wind Gusts:
                ${daily.wind_gusts_10m_max[index]} km/h
            </p>

        </div>
    `;

    return wind;
}


// ==================================================
// Current Weather HTML
// ==================================================

function makeCurrentDataHTML() {

    const container =
        document.getElementById("current-data");

    container.innerHTML = `

        <div class="current">

            <p
                class="city"
                id="current-city"
            ></p>

            <p
                class="date"
                id="current-date"
            ></p>


            <div
                class="temps"
                id="current-temps"
            >

                <div>

                    <span
                        class="temperature"
                        id="current-temperature"
                    ></span>

                    <span
                        class="weather-animation"
                        id="current-weather-animation"
                    ></span>

                    <span
                        class="feels-like"
                        id="current-feels-like"
                    ></span>

                </div>


                <span
                    class="lowest-temp"
                    id="current-lowest-temp"
                ></span>

                <span
                    class="highest-temp"
                    id="current-highest-temp"
                ></span>

            </div>


            <div
                class="sun"
                id="current-sun"
            ></div>


            <div
                class="humidity-container"
                id="current-humidity-container"
            >

                <span
                    class="humidity-emoji"
                >
                    💧
                </span>

                <span
                    class="humidity"
                    id="current-humidity"
                ></span>

            </div>


            <div
                class="wind"
                id="current-wind"
            >

                <span
                    class="wind-emoji"
                >
                    💨
                </span>

                <span
                    class="wind-speed"
                    id="current-wind-speed"
                ></span>


                <span class="compass">

                    <span class="north">
                        N
                    </span>

                    <span
                        class="compass-arrow"
                        id="current-compass-arrow"
                    >
                        🡅
                    </span>

                </span>


                <span
                    class="wind-gusts"
                    id="current-wind-gusts"
                ></span>

            </div>


            <div
                class="rain-probability-container"
                id="current-rain-probability-container"
            >

                <span
                    class="rain-emoji"
                >
                    🌧️
                </span>

                <span
                    class="rain-probability"
                    id="current-rain-probability"
                ></span>

            </div>

        </div>
    `;
}


// ==================================================
// Weather Animation
// ==================================================

function displayWeatherAnimation(
    isForecast,
    weatherCode,
    isDay
) {

    let animation;

    switch (weatherCode) {

        case 0:
            animation =
                isDay ? "☀️" : "🌙";
            break;

        case 1:
            animation =
                isDay ? "🌤️" : "🌙☁️";
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
        case 96:
        case 99:
            animation = "⛈️";
            break;

        default:
            animation = "❓";
    }


    if (isForecast) {
        return animation;
    }


    const currentWeatherAnimation =
        document.getElementById(
            "current-weather-animation"
        );

    currentWeatherAnimation.innerText =
        animation;

    currentWeatherAnimation.style.fontSize =
        "50px";
}


// ==================================================
// Error
// ==================================================

function displayError(message) {

    dataSection.classList.remove("error");

    dataSection.innerHTML = "";

    const errorContainer =
        document.createElement("div");

    const errorButton =
        document.createElement("button");


    errorContainer.innerText =
        message;

    errorButton.innerText =
        "OK";


    errorButton.style.cssText = `
        color: #fff;
        background-color: #000;
        font-size: 20px;
    `;


    errorContainer.appendChild(errorButton);

    dataSection.appendChild(errorContainer);

    dataSection.classList.add("error");


    errorButton.addEventListener("click", () => {

        dataSection.classList.remove("error");

        clearWeatherData();
    });
}