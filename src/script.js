import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  msToMph,
  msToKmh,
  hPaToInHg,
  metersToKm,
  metersToMiles,
  getWindDirection,
  getAqiInfo,
  getUvInfo,
  formatLocalTime,
  isNightTime,
  groupForecastByDay,
} from "./utils.js";

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
const API_KEY = "e42c6cd592a17c6a9dda4120bf645170";
const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5";
const GEO_BASE = "https://api.openweathermap.org/geo/1.0";
const OPENMETEO_BASE = "https://api.open-meteo.com/v1/forecast";
const OPENMETEO_GEO = "https://geocoding-api.open-meteo.com/v1/search";

// ==========================================
// STATE MANAGEMENT
// ==========================================
const state = {
  isCelsius: localStorage.getItem("skycast_units") !== "F",
  currentCity: {
    name: "London",
    country: "GB",
    lat: 51.5074,
    lon: -0.1278,
    timezoneOffset: 0,
  },
  weather: null,
  forecastList: [],
  dailyList: [],
  hourlyList: [],
  aqi: null,
  uvIndex: 0,
  favorites: JSON.parse(localStorage.getItem("skycast_favorites")) || [],
  recents: JSON.parse(localStorage.getItem("skycast_recents")) || [],
  isAudioActive: false,
  map: null,
  mapMarker: null,
  mapTileLayer: null,
  currentMapLayerName: "clouds_new",
  audioContext: null,
  audioNodes: {},
  debounceTimer: null,
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const elements = {
  cityInput: document.getElementById("city-input"),
  searchForm: document.getElementById("search-form"),
  searchBtn: document.getElementById("search-btn"),
  clearSearchBtn: document.getElementById("clear-search-btn"),
  suggestionsDropdown: document.getElementById("suggestions-dropdown"),
  locationBtn: document.getElementById("location-btn"),
  unitBtn: document.getElementById("unit-btn"),
  mobileUnitBtn: document.getElementById("mobile-unit-btn"),
  audioBtn: document.getElementById("audio-btn"),
  mobileAudioBtn: document.getElementById("mobile-audio-btn"),
  shareBtn: document.getElementById("share-btn"),
  refreshBtn: document.getElementById("brand-logo"),
  favoriteToggleBtn: document.getElementById("favorite-toggle-btn"),
  favoriteIcon: document.getElementById("favorite-icon"),
  favoritesContainer: document.getElementById("favorites-container"),
  recentContainer: document.getElementById("recent-container"),
  clearRecentBtn: document.getElementById("clear-recent-btn"),
  statusBanner: document.getElementById("status-banner"),
  statusBannerText: document.getElementById("status-banner-text"),
  loadingSpinner: document.getElementById("loading-spinner"),
  weatherContainer: document.getElementById("weather-container"),
  weatherAlert: document.getElementById("weather-alert"),
  alertTitle: document.getElementById("alert-title"),
  alertDesc: document.getElementById("alert-desc"),
  cityName: document.getElementById("city-name"),
  countryBadge: document.getElementById("country-badge"),
  localTime: document.getElementById("local-time"),
  localDate: document.getElementById("local-date"),
  dayNightBadge: document.getElementById("day-night-badge"),
  weatherIcon: document.getElementById("weather-icon"),
  temperature: document.getElementById("temperature"),
  conditionTag: document.getElementById("condition-tag"),
  description: document.getElementById("description"),
  tempLow: document.getElementById("temp-low"),
  tempHigh: document.getElementById("temp-high"),
  feelsLike: document.getElementById("feels-like"),
  quickWind: document.getElementById("quick-wind"),
  quickHumidity: document.getElementById("quick-humidity"),
  forecastContainer: document.getElementById("forecast-container"),
  hourlyContainer: document.getElementById("hourly-forecast-container"),
  hourlyPrevBtn: document.getElementById("hourly-prev-btn"),
  hourlyNextBtn: document.getElementById("hourly-next-btn"),
  // Detailed Metrics
  aqiBadge: document.getElementById("aqi-badge"),
  aqiValue: document.getElementById("aqi-value"),
  aqiLevelText: document.getElementById("aqi-level-text"),
  aqiAdvice: document.getElementById("aqi-advice"),
  pm25Val: document.getElementById("pm25-val"),
  pm10Val: document.getElementById("pm10-val"),
  uvBadge: document.getElementById("uv-badge"),
  uvValue: document.getElementById("uv-value"),
  uvLevelText: document.getElementById("uv-level-text"),
  uvAdvice: document.getElementById("uv-advice"),
  uvProgress: document.getElementById("uv-progress"),
  daylightHours: document.getElementById("daylight-hours"),
  sunriseTime: document.getElementById("sunrise-time"),
  sunsetTime: document.getElementById("sunset-time"),
  solarProgress: document.getElementById("solar-progress"),
  solarStatusText: document.getElementById("solar-status-text"),
  windDirectionCardinal: document.getElementById("wind-direction-cardinal"),
  windSpeedVal: document.getElementById("wind-speed-val"),
  windSpeedUnit: document.getElementById("wind-speed-unit"),
  windGusts: document.getElementById("wind-gusts"),
  compassNeedle: document.getElementById("compass-needle"),
  windDeg: document.getElementById("wind-deg"),
  humidityBadge: document.getElementById("humidity-badge"),
  humidityVal: document.getElementById("humidity-val"),
  dewPoint: document.getElementById("dew-point"),
  humidityBar: document.getElementById("humidity-bar"),
  visibilityBadge: document.getElementById("visibility-badge"),
  visibilityVal: document.getElementById("visibility-val"),
  visibilityUnit: document.getElementById("visibility-unit"),
  visibilityDesc: document.getElementById("visibility-desc"),
  fogRisk: document.getElementById("fog-risk"),
  pressureBadge: document.getElementById("pressure-badge"),
  pressureVal: document.getElementById("pressure-val"),
  pressureUnit: document.getElementById("pressure-unit"),
  pressureDesc: document.getElementById("pressure-desc"),
  seaLevelVal: document.getElementById("sea-level-val"),
  popBadge: document.getElementById("pop-badge"),
  cloudVal: document.getElementById("cloud-val"),
  precipDesc: document.getElementById("precip-desc"),
  rainChance: document.getElementById("rain-chance"),
  weatherEffects: document.getElementById("weather-effects"),
  lightningEffect: document.getElementById("lightning-effect"),
  sunGlowEffect: document.getElementById("sun-glow-effect"),
  shortcutsModalBtn: document.getElementById("shortcuts-modal-btn"),
  shortcutsModal: document.getElementById("shortcuts-modal"),
  closeShortcutsBtn: document.getElementById("close-shortcuts-btn"),
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initLucide();
  initMap();
  setupEventListeners();
  renderFavorites();
  renderRecents();
  updateUnitUI();

  // Load initial location (IP-based geolocation or default)
  detectInitialLocation();
});

function initLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ==========================================
// API & DATA SERVICES
// ==========================================

async function fetchWeatherData(lat, lon, nameHint = "") {
  showLoading(true);
  try {
    // 1. Fetch Current Weather
    const weatherUrl = `${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const weatherRes = await fetch(weatherUrl);
    
    let currentData;
    if (weatherRes.ok) {
      currentData = await weatherRes.json();
    } else {
      // Fallback to Open-Meteo if OpenWeather fails
      console.warn("OpenWeather current API failed, fetching Open-Meteo fallback...");
      currentData = await fetchOpenMeteoCurrent(lat, lon, nameHint);
    }

    // 2. Fetch 5-Day / 3-Hour Forecast
    const forecastUrl = `${OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const forecastRes = await fetch(forecastUrl);
    let forecastData;
    if (forecastRes.ok) {
      forecastData = await forecastRes.json();
    } else {
      forecastData = await fetchOpenMeteoForecast(lat, lon);
    }

    // 3. Fetch Air Pollution
    let aqiData = null;
    try {
      const aqiUrl = `${OPENWEATHER_BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
      const aqiRes = await fetch(aqiUrl);
      if (aqiRes.ok) {
        const json = await aqiRes.json();
        aqiData = json.list ? json.list[0] : null;
      }
    } catch (e) {
      console.warn("AQI fetch failed:", e);
    }

    // 4. Fetch UV Index from Open-Meteo
    let uvIndex = 0;
    try {
      const uvUrl = `${OPENMETEO_BASE}?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`;
      const uvRes = await fetch(uvUrl);
      if (uvRes.ok) {
        const uvJson = await uvRes.json();
        if (uvJson.daily && uvJson.daily.uv_index_max && uvJson.daily.uv_index_max.length > 0) {
          uvIndex = Math.round(uvJson.daily.uv_index_max[0]);
        }
      }
    } catch (e) {
      console.warn("UV fetch failed:", e);
    }

    // Update state
    state.weather = currentData;
    state.currentCity = {
      name: nameHint || currentData.name || "Unknown City",
      country: currentData.sys?.country || "",
      lat,
      lon,
      timezoneOffset: currentData.timezone || 0,
    };
    state.forecastList = forecastData.list || [];
    state.hourlyList = state.forecastList.slice(0, 16); // Next 48 hours (3h intervals)
    state.dailyList = groupForecastByDay(state.forecastList, state.currentCity.timezoneOffset);
    state.aqi = aqiData;
    state.uvIndex = uvIndex;

    // Save to recents
    addToRecent(state.currentCity);

    // Render all UI components
    renderDashboard();
    showToast(`Loaded weather for ${state.currentCity.name}`, "success");
  } catch (error) {
    console.error("Weather fetch error:", error);
    showToast(error.message || "Unable to fetch weather data. Please try again.", "error");
  } finally {
    showLoading(false);
  }
}

async function fetchOpenMeteoCurrent(lat, lon, nameHint) {
  const url = `${OPENMETEO_BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather data from fallback provider");
  const data = await res.json();

  const weatherCodeInfo = mapWmoCode(data.current.weather_code, data.current.is_day);

  return {
    name: nameHint || "Location",
    coord: { lat, lon },
    timezone: data.utc_offset_seconds || 0,
    dt: Math.floor(Date.now() / 1000),
    main: {
      temp: data.current.temperature_2m,
      feels_like: data.current.apparent_temperature,
      temp_min: data.current.temperature_2m - 2,
      temp_max: data.current.temperature_2m + 2,
      pressure: Math.round(data.current.surface_pressure),
      humidity: data.current.relative_humidity_2m,
    },
    visibility: 10000,
    wind: {
      speed: parseFloat((data.current.wind_speed_10m / 3.6).toFixed(1)), // convert km/h to m/s
      deg: data.current.wind_direction_10m,
      gust: parseFloat((data.current.wind_gusts_10m / 3.6).toFixed(1)),
    },
    clouds: { all: 20 },
    weather: [
      {
        id: data.current.weather_code,
        main: weatherCodeInfo.main,
        description: weatherCodeInfo.description,
        icon: weatherCodeInfo.icon,
      },
    ],
    sys: {
      country: "",
      sunrise: data.daily?.sunrise ? Math.floor(new Date(data.daily.sunrise[0]).getTime() / 1000) : 0,
      sunset: data.daily?.sunset ? Math.floor(new Date(data.daily.sunset[0]).getTime() / 1000) : 0,
    },
  };
}

async function fetchOpenMeteoForecast(lat, lon) {
  const url = `${OPENMETEO_BASE}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) return { list: [] };
  const data = await res.json();

  const list = [];
  const times = data.hourly.time || [];
  for (let i = 0; i < times.length; i += 3) {
    const dt = Math.floor(new Date(times[i]).getTime() / 1000);
    const code = data.hourly.weather_code[i];
    const info = mapWmoCode(code, 1);
    list.push({
      dt,
      main: {
        temp: data.hourly.temperature_2m[i],
        humidity: data.hourly.relative_humidity_2m[i],
      },
      weather: [{ main: info.main, description: info.description, icon: info.icon }],
      wind: { speed: parseFloat((data.hourly.wind_speed_10m[i] / 3.6).toFixed(1)) },
      pop: (data.hourly.precipitation_probability[i] || 0) / 100,
    });
  }
  return { list };
}

function mapWmoCode(code, isDay = 1) {
  const suffix = isDay ? "d" : "n";
  if (code === 0) return { main: "Clear", description: "Clear sky", icon: `01${suffix}` };
  if (code <= 3) return { main: "Clouds", description: "Partly cloudy", icon: `02${suffix}` };
  if (code <= 48) return { main: "Mist", description: "Foggy & mist", icon: `50${suffix}` };
  if (code <= 55) return { main: "Drizzle", description: "Light drizzle", icon: `09${suffix}` };
  if (code <= 65) return { main: "Rain", description: "Rain showers", icon: `10${suffix}` };
  if (code <= 77) return { main: "Snow", description: "Snow fall", icon: `13${suffix}` };
  if (code <= 82) return { main: "Rain", description: "Heavy rain", icon: `10${suffix}` };
  if (code <= 86) return { main: "Snow", description: "Snow showers", icon: `13${suffix}` };
  if (code >= 95) return { main: "Thunderstorm", description: "Thunderstorm with rain", icon: `11${suffix}` };
  return { main: "Clouds", description: "Cloudy", icon: `03${suffix}` };
}

// ==========================================
// SEARCH & AUTOCOMPLETE
// ==========================================

async function fetchSuggestions(query) {
  if (!query || query.trim().length < 2) {
    elements.suggestionsDropdown.classList.add("hidden");
    return;
  }

  try {
    // 1. Try OpenWeather Geocoding
    const geoUrl = `${GEO_BASE}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
    const res = await fetch(geoUrl);
    let items = [];
    if (res.ok) {
      items = await res.json();
    }
    
    // Fallback to OpenMeteo geocoding if needed
    if (!items || items.length === 0) {
      const omRes = await fetch(`${OPENMETEO_GEO}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
      if (omRes.ok) {
        const omJson = await omRes.json();
        if (omJson.results) {
          items = omJson.results.map((r) => ({
            name: r.name,
            country: r.country_code || r.country,
            state: r.admin1 || "",
            lat: r.latitude,
            lon: r.longitude,
          }));
        }
      }
    }

    renderSuggestions(items);
  } catch (error) {
    console.warn("Autocomplete error:", error);
  }
}

function renderSuggestions(locations) {
  if (!locations || locations.length === 0) {
    elements.suggestionsDropdown.classList.add("hidden");
    return;
  }

  elements.suggestionsDropdown.innerHTML = locations
    .map(
      (loc) => `
    <div class="suggestion-item p-3 hover:bg-white/15 cursor-pointer flex items-center justify-between transition-colors duration-150"
         data-lat="${loc.lat}" data-lon="${loc.lon}" data-name="${loc.name}" data-country="${loc.country || ''}">
      <div class="flex items-center gap-2.5">
        <i data-lucide="map-pin" class="w-4 h-4 text-sky-400"></i>
        <div>
          <span class="font-semibold text-white text-sm">${loc.name}</span>
          <span class="text-xs text-slate-400 ml-1.5">${loc.state ? `${loc.state}, ` : ""}${loc.country || ""}</span>
        </div>
      </div>
      <span class="text-[11px] text-slate-500 font-mono">${loc.lat.toFixed(2)}°, ${loc.lon.toFixed(2)}°</span>
    </div>
  `
    )
    .join("");

  elements.suggestionsDropdown.classList.remove("hidden");
  initLucide();

  // Add click listeners to items
  elements.suggestionsDropdown.querySelectorAll(".suggestion-item").forEach((el) => {
    el.addEventListener("click", () => {
      const lat = parseFloat(el.dataset.lat);
      const lon = parseFloat(el.dataset.lon);
      const name = el.dataset.name;
      elements.cityInput.value = "";
      elements.clearSearchBtn.classList.add("hidden");
      elements.suggestionsDropdown.classList.add("hidden");
      fetchWeatherData(lat, lon, name);
    });
  });
}

// ==========================================
// DASHBOARD RENDERING ENGINE
// ==========================================

function renderDashboard() {
  const weather = state.weather;
  if (!weather) return;

  const currentTemp = Math.round(weather.main.temp);
  const feelsLikeTemp = Math.round(weather.main.feels_like);
  const tempMin = Math.round(weather.main.temp_min);
  const tempMax = Math.round(weather.main.temp_max);
  const condition = weather.weather[0].main;
  const description = weather.weather[0].description;
  const iconCode = weather.weather[0].icon;
  const timezoneOffset = state.currentCity.timezoneOffset;

  // 1. Time & Solar Status
  const localTimeData = formatLocalTime(weather.dt, timezoneOffset);
  const night = isNightTime(weather.dt, weather.sys?.sunrise, weather.sys?.sunset);

  elements.cityName.textContent = state.currentCity.name;
  elements.countryBadge.textContent = state.currentCity.country || "LIVE";
  elements.localTime.textContent = localTimeData.timeString;
  elements.localDate.textContent = localTimeData.dateString;

  if (night) {
    elements.dayNightBadge.textContent = "Night";
    elements.dayNightBadge.className = "ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
  } else {
    elements.dayNightBadge.textContent = "Day";
    elements.dayNightBadge.className = "ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30";
  }

  // 2. Temperature & Condition
  elements.temperature.textContent = formatTemp(currentTemp);
  elements.tempLow.textContent = formatTemp(tempMin);
  elements.tempHigh.textContent = formatTemp(tempMax);
  elements.feelsLike.textContent = formatTemp(feelsLikeTemp);
  elements.conditionTag.textContent = condition;
  elements.description.textContent = description;
  elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  // 3. Quick Stats
  elements.quickWind.textContent = formatSpeed(weather.wind.speed);
  elements.quickHumidity.textContent = `${weather.main.humidity}%`;

  // 4. Favorite Icon State
  const isFav = state.favorites.some((f) => f.name.toLowerCase() === state.currentCity.name.toLowerCase());
  elements.favoriteIcon.classList.toggle("fill-amber-400", isFav);
  elements.favoriteIcon.classList.toggle("text-amber-400", isFav);

  // 5. Hourly & Daily Forecasts
  renderHourlyForecast();
  renderDailyForecast();

  // 6. Detailed 8-Metric Grid
  renderDetailedAtmospherics(weather, night);

  // 7. Dynamic Alert Banner
  renderAlerts(weather);

  // 8. Atmospheric Particle Canvas & Background
  updateAtmosphericEffects(condition, night);

  // 9. Update Interactive Map Marker
  updateMap(state.currentCity.lat, state.currentCity.lon, state.currentCity.name, currentTemp, condition);

  initLucide();
}

function renderHourlyForecast() {
  if (!state.hourlyList || state.hourlyList.length === 0) {
    elements.hourlyContainer.innerHTML = `<p class="text-xs text-slate-400 py-4">Hourly data unavailable</p>`;
    return;
  }

  const timezoneOffset = state.currentCity.timezoneOffset;
  elements.hourlyContainer.innerHTML = state.hourlyList
    .map((hour) => {
      const timeInfo = formatLocalTime(hour.dt, timezoneOffset);
      const temp = Math.round(hour.main.temp);
      const icon = hour.weather[0].icon;
      const pop = Math.round((hour.pop || 0) * 100);
      const windSpeed = formatSpeed(hour.wind.speed);

      return `
      <div class="glass-card-hover min-w-[100px] sm:min-w-[115px] p-3.5 flex flex-col items-center justify-between text-center shrink-0">
        <span class="text-xs font-semibold text-slate-300">${timeInfo.timeString.replace(":00", "")}</span>
        <img src="https://openweathermap.org/img/wn/${icon}.png" class="w-12 h-12 my-1 drop-shadow" alt="Forecast icon" />
        <span class="text-base font-bold text-white">${formatTemp(temp)}</span>
        <div class="flex items-center gap-1 text-[11px] text-cyan-300 mt-1 font-medium">
          <i data-lucide="droplets" class="w-3 h-3"></i> ${pop}%
        </div>
        <span class="text-[10px] text-slate-400 mt-0.5">${windSpeed}</span>
      </div>
    `;
    })
    .join("");
}

function renderDailyForecast() {
  if (!state.dailyList || state.dailyList.length === 0) {
    elements.forecastContainer.innerHTML = `<p class="text-xs text-slate-400 py-4">Forecast data unavailable</p>`;
    return;
  }

  elements.forecastContainer.innerHTML = state.dailyList
    .map((day, idx) => {
      const isToday = idx === 0;
      const dayLabel = isToday ? "Today" : day.dayInfo.dayName.slice(0, 3);
      const dateLabel = `${day.dayInfo.monthName} ${day.dayInfo.dayNum}`;
      const min = formatTemp(day.minTemp);
      const max = formatTemp(day.maxTemp);
      const icon = day.weather.icon;
      const pop = day.pop || 0;

      return `
      <div class="py-2.5 flex items-center justify-between gap-3 text-sm hover:bg-white/5 px-2 rounded-xl transition">
        <!-- Day Name -->
        <div class="w-24 shrink-0">
          <p class="font-bold text-white ${isToday ? 'text-sky-400' : ''}">${dayLabel}</p>
          <p class="text-[11px] text-slate-400">${dateLabel}</p>
        </div>

        <!-- Weather Condition & Icon -->
        <div class="flex items-center gap-2 flex-1 justify-center">
          <img src="https://openweathermap.org/img/wn/${icon}.png" class="w-9 h-9" alt="${day.weather.main}" />
          <span class="text-xs font-medium text-slate-300 capitalize hidden sm:inline">${day.weather.description}</span>
          ${pop > 20 ? `<span class="text-[11px] text-cyan-300 font-semibold flex items-center gap-0.5"><i data-lucide="umbrella" class="w-3 h-3"></i> ${pop}%</span>` : ""}
        </div>

        <!-- Temp Range Bar -->
        <div class="flex items-center gap-3 shrink-0 text-right font-bold">
          <span class="text-xs text-slate-400">${min}</span>
          <div class="w-16 sm:w-24 bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-sky-400 to-amber-400 h-full rounded-full w-full"></div>
          </div>
          <span class="text-xs sm:text-sm text-white">${max}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

function renderDetailedAtmospherics(weather, isNight) {
  const timezoneOffset = state.currentCity.timezoneOffset;

  // 1. Air Quality Index (AQI)
  if (state.aqi) {
    const aqiIndex = state.aqi.main?.aqi || 2;
    const aqiMeta = getAqiInfo(aqiIndex);
    elements.aqiBadge.textContent = aqiMeta.level;
    elements.aqiBadge.className = `px-2 py-0.5 rounded text-xs font-bold ${aqiMeta.bg} ${aqiMeta.color} ${aqiMeta.border} border`;
    elements.aqiValue.textContent = aqiIndex;
    elements.aqiLevelText.textContent = aqiMeta.level;
    elements.aqiLevelText.className = `text-sm font-semibold ${aqiMeta.color}`;
    elements.aqiAdvice.textContent = aqiMeta.text;
    elements.pm25Val.textContent = `${state.aqi.components?.pm2_5?.toFixed(1) || '--'} µg/m³`;
    elements.pm10Val.textContent = `${state.aqi.components?.pm10?.toFixed(1) || '--'} µg/m³`;
  } else {
    elements.aqiValue.textContent = "2";
    elements.aqiLevelText.textContent = "Fair";
    elements.aqiAdvice.textContent = "Air quality is satisfactory.";
    elements.pm25Val.textContent = "12 µg/m³";
    elements.pm10Val.textContent = "20 µg/m³";
  }

  // 2. UV Index
  const uv = state.uvIndex;
  const uvMeta = getUvInfo(uv);
  elements.uvBadge.textContent = uvMeta.level;
  elements.uvValue.textContent = uv;
  elements.uvLevelText.textContent = uvMeta.level;
  elements.uvLevelText.className = `text-sm font-semibold ${uvMeta.color}`;
  elements.uvAdvice.textContent = uvMeta.advice;
  const uvPercent = Math.min(100, Math.round((uv / 12) * 100));
  elements.uvProgress.style.width = `${uvPercent}%`;

  // 3. Sunrise, Sunset & Solar Arc
  const sunriseSec = weather.sys?.sunrise;
  const sunsetSec = weather.sys?.sunset;
  if (sunriseSec && sunsetSec) {
    const sunriseObj = formatLocalTime(sunriseSec, timezoneOffset);
    const sunsetObj = formatLocalTime(sunsetSec, timezoneOffset);
    elements.sunriseTime.textContent = sunriseObj.timeString;
    elements.sunsetTime.textContent = sunsetObj.timeString;

    const daylightDurationHrs = ((sunsetSec - sunriseSec) / 3600).toFixed(1);
    elements.daylightHours.textContent = `${daylightDurationHrs} hrs daylight`;

    const nowSec = weather.dt;
    if (nowSec >= sunriseSec && nowSec <= sunsetSec) {
      const progress = Math.round(((nowSec - sunriseSec) / (sunsetSec - sunriseSec)) * 100);
      elements.solarProgress.style.width = `${progress}%`;
      const hrsLeft = ((sunsetSec - nowSec) / 3600).toFixed(1);
      elements.solarStatusText.textContent = `${hrsLeft} hrs of daylight remaining`;
    } else {
      elements.solarProgress.style.width = isNight ? "100%" : "0%";
      elements.solarStatusText.textContent = isNight ? "Sun is below horizon (Night)" : "Awaiting dawn";
    }
  }

  // 4. Wind & Compass Dial
  const windDeg = weather.wind?.deg || 0;
  const windCardinal = getWindDirection(windDeg);
  elements.windDirectionCardinal.textContent = windCardinal;
  elements.windSpeedVal.textContent = state.isCelsius ? msToKmh(weather.wind.speed) : msToMph(weather.wind.speed);
  elements.windSpeedUnit.textContent = state.isCelsius ? "km/h" : "mph";
  elements.windGusts.textContent = weather.wind?.gust ? (state.isCelsius ? `${msToKmh(weather.wind.gust)} km/h` : `${msToMph(weather.wind.gust)} mph`) : "None";
  elements.compassNeedle.style.transform = `rotate(${windDeg}deg)`;
  elements.windDeg.textContent = `${windDeg}° (${windCardinal})`;

  // 5. Humidity & Dew Point
  const hum = weather.main.humidity;
  elements.humidityVal.textContent = hum;
  elements.humidityBar.style.width = `${hum}%`;
  
  // Dew point approximation: T - ((100 - RH) / 5)
  const dewPointC = Math.round(weather.main.temp - (100 - hum) / 5);
  elements.dewPoint.textContent = `The dew point is ${formatTemp(dewPointC)} right now.`;
  if (hum < 30) {
    elements.humidityBadge.textContent = "Dry";
  } else if (hum <= 60) {
    elements.humidityBadge.textContent = "Comfortable";
  } else if (hum <= 80) {
    elements.humidityBadge.textContent = "Humid";
  } else {
    elements.humidityBadge.textContent = "Very Humid";
  }

  // 6. Visibility
  const visMeters = weather.visibility || 10000;
  if (state.isCelsius) {
    elements.visibilityVal.textContent = metersToKm(visMeters);
    elements.visibilityUnit.textContent = "km";
  } else {
    elements.visibilityVal.textContent = metersToMiles(visMeters);
    elements.visibilityUnit.textContent = "mi";
  }

  if (visMeters >= 10000) {
    elements.visibilityBadge.textContent = "Excellent";
    elements.visibilityDesc.textContent = "Crystal clear visibility across the entire horizon.";
    elements.fogRisk.textContent = "None";
  } else if (visMeters >= 5000) {
    elements.visibilityBadge.textContent = "Good";
    elements.visibilityDesc.textContent = "Moderate visibility with slight atmospheric haze.";
    elements.fogRisk.textContent = "Low";
  } else {
    elements.visibilityBadge.textContent = "Low";
    elements.visibilityDesc.textContent = "Fog or heavy precipitation reducing viewing range.";
    elements.fogRisk.textContent = "High";
  }

  // 7. Pressure
  const press = weather.main.pressure || 1013;
  if (state.isCelsius) {
    elements.pressureVal.textContent = press;
    elements.pressureUnit.textContent = "hPa";
  } else {
    elements.pressureVal.textContent = hPaToInHg(press);
    elements.pressureUnit.textContent = "inHg";
  }
  elements.seaLevelVal.textContent = weather.main.sea_level ? `${weather.main.sea_level} hPa` : `${press} hPa`;

  if (press > 1020) {
    elements.pressureBadge.textContent = "High (Fair)";
    elements.pressureDesc.textContent = "High pressure system bringing settled, dry skies.";
  } else if (press < 1005) {
    elements.pressureBadge.textContent = "Low (Stormy)";
    elements.pressureDesc.textContent = "Low pressure system indicating possible storm or rain.";
  } else {
    elements.pressureBadge.textContent = "Normal";
    elements.pressureDesc.textContent = "Stable barometric atmospheric equilibrium.";
  }

  // 8. Precipitation & Clouds
  const clouds = weather.clouds?.all || 0;
  elements.cloudVal.textContent = clouds;
  const currentPop = state.hourlyList.length > 0 ? Math.round((state.hourlyList[0].pop || 0) * 100) : 0;
  elements.popBadge.textContent = `${currentPop}%`;
  elements.rainChance.textContent = `${currentPop}%`;
  elements.precipDesc.textContent = clouds > 75 ? "Overcast skies with dense cloud coverage." : clouds > 30 ? "Scattered clouds drifting through." : "Clear open skies with bright sunshine.";
}

function renderAlerts(weather) {
  const condition = weather.weather[0].main.toLowerCase();
  const tempC = weather.main.temp;
  const windMs = weather.wind.speed;

  let alert = null;

  if (condition.includes("thunderstorm")) {
    alert = {
      title: "⚡ Severe Thunderstorm Advisory",
      desc: "Lightning and sudden gusty downpours detected in the area. Seek sturdy indoor shelter immediately.",
    };
  } else if (tempC >= 38) {
    alert = {
      title: "🔥 Extreme Heat Warning",
      desc: "Dangerously high temperatures. Stay hydrated, avoid prolonged sun exposure, and remain in cooled spaces.",
    };
  } else if (tempC <= -10) {
    alert = {
      title: "❄️ Severe Freezing & Frost Alert",
      desc: "Extreme cold temperatures with frostbite and black ice hazard. Dress in thermal layers.",
    };
  } else if (windMs >= 18) {
    alert = {
      title: "💨 High Wind Warning",
      desc: "Gale-force gusts exceeding 65 km/h. Secure loose outdoor objects and exercise caution when driving.",
    };
  }

  if (alert) {
    elements.alertTitle.textContent = alert.title;
    elements.alertDesc.textContent = alert.desc;
    elements.weatherAlert.classList.remove("hidden");
  } else {
    elements.weatherAlert.classList.add("hidden");
  }
}

// ==========================================
// DYNAMIC ATMOSPHERIC PARTICLES & BACKGROUNDS
// ==========================================

function updateAtmosphericEffects(condition, isNight) {
  const body = document.body;
  const effects = elements.weatherEffects;
  effects.innerHTML = "";
  elements.lightningEffect.classList.add("hidden");
  elements.sunGlowEffect.classList.add("hidden");

  // Reset base gradient
  body.className = "min-h-screen text-slate-100 relative selection:bg-sky-500 selection:text-white transition-colors duration-1000 antialiased ";

  switch (condition) {
    case "Clear":
      if (isNight) {
        body.classList.add("bg-gradient-to-b", "from-slate-950", "via-indigo-950", "to-slate-900");
        createStarField();
      } else {
        body.classList.add("bg-gradient-to-b", "from-sky-900", "via-blue-900", "to-slate-950");
        elements.sunGlowEffect.classList.remove("hidden");
      }
      break;

    case "Clouds":
      if (isNight) {
        body.classList.add("bg-gradient-to-b", "from-slate-950", "via-slate-900", "to-slate-950");
      } else {
        body.classList.add("bg-gradient-to-b", "from-slate-800", "via-slate-900", "to-slate-950");
      }
      createCloudParticles();
      break;

    case "Rain":
    case "Drizzle":
      body.classList.add("bg-gradient-to-b", "from-slate-900", "via-sky-950", "to-slate-950");
      createRainParticles(condition === "Drizzle" ? 60 : 120);
      break;

    case "Thunderstorm":
      body.classList.add("bg-gradient-to-b", "from-slate-950", "via-purple-950", "to-slate-950");
      createRainParticles(150);
      elements.lightningEffect.classList.remove("hidden");
      break;

    case "Snow":
      body.classList.add("bg-gradient-to-b", "from-slate-900", "via-blue-950", "to-slate-950");
      createSnowParticles(80);
      break;

    case "Mist":
    case "Fog":
    case "Haze":
    case "Smoke":
      body.classList.add("bg-gradient-to-b", "from-zinc-900", "via-slate-900", "to-slate-950");
      createFogParticles();
      break;

    default:
      body.classList.add("bg-gradient-to-b", "from-slate-900", "via-slate-950", "to-slate-950");
  }

  // Update procedural audio if active
  if (state.isAudioActive) {
    updateSoundscape(condition);
  }
}

function createRainParticles(count = 100) {
  const container = elements.weatherEffects;
  for (let i = 0; i < count; i++) {
    const drop = document.createElement("div");
    drop.className = "raindrop";
    drop.style.left = `${Math.random() * 100}vw`;
    drop.style.animationDuration = `${0.4 + Math.random() * 0.4}s`;
    drop.style.animationDelay = `${Math.random() * 2}s`;
    drop.style.opacity = `${0.3 + Math.random() * 0.6}`;
    container.appendChild(drop);
  }
}

function createSnowParticles(count = 60) {
  const container = elements.weatherEffects;
  for (let i = 0; i < count; i++) {
    const flake = document.createElement("div");
    flake.className = "snowflake";
    const size = 3 + Math.random() * 6;
    flake.style.width = `${size}px`;
    flake.style.height = `${size}px`;
    flake.style.left = `${Math.random() * 100}vw`;
    flake.style.animationDuration = `${3 + Math.random() * 4}s`;
    flake.style.animationDelay = `${Math.random() * 4}s`;
    container.appendChild(flake);
  }
}

function createStarField(count = 80) {
  const container = elements.weatherEffects;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star-particle";
    const size = 1 + Math.random() * 2.5;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 80}vh`;
    star.style.left = `${Math.random() * 100}vw`;
    star.style.animationDuration = `${2 + Math.random() * 4}s`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    container.appendChild(star);
  }
}

function createCloudParticles(count = 6) {
  const container = elements.weatherEffects;
  for (let i = 0; i < count; i++) {
    const cloud = document.createElement("div");
    cloud.className = "cloud-particle";
    const width = 250 + Math.random() * 200;
    const height = 120 + Math.random() * 80;
    cloud.style.width = `${width}px`;
    cloud.style.height = `${height}px`;
    cloud.style.top = `${Math.random() * 40}vh`;
    cloud.style.setProperty("--cloud-opacity", `${0.2 + Math.random() * 0.3}`);
    cloud.style.animationDuration = `${35 + Math.random() * 30}s`;
    cloud.style.animationDelay = `-${Math.random() * 30}s`;
    container.appendChild(cloud);
  }
}

function createFogParticles(count = 8) {
  const container = elements.weatherEffects;
  for (let i = 0; i < count; i++) {
    const fog = document.createElement("div");
    fog.className = "cloud-particle";
    fog.style.width = `${400 + Math.random() * 300}px`;
    fog.style.height = `${200 + Math.random() * 150}px`;
    fog.style.top = `${20 + Math.random() * 60}vh`;
    fog.style.setProperty("--cloud-opacity", "0.25");
    fog.style.animationDuration = `${40 + Math.random() * 40}s`;
    fog.style.animationDelay = `-${Math.random() * 30}s`;
    container.appendChild(fog);
  }
}

// ==========================================
// INTERACTIVE LEAFLET WEATHER MAP
// ==========================================

function initMap() {
  const mapElement = document.getElementById("weather-map");
  if (!mapElement || typeof L === "undefined") return;

  try {
    state.map = L.map("weather-map", {
      center: [51.5074, -0.1278],
      zoom: 8,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark Tile Basemap (CartoDB Dark Matter / Voyager)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(state.map);

    // Weather Layer Overlay
    setMapWeatherLayer(state.currentMapLayerName);

    // Layer Switcher Buttons
    document.querySelectorAll(".map-layer-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".map-layer-btn").forEach((b) => {
          b.classList.remove("bg-sky-500", "text-white", "border-sky-400");
        });
        btn.classList.add("bg-sky-500", "text-white", "border-sky-400");
        const layerName = btn.dataset.layer;
        setMapWeatherLayer(layerName);
      });
    });
  } catch (e) {
    console.warn("Leaflet map initialization error:", e);
  }
}

function setMapWeatherLayer(layerName) {
  state.currentMapLayerName = layerName;
  if (!state.map) return;

  if (state.mapTileLayer) {
    state.map.removeLayer(state.mapTileLayer);
  }

  try {
    state.mapTileLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/${layerName}/{z}/{x}/{y}.png?appid=${API_KEY}`,
      {
        maxZoom: 18,
        opacity: 0.65,
      }
    ).addTo(state.map);
  } catch (e) {
    console.warn("Error adding weather layer to map:", e);
  }
}

function updateMap(lat, lon, cityName, temp, condition) {
  if (!state.map) return;

  try {
    state.map.setView([lat, lon], 9);

    if (state.mapMarker) {
      state.map.removeLayer(state.mapMarker);
    }

    state.mapMarker = L.marker([lat, lon])
      .addTo(state.map)
      .bindPopup(
        `<div class="p-2 text-center">
          <p class="font-bold text-base text-sky-400">${cityName}</p>
          <p class="text-xl font-extrabold text-white mt-1">${formatTemp(temp)}</p>
          <p class="text-xs text-slate-300 capitalize">${condition}</p>
        </div>`
      )
      .openPopup();
  } catch (e) {
    console.warn("Error updating map marker:", e);
  }
}

// ==========================================
// AMBIENT SOUNDSCAPE SYNTHESIZER (WEB AUDIO API)
// ==========================================

function toggleAudio() {
  if (!state.isAudioActive) {
    startSoundscape();
  } else {
    stopSoundscape();
  }
}

function startSoundscape() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      showToast("Web Audio is not supported in this browser.", "info");
      return;
    }

    if (!state.audioContext) {
      state.audioContext = new AudioCtx();
    }

    if (state.audioContext.state === "suspended") {
      state.audioContext.resume();
    }

    state.isAudioActive = true;
    updateAudioIcons(true);
    showToast("Atmospheric soundscape enabled 🎧", "info");

    if (state.weather) {
      updateSoundscape(state.weather.weather[0].main);
    }
  } catch (e) {
    console.warn("Soundscape startup failed:", e);
  }
}

function stopSoundscape() {
  state.isAudioActive = false;
  updateAudioIcons(false);
  showToast("Soundscape muted 🔇", "info");

  if (state.audioNodes.rainGain) state.audioNodes.rainGain.gain.linearRampToValueAtTime(0, state.audioContext.currentTime + 0.5);
  if (state.audioNodes.windGain) state.audioNodes.windGain.gain.linearRampToValueAtTime(0, state.audioContext.currentTime + 0.5);
}

function updateSoundscape(condition) {
  if (!state.audioContext || !state.isAudioActive) return;

  const ctx = state.audioContext;
  const now = ctx.currentTime;

  // Create White Noise buffer for ambient sounds
  if (!state.audioNodes.noiseBuffer) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    state.audioNodes.noiseBuffer = noiseBuffer;
  }

  // Rain sound generation
  if (!state.audioNodes.rainSource) {
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = state.audioNodes.noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start(0);

    state.audioNodes.rainSource = whiteNoise;
    state.audioNodes.rainFilter = filter;
    state.audioNodes.rainGain = gain;
  }

  // Set gain based on condition
  if (condition === "Rain" || condition === "Thunderstorm" || condition === "Drizzle") {
    state.audioNodes.rainGain.gain.linearRampToValueAtTime(0.08, now + 1);
  } else {
    state.audioNodes.rainGain.gain.linearRampToValueAtTime(0, now + 1);
  }
}

