import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../../vendor/three/three.module.js';
import {model as p,visual as v,appearance} from '../src/config/params.js';
import {createCoalescenceModel} from '../src/animation/coalescence.js';
import {createWaveform} from '../src/waveform/createWaveform.js';
import {createBinarySystem} from '../src/objects/createBinarySystem.js';
import {updateBinarySystem} from '../src/animation/updateBinarySystem.js';
import {createGWSource} from '../src/animation/gwSource.js';
import {GWEmissionManager} from '../../agn-triple/src/effects/GWEmissionManager.js';
const model=createCoalescenceModel(p);
const shaderLoader=name=>readFile(new URL('../../agn-triple/src/shaders/'+name,import.meta.url),'utf8');
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);

test('Unequal masses, visual size ratio and mass-weighted barycenter',()=>{
  assert.ok(v.largeRadius/v.smallRadius>=1.25&&v.largeRadius/v.smallRadius<=1.4);
  assert.ok(v.finalRadius>v.largeRadius&&p.massLarge>p.massSmall);
  for(let t=0;t<p.mergerPeak;t+=0.025){
    const s=model.state(t);
    s.positions[0].forEach((x,i)=>near(p.massLarge*x+p.massSmall*s.positions[1][i],0));
    assert.ok(Math.hypot(...s.positions[0])<Math.hypot(...s.positions[1]));
  }
});
test('Inspiral contracts with increasing chirp frequency and amplitude',()=>{
  let previous=model.state(0);
  for(let t=0.02;t<p.mergerPeak;t+=0.02){
    const next=model.state(t);
    assert.ok(next.signal.frequency>previous.signal.frequency);
    assert.ok(next.signal.amplitude>=previous.signal.amplitude);
    assert.ok(next.separation<=previous.separation&&next.separation>=0);
    previous=next;
  }
});
test('Frequency and amplitude have smooth first derivatives across both joins',()=>{
  const epsilon=1e-5;
  for(const t of [p.inspiralEnd,p.mergerPeak]) for(const f of [model.frequency,model.amplitude]) {
    near(f(t-epsilon),f(t+epsilon),1e-4);
    near((f(t)-f(t-epsilon))/epsilon,(f(t+epsilon)-f(t))/epsilon,0.003);
  }
});
test('Integrated phase follows frequency, and orbital phase is half the GW phase',()=>{
  for(const t of [0.5,3,6.5,7.6,8.0,8.5,9.5]) {
    const epsilon=0.002;
    const derivative=(model.evaluate(t+epsilon).phase-model.evaluate(t-epsilon).phase)/(2*epsilon);
    near(derivative,2*Math.PI*model.frequency(t),0.005);
    if(t<p.mergerPeak){
      const state=model.state(t),relative=state.positions[1].map((x,i)=>x-state.positions[0][i]);
      near(Math.cos(2*Math.atan2(relative[1],relative[0])),Math.cos(state.signal.phase));
    }
  }
});
test('Merger peak coincides with completed source coalescence and the strain maximum',async()=>{
  const state=model.state(p.mergerPeak);
  near(state.signal.strain,1);near(state.blend,1);near(state.separation,0);
  near(state.reveal,p.mergerPeak/p.signalEnd);
  for(let t=0;t<=p.signalEnd;t+=0.002) assert.ok(Math.abs(model.evaluate(t).strain)<=1+1e-10);
  const objects=await createBinarySystem(v,appearance,model,shaderLoader);updateBinarySystem(objects,state,p,v);
  assert.equal(objects.bodies[0].visible,false);assert.equal(objects.bodies[1].visible,false);assert.equal(objects.final.visible,true);
  const atPeak=objects.final.scale.toArray();updateBinarySystem(objects,model.state(p.mergerPeak-1e-5),p,v);
  objects.final.scale.toArray().forEach((q,i)=>near(q,atPeak[i],0.001));
});
test('Ringdown decays, settles in frequency, and the 14 second reset is hidden',()=>{
  let amplitude=1;
  for(let t=p.mergerPeak;t<=p.signalEnd;t+=0.01){
    const a=model.evaluate(t).amplitude;assert.ok(a<=amplitude+1e-10);amplitude=a;
  }
  assert.ok(amplitude<0.02);
  near(model.state(p.signalEnd).reveal,1);near(model.state(p.signalEnd).opacity,1);
  near(model.frequency(p.signalEnd),p.frequencyRingdown,0.003);
  near(model.state(p.cycleSeconds-0.001).opacity,0);near(model.state(p.cycleSeconds).opacity,0);
  assert.ok(model.state(0.1).opacity>0&&model.state(0.1).opacity<1);
});
test('Only one path is stroked, and nothing beyond the draw progress is plotted',()=>{
  const points=[];let strokes=0;
  const context={setTransform(){},clearRect(){},beginPath(){points.length=0;},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);},stroke(){strokes++;}};
  const canvas={getContext:()=>context};const waveform=createWaveform(canvas,model,v);waveform.resize(700,370,1);
  waveform.draw(model.state(0));assert.equal(strokes,0);
  const state=model.state(3);waveform.draw(state);assert.equal(strokes,1);
  near(points.at(-1)[0],700*(v.waveformLeft+(v.waveformRight-v.waveformLeft)*state.reveal));
  assert.ok(points.every(([x])=>x<=points.at(-1)[0]));
  waveform.draw(model.state(p.signalEnd));assert.equal(strokes,2);near(points.at(-1)[0],700*v.waveformRight);
});
test('Invalid editable configurations fail clearly',()=>{
  assert.throws(()=>createCoalescenceModel({...p,mergerPeak:3}),RangeError);
  assert.throws(()=>createCoalescenceModel({...p,frequencyStart:4}),RangeError);
});

