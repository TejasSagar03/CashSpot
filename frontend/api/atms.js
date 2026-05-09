export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lon, radius } = req.body;

  // The backend server builds the query securely
  const query = `[out:json][timeout:15];(node["amenity"~"atm|bank"](around:${radius},${lat},${lon});way["amenity"~"atm|bank"](around:${radius},${lat},${lon}););out center qt;`;

  try {
    // The server talks to Overpass. CORS does not exist here.
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "data=" + encodeURIComponent(query)
    });

    if (!response.ok) {
      throw new Error(`Overpass returned ${response.status}`);
    }

    const data = await response.json();
    
    // Send the pristine data back to your CashSpot frontend
    return res.status(200).json(data);
  } catch (error) {
    console.error("Backend API Error:", error);
    return res.status(500).json({ error: 'Failed to fetch from Overpass' });
  }
}