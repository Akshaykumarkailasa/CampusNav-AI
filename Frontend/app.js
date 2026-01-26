const API_URL = "https://campusnav-ai-1.onrender.com/api";

let map, directionsService, directionsRenderer;
let currentMarker = null;
let locationData = [];

document.addEventListener("DOMContentLoaded", () => {

  // ----- FETCHING LOCATIONS ---------------
  async function fetchLocations() {
    try {
      const res = await fetch(`${API_URL}/locations`);
      locationData = await res.json();
      populateDropdowns();
    } catch (err) {
      console.error("Error fetching locations", err);
    }
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

  // ----- AI CROWD STATUS ----------------
  async function fetchCrowdStatus() {
    try {
      const res = await fetch(`${API_URL}/crowd-status`);
      const data = await res.json();
      document.getElementById("ai-status").innerText =
        `AI Crowd Status: ${data.status}`;
    } catch (err) {
      document.getElementById("ai-status").innerText =
        "AI Crowd Status: Unavailable";
    }
  }

  // ---------------- MAP INIT -----
  window.initMap = function () {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 17.5205, lng: 78.367 },
      zoom: 17,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        currentMarker = new google.maps.Marker({
          position: userLoc,
          map,
          icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
          title: "You are here",
        });

        map.setCenter(userLoc);
        fetchLocations();
        fetchCrowdStatus();
      },
      () => {
        fetchLocations();
        fetchCrowdStatus();
      }
    );
  };

  // -------------- ROUTE UPDATE --------
  async function updateRoute() {
    const startName = document.getElementById("start").value;
    const destName = document.getElementById("destination").value;
    if (!startName || !destName) return;

    const start = getCoordinates(startName);
    const dest = getCoordinates(destName);

    directionsService.route(
      {
        origin: start,
        destination: dest,
        travelMode: google.maps.TravelMode.WALKING,
      },
      async (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);

          const leg = result.routes[0].legs[0];
          document.getElementById("distance").innerText =
            `Distance: ${leg.distance.text}`;
          document.getElementById("duration").innerText =
            `Time: ${leg.duration.text}`;

          // log search
          await fetch(`${API_URL}/log-route`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              start: startName,
              destination: destName,
            }),
          });

          fetchCrowdStatus();
        }
      }
    );
  }

  // ---------- BUTTONS-----
  document.getElementById("start").addEventListener("change", updateRoute);
  document.getElementById("destination").addEventListener("change", updateRoute);

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
  });

  document.getElementById("navigate-btn").addEventListener("click", () => {
    const startName = document.getElementById("start").value;
    const destName = document.getElementById("destination").value;
    if (!startName || !destName) {
      alert("Select start and destination");
      return;
    }

    const start = getCoordinates(startName);
    const dest = getCoordinates(destName);

    const url = `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${dest.lat},${dest.lng}&travelmode=walking`;
    window.open(url, "_blank");
  });

});
