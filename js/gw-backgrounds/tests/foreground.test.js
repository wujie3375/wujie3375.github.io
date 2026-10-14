import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../../vendor/three/three.module.js';
import {model as p,visual as v} from '../src/config/params.js';
import {createForegroundModel} from '../src/animation/foregroundModel.js';
import {createForegroundScene} from '../src/scene/createForegroundScene.js';
import {createWaveformPanel} from '../src/waveform/createWaveformPanel.js';
const model=createForegroundModel(p),near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const load=name=>readFile(new URL('../src/shaders/'+name,import.meta.url),'utf8');
const camera=new THREE.OrthographicCamera(-v.cameraHalfHeight*4/3,v.cameraHalfHeight*4/3,
  (v.galaxyScreenY-0.5)*2*v.cameraHalfHeight+v.cameraHalfHeight,
  (v.galaxyScreenY-0.5)*2*v.cameraHalfHeight-v.cameraHalfHeight,0.1,80);
camera.position.set(...v.cameraPosition);camera.up.set(0,0,1);camera.lookAt(0,0,0);

test('Forty-eight seeded sources have immutable centers; sixteen visible representatives fit without overlap',()=>{
  assert.equal(model.sources.length,48);assert.equal(p.numVisibleSystems,16);assert.deepEqual(model.sources,createForegroundModel(p).sources);
  model.sources.forEach((s,i)=>{
    assert.ok(Object.isFrozen(s.center)&&Object.isFrozen(s));
    const maxZ=s.population==='bulge'?(p.positionBulgeHalfHeight+Math.abs(p.projectionUpY)*p.positionHalfDepth)/p.projectionUpZ:p.positionElevatedHeight;
    assert.ok(Math.abs(s.center[0])<=p.positionHalfLength&&Math.abs(s.center[1])<=p.positionHalfDepth&&Math.abs(s.center[2])<=maxZ);
    const py=p.projectionUpY*s.center[1]+p.projectionUpZ*s.center[2];
    const sy=p.galaxyScreenY-py/(2*p.cameraHalfHeight);
    assert.ok(sy>=p.sourceScreenYRange[0]&&sy<=p.sourceScreenYRange[1]);
    for(const previous of model.sources.slice(0,i))
      assert.ok(Math.hypot(s.center[0]-previous.center[0],py-p.projectionUpY*previous.center[1]-p.projectionUpZ*previous.center[2])>=p.minimumProjectedSeparation*(i<p.numVisibleSystems?1:0.45));
  });
});
test('Each binary rotates locally with constant separation, fixed mass-weighted center, and fGW=2forbit',()=>{
  const centers=JSON.stringify(model.sources.map(s=>s.center));
  for(let t=0;t<14;t+=0.07)model.state(t).systems.forEach(({source,positions,wave})=>{
    for(let axis=0;axis<2;axis++)near(source.m1*positions[0][axis]+source.m2*positions[1][axis],0);
    const relative=positions[1].map((q,j)=>q-positions[0][j]);near(Math.hypot(...relative),source.separation);
    near(Math.cos(2*Math.atan2(relative[1],relative[0])),Math.cos(wave.phase));
  });
  assert.equal(JSON.stringify(model.sources.map(s=>s.center)),centers);
});
test('Monochromatic components have distinct fixed frequencies, amplitudes and phases; sum is exact',()=>{
  assert.ok(new Set(model.sources.map(s=>s.frequency)).size>=8); // 拥挤频段允许同一量化 bin，不机械均匀排频。
  assert.equal(new Set(model.sources.map(s=>s.phase)).size,48);
  assert.ok(new Set(model.sources.map(s=>s.amplitude)).size>8);
  for(let t=-6;t<20;t+=0.071){
    near(model.sum(t),model.sources.reduce((sum,s)=>sum+model.signal(s,t).strain,0));
    assert.ok(Math.abs(model.sum(t))<=model.amplitudeBound);
    model.sources.forEach(s=>{
      near(model.signal(s,t).amplitude,s.amplitude);near(model.signal(s,t).frequency,s.frequency);
      const dt=0.001;near((model.signal(s,t+dt).phase-model.signal(s,t-dt).phase)/(2*dt),2*Math.PI*s.frequency,1e-8);
    });
  }
});
test('Exact fourteen-second closure includes both stars, wavefront radii and all component signals',()=>{
  for(const time of [0,0.01,3.5,7.33,13.9]){
    const a=model.state(time),b=model.state(time+14);
    a.systems.forEach((s,i)=>{
      s.positions.forEach((r,k)=>r.forEach((q,j)=>near(q,b.systems[i].positions[k][j])));
      near(s.wave.strain,b.systems[i].wave.strain);
      assert.equal(s.fronts.length,b.systems[i].fronts.length);
      s.fronts.forEach((front,j)=>near(front.radius,b.systems[i].fronts[j].radius));
    });
    near(model.sum(time),model.sum(time+14));
  }
  const epsilon=1e-6;
  model.state(14-epsilon).systems.forEach((s,i)=>s.positions.forEach((r,k)=>r.forEach((q,j)=>
    near(q,model.state(0).systems[i].positions[k][j],s.source.separation*Math.PI*s.source.frequency*epsilon))));
});
test('Asynchronous fronts expand from their own fixed barycenter and fade before retirement',()=>{
  const ages=model.state(3.5).systems.map(s=>s.fronts[0]?.age);
  assert.ok(new Set(ages).size>8);
  for(let t=0;t<=14;t+=0.01)for(const s of model.sources){
    const fronts=model.wavefronts(s,t);assert.ok(fronts.length<=p.maxFrontsPerSource);
    for(const front of fronts){
      assert.equal(front.center,s.center);near(front.radius,p.wavefrontExpansionSpeed*(t-front.emitTime));
      near(Math.sin(model.signal(s,front.emitTime).phase),0,1e-8);
      assert.ok(Math.cos(model.signal(s,front.emitTime).phase)>0.999);
      assert.ok(front.opacity>=0&&front.opacity<=1&&front.radius<p.wavefrontMaxRadius);
    }
  }
  const s=model.sources[0],interval=1/s.frequency,phaseTime=s.phase/(2*Math.PI*s.frequency);
  const nearEnd=model.wavefronts(s,p.wavefrontMaxRadius/p.wavefrontExpansionSpeed-0.001-phaseTime);
  assert.ok(nearEnd.some(front=>front.radius>p.wavefrontMaxRadius*0.99&&front.opacity<0.001));
});
test('Batched wave and star meshes keep draw calls bounded; Galaxy and stars are static',async()=>{
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);
  assert.equal(objects.waves.mesh.count,p.numVisibleSystems*p.maxFrontsPerSource);
  assert.equal(objects.binaries.points.geometry.attributes.position.count,32);
  const starPositions=Array.from(objects.stars.geometry.attributes.position.array);
  const galaxyMatrix=objects.galaxy.matrix.toArray();
  for(let t=0;t<14;t+=0.1){
    objects.update(model.state(t),camera);
    assert.deepEqual(Array.from(objects.stars.geometry.attributes.position.array),starPositions);
    assert.deepEqual(objects.galaxy.matrix.toArray(),galaxyMatrix);
  }
  const stars=objects.binaries.points.geometry.attributes.position.array;
  model.sources.slice(0,p.numVisibleSystems).forEach((s,i)=>{
    for(let axis=0;axis<3;axis++)near((s.m1*stars[6*i+axis]+s.m2*stars[6*i+3+axis])/(s.m1+s.m2),s.center[axis],1e-6);
  });
});
test('Independent orbital planes preserve barycenters; spherical GW projection is independent of orbital planes',async()=>{
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);
  assert.ok(camera.position.z/Math.hypot(...camera.position.toArray())<0.12); // 约5.7°高于盘面，近乎edge-on。
  assert.ok(new Set(model.sources.map(s=>s.inclination)).size===48);
  const state=model.state(3.5);objects.update(state,camera);
  const positions=objects.binaries.points.geometry.attributes.position.array;
  const matrix=new THREE.Matrix4(),u=new THREE.Vector3(),qv=new THREE.Vector3(),n=new THREE.Vector3();
  state.systems.slice(0,p.numVisibleSystems).forEach((system,i)=>{
    const basis=objects.bases[i];near(basis.u.length(),1);near(basis.v.length(),1);near(basis.u.dot(basis.v),0);
    near(basis.normal.dot(new THREE.Vector3().crossVectors(basis.u,basis.v)),1);
    system.positions.forEach(([x,y],k)=>{
      const displayScale=objects.binaries.displayScales[i];
      const expected=new THREE.Vector3(...system.source.center).addScaledVector(basis.u,x*displayScale).addScaledVector(basis.v,y*displayScale);
      for(let axis=0;axis<3;axis++)near(positions[6*i+3*k+axis],expected.getComponent(axis),1e-6);
    });
    objects.waves.mesh.getMatrixAt(i*p.maxFrontsPerSource,matrix);matrix.extractBasis(u,qv,n);
    near(u.length(),system.fronts[0].radius,1e-6);near(qv.length(),system.fronts[0].radius,1e-6);
    near(u.normalize().dot(objects.right),1,1e-6);near(qv.normalize().dot(objects.up),1,1e-6);
    assert.equal(objects.waves.mesh.userData.propagationGeometry,'spherical-shell-projection');
  });
  assert.ok(objects.bases.some(b=>Math.abs(b.normal.dot(objects.bases[0].normal))<0.8));
  const alternate=createForegroundModel({...p,orientationSeed:p.orientationSeed+1});
  assert.deepEqual(alternate.sources.map(s=>[s.center,s.frequency,s.amplitude,s.phase]),
    model.sources.map(s=>[s.center,s.frequency,s.amplitude,s.phase]));
});
test('Forty-eight components and one sum use actual random parameters and a single display scale',()=>{
  const paths=[],styles=[];let points=[];
  const labels=[];
  const ctx={setTransform(){},clearRect(){},save(){},restore(){},beginPath(){points=[];},
    moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);},stroke(){paths.push(points.slice());styles.push({alpha:this.globalAlpha,width:this.lineWidth});},
    measureText(t){return {width:t.length*6,actualBoundingBoxAscent:10,actualBoundingBoxDescent:3};},fillRect(){},
    fillText(text,x,y){labels.push({text,x,y,paths:paths.length});}};
  const canvas={getContext:()=>ctx,dataset:{}},panel=createWaveformPanel(canvas,model,v);
  for(const width of [960,664,375]){
    const height=width*3/4;panel.resize(width,height,1.5);paths.length=0;styles.length=0;
    const state=model.state(3.5);panel.draw(state);assert.equal(paths.length,49);
    assert.ok(paths.every(path=>path.every(([x,y])=>x>=0&&x<=width&&y>height*v.topSectionHeight&&y<height)));
    const last=paths.at(-1),j=317;
    const expected=model.sum(state.t+(j/v.waveformSamples-0.5)*v.waveformTimeWindow);
    near(last[j][1],height*v.sumCenterY-height*v.sumHeight/(2*model.sumDisplayBound)*expected,1e-8);
    const sorted=model.sources.slice().sort((a,b)=>Number(v.featuredSourceIds.includes(a.id))-Number(v.featuredSourceIds.includes(b.id))||a.amplitude-b.amplitude);
    sorted.forEach((source,i)=>{
      const j=211,t=state.t+(j/v.waveformSamples-0.5)*v.waveformTimeWindow;
      near(paths[i][j][1],height*v.componentCenterY-height*v.componentHeight/(2*model.maximumAmplitude)*model.signal(source,t).strain,1e-8);
      if(v.featuredSourceIds.includes(source.id))near(styles[i].alpha,v.componentFeaturedAlpha);
      else {
        const base=source.category==='strong'?v.componentStrongAlpha:source.category==='weak'?v.componentWeakAlpha:v.componentWaveAlpha;
        near(styles[i].alpha,base*(v.componentAlphaFloor+(1-v.componentAlphaFloor)*Math.sqrt(source.amplitude/model.maximumAmplitude)));
      }
    });
    const spans=paths.slice(0,-1).map(path=>Math.max(...path.map(p=>p[1]))-Math.min(...path.map(p=>p[1])));
    assert.ok(spans.at(-1)/spans[0]>8); // 不逐条归一化，把实际振幅差异直接保留在像素高度中。
    assert.equal(canvas.dataset.summedSources,'48');assert.equal(canvas.dataset.componentWaves,'48');
    assert.equal(labels.at(-1).text,'DWD Confusion');assert.equal(labels.at(-1).paths,49);
    assert.ok(height*v.sumLegendY+3+v.labelPadding<height*(v.sumCenterY-v.sumHeight/2));
    assert.ok(height*v.componentLegendY+3+v.labelPadding<height*(v.componentCenterY-v.componentHeight/2));
  }
});
test('Invalid loop frequencies, source counts, amplitude and indices fail explicitly',()=>{
  for(const bad of [{gwCycleRange:[15,50]},{numVisibleSystems:7},
    {amplitudeBands:[[-1,0.2],[0.1,0.2],[0.01,0.1]]},{representativeSources:[0,0,1,2,3,4]},
    {orbitInclinationRange:[0,Math.PI]},{orientationSeed:NaN},{maxFrontsPerSource:3}])
    assert.throws(()=>createForegroundModel({...p,...bad}),RangeError);
});

