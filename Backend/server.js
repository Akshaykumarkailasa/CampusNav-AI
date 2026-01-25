app.post("/api/log-route", async (req, res) => {
  console.log("🔥 log-route HIT");

  if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("❌ FIREBASE_PROJECT_ID missing");
    return res.status(500).json({ error: "No Firebase Project ID" });
  }

  try {
    await db.collection("navigation_logs").add({
      start: req.body.start,
      destination: req.body.destination,
      timestamp: new Date()
    });

    console.log("✅ Firestore write SUCCESS");
    res.json({ success: true });

  } catch (err) {
    console.error("❌ Firestore write FAILED:", err);
    res.status(500).json({ error: err.message });
  }
});
