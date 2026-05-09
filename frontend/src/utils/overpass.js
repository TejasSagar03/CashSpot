export async function fetchATMs(lat, lon) {
  const savedRadiusKm = Number(localStorage.getItem("cashspot_radius")) || 6;
  const searchRadiusMeters = savedRadiusKm * 1000;

  // 1. Single-line query. No line breaks for the editor to mess up, but keeps required spaces.
  const query = `[out:json][timeout:15];(node["amenity"~"atm|bank"](around:${searchRadiusMeters},${lat},${lon});way["amenity"~"atm|bank"](around:${searchRadiusMeters},${lat},${lon}););out center qt;`;

  try {
    console.log(`📡 Scanning coordinates: ${lat}, ${lon} at radius: ${searchRadiusMeters}m`); 
    
    // 2. Native fetch POST. This bypasses CORS preflights perfectly.
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "data=" + encodeURIComponent(query)
    });
    
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