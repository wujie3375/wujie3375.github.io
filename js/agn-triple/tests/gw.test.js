import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../../vendor/three/three.module.js';
import {physical as p,visual as v} from '../src/config/params.js';
import {TAU,rotateOrbit} from '../src/physics/kepler.js';
import {playbackState,renderState} from '../src/animation/systemState.js';
import {sampleGWSource,GWEmissionManager,maximumDisplayedSourceSpeed,maximumWavefrontMetricSpeed,wavefrontMetricDistance} from '../src/effects/GWEmissionManager.js';
import {createGWWavefronts} from '../src/effects/createGWWavefronts.js';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const distance=(a,b)=>Math.hypot(...a.map((q,i)=>q-b[i]));

test('GW phase is twice the unwrapped Kepler true longitude, including wrap crossings',()=>{
  const before=JSON.stringify(p);let previous=-Infinity;
  for(let t=-8;t<=30;t+=0.01) {
    const s=sampleGWSource(t,p,v),state=playbackState(t,p,v);
    assert.ok(s.phiInner>previous);previous=s.phiInner;near(s.phiGW,2*s.phiInner);
    const nu=s.phiInner-p.omegaInner,r=Math.hypot(...state.inner.position);
    const reconstructed=rotateOrbit(r*Math.cos(nu),r*Math.sin(nu),p.iInner,p.OmegaInner,p.omegaInner);
    assert.ok(distance(reconstructed,state.inner.position)<1e-8);
  }
  const period=playbackState(0,p,v).inner.period/v.timeScaleInner;
  near(sampleGWSource(period,p,v).phiGW-sampleGWSource(0,p,v).phiGW,2*TAU);
  const n=playbackState(0,p,v).inner.meanMotion;
  for(let turn=-2;turn<=10;turn++) {
    const time=(Math.PI+turn*TAU-p.M0Inner)/(n*v.timeScaleInner);
    const left=sampleGWSource(time-1e-9,p,v).phiGW,right=sampleGWSource(time+1e-9,p,v).phiGW;
    assert.ok(right>=left&&right-left<1e-6);
  }
  assert.equal(JSON.stringify(p),before);
});
test('Every phase-crossing event uses the subframe barycenter, never a component',()=>{
  const manager=new GWEmissionManager(p,v),fronts=manager.update(5.123);
  assert.ok(fronts.length>=2&&fronts.length<=v.gwMaxVisibleFronts);
  for(const {event,radius} of fronts) {
    const source=sampleGWSource(event.emitTime,p,v),render=renderState(playbackState(event.emitTime,p,v),v);
    near(source.phiGW,event.phase,1e-7);near(event.phase,event.index*v.gwEmissionPhaseStep);
    event.origin.forEach((q,i)=>near(q,(p.m1*render.components[0][i]+p.m2*render.components[1][i])/(p.m1+p.m2)));
    assert.ok(distance(event.origin,render.components[0])>0.1);
    assert.ok(Object.isFrozen(event)&&Object.isFrozen(event.origin));
    near(radius,v.gwVisualSpeed*(5.123-event.emitTime));
  }
});
test('Emitted origins stay fixed while both the source and the shell radius move',()=>{
  const manager=new GWEmissionManager(p,v);
  const first=manager.update(3.23);const later=manager.update(3.28);
  let comparisons=0;
  for(const old of first) {
    const current=later.find(q=>q.event.index===old.event.index);if(!current)continue;
    assert.equal(current.event,old.event);assert.deepEqual(current.event.origin,old.event.origin);
    near(current.radius-old.radius,v.gwVisualSpeed*0.05);comparisons++;
    if(current.age>0.2) assert.ok(distance(current.event.origin,sampleGWSource(3.28,p,v).origin)>0.05);
  }
  assert.ok(comparisons>=2);
});
test('Emission is frame-rate independent, bounded, expires, and reconstructs time jumps',()=>{
  const sample=rate=>{const m=new GWEmissionManager(p,v);for(let t=0;t<5;t+=1/rate)m.update(t);return m.update(5);};
  const low=sample(24),high=sample(144),direct=new GWEmissionManager(p,v).update(5);
  for(const fronts of [high,direct]) {
    assert.deepEqual(fronts.map(q=>q.event.index),low.map(q=>q.event.index));
    fronts.forEach((q,i)=>{near(q.event.emitTime,low[i].event.emitTime,1e-8);assert.ok(distance(q.event.origin,low[i].event.origin)<1e-8);});
  }
  const manager=new GWEmissionManager(p,v);
  for(let t=0;t<=120;t+=0.1) {
    const fronts=manager.update(t);assert.ok(fronts.length<=v.gwMaxVisibleFronts);
    fronts.forEach(q=>{assert.ok(q.age>=0&&q.radius<v.gwMaxRadius+1e-8&&q.opacity>=0);});
  }
  const jumped=manager.update(10000);assert.ok(jumped.length<=v.gwMaxVisibleFronts);
  const reset=manager.update(1);
  assert.deepEqual(reset,new GWEmissionManager(p,v).update(1));
  const ids=reset.map(q=>q.event.index);assert.deepEqual(manager.update(1).map(q=>q.event.index),ids);
  assert.ok(new GWEmissionManager(p,{...v,gwEmissionPhaseStep:0.001}).update(0).length<=v.gwMaxVisibleFronts);
});
test('Visual propagation outpaces the displayed barycenter and is independent of inner spatial enlargement',()=>{
  const manager=new GWEmissionManager(p,v);
  for(let t=0;t<=30;t+=0.05) {
    const state=playbackState(t,p,v),center=renderState(state,v).center;
    assert.ok(Math.hypot(...state.outer.velocity)*v.unitsPerAU*v.timeScaleOuter<v.gwVisualSpeed);
    manager.update(t).forEach(front=>assert.ok(distance(center,front.event.origin)<=front.radius+1e-8));
  }
  const a=new GWEmissionManager(p,v).update(6.2);
  const b=new GWEmissionManager(p,{...v,innerOrbitVisualScale:400}).update(6.2);
  assert.deepEqual(a,b);
});
test('Pooled plane-projected wavefronts are world-space objects, not moving binary children',async()=>{
  const effect=await createGWWavefronts(p,v,name=>readFile(new URL('../src/shaders/'+name,import.meta.url),'utf8'));
  const scene=new THREE.Scene(),binary=new THREE.Group();scene.add(binary,effect.group);
  effect.update(2);scene.updateMatrixWorld(true);
  assert.notEqual(effect.group.parent,binary);assert.equal(effect.group.parent,scene);
  assert.equal(effect.group.children.length,v.gwMaxVisibleFronts);
  assert.equal(new Set(effect.group.children.map(q=>q.geometry)).size,1);
  effect.fronts.forEach((front,j)=>{
    const mesh=effect.group.children[j];assert.equal(mesh.geometry.type,v.gwPlanarProjection?'PlaneGeometry':'SphereGeometry');
    assert.equal(mesh.material.uniforms.uPlanarProjection.value,1);
    assert.ok(distance(mesh.position.toArray(),front.event.origin)<1e-9);near(mesh.scale.x,front.radius);
  });
});
test('Disabling GW leaves an empty effect, and invalid parameters fail clearly',async()=>{
  const disabled={...v,gwEnabled:false};assert.deepEqual(new GWEmissionManager(p,disabled).update(5),[]);
  const effect=await createGWWavefronts(p,disabled,()=>{throw new Error('disabled GW should not fetch shaders');});
  effect.update(5);assert.equal(effect.group.children.length,0);
  assert.throws(()=>new GWEmissionManager(p,{...v,gwVisualSpeed:0}),RangeError);
  assert.throws(()=>new GWEmissionManager(p,{...v,gwMaxVisibleFronts:25}),RangeError);
  assert.throws(()=>new GWEmissionManager(p,{...v,gwFrontWidth:0}),RangeError);
});
test('Visible fronts are nested, never converge; historical-center offsets create forward/back Doppler spacing',()=>{
  const speed=v.gwFrontPeak*v.gwVisualSpeed,maxSpeed=maximumWavefrontMetricSpeed(p,v);
  assert.ok(maxSpeed/speed<0.82&&maxSpeed/speed>0.65); // 略快且保持余量，不是高速远离。
  const manager=new GWEmissionManager(p,v);let checked=0;
  for(let time=0;time<2*v.totalDuration;time+=0.01){
    const fronts=manager.update(time);
    for(let j=1;j<fronts.length;j++){
      const old=fronts[j-1],young=fronts[j];
      const shift=wavefrontMetricDistance(old.event.origin,young.event.origin,v),gap=(old.radius-young.radius)*v.gwFrontPeak;
      assert.ok(gap>shift); // 同一盘面椭圆逆投影度量下保持嵌套，不相交成尖角。
      const forward=gap-shift,backward=gap+shift;
      assert.ok(forward>0&&forward<backward);
      checked++;
    }
  }
  assert.ok(checked>1000);
  assert.throws(()=>new GWEmissionManager(p,{...v,gwVisualSpeed:maxSpeed/v.gwFrontPeak*0.9}),RangeError);
});

