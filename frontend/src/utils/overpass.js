export async function fetchATMs(lat, lon) {
  const savedRadiusKm = Number(localStorage.getItem("cashspot_radius")) || 6;
  const searchRadiusMeters = savedRadiusKm * 1000;

  const query = `[out:json][timeout:15];(node["amenity"~"atm|bank"](around:${searchRadiusMeters},${lat},${lon});way["amenity"~"atm|bank"](around:${searchRadiusMeters},${lat},${lon}););out center qt;`;

  try {
    console.log(`📡 Scanning coordinates: ${lat}, ${lon} at radius: ${searchRadiusMeters}m`); 
    
    // THE ULTIMATE BYPASS: URLSearchParams
    // This perfectly formats the data and automatically sets the exact headers 
    // needed to trick the browser into treating this like a native HTML form submit.
    // Result: Zero CORS preflight checks, straight to the server.
    const params = new URLSearchParams();
    params.append("data", query);

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: params
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