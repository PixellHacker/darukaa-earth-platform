import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 5173;
const DIST = path.resolve('./dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  
  let filePath = path.join(DIST, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  } catch (e) {
    res.writeHead(500);
    res.end('Error loading file');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n======================================================');
  console.log('🚀 Darukaa.Earth Platform is LIVE (Production Engine)!');
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log('======================================================\n');
});