test('Clustered random parameters span visible fast/slow sources and seed changes never shift barycenters',()=>{
  const alternate=createForegroundModel({...p,componentRandomSeed:p.componentRandomSeed+1});
  assert.deepEqual(alternate.sources.map(s=>s.center),model.sources.map(s=>s.center));
  assert.notDeepEqual(alternate.sources.map(s=>[s.frequency,s.amplitude,s.phase]),model.sources.map(s=>[s.frequency,s.amplitude,s.phase]));
  const visible=model.sources.slice(0,p.numVisibleSystems);
  assert.ok(Math.max(...visible.map(s=>s.frequency))/Math.min(...visible.map(s=>s.frequency))>2.5);
  assert.equal(new Set(visible.map(s=>s.category)).size,3);
  assert.notDeepEqual(visible.map(s=>s.category),alternate.sources.slice(0,p.numVisibleSystems).map(s=>s.category));
  assert.ok(Math.max(...model.sources.map(s=>s.amplitude))/Math.min(...model.sources.map(s=>s.amplitude))>8);
  assert.ok(new Set(model.sources.map(s=>s.frequency)).size>=10);
  model.sources.forEach(s=>{
    assert.ok(s.frequency>=p.gwCycleRange[0]/14&&s.frequency<=p.gwCycleRange[1]/14);
    assert.ok(s.phase>=0&&s.phase<2*Math.PI);
  });
  for(let t=0;t<14;t+=0.012)assert.ok(Math.abs(model.sum(t))<=model.sumDisplayBound);
});
test('Edge-on thin disk, dust layer and bulge replace all face-on arm parameters',async()=>{
  assert.equal(v.galaxyViewMode,'edge-on');assert.ok(!('galaxyArmCount' in v)&&!('galaxyArmPhases' in v));
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);
  const disk=objects.galaxy.children[0],uniforms=disk.material.uniforms;
  near(uniforms.uHalfLength.value,v.galaxyDiskHalfLength);near(uniforms.uThickness.value,v.galaxyDiskThickness);
  assert.ok(v.galaxyDiskThickness/v.galaxyDiskHalfLength<0.06); // 中心增厚，外盘仍只有中心厚度的约1/4。
  assert.ok(v.galaxyDarkLaneStrength>0&&v.galaxyDarkLaneStrength<0.7&&v.galaxyBulgeRadius>4*v.galaxyDiskThickness);
  assert.ok(new Set(model.sources.map(s=>Math.floor(s.phase/(Math.PI/2)))).size===4);
  assert.ok(model.sources.every(s=>s.frequency*p.cycleSeconds%2<1e-9));
  const shader=await load('galaxy.frag');
  assert.ok(shader.includes('uShoulder')&&shader.includes('y-uDustOffset')&&!shader.includes('uArm')&&!shader.includes('atan('));
  assert.ok(!shader.includes('uTime')&&!shader.includes('texture('));
});
test('Weak source wavefronts keep a display floor without changing strain or propagation radius',async()=>{
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);objects.update(model.state(3.5),camera);
  const alphas=objects.waves.mesh.geometry.attributes.aOpacity.array;
  const originalSignals=model.sources.map(s=>model.signal(s,3.5).strain);
  for(let i=0;i<p.numVisibleSystems;i++){
    const source=model.sources[i],fronts=model.state(3.5).systems[i].fronts;
    const strength=v.wavefrontStrengthFloor+(1-v.wavefrontStrengthFloor)*(source.amplitude/model.maximumAmplitude)**v.wavefrontStrengthPower;
    assert.ok(strength>=0.30&&strength<=1);
    fronts.forEach((front,j)=>{
      const gain=1+v.wavefrontRecentBoost*Math.exp(-front.radius/(p.wavefrontMaxRadius*v.wavefrontRecentFalloff));
      const emphasis=v.featuredSourceIds.includes(i)?1:v.wavefrontOtherScale*(source.category==='weak'&&source.amplitude<v.weakDwarfAmplitudeMax?v.wavefrontWeakScale:1);
      near(alphas[i*p.maxFrontsPerSource+j],v.wavefrontAlpha*strength*front.opacity*gain*emphasis,1e-7);
      assert.ok(gain>=1&&gain<=1+v.wavefrontRecentBoost);
    });
    assert.ok(Math.max(...alphas.slice(i*p.maxFrontsPerSource,(i+1)*p.maxFrontsPerSource))>0.035);
  }
  assert.deepEqual(model.sources.map(s=>model.signal(s,3.5).strain),originalSignals);
  assert.ok(p.maxFrontsPerSource>=Math.ceil(p.gwCycleRange[1]/p.cycleSeconds*p.wavefrontMaxRadius/p.wavefrontExpansionSpeed));
  await assert.rejects(()=>createForegroundScene(model,{...v,wavefrontStrengthFloor:1.1},load),RangeError);
});
test('Horizontal Galaxy spans most of the upper width; sources cluster in the thin disk',async()=>{
  const halfWidth=v.cameraHalfHeight*v.aspectRatio;
  assert.ok(v.galaxyDiskHalfLength/halfWidth>=0.85&&v.galaxyHaloRadius/halfWidth>0.93);
  assert.ok(v.galaxyScreenY+3*v.galaxyHaloHalfHeight/(2*v.cameraHalfHeight)<v.topSectionHeight);
  assert.ok(v.galaxyScreenFade[1]<v.componentLegendY);
  const projected=s=>p.projectionUpY*s.center[1]+p.projectionUpZ*s.center[2];
  const diskSources=model.sources.filter(s=>s.population==='disk');
  assert.equal(diskSources.length,40);
  assert.ok(diskSources.filter(s=>Math.abs(projected(s))<0.35).length/diskSources.length>0.80);
  assert.ok(model.sources.some(s=>Math.abs(projected(s))>0.30));
  assert.ok(model.sources.some(s=>s.center[2]!==0));
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5,747);
  const disk=objects.galaxy.children[0];near(disk.material.uniforms.uScreenHeight.value,747);
  objects.galaxy.children.forEach(layer=>near(Math.abs(camera.quaternion.dot(layer.quaternion)),1));
  near(disk.geometry.parameters.width,2*v.galaxyHaloRadius);
  near(disk.geometry.parameters.height,6*v.galaxyHaloHalfHeight); // 软halo支撑面不是实际薄盘厚度。
  assert.ok(disk.geometry.parameters.height<disk.geometry.parameters.width*0.4);
  assert.ok(v.galaxyDiskThickness/v.galaxyDiskHalfLength<0.06);
  assert.ok(v.galaxyDiskThickness*0.25/v.galaxyDiskHalfLength<0.02);
  const shader=await load('galaxy.frag');assert.ok(shader.includes('haloAlpha*(1.0-diskAlpha)'));
  await assert.rejects(()=>createForegroundScene(model,{...v,galaxyHaloRadius:v.galaxyDiskHalfLength},load),RangeError);
});
test('Changing the edge-on population geometry cannot change any lower signal parameters or sums',()=>{
  const alternate=createForegroundModel({...p,seed:p.seed+1,positionHeight:p.positionHeight*1.2});
  assert.notDeepEqual(alternate.sources.map(s=>s.center),model.sources.map(s=>s.center));
  assert.deepEqual(alternate.sources.map(s=>[s.frequency,s.amplitude,s.phase,s.m1,s.m2]),
    model.sources.map(s=>[s.frequency,s.amplitude,s.phase,s.m1,s.m2]));
  for(const t of [0,3.5,7,13.99,17.5])near(alternate.sum(t),model.sum(t));
});

