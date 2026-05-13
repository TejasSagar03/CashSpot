const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: ["https://cash-spot.vercel.app", "http://localhost:3000", "http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// THE FIX: Using an Environment Variable instead of a hardcoded password
const DB_URI = process.env.MONGO_URI;

if (!DB_URI) {
  console.error("🔴 FATAL ERROR: MONGO_URI is missing from environment variables.");
  process.exit(1);
}

mongoose.connect(DB_URI)
.then(() => console.log("🟢 MongoDB Connected Successfully"))
.catch(err => console.error("🔴 MongoDB Connection Error:", err));

const locationRoutes = require("./routes/locationRoutes");

app.use("/api/locations", locationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CashSpot Backend Engine running on port ${PORT}`);
});