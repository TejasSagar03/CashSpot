export async function fetchATMs(lat, lon) {
  const savedRadiusKm = Number(localStorage.getItem("cashspot_radius")) || 6;
  const searchRadiusMeters = savedRadiusKm * 1000;

  // AUTO-DETECT BACKEND URL
  // If not on production, default to local. 
  const BACKEND_URL = process.env.NODE_ENV === 'production' 
    ? "https://cashspot-backend.onrender.com" 
    : "http://localhost:5000";

  try {
    console.log(`📡 Sending coordinates to: ${BACKEND_URL}`); 
    
    const response = await fetch(`${BACKEND_URL}/api/atms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon, radius: searchRadiusMeters })
    });
    
    const data = await response.json();

    if (!response.ok) {
       throw new Error(`BACKEND STATUS: ${response.status} | ERROR: ${data.error} | DETAILS: ${data.details}`);
    }
    
    if (!data.elements) return [];

    console.log("🎯 Secure Radar hits found:", data.elements.length); 

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
    console.error("🔴 SECURE BACKEND CRASH:", error.message);
    return [];
  }
}