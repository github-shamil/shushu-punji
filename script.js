let map = L.map("map").setView([25.276987, 51.520008], 13);
let fakeMarker, liveMarker, routingControl, walkPath = null;

// MapTiler (English-only map)
L.tileLayer("https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO", {
  attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
  maxZoom: 20
}).addTo(map);

// Initial fake marker (Qatar)
fakeMarker = L.marker([25.276987, 51.520008], {
  icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png' })
}).addTo(map);

// Remove fake marker on double click
fakeMarker.on("dblclick", () => map.removeLayer(fakeMarker));

// Toggle panels
document.getElementById("search-toggle").onclick = () => togglePanel("search-panel");
document.getElementById("direction-toggle").onclick = () => togglePanel("direction-panel");
document.getElementById("location-toggle").onclick = () =>
  navigator.geolocation.getCurrentPosition(showLiveLocation, () => alert("Location access denied"));

function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}
function hidePanel(id) {
  document.getElementById(id).style.display = "none";
}

// Autocomplete for any input
function enableAutocomplete(inputId, suggestionId) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionId);

  input.addEventListener("input", () => {
    const query = input.value.trim();
    if (!query) return box.innerHTML = "";

    L.esri.Geocoding.geocode().text(query).language("en").run((err, res) => {
      if (err || !res.results.length) return;
      box.innerHTML = "";
      res.results.forEach(result => {
        const div = document.createElement("div");
        div.className = "suggestion";
        div.textContent = result.text;
        div.onclick = () => {
          input.value = result.text;
          box.innerHTML = "";
        };
        box.appendChild(div);
      });
    });
  });
}
enableAutocomplete("searchBox", "searchSuggestions");
enableAutocomplete("start", "startSuggestions");
enableAutocomplete("end", "endSuggestions");

// Search and place marker
function searchPlace() {
  const query = document.getElementById("searchBox").value.trim();
  if (!query) return;
  L.esri.Geocoding.geocode().text(query).language("en").run((err, res) => {
    if (res.results.length === 0) return;
    const latlng = res.results[0].latlng;
    if (fakeMarker) map.removeLayer(fakeMarker);
    fakeMarker = L.marker(latlng, {
      icon: L.icon({ iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png' })
    }).addTo(map);
    map.setView(latlng, 14);
  });
}

// Directions with start & end
function getDirections() {
  const startInput = document.getElementById("start").value.trim();
  const endInput = document.getElementById("end").value.trim();
  if (!startInput || !endInput) return;

  if (routingControl) map.removeControl(routingControl);

  function geocodePlace(place, callback) {
    if (place.toLowerCase() === "my location" || place.toLowerCase() === "current location") {
      navigator.geolocation.getCurrentPosition(
        pos => callback(null, { latlng: L.latLng(pos.coords.latitude, pos.coords.longitude) }),
        () => callback("Location permission denied", null)
      );
    } else {
      L.esri.Geocoding.geocode().text(place).language("en").run((err, res) => {
        if (err || !res.results.length) return callback("Not found", null);
        callback(null, res.results[0]);
      });
    }
  }

  geocodePlace(startInput, (err1, startRes) => {
    if (err1 || !startRes) return;
    geocodePlace(endInput, (err2, endRes) => {
      if (err2 || !endRes) return;

      routingControl = L.Routing.control({
        waypoints: [startRes.latlng, endRes.latlng],
        routeWhileDragging: false,
        createMarker: (i, wp) => {
          return L.marker(wp.latLng, {
            icon: L.icon({
              iconUrl: i === 0
                ? "assets/live-location.svg"
                : "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",
              iconSize: [32, 32]
            })
          });
        }
      }).addTo(map);

      map.setView(startRes.latlng, 12);
    });
  });
}

// Show current live marker
function showLiveLocation(position) {
  const coords = [position.coords.latitude, position.coords.longitude];
  if (liveMarker) map.removeLayer(liveMarker);

  liveMarker = L.marker(coords, {
    icon: L.icon({ iconUrl: "assets/live-location.svg", iconSize: [32, 32] })
  }).addTo(map);
  map.setView(coords, 16);

  // Begin "walking" trail
  if (walkPath) map.removeLayer(walkPath);
  walkPath = L.polyline([coords], { color: 'blue' }).addTo(map);

  let trail = [coords];
  const watchId = navigator.geolocation.watchPosition(pos => {
    const newCoords = [pos.coords.latitude, pos.coords.longitude];
    trail.push(newCoords);
    walkPath.setLatLngs(trail);
    liveMarker.setLatLng(newCoords);
    map.panTo(newCoords);
  }, null, { enableHighAccuracy: true });

  // Stop tracking after 5 mins
  setTimeout(() => navigator.geolocation.clearWatch(watchId), 5 * 60 * 1000);
}
