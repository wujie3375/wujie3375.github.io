import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {mountAnimation} from '../../animation-loader.js';
import {loadShader} from '../../shader-loader.js';
import {shaderModuleSource} from '../scripts/build-web.mjs';

const flush=async()=>{for(let j=0;j<12;j++)await Promise.resolve();};
function observers(t) {
  const original=globalThis.IntersectionObserver;
  const list=[];
  globalThis.IntersectionObserver=class {
    constructor(callback,options){this.callback=callback;this.options=options;list.push(this);}
    observe(){}disconnect(){this.disconnected=true;}
    enter(){this.callback([{isIntersecting:true}]);}
  };
  t.after(()=>{globalThis.IntersectionObserver=original;});
  return list;
}
const canvas=()=>({dataset:{},parentElement:{querySelector:()=>null}});

test('Preloading never initializes or advances an animation; original initialization margin is retained',async t=>{
  const list=observers(t),element=canvas();let downloads=0,starts=0;
  mountAnimation(element,module=>{assert.equal(module.value,7);starts++;},()=>{downloads++;return {value:7};});
  assert.deepEqual(list.map(q=>q.options.rootMargin),['900px 0px','300px 0px']);
  list[0].enter();await flush();assert.equal(downloads,1);assert.equal(starts,0);
  assert.equal(element.dataset.resourceState,'ready');assert.equal(element.dataset.loadState,'waiting');
  list[1].enter();await flush();assert.equal(starts,1);assert.equal(downloads,1);
  list[1].enter();list[0].enter();await flush();assert.equal(starts,1);assert.equal(downloads,1);
  assert.equal(element.dataset.loadState,'ready');assert.ok(list.every(q=>q.disconnected));
});
test('Fast scrolling or lack of observer support still downloads and initializes exactly once',async t=>{
  const list=observers(t);let downloads=0,starts=0;
  mountAnimation(canvas(),()=>starts++,()=>downloads++);
  list[1].enter();await flush();assert.equal(downloads,1);assert.equal(starts,1);
  globalThis.IntersectionObserver=undefined;
  mountAnimation(canvas(),()=>starts++,()=>downloads++);await flush();
  assert.equal(downloads,2);assert.equal(starts,2);
});
test('A failed preload is caught and the existing error message is shown only on initialization',async t=>{
  const list=observers(t),message={hidden:true};let starts=0;
  const element={dataset:{},parentElement:{querySelector:()=>message}};
  const previous=console.error;console.error=()=>{};t.after(()=>{console.error=previous;});
  mountAnimation(element,()=>starts++,()=>Promise.reject(new Error('test failure')));
  list[0].enter();await flush();assert.equal(message.hidden,true);
  list[1].enter();await flush();assert.equal(starts,0);assert.equal(message.hidden,false);
  assert.equal(element.dataset.loadState,'error');
});
test('Native shader requests share a Promise and failed reads can be retried',async t=>{
  const previous=globalThis.fetch;let requests=0;
  globalThis.fetch=async()=>{requests++;return {ok:true,text:async()=> 'exact shader\n'};};
  t.after(()=>{globalThis.fetch=previous;});
  const a=loadShader('agn-triple','test.vert','cache-test');
  const b=loadShader('agn-triple','test.vert','cache-test');
  assert.equal(a,b);assert.equal(await a,'exact shader\n');assert.equal(requests,1);
  globalThis.fetch=async()=>{requests++;return {ok:false};};
  await assert.rejects(loadShader('agn-triple','retry.vert','cache-test'));
  globalThis.fetch=async()=>{requests++;return {ok:true,text:async()=> 'retry succeeded'};};
  assert.equal(await loadShader('agn-triple','retry.vert','cache-test'),'retry succeeded');
  assert.equal(requests,3);
});
test('All twelve embedded GLSL shaders match their source byte-for-byte',async()=>{
  const shaders={};
  for(const project of ['agn-triple','gw-backgrounds']) {
    const directory=new URL(`../../${project}/src/shaders/`,import.meta.url);
    for(const name of await readdir(directory))if(/\.(vert|frag)$/.test(name))
      shaders[project+'/'+name]=await readFile(new URL(name,directory),'utf8');
  }
  assert.equal(Object.keys(shaders).length,12);
  const embedded=await import('data:text/javascript;base64,'+Buffer.from(shaderModuleSource(shaders)).toString('base64'));
  for(const [key,source] of Object.entries(shaders)) {
    const [project,name]=key.split('/');assert.equal(await embedded.loadShader(project,name),source);
  }
});
