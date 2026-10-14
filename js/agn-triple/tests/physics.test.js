import test from 'node:test';
import assert from 'node:assert/strict';
import { physical as p, visual as v } from '../src/config/params.js';
import { solveKepler, wrapAngle, orbitState, rotateOrbit, splitBinary } from '../src/physics/kepler.js';
import { physicalState, playbackState, renderState, elementsFor } from '../src/animation/systemState.js';
import { generateStarPositions, isStarMasked, starViewDirection } from '../src/scene/starMask.js';
import {createBBH} from '../src/objects/createBBH.js';
import {createBlackHole} from '../src/objects/createBlackHole.js';
import {renderPixelRatio} from '../src/scene/renderSize.js';
const norm = a => Math.hypot(...a);
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const near = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a-b) < tolerance, `${a} != ${b}`);

test('Kepler residual: circular through highly eccentric orbits', () => {
  for (const e of [0, 0.22, 0.28, 0.8, 0.99, 0.9999]) {
    for (let j = -80; j <= 80; j++) {
      const M = j * 0.237;
      const E = solveKepler(M, e);
      near(E - e*Math.sin(E), wrapAngle(M), 2e-12);
    }
  }
});
test('Three-dimensional rotation preserves distance', () => {
  near(norm(rotateOrbit(2, 3, 0.7, 1.4, 2.0)), Math.hypot(2, 3));
});
test('Mass-weighted inner center of mass remains zero', () => {
  const [a, b] = splitBinary([1, 2, 3], p.m1, p.m2);
  a.forEach((x, i) => near(p.m1*x + p.m2*b[i], 0));
});
test('Energy, angular momentum, periodicity and faster pericenter motion', () => {
  for (const suffix of ['Inner', 'Outer']) {
    const elements = elementsFor(p, suffix);
    const mu = p.G * (suffix === 'Inner' ? p.m1+p.m2 : p.M_smbh+p.m1+p.m2);
    const initial = orbitState(elements, 0, mu);
    const energy = -mu/(2*elements.a);
    const momentum = Math.sqrt(mu*elements.a*(1-elements.e**2));
    for (let j=0;j<100;j++) {
      const s = orbitState(elements, initial.period*j/100, mu);
      near((dot(s.velocity,s.velocity)/2-mu/norm(s.position))/energy, 1, 1e-11);
      near(norm(cross(s.position,s.velocity))/momentum, 1, 1e-11);
    }
    const repeat = orbitState(elements, initial.period, mu);
    repeat.position.forEach((x,i)=>near(x, initial.position[i], 1e-9));
    const peri = orbitState({...elements,M0:0},0,mu);
    const apo = orbitState({...elements,M0:Math.PI},0,mu);
    assert.ok(norm(peri.velocity)>norm(apo.velocity));
    near(norm(peri.position),elements.a*(1-elements.e),1e-9);
    near(norm(apo.position),elements.a*(1+elements.e),1e-9);
  }
});
test('Visual enlargement does not change dynamics or the rendered barycenter', () => {
  const s = physicalState(0.345,p);
  const before = JSON.stringify(s);
  for (const scale of [1,52,80]) {
    const r = renderState(s,{...v,innerOrbitVisualScale:scale});
    r.center.forEach((x,i)=>near((p.m1*r.components[0][i]+p.m2*r.components[1][i])/(p.m1+p.m2),x));
    assert.equal(JSON.stringify(s),before);
  }
});
test('Independent playback clocks preserve each Kepler orbit; equal scales restore synchrony', () => {
  const seconds=12.345;
  const state=playbackState(seconds,p,v);
  assert.deepEqual(state.outer,physicalState(seconds*v.timeScaleOuter,p).outer);
  assert.deepEqual(state.inner,physicalState(seconds*v.timeScaleInner,p).inner);
  assert.deepEqual(playbackState(seconds,p,{...v,timeScaleOuter:p.timeScale,timeScaleInner:p.timeScale}),physicalState(seconds*p.timeScale,p));
  const outerSeconds=state.outer.period/v.timeScaleOuter;
  const innerSeconds=state.inner.period/v.timeScaleInner;
  assert.ok(outerSeconds>6*innerSeconds);
  assert.ok(outerSeconds>=10&&outerSeconds<=15);
  assert.ok(outerSeconds<state.outer.period/p.timeScale);
});
test('Hierarchy and conservative Hill-scale check', () => {
  const s = physicalState(0,p);
  assert.ok(s.outer.period/s.inner.period>20);
  const hill = p.aOuter*(1-p.eOuter)*Math.cbrt((p.m1+p.m2)/(3*p.M_smbh));
  assert.ok(p.aInner*(1+p.eInner)<0.3*hill);
  assert.ok(p.iOuter<5*Math.PI/180);
});
test('Rounder outer orbit, enlarged central shadow and safe displayed pericenter', () => {
  assert.ok(p.eOuter<=0.12);
  near(v.centralShadowRadius,0.82);
  const pericenter=p.aOuter*(1-p.eOuter)*v.unitsPerAU;
  const maximumInnerOffset=p.aInner*(1+p.eInner)*p.m1/(p.m1+p.m2)*v.unitsPerAU*v.innerOrbitVisualScale;
  assert.ok(pericenter-maximumInnerOffset-v.smallBlackHoleRadius>v.centralShadowRadius*(1+v.centralHaloSize*v.centralHaloWidth));
  const elevation=Math.atan2(v.cameraPosition[2],Math.hypot(...v.cameraPosition.slice(0,2)));
  assert.ok(elevation>20*Math.PI/180&&elevation<30*Math.PI/180);
  assert.ok(v.diskInnerRadius>v.centralShadowRadius*(1+v.centralHaloSize*v.centralHaloWidth));
});
test('Seeded stars stay outside disk and black-hole projections across component sizes and camera drift', () => {
  for(const [width,height] of [[960,720],[700,525],[350,262.5],[300,300],[1200,300]]) {
    const halfHeight=Math.max(v.cameraHalfHeight,v.diskOuterRadius*v.cameraFramingMargin/(width/height));
    const generated=generateStarPositions(halfHeight*width/height,halfHeight,v);
    assert.equal(generated.count,v.starCount);
    assert.deepEqual(generated,generateStarPositions(halfHeight*width/height,halfHeight,v));
    for(let j=0;j<generated.count;j++) {
      const point=Array.from(generated.positions.slice(j*3,j*3+3));
      for(let phase=0;phase<=32;phase++) {
        const direction=starViewDirection(v,-v.cameraDrift+2*v.cameraDrift*phase/32);
        assert.equal(isStarMasked(point,direction,v),false);
      }
    }
  }
});
test('Star mask rejects disk, central shadow, and local binary halo independently', () => {
  const direction=starViewDirection(v);
  const background=direction.map(q=>-v.starDistance*q);
  assert.equal(isStarMasked(background,direction,v),true);
  const right=cross([0,0,1],direction);
  const point=background.map((q,i)=>q+right[i]*8/norm(right));
  assert.equal(isStarMasked(point,direction,v),false);
  const body=point.map((q,i)=>q+direction[i]*v.starDistance);
  assert.equal(isStarMasked(point,direction,v,[body]),true);
  // 缩小盘面时，中央球体遮罩仍单独有效，不能只依赖盘面剔除。
  const up=cross(direction,right).map(q=>q/norm(right));
  const nearCenter=background.map((q,i)=>q+up[i]*v.centralShadowRadius);
  assert.equal(isStarMasked(nearCenter,direction,{...v,diskOuterRadius:0.01,diskThickness:0,starExclusionPadding:0}),true);
});
test('Embedded view keeps both components clear of the central shadow during playback', () => {
  const [x,y,z]=v.cameraPosition;
  for(let step=0;step<=2400;step++) {
    const seconds=step*0.05;
    const angle=Math.atan2(y,x)+v.cameraDrift*Math.sin(seconds*2*Math.PI/v.cameraDriftPeriod);
    const radius=Math.hypot(x,y);
    const camera=[radius*Math.cos(angle),radius*Math.sin(angle),z];
    const direction=camera.map(q=>q/norm(camera));
    const rawRight=cross([0,0,1],direction);
    const right=rawRight.map(q=>q/norm(rawRight));
    const up=cross(direction,right);
    const project=a=>[dot(a,right),dot(a,up)];
    const components=renderState(playbackState(seconds,p,v),v).components.map(project);
    const distance=norm(components[0].map((q,i)=>q-components[1][i]));
    assert.ok(distance>2*v.smallBlackHoleRadius);
    components.forEach(a=>assert.ok(norm(a)>v.centralShadowRadius*(1+v.centralHaloSize*v.centralHaloWidth)+v.smallBlackHoleRadius));
  }
});