test('Explicit disk/bulge mixture has a minority bulge population with visible sources above and below',()=>{
  assert.ok(!('positionCoreExclusion' in p));
  const visible=model.sources.slice(0,p.numVisibleSystems);
  const central=visible.filter(s=>s.population==='bulge');
  assert.equal(central.length,p.positionBulgeVisibleCount);
  assert.equal(model.sources.filter(s=>s.population==='bulge').length,p.positionBulgeSignalCount);
  const projected=s=>p.projectionUpY*s.center[1]+p.projectionUpZ*s.center[2];
  assert.equal(central.filter(s=>projected(s)>0).length,3);assert.equal(central.filter(s=>projected(s)<0).length,3);
  for(const s of model.sources.filter(s=>s.population==='bulge')){
    assert.ok(Math.abs(projected(s))>=p.positionBulgeMinHeight);
    assert.ok((s.center[0]/p.positionBulgeHalfLength)**2+(projected(s)/p.positionBulgeHalfHeight)**2<=1+1e-9);
  }
  assert.ok(visible.some(s=>s.center[0]<-4)&&visible.some(s=>s.center[0]>4));
  assert.ok(visible.some(s=>Math.abs(s.center[0])>1.05&&Math.abs(s.center[0])<3.5));
  const noQuota=createForegroundModel({...p,numVisibleSystems:12,positionBulgeVisibleCount:0,positionBulgeSignalCount:0});
  assert.deepEqual(noQuota.sources.map(s=>[s.frequency,s.amplitude,s.phase]),model.sources.map(s=>[s.frequency,s.amplitude,s.phase]));
  for(const bad of [{positionBulgeVisibleCount:-1},{positionBulgeVisibleCount:13},{positionBulgeHalfLength:0},{positionBulgeSignalCount:33},{positionBulgeMinHeight:2}])
    assert.throws(()=>createForegroundModel({...p,...bad}),RangeError);
});

