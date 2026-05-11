const https = require('https');

module.exports = function (req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { lat, lon, radius } = req.body || {};
  if (!lat || !lon || !radius) return res.status(400).json({ error: 'Missing coordinates' });

  const API_KEY = "8b95a47d4f8c459db360354f14393a83";
  
  // THE FIX 1: Changed "commercial" to "service" in the URL query
  const url = `https://api.geoapify.com/v2/places?categories=service.financial.atm,service.financial.bank&filter=circle:${lon},${lat},${radius}&limit=50&apiKey=${API_KEY}`;

  https.get(url, (response) => {
    let rawData = '';
    
    response.on('data', (chunk) => rawData += chunk);
    
    response.on('end', () => {
      if (response.statusCode !== 200) {
        return res.status(500).json({ error: `Geoapify Error ${response.statusCode}`, details: rawData });
      }
      
      try {
        const geoData = JSON.parse(rawData);
        
        const mappedElements = (geoData.features || []).map(f => {
          const props = f.properties || {};
          
          // THE FIX 2: Changed "commercial" to "service" in the translation layer
          const isBank = props.categories && props.categories.includes("service.financial.bank");
          
          return {
            id: props.place_id || Math.random().toString(),
            lat: props.lat,
            lon: props.lon,
            tags: {
              name: props.name || null,
              brand: props.operator || props.datasource?.raw?.operator || "Unknown Bank",
              amenity: isBank ? "bank" : "atm"
            }
          };
        });

        return res.status(200).json({ elements: mappedElements });
        
      } catch (e) {
        return res.status(500).json({ error: 'Failed to parse Geoapify data', details: e.message });
      }
    });
  }).on('error', (e) => {
    return res.status(500).json({ error: 'Node HTTPS Request Failed', details: e.message });
  });
};