test('Embedded visibility boost keeps sparse soft fronts and smooth positive disk modulation',async()=>{
  assert.equal(v.gwMaxVisibleFronts,3);assert.equal(v.gwVisualSpeed,2.2);
  assert.equal(v.gwFrontPeak,0.84);assert.equal(v.gwPlanarProjection,true);
  assert.ok(v.gwAlpha>0.34&&v.gwFrontWidth>0.065&&v.gwGlowStrength>0.85);
  assert.ok(v.diskRotationSpeed>0.46&&v.diskRotationMin<v.diskRotationMax);
  assert.ok(1-v.diskAzimuthalVariationStrength>=0.65);
  assert.ok(1+v.diskAzimuthalVariationStrength+v.diskFlowArcStrength<2);
  assert.ok(v.diskRotationSpeed>0.78);
  assert.ok(v.diskFlowArcRadialStart>0&&v.diskFlowArcRadialStart<v.diskFlowArcRadialEnd&&v.diskFlowArcRadialEnd<1);
  const shader=await readFile(new URL('../src/shaders/accretionDisk.frag',import.meta.url),'utf8');
  assert.ok(!shader.includes('noise(')&&!shader.includes('fbm('));
  const objects=await readFile(new URL('../src/objects/createAccretionDisk.js',import.meta.url),'utf8');
  assert.ok(v.diskFlowArcSharpness>1&&v.diskFlowArcSharpness<=3&&v.diskFlowAlphaStrength<0.4);
  for(const name of ['uAzimuthalSecondaryWeight','uFlowArcStrength','uFlowArcRadialStart','uFlowArcRadialEnd','uFlowArcSharpness','uFlowAlphaStrength']){
    assert.ok(shader.includes('uniform float '+name));assert.ok(objects.includes(name+':{value:v.'));
  }
});