test('Larger Galaxy fits the upper section and DWD visibility is driven by centralized uniforms',async()=>{
  assert.ok(v.galaxyDiskHalfLength>6.8&&v.galaxyHaloRadius>7.5&&v.galaxyBulgeRadius>1.25);
  assert.ok(v.galaxyHaloRadius<v.cameraHalfHeight*v.aspectRatio);
  assert.ok(v.galaxyScreenY-3*v.galaxyHaloHalfHeight/(2*v.cameraHalfHeight)>0.09);
  near(v.galaxyBulgeRadius,2.2*2/3); // 最新追加要求：球核本体缩为原来的2/3。
  assert.ok(v.galaxyScreenY+v.galaxyBulgeRadius/(2*v.cameraHalfHeight)<v.topSectionHeight);
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);
  const uniforms=objects.binaries.points.material.uniforms;
  near(uniforms.uCoreStrength.value,v.whiteDwarfCoreStrength);near(uniforms.uHaloStrength.value,v.whiteDwarfHaloStrength);
  assert.ok(v.featuredDwarfSizeRange[0]>v.whiteDwarfSizeRange[1]&&v.featuredDwarfBrightnessRange[0]>v.whiteDwarfBrightnessRange[1]);
  const sizes=objects.binaries.points.geometry.attributes.aSize.array;
  assert.ok(Math.min(...sizes)>=v.weakDwarfSizeRange[0]&&Math.max(...sizes)<=v.featuredDwarfSizeRange[1]);
  for(let t=0;t<14;t+=0.25){
    objects.update(model.state(t),camera);
    assert.ok(Array.from(objects.waves.mesh.geometry.attributes.aOpacity.array).every(a=>a>=0&&a<1));
  }
  await assert.rejects(()=>createForegroundScene(model,{...v,whiteDwarfHaloStrength:-1},load),RangeError);
  await assert.rejects(()=>createForegroundScene(model,{...v,wavefrontRecentBoost:-1},load),RangeError);
});

test('Five highlighted visual orbits stay resolvable while leaving all actual source parameters unchanged',async()=>{
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);
  const original=JSON.stringify(model.sources);
  assert.equal(v.featuredSourceIds.length,5);
  for(let t=0;t<14;t+=0.05){
    objects.update(model.state(t),camera);
    const positions=objects.binaries.points.geometry.attributes.position.array;
    for(const i of v.featuredSourceIds){
      const delta=new THREE.Vector3(positions[6*i+3]-positions[6*i],positions[6*i+4]-positions[6*i+1],positions[6*i+5]-positions[6*i+2]);
      const projected=Math.hypot(delta.dot(objects.right),delta.dot(objects.up));
      assert.ok(projected*375/(2*v.cameraHalfHeight*v.aspectRatio)>5); // 本轮显示间距减半，紧凑核心仍可区分。
      near(delta.length(),model.sources[i].separation*v.featuredOrbitScale,1e-6);
    }
  }
  const contrast=objects.binaries.points.geometry.attributes.aContrast.array;
  for(let i=0;i<p.numVisibleSystems;i++)assert.equal(contrast[2*i]>0,model.sources[i].population==='bulge');
  assert.equal(JSON.stringify(model.sources),original);
  for(const s of model.sources){
    const dt=0.0001,t=3.5;
    const orbitalFrequency=(model.signal(s,t+dt).phase/2-model.signal(s,t-dt).phase/2)/(4*Math.PI*dt);
    near(2*orbitalFrequency,s.frequency);
    const front=model.wavefronts(s,t)[0];
    near(Math.cos(model.signal(s,front.emitTime).phase),1);
  }
});

test('Galaxy stays straight and continuous; disk and bulge share one stellar-density shader',async()=>{
  near(v.galaxyDiskHalfLength,7.85);near(v.galaxyHaloRadius,7.95);near(v.galaxyBulgeRadius,2.20*2/3);
  const objects=await createForegroundScene(model,v,load);
  assert.equal(objects.galaxy.children.length,1);
  const mesh=objects.galaxy.children[0],disk=mesh.material.uniforms;
  near(disk.uDensityVariation.value,v.galaxyDensityVariationStrength);
  near(disk.uBulgeRadius.value,v.galaxyBulgeRadius);near(disk.uBulgeAspect.value,v.galaxyBulgeAspect);
  assert.ok(mesh.renderOrder>objects.waves.mesh.renderOrder&&mesh.renderOrder<objects.binaries.points.renderOrder);
  const shader=await load('galaxy.frag');
  assert.ok(shader.includes('diskDensity+bulgeDensity')&&shader.includes('verticalProfile(y,thickness)')&&shader.includes('y-uDustOffset'));
  assert.ok(!shader.includes('uWarp')&&!shader.includes('sin(')&&!('galaxyDiskWarp' in v)&&!('galaxyDustRoughness' in v));
  assert.ok(!shader.includes('uTime')&&!shader.includes('random('));
  assert.ok(v.componentFeaturedAlpha>2*v.componentWaveAlpha&&v.componentWaveAlpha<0.18);
});

