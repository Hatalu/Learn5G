/* Static server สำหรับ ดอตตี้ซิ่งทะลุจุด (แกรนด์ปรีซ์ทศนิยม) — รันที่พอร์ต 1405
   ใช้: node serve1405.js  แล้วเปิด http://localhost:1405
   (หรือดับเบิลคลิก index.html เปิดตรง ๆ ก็เล่นได้) */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 1405;
const ROOT = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found: ' + urlPath); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('Dotty Grand Prix: http://localhost:' + PORT);
});
