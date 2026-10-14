import test from 'node:test';
import assert from 'node:assert/strict';
import {physical as p,visual as v} from '../src/config/params.js';
import {playbackState} from '../src/animation/systemState.js';
import {sampleGWSource} from '../src/effects/GWEmissionManager.js';
import {createDopplerModel} from '../src/waveform/dopplerModel.js';
import {createDopplerWaveform} from '../src/waveform/createDopplerWaveform.js';
import {generateStarPositions,starViewDirection} from '../src/scene/starMask.js';
const model=createDopplerModel(p,v),near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);

test('Doppler uses physical AU/year Kepler velocity, approaching is blue-shifted and all frequencies stay positive',()=>{
  const before=JSON.stringify(p);let approaching=false,receding=false;
  near(Math.hypot(...model.N),1);
  for(let t=0;t<v.totalDuration;t+=0.031){
    const f=model.frequency(t),velocity=playbackState(t,p,v).outer.velocity;
    const los=velocity.reduce((sum,q,j)=>sum+q*model.N[j],0);
    near(f.vLOS,los);near(f.beta,los/v.lightSpeedAUPerYear);
    near(f.observed,f.source*(1+model.dopplerVisualBoost*f.beta));assert.ok(f.observed>0);
    near(f.physicalObserved,f.source*(1+f.beta));
    assert.ok(Math.abs(f.observed/f.source-1)<v.dopplerModulationDepth);
    if(los>0){assert.ok(f.observed>f.source);approaching=true;}
    if(los<0){assert.ok(f.observed<f.source);receding=true;}
  }
  assert.ok(approaching&&receding);assert.equal(JSON.stringify(p),before);
  assert.ok(model.dopplerVisualBoost>1&&model.maxBeta<0.01);
});
test('Integrated observed phase differentiates to observed frequency; intrinsic phase follows twice the inner true longitude',()=>{
  const dt=0.0005;
  for(let t=0.05;t<v.totalDuration-0.05;t+=0.047){
    const phaseDerivative=(model.evaluate(t+dt).phase-model.evaluate(t-dt).phase)/(2*dt);
    near(phaseDerivative,2*Math.PI*model.frequency(t).observed,0.002);
    const innerDerivative=(sampleGWSource(t+dt,p,v).phiGW-sampleGWSource(t-dt,p,v).phiGW)/(2*dt);
    near(innerDerivative,2*Math.PI*model.frequency(t).source,0.002);
  }
});
test('Visual boost and observer direction cannot feed back into Kepler positions or velocities',()=>{
  const alternate=createDopplerModel(p,{...v,dopplerModulationDepth:0.12,observerDirection:[-3.2,7.2,-4.2]});
  for(const t of [0,1.5,6.7,12]){
    near(alternate.frequency(t).beta,-model.frequency(t).beta);
    near(alternate.frequency(t).source,model.frequency(t).source);
    assert.notEqual(alternate.frequency(t).observed,model.frequency(t).observed);
  }
});
test('One golden historical path scrolls left to right without baseline or loop reset',()=>{
  let strokes=0,points=[];
  const ctx={setTransform(){},clearRect(){},save(){},restore(){},beginPath(){points=[];},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);},stroke(){strokes++;}};
  const canvas={getContext:()=>ctx,dataset:{}},wave=createDopplerWaveform(canvas,model,v);wave.resize(664,498,1.5);
  wave.draw(model.state(0));assert.equal(strokes,1);
  const state=model.state(8);wave.draw(state);assert.equal(strokes,2);
  assert.ok(points.every(([x,y])=>x>=0&&x<=664&&y>498*0.70&&y<498));
  near(points.at(-1)[0],664*(v.waveformLeft+(v.waveformRight-v.waveformLeft)*state.reveal));
  near(points[0][1],498*v.waveformCenterY-498*v.waveformHeight/2*model.evaluate(8).strain);
  const j=1024,oldY=points[j][1],shift=8*v.waveformVisibleWindow/v.waveformSamples;
  wave.draw(model.state(8+shift));near(points[j+8][1],oldY);
  assert.equal(canvas.dataset.scrollDirection,'left-to-right');
  assert.ok(v.waveformVisibleWindow>v.totalDuration);
  assert.equal(model.state(v.totalDuration).opacity,1);
});
test('Unbounded integrated phase stays continuous across past and future orbital cycles',()=>{
  const dt=0.0001,T=v.totalDuration;
  for(const t of [-T,-0.5,0,T,2*T,3*T+2.3]){
    near((model.evaluate(t+dt).phase-model.evaluate(t-dt).phase)/(2*dt),2*Math.PI*model.frequency(t).observed,0.003);
    assert.ok(Math.abs(model.evaluate(t+dt).strain-model.evaluate(t-dt).strain)<0.01);
  }
  const advance=model.evaluate(T).phase-model.evaluate(0).phase;
  near(model.evaluate(2*T+0.3).phase-model.evaluate(T+0.3).phase,advance);
});
test('Upper-only static star field avoids the new lower waveform region',()=>{
  const h=Math.max(v.cameraHalfHeight,v.diskOuterRadius*v.cameraFramingMargin/(4/3));
  const generated=generateStarPositions(h*4/3,h,v),direction=starViewDirection(v);
  const right=[-direction[1],direction[0],0],nr=Math.hypot(...right);right.forEach((q,j)=>right[j]=q/nr);
  const up=[direction[1]*right[2]-direction[2]*right[1],direction[2]*right[0]-direction[0]*right[2],direction[0]*right[1]-direction[1]*right[0]];
  const cy=(v.systemScreenY-0.5)*2*h;
  for(let j=0;j<generated.count;j++){
    const point=Array.from(generated.positions.slice(j*3,j*3+3)),y=point.reduce((sum,q,k)=>sum+q*up[k],0);
    assert.ok(0.5-(y-cy)/(2*h)<=v.starScreenBottom+1e-6);
  }
});
test('System framing moves down without changing size or the fixed waveform region',()=>{
  near(v.systemScreenY,0.40);near(v.waveformCenterY,0.84);near(v.waveformHeight,0.18);
  const h=Math.max(v.cameraHalfHeight,v.diskOuterRadius*v.cameraFramingMargin/(4/3));
  const direction=starViewDirection(v);
  const diskExtent=v.diskOuterRadius*Math.abs(direction[2])+v.diskThickness*Math.hypot(direction[0],direction[1]);
  assert.ok(v.systemScreenY+diskExtent/(2*h)<v.waveformCenterY-v.waveformHeight/2-0.035);
  near((v.systemScreenY-0.34)*498,29.88);
});
