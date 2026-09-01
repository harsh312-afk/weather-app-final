<div align="center">

# 🌤️ SkyCast — Atmospheric Weather & Forecast Dashboard

[![Build & Tests](https://img.shields.io/badge/tests-8%20passed-brightgreen.svg)]()
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4.19-38bdf8.svg?logo=tailwind-css&logoColor=white)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-f7df1e.svg?logo=javascript&logoColor=black)]()
[![Leaflet](https://img.shields.io/badge/Leaflet-v1.9.4-199900.svg?logo=leaflet&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)]()

**SkyCast** is an ultra-modern, responsive, feature-packed weather application built with Vanilla ES Modules JavaScript, Tailwind CSS, and Leaflet Maps. It delivers real-time weather analytics, accurate 24-hour and 5-day forecasts, air quality tracking, UV index assessments, interactive radar layers, and dynamic procedural weather atmospheres.

[Live Demo](#-getting-started) • [Key Features](#-features) • [Tech Stack](#-tech-stack) • [Quickstart](#-getting-started)

</div>

---

## ✨ Features

### 1. 🌍 Real-Time Atmosphere & Geolocation
- **Instant Geolocation**: Click **My Location** (or press `L`) to auto-detect coordinates and reverse-geocode current weather.
- **Smart Autocomplete**: Debounced real-time city search suggesting matching cities with region and country tags.
- **Resilient Dual-API Engine**: Primary queries through OpenWeatherMap with automatic fallback to Open-Meteo for 100% uptime reliability.

### 2. 📊 High-Precision Forecasts
- **24–48 Hour Hourly Timeline**: Horizontal-scrollable carousel showing 3-hour forecasts with temperature trends, precipitation probabilities, and wind speeds.
- **True 5-Day Outlook**: Accurately grouped by local destination timezone with min/max temperature range meters, conditions, and rain likelihood.
- **Local Timezone Intelligence**: Accurately shows destination city local time, solar day/night status, and daylight duration.

### 3. 🍃 8-Card Detailed Atmospheric Metrics Grid
- 🍃 **Air Quality Index (AQI)**: Real-time AQI ranking (Good to Very Poor) with PM2.5 and PM10 pollutant concentrations and health recommendations.
- ☀️ **UV Index & Sun Protection**: Real-time UV rating with animated progress gauge and actionable sun protection advice.
- 🌅 **Solar Path & Daylight Tracker**: Visual sunrise, sunset, and daylight remaining progress timeline.
- 💨 **Wind & Dynamic Compass Dial**: Wind speed, gust speeds, and dynamic rotating compass needle indicating real-time wind direction.
- 💧 **Humidity & Dew Point**: Moisture percentage, calculated dew point, and comfort zone classification.
- 👁️ **Visibility & Clarity**: Optical range (in km/miles) with fog risk assessments.
- ⏲️ **Barometric Pressure**: Atmospheric pressure in hPa/inHg with trend interpretation.
- 🌧️ **Precipitation & Cloud Cover**: Real-time cloud coverage and rain likelihood %.

### 4. 🗺️ Interactive Weather Radar (Leaflet Maps)
- Interactive map centered dynamically on the searched location.
- Switchable weather layer overlays:
  - ☁️ **Clouds & Satellite Cover**
  - 🌧️ **Precipitation & Rain Radar**
  - 🌡️ **Temperature Heatmap**
  - 💨 **Wind Velocity**

### 5. 🎨 Glassmorphism & Atmospheric Particle Engine
- **Procedural CSS/DOM Particle Engine**:
  - ☀️ **Sunny / Clear Day**: Ambient solar pulse and glowing sunrays.
  - 🌙 **Clear Night**: Twinkling star field.
  - 🌧️ **Rain & Drizzle**: Realistic dynamic raindrops with randomized trajectories.
  - ⚡ **Thunderstorm**: Downpour particles accompanied by realistic atmospheric lightning flashes.
  - ❄️ **Snow**: Swaying 3D snowflakes.
  - 🌫️ **Fog & Mist**: Multi-layered drifting fog plumes.
- **🎧 Ambient Soundscape Synthesizer**: Procedural Web Audio API sound generator with zero external media files.

### 6. ⭐ Favorites & Recent Search History
- **Pin Favorites**: Click the star icon ⭐ to pin frequently checked cities for 1-click access.
- **Recent Searches**: Quick-access chip drawer with a 1-click clear option.
- **Full Unit Synchronization**: Instant toggle between Metric (°C, km/h, km, hPa) and Imperial (°F, mph, mi, inHg) across all cards and forecasts.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` | Focus search bar |
| `L` | Detect current GPS location |
| `U` | Toggle temperature units (°C / °F) |
| `S` | Toggle atmospheric soundscape audio |
| `Esc` | Dismiss modals and dropdowns |

---

## 🛠️ Tech Stack

- **Markup & Layout**: HTML5 (Semantic & Accessible)
- **Styling**: Tailwind CSS v3.4 (via Tailwind CLI), custom Glassmorphism components
- **Logic & Modules**: Vanilla JavaScript ES Modules (ES6+)
- **Maps**: Leaflet.js v1.9.4 with OpenWeatherMap & CartoDB Tile Overlays
- **Icons**: Lucide Icons
- **Audio**: Web Audio API (Procedural synthesizer)
- **Testing**: Node.js Built-in Test Runner (`node:test`, `node:assert`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harsh312-afk/weather-app-final.git
   cd weather-app-final
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build Tailwind CSS:**
   ```bash
   npm run build
   ```

4. **Run Unit Tests:**
   ```bash
   npm test
   ```

5. **Start Local Development Server:**
   ```bash
   npm start
   # or open index.html in your browser
   ```

---

## 📁 Project Structure

```
weather-app-final/
├── dist/
│   └── output.css           # Minified compiled Tailwind CSS
├── src/
│   ├── input.css            # Custom CSS, glassmorphism & particle keyframes
│   ├── script.js            # Main application controller & rendering engine
│   └── utils.js             # Pure utility functions & unit conversion math
├── tests/
│   └── weather.test.js      # Automated unit test suite
├── index.html               # Main dashboard UI
├── package.json             # NPM metadata, scripts & dependencies
├── tailwind.config.js       # Custom Tailwind theme configuration
└── README.md                # Documentation & guide
```

---

## 👨‍💻 Author

Developed with ❤️ by **Harsh Gautam**
