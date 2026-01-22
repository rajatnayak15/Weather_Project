const API_KEY = "220a307cf495cc5847944e9f88620322";
const defaultCity = "Delhi";

// DOM elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityName = document.getElementById("cityName");
const weatherStatus = document.getElementById("weatherStatus");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const pressure = document.getElementById("pressure");
const statusText = document.getElementById("statusText");
const statusIcon = document.getElementById("statusIcon");

// 🔹 Temperature toggle elements 
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");
let currentTempC = null;

// Recent search 
const recentDropdown = document.getElementById("recentDropdown");
const recentContainer = document.getElementById("recentContainer");

// Error message 
const errorMessage = document.getElementById("errorMessage");

// 🔥 Extreme temperature alert
const weatherAlert = document.getElementById("weatherAlert");

// Forecast container
const forecastContainer = document.getElementById("forecastContainer");

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
let isLoading = false;

/* ================= LOADING STATE ================= */
function setLoading(state) {
  isLoading = state;
  const cards = document.querySelectorAll(".weather-card, .info-card");
  
  if (state) {
    cards.forEach(card => {
      card.style.opacity = "0.6";
      card.style.pointerEvents = "none";
    });
    searchBtn.disabled = true;
    locationBtn.disabled = true;
  } else {
    cards.forEach(card => {
      card.style.opacity = "1";
      card.style.pointerEvents = "auto";
    });
    searchBtn.disabled = false;
    locationBtn.disabled = false;
  }
}

/* ================= ERROR HANDLING ================= */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  setTimeout(() => {
    errorMessage.classList.add("hidden");
  }, 5000);
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

/* ================= EXTREME TEMP ALERT ================= */
function showWeatherAlert(message) {
  weatherAlert.textContent = message;
  weatherAlert.classList.remove("hidden");
}

function clearWeatherAlert() {
  weatherAlert.textContent = "";
  weatherAlert.classList.add("hidden");
}

/* ================= WEATHER BACKGROUND ================= */
function setWeatherBackground(condition) {
  const body = document.body;
  const mainContainer = document.querySelector(".main-container");

  // Remove all gradient classes
  body.classList.remove(
    "from-yellow-100","via-sky-100","to-blue-200",
    "from-gray-300","via-gray-400","to-gray-500",
    "from-slate-700","via-sky-800","to-blue-900",
    "from-blue-100","via-blue-200","to-blue-300"
  );

  body.classList.add("bg-gradient-to-br");

  // Smooth transition
  body.style.transition = "all 1s ease-out";

  if (condition === "rain") {
    body.classList.add("from-slate-700","via-sky-800","to-blue-900");
  } else if (condition === "clouds") {
    body.classList.add("from-gray-300","via-gray-400","to-gray-500");
  } else if (condition === "snow") {
    body.classList.add("from-blue-100","via-blue-200","to-blue-300");
  } else if (condition === "thunderstorm") {
    body.classList.add("from-slate-800","via-purple-900","to-slate-900");
  } else {
    body.classList.add("from-yellow-100","via-sky-100","to-blue-200");
  }
}

/* ================= FETCH 5-DAY FORECAST ================= */
function fetchFiveDayForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => renderFiveDayForecast(data))
    .catch(() => console.log("Forecast fetch error"));
}

/* ================= RENDER FORECAST CARDS ================= */
function renderFiveDayForecast(data) {
  forecastContainer.innerHTML = "";

  const dailyForecasts = data.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  ).slice(0, 5);

  dailyForecasts.forEach((day, index) => {
    const date = new Date(day.dt_txt);
    const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const tempC = Math.round(day.main.temp);

    const card = document.createElement("div");
    card.className = `
      forecast-card
      relative overflow-hidden
      bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl
      rounded-3xl p-5 text-center
      shadow-xl
      transition-all duration-400 ease-out
      hover:-translate-y-4 hover:shadow-2xl
      border-2 border-white/40 hover:border-sky-300/50
    `;
    
    card.style.animationDelay = `${index * 0.1}s`;

    // Get weather icon
    const condition = day.weather[0].main.toLowerCase();
    let icon = "🌤️";
    if (condition === "clear") icon = "☀️";
    else if (condition === "clouds") icon = "☁️";
    else if (condition === "rain") icon = "🌧️";
    else if (condition === "snow") icon = "❄️";
    else if (condition === "thunderstorm") icon = "⛈️";

    card.innerHTML = `
      <div class="absolute -top-8 -right-8 w-28 h-28
        bg-gradient-to-br from-sky-200 to-blue-300 rounded-full opacity-30 pointer-events-none"></div>

      <div class="absolute -bottom-6 -left-6 w-20 h-20
        bg-gradient-to-br from-cyan-200 to-sky-300 rounded-full opacity-20 pointer-events-none"></div>

      <p class="text-xs md:text-sm font-bold text-slate-800 mb-2 tracking-wide">
        ${dateString}
      </p>

      <p class="text-4xl md:text-5xl mb-3 filter drop-shadow-lg">${icon}</p>

      <div class="flex flex-col gap-2.5 text-xs md:text-sm text-slate-700 font-semibold">

        <div class="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-100/50 to-yellow-100/50 rounded-xl py-2 px-2 backdrop-blur-sm border border-orange-200/30">
          <span class="text-lg">🌡️</span>
          <span class="font-black text-slate-900">
            ${tempC}°C
          </span>
        </div>

        <div class="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-100/50 to-cyan-100/50 rounded-xl py-2 px-2 backdrop-blur-sm border border-blue-200/30">
          <span class="text-lg">💨</span>
          <span>${day.wind.speed.toFixed(1)} m/s</span>
        </div>

        <div class="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-100/50 to-sky-100/50 rounded-xl py-2 px-2 backdrop-blur-sm border border-cyan-200/30">
          <span class="text-lg">💧</span>
          <span>${day.main.humidity}%</span>
        </div>

      </div>
    `;

    forecastContainer.appendChild(card);
  });
}


