const express = require("express");
const cors = require("cors");
const axios = require("axios");

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
    { name: "Admin Block", lat: 17.5212, lng: 78.3681 },
    { name: "CSE Block", lat: 17.5216, lng: 78.3674 },
    { name: "AIML Block", lat: 17.5218, lng: 78.3670 }
  ]);
});

// ---------- SEARCH LOG ----------
app.post("/api/log-route", (req, res) => {
  const { start, destination } = req.body;
  console.log("Route logged:", start, destination);
  res.json({ success: true });
});

// ---------- AI CROWD STATUS ----------
const AI_URL = "https://campusnav-ai.onrender.com";


app.get("/api/crowd-status", async (req, res) => {
  try {
    console.log("Calling AI at:", `${AI_URL}/predict`);
    const response = await axios.get(`${AI_URL}/predict`);
    res.json({ status: response.data.crowd_level });
  } catch (err) {
    console.error("AI ERROR FULL:", err.toString());
    res.status(500).json({ status: "Unavailable" });
  }
});

// ---------- START ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
