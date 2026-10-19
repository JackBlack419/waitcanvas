import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist'), port=Number(process.env.PORT)||4176;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.zip':'application/zip','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try {
    let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.endsWith('/'))pathname+='index.html';
    const file=path.resolve(root,'.'+pathname),relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative))throw Error();
    const info=await stat(file);if(!info.isFile())throw Error();
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(await readFile(file));
  } catch {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('页面不存在');}
});
server.listen(port,'127.0.0.1',()=>process.stdout.write(`Local: http://127.0.0.1:${port}\n`));
