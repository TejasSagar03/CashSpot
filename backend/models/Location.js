const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  // Original Fields
  name: String,
  type: String,
  lat: Number,
  lng: Number,
  address: String,
  hours: String,
  deposit: Boolean,

  // New Crowdsourcing Fields
  osm_id: { 
    type: String, 
    unique: true, 
    sparse: true // sparse allows existing records without osm_id to exist without throwing errors
  },
  status: {
    type: String,
    enum: ['Operational', 'Out of Cash', 'Broken'],
    default: 'Operational'
  },
  reports: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Location", LocationSchema);