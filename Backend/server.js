const express = require("express");
const cors = require("cors");
const db = require("./firebase"); // Firestore

const app = express();
app.use(cors());
app.use(express.json());

// ---------- TEST ROUTE ----------
app.get("/", (req, res) => {
  res.send("CampusNav Backend is running");
});

// ---------- LOCATIONS ----------
app.get("/api/locations", (req, res) => {
  res.json([
    { name: "Library", lat: 17.5209, lng: 78.3673 },
    { name: "Canteen", lat: 17.5201, lng: 78.3664 },
    { name: "Admin Block", lat: 17.5212, lng: 78.3681 }
  ]);
});

// ---------- SEARCH LOG (WITH HARD DEBUG) ----------
app.post("/api/log-route", async (req, res) => {
  console.log("🔥 /api/log-route HIT");

  if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("❌ FIREBASE_PROJECT_ID missing");
    return res.status(500).json({ error: "Firebase project ID missing" });
  }

  try {
    const { start, destination, distance, duration } = req.body;

    await db.collection("navigation_logs").add({
      start,
      destination,
      distance,
      duration,
      timestamp: new Date()
    });

    console.log("✅ Firestore write SUCCESS");
    res.json({ success: true });

  } catch (error) {
    console.error("❌ Firestore write FAILED:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- AI CROWD STATUS ----------
app.get("/api/crowd-status", (req, res) => {
  const levels = ["Low", "Moderate", "High"];
  const random = levels[Math.floor(Math.random() * levels.length)];
  res.json({ status: random });
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
