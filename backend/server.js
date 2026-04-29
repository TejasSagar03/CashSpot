const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: ["https://cash-spot.vercel.app", "http://localhost:3000", "http://localhost:5173"], // Add your specific frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

mongoose.connect(
  "mongodb+srv://tejassagar:Tejas123@tejas.txrnrwd.mongodb.net/atmLocator?retryWrites=true&w=majority&appName=Tejas"
)
.then(() => console.log("🟢 MongoDB Connected Successfully"))
.catch(err => console.error("🔴 MongoDB Connection Error:", err));

const locationRoutes = require("./routes/locationRoutes");

app.use("/api/locations", locationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CashSpot Backend Engine running on port ${PORT}`);
});