test('14-second timing retains inspiral rotations and shortens the visible ringdown',()=>{
  const old=createCoalescenceModel({...p,cycleSeconds:12,inspiralEnd:7.2,mergerPeak:8.3,signalEnd:10.8,
    fadeInSeconds:0.35,fadeOutStart:11.1,fadeOutEnd:11.85,blendStart:7.75,
    frequencyStart:0.6,frequencyBridge:2.1,frequencyPeak:4.5,frequencyRingdown:3.6,
    ringdownDecay:0.55,ringdownShoulder:0.16,ringdownFrequencyDecay:0.30,phaseSamples:4096});
  const rotations=m=>(m.evaluate(m.parameters.inspiralEnd).phase-m.evaluate(0).phase)/(4*Math.PI);
  assert.ok(rotations(model)>rotations(old)*1.2);
  assert.ok(p.signalEnd-p.mergerPeak<old.parameters.signalEnd-old.parameters.mergerPeak);
  assert.ok(p.cycleSeconds>=13&&p.cycleSeconds<=15);
  assert.equal(v.titleText,'Compact Binary Coalescence');near(v.canvasWidth/v.canvasHeight,4/3);
});
test('Continuous radiation follows the same chirp phase, historical barycenter, and damping through all stages',()=>{
  const sample=createGWSource(model,p,v),manager=new GWEmissionManager(p,v,sample,0);
  const records=[];
  for(let time=0;time<=p.signalEnd;time+=1/60){
    const source=sample(time),signal=model.evaluate(time);
    near(source.phiGW,signal.phase);near(source.phiInner,signal.phase/2);
    source.origin.forEach(q=>near(q,0));
    const fronts=manager.update(time);assert.ok(fronts.length<=v.gwMaxVisibleFronts);
    for(const front of fronts){
      assert.ok(front.event.emitTime>=0);near(sample(front.event.emitTime).phiGW,front.event.phase,1e-7);
      assert.ok(Object.isFrozen(front.event.origin));
      near(front.radius,v.gwVisualSpeed*(time-front.event.emitTime));
    }
    if(fronts.length)records.push({time,fronts});
  }
  assert.ok(records.some(q=>q.time<3));
  assert.ok(records.some(q=>q.time>p.mergerPeak+1.5));
  near(sample(p.mergerPeak).strength,1);
  assert.ok(sample(p.signalEnd).strength<sample(p.mergerPeak).strength*0.10);
  const ids=manager.update(p.signalEnd).map(q=>q.event.index);
  assert.ok(manager.update(p.signalEnd+0.05).every(q=>ids.includes(q.event.index))); // 可以自然过期，但不会在信号结束后新发波。
  manager.update(0).forEach(front=>{near(front.event.emitTime,0);near(front.radius,0);near(front.opacity,0);});
});
test('Merger aftermath uses a soft world-space front and travels farther for longer',async()=>{
  const objects=await createBinarySystem(v,appearance,model,shaderLoader);
  const first=p.mergerPeak+0.5,last=p.signalEnd-p.ringdownEndFade;
  updateBinarySystem(objects,model.state(first),p,v);
  const oldRadius=objects.ripple.scale.x;
  assert.equal(objects.ripple.geometry.type,'SphereGeometry');
  assert.equal(objects.radiation.group.parent,objects.scene);
  updateBinarySystem(objects,model.state(last),p,v);
  assert.ok(objects.ripple.visible&&objects.ripple.scale.x>oldRadius&&objects.ripple.scale.x>1.7);
  assert.ok(objects.ripple.material.uniforms.uAlpha.value>0);
  updateBinarySystem(objects,model.state(p.mergerPeak+v.rippleDuration+0.01),p,v);
  assert.equal(objects.ripple.visible,false);
});
test('Continuous radiation can be disabled without breaking the remnant or merger aftermath',async()=>{
  const disabled={...v,gwEnabled:false},objects=await createBinarySystem(disabled,appearance,model,shaderLoader);
  updateBinarySystem(objects,model.state(p.mergerPeak+1),p,disabled);
  assert.deepEqual(objects.radiation.fronts,[]);
  assert.equal(objects.radiation.group.children.length,0);
  assert.ok(objects.final.visible&&objects.ripple.visible);
});
test('Merger silhouettes stretch gently; remnant oscillation follows the chirp and damps to a circle',async()=>{
  const objects=await createBinarySystem(v,appearance,model,shaderLoader);
  updateBinarySystem(objects,model.state(p.mergerPeak-v.mergerShapeDeformationDuration),p,v);
  objects.bodies.forEach(body=>near(body.scale.x,1));
  const before=model.state(p.mergerPeak-0.25);updateBinarySystem(objects,before,p,v);
  objects.bodies.forEach((body,j)=>{
    assert.ok(body.scale.x>1.02&&body.scale.x<=1+v.mergerShapeDeformationStrength);
    near(body.scale.x*body.scale.y,1);
    body.position.toArray().forEach((q,k)=>near(q,before.positions[j][k]));
  });
  let positive=false,negative=false;
  for(let age=0;age<0.6;age+=0.01){
    const state=model.state(p.mergerPeak+age);updateBinarySystem(objects,state,p,v);
    const distortion=objects.final.scale.x-objects.final.scale.y;
    if(distortion>0.01)positive=true;if(distortion<-.01)negative=true;
    assert.equal(Math.sign(distortion),Math.sign(Math.cos(state.signal.phase)));
    assert.ok(Math.abs(distortion)<0.12);
  }
  assert.ok(positive&&negative);
  updateBinarySystem(objects,model.state(p.signalEnd),p,v);
  near(objects.final.scale.x,objects.final.scale.y,0.0001);
});
test('CBC stars remain fixed and unanimated through inspiral, merger and ringdown',async()=>{
  const objects=await createBinarySystem(v,appearance,model,shaderLoader);
  const camera=new THREE.OrthographicCamera(-3.74,3.74,2.18,-3.42,0.1,80);camera.position.set(...v.cameraPosition);
  objects.layoutStars(camera);
  const before=Array.from(objects.stars.geometry.attributes.position.array),opacity=objects.stars.material.opacity;
  for(let time=0;time<p.cycleSeconds;time+=0.15){
    updateBinarySystem(objects,model.state(time),p,v);
    assert.deepEqual(Array.from(objects.stars.geometry.attributes.position.array),before);
    near(objects.stars.material.opacity,opacity);
  }
  assert.equal(objects.stars.userData.staticBackground,true);
});
test('Continuous inspiral radiation emits once per waveform cycle, starts at zero, and leaves no long gaps',()=>{
  const manager=new GWEmissionManager(p,v,createGWSource(model,p,v),0);
  const events=new Map();
  for(let time=0;time<p.inspiralEnd;time+=0.01){
    const fronts=manager.update(time);
    assert.ok(fronts.length>0); // 首个零半径事件也已存在，随后平滑淡入。
    for(const front of fronts)events.set(front.event.index,front.event);
  }
  const sequence=Array.from(events.values()).sort((a,b)=>a.index-b.index);
  near(sequence[0].emitTime,0);near(v.gwEmissionPhaseStep,2*Math.PI);
  for(let j=1;j<sequence.length;j++){
    near(sequence[j].phase-sequence[j-1].phase,2*Math.PI,1e-7);
    assert.ok(sequence[j].emitTime-sequence[j-1].emitTime<1/p.frequencyStart+1e-7);
    assert.ok(sequence[j].strength>sequence[j-1].strength);
  }
});
test('Merger is the emission brightness peak; fast ringdown shares the waveform envelope',async()=>{
  const objects=await createBinarySystem(v,appearance,model,shaderLoader);
  updateBinarySystem(objects,model.state(p.mergerPeak),p,v);
  const pulsePeak=objects.ripple.material.uniforms.uAlpha.value;
  near(pulsePeak,v.rippleStrength*v.gwGlobalBrightnessScale);
  const totalAlpha=()=>objects.radiation.group.children.reduce((sum,q)=>sum+q.material.uniforms.uAlpha.value,0);
  const radiationPeak=totalAlpha();assert.ok(radiationPeak>0.3);
  for(let age=0.01;age<2;age+=0.01){
    const state=model.state(p.mergerPeak+age);updateBinarySystem(objects,state,p,v);
    assert.ok(objects.ripple.material.uniforms.uAlpha.value<pulsePeak);
    assert.ok(totalAlpha()<=radiationPeak+1e-8);
  }
  assert.ok(model.evaluate(p.mergerPeak+1.2).amplitude<0.05);
  assert.ok(Math.abs(p.frequencyPeak-p.frequencyRingdown)/p.frequencyPeak<0.10);
});

