import * as THREE from '../../vendor/three/three.module.js';
import {physical,visual} from './config/params.js';
import {createScene} from './scene/createScene.js';
import {updateSystem} from './animation/updateSystem.js';
import {updateCamera} from './camera/cameraMotion.js';
import {renderPixelRatio} from './scene/renderSize.js';
import {createDopplerModel} from './waveform/dopplerModel.js';
import {createDopplerWaveform} from './waveform/createDopplerWaveform.js';

export async function startAnimation(canvas,p=physical,v=visual) {
  if(!canvas) return;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=v.exposure;
  const camera=new THREE.OrthographicCamera(-4,4,3,-3,0.1,80);
  const objects=await createScene(p,v);
  const signalCanvas=canvas.parentElement?.querySelector('#moving-sources-strain');
  const doppler=v.waveformEnabled&&signalCanvas?createDopplerModel(p,v):null;
  const waveform=doppler?createDopplerWaveform(signalCanvas,doppler,v):null;
  let elapsed=0,last=0,frame=0,visible=true,renderedFrames=0,activeRealSeconds=0;
  const frameTimes=new Float64Array(600);
  let sampleCursor=0,sampleCount=0;
  const billboards=[];
  objects.scene.traverse(object=>{if(object.userData.billboard)billboards.push(object);});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');

  function draw(){
    updateSystem(objects,elapsed,p,v);
    updateCamera(camera,elapsed,v);
    objects.gw.updateView(camera,canvas.height);
    billboards.forEach(object=>{object.quaternion.copy(camera.quaternion);
      if(object.material.uniforms?.uView)object.material.uniforms.uView.value.copy(camera.position).normalize();});
    renderer.render(objects.scene,camera);
    if(waveform){const state=doppler.state(elapsed);waveform.draw(reduced.matches?{...state,reveal:1,opacity:1}:state);}
    renderedFrames++;
    if(renderedFrames%30===0) {
      // 仅供只读运行验收，不是交互参数面板。
      canvas.dataset.renderedFrames=String(renderedFrames);
      canvas.dataset.simulationYears=(elapsed*p.timeScale).toFixed(6); // 旧同步参考时钟。
      canvas.dataset.outerYears=(elapsed*v.timeScaleOuter).toFixed(6);
      canvas.dataset.innerYears=(elapsed*v.timeScaleInner).toFixed(6);
      canvas.dataset.meanFps=(renderedFrames/Math.max(activeRealSeconds,0.001)).toFixed(1);
      canvas.dataset.activeSeconds=activeRealSeconds.toFixed(3);
      canvas.dataset.starCount=String(objects.starCount);
      canvas.dataset.gwTime=elapsed.toFixed(6);
      canvas.dataset.gwPhase=objects.gw.phase.toFixed(6);
      canvas.dataset.gwFronts=JSON.stringify(objects.gw.fronts.map(({event,radius})=>
        ({id:event.index,t:event.emitTime,origin:event.origin,radius})));
      if(sampleCount>30){
        const sorted=Array.from(frameTimes.slice(0,sampleCount)).sort((a,b)=>a-b);
        canvas.dataset.p95FrameMs=(sorted[Math.floor((sampleCount-1)*0.95)]*1000).toFixed(2);
      }
    }
  }
  function resize(){
    const {width,height}=canvas.getBoundingClientRect();
    if(width<=0||height<=0) return;
    renderer.setPixelRatio(renderPixelRatio(width,height,devicePixelRatio,v));
    renderer.setSize(width,height,false);
    const aspect=width/height;
    const halfHeight=Math.max(v.cameraHalfHeight,v.diskOuterRadius*v.cameraFramingMargin/aspect);
    camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;
    const centerY=(v.systemScreenY-0.5)*2*halfHeight;
    camera.top=centerY+halfHeight;camera.bottom=centerY-halfHeight;
    objects.layoutStars(camera.right,halfHeight);
    waveform?.resize(width,height,renderer.getPixelRatio());
    objects.updateStars(camera,renderer.getPixelRatio());
    camera.updateProjectionMatrix();draw();
  }
  function tick(timestamp){
    frame=0;
    if(!visible||document.hidden||reduced.matches) return;
    // 统一播放时钟，各轨道独立映射演示时间；恢复时重置 last，长卡顿最多推进 0.1 秒。
    if(last){
      const dt=(timestamp-last)/1000;
      activeRealSeconds+=dt;elapsed+=Math.min(dt,0.1);
      frameTimes[sampleCursor]=dt;sampleCursor=(sampleCursor+1)%frameTimes.length;
      sampleCount=Math.min(sampleCount+1,frameTimes.length);
    }
    last=timestamp;draw();frame=requestAnimationFrame(tick);
  }
  function sync(){
    if(!visible||document.hidden||reduced.matches){cancelAnimationFrame(frame);frame=0;last=0;}
    else if(!frame){last=0;frame=requestAnimationFrame(tick);}
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});intersection.observe(canvas);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  canvas.dataset.animationReady='true';
  canvas.dataset.innerVisualScale=String(v.innerOrbitVisualScale);
  canvas.dataset.cycleDuration=String(v.totalDuration);
  resize();sync();
  return {dispose(){
    cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);
    const geometries=new Set(),materials=new Set();
    objects.scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);
      (Array.isArray(object.material)?object.material:[object.material]).forEach(material=>{if(material)materials.add(material);});});
    geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());renderer.dispose();
  }};
}