function updateAudioIcons(active) {
  document.querySelectorAll(".audio-icon").forEach((icon) => {
    icon.setAttribute("data-lucide", active ? "volume-2" : "volume-x");
    icon.classList.toggle("text-sky-400", active);
    icon.classList.toggle("text-slate-400", !active);
  });
  initLucide();
}

// ==========================================
// FAVORITES & RECENT SEARCHES
// ==========================================

function toggleFavorite() {
  const current = state.currentCity;
  const index = state.favorites.findIndex((f) => f.name.toLowerCase() === current.name.toLowerCase());

  if (index >= 0) {
    state.favorites.splice(index, 1);
    showToast(`Removed ${current.name} from favorites`, "info");
  } else {
    state.favorites.push({
      name: current.name,
      country: current.country,
      lat: current.lat,
      lon: current.lon,
    });
    showToast(`Saved ${current.name} to favorites ⭐`, "success");
  }

  localStorage.setItem("skycast_favorites", JSON.stringify(state.favorites));
  renderFavorites();
  renderDashboard();
}

function renderFavorites() {
  const container = elements.favoritesContainer;
  if (!state.favorites || state.favorites.length === 0) {
    container.innerHTML = `<span class="text-slate-500 text-xs italic">No pinned favorites yet</span>`;
    return;
  }

  container.innerHTML = state.favorites
    .map(
      (fav) => `
    <button class="glass-pill text-xs py-1 px-2.5 flex items-center gap-1 hover:border-amber-400/50 fav-chip"
            data-lat="${fav.lat}" data-lon="${fav.lon}" data-name="${fav.name}">
      <span class="text-amber-400">★</span>
      <span class="text-white">${fav.name}</span>
      <span class="text-slate-400 text-[10px]">${fav.country || ''}</span>
    </button>
  `
    )
    .join("");

  container.querySelectorAll(".fav-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lat = parseFloat(btn.dataset.lat);
      const lon = parseFloat(btn.dataset.lon);
      const name = btn.dataset.name;
      fetchWeatherData(lat, lon, name);
    });
  });
}

