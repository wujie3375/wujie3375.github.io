import * as THREE from '../../vendor/three/three.module.js';
import {model as parameters,visual,appearance} from './config/params.js';
import {createCoalescenceModel} from './animation/coalescence.js';
import {createBinarySystem} from './objects/createBinarySystem.js';
import {updateBinarySystem} from './animation/updateBinarySystem.js';
import {createWaveform} from './waveform/createWaveform.js';
import {renderPixelRatio} from '../../agn-triple/src/scene/renderSize.js';

export async function startWaveformAnimation(source,signal,p=parameters,v=visual,a=appearance) {
  if(!source||!signal) return;
  const renderer=new THREE.WebGLRenderer({canvas:source,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=v.exposure;
  const camera=new THREE.OrthographicCamera(-4,4,3,-3,0.1,80);
  camera.position.set(...v.cameraPosition);camera.up.set(0,0,1);camera.lookAt(0,0,0);
  const model=createCoalescenceModel(p),objects=await createBinarySystem(v,a,model),waveform=createWaveform(signal,model,v);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed=0,last=0,frame=0,visible=true,renderedFrames=0,activeSeconds=0;
  const parentRotation=new THREE.Quaternion();
  function draw(){
    const state=model.state(reduced.matches?p.signalEnd:elapsed);
    updateBinarySystem(objects,state,p,v);
    objects.billboards.forEach(object=>{
      object.parent.getWorldQuaternion(parentRotation);
      object.quaternion.copy(parentRotation.invert()).multiply(camera.quaternion);
    });
    objects.radiation.updateView(camera,source.height);
    objects.ripple.material.uniforms.uViewWorld.value.copy(camera.position).normalize();
    objects.ripple.material.uniforms.uScreenHeight.value=source.height;
    renderer.render(objects.scene,camera);waveform.draw(state);renderedFrames++;
    if(renderedFrames%15===0||reduced.matches) {
      source.dataset.stage=state.stage;source.dataset.cycleTime=state.t.toFixed(4);
      source.dataset.separation=state.separation.toFixed(6);source.dataset.signalFrequency=state.signal.frequency.toFixed(6);
      source.dataset.signalPhase=state.signal.phase.toFixed(6);source.dataset.finalOpacity=state.blend.toFixed(6);
      source.dataset.loopOpacity=state.opacity.toFixed(6);
      source.dataset.renderedFrames=String(renderedFrames);source.dataset.activeSeconds=activeSeconds.toFixed(3);
      source.dataset.meanFps=(renderedFrames/Math.max(activeSeconds,0.001)).toFixed(1);
      signal.dataset.reveal=state.reveal.toFixed(6);signal.dataset.strain=state.signal.strain.toFixed(6);
      signal.dataset.cycleTime=source.dataset.cycleTime;
      source.dataset.gwFronts=JSON.stringify(objects.radiation.fronts.map(({event,radius,opacity})=>
        ({id:event.index,t:event.emitTime,origin:event.origin,radius,opacity})));
    }
  }
  function resize(){
    const {width,height}=source.getBoundingClientRect();if(width<=0||height<=0)return;
    const ratio=renderPixelRatio(width,height,devicePixelRatio,v);
    renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);waveform.resize(width,height,ratio);
    const aspect=width/height,halfHeight=Math.max(v.cameraHalfHeight,v.sourceHalfWidth/aspect);
    const centerY=(v.sourceScreenY-0.5)*2*halfHeight;
    camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=centerY+halfHeight;camera.bottom=centerY-halfHeight;
    camera.updateProjectionMatrix();objects.layoutStars(camera);draw();
  }
  function tick(timestamp){
    frame=0;if(!visible||document.hidden||reduced.matches)return;
    if(last){const dt=(timestamp-last)/1000;activeSeconds+=dt;elapsed+=Math.min(dt,0.1);}
    last=timestamp;draw();frame=requestAnimationFrame(tick);
  }
  function sync(){
    if(!visible||document.hidden||reduced.matches){cancelAnimationFrame(frame);frame=0;last=0;if(reduced.matches)draw();}
    else if(!frame){last=0;frame=requestAnimationFrame(tick);}
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(source);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});intersection.observe(source);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  source.dataset.animationReady='true';source.dataset.engine='three.js r180 + canvas 2D';
  source.dataset.cycleDuration=String(p.cycleSeconds);resize();sync();
  return {dispose(){
    cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();
    document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);
    const geometries=new Set(),materials=new Set();objects.scene.traverse(object=>{
      if(object.geometry)geometries.add(object.geometry);
      if(object.material)materials.add(object.material);
    });geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();
  }};
}