test('Source distortion, merger halo and newly emitted radiation share one ringdown envelope',async()=>{
  const objects=await createBinarySystem(v,appearance,model,shaderLoader),source=createGWSource(model,p,v);
  for(let age=0;age<=p.signalEnd-p.mergerPeak;age+=0.017){
    const state=model.state(p.mergerPeak+age);updateBinarySystem(objects,state,p,v);
    const expected=state.signal.amplitude;
    near(objects.ripple.material.uniforms.uAlpha.value/(v.rippleStrength*v.gwGlobalBrightnessScale),expected);
    near((objects.final.scale.x-objects.final.scale.y)/(2*v.ringdownDistortion),state.signal.strain);
    near(source(state.t).strength,expected);
  }
  near(model.evaluate(p.signalEnd).amplitude,0);near(model.evaluate(p.signalEnd+1).strain,0);
  assert.ok(model.evaluate(p.mergerPeak+1).amplitude<0.04);
});

test('Merger-era fronts continue expanding through ringdown without phase eviction or current-source dimming',async()=>{
  const objects=await createBinarySystem(v,appearance,model,shaderLoader);
  const emitted=new Map();let comparisons=0,propagatingAfterQuiet=false;
  for(let t=p.mergerPeak-0.7;t<p.signalEnd+0.8;t+=1/120){
    updateBinarySystem(objects,model.state(t),p,v);
    for(const front of objects.radiation.fronts){
      const previous=emitted.get(front.event.index);
      if(previous){near(front.radius-previous.radius,v.gwVisualSpeed*(t-previous.time));comparisons++;}
      emitted.set(front.event.index,{radius:front.radius,time:t});
      if(t>p.signalEnd&&front.event.emitTime<p.mergerPeak+0.3&&front.radius>2&&front.opacity>0.002)
        propagatingAfterQuiet=true;
    }
  }
  assert.ok(comparisons>100);assert.ok(propagatingAfterQuiet);
  assert.equal(v.gwPhaseFadeEnd,0);
  assert.ok(v.gwMaxVisibleFronts>Math.ceil(p.frequencyPeak*v.gwMaxRadius/v.gwVisualSpeed));
  updateBinarySystem(objects,model.state(p.mergerPeak+0.8),p,v);
  near(objects.ripple.scale.x,v.rippleStartRadius+v.ripplePropagationSpeed*(0.8+v.rippleRiseSeconds));
});

