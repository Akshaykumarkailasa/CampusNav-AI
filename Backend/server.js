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
// ---------- LOCATIONS (FULL LIST) ----------
app.get("/api/locations", (req, res) => {
  res.json([
    { name: "Current Location", lat: null, lng: null },
    { name: "CSE Block", lat: 17.5216, lng: 78.3674 },
    { name: "Mechanical/Civil/EEE Block", lat: 17.5212, lng: 78.3672 },
    { name: "EEE Block", lat: 17.5211, lng: 78.3665 },
    { name: "IT Block", lat: 17.5204, lng: 78.3674 },
    { name: "Canteen", lat: 17.5204, lng: 78.3666 },
    { name: "Gokaraju Lailavathi Block", lat: 17.5210, lng: 78.3656 },
    { name: "Bank", lat: 17.5190, lng: 78.3682 },
    { name: "Pharmacy", lat: 17.5206, lng: 78.3688 },
    { name: "Library", lat: 17.5205, lng: 78.3675 },
    { name: "Halls 1 and 2", lat: 17.5192, lng: 78.3679 },
    { name: "Volleyball Court", lat: 17.5194, lng: 78.3679 },
    { name: "Cricket Ground", lat: 17.5194, lng: 78.3663 },
    { name: "Open Air Stadium", lat: 17.5207, lng: 78.3667 },
    { name: "AIML Block", lat: 17.5218, lng: 78.3670 }
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
