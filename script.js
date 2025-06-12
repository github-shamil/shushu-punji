let map = L.map("map").setView([25.276987, 51.520008], 13);
let fakeMarker;
let liveMarker;
let routingControl;

// Setup map with MapTiler or default
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Fake location (Qatar) marker — normal blue marker
fakeMarker = L.marker([25.276987, 51.520008], {
  draggable: false,
  icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png' })
}).addTo(map);

// Double-click to remove marker
fakeMarker.on('dblclick', () => {
  map.removeLayer(fakeMarker);
});

// Show/Hide panels
document.getElementById("search-toggle").onclick = () => {
  togglePanel("search-panel");
};
document.getElementById("direction-toggle").onclick = () => {
  togglePanel("direction-panel");
};
document.getElementById("location-toggle").onclick = () => {
  navigator.geolocation.getCurrentPosition(showLiveLocation);
};

function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function hidePanel(id) {
  document.getElementById(id).style.display = "none";
}

// Autocomplete using Esri
const geocodeService = L.esri.Geocoding.geocodeService();

// Search function
function searchPlace() {
  const query = document.getElementById("searchBox").value;
  if (!query) return;

  L.esri.Geocoding.geocode().text(query).run((err, results) => {
    if (results?.results?.length > 0) {
      const latlng = results.results[0].latlng;
      map.setView(latlng, 14);
      if (fakeMarker) map.removeLayer(fakeMarker);
      fakeMarker = L.marker(latlng, {
        icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png' })
      }).addTo(map);
    }
  });
}

// Directions
function getDirections() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  if (routingControl) map.removeControl(routingControl);

  L.esri.Geocoding.geocode().text(start).run((err, startResults) => {
    L.esri.Geocoding.geocode().text(end).run((err, endResults) => {
      if (startResults.results.length && endResults.results.length) {
        const startLatLng = startResults.results[0].latlng;
        const endLatLng = endResults.results[0].latlng;

        // Custom markers
        const blueDot = L.icon({
          iconUrl: 'assets/live-location.svg',
          iconSize: [32, 32]
        });

        const redMark = L.icon({
          iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png'
        });

        routingControl = L.Routing.control({
          waypoints: [startLatLng, endLatLng],
          createMarker: function (i, waypoint) {
            return L.marker(waypoint.latLng, {
              icon: i === 0 ? blueDot : redMark
            });
          },
        }).addTo(map);
      }
    });
  });
}

// Show current live location
function showLiveLocation(pos) {
  const latlng = [pos.coords.latitude, pos.coords.longitude];
  if (liveMarker) map.removeLayer(liveMarker);
  const blueDot = L.icon({ iconUrl: "assets/live-location.svg", iconSize: [32, 32] });
  liveMarker = L.marker(latlng, { icon: blueDot }).addTo(map);
  map.setView(latlng, 15);
}
