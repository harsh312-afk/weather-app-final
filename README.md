# 🌤️ Weather Forecast Dashboard

A responsive, feature-rich weather application built with Vanilla JavaScript and Tailwind CSS. This dashboard provides real-time current weather conditions and a 5-day forecast for any city in the world, complete with dynamic visual effects.

## ✨ Features

- **Live Weather Data**: Fetches real-time current weather and a 5-day forecast using the OpenWeatherMap API.
- **Geolocation Support**: Click the 📍 button to instantly get the weather for your current location (includes a graceful fallback for devices without GPS).
- **Dynamic Animated Backgrounds**: The application's background and custom CSS particle effects (rain, snow, drifting clouds) change automatically based on the current weather conditions.
- **Unit Conversion**: Seamlessly toggle between Celsius (°C) and Fahrenheit (°F) without making additional API calls.
- **Search History**: Remembers your recently searched cities using browser `localStorage` for quick access via a dropdown menu.
- **Responsive Grid Layout**: Optimized for all devices. Uses a clean, single-column stacked layout on mobile that expands into a spacious side-by-side dashboard on desktop screens.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS (via Tailwind CLI)
- **Scripting**: Vanilla JavaScript (ES6+ features like `async/await`, DOM manipulation)
- **API**: OpenWeatherMap API

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
- Node.js and npm installed (for Tailwind CSS).
- A modern web browser.
- (Optional) VS Code with the "Live Server" extension.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harsh312-afk/weather-app-final.git
   cd weather-app-final

```

2. **Install dependencies:**
```bash
npm install

```


3. **Start the Tailwind CSS compiler:**
Leave this running in your terminal so it can compile the CSS updates:
```bash
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch

```


4. **Run the App:**
Open `index.html` in your browser. If you are using VS Code, right-click `index.html` and select **Open with Live Server** to avoid browser CORS/Geolocation restrictions.

## 💡 Usage

1. Type a city name (e.g., "Tokyo", "New York") into the search bar and click **Search**.
2. Click the **📍** button to let the app detect your local weather.
3. Click the **°C / °F** button to switch the temperature format.
4. Click the "Recent Cities" dropdown to quickly revisit previous searches.
5. Watch the background gradients and animations change to match the sky!

## 👨‍💻 Author

Developed by **Harsh Gautam**
