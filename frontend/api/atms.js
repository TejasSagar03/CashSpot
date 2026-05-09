const https = require('https');

module.exports = function (req, res) {
  // 1. Backend CORS headers to prevent any browser panic
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle browser preflight checks instantly
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
     return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lon, radius } = req.body || {};
  if (!lat || !lon || !radius) {
     return res.status(400).json({ error: 'Missing coordinates or radius' });
  }

  // 2. Build the secure query
  const query = `[out:json][timeout:15];(node["amenity"~"atm|bank"](around:${radius},${lat},${lon});way["amenity"~"atm|bank"](around:${radius},${lat},${lon}););out center qt;`;
  const postData = "data=" + encodeURIComponent(query);

  const options = {
    hostname: 'overpass-api.de',
    port: 443,
    path: '/api/interpreter',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      // THE MAGIC BULLETS: Prevents Overpass from throwing a 406 bot-block
      'Accept': '*/*', 
      'User-Agent': 'CashSpotApp/1.0 (BCA Final Year Project)' 
    }
  };

  // 3. Native Node.js HTTPS request
  const request = https.request(options, (response) => {
    let rawData = '';
    
    response.on('data', (chunk) => { 
        rawData += chunk; 
    });
    
    response.on('end', () => {
      // If Overpass STILL rejects it, this will grab the exact reason why
      if (response.statusCode !== 200) {
         return res.status(500).json({ error: `Overpass Rejected (Status ${response.statusCode})`, details: rawData });
      }
      try {
        const parsedData = JSON.parse(rawData);
        return res.status(200).json(parsedData);
      } catch (e) {
        return res.status(500).json({ error: 'Invalid JSON returned', details: rawData });
      }
    });
  });

  request.on('error', (e) => {
    return res.status(500).json({ error: 'Node HTTPS Module Crash', details: e.message });
  });

  request.write(postData);
  request.end();
};