/* ================= SEARCH BY CITY ================= */
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  clearError();

  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  fetchWeatherByCity(city);
  saveRecentCity(city);
  cityInput.value = "";
});

/* ================= ENTER KEY ON INPUT ================= */
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

/* ================= LOCATION BUTTON ================= */
locationBtn.addEventListener("click", () => {
  clearError();

  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    pos => {
      fetchWeatherByLocation(pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      showError("Unable to retrieve your location.");
      setLoading(false);
    }
  );
});

/* ================= FETCH WEATHER BY CITY ================= */
function fetchWeatherByCity(city) {
  setLoading(true);
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error("Invalid city");
      return res.json();
    })
    .then(data => {
      updateUI(data);
      setLoading(false);
    })
    .catch(() => {
      showError("City not found. Please enter a valid city name.");
      setLoading(false);
    });
}

/* ================= FETCH WEATHER BY LOCATION ================= */
function fetchWeatherByLocation(lat, lon) {
  setLoading(true);
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error("Location error");
      return res.json();
    })
    .then(data => {
      updateUI(data);
      setLoading(false);
    })
    .catch(() => {
      showError("Unable to fetch weather for your location.");
      setLoading(false);
    });
}

/* ================= UPDATE UI WITH ANIMATION ================= */
function updateUI(data) {
  clearError();

  // Smooth fade transition
  const cards = document.querySelectorAll(".weather-card, .info-card");
  cards.forEach(card => {
    card.style.opacity = "0.7";
  });

  setTimeout(() => {
    cityName.textContent = data.name;
    weatherStatus.textContent = data.weather[0].main;

    currentTempC = Math.round(data.main.temp);
    temperature.textContent = `${currentTempC}°C`;

    if (currentTempC >= 40) {
      showWeatherAlert("🔥 Extreme Heat Alert! Temperature is above 40°C.");
    } else {
      clearWeatherAlert();
    }

    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = data.main.humidity;
    wind.textContent = data.wind.speed;
    pressure.textContent = `${data.main.pressure} hPa`;

    const condition = data.weather[0].main.toLowerCase();
    statusText.textContent = data.weather[0].description;

    if (condition === "clear") statusIcon.textContent = "☀️";
    else if (condition === "clouds") statusIcon.textContent = "☁️";
    else if (condition === "rain") statusIcon.textContent = "🌧️";
    else if (condition === "snow") statusIcon.textContent = "❄️";
    else if (condition === "thunderstorm") statusIcon.textContent = "⛈️";
    else statusIcon.textContent = "🌤️";

    setWeatherBackground(condition);
    fetchFiveDayForecast(data.name);
    setActiveUnit("C");

    cards.forEach(card => {
      card.style.opacity = "1";
    });
  }, 300);
}

/* ================= TEMPERATURE UNIT TOGGLE ================= */
celsiusBtn.addEventListener("click", () => {
  if (currentTempC !== null) {
    temperature.textContent = `${currentTempC}°C`;
    setActiveUnit("C");
  }
});

fahrenheitBtn.addEventListener("click", () => {
  if (currentTempC !== null) {
    const tempF = Math.round((currentTempC * 9) / 5 + 32);
    temperature.textContent = `${tempF}°F`;
    setActiveUnit("F");
  }
});

function setActiveUnit(unit) {
  if (unit === "C") {
    celsiusBtn.className =
      "px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-semibold rounded-lg bg-sky-600 text-white shadow-md transition-all duration-300 hover:bg-sky-700 hover:shadow-lg active:scale-95";
    fahrenheitBtn.className =
      "px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-semibold rounded-lg bg-white/30 text-white shadow-md transition-all duration-300 hover:bg-white/40 active:scale-95 backdrop-blur-sm";
  } else {
    fahrenheitBtn.className =
      "px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-semibold rounded-lg bg-sky-600 text-white shadow-md transition-all duration-300 hover:bg-sky-700 hover:shadow-lg active:scale-95";
    celsiusBtn.className =
      "px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-semibold rounded-lg bg-white/30 text-white shadow-md transition-all duration-300 hover:bg-white/40 active:scale-95 backdrop-blur-sm";
  }
}

/* ================= RECENT SEARCH ================= */
function saveRecentCity(city) {
  if (!recentCities.includes(city)) {
    recentCities.unshift(city);
  } else {
    // Move to front if already exists
    recentCities = recentCities.filter(c => c !== city);
    recentCities.unshift(city);
  }
  recentCities = recentCities.slice(0, 5);
  localStorage.setItem("recentCities", JSON.stringify(recentCities));
  updateRecentDropdown();
}

function updateRecentDropdown() {
  if (recentCities.length === 0) {
    recentContainer.classList.add("hidden");
    return;
  }

  recentContainer.classList.remove("hidden");
  recentDropdown.innerHTML = `<option value="">Recently searched cities</option>`;

  recentCities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentDropdown.appendChild(option);
  });
}

recentDropdown.addEventListener("change", () => {
  if (recentDropdown.value) {
    fetchWeatherByCity(recentDropdown.value);
    recentDropdown.value = "";
  }
});

/* ================= PAGE LOAD ================= */
window.addEventListener("DOMContentLoaded", () => {
  fetchWeatherByCity(defaultCity);
  updateRecentDropdown();
});