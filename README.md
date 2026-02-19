# 🌤️ My Weather Dashboard

A responsive, feature-rich weather application built with Vanilla JavaScript and Tailwind CSS. This dashboard provides real-time current weather conditions and a 5-day forecast for any city in the world, complete with dynamic visual effects.

## ✨ Features

- Live Weather Data: Retrieves real-time current weather and 5-day forecast data from the OpenWeatherMap API.
- Geolocation Support: Click the 📍 button to retrieve the current weather instantly for your location .
- Dynamic Animated Backgrounds: The application's background and custom CSS particle animations (rain, snow, drifting clouds) updates based on the current weather.
- Unit Conversion: Easily switch between Celsius (°C) and Fahrenheit (°F) .
- Search History: Saves your recently searched locations in the browser's localStorage to provide quick access .
- Responsive Grid-Based Design: The layout is optimized to work well on any device. The clean and simple single-column stacked layout is perfect for mobile devices, while larger desktop screens provide a spacious side-by-side layout.

## 🛠️ Tech Stack

**Frontend**: HTML5, Tailwind CSS (using Tailwind CLI)
**Scripting**: JavaScript (ES6+ features like async/await, DOM manipulation)
**API**: OpenWeatherMap API


## 🚀 Getting Started

Follow these steps to run the project locally on your Computer.

### Prerequisites
- Node.js and npm installed (for Tailwind Fcuntionality).
- A reletively modern web browser(Firefox, Chrome, etc.).
- (Optional) VS Code with the "Live Server" extension.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harsh312-afk/weather-app-final.git
   cd weather-app-final



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
