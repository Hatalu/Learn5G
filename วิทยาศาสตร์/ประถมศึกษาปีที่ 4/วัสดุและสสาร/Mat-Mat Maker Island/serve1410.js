/* Static server สำหรับ แมทแมท เกาะช่างประดิษฐ์ (Mat-Mat Maker Island) — รันที่พอร์ต 1410
   ใช้: node serve1410.js  แล้วเปิด http://localhost:1410
   (หรือดับเบิลคลิก index.html เปิดตรง ๆ ก็เล่นได้) */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 1410;
const ROOT = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found: ' + urlPath); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('Mat-Mat Maker Island: http://localhost:' + PORT);
});
