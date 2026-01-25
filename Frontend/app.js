const API_BASE = "https://campusnav-ai-1.onrender.com";

async function loadCrowdStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/crowd-status`);
    const data = await res.json();
    document.getElementById("ai-status").innerText =
      `AI Crowd Status: ${data.status}`;
  } catch {
    document.getElementById("ai-status").innerText =
      "AI Crowd Status: unavailable";
  }
}

async function logRoute(start, destination) {
  await fetch(`${API_BASE}/api/log-route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, destination })
  });
}

document.getElementById("start").addEventListener("change", () => {
  const start = document.getElementById("start").value;
  const dest = document.getElementById("destination").value;
  if (start && dest) {
    logRoute(start, dest);
    loadCrowdStatus();
  }
});

document.getElementById("destination").addEventListener("change", () => {
  const start = document.getElementById("start").value;
  const dest = document.getElementById("destination").value;
  if (start && dest) {
    logRoute(start, dest);
    loadCrowdStatus();
  }
});