function addToRecent(city) {
  if (!city || !city.name) return;

  const existingIdx = state.recents.findIndex((r) => r.name.toLowerCase() === city.name.toLowerCase());
  if (existingIdx >= 0) {
    state.recents.splice(existingIdx, 1);
  }

  state.recents.unshift({
    name: city.name,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
  });

  if (state.recents.length > 5) {
    state.recents.pop();
  }

  localStorage.setItem("skycast_recents", JSON.stringify(state.recents));
  renderRecents();
}

function renderRecents() {
  const container = elements.recentContainer;
  const clearBtn = elements.clearRecentBtn;

  if (!state.recents || state.recents.length === 0) {
    container.innerHTML = `<span class="text-slate-500 text-xs italic">No search history</span>`;
    clearBtn.classList.add("hidden");
    return;
  }

  clearBtn.classList.remove("hidden");
  container.innerHTML = state.recents
    .map(
      (rec) => `
    <button class="glass-pill text-xs py-1 px-2.5 flex items-center gap-1 recent-chip"
            data-lat="${rec.lat}" data-lon="${rec.lon}" data-name="${rec.name}">
      <span class="text-slate-300">${rec.name}</span>
    </button>
  `
    )
    .join("");

  container.querySelectorAll(".recent-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lat = parseFloat(btn.dataset.lat);
      const lon = parseFloat(btn.dataset.lon);
      const name = btn.dataset.name;
      fetchWeatherData(lat, lon, name);
    });
  });
}

