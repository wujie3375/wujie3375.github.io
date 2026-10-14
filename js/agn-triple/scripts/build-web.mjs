import {mkdir,readFile,readdir,writeFile,copyFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {jsDir} from './paths.mjs';

const entries=['moving-sources','waveform-modeling','modified-gravity','gw-backgrounds'];

// GLSL 原样嵌入，不做 GLSL 压缩或浮点近似；源码独立入口仍可直接 fetch 原文件。
export function shaderModuleSource(shaders) {
  return `const shaders=Object.freeze(${JSON.stringify(shaders)});
export function loadShader(project,name,revision='') {
  const key=project+'/'+name;
  if(!Object.prototype.hasOwnProperty.call(shaders,key))return Promise.reject(new Error('Shader not found: '+key));
  return Promise.resolve(shaders[key]);
}`;
}

export async function buildWebAnimations() {
  const require=createRequire(import.meta.url);
  let esbuild;
  try { esbuild=require('esbuild'); }
  catch {
    const tools=process.env.ANIMATION_BUILD_TOOLS_DIR||'D:/GitHub/no use/animation-build-tools';
    try { esbuild=createRequire(path.join(tools,'package.json'))('esbuild'); }
    catch { throw new Error('Install esbuild 0.25.12 in the external animation-build-tools directory (see README).'); }
  }
  const shaders={};
  for(const project of ['agn-triple','gw-backgrounds']) {
    const directory=path.join(jsDir,project,'src','shaders');
    for(const name of (await readdir(directory)).sort()) if(/\.(vert|frag)$/.test(name))
      shaders[project+'/'+name]=await readFile(path.join(directory,name),'utf8');
  }
  const outdir=path.join(jsDir,'dist');
  const result=await esbuild.build({
    entryPoints:Object.fromEntries(entries.map(name=>[name,path.join(jsDir,name+'.js')])),
    outdir,bundle:true,splitting:true,format:'esm',platform:'browser',target:'es2020',
    minify:true,keepNames:true,treeShaking:true,legalComments:'linked',metafile:true,write:false,
    entryNames:'[name]',chunkNames:'shared-[name]-[hash]',
    plugins:[{
      name:'original-glsl-text',setup(build) {
        build.onLoad({filter:/[\\/]shader-loader\.js$/},()=>({contents:shaderModuleSource(shaders),loader:'js'}));
        // 这些查询仅为源码预览缓存标记；发布文件本身已通过 chunk 内容哈希区分。
        build.onResolve({filter:/\.js\?/},args=>({path:path.resolve(args.resolveDir,args.path.split('?')[0])}));
      }
    }]
  });
  const scratch=process.env.ANIMATION_BUILD_REPORT_DIR||'D:/GitHub/no use/animation-build-reports';
  await mkdir(outdir,{recursive:true});await mkdir(scratch,{recursive:true});
  // 新哈希 chunk 先写，入口最后更新；不清空旧 chunk，避免已经打开的页面失去依赖。
  const isEntry=file=>entries.some(name=>path.basename(file.path)===name+'.js');
  const files=[...result.outputFiles.filter(file=>!isEntry(file)),...result.outputFiles.filter(isEntry)];
  for(const file of files) {
    const staged=path.join(scratch,path.basename(file.path));
    await writeFile(staged,file.contents);await copyFile(staged,file.path);
  }
  const javascript=result.outputFiles.filter(file=>file.path.endsWith('.js'));
  const report={esbuild:esbuild.version,shaderCount:Object.keys(shaders).length,
    javascriptFiles:javascript.length,rawBytes:javascript.reduce((sum,file)=>sum+file.contents.length,0),
    gzipBytes:javascript.reduce((sum,file)=>sum+gzipSync(file.contents).length,0),
    files:javascript.map(file=>({name:path.basename(file.path),bytes:file.contents.length,gzipBytes:gzipSync(file.contents).length})),
    metafile:result.metafile};
  await writeFile(path.join(scratch,'report.json'),JSON.stringify(report,null,2));
  console.log(`Web animations built: ${report.javascriptFiles} JS files, ${report.rawBytes} bytes (${report.gzipBytes} gzip), ${report.shaderCount} original shaders inline.`);
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildWebAnimations();
