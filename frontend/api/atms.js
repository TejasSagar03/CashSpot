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
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  // 3. Native Node.js HTTPS request (Zero dependencies, 100% crash-proof)
  const request = https.request(options, (response) => {
    let rawData = '';
    
    // Read the data in chunks as it arrives from Germany
    response.on('data', (chunk) => { 
        rawData += chunk; 
    });
    
    // When the download finishes, send it to the frontend
    response.on('end', () => {
      if (response.statusCode !== 200) {
         return res.status(response.statusCode).json({ error: 'Overpass Firewall Rejected', details: rawData });
      }
      try {
        const parsedData = JSON.parse(rawData);
        return res.status(200).json(parsedData);
      } catch (e) {
        return res.status(500).json({ error: 'Invalid JSON returned', details: rawData });
      }
    });
  });

  // If the actual Vercel server drops connection
  request.on('error', (e) => {
    return res.status(500).json({ error: 'Node HTTPS Module Crash', details: e.message });
  });

  // Execute the request
  request.write(postData);
  request.end();
};