test('Age damping dims distant fronts and glow without shortening propagation or changing emission times',async()=>{
  const objects=await createBinarySystem(v,appearance,model,shaderLoader);
  const undamped=new GWEmissionManager(p,{...v,gwAgeFadeRate:0},createGWSource(model,p,v),0);
  const peak=model.state(p.mergerPeak);updateBinarySystem(objects,peak,p,v);
  const alpha=()=>objects.radiation.group.children.reduce((sum,q)=>sum+q.material.uniforms.uAlpha.value,0);
  const peakAlpha=alpha();
  for(let age=0.01;age<3.15;age+=0.01){
    const t=p.mergerPeak+age;updateBinarySystem(objects,model.state(t),p,v);
    const plain=undamped.update(t);
    objects.radiation.fronts.forEach((front,j)=>{
      const old=plain.find(q=>q.event.index===front.event.index);
      near(front.radius,old.radius);near(front.event.emitTime,old.event.emitTime);
      assert.ok(front.opacity<=old.opacity+1e-10);
      near(objects.radiation.group.children[j].material.uniforms.uGlow.value,v.gwGlowStrength*front.ageFade);
      assert.ok(objects.radiation.group.children[j].material.uniforms.uFrontWidth.value*front.radius<=v.gwFrontMaxWorldWidth+1e-10);
    });
  }
  assert.ok(alpha()<peakAlpha*0.60); // 接近传播寿命末端才衰至较低总亮度；不再强迫近处波前过早熄灭。
  assert.ok(objects.radiation.fronts.some(q=>q.radius>2));
  const before=model.state(p.mergerPeak-0.5);updateBinarySystem(objects,before,p,v);
  assert.ok(objects.bodies[0].scale.x/objects.bodies[0].scale.y>1.45);
  assert.throws(()=>new GWEmissionManager(p,{...v,gwAgeFadeRate:-1},createGWSource(model,p,v),0),RangeError);
});

