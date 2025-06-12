// === Map Initialization ===
const map = L.map("map").setView([25.276987, 51.520008], 12); // Fake location: Qatar

// HD Street Map (MapTiler - replace 'YOUR_API_KEY' with real one if needed)
L.tileLayer('https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}@2x.png?key=Get_Your_Own_API_Key', {
  attribution: '&copy; MapTiler & OpenStreetMap contributors',
  maxZoom: 20,
}).addTo(map);

// === Custom Icons ===
const blueIcon = L.icon({
  iconUrl: 'assets/location-icon.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

const redIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'red-marker'
});

// === Initial Fake Marker (Qatar) ===
let fakeMarker = L.marker([25.276987, 51.520008], { icon: blueIcon, draggable: false }).addTo(map);
fakeMarker.on("dblclick", () => {
  map.removeLayer(fakeMarker);
  fakeMarker = null;
});

// === Toggle Buttons & Panels ===
const searchToggle = document.getElementById("search-toggle");
const directionToggle = document.getElementById("direction-toggle");
const locationToggle = document.getElementById("location-toggle");

const searchPanel = document.getElementById("search-panel");
const directionPanel = document.getElementById("direction-panel");

searchToggle.onclick = () => searchPanel.classList.toggle("hidden");
directionToggle.onclick = () => directionPanel.classList.toggle("hidden");
locationToggle.onclick = showUserLocation;

function hidePanel(id) {
  document.getElementById(id).classList.add("hidden");
}

// === Geocoder (for Autocomplete) ===
let geocoder = L.Control.Geocoder.nominatim();

function autocomplete(input, callback) {
  if (!input) return;
  geocoder.geocode(input, (results) => {
    callback(results.map(r => r.name));
  });
}

// === Search Handler ===
const searchBox = document.getElementById("searchBox");
const searchBtn = document.getElementById("searchBtn");

let redMarker;

searchBox.addEventListener("input", () => {
  autocomplete(searchBox.value, (suggestions) => {
    if (suggestions.length > 0) searchBox.value = suggestions[0];
  });
});

searchBtn.onclick = () => {
  geocoder.geocode(searchBox.value, (results) => {
    if (results.length === 0) return alert("Place not found!");
    const { center } = results[0];
    map.setView(center, 14);

    if (fakeMarker) map.removeLayer(fakeMarker);
    if (redMarker) map.removeLayer(redMarker);

    redMarker = L.marker(center, { icon: redIcon }).addTo(map);
    fakeMarker = redMarker;
  });
};

// === Direction Handler ===
const startInput = document.getElementById("start");
const endInput = document.getElementById("end");
const getDirectionBtn = document.getElementById("getDirection");

let control;
getDirectionBtn.onclick = () => {
  geocoder.geocode(startInput.value, (startResults) => {
    geocoder.geocode(endInput.value, (endResults) => {
      if (!startResults.length || !endResults.length) {
        alert("Start or End place not found!");
        return;
      }

      const start = startResults[0].center;
      const end = endResults[0].center;

      if (control) map.removeControl(control);

      control = L.Routing.control({
        waypoints: [L.latLng(start), L.latLng(end)],
        createMarker: function (i, wp) {
          return L.marker(wp.latLng, {
            icon: i === 0 ? blueIcon : redIcon
          });
        },
        routeWhileDragging: false
      }).addTo(map);
    });
  });
};

// === Show User Location ===
function showUserLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latlng = [position.coords.latitude, position.coords.longitude];
      map.setView(latlng, 15);
      L.marker(latlng, {
        icon: blueIcon
      }).addTo(map).bindPopup("Your Live Location").openPopup();
    },
    () => alert("Unable to retrieve your location.")
  );
}
