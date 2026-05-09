export async function fetchATMs(lat, lon) {
  const savedRadiusKm = Number(localStorage.getItem("cashspot_radius")) || 6;
  const searchRadiusMeters = savedRadiusKm * 1000;

  // The precise query, perfectly spaced on a single line.
  const query = `[out:json][timeout:15];(node["amenity"~"atm|bank"](around:${searchRadiusMeters},${lat},${lon});way["amenity"~"atm|bank"](around:${searchRadiusMeters},${lat},${lon}););out center qt;`;

  try {
    console.log(`📡 Scanning coordinates: ${lat}, ${lon} at radius: ${searchRadiusMeters}m`); 
    
    // SIMPLE NATIVE GET REQUEST
    // This avoids ALL CORS preflight checks AND avoids the 406 Not Acceptable POST error.
    const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
    
    const response = await fetch(url);
    
    if (!response.ok) {
       throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    console.log("🎯 Radar hits found:", data.elements.length); 

    return data.elements.map(el => {
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