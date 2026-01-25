const API_URL = "https://campusnav-ai-1.onrender.com/api";
const AI_URL = "https://campusnav-ai.onrender.com/predict";

let map, directionsService, directionsRenderer;
let currentMarker = null;
let locationData = [];

async function fetchLocations() {
  const res = await fetch(`${API_URL}/locations`);
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

async function fetchAICrowdStatus() {
  try {
    const res = await fetch(AI_URL);
    const data = await res.json();

    document.getElementById("ai-status").innerText =
      `AI Crowd Status: ${data.prediction}`;
  } catch {
    document.getElementById("ai-status").innerText =
      "AI Crowd Status: Unavailable";
  }
}

async function saveSearch(start, destination, distance, duration) {
  await fetch(`${API_URL}/save-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start,
      destination,
      distance,
      duration
    })
  });
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 17.5205, lng: 78.367 },
    zoom: 17
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLoc = {
        name: "Current Location",
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      locationData.unshift(userLoc);

      currentMarker = new google.maps.Marker({
        position: userLoc,
        map,
        icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
        title: "You are here"
      });

      fetchLocations();
    },
    () => fetchLocations()
  );
}

function updateRoute() {
  const startName = document.getElementById("start").value;
  const destName = document.getElementById("destination").value;

  if (!startName || !destName) return;

  const start = getCoordinates(startName);
  const dest = getCoordinates(destName);

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

        saveSearch(
          startName,
          destName,
          leg.distance.text,
          leg.duration.text
        );

        fetchAICrowdStatus();
      }
    }
  );
}

document.getElementById("start").addEventListener("change", updateRoute);
document.getElementById("destination").addEventListener("change", updateRoute);

window.initMap = initMap;
