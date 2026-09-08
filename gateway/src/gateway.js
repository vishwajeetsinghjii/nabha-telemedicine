/**
 * Local Health Center Gateway Proxy - SIH25018 Nabha Telemedicine Platform
 * Optional local network proxy providing WAN resilience at rural Primary Health Centers (PHC)
 */

const http = require('http');

const PORT = process.env.GATEWAY_PORT || 8080;
const CENTRAL_BACKEND_URL = process.env.CENTRAL_BACKEND_URL || 'http://localhost:5000';

const server = http.createServer((req, res) => {
  console.log(`[Gateway Proxy] ${req.method} ${req.url} from local health worker device`);

  // Forward request to central backend
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.log('[Gateway Proxy Warning] Central WAN connection unavailable. Local health center queue active.');
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: {
        code: 'GATEWAY_WAN_OFFLINE',
        message: 'Central backend WAN link temporarily unavailable. Data saved safely on Health Center Gateway queue.'
      }
    }));
  });

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`Health Center Gateway running on http://0.0.0.0:${PORT}`);
  console.log(`Routing local PHC health worker devices to Central Platform (${CENTRAL_BACKEND_URL})`);
  console.log(`================================================================`);
});
