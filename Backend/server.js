const express = require("express");
const axios = require("axios");
const cors = require("cors");

const locations = require("./locations");
const db = require("./firebase");

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("QR Navigator Backend running successfully 🚀");
});

/* ===============================
   GET CAMPUS LOCATIONS
================================ */
app.get("/api/locations", (req, res) => {
  res.json(locations);
});

/* ===============================
   LOG ROUTE DATA TO FIREBASE
================================ */
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

    res.json({ message: "Route logged successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to log route" });
  }
});

/* ===============================
   AI CROWD STATUS (NODE → PYTHON)
================================ */
app.get("/api/crowd-status", async (req, res) => {
  try {
    const aiResponse = await axios.get("http://127.0.0.1:8000/predict");
    res.json(aiResponse.data);
  } catch (error) {
    res.status(500).json({
      error: "AI service not reachable. Is AI running?"
    });
  }
});

/* ===============================
   START SERVER
================================ */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
