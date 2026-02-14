const API_KEY = "e42c6cd592a17c6a9dda4120bf645170"; // Your Key
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/forecast";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const weatherContainer = document.getElementById("weather-container");
const errorMsg = document.getElementById("error-msg");
const forecastContainer = document.getElementById("forecast-container");
const recentCitiesSelect = document.getElementById("recent-cities");

async function getWeatherData(city) {
    const url = `${WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();
        return data;
    } catch (error) {
        showError(error.message);
        return null;
    }
}


function updateCurrentWeather(data) {
    const current = data.list[0];
    weatherContainer.classList.remove("hidden");
    errorMsg.classList.add("hidden");

    document.getElementById("city-name").textContent = data.city.name;
    document.getElementById("weather-date").textContent = new Date(current.dt_txt).toDateString();
    document.getElementById("temperature").textContent = `${Math.round(current.main.temp)}°C`;
    document.getElementById("description").textContent = current.weather[0].description;
    document.getElementById("wind-speed").textContent = `${current.wind.speed} m/s`;
    document.getElementById("humidity").textContent = `${current.main.humidity}%`;
    
    
    const iconCode = current.weather[0].icon;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}


function updateForecast(data) {
    forecastContainer.innerHTML = ""; 
    
    const dailyForecast = data.list.filter(reading => reading.dt_txt.includes("12:00:00"));

    dailyForecast.forEach(day => {
        const date = new Date(day.dt_txt).toLocaleDateString();
        const icon = day.weather[0].icon;
        const temp = Math.round(day.main.temp);
        const wind = day.wind.speed;
        const humidity = day.main.humidity;

        const card = `
            <div class="bg-white p-4 rounded shadow flex justify-between items-center hover:bg-gray-50 transition">
                <span class="font-bold text-gray-700 w-24">${date}</span>
                <div class="flex items-center">
                    <img src="https://openweathermap.org/img/wn/${icon}.png" class="w-10 h-10">
                    <span class="font-bold text-xl ml-2">${temp}°C</span>
                </div>
                <div class="text-sm text-gray-500 hidden sm:block">
                    <p>💨 ${wind} m/s</p>
                    <p>💧 ${humidity}%</p>
                </div>
            </div>
        `;
        forecastContainer.innerHTML += card;
    });
}


function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove("hidden");
    setTimeout(() => errorMsg.classList.add("hidden"), 3000);
}



searchBtn.addEventListener("click", async () => {
    const city = cityInput.value.trim();
    if (!city) return;

    const data = await getWeatherData(city);
    if (data) {
        updateCurrentWeather(data);
        updateForecast(data);
    }
});