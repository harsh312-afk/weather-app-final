# 🌤️ Weather Forecast Dashboard


The Weather Dashboard is a feature-rich, responsive weather app built using Vanilla JavaScript and Tailwind CSS. The dashboard provides real-time live current weather and a 5-day forecast for any city around the world, along with dynamic visual effects.

## ✨ Features

- **Real-time Weather Data**: Fetches real-time current weather and 5-day forecast using the OpenWeatherMap API.
- **Geolocation Functionality**: By clicking on the 📍 button, the application will instantly present you with the current weather conditions based on your current location (this feature supports device fallback for devices without GPS).
- **Animated Backgrounds**: The application’s background will automatically change based on the current weather conditions, with custom CSS particle effects (i.e. Rain, Snow, Fluttering Clouds).
- **Temperature Unit Conversion**: Users can easily switch between Celsius (°C) and Fahrenheit (°F) without making additional API requests.
- **Search History**: The application uses the browser's `localStorage` to save cities that the user has previously searched, for easy access via a dropdown menu.
- **Responsive Grid Layout**: The application is optimized for all devices. The mobile view will have a clean, single-column stacked layout; while on desktop, the mobile view will expand into a large area with the information being laid out in a side-by-side fashion.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS (via Tailwind CLI)
- **Scripting**: Vanilla JavaScript (ES6+ (with `async/await` and DOM manipulation)),
- **API**: OpenWeatherMap API
`
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
