const API_URL = "https://campusnav-ai-1.onrender.com";

let map, directionsService, directionsRenderer;
let currentMarker = null;
let locationData = [];

// ---------------- FETCH LOCATIONS ----------------
async function fetchLocations() {
  const res = await fetch(`${API_URL}/api/locations`);
  locationData = await res.json();
  populateDropdowns();
}

function populateDropdowns() {
  const startSelect = document.getElementById("start");
  const destSelect = document.getElementById("destination");

  startSelect.innerHTML = `<option value="">-- Select --</option>`;
  destSelect.innerHTML = `<option value="">-- Select --</option>`;

  locationData.forEach(loc => {
    const opt1 = document.createElement("option");
    opt1.value = loc.name;
    opt1.text = loc.name;
    startSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = loc.name;
    opt2.text = loc.name;
    destSelect.appendChild(opt2);
  });
}

function getCoordinates(name) {
  return locationData.find(l => l.name === name);
}

// ---------------- MAP INIT ----------------
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 17.5205, lng: 78.367 },
    zoom: 17,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLoc = {
        name: "Current Location",
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      locationData.unshift(userLoc);
      currentMarker = new google.maps.Marker({
        position: userLoc,
        map,
        icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
        title: "You are here",
      });
      fetchLocations();
    },
    () => fetchLocations()
  );
}

// ---------------- ROUTE + AI ----------------
async function updateRouteAndAI() {
  const start = document.getElementById("start").value;
  const dest = document.getElementById("destination").value;

  // ⛔ DO NOTHING until both selected
  if (!start || !dest) {
    document.getElementById("ai-status").innerText =
      "AI Crowd Status: Checking...";
    return;
  }

  const s = getCoordinates(start);
  const d = getCoordinates(dest);

  directionsService.route(
    {
      origin: s,
      destination: d,
      travelMode: google.maps.TravelMode.WALKING,
    },
    (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
        const leg = result.routes[0].legs[0];
        document.getElementById("distance").innerText =
          `Distance: ${leg.distance.text}`;
        document.getElementById("duration").innerText =
          `Time: ${leg.duration.text}`;
      }
    }
  );

  // ---------- LOG SEARCH ----------
  await fetch(`${API_URL}/api/log-route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, destination: dest }),
  });

  // ---------- FETCH AI ----------
  try {
    const res = await fetch(`${API_URL}/api/crowd-status`);
    const data = await res.json();
    document.getElementById("ai-status").innerText =
      `AI Crowd Status: ${data.status}`;
  } catch {
    document.getElementById("ai-status").innerText =
      "AI Crowd Status: Unavailable";
  }
}

// ---------------- EVENTS ----------------
document.getElementById("start").addEventListener("change", updateRouteAndAI);
document.getElementById("destination").addEventListener("change", updateRouteAndAI);

window.initMap = initMap;
