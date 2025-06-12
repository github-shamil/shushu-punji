// === Map Setup ===
const map = L.map('map').setView([25.276987, 55.296249], 13); // Fake location: Dubai

L.tileLayer(`https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=YOUR_MAPTILER_API_KEY`, {
  attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
  tileSize: 512,
  zoomOffset: -1,
}).addTo(map);

// === Icons ===
const blueMarker = L.icon({
  iconUrl: 'assets/live-location.svg',
  iconSize: [30, 30],
});

const redMarker = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// === Fake Marker (blue) ===
let fakeMarker = L.marker([25.276987, 55.296249], { icon: blueMarker }).addTo(map);
fakeMarker.on('dblclick', () => {
  map.removeLayer(fakeMarker);
});

// === Search Feature ===
let searchInput = document.getElementById('searchBox');
let searchPanel = document.getElementById('search-panel');
let searchToggle = document.getElementById('search-toggle');
let directionToggle = document.getElementById('direction-toggle');
let locationToggle = document.getElementById('location-toggle');
let directionPanel = document.getElementById('direction-panel');

let suggestionTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(suggestionTimeout);
  suggestionTimeout = setTimeout(() => {
    const query = searchInput.value.trim();
    if (query.length > 2) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        .then(res => res.json())
        .then(data => {
          if (data[0]) searchInput.value = data[0].display_name;
        });
    }
  }, 500);
});

document.getElementById('search-panel').querySelector('button').addEventListener('click', () => {
  const query = searchInput.value.trim();
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
    .then(res => res.json())
    .then(data => {
      if (data[0]) {
        const latlng = [data[0].lat, data[0].lon];
        map.setView(latlng, 14);
        if (fakeMarker) fakeMarker.setLatLng(latlng);
        else fakeMarker = L.marker(latlng, { icon: blueMarker }).addTo(map);
      }
    });
});

// === Direction ===
let routeBtn = document.getElementById('getDirection');
let startInput = document.getElementById('start');
let endInput = document.getElementById('end');
let routingControl;

routeBtn.addEventListener('click', () => {
  const start = startInput.value.trim();
  const end = endInput.value.trim();

  if (!start || !end) return;

  Promise.all([
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${start}`).then(res => res.json()),
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${end}`).then(res => res.json())
  ]).then(([startData, endData]) => {
    if (!startData[0] || !endData[0]) return;

    const startCoords = [startData[0].lat, startData[0].lon];
    const endCoords = [endData[0].lat, endData[0].lon];

    if (routingControl) map.removeControl(routingControl);

    routingControl = L.Routing.control({
      waypoints: [
        L.latLng(startCoords),
        L.latLng(endCoords),
      ],
      createMarker: (i, wp) => {
        return L.marker(wp.latLng, { icon: i === 0 ? blueMarker : redMarker });
      },
      routeWhileDragging: false,
    }).addTo(map);
  });
});

// === Toggle Controls ===
searchToggle.addEventListener('click', () => {
  searchPanel.classList.toggle('hidden');
});

directionToggle.addEventListener('click', () => {
  directionPanel.classList.toggle('hidden');
});

locationToggle.addEventListener('click', () => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const latlng = [latitude, longitude];
    L.marker(latlng, { icon: blueMarker }).addTo(map).bindPopup('Your Location').openPopup();
    map.setView(latlng, 14);
  });
});

// === Hide Panels ===
function hidePanel(id) {
  document.getElementById(id).classList.add('hidden');
}
