// One local server for both: the onboarding flow at /  and the dashboard preview at /dashboard/
const http = require('http'), fs = require('fs'), path = require('path');
const here = __dirname, root = path.join(__dirname, '..');
const types = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.html': 'text/html', '.png': 'image/png' };
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const send = f => { res.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream'); res.setHeader('Cache-Control', 'no-store'); fs.createReadStream(f).pipe(res); };
  if (u === '/' || u === '/index.html') return send(path.join(root, 'index.html'));
  const inPreview = path.join(here, u);
  if (fs.existsSync(inPreview) && fs.statSync(inPreview).isFile()) return send(inPreview);
  const inRoot = path.join(root, u);
  if (u.startsWith('/public/') || (fs.existsSync(inRoot) && fs.statSync(inRoot).isFile() && !u.startsWith('/dashboard'))) return send(inRoot);
  if (u.startsWith('/dashboard')) return send(path.join(here, 'index.html'));
  res.statusCode = 404; res.end('not found');
}).listen(4174, '127.0.0.1', () => console.log('flow:      http://127.0.0.1:4174/\ndashboard: http://127.0.0.1:4174/dashboard/'));