test('Vertical disk profile is smooth, centered and thins monotonically towards the ends',()=>{
  const height=x=>v.galaxyDiskThickness*(v.galaxyDiskOuterThickness+(1-v.galaxyDiskOuterThickness)*Math.exp(-((x/(v.galaxyDiskScale*0.90))**2)));
  const vertical=(y,h)=>{const e=Math.exp(-Math.abs(y)/h),e2=e*e;return 4*e2/(1+e2)**2;};
  let previous=height(0);
  for(let x=0;x<=v.galaxyDiskHalfLength;x+=0.02){
    const h=height(x);assert.ok(h>0&&h<=previous+1e-12);previous=h;
    near(vertical(0,h),1);
    for(const y of [0.05,0.1,0.3,0.6]){
      near(vertical(y,h),vertical(-y,h));assert.ok(vertical(y,h)<vertical(0,h));
    }
  }
  assert.ok(height(0)>2*height(v.galaxyDiskHalfLength));
  assert.ok(v.galaxyBulgeAspect>=0.70&&v.galaxyBulgeAspect<=0.85&&v.galaxyHaloStrength<0.03&&v.galaxyDarkLaneStrength<0.15);
});

test('All sixteen displayed binary separations stay compact without changing mass-weighted centers or signals',async()=>{
  const current=await createForegroundScene(model,v,load);
  const before=await createForegroundScene(model,{...v,featuredOrbitScale:1.65,otherOrbitScale:0.90},load);
  current.layout(camera,1.5);before.layout(camera,1.5);
  near(v.featuredOrbitScale,1.65/2);near(v.otherOrbitScale,0.90/2);
  const sourcesBefore=JSON.stringify(model.sources);
  for(let t=0;t<14;t+=0.07){
    const state=model.state(t);current.update(state,camera);before.update(state,camera);
    const now=current.binaries.points.geometry.attributes.position.array,old=before.binaries.points.geometry.attributes.position.array;
    for(let i=0;i<p.numVisibleSystems;i++){
      const s=model.sources[i];
      for(let axis=0;axis<3;axis++){
        near(now[6*i+3+axis]-now[6*i+axis],(old[6*i+3+axis]-old[6*i+axis])/2,1e-6);
        near((s.m1*now[6*i+axis]+s.m2*now[6*i+3+axis])/(s.m1+s.m2),s.center[axis],1e-6);
      }
      const delta=new THREE.Vector3(now[6*i+3]-now[6*i],now[6*i+4]-now[6*i+1],now[6*i+5]-now[6*i+2]);
      assert.ok(Math.hypot(delta.dot(current.right),delta.dot(current.up))*375/(2*v.cameraHalfHeight*v.aspectRatio)>2);
    }
    assert.deepEqual(current.waves.mesh.geometry.attributes.aOpacity.array,before.waves.mesh.geometry.attributes.aOpacity.array);
  }
  assert.equal(JSON.stringify(model.sources),sourcesBefore);
});

test('Simpler Galaxy has less broad glow and faster disk fading, with compact exponential bulge rather than power-law haze',async()=>{
  assert.ok(v.galaxyBrightness<1.35&&v.galaxyDiskScale<5.3&&v.galaxyDiskShoulder<0.36);
  near(v.galaxyDensityVariationStrength,0);near(v.galaxyDiskHalfLength,7.85);near(v.galaxyBulgeRadius,2.2*2/3);
  const shader=await load('galaxy.frag');
  assert.ok(shader.includes('exp(-bulgeR/uBulgeCoreFraction)')&&shader.includes('exp(-uBulgeEnvelopeFalloff*pow(bulgeR,uBulgeEnvelopePower))'));
  assert.ok(!shader.includes('1.0/(1.0+pow(bulgeR')&&!shader.includes('random('));
});

test('Bulge owns a thick ellipsoidal profile even with halo disabled; disk and dust remain separate',async()=>{
  const objects=await createForegroundScene(model,{...v,galaxyHaloStrength:0},load);
  const uniforms=objects.galaxy.children[0].material.uniforms;
  assert.equal(uniforms.uHaloStrength.value,0);near(uniforms.uBulgeAspect.value,v.galaxyBulgeAspect);
  assert.ok(v.galaxyBulgeRadius*v.galaxyBulgeAspect>3.5*v.galaxyDiskThickness);
  const bulgeDensity=y=>{
    const r=Math.abs(y)/(v.galaxyBulgeRadius*v.galaxyBulgeAspect);
    return v.galaxyBulgeCoreStrength*Math.exp(-r/v.galaxyBulgeCoreFraction)+
      v.galaxyBulgeEnvelopeStrength*Math.exp(-v.galaxyBulgeEnvelopeFalloff*r**v.galaxyBulgeEnvelopePower);
  };
  const diskDensity=y=>{
    const vertical=h=>{const e=Math.exp(-Math.abs(y)/h),e2=e*e;return 4*e2/(1+e2)**2;};
    return vertical(v.galaxyDiskThickness)+v.galaxyDiskShoulder*vertical(2.1*v.galaxyDiskThickness);
  };
  for(const y of [0.35,0.50,0.60]){
    near(bulgeDensity(y),bulgeDensity(-y));assert.ok(bulgeDensity(y)>diskDensity(y));
    assert.ok(bulgeDensity(y)>0.15&&bulgeDensity(y)<bulgeDensity(0));
  }
  const halfHeight=v.galaxyBulgeRadius*v.galaxyBulgeAspect*v.galaxyBulgeEdgeEnd;
  assert.ok(v.galaxyScreenY-halfHeight/(2*v.cameraHalfHeight)>0.12);
  assert.ok(v.galaxyScreenY+halfHeight/(2*v.cameraHalfHeight)<v.componentLegendY);
  const shader=await load('galaxy.frag');assert.ok(shader.includes('bulgeEdge')&&shader.includes('diskDensity+bulgeDensity'));
});

test('Bulge sources keep compact point pairs and readable contrast without affecting signal amplitudes',async()=>{
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);objects.update(model.state(3.5),camera);
  const points=objects.binaries.points.geometry.attributes;
  for(let i=0;i<p.numVisibleSystems;i++)if(model.sources[i].population==='bulge'){
    assert.ok(points.aSize.array[2*i]>=v.whiteDwarfBulgeSizeMin);
    assert.ok(points.aBrightness.array[2*i]>=v.whiteDwarfBulgeBrightnessFloor-1e-6);
    assert.ok(points.aContrast.array[2*i]>0);
  }
  near(v.featuredOrbitScale,0.825);near(v.otherOrbitScale,0.45);
  near(model.sum(3.5),model.sources.reduce((sum,s)=>sum+model.signal(s,3.5).strain,0));
});

