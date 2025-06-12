const map = L.map('map').setView([25.2882, 51.5485], 15);

// MapTiler tiles
L.tileLayer('https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO', {
  attribution: '&copy; OpenStreetMap & MapTiler',
}).addTo(map);

// Fake location marker in Qatar
let marker = L.marker([25.2882, 51.5485], { draggable: false, icon: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png', iconSize: [25, 40] }) }).addTo(map);

// Double-click to remove marker
marker.on('dblclick', () => {
  map.removeLayer(marker);
});

// Toggle panels
document.getElementById('search-toggle').onclick = () => {
  document.getElementById('search-panel').style.display = 'block';
  document.getElementById('direction-panel').style.display = 'none';
};
document.getElementById('direction-toggle').onclick = () => {
  document.getElementById('direction-panel').style.display = 'block';
  document.getElementById('search-panel').style.display = 'none';
};
document.getElementById('locate-toggle').onclick = () => {
  map.locate({ setView: true, maxZoom: 18 });
};

// Show your location
map.on('locationfound', e => {
  L.circleMarker(e.latlng, {
    radius: 8,
    fillColor: '#007BFF',
    color: '#007BFF',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.7
  }).addTo(map).bindPopup("Your location").openPopup();
});

function hidePanel(id) {
  document.getElementById(id).style.display = 'none';
}

// Autocomplete logic
function setupAutocomplete(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);

  input.addEventListener('input', () => {
    const query = input.value;
    if (!query) return list.innerHTML = '';
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      .then(res => res.json())
      .then(data => {
        list.innerHTML = '';
        data.slice(0, 5).forEach(place => {
          const li = document.createElement('li');
          li.textContent = place.display_name;
          li.onclick = () => {
            input.value = place.display_name;
            list.innerHTML = '';
          };
          list.appendChild(li);
        });
      });
  });
}

setupAutocomplete('searchBox', 'searchSuggestions');
setupAutocomplete('start', 'startSuggestions');
setupAutocomplete('end', 'endSuggestions');

// Search button logic
document.getElementById('searchBtn').onclick = () => {
  const query = document.getElementById('searchBox').value;
  if (!query) return;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return alert("Place not found.");
      const [lat, lon] = [data[0].lat, data[0].lon];
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lon]).addTo(map);
      map.setView([lat, lon], 15);
    });
};

// Direction logic
let routeControl;
document.getElementById('getDirection').onclick = () => {
  const startText = document.getElementById('start').value;
  const endText = document.getElementById('end').value;
  if (!startText || !endText) return;

  Promise.all([
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${startText}`).then(res => res.json()),
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${endText}`).then(res => res.json())
  ]).then(([startRes, endRes]) => {
    if (!startRes.length || !endRes.length) return alert("Invalid location(s).");

    const startCoord = L.latLng(startRes[0].lat, startRes[0].lon);
    const endCoord = L.latLng(endRes[0].lat, endRes[0].lon);

    if (routeControl) map.removeControl(routeControl);
    routeControl = L.Routing.control({
      waypoints: [startCoord, endCoord],
      routeWhileDragging: false,
      show: false,
      createMarker: function (i, wp) {
        return L.marker(wp.latLng, {
          icon: L.icon({
            iconUrl: i === 0
              ? 'https://cdn-icons-png.flaticon.com/512/447/447031.png' // blue start
              : 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // red end
            iconSize: [25, 40]
          })
        });
      }
    }).addTo(map);
  });
};
