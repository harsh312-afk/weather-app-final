import test from "node:test";
import assert from "node:assert/strict";
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
} from "../src/utils.js";

test("celsiusToFahrenheit and fahrenheitToCelsius conversions", () => {
  assert.equal(celsiusToFahrenheit(0), 32);
  assert.equal(celsiusToFahrenheit(25), 77);
  assert.equal(celsiusToFahrenheit(-10), 14);
  assert.equal(celsiusToFahrenheit(100), 212);

  assert.equal(fahrenheitToCelsius(32), 0);
  assert.equal(fahrenheitToCelsius(77), 25);
  assert.equal(fahrenheitToCelsius(212), 100);
});

test("speed, pressure, and distance conversions", () => {
  assert.equal(msToMph(10), 22.4);
  assert.equal(msToKmh(10), 36.0);
  assert.equal(hPaToInHg(1013.25), 29.92);
  assert.equal(metersToKm(10000), 10.0);
  assert.equal(metersToMiles(1609.34), 1.0);
});

test("getWindDirection returns correct cardinal bearings", () => {
  assert.equal(getWindDirection(0), "N");
  assert.equal(getWindDirection(90), "E");
  assert.equal(getWindDirection(180), "S");
  assert.equal(getWindDirection(270), "W");
  assert.equal(getWindDirection(45), "NE");
  assert.equal(getWindDirection(360), "N");
});

test("getAqiInfo maps air quality levels correctly", () => {
  assert.equal(getAqiInfo(1).level, "Good");
  assert.equal(getAqiInfo(2).level, "Fair");
  assert.equal(getAqiInfo(3).level, "Moderate");
  assert.equal(getAqiInfo(4).level, "Poor");
  assert.equal(getAqiInfo(5).level, "Very Poor");
});

test("getUvInfo maps UV index and health warnings", () => {
  assert.equal(getUvInfo(1).level, "Low");
  assert.equal(getUvInfo(4).level, "Moderate");
  assert.equal(getUvInfo(7).level, "High");
  assert.equal(getUvInfo(9).level, "Very High");
  assert.equal(getUvInfo(12).level, "Extreme");
});

test("formatLocalTime calculates correct local city time with timezone offset", () => {
  // Base UTC timestamp: 2026-09-01 12:00:00 UTC (1788264000)
  const baseUtcSec = 1788264000;
  
  // Test UTC (offset 0)
  const utcTime = formatLocalTime(baseUtcSec, 0);
  assert.equal(utcTime.hours24, 12);
  assert.equal(utcTime.timeString, "12:00 PM");

  // Test Tokyo (UTC+9 = 32400 seconds)
  const tokyoTime = formatLocalTime(baseUtcSec, 32400);
  assert.equal(tokyoTime.hours24, 21);
  assert.equal(tokyoTime.timeString, "9:00 PM");

  // Test New York (UTC-4 = -14400 seconds)
  const nyTime = formatLocalTime(baseUtcSec, -14400);
  assert.equal(nyTime.hours24, 8);
  assert.equal(nyTime.timeString, "8:00 AM");
});

test("isNightTime detects day vs night based on solar timestamps", () => {
  const sunrise = 1700000000;
  const sunset = 1700040000;

  // Midday
  assert.equal(isNightTime(1700020000, sunrise, sunset), false);
  // Before sunrise
  assert.equal(isNightTime(1699990000, sunrise, sunset), true);
  // After sunset
  assert.equal(isNightTime(1700050000, sunrise, sunset), true);
});

test("groupForecastByDay accurately creates daily summaries with min/max temp", () => {
  const mockForecastList = [
    {
      dt: 1788220800, // Day 1 00:00
      main: { temp: 18, humidity: 70 },
      weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
      wind: { speed: 3.5 },
      pop: 0.1,
    },
    {
      dt: 1788231600, // Day 1 03:00
      main: { temp: 26, humidity: 50 },
      weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
      wind: { speed: 5.0 },
      pop: 0.2,
    },
    {
      dt: 1788307200, // Day 2 00:00
      main: { temp: 15, humidity: 85 },
      weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }],
      wind: { speed: 8.0 },
      pop: 0.8,
    },
    {
      dt: 1788318000, // Day 2 03:00
      main: { temp: 20, humidity: 80 },
      weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }],
      wind: { speed: 7.2 },
      pop: 0.75,
    },
  ];

  const grouped = groupForecastByDay(mockForecastList, 0);
  assert.equal(grouped.length, 2);

  // Day 1 check
  assert.equal(grouped[0].minTemp, 18);
  assert.equal(grouped[0].maxTemp, 26);
  assert.equal(grouped[0].weather.main, "Clear");

  // Day 2 check
  assert.equal(grouped[1].minTemp, 15);
  assert.equal(grouped[1].maxTemp, 20);
  assert.equal(grouped[1].weather.main, "Rain");
  assert.equal(grouped[1].pop, 80);
});