test('Three seeded stellar populations have central concentration, sparse vertical tails and static layered sprites',async()=>{
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);
  const attrs=objects.stellarPoints.geometry.attributes;
  const count=v.galaxyStarBulgeCount+v.galaxyStarDiskCount+v.galaxyStarThickCount;
  assert.equal(attrs.position.count,count);
  assert.ok(v.galaxyStarBulgeCount/count>.55&&v.galaxyStarBulgeCount/count<.60);
  assert.ok(v.galaxyStarDiskCount/count>.35&&v.galaxyStarDiskCount/count<.40);
  assert.ok(v.galaxyStarThickCount/count>.05&&v.galaxyStarThickCount/count<.08);
  assert.equal(objects.stars.geometry.attributes.position.count,9); // 保留原天空点，无旧均匀盘点。
  assert.ok(objects.stellarPoints.renderOrder>objects.galaxy.children[0].renderOrder&&objects.stellarPoints.renderOrder<objects.binaries.points.renderOrder);
  let above=0,below=0,weak=0,bright=0,cool=0,diskInner=0,diskEnds=0,thickHigh=0,diskY=0,thickY=0;
  const radialBins=[0,0,0,0];
  for(let j=0;j<attrs.position.count;j++){
    const point=new THREE.Vector3().fromArray(attrs.position.array,3*j),x=point.dot(objects.right),py=point.dot(objects.up);
    if(j<v.galaxyStarBulgeCount){
      const r=Math.hypot(x/v.galaxyStarBulgeHalfLength,py/v.galaxyStarBulgeHalfHeight);
      assert.ok(r<=v.galaxyStarBulgeMaxRadius+1e-6);
      radialBins[Math.min(3,Math.floor(4*r/v.galaxyStarBulgeMaxRadius))]++;
      if(py>.2)above++;if(py<-.2)below++;
    }else if(j<v.galaxyStarBulgeCount+v.galaxyStarDiskCount){
      assert.ok(Math.abs(x)<=v.galaxyStarDiskHalfLength&&Math.abs(py)<=v.galaxyStarDiskHeight);
      if(Math.abs(x)<2)diskInner++;if(Math.abs(x)>5)diskEnds++;
      diskY+=Math.abs(py);
    }else{
      assert.ok(Math.abs(x)<=v.galaxyStarDiskHalfLength&&Math.abs(py)<=v.galaxyStarThickHalfHeight);
      if(Math.abs(py)>.3)thickHigh++;
      thickY+=Math.abs(py);
    }
    assert.ok(attrs.aSize.array[j]>=v.galaxyStarWeakSizeRange[0]*v.galaxyStarBulgeSizeScale&&attrs.aSize.array[j]<=v.galaxyStarBrightSizeRange[1]);
    if(attrs.aOpacity.array[j]<v.galaxyStarWeakAlphaRange[1])weak++;if(attrs.aOpacity.array[j]>v.galaxyStarMediumAlphaRange[1])bright++;
    if(attrs.aWarmth.array[j]<.35)cool++;
    // 任何普通点都比DWD本体小得多，不靠新增大halo或波前区别星点。
    assert.ok(attrs.aSize.array[j]<v.whiteDwarfSizeRange[0]*.60&&attrs.aOpacity.array[j]<=.77);
    const sy=v.galaxyScreenY-py/(2*v.cameraHalfHeight);
    assert.ok(sy>.12&&sy<v.componentLegendY);
  }
  assert.ok(above>v.galaxyStarBulgeCount*.15&&below>v.galaxyStarBulgeCount*.15&&weak>count*.75&&bright>0&&bright<count*.06);
  const densities=radialBins.map((n,i)=>n/(2*i+1)); // 等宽椭圆环面积正比2i+1，不能只比较环内点数。
  for(let i=1;i<4;i++)assert.ok(densities[i]<densities[i-1]);
  assert.ok(densities[0]>5*densities[3]);
  assert.ok(diskInner>v.galaxyStarDiskCount*.5&&diskEnds>=10);
  assert.ok(thickHigh>v.galaxyStarThickCount*.3&&thickY/v.galaxyStarThickCount>3*diskY/v.galaxyStarDiskCount);
  assert.ok(cool>count*.06&&cool<count*.20&&v.galaxyStarGlow<v.whiteDwarfHaloStrength/5);
  assert.ok(new Set(attrs.aSize.array).size>100&&new Set(attrs.aOpacity.array).size>100);
  const positions=Array.from(attrs.position.array),sizes=Array.from(attrs.aSize.array),opacity=Array.from(attrs.aOpacity.array);
  for(const t of [0,3.5,7,13.99,28]){
    objects.update(model.state(t),camera);
    assert.deepEqual(Array.from(attrs.position.array),positions);assert.deepEqual(Array.from(attrs.aSize.array),sizes);assert.deepEqual(Array.from(attrs.aOpacity.array),opacity);
  }
  objects.layout(camera,1.75);
  assert.deepEqual(Array.from(attrs.position.array),positions);assert.deepEqual(Array.from(attrs.aSize.array),sizes);
  near(objects.stellarPoints.material.uniforms.uPixelRatio.value,1.75);
  const again=await createForegroundScene(model,v,load);again.layout(camera,1.5);
  for(const name of Object.keys(attrs))assert.deepEqual(Array.from(again.stellarPoints.geometry.attributes[name].array),Array.from(attrs[name].array));
});

test('Ordinary stars stay numerous but bulge points become smaller and softer than layered DWD pairs',async()=>{
  near(v.galaxyStarBulgeCount/240,2.5);near(v.galaxyStarDiskCount/192,2);near(v.galaxyStarThickCount/48,1.25);
  const previous=[[1,1.55],[1.55,2.1],[2.1,2.65]];
  [v.galaxyStarWeakSizeRange,v.galaxyStarMediumSizeRange,v.galaxyStarBrightSizeRange].forEach((range,i)=>range.forEach((n,j)=>near(n/previous[i][j],1.8)));
  near(v.galaxyStarGlow,.022);near(v.whiteDwarfHaloStrength,.40);
  assert.deepEqual(v.whiteDwarfSizeRange,[8,11]);assert.deepEqual(v.featuredDwarfSizeRange,[12,15]);
  near(p.numVisibleSystems,16);near(p.numSignalSources,48);
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.75);objects.update(model.state(3.5),camera);
  const attrs=objects.stellarPoints.geometry.attributes;
  assert.equal(attrs.position.count,1044);
  for(const size of attrs.aSize.array)assert.ok(size>=1.8*v.galaxyStarBulgeSizeScale&&size<4.8);
  assert.ok(objects.stellarPoints.material.uniforms.uGlow.value<objects.binaries.points.material.uniforms.uHaloStrength.value/5);
});

test('Old sky positions remain exact while ordinary Galaxy points replace uniform disk scattering',async()=>{
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);
  let seed=v.starfieldSeed>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let j=0;j<33*4;j++)random();
  const direction=camera.position.clone().normalize();
  for(let j=0;j<9;j++){
    const sx=.05+.9*random(),sy=v.starfieldScreenYRange[0]+random()*(v.starfieldScreenYRange[1]-v.starfieldScreenYRange[0]);
    const point=direction.clone().multiplyScalar(-12).addScaledVector(objects.right,camera.left+sx*(camera.right-camera.left)).addScaledVector(objects.up,camera.top-sy*(camera.top-camera.bottom));
    const actual=new THREE.Vector3().fromArray(objects.stars.geometry.attributes.position.array,j*3);
    assert.ok(point.distanceTo(actual)<1e-6);
  }
});

