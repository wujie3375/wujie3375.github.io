import http from 'node:http';
import path from 'node:path';
import {readFile,stat} from 'node:fs/promises';
import {jsDir,buildDir} from './paths.mjs';
const built=process.argv.includes('--build');
const waveform=process.argv.includes('--waveform');
const modifiedGravity=process.argv.includes('--modified-gravity');
const gwBackgrounds=process.argv.includes('--gw-backgrounds');
const root=path.resolve(built?buildDir:jsDir);
const port=Number(process.env.PORT||4174);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.vert':'text/plain; charset=utf-8','.frag':'text/plain; charset=utf-8','.json':'application/json'};
const server=http.createServer(async(request,response)=>{
  try {
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    if(pathname==='/'&&(gwBackgrounds||modifiedGravity||waveform||!built)){
      response.writeHead(302,{Location:gwBackgrounds?'/gw-backgrounds/':modifiedGravity?'/modified-gravity/':waveform?'/waveform-modeling/':'/agn-triple/'});response.end();return;
    }
    const relative=pathname==='/'?'index.html':pathname.slice(1)+(pathname.endsWith('/')?'index.html':'');
    const target=path.resolve(root,relative);
    if(target!==root&&!target.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}
    const info=await stat(target);
    if(!info.isFile()) throw new Error('Not a file');
    response.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
    response.end(await readFile(target));
  } catch {response.writeHead(404);response.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`${gwBackgrounds?'GW Backgrounds':modifiedGravity?'Modified Gravity':waveform?'Waveform Modeling':'AGN triple'} ${built?'build preview':'development'}: http://127.0.0.1:${port}/`));
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
