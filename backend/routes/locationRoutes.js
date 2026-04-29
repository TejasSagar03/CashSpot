const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

// Fetch specific ATM status dynamically by OSM ID
router.get("/:osm_id", async (req, res) => {
  try {
    const location = await Location.findOne({ osm_id: req.params.osm_id });
    if (location) {
      res.json(location);
    } else {
      res.json({ status: 'Operational', reports: 0 });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User reports ATM status
router.post("/report", async (req, res) => {
  const { osm_id, name, lat, lng, newStatus } = req.body;

  try {
    let location = await Location.findOne({ osm_id });

    if (location) {
      location.status = newStatus;
      location.reports += 1;
      location.lastUpdated = Date.now();
      await location.save();
    } else {
      location = new Location({
        osm_id,
        name,
        lat,
        lng,
        status: newStatus,
        reports: 1
      });
      await location.save();
    }
    res.json(location);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Original legacy routes
router.get("/", async (req, res) => {
  const data = await Location.find();
  res.json(data);
});

router.post("/", async (req, res) => {
  const newLocation = new Location(req.body);
  await newLocation.save();
  res.json(newLocation);
});

module.exports = router;