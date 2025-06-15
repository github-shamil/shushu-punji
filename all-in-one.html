<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Realistic Fake Location Map</title>
  <link rel="icon" href="assets/fav.png" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      font-family: 'Roboto', sans-serif;
      background: #fff;
    }
    #map {
      height: 100vh;
      width: 100%;
      z-index: 1;
    }
    .floating-search {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 10px 15px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
      display: flex;
      gap: 10px;
      z-index: 1001;
      align-items: center;
    }
    .floating-search input {
      padding: 8px;
      font-size: 14px;
      border-radius: 8px;
      border: 1px solid #ccc;
      width: 220px;
    }
    .floating-search button {
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-weight: bold;
    }
    .autocomplete-container {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: white;
      border: 1px solid #ccc;
      z-index: 999;
      max-height: 200px;
      overflow-y: auto;
      border-radius: 4px;
    }
    .autocomplete-container .suggestion {
      padding: 8px 10px;
      cursor: pointer;
      font-size: 14px;
    }
    .autocomplete-container .suggestion:hover {
      background-color: #f0f0f0;
    }
    #direction-panel {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      max-width: 90%;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.3);
      display: none;
      flex-direction: column;
      gap: 10px;
      z-index: 1001;
    }
    #direction-panel input, #direction-panel button {
      padding: 8px;
      font-size: 14px;
      border-radius: 8px;
      border: 1px solid #ccc;
    }
    #directionBtn {
      background-color: #1976d2;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }
    #closeDirectionBtn {
      background-color: #999;
      margin-top: 5px;
    }
    #history-panel {
      position: fixed;
      top: 85px;
      right: 15px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      width: 250px;
      padding: 16px;
      display: none;
      z-index: 1001;
    }
    #historyList {
      list-style: none;
      padding: 0;
      font-size: 14px;
    }
    #historyList li {
      border-bottom: 1px solid #eee;
      padding: 8px 4px;
    }
    .map-ui {
      position: fixed;
      bottom: 20px;
      right: 15px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 1002;
    }
    .icon {
      width: 48px;
      height: 48px;
      padding: 8px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: background 0.3s ease;
    }
    .icon:hover {
      background: #f0f0f0;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <div class="floating-search">
    <input id="searchInput" type="text" placeholder="Search..." />
    <div id="searchSuggestions" class="autocomplete-container"></div>
    <button id="searchBtn">Search</button>
  </div>

  <div id="direction-panel">
    <input type="text" id="fromInput" placeholder="Start location" />
    <div id="fromInputSuggestions" class="autocomplete-container"></div>
    <input type="text" id="toInput" placeholder="Destination" />
    <div id="toInputSuggestions" class="autocomplete-container"></div>
    <button id="directionBtn">Get Direction</button>
    <button id="closeDirectionBtn">Close</button>
  </div>

  <div id="history-panel">
    <h3>Location History</h3>
    <ul id="historyList"></ul>
  </div>

  <div class="map-ui">
    <img src="assets/direction-icon.svg" id="directionToggleBtn" class="icon" title="Directions" />
    <img src="assets/location-icon.svg" id="locateBtn" class="icon" title="Your Location" />
    <img src="assets/history-icon.svg" id="historyToggleBtn" class="icon" title="History" />
    <img src="assets/dark-icon.svg" id="darkModeBtn" class="icon" title="Dark Mode" />
  </div>

  <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"></script>
  <script>
    const map = L.map('map').setView([25.276987, 55.296249], 13);
    const tileURL = 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=VcSgtSTkXfCbU3n3RqBO';
    L.tileLayer(tileURL, { attribution: '', tileSize: 512, zoomOffset: -1 }).addTo(map);

    let marker = L.marker([25.276987, 55.296249]).addTo(map);

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchSuggestions = document.getElementById('searchSuggestions');

    async function fetchSuggestions(query, container, callback) {
      const res = await fetch(`https://api.maptiler.com/geocoding/${query}.json?key=VcSgtSTkXfCbU3n3RqBO&language=en`);
      const data = await res.json();
      container.innerHTML = '';
      data.features.forEach(place => {
        const div = document.createElement('div');
        div.classList.add('suggestion');
        div.textContent = place.place_name;
        div.onclick = () => callback(place);
        container.appendChild(div);
      });
    }

    searchInput.addEventListener('input', () => {
      if (searchInput.value.length > 2) {
        fetchSuggestions(searchInput.value, searchSuggestions, (place) => {
          const [lon, lat] = place.center;
          marker.setLatLng([lat, lon]);
          map.setView([lat, lon], 16);
          searchSuggestions.innerHTML = '';
        });
      }
    });

    searchBtn.onclick = () => {
      if (searchInput.value.length > 2) {
        fetchSuggestions(searchInput.value, searchSuggestions, (place) => {
          const [lon, lat] = place.center;
          marker.setLatLng([lat, lon]);
          map.setView([lat, lon], 16);
        });
      }
    };

    document.getElementById('directionToggleBtn').onclick = () => {
      const panel = document.getElementById('direction-panel');
      panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    };

    document.getElementById('closeDirectionBtn').onclick = () => {
      document.getElementById('direction-panel').style.display = 'none';
    };

    document.getElementById('directionBtn').onclick = async () => {
      const fromText = document.getElementById('fromInput').value;
      const toText = document.getElementById('toInput').value;

      const fetchCoord = async (text) => {
        const res = await fetch(`https://api.maptiler.com/geocoding/${text}.json?key=VcSgtSTkXfCbU3n3RqBO`);
        const data = await res.json();
        const [lon, lat] = data.features[0].center;
        return [lat, lon];
      };

      const from = await fetchCoord(fromText);
      const to = await fetchCoord(toText);

      if (window.routingControl) map.removeControl(window.routingControl);
      window.routingControl = L.Routing.control({
        waypoints: [L.latLng(...from), L.latLng(...to)],
        routeWhileDragging: false
      }).addTo(map);
    };

    document.getElementById('locateBtn').onclick = () => {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        marker.setLatLng([latitude, longitude]);
        map.setView([latitude, longitude], 16);
      });
    };

    document.getElementById('historyToggleBtn').onclick = () => {
      const panel = document.getElementById('history-panel');
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    };

    document.getElementById('darkModeBtn').onclick = () => {
      document.body.classList.toggle('dark-mode');
    };

    map.on('dblclick', () => {
      if (marker) map.removeLayer(marker);
    });
  </script>
</body>
</html>
