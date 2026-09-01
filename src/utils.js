/**
 * Utility functions for Weather App (Unit conversion, calculations, time processing)
 */

export function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}

export function fahrenheitToCelsius(f) {
  return Math.round(((f - 32) * 5) / 9);
}

export function msToMph(ms) {
  return parseFloat((ms * 2.23694).toFixed(1));
}

export function msToKmh(ms) {
  return parseFloat((ms * 3.6).toFixed(1));
}

export function hPaToInHg(hPa) {
  return parseFloat((hPa * 0.02953).toFixed(2));
}

export function metersToKm(meters) {
  return parseFloat((meters / 1000).toFixed(1));
}

export function metersToMiles(meters) {
  return parseFloat((meters * 0.000621371).toFixed(1));
}

export function getWindDirection(deg) {
  if (deg === undefined || deg === null) return "N";
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

export function getAqiInfo(aqiIndex) {
  switch (Number(aqiIndex)) {
    case 1:
      return { level: "Good", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "Air quality is satisfactory and poses little or no risk." };
    case 2:
      return { level: "Fair", color: "text-lime-400", bg: "bg-lime-500/20", border: "border-lime-500/30", text: "Air quality is acceptable; moderate health concern for sensitive individuals." };
    case 3:
      return { level: "Moderate", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", text: "Sensitive groups may experience mild respiratory symptoms." };
    case 4:
      return { level: "Poor", color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", text: "Everyone may begin to experience health effects; limit outdoor exertion." };
    case 5:
      return { level: "Very Poor", color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30", text: "Health alert: serious risk for all population groups. Stay indoors." };
    default:
      return { level: "Moderate", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", text: "Air quality data available." };
  }
}

export function getUvInfo(uvIndex) {
  const uv = Number(uvIndex) || 0;
  if (uv <= 2) {
    return { level: "Low", value: uv, color: "text-emerald-400", advice: "Minimal sun protection needed. Safe for outdoor activities." };
  } else if (uv <= 5) {
    return { level: "Moderate", value: uv, color: "text-amber-400", advice: "Wear sunscreen SPF 30+ and sunglasses during midday hours." };
  } else if (uv <= 7) {
    return { level: "High", value: uv, color: "text-orange-400", advice: "Protection required. Seek shade during peak afternoon sun." };
  } else if (uv <= 10) {
    return { level: "Very High", value: uv, color: "text-rose-400", advice: "Extra precautions needed. Avoid sun exposure between 10am-4pm." };
  } else {
    return { level: "Extreme", value: uv, color: "text-purple-400", advice: "Stay indoors or in shade. Unprotected skin burns in minutes." };
  }
}

export function formatLocalTime(timestampSec, timezoneOffsetSec = 0) {
  // Return Date object adjusted for target timezone
  const targetUtcMs = (timestampSec + timezoneOffsetSec) * 1000;
  const date = new Date(targetUtcMs);
  
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const dayName = days[date.getUTCDay()];
  const monthName = months[date.getUTCMonth()];
  const dayNum = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return {
    dayName,
    monthName,
    dayNum,
    hours24: hours,
    timeString: `${formattedHours}:${minutes} ${ampm}`,
    dateString: `${dayName}, ${monthName} ${dayNum}`,
    shortDate: `${monthName} ${dayNum}`,
  };
}

export function isNightTime(currentTimestampSec, sunriseSec, sunsetSec) {
  if (!sunriseSec || !sunsetSec) return false;
  return currentTimestampSec < sunriseSec || currentTimestampSec > sunsetSec;
}

export function groupForecastByDay(list = [], timezoneOffsetSec = 0) {
  if (!Array.isArray(list) || list.length === 0) return [];

  const dayMap = new Map();

  list.forEach((item) => {
    // Determine local date string key (YYYY-MM-DD)
    const localMs = (item.dt + timezoneOffsetSec) * 1000;
    const localDate = new Date(localMs);
    const dateKey = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, "0")}-${String(localDate.getUTCDate()).padStart(2, "0")}`;

    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        dateKey,
        dayInfo: formatLocalTime(item.dt, timezoneOffsetSec),
        items: [],
      });
    }
    dayMap.get(dateKey).items.push(item);
  });

  const dailySummaries = [];

  for (const [dateKey, dayData] of dayMap.entries()) {
    const temps = dayData.items.map((i) => i.main.temp);
    const minTemp = Math.round(Math.min(...temps));
    const maxTemp = Math.round(Math.max(...temps));

    // Find midday item or most representative condition
    const noonItem = dayData.items.find((i) => {
      const h = new Date((i.dt + timezoneOffsetSec) * 1000).getUTCHours();
      return h >= 11 && h <= 14;
    }) || dayData.items[Math.floor(dayData.items.length / 2)] || dayData.items[0];

    const maxWind = Math.max(...dayData.items.map((i) => i.wind.speed || 0));
    const avgHumidity = Math.round(dayData.items.reduce((acc, i) => acc + (i.main.humidity || 0), 0) / dayData.items.length);
    const maxPop = Math.round(Math.max(...dayData.items.map((i) => (i.pop || 0) * 100)));

    dailySummaries.push({
      dateKey,
      dayInfo: dayData.dayInfo,
      minTemp,
      maxTemp,
      weather: noonItem.weather[0],
      windSpeed: maxWind,
      humidity: avgHumidity,
      pop: maxPop,
      rawItem: noonItem,
    });
  }

  // Limit to 5 days
  return dailySummaries.slice(0, 5);
}
