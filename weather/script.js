const apiKey = 'a58b4a2d443e75d2c87b02e3b3c17f77';
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const forecastDisplay = document.getElementById('forecastDisplay');
const tempToggle = document.getElementById('tempToggle');
const currentWeatherBtn = document.getElementById('currentWeatherBtn');
const currentWeather = document.getElementById('currentWeather');
const suggestionsContainer = document.getElementById('suggestions');

let isCelsius = true;
let currentDataType = 'city';

searchBtn.addEventListener('click', () => {
    currentDataType = 'city';
    const city = searchInput.value.trim();
    if (city) fetchWeatherData(city);
});

tempToggle.addEventListener('change', () => {
    isCelsius = !isCelsius;
    if (currentDataType === 'city') {
        const city = searchInput.value.trim();
        if (city) fetchWeatherData(city);
    } else if (currentDataType === 'location') {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByLocation(latitude, longitude);
            });
        }
    }
});

currentWeatherBtn.addEventListener('click', () => {
    currentDataType = 'location';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByLocation(latitude, longitude);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

function fetchWeatherData(city) {
    const units = isCelsius ? 'metric' : 'imperial';
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${apiKey}`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => displayCurrentWeather(data))
        .catch(error => console.error('Error fetching current weather:', error));

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => console.error('Error fetching forecast:', error));
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (query.length > 1) {
        fetchCitySuggestions(query);
    } else {
        suggestionsContainer.innerHTML = '';
    }
});

function fetchCitySuggestions(query) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => displaySuggestions(data))
        .catch(error => console.error('Error fetching city suggestions:', error));
}

function displaySuggestions(cities) {
    suggestionsContainer.innerHTML = cities.map(city => 
        `<div class="suggestion-item" data-city="${city.name}, ${city.country}">${city.name}, ${city.country}</div>`
    ).join('');

    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            searchInput.value = item.getAttribute('data-city');
            suggestionsContainer.innerHTML = '';
            fetchWeatherData(searchInput.value);
        });
    });
}

currentWeatherBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByLocation(latitude, longitude);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

function fetchWeatherData(city) {
    const units = isCelsius ? 'metric' : 'imperial';
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${apiKey}`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => displayCurrentWeather(data))
        .catch(error => console.error('Error fetching current weather:', error));

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => console.error('Error fetching forecast:', error));
}

function displayCurrentWeather(data) {
    const { main, weather, wind, name } = data;
    
    weatherDisplay.innerHTML = `
        <h2>${name}</h2>
        <p>${weather[0].description}</p>
        <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="weather icon">
        <p>Temperature: ${main.temp}°${isCelsius ? 'C' : 'F'}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>
    `;
    
    currentWeather.style.display = 'block';
    document.querySelector('.weather__curfore').style.display = 'block';
}

function displayForecast(data) {
    const forecast = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    
    forecastDisplay.innerHTML = forecast.map(day => {
        const date = new Date(day.dt * 1000);
        const weekday = date.toLocaleString('en-US', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString();

        return `
            <div class="forecast-item">
                <div class="forecast-item-header">${weekday}</div>
                <div>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon">
                    <p>${day.weather[0].description}</p>
                    <p>High: ${day.main.temp_max}°${isCelsius ? 'C' : 'F'}</p>
                    <p>Low: ${day.main.temp_min}°${isCelsius ? 'C' : 'F'}</p>
                </div>
                <div class="forecast-item-footer">${formattedDate}</div>
            </div>
        `;
    }).join('');

    forecastDisplay.style.display = 'grid';
    document.querySelector('.weather__curfore').style.display = 'block';
}


function fetchWeatherByLocation(lat, lon) {
    const units = isCelsius ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            fetchWeatherForecast(lat, lon);
        })
        .catch(error => console.error('Error fetching location weather:', error));
}

function fetchWeatherForecast(lat, lon) {
    const units = isCelsius ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => console.error('Error fetching forecast for location:', error));
}