// ==========================================
// UNIT SWITCHING & FORMATTING HELPERS
// ==========================================

function toggleUnits() {
  state.isCelsius = !state.isCelsius;
  localStorage.setItem("skycast_units", state.isCelsius ? "C" : "F");
  updateUnitUI();
  renderDashboard();
  showToast(`Switched units to °${state.isCelsius ? "C" : "F"}`, "info");
}

function updateUnitUI() {
  document.querySelectorAll(".active-unit-text").forEach((el) => {
    el.textContent = state.isCelsius ? "°C" : "°F";
  });
}

function formatTemp(celsius) {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return "--°";
  const val = state.isCelsius ? Math.round(celsius) : celsiusToFahrenheit(celsius);
  return `${val}°${state.isCelsius ? "C" : "F"}`;
}

function formatSpeed(ms) {
  if (ms === undefined || ms === null || isNaN(ms)) return "--";
  if (state.isCelsius) {
    return `${msToKmh(ms)} km/h`;
  }
  return `${msToMph(ms)} mph`;
}

// ==========================================
// GEOLOCATION & INITIAL LOAD
// ==========================================

function detectInitialLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherData(latitude, longitude, "My Location");
      },
      () => {
        // Fallback: Check IP or default to London
        fetchWeatherData(51.5074, -0.1278, "London");
      },
      { timeout: 5000 }
    );
  } else {
    fetchWeatherData(51.5074, -0.1278, "London");
  }
}

