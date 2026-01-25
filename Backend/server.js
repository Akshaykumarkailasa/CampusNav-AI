const express = require("express");
const cors = require("cors");
const db = require("./firebase"); // 🔥 Firestore connection

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

// ---------- SEARCH LOG (🔥 FIXED) ----------
app.post("/api/log-route", async (req, res) => {
  try {
    const { start, destination, distance, duration } = req.body;

    await db.collection("navigation_logs").add({
      start,
      destination,
      distance,
      duration,
      timestamp: new Date()
    });

    console.log("✅ Route saved to Firestore:", start, "→", destination);
    res.json({ success: true });

  } catch (error) {
    console.error("❌ Firestore write failed:", error);
    res.status(500).json({ success: false });
  }
});

// ---------- AI CROWD STATUS ----------
app.get("/api/crowd-status", (req, res) => {
  const levels = ["Low", "Moderate", "High"];
  const random = levels[Math.floor(Math.random() * levels.length)];
  res.json({ status: random });
});

// ---------- START ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
