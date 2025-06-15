const MAPTILER_API = "VcSgtSTkXfCbU3n3RqBO";
const WEATHER_API = "71aec132cf2764d6ea577d3616629a9b";
const TOMTOM_API = "a3vv3A6LAvqLAIKmknfwzSBXEjJOpXwu";

// 🗺️ Initial map and base layers
let isSatellite = false;
let satelliteLayer = L.tileLayer(`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_API}`, { tileSize: 512, zoomOffset: -1 });
let normalLayer = L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API}`, { tileSize: 512, zoomOffset: -1 });

const map = L.map("map").setView([25.276987, 55.296249], 13);
normalLayer.addTo(map);

let marker = L.marker([25.276987, 55.296249]).addTo(map);

// 🌑 Dark Mode
document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark-mode");
};

// 🛰️ Toggle satellite
document.getElementById("satToggle").onclick = function () {
  if (isSatellite) {
    map.removeLayer(satelliteLayer);
    normalLayer.addTo(map);
  } else {
    map.removeLayer(normalLayer);
    satelliteLayer.addTo(map);
  }
  isSatellite = !isSatellite;
  this.classList.toggle("active");
};

// 🔄 Show loading screen briefly
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
  }, 1200);
});

// 📍 Live Location
document.getElementById("locToggle").onclick = () => {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    map.setView([latitude, longitude], 15);
    marker.setLatLng([latitude, longitude]);
    saveToHistory(latitude, longitude, "Live Location");
  });
};

// 🔍 Place Search
document.getElementById("searchBtn").onclick = handleSearch;
async function handleSearch() {
  const query = document.getElementById("searchInput").value;
  if (!query) return;
  const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API}&language=en`);
  const data = await res.json();
  if (data.features.length) {
    const [lon, lat] = data.features[0].geometry.coordinates;
    map.setView([lat, lon], 15);
    marker.setLatLng([lat, lon]);
    saveToHistory(lat, lon, data.features[0].place_name_en || data.features[0].place_name);
  }
}

// ⛔ Suggestion dropdown (Optional)
document.getElementById("searchInput").addEventListener("input", async function () {
  const query = this.value;
  const box = document.getElementById("suggestions");
  if (!query) return box.style.display = "none";
  const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API}&language=en`);
  const data = await res.json();
  box.innerHTML = "";
  data.features.slice(0, 5).forEach(f => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.textContent = f.place_name_en || f.place_name;
    div.onclick = () => {
      document.getElementById("searchInput").value = div.textContent;
      handleSearch();
      box.style.display = "none";
    };
    box.appendChild(div);
  });
  box.style.display = "block";
});

// 🚦 Toggle traffic
document.getElementById("trafficToggle").onclick = function () {
  this.classList.toggle("active");
  if (map.hasLayer(trafficLayer)) {
    map.removeLayer(trafficLayer);
  } else {
    trafficLayer.addTo(map);
  }
};
let trafficLayer = L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_API}`, {
  tileSize: 256,
  opacity: 0.7
});

// 🌤️ Weather
document.getElementById("weatherToggle").onclick = function () {
  this.classList.toggle("active");
  const box = document.getElementById("weather-box");
  box.style.display = box.style.display === "block" ? "none" : "block";

  const { lat, lng } = marker.getLatLng();
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${WEATHER_API}`)
    .then(r => r.json())
    .then(data => {
      box.querySelector(".location").textContent = data.name;
      box.querySelector(".temp").textContent = `${Math.round(data.main.temp)}°C`;
      box.querySelector(".condition").textContent = data.weather[0].description;
    });
};

// ➡️ Directions
document.getElementById("dirToggle").onclick = function () {
  const panel = document.getElementById("direction-panel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
};

document.getElementById("getDirectionBtn").onclick = async function () {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  if (!start || !end) return;

  const getCoord = async (place) => {
    const r = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(place)}.json?key=${MAPTILER_API}`);
    const d = await r.json();
    return d.features[0].geometry.coordinates.reverse();
  };

  const startCoord = await getCoord(start);
  const endCoord = await getCoord(end);

  if (window.routingControl) map.removeControl(window.routingControl);
  window.routingControl = L.Routing.control({
    waypoints: [L.latLng(...startCoord), L.latLng(...endCoord)],
    routeWhileDragging: false
  }).addTo(map);

  map.setView(endCoord, 15);
  marker.setLatLng(endCoord);
  saveToHistory(endCoord[0], endCoord[1], `Route to ${end}`);
};

// 📋 Save to local history
function saveToHistory(lat, lon, label) {
  let list = JSON.parse(localStorage.getItem("locationHistory") || "[]");
  list.unshift({ lat, lon, label, time: new Date().toLocaleString() });
  localStorage.setItem("locationHistory", JSON.stringify(list.slice(0, 10))); // Max 10
  showHistory();
}

// 📜 Show local history
function showHistory() {
  const list = JSON.parse(localStorage.getItem("locationHistory") || "[]");
  const ul = document.getElementById("historyList");
  ul.innerHTML = "";
  list.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.label} (${item.time})`;
    li.onclick = () => {
      map.setView([item.lat, item.lon], 15);
      marker.setLatLng([item.lat, item.lon]);
    };
    ul.appendChild(li);
  });
}
showHistory();