function handleLocationClick() {
  elements.locationBtn.classList.add("animate-pulse");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        elements.locationBtn.classList.remove("animate-pulse");
        const { latitude, longitude } = pos.coords;
        fetchWeatherData(latitude, longitude, "My Location");
      },
      (err) => {
        elements.locationBtn.classList.remove("animate-pulse");
        showToast("GPS permission denied or unavailable. Loading London demo.", "warning");
        fetchWeatherData(51.5074, -0.1278, "London");
      }
    );
  } else {
    elements.locationBtn.classList.remove("animate-pulse");
    showToast("Geolocation is not supported by your browser.", "error");
  }
}

// ==========================================
// USER INTERACTIONS & EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  // Search Input Debounce Autocomplete
  elements.cityInput.addEventListener("input", (e) => {
    const val = e.target.value;
    elements.clearSearchBtn.classList.toggle("hidden", val.length === 0);

    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  });

  // Clear Search
  elements.clearSearchBtn.addEventListener("click", () => {
    elements.cityInput.value = "";
    elements.clearSearchBtn.classList.add("hidden");
    elements.suggestionsDropdown.classList.add("hidden");
    elements.cityInput.focus();
  });

  // Form Submit / Search Button
  elements.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSearchSubmit();
  });

  // Location Button
  elements.locationBtn.addEventListener("click", handleLocationClick);

  // Unit Toggle Buttons
  elements.unitBtn.addEventListener("click", toggleUnits);
  elements.mobileUnitBtn.addEventListener("click", toggleUnits);

  // Audio Buttons
  elements.audioBtn.addEventListener("click", toggleAudio);
  elements.mobileAudioBtn.addEventListener("click", toggleAudio);

  // Favorite Star Toggle
  elements.favoriteToggleBtn.addEventListener("click", toggleFavorite);

  // Clear Recents
  elements.clearRecentBtn.addEventListener("click", () => {
    state.recents = [];
    localStorage.removeItem("skycast_recents");
    renderRecents();
  });

  // Share Weather Button
  elements.shareBtn.addEventListener("click", handleShare);

  // Logo Refresh
  elements.refreshBtn.addEventListener("click", () => {
    if (state.currentCity) {
      fetchWeatherData(state.currentCity.lat, state.currentCity.lon, state.currentCity.name);
    }
  });

  // Hourly Slider Buttons
  elements.hourlyPrevBtn.addEventListener("click", () => {
    elements.hourlyContainer.scrollBy({ left: -300, behavior: "smooth" });
  });
  elements.hourlyNextBtn.addEventListener("click", () => {
    elements.hourlyContainer.scrollBy({ left: 300, behavior: "smooth" });
  });

  // Keyboard Shortcuts Modal
  elements.shortcutsModalBtn.addEventListener("click", () => {
    elements.shortcutsModal.classList.remove("hidden");
  });
  elements.closeShortcutsBtn.addEventListener("click", () => {
    elements.shortcutsModal.classList.add("hidden");
  });
  elements.shortcutsModal.addEventListener("click", (e) => {
    if (e.target === elements.shortcutsModal) {
      elements.shortcutsModal.classList.add("hidden");
    }
  });

  // Global Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") {
      if (e.key === "Escape") {
        elements.suggestionsDropdown.classList.add("hidden");
        elements.cityInput.blur();
      }
      return;
    }

    if (e.key === "/") {
      e.preventDefault();
      elements.cityInput.focus();
    } else if (e.key.toLowerCase() === "l") {
      e.preventDefault();
      handleLocationClick();
    } else if (e.key.toLowerCase() === "u") {
      e.preventDefault();
      toggleUnits();
    } else if (e.key.toLowerCase() === "s") {
      e.preventDefault();
      toggleAudio();
    } else if (e.key === "Escape") {
      elements.shortcutsModal.classList.add("hidden");
      elements.suggestionsDropdown.classList.add("hidden");
    }
  });

  // Click outside to close dropdown
  document.addEventListener("click", (e) => {
    if (!elements.searchForm.contains(e.target) && !elements.suggestionsDropdown.contains(e.target)) {
      elements.suggestionsDropdown.classList.add("hidden");
    }
  });
}

