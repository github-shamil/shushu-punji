let map = L.map("map").setView([25.276987, 51.520008], 13);
let fakeMarker = L.marker([25.276987, 51.520008], { draggable: false }).addTo(map);

L.tileLayer("https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=YOUR_MAPTILER_API_KEY", {
  attribution: '&copy; MapTiler',
}).addTo(map);

document.getElementById("search-toggle").onclick = () =>
  document.getElementById("search-panel").classList.toggle("hidden");
document.getElementById("direction-toggle").onclick = () =>
  document.getElementById("direction-panel").classList.toggle("hidden");
document.getElementById("location-toggle").onclick = showCurrentLocation;

function hidePanel(id) {
  document.getElementById(id).classList.add("hidden");
}

function showCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const latlng = [position.coords.latitude, position.coords.longitude];
      L.marker(latlng, {
        icon: L.icon({
          iconUrl: "assets/live-location.svg",
          iconSize: [20, 20],
        }),
      }).addTo(map);
      map.setView(latlng, 14);
    });
  }
}

// Search box autocomplete (basic logic)
const places = ["Kannur", "Kochi", "Qatar", "Dubai", "Doha", "Trivandrum", "Mumbai", "Delhi"];
const searchInput = document.getElementById("searchBox");
const searchSuggestions = document.getElementById("searchSuggestions");
searchInput.addEventListener("input", () => {
  const val = searchInput.value.toLowerCase();
  searchSuggestions.innerHTML = "";
  if (val.length > 1) {
    places
      .filter((p) => p.toLowerCase().startsWith(val))
      .forEach((p) => {
        const div = document.createElement("div");
        div.textContent = p;
        div.style.cursor = "pointer";
        div.onclick = () => {
          searchInput.value = p;
          searchSuggestions.innerHTML = "";
        };
        searchSuggestions.appendChild(div);
      });
  }
});

document.getElementById("searchBtn").onclick = () => {
  const query = searchInput.value;
  L.Control.Geocoder.nominatim().geocode(query, function (results) {
    if (results.length > 0) {
      const latlng = results[0].center;
      map.setView(latlng, 13);
      fakeMarker.setLatLng(latlng);
    }
  });
};

// Direction logic
const directionStart = document.getElementById("start");
const directionEnd = document.getElementById("end");
document.getElementById("getDirection").onclick = () => {
  const start = directionStart.value;
  const end = directionEnd.value;
  if (start && end) {
    L.Control.Geocoder.nominatim().geocode(start, function (startResults) {
      if (startResults.length > 0) {
        const startLatLng = startResults[0].center;
        L.Control.Geocoder.nominatim().geocode(end, function (endResults) {
          if (endResults.length > 0) {
            const endLatLng = endResults[0].center;
            L.Routing.control({
              waypoints: [L.latLng(startLatLng), L.latLng(endLatLng)],
              routeWhileDragging: false,
            }).addTo(map);
            L.marker(startLatLng, {
              icon: L.icon({ iconUrl: "assets/live-location.svg", iconSize: [20, 20] })
            }).addTo(map);
            L.marker(endLatLng).addTo(map);
          }
        });
      }
    });
  }
};