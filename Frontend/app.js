const API_URL = "http://localhost:5000/api";

let map, directionsService, directionsRenderer;
let currentMarker = null;
let startMarker = null;
let destMarker = null;
let locationData = [];
let watchId = null;

/* ===============================
   FETCH LOCATIONS FROM BACKEND
================================ */
async function fetchLocations() {
  try {
    const res = await fetch(`${API_URL}/locations`);
    const backendLocations = await res.json();

    // Merge backend locations (avoid duplicate Current Location)
    locationData = locationData.filter(l => l.name === "Current Location");
    locationData.push(...backendLocations);

    populateDropdowns();
  } catch (err) {
    console.error("Failed to fetch locations", err);
  }
}

/* ===============================
   POPULATE DROPDOWNS
================================ */
function populateDropdowns() {
  const startSelect = document.getElementById("start");
  const destSelect = document.getElementById("destination");

  startSelect.innerHTML = `<option value="">-- Select --</option>`;
  destSelect.innerHTML = `<option value="">-- Select --</option>`;

  locationData.forEach(loc => {
    const opt1 = document.createElement("option");
    opt1.value = loc.name;
    opt1.textContent = loc.name;
    startSelect.appendChild(opt1);

    if (loc.name !== "Current Location") {
      const opt2 = document.createElement("option");
      opt2.value = loc.name;
      opt2.textContent = loc.name;
      destSelect.appendChild(opt2);
    }
  });
}

/* ===============================
   GET COORDINATES BY NAME
================================ */
function getCoordinates(name) {
  return locationData.find(l => l.name === name);
}

/* ===============================
   START LOCATION TRACKING (ONE TIME)
================================ */
function startTrackingLocation() {
  if (!navigator.geolocation || watchId !== null) return;

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const newPos = {
        name: "Current Location",
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      // Update or create marker
      if (currentMarker) {
        currentMarker.setPosition(newPos);
      } else {
        currentMarker = new google.maps.Marker({
          position: newPos,
          map: map,
          icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
          title: "You are here"
        });
      }

      // Update locationData
      const idx = locationData.findIndex(l => l.name === "Current Location");
      if (idx === -1) {
        locationData.unshift(newPos);
        populateDropdowns();
      } else {
        locationData[idx].lat = newPos.lat;
        locationData[idx].lng = newPos.lng;
      }
    },
    () => {
      alert("Location access denied");
    },
    { enableHighAccuracy: true }
  );
}

/* ===============================
   INITIALIZE MAP
================================ */
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 17.5205, lng: 78.367 },
    zoom: 17
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  startTrackingLocation();
  fetchLocations();
}

/* ===============================
   UPDATE ROUTE
================================ */
function updateRoute() {
  const s = document.getElementById("start").value;
  const d = document.getElementById("destination").value;

  if (!s || !d) return;

  const start = getCoordinates(s);
  const dest = getCoordinates(d);

  if (!start || !dest) return;

  directionsService.route(
    {
      origin: start,
      destination: dest,
      travelMode: google.maps.TravelMode.WALKING
    },
    (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);

        const leg = result.routes[0].legs[0];
        document.getElementById("distance").innerText =
          `Distance: ${leg.distance.text}`;
        document.getElementById("duration").innerText =
          `Time: ${leg.duration.text}`;

        fetchCrowdStatus();
        logRoute(start.name, dest.name, leg.distance.text, leg.duration.text);
      }
    }
  );
}

/* ===============================
   LOG ROUTE TO FIREBASE (BACKEND)
================================ */
async function logRoute(start, destination, distance, duration) {
  try {
    await fetch(`${API_URL}/log-route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start, destination, distance, duration })
    });
  } catch (err) {
    console.error("Failed to log route");
  }
}

/* ===============================
   AI CROWD STATUS
================================ */
async function fetchCrowdStatus() {
  try {
    const res = await fetch(`${API_URL}/crowd-status`);
    const data = await res.json();
    document.getElementById("ai-status").innerText =
      `AI Crowd Status: ${data.crowd_level}`;
  } catch {
    document.getElementById("ai-status").innerText =
      "AI Crowd Status: Unavailable";
  }
}

/* ===============================
   BUTTON ACTIONS
================================ */
document.getElementById("start").addEventListener("change", updateRoute);
document.getElementById("destination").addEventListener("change", updateRoute);

document.getElementById("navigate-btn").addEventListener("click", () => {
  const s = document.getElementById("start").value;
  const d = document.getElementById("destination").value;

  if (!s || !d) {
    alert("Please select start and destination");
    return;
  }

  const start = getCoordinates(s);
  const dest = getCoordinates(d);

  const url = `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${dest.lat},${dest.lng}&travelmode=walking`;
  window.open(url, "_blank");
});

document.getElementById("recenter-btn").addEventListener("click", () => {
  if (currentMarker) {
    map.setCenter(currentMarker.getPosition());
    map.setZoom(17);
  }
});

document.getElementById("reset-btn").addEventListener("click", () => {
  directionsRenderer.setDirections({ routes: [] });

  document.getElementById("distance").innerText = "Distance: 0 km";
  document.getElementById("duration").innerText = "Time: 0 mins";
  document.getElementById("ai-status").innerText =
    "AI Crowd Status: Checking...";

  document.getElementById("start").selectedIndex = 0;
  document.getElementById("destination").selectedIndex = 0;

  map.setCenter({ lat: 17.5205, lng: 78.367 });
  map.setZoom(17);
});

/* Refresh button = just recenter */
document.getElementById("refresh-location-btn").addEventListener("click", () => {
  if (currentMarker) {
    map.setCenter(currentMarker.getPosition());
    map.setZoom(17);
  }
});

window.initMap = initMap;
