const https = require('https');

// 1. The Redundancy Array: If one goes down, the next one instantly steps up.
const MIRRORS = [
  'overpass-api.de',               // Primary: Germany
  'overpass.openstreetmap.fr',     // Backup 1: France (CORS immune on backend!)
  'overpass.kumi.systems'          // Backup 2: Global
];

// Helper function to make the HTTPS request with a strict 5-second timeout
function fetchFromMirror(hostname, postData) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': '*/*',
        'User-Agent': 'CashSpotApp/2.0 (BCA Production Failover System)'
      }
    };

    const req = https.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(rawData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    
    // If a server is choking, abandon it after 5 seconds so Vercel doesn't crash
    req.setTimeout(5000, () => {
      req.abort();
      reject(new Error('Server Timeout'));
    });

    req.write(postData);
    req.end();
  });
}

module.exports = async function (req, res) {
  // Backend CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { lat, lon, radius } = req.body || {};
  if (!lat || !lon || !radius) return res.status(400).json({ error: 'Missing coordinates' });

  const query = `[out:json][timeout:15];(node["amenity"~"atm|bank"](around:${radius},${lat},${lon});way["amenity"~"atm|bank"](around:${radius},${lat},${lon}););out center qt;`;
  const postData = "data=" + encodeURIComponent(query);

  // 2. The Failover Loop
  let lastError = '';

  for (const mirror of MIRRORS) {
    try {
      console.log(`📡 Attempting connection to: ${mirror}`);
      const rawResponse = await fetchFromMirror(mirror, postData);
      
      const parsedData = JSON.parse(rawResponse);
      
      // If we got the data, instantly return it and break the loop
      return res.status(200).json(parsedData);
      
    } catch (error) {
      console.log(`⚠️ ${mirror} failed (${error.message}). Switching to backup...`);
      lastError = error.message;
      // Loop automatically continues to the next mirror
    }
  }

  // 3. If ALL servers are completely down (Extremely rare)
  return res.status(502).json({ 
    error: 'All Overpass mirrors are currently offline.', 
    details: lastError 
  });
};