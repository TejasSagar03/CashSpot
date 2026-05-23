require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const https = require('https'); 

const app = express();

app.use(cors({
  origin: ["https://cash-spot.vercel.app", "http://localhost:3000", "http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

// --- MONGODB CONNECTION ---
const DB_URI = process.env.MONGO_URI;

if (!DB_URI) {
  console.error("🔴 FATAL ERROR: MONGO_URI is missing from environment variables.");
  process.exit(1);
}

mongoose.connect(DB_URI)
.then(() => console.log("🟢 MongoDB Connected Successfully"))
.catch(err => console.error("🔴 MongoDB Connection Error:", err));

// --- LOCATION ROUTES (Database) ---
const locationRoutes = require("./routes/locationRoutes");
app.use("/api/locations", locationRoutes);


// --- THE GEOAPIFY ROUTE ---
app.post("/api/atms", (req, res) => {
  const { lat, lon, radius } = req.body || {};
  if (!lat || !lon || !radius) return res.status(400).json({ error: 'Missing coordinates' });

  const API_KEY = "8b95a47d4f8c459db360354f14393a83"; 
  const url = `https://api.geoapify.com/v2/places?categories=service.financial.atm,service.financial.bank&filter=circle:${lon},${lat},${radius}&limit=50&apiKey=${API_KEY}`;

  https.get(url, (response) => {
    let rawData = '';
    
    response.on('data', (chunk) => rawData += chunk);
    
    response.on('end', () => {
      if (response.statusCode !== 200) {
        return res.status(500).json({ error: `Geoapify Error ${response.statusCode}`, details: rawData });
      }
      
      try {
        const geoData = JSON.parse(rawData);
        
        const mappedElements = (geoData.features || []).map(f => {
          const props = f.properties || {};
          const isBank = props.categories && props.categories.includes("service.financial.bank");
          
          return {
            id: props.place_id || Math.random().toString(),
            lat: props.lat,
            lon: props.lon,
            tags: {
              name: props.name || null,
              brand: props.operator || props.datasource?.raw?.operator || "Unknown Bank",
              amenity: isBank ? "bank" : "atm"
            }
          };
        });

        return res.status(200).json({ elements: mappedElements });
        
      } catch (e) {
        return res.status(500).json({ error: 'Failed to parse Geoapify data', details: e.message });
      }
    });
  }).on('error', (e) => {
    return res.status(500).json({ error: 'Node HTTPS Request Failed', details: e.message });
  });
});

// --- SERVER IGNITION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CashSpot Backend Engine running on port ${PORT}`);
});