test('Outer elements and displayed motion are unchanged; inner physical period is shortened consistently',()=>{
  const baseline={...p,aInner:0.8,eInner:0.22};
  const expected={aOuter:260,eOuter:0.10,iOuter:2,OmegaOuter:12,omegaOuter:32,M0Outer:120};
  for(const [key,value] of Object.entries(expected))near(p[key],key.includes('Outer')&&!['aOuter','eOuter'].includes(key)?value*Math.PI/180:value);
  near(v.timeScaleOuter,0.32);
  const current=playbackState(0,p,v),old=playbackState(0,baseline,{...v,timeScaleInner:0.06});
  near(current.inner.period/old.inner.period,0.8);
  assert.ok(p.eInner>=0.02&&p.eInner<=0.08);
  const displayedRatio=(current.inner.period/v.timeScaleInner)/(old.inner.period/0.06);
  assert.ok(displayedRatio>=0.60&&displayedRatio<=0.75);
  for(let time=0;time<60;time+=0.13)assert.deepEqual(playbackState(time,p,v).outer,playbackState(time,baseline,v).outer);
  assert.ok(v.totalDuration>=13&&v.totalDuration<=15);
  near(current.outer.period/v.timeScaleOuter,v.totalDuration);
  near(v.totalDuration/(current.inner.period/v.timeScaleInner),12);
  for(const t of [0,0.2,3.5,12.9]) {
    const a=renderState(playbackState(t,p,v),v),b=renderState(playbackState(t+v.totalDuration,p,v),v);
    a.components.forEach((body,j)=>body.forEach((q,k)=>near(q,b.components[j][k],1e-8)));
  }
});
test('No trails or auxiliary guides; each black hole has one close-edge halo and a black body',()=>{
  const binary=createBBH(p,v);
  assert.equal(binary.group.children.length,2);assert.equal(binary.updateTrails,undefined);
  for(const object of [...binary.bodies,createBlackHole(v.centralShadowRadius,v)]) {
    assert.equal(object.children.length,2);
    assert.equal(object.children[0].material.color.getHex(),0);
    const halo=object.children[1],uniforms=halo.material.uniforms;
    assert.equal(halo.geometry.type,'PlaneGeometry');assert.ok(uniforms.uWidth.value<0.1);
    assert.ok(halo.material.depthTest&&!halo.material.depthWrite);
    near(uniforms.uPeak.value,2/v.centralHaloSize);
  }
});
test('4:3 render budget raises small-widget resolution without unlimited high-DPI rendering',()=>{
  near(v.canvasWidth/v.canvasHeight,4/3);
  for(const [w,h,dpr] of [[960,720,1],[700,525,1],[350,262.5,3],[1920,1440,2]]){
    const ratio=renderPixelRatio(w,h,dpr,v);
    assert.ok(ratio<=v.maxPixelRatio);
    assert.ok(w*h*ratio*ratio<=v.maxRenderPixels+1e-6);
    if(w===700)near(w*ratio,960);
  }
});
test('Optimized inner projection reduces near-stationary motion while preserving the outer orbit',()=>{
  const view=starViewDirection(v),project=a=>norm(a.map((q,j)=>q-dot(a,view)*view[j]));
  const baselineP={...p,eInner:0.05,iInner:16*Math.PI/180,OmegaInner:28*Math.PI/180};
  const baselineV={...v,timeScaleInner:Math.sqrt(p.aInner**3/50)*10/v.totalDuration};
  const measure=(p,v)=>{let minimum=Infinity,slow=0;for(let j=0;j<6000;j++){
    const s=playbackState(v.totalDuration*j/6000,p,v);
    for(const weight of [-p.m2/(p.m1+p.m2),p.m1/(p.m1+p.m2)]){
      const speed=project(s.outer.velocity.map((q,k)=>q*v.unitsPerAU*v.timeScaleOuter+
        s.inner.velocity[k]*weight*v.unitsPerAU*v.innerOrbitVisualScale*v.timeScaleInner));
      minimum=Math.min(minimum,speed);if(speed<0.15)slow++;
    }
  }return {minimum,slow};};
  const old=measure(baselineP,baselineV),current=measure(p,v);
  assert.ok(current.minimum>0.12&&current.minimum>old.minimum*8);
  assert.ok(current.slow<old.slow/3);
});
test('Static star field stays outside the disk and the entire moving BBH sweep',()=>{
  near(v.cameraDrift,0);
  const h=v.diskOuterRadius*v.cameraFramingMargin/(4/3),generated=generateStarPositions(h*4/3,h,v);
  const direction=starViewDirection(v);
  for(let j=0;j<generated.count;j++){
    const point=Array.from(generated.positions.slice(j*3,j*3+3));
    for(let t=0;t<v.totalDuration;t+=0.025){
      const components=renderState(playbackState(t,p,v),v).components;
      assert.equal(isStarMasked(point,direction,v,components),false);
    }
  }
});
