export async function fetchATMs(lat, lon) {
  // 1. Read the saved radius from Settings, default to 6 if it doesn't exist
  const savedRadiusKm = Number(localStorage.getItem("cashspot_radius")) || 6;
  const searchRadiusMeters = savedRadiusKm * 1000;

  // 2. We split the atm/bank search to avoid regex errors on their server
  const rawQuery = `
    [out:json][timeout:15];
    (
      node["amenity"="atm"](around:${searchRadiusMeters},${lat},${lon});
      node["amenity"="bank"](around:${searchRadiusMeters},${lat},${lon});
      way["amenity"="atm"](around:${searchRadiusMeters},${lat},${lon});
      way["amenity"="bank"](around:${searchRadiusMeters},${lat},${lon});
    );
    out center qt;
  `;

  // THE MAGIC BULLET: This physically deletes every space and newline from the text
  const cleanQuery = rawQuery.replace(/\s+/g, '');

  try {
    console.log(`📡 Scanning coordinates: ${lat}, ${lon} at radius: ${searchRadiusMeters}m`); 
    
    // 3. Native fetch GET request
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(cleanQuery)}`;
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