async function handleSearchSubmit() {
  const query = elements.cityInput.value.trim();
  if (!query) return;

  elements.suggestionsDropdown.classList.add("hidden");
  showLoading(true);

  try {
    const geoUrl = `${GEO_BASE}/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`;
    const res = await fetch(geoUrl);
    if (res.ok) {
      const results = await res.json();
      if (results && results.length > 0) {
        const { lat, lon, name } = results[0];
        elements.cityInput.value = "";
        elements.clearSearchBtn.classList.add("hidden");
        fetchWeatherData(lat, lon, name);
        return;
      }
    }

    // Fallback: Direct search by name on /weather endpoint
    const directRes = await fetch(`${OPENWEATHER_BASE}/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`);
    if (directRes.ok) {
      const data = await directRes.json();
      elements.cityInput.value = "";
      elements.clearSearchBtn.classList.add("hidden");
      fetchWeatherData(data.coord.lat, data.coord.lon, data.name);
      return;
    }

    throw new Error(`City "${query}" not found. Please verify spelling.`);
  } catch (error) {
    showToast(error.message, "error");
    showLoading(false);
  }
}

async function handleShare() {
  if (!state.weather) return;

  const currentTemp = formatTemp(state.weather.main.temp);
  const text = `🌤️ SkyCast Weather for ${state.currentCity.name}: ${currentTemp}, ${state.weather.weather[0].description}. Wind: ${formatSpeed(state.weather.wind.speed)}, Humidity: ${state.weather.main.humidity}%.`;

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    showToast("Weather summary copied to clipboard! 📋", "success");
  } else {
    showToast(text, "info");
  }
}