test('Star population parameters are validated without touching DWD or waveform mathematics',async()=>{
  for(const change of [{galaxyStarThickCount:-1},{galaxyStarBulgeSersicIndex:0},{galaxyStarEdgeFadeFraction:0},
    {galaxyStarDiskRadialScale:0},{galaxyStarThickVerticalScale:NaN},{galaxyStarDiskVariationStrength:1},{galaxyStarBrightFraction:.5}]){
    await assert.rejects(createForegroundScene(model,{...v,...change},load),RangeError);
  }
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);
  const before=JSON.stringify(model.sources);
  for(const t of [0,3.5,7,13.99]){
    objects.update(model.state(t),camera);
    near(model.sum(t),model.sources.reduce((sum,s)=>sum+model.signal(s,t).strain,0));
  }
  assert.equal(JSON.stringify(model.sources),before);
});

test('Sixteen layered visible systems still fit without changing signals when only position quotas change',async()=>{
  const before=createForegroundModel({...p,numVisibleSystems:12,positionBulgeVisibleCount:4});
  near(p.numVisibleSystems/12,4/3);
  const properties=s=>[s.frequency,s.amplitude,s.phase,s.m1,s.m2,s.separation,s.inclination,s.azimuth];
  assert.deepEqual(model.sources.map(properties),before.sources.map(properties));
  near(model.sumDisplayBound,before.sumDisplayBound);near(model.maximumAmplitude,before.maximumAmplitude);
  for(let t=0;t<14;t+=.037)near(model.sum(t),before.sum(t));
  const visible=model.sources.slice(0,16),projected=s=>p.projectionUpY*s.center[1]+p.projectionUpZ*s.center[2];
  assert.equal(visible.filter(s=>s.population==='disk').length,10);
  assert.equal(visible.filter(s=>s.population==='bulge'&&projected(s)>0).length,3);
  assert.equal(visible.filter(s=>s.population==='bulge'&&projected(s)<0).length,3);
  assert.ok(visible.some(s=>s.center[0]<-5.5)&&visible.some(s=>s.center[0]>5.5));
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);objects.update(model.state(3.5),camera);
  const attributes=objects.binaries.points.geometry.attributes;
  const weak=[],medium=[],featured=[];
  visible.forEach((s,i)=>{
    const isFeatured=v.featuredSourceIds.includes(i),isWeak=s.category==='weak'&&s.amplitude<v.weakDwarfAmplitudeMax;
    const list=isFeatured?featured:isWeak?weak:medium;
    list.push(attributes.aBrightness.array[2*i]);
    if(!isFeatured&&isWeak&&s.population==='disk')assert.ok(attributes.aSize.array[2*i]<v.whiteDwarfSizeRange[0]);
  });
  assert.equal(featured.length,5);assert.equal(weak.length,2);assert.equal(medium.length,9);
  assert.ok(Math.min(...featured)>Math.max(...medium));
  assert.ok(Math.min(...weak)<Math.min(...medium));
  assert.ok(objects.waves.visibleFronts>0&&objects.waves.mesh.count===112);
});

test('Bulge points have many faint small grains, few intermediate points, rare brighter points and negligible halo',async()=>{
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);
  const a=objects.stellarPoints.geometry.attributes;let weak=0,medium=0,bright=0;
  for(let j=0;j<v.galaxyStarBulgeCount;j++){
    const size=a.aSize.array[j];
    if(size<v.galaxyStarMediumSizeRange[0]*v.galaxyStarBulgeSizeScale)weak++;
    else if(size<v.galaxyStarBrightSizeRange[0]*v.galaxyStarBulgeSizeScale)medium++;
    else bright++;
    assert.ok(a.aOpacity.array[j]<.54&&size<4);
  }
  assert.ok(weak>v.galaxyStarBulgeCount*.84&&medium>v.galaxyStarBulgeCount*.05&&bright>0&&bright<v.galaxyStarBulgeCount*.03);
  near(v.galaxyStarGlow,.022);
  assert.ok(v.galaxyStarGlow<v.whiteDwarfHaloStrength/10);
});

test('Disk outskirts remain thin but have a wider vertical tail and softly fading stellar light',async()=>{
  near(v.galaxyDiskHalfLength,7.85);near(v.galaxyBulgeRadius,2.2*2/3);
  assert.ok(v.galaxyDiskOuterThickness>.25&&v.galaxyDiskOuterThickness<.4&&v.galaxyEdgeFade<.72);
  assert.ok(v.galaxyStarDiskHalfLength>7.35&&v.galaxyStarDiskRadialScale>2.8&&v.galaxyStarDiskOuterThickness>.45);
  const objects=await createForegroundScene(model,v,load);objects.layout(camera,1.5);
  near(objects.galaxy.children[0].material.uniforms.uOuterThickness.value,v.galaxyDiskOuterThickness);
  const a=objects.stellarPoints.geometry.attributes;let left=0,right=0,offLine=0;
  for(let j=v.galaxyStarBulgeCount;j<v.galaxyStarBulgeCount+v.galaxyStarDiskCount;j++){
    const q=new THREE.Vector3().fromArray(a.position.array,j*3),x=q.dot(objects.right),y=q.dot(objects.up);
    if(x<-5)left++;if(x>5)right++;if(Math.abs(x)>5&&Math.abs(y)>.035)offLine++;
  }
  assert.ok(left>=5&&right>=5&&offLine>=5);
});

test('Individual-source styling reduces weak overlap without changing any confusion path or sum style',()=>{
  const capture=visual=>{
    let points=[],paths=[],styles=[];
    const ctx={setTransform(){},clearRect(){},save(){},restore(){},beginPath(){points=[];},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);},
      stroke(){paths.push(points.slice());styles.push({alpha:this.globalAlpha,color:this.strokeStyle,width:this.lineWidth});},
      measureText(t){return {width:t.length*6,actualBoundingBoxAscent:10,actualBoundingBoxDescent:3};},fillRect(){},fillText(){}};
    const panel=createWaveformPanel({getContext:()=>ctx,dataset:{}},model,visual);panel.resize(664,498,1.5);panel.draw(model.state(7));return {paths,styles};
  };
  const now=capture(v),old=capture({...v,featuredSourceIds:[0,1,3,7,10],componentWaveAlpha:.10,componentAlphaFloor:.25,componentFeaturedAlpha:.42,componentFeaturedLineWidth:1.35});
  assert.equal(now.paths.length,49);assert.deepEqual(now.paths.at(-1),old.paths.at(-1));assert.deepEqual(now.styles.at(-1),old.styles.at(-1));
  assert.ok(v.componentWeakAlpha<v.componentWaveAlpha&&v.componentWaveAlpha<v.componentStrongAlpha&&v.componentStrongAlpha<v.componentFeaturedAlpha);
  assert.equal(now.styles.filter(s=>s.alpha===v.componentFeaturedAlpha).length,5);
});

