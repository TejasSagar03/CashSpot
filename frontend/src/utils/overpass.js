import axios from "axios";

export async function fetchATMs(lat, lon) {
  // 1. Read the saved radius from Settings, default to 6 if it doesn't exist
  const savedRadiusKm = Number(localStorage.getItem("cashspot_radius")) || 6;
  
  // 2. Convert Kilometers to Meters for the API
  const searchRadiusMeters = savedRadiusKm * 1000;

  // 3. Compress the query into a single string so it fits in a URL
  const query = `[out:json][timeout:15];(node["amenity"~"atm|bank"](around:${searchRadiusMeters},${lat},${lon});way["amenity"~"atm|bank"](around:${searchRadiusMeters},${lat},${lon}););out center qt;`;

  try {
    console.log(`📡 Scanning coordinates: ${lat}, ${lon} at radius: ${searchRadiusMeters}m`); 
    
    // THE BULLETPROOF FIX: Use a GET request to physically bypass the CORS Preflight block
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const res = await axios.get(url);

    console.log("🎯 Radar hits found:", res.data.elements.length); 

    return res.data.elements.map(el => {
      const bankName = el.tags?.operator || el.tags?.brand || el.tags?.name || "Unknown Bank";
      const displayName = el.tags?.name || el.tags?.brand || (el.tags?.amenity === "bank" ? "Bank Branch" : "ATM");

      return {
        id: el.id,
        name: displayName,
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
        bank: bankName,
        type: el.tags?.amenity
      };
    });
  } catch (error) {
    console.error("🔴 Overpass API Error:", error.message);
    return [];
  }
}