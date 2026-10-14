import * as THREE from '../../vendor/three/three.module.js';
// 此轮配置/采样接口同时更新，版本URL防止部署或本地预览混用旧模块。
import {model as parameters,visual} from './config/params.js?v=signals48-20261014';
import {createForegroundModel} from './animation/foregroundModel.js?v=signals48-20261014';
import {createForegroundScene} from './scene/createForegroundScene.js?v=dwd-layers-20261014';
import {createWaveformPanel} from './waveform/createWaveformPanel.js?v=signals48-20261014';
import {renderPixelRatio} from '../../agn-triple/src/scene/renderSize.js';

export async function startGWBackgroundAnimation(source,signal,p=parameters,v=visual){
  if(!source||!signal)return;
  const model=createForegroundModel(p);
  const label=source.parentElement?.querySelector('.research-animation-labels,.animation-labels');
  if(label){if(label.firstElementChild)label.firstElementChild.textContent=v.titleText;else label.textContent=v.titleText;}
  const renderer=new THREE.WebGLRenderer({canvas:source,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=v.exposure;
  const camera=new THREE.OrthographicCamera(-4,4,3,-3,0.1,80);
  camera.position.set(...v.cameraPosition);camera.up.set(0,0,1);camera.lookAt(0,0,0);
  const objects=await createForegroundScene(model,v),waveform=createWaveformPanel(signal,model,v);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed=0,last=0,frame=0,visible=true,renderedFrames=0,activeSeconds=0;
  function draw(){
    const state=model.state(reduced.matches?v.staticTime:elapsed);
    objects.update(state,camera);renderer.render(objects.scene,camera);waveform.draw(state);renderedFrames++;
    source.dataset.cycleTime=state.t.toFixed(4);
    if(renderedFrames%20===0||reduced.matches){
      source.dataset.visibleFronts=String(objects.waves.visibleFronts);
      source.dataset.renderedFrames=String(renderedFrames);source.dataset.activeSeconds=activeSeconds.toFixed(3);
      source.dataset.meanFps=(renderedFrames/Math.max(activeSeconds,0.001)).toFixed(1);
    }
  }
  function resize(){
    const {width,height}=source.getBoundingClientRect();if(!(width>0&&height>0))return;
    const ratio=renderPixelRatio(width,height,devicePixelRatio,v);
    renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);waveform.resize(width,height,ratio);
    const halfHeight=v.cameraHalfHeight,centerY=(v.galaxyScreenY-0.5)*2*halfHeight;
    camera.left=-halfHeight*width/height;camera.right=-camera.left;camera.top=centerY+halfHeight;camera.bottom=centerY-halfHeight;
    camera.updateProjectionMatrix();objects.layout(camera,ratio,source.height);objects.waves.resize(source.height);draw();
  }
  function tick(timestamp){
    frame=0;if(!visible||document.hidden||reduced.matches)return;
    if(last){const dt=Math.max(0,(timestamp-last)/1000);elapsed+=dt;activeSeconds+=dt;}
    last=timestamp;draw();frame=requestAnimationFrame(tick);
  }
  function sync(){
    if(!visible||document.hidden||reduced.matches){cancelAnimationFrame(frame);frame=0;last=0;if(reduced.matches)draw();}
    else if(!frame){last=0;frame=requestAnimationFrame(tick);}
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(source);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});intersection.observe(source);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  source.dataset.engine='three.js r180 + canvas 2D';source.dataset.theme='Galactic double white dwarf confusion foreground';
  source.dataset.sourceCount=String(p.numVisibleSystems);source.dataset.signalSources=String(model.sources.length);source.dataset.cycleDuration=String(p.cycleSeconds);
  source.dataset.barycenters=JSON.stringify(model.sources.slice(0,p.numVisibleSystems).map(s=>s.center));
  resize();source.dataset.animationReady='true';sync();
  return {dispose(){
    cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();
    document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);
    const geometries=new Set(),materials=new Set();objects.scene.traverse(object=>{
      if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);
    });geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();
  }};
}