test('One brightness multiplier scales all three stages; expanded fronts can approach both lateral edges',async()=>{
  const base={...v,gwGlobalBrightnessScale:1},plain=await createBinarySystem(base,appearance,model,shaderLoader);
  const boosted=await createBinarySystem(v,appearance,model,shaderLoader);
  for(const t of [3,p.mergerPeak,p.mergerPeak+0.8]){
    updateBinarySystem(plain,model.state(t),p,base);updateBinarySystem(boosted,model.state(t),p,v);
    plain.radiation.group.children.forEach((mesh,j)=>near(boosted.radiation.group.children[j].material.uniforms.uAlpha.value,
      mesh.material.uniforms.uAlpha.value*v.gwGlobalBrightnessScale));
    near(boosted.ripple.material.uniforms.uAlpha.value,plain.ripple.material.uniforms.uAlpha.value*v.gwGlobalBrightnessScale);
  }
  assert.ok(v.gwMaxRadius*v.gwFrontPeak>v.cameraHalfHeight*4/3);
  updateBinarySystem(boosted,model.state(8.5),p,v);
  assert.ok(boosted.radiation.fronts.some(q=>q.radius*v.gwFrontPeak>=v.cameraHalfHeight*4/3&&q.opacity>0.008));
  const prior=createCoalescenceModel({...p,frequencyBridge:2.2,frequencyPeak:4.7,frequencyRingdown:4.4});
  assert.ok(model.frequency(p.mergerPeak-0.5)>prior.frequency(p.mergerPeak-0.5));
  near(model.state(p.mergerPeak).signal.strain,1);near(model.state(p.mergerPeak).separation,0);
});
test('Post-merger visibility damps clearly while historical radii and source ringdown remain intact',async()=>{
  const objects=await createBinarySystem(v,appearance,model,shaderLoader);
  const undimmed=await createBinarySystem({...v,gwRingdownFadeTime:1e12},appearance,model,shaderLoader);
  const alpha=o=>o.radiation.group.children.reduce((sum,m)=>sum+m.material.uniforms.uAlpha.value,0);
  for(const age of [0,0.25,0.8,1.55]){
    const state=model.state(p.mergerPeak+age);updateBinarySystem(objects,state,p,v);updateBinarySystem(undimmed,state,p,{...v,gwRingdownFadeTime:1e12});
    const factor=v.gwRingdownBrightnessFloor+(1-v.gwRingdownBrightnessFloor)*Math.exp(-Math.max(0,age-v.gwRingdownFadeDelay)/v.gwRingdownFadeTime);
    near(alpha(objects)/alpha(undimmed),factor,1e-9);
    objects.radiation.fronts.forEach((f,j)=>{near(f.radius,undimmed.radiation.fronts[j].radius);near(f.event.emitTime,undimmed.radiation.fronts[j].event.emitTime);});
    if(age===1.55){assert.ok(factor<0.17);assert.ok(objects.radiation.fronts.some(f=>f.radius>2.5));assert.ok(state.signal.amplitude<0.01);}
  }
  for(const bad of [{gwRingdownFadeTime:0},{gwRingdownFadeDelay:-1},{gwRingdownBrightnessFloor:1}])
    await assert.rejects(()=>createBinarySystem({...v,...bad},appearance,model,shaderLoader),RangeError);
  near(v.gwMaxRadius,6);near(v.gwVisualSpeed,1.8);
});
