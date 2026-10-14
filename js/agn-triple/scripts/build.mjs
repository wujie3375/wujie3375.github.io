import {mkdir,cp,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {projectDir,vendorDir,buildDir} from './paths.mjs';
// 浏览器原生 ES modules，无需 Vite 转译。静态导出保持模块和 shader 相对路径。
await mkdir(path.join(buildDir,'agn-triple'),{recursive:true});
await mkdir(path.join(buildDir,'vendor'),{recursive:true});
await cp(path.join(projectDir,'src'),path.join(buildDir,'agn-triple','src'),{recursive:true});
await cp(vendorDir,path.join(buildDir,'vendor','three'),{recursive:true});
await cp(path.join(projectDir,'style.css'),path.join(buildDir,'agn-triple','style.css'));
const index=(await readFile(path.join(projectDir,'index.html'),'utf8'))
  .replace('href="./style.css"','href="./agn-triple/style.css"')
  .replace('src="./src/standalone.js"','src="./agn-triple/src/standalone.js"');
await writeFile(path.join(buildDir,'index.html'),index);
// 同一静态流程导出第二个分类动画；共享本地 Three.js 与原黑洞材质模块。
const waveformDir=path.join(path.dirname(projectDir.replace(/[\\/]$/,'')),'waveform-modeling');
await mkdir(path.join(buildDir,'waveform-modeling'),{recursive:true});
await cp(path.join(waveformDir,'src'),path.join(buildDir,'waveform-modeling','src'),{recursive:true});
for(const name of ['index.html','style.css']) await cp(path.join(waveformDir,name),path.join(buildDir,'waveform-modeling',name));
// 第三个分类采用轻量 Canvas 2D，但仍沿用同一目录、共享尺寸预算和静态导出。
const modifiedGravityDir=path.join(path.dirname(projectDir.replace(/[\\/]$/,'')),'modified-gravity');
await mkdir(path.join(buildDir,'modified-gravity'),{recursive:true});
await cp(path.join(modifiedGravityDir,'src'),path.join(buildDir,'modified-gravity','src'),{recursive:true});
// 只清理生成目录里已被新单频驱动替代的一个旧文件，不递归删除输出或用户目录。
await rm(path.join(buildDir,'modified-gravity','src','animation','chirpDriver.js'),{force:true});
for(const name of ['index.html','style.css'])await cp(path.join(modifiedGravityDir,name),path.join(buildDir,'modified-gravity',name));
// 第四个组件：银河系双白矮星前景。仍共享本地 Three.js 和原尺寸/导出流程。
const backgroundsDir=path.join(path.dirname(projectDir.replace(/[\\/]$/,'')),'gw-backgrounds');
await mkdir(path.join(buildDir,'gw-backgrounds'),{recursive:true});
await cp(path.join(backgroundsDir,'src'),path.join(buildDir,'gw-backgrounds','src'),{recursive:true});
for(const name of ['index.html','style.css'])await cp(path.join(backgroundsDir,name),path.join(buildDir,'gw-backgrounds',name));
console.log('Static build exported to '+path.resolve(buildDir));
