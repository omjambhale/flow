const http=require('http'),fs=require('fs'),path=require('path');
http.createServer((req,res)=>{const u=req.url.split('?')[0];const f=path.join(__dirname,u);
if(fs.existsSync(f)&&fs.statSync(f).isFile()){res.setHeader('Content-Type',u.endsWith('.js')?'text/javascript':u.endsWith('.css')?'text/css':u.endsWith('.svg')?'image/svg+xml':'text/html');fs.createReadStream(f).pipe(res);return}
res.setHeader('Content-Type','text/html');fs.createReadStream(path.join(__dirname,'index.html')).pipe(res)}).listen(4174,'127.0.0.1');