test('Sixteen genuinely additional components preserve every original source and the rendered upper motion',async()=>{
  const old=createForegroundModel({...p,numSignalSources:32,representativeSources:Array.from({length:32},(_,i)=>i),gwCycleRange:[16,66],maxFrontsPerSource:6});
  assert.equal(model.sources.length/old.sources.length,1.5);
  assert.deepEqual(model.sources.slice(0,32),old.sources);
  near(model.maximumAmplitude,old.maximumAmplitude);
  assert.ok(model.sources.slice(32).every(s=>!old.sources.includes(s)));
  for(const t of [0,3.5,7,13.99]){
    near(model.sum(t),old.sum(t)+model.sources.slice(32).reduce((sum,s)=>sum+model.signal(s,t).strain,0));
    assert.deepEqual(model.state(t).systems.slice(0,16),old.state(t).systems.slice(0,16));
  }
  const nowObjects=await createForegroundScene(model,v,load),oldObjects=await createForegroundScene(old,v,load);
  nowObjects.layout(camera,1.5);oldObjects.layout(camera,1.5);
  for(const t of [0,3.5,7,13.99]){
    nowObjects.update(model.state(t),camera);oldObjects.update(old.state(t),camera);
    for(const name of Object.keys(nowObjects.binaries.points.geometry.attributes))
      assert.deepEqual(nowObjects.binaries.points.geometry.attributes[name].array,oldObjects.binaries.points.geometry.attributes[name].array);
    const nowAlphas=nowObjects.waves.mesh.geometry.attributes.aOpacity.array,oldAlphas=oldObjects.waves.mesh.geometry.attributes.aOpacity.array;
    for(let i=0;i<16;i++){
      for(let j=0;j<6;j++)near(nowAlphas[i*7+j],oldAlphas[i*6+j]);
      near(nowAlphas[i*7+6],0); // 扩大对象池只增加空槽，不改变可见DWD波前。
    }
  }
});

test('Fixed random streams independently control additional amplitudes, broad clustered frequencies and uniform phases',()=>{
  const additional=model.sources.slice(32);
  for(const [key,changed] of [['additionalFrequencySalt','frequency'],['additionalAmplitudeSalt','amplitude'],['additionalPhaseSalt','phase']]){
    const alternate=createForegroundModel({...p,[key]:p[key]+1});
    assert.deepEqual(alternate.sources.slice(0,32),model.sources.slice(0,32));
    assert.notDeepEqual(alternate.sources.slice(32).map(s=>s[changed]),additional.map(s=>s[changed]));
    for(const field of ['frequency','amplitude','phase','center','m1','m2','separation'])if(field!==changed)
      assert.deepEqual(alternate.sources.slice(32).map(s=>s[field]),additional.map(s=>s[field]));
  }
  const sources=model.sources,amplitudes=sources.map(s=>s.amplitude),frequencies=sources.map(s=>s.frequency),bins=[0,0,0,0];
  const categoryCounts=sources.reduce((counts,s)=>(counts[s.category]++,counts),{weak:0,medium:0,strong:0});
  assert.ok(categoryCounts.weak>sources.length*.5&&categoryCounts.medium>sources.length*.2&&categoryCounts.strong<sources.length*.2);
  assert.equal(new Set(amplitudes).size,48);assert.ok(Math.max(...amplitudes)/Math.min(...amplitudes)>10);
  assert.ok(Math.max(...frequencies)/Math.min(...frequencies)>3&&new Set(frequencies).size>=15);
  assert.ok(Math.max(...additional.map(s=>s.frequency))>Math.max(...sources.slice(0,32).map(s=>s.frequency)));
  const unique=[...new Set(frequencies)].sort((a,b)=>a-b),gaps=unique.slice(1).map((f,i)=>Number((f-unique[i]).toFixed(8)));
  assert.ok(new Set(gaps).size>1); // 聚簇非均匀采样，不是等间隔排频。
  let real=0,imaginary=0;
  for(const s of sources){bins[Math.floor(s.phase/(Math.PI/2))]++;real+=Math.cos(s.phase);imaginary+=Math.sin(s.phase);}
  assert.ok(bins.every(n=>n>=6&&n<=20)&&Math.hypot(real,imaginary)/sources.length<.25);
  const frozen=JSON.stringify(model.sources);
  for(let t=0;t<28;t+=.15)model.state(t);
  assert.equal(JSON.stringify(model.sources),frozen);
});

test('All forty-eight drawn components enter the gold sum at every sample without smoothing or per-source normalization',()=>{
  let current=[],paths=[];
  const ctx={setTransform(){},clearRect(){},save(){},restore(){},beginPath(){current=[];},moveTo(x,y){current.push([x,y]);},lineTo(x,y){current.push([x,y]);},
    stroke(){paths.push(current.slice());},measureText(t){return {width:t.length*6};},fillRect(){},fillText(){}};
  const panel=createWaveformPanel({getContext:()=>ctx,dataset:{}},model,v),width=664,height=498;
  panel.resize(width,height,1.5);
  for(const t of [0,3.5,7,13.99]){
    paths=[];panel.draw(model.state(t));assert.equal(paths.length,49);
    for(let j=0;j<=v.waveformSamples;j++){
      const componentSum=paths.slice(0,-1).reduce((sum,path)=>sum+(height*v.componentCenterY-path[j][1])/(height*v.componentHeight/(2*model.maximumAmplitude)),0);
      const goldStrain=(height*v.sumCenterY-paths.at(-1)[j][1])/(height*v.sumHeight/(2*model.sumDisplayBound));
      near(componentSum,goldStrain,1e-10);
    }
  }
  for(const bad of [{additionalPhaseSalt:NaN},{additionalFrequencyWeights:[.3,.3,.3]},{additionalAmplitudeBands:[[-1,.1],[.1,.2],[.1,.2]]}])
    assert.throws(()=>createForegroundModel({...p,...bad}),RangeError);
});

test('Bulge outer glow contracts while center and body scale remain intact',async()=>{
  near(v.galaxyBulgeRadius,2.2*2/3);near(v.galaxyBulgeAspect,.72);near(v.galaxyBulgeCoreFraction,.5);near(v.galaxyBulgeCoreStrength,.85);
  near(v.galaxyBulgeBrightness,1);assert.ok(v.galaxyBulgeEdgeEnd<=1.2*.75+1e-9&&v.galaxyBulgeEnvelopeFalloff>3);
  const objects=await createForegroundScene(model,v,load);
  near(objects.galaxy.children[0].material.uniforms.uBulgeEnvelopeFalloff.value,v.galaxyBulgeEnvelopeFalloff);
  assert.ok(v.galaxyBulgeRadius*v.galaxyBulgeAspect*v.galaxyBulgeEdgeEnd>3.5*v.galaxyDiskThickness);
  near(v.galaxyStarBulgeHalfLength,1.7*2/3);near(v.galaxyStarBulgeHalfHeight,1.18*2/3);
  assert.ok(v.galaxyDiskHalfLength>7.4&&v.galaxyDiskScale>3.5&&v.galaxyStarDiskHalfLength>6.85);
  for(const s of model.sources.slice(0,p.numVisibleSystems).filter(s=>s.population==='bulge')){
    const up=p.projectionUpY*s.center[1]+p.projectionUpZ*s.center[2];
    assert.ok(Math.hypot(s.center[0]/v.galaxyBulgeRadius,up/(v.galaxyBulgeRadius*v.galaxyBulgeAspect))<v.galaxyBulgeEdgeEnd);
  }
});
