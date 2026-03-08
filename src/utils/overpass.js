import axios from "axios";

export async function fetchATMs(lat, lon) {
  // 1. Increased radius to 15000m (15km)
  // 2. Added node["amenity"="bank"] and way["amenity"="bank"]
  // 3. Used 'out center;' so we get a single lat/lng even if the bank is mapped as a whole building
// Add 'qt' (sort by distance) to the Overpass query for faster response
const query = `
  [out:json][timeout:25];
  (
    node["amenity"~"atm|bank"](around:10000,${lat},${lon});
    way["amenity"~"atm|bank"](around:10000,${lat},${lon});
  );
  out center qt; 
`;

  const url = "https://overpass-api.de/api/interpreter";

  try {
    const res = await axios.post(url, query, {
      headers: { "Content-Type": "text/plain" }
    });

    return res.data.elements.map(el => {
      // Smartly grab the name from various possible OSM tags
      const bankName = el.tags?.operator || el.tags?.brand || el.tags?.name || "Unknown Bank";
      const displayName = el.tags?.name || el.tags?.brand || (el.tags?.amenity === "bank" ? "Bank Branch" : "ATM");

      return {
        id: el.id,
        name: displayName,
        // Use el.center for buildings (ways), el.lat/lon for points (nodes)
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
        
        bank: bankName,
        network: el.tags?.network || "ATM Network",
        
        address: 
          (el.tags?.["addr:street"] || "") + 
          " " + 
          (el.tags?.["addr:city"] || ""),
        
        hours: el.tags?.opening_hours || "24 Hours",
        cash: el.tags?.cash_in ? "Deposit Available" : "Withdrawal Only",
        wheelchair: el.tags?.wheelchair || "Unknown",
        type: el.tags?.amenity // This will store either "atm" or "bank"
      };
    });
  } catch (error) {
    console.error("Failed to fetch map data:", error);
    return [];
  }
}