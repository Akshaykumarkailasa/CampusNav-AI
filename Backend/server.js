const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { db } = require("./firebase");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const locations = [
  { name: "CSE Block", lat: 17.5216, lng: 78.3674 },
  { name: "Mechanical/Civil/EEE Block", lat: 17.5212, lng: 78.3672 },
  { name: "IT Block", lat: 17.5204, lng: 78.3674 },
  { name: "Library", lat: 17.5205, lng: 78.3675 },
  { name: "Canteen", lat: 17.5204, lng: 78.3666 },
  { name: "Gokaraju Lailavathi Block", lat: 17.5210, lng: 78.3656 },
  { name: "AIML Block", lat: 17.5218, lng: 78.3670 }
];

app.get("/api/locations", (req, res) => {
  res.json(locations);
});

app.post("/api/save-search", async (req, res) => {
  try {
    const { start, destination, distance, duration } = req.body;

    await db.collection("searches").add({
      start,
      destination,
      distance,
      duration,
      createdAt: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
