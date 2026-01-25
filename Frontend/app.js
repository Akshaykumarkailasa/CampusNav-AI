const API_URL = "https://campusnav-ai-1.onrender.com/api";

let map, directionsService, directionsRenderer;
let locationData = [];

// =====================
// FETCH LOCATIONS
// =====================
async function fetchLocations() {
  try {
    const res = await fetch(`${API_URL}/locations`);
    locationData = await res.json();
    populateDropdowns();
  } catch (err) {
    console.error("Failed to fetch locations", err);
  }
}

function populateDropdowns() {
  const start = document.getElementById("start");
  const dest = document.getElementById("destination");

  start.innerHTML = `<option value="">-- Select --</option>`;
  dest.innerHTML = `<option value="">-- Select --</option>`;

  locationData.forEach(loc => {
    const o1 = document.createElement("option");
    o1.value = loc.name;
    o1.textContent = loc.name;

    const o2 = o1.cloneNode(true);

    start.appendChild(o1);
    dest.appendChild(o2);
  });
}

function getCoords(name) {
  return locationData.find(l => l.name === name);
}

// =====================
// MAP INITIALIZATION
// =====================
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 17.5205, lng: 78.367 },
    zoom: 17,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  fetchLocations();
};

// =====================
// ROUTE + AI + LOGGING
// =====================
async function updateRoute() {
  const s = document.getElementById("start").value;
  const d = document.getElementById("destination").value;

  if (!s || !d) return;

  const start = getCoords(s);
  const dest = getCoords(d);

  directionsService.route(
    {
      origin: start,
      destination: dest,
      travelMode: google.maps.TravelMode.WALKING,
    },
    async (res, status) => {
      if (status !== "OK") return;

      directionsRenderer.setDirections(res);

      const leg = res.routes[0].legs[0];
      document.getElementById("distance").innerText =
        `Distance: ${leg.distance.text}`;
      document.getElementById("duration").innerText =
        `Time: ${leg.duration.text}`;

      // 🔥 AI Crowd Status
      try {
        const aiRes = await fetch(
          `${API_URL}/crowd-status?distance=${leg.distance.value}`
        );
        const ai = await aiRes.json();
        document.getElementById("ai-status").innerText =
          `AI Crowd Status: ${ai.status}`;
      } catch {
        document.getElementById("ai-status").innerText =
          "AI Crowd Status: unavailable";
      }

      // 🔥 Store search
      fetch(`${API_URL}/log-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: s,
          destination: d,
          distance: leg.distance.text,
          duration: leg.duration.text,
        }),
      });
    }
  );
}

document.getElementById("start").addEventListener("change", updateRoute);
document.getElementById("destination").addEventListener("change", updateRoute);