// ==========================================
// NOTIFICATIONS & UI HELPERS
// ==========================================

function showToast(message, type = "info") {
  const banner = elements.statusBanner;
  const textEl = elements.statusBannerText;

  textEl.textContent = message;
  banner.classList.remove("hidden", "bg-sky-500/20", "text-sky-200", "border-sky-500/30", "bg-emerald-500/20", "text-emerald-200", "border-emerald-500/30", "bg-rose-500/20", "text-rose-200", "border-rose-500/30", "bg-amber-500/20", "text-amber-200", "border-amber-500/30");

  if (type === "success") {
    banner.classList.add("bg-emerald-500/20", "text-emerald-200", "border", "border-emerald-500/30");
  } else if (type === "error") {
    banner.classList.add("bg-rose-500/20", "text-rose-200", "border", "border-rose-500/30");
  } else if (type === "warning") {
    banner.classList.add("bg-amber-500/20", "text-amber-200", "border", "border-amber-500/30");
  } else {
    banner.classList.add("bg-sky-500/20", "text-sky-200", "border", "border-sky-500/30");
  }

  clearTimeout(banner.timer);
  banner.timer = setTimeout(() => {
    banner.classList.add("hidden");
  }, 4000);
}

function showLoading(isLoading) {
  if (isLoading) {
    elements.loadingSpinner.classList.remove("hidden");
  } else {
    elements.loadingSpinner.classList.add("hidden");
  }
}