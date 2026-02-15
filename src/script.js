const API_KEY = "e42c6cd592a17c6a9dda4120bf645170";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/forecast";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const unitBtn = document.getElementById("unit-btn");
const weatherContainer = document.getElementById("weather-container");
const errorMsg = document.getElementById("error-msg");
const forecastContainer = document.getElementById("forecast-container");
const recentCitiesSelect = document.getElementById("recent-cities");

let isCelsius = true; 
let currentTempC = 0; 
document.addEventListener("DOMContentLoaded", loadRecentCities);


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

  currentTempC = Math.round(current.main.temp); 
  
  updateBackground(current.weather[0].main);

  document.getElementById("city-name").textContent = data.city.name;
  document.getElementById("weather-date").textContent = new Date(current.dt_txt).toDateString();
  document.getElementById("description").textContent = current.weather[0].description;
  document.getElementById("wind-speed").textContent = `${current.wind.speed} m/s`;
  document.getElementById("humidity").textContent = `${current.main.humidity}%`;
  
  const iconCode = current.weather[0].icon;
  document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  if (isCelsius) {
      document.getElementById("temperature").textContent = `${currentTempC}°C`;
      unitBtn.textContent = "°C";
  } else {
      const tempF = Math.round((currentTempC * 9/5) + 32);
      document.getElementById("temperature").textContent = `${tempF}°F`;
      unitBtn.textContent = "°F";
  }
}

function updateForecast(data) {
  forecastContainer.innerHTML = "";
  const dailyForecast = data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));

  dailyForecast.forEach((day) => {
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

function updateBackground(condition) {
  const body = document.body;
  
  
  body.className = "min-h-screen flex flex-col items-center p-4 transition-colors duration-500 text-gray-800 relative overflow-hidden";
  
  
  clearEffects(); 

  
  switch (condition) {
    case "Clear":
      body.classList.add("bg-gradient-to-br", "from-blue-400", "to-blue-200");
      break;
      
    case "Clouds":
      body.classList.add("bg-gradient-to-br", "from-gray-300", "to-gray-100");
      createClouds(); 
      break;
      
    case "Rain":
    case "Drizzle":
    case "Thunderstorm":
      body.classList.add("bg-gradient-to-br", "from-gray-800", "to-gray-600");
      createRain(); 
      break;
      
    case "Snow":
      body.classList.add("bg-gradient-to-br", "from-blue-100", "to-white");
      createSnow(); 
      break;
      
    default:
      body.classList.add("bg-blue-50");
  }
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
  setTimeout(() => errorMsg.classList.add("hidden"), 3000);
}

function loadRecentCities() {
  const recent = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (recent.length > 0) {
    recentCitiesSelect.classList.remove("hidden");
    recentCitiesSelect.innerHTML = '<option value="" disabled selected>Recent Cities</option>';
    recent.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      recentCitiesSelect.appendChild(option);
    });
  }
}

function addToRecent(city) {
  let recent = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!recent.includes(city)) {
    recent.push(city);
    if (recent.length > 5) recent.shift();
    localStorage.setItem("recentCities", JSON.stringify(recent));
    loadRecentCities();
  }
}

async function getWeatherByCoords(lat, lon) {
  const url = `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Location not found");
    const data = await response.json();
    if (data) {
        updateCurrentWeather(data);
        updateForecast(data);
        addToRecent(data.city.name);
    }
  } catch (error) {
    showError(error.message);
  }
  locationBtn.textContent = "📍";
}


searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return;
  const data = await getWeatherData(city);
  if (data) {
    updateCurrentWeather(data);
    updateForecast(data);
    addToRecent(data.city.name);
  }
});

recentCitiesSelect.addEventListener("change", async (e) => {
  const city = e.target.value;
  if (!city) return;
  const data = await getWeatherData(city);
  if (data) {
    updateCurrentWeather(data);
    updateForecast(data);
  }
});

unitBtn.addEventListener("click", () => {
    if (currentTempC === 0 && document.getElementById("city-name").textContent === "London") return; 

    if (isCelsius) {
      const tempF = Math.round((currentTempC * 9/5) + 32);
      document.getElementById("temperature").textContent = `${tempF}°F`;
      unitBtn.textContent = "°F";
      isCelsius = false;
    } else {
      document.getElementById("temperature").textContent = `${currentTempC}°C`;
      unitBtn.textContent = "°C";
      isCelsius = true;
    }
});

locationBtn.addEventListener("click", () => {
  locationBtn.textContent = "⏳";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation failed. Using fallback.");
        showError("⚠️ GPS unavailable. Showing London for demo.");
        getWeatherByCoords(51.5074, -0.1278); 
      }
    );
  } else {
    showError("Geolocation is not supported.");
    locationBtn.textContent = "📍";
  }
});


const effectsContainer = document.getElementById("weather-effects");

function clearEffects() {
  effectsContainer.innerHTML = ""; 
}

function createRain() {
  clearEffects();
  const dropCount = 100; 

  for (let i = 0; i < dropCount; i++) {
    const drop = document.createElement("div");
    drop.classList.add("raindrop");
    
    drop.style.left = `${Math.random() * 100}vw`;
    drop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`; 
    drop.style.animationDelay = `${Math.random() * 2}s`;
    
    effectsContainer.appendChild(drop);
  }
}

function createSnow() {
  clearEffects();
  const flakeCount = 50;

  for (let i = 0; i < flakeCount; i++) {
    const flake = document.createElement("div");
    flake.classList.add("snowflake");
    
    const size = Math.random() * 5 + 2 + "px"; 
    flake.style.width = size;
    flake.style.height = size;
    flake.style.left = `${Math.random() * 100}vw`;
    flake.style.animationDuration = `${Math.random() * 3 + 2}s`; 
    flake.style.animationDelay = `${Math.random() * 5}s`;
    
    effectsContainer.appendChild(flake);
  }
}

function createClouds() {
  clearEffects();
  const cloudCount = 5;

  for (let i = 0; i < cloudCount; i++) {
    const cloud = document.createElement("img");
    cloud.src = "https://openweathermap.org/img/wn/03d@4x.png"; 
    cloud.classList.add("cloud-anim");
    
    cloud.style.top = `${Math.random() * 50}vh`; 
    cloud.style.width = `${Math.random() * 100 + 100}px`; 
    cloud.style.opacity = "0.6";
    cloud.style.animationDuration = `${Math.random() * 20 + 30}s`;
    cloud.style.animationDelay = `-${Math.random() * 20}s`; 
    
    effectsContainer.appendChild(cloud);
  }
}