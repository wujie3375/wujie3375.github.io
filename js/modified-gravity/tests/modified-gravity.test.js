import test from 'node:test';
import assert from 'node:assert/strict';
import {model as p,visual as v} from '../src/config/params.js';
import {createWaveformDriver} from '../src/animation/waveformDriver.js';
import {polarizationModes as modes,deformPoint,ringPoint,modeStrain} from '../src/polarizations/polarizationModes.js';
import {createWaveformPanel} from '../src/panels/waveformPanel.js';
import {createPolarizationPanels} from '../src/panels/polarizationPanels.js';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`),driver=createWaveformDriver(p);

test('Exactly six normalized symmetric orthogonal polarization bases in the requested order',()=>{
  assert.deepEqual(modes.map(m=>m.symbol),['+','x','b','×','y','l']);
  assert.equal(v.panelGridCols,3);assert.equal(v.panelGridRows,2);
  for(let a=0;a<6;a++)for(let b=0;b<6;b++){
    let product=0;for(let j=0;j<3;j++)for(let k=0;k<3;k++){
      near(modes[a].tensor[j][k],modes[a].tensor[k][j]);product+=modes[a].tensor[j][k]*modes[b].tensor[j][k];
    }near(product,a===b?2:0);
  }
});
test('Transverse, longitudinal and vector shears are represented in their proper planes',()=>{
  const lookup=id=>modes.find(m=>m.id===id),eps=0.1;
  assert.deepEqual(ringPoint(lookup('plus'),0,eps),[1+eps,0]);
  near(ringPoint(lookup('plus'),Math.PI/2,eps)[1],1-eps);
  for(const angle of [0,0.7,1.3])near(Math.hypot(...ringPoint(lookup('breathing'),angle,eps)),1+eps);
  const longitudinal=deformPoint(lookup('longitudinal'),[1,2,3],eps);
  near(longitudinal[0],1);near(longitudinal[1],2);near(longitudinal[2],3*(1+Math.SQRT2*eps));
  assert.deepEqual(deformPoint(lookup('vector-x'),[0,0,1],eps),[eps,0,1]);
  assert.deepEqual(deformPoint(lookup('vector-y'),[0,0,1],eps),[0,eps,1]);
  assert.deepEqual(lookup('longitudinal').axes,[0,2]);
  near(ringPoint(lookup('vector-x'),Math.PI/2,eps)[0],eps);
  near(ringPoint(lookup('vector-y'),Math.PI/2,eps)[0],-eps); // 镜像侧视约定，不伪造相位差。
});
test('GR is monochromatic and modified is exactly GR plus one component of twice the period',()=>{
  const period=1/p.grWaveFrequency;
  near(p.modifiedExtraFrequency,p.grWaveFrequency/2);
  for(let time=0.05;time<p.signalEnd-2*period;time+=0.03){
    const signal=driver.evaluate(time),one=driver.evaluate(time+period),two=driver.evaluate(time+2*period);
    near(signal.gr.frequency,p.grWaveFrequency);near(signal.gr.amplitude,p.grWaveAmplitude);
    near(one.gr.strain,signal.gr.strain);near(two.modified.strain,signal.modified.strain);
    near(signal.modified.strain-signal.gr.strain,p.modifiedExtraAmplitude*Math.cos(signal.modified.extraPhase));
    near(one.modified.extra,-signal.modified.extra);
    const dt=1e-5,dphase=(driver.evaluate(time+dt).gr.phase-driver.evaluate(time-dt).gr.phase)/(2*dt);
    near(dphase,2*Math.PI*p.grWaveFrequency,1e-7);
  }
});
test('All six modes share only the GR primary frequency, independent of the extra waveform component',()=>{
  const baseline=createWaveformDriver({...p,modifiedExtraAmplitude:0});
  for(let time=0;time<=p.signalEnd;time+=0.02){
    const state=driver.state(time),signal=driver.evaluate(time);
    near(state.phase,signal.gr.phase);near(state.oscillation,Math.cos(signal.gr.phase));
    near(state.phase,baseline.state(time).phase);near(state.oscillation,baseline.state(time).oscillation);
    assert.ok(Math.abs(signal.modified.strain-signal.gr.strain)<=p.modifiedExtraAmplitude+1e-8);
    for(const mode of modes)assert.ok(Math.abs(modeStrain(mode,state,v))<=0.261);
  }
  const dt=0.001,t=p.signalEnd+0.1;
  near((driver.state(t+dt).phase-driver.state(t-dt).phase)/(2*dt),2*Math.PI*p.grWaveFrequency,1e-8);
});
test('Tensor-vector-scalar grouping and all side-view axis signs form consistent right-handed frames',()=>{
  assert.deepEqual(v.columnLabels,['Tensor','Vector','Scalar']);
  for(let column=0;column<3;column++){
    assert.equal(modes[column].family,v.columnFamilies[column]);
    assert.equal(modes[column+3].family,v.columnFamilies[column]);
  }
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  for(const mode of modes){
    const right=[0,0,0],up=[0,0,0];right[mode.axes[0]]=mode.horizontalSign;up[mode.axes[1]]=1;
    const normal=cross(right,up);assert.equal(normal[mode.outAxis]>0,mode.outTowards);
  }
});
test('Fourteen-second reset is neutral and hidden, with periodic driver states',()=>{
  const first=driver.state(0),end=driver.state(p.cycleSeconds-0.001),repeat=driver.state(p.cycleSeconds);
  near(first.opacity,0);near(end.opacity,0);assert.deepEqual(first,repeat);
  for(const mode of modes)near(modeStrain(mode,end,v),0);
  for(const time of [0.8,5,11.6]){
    const a=driver.state(time),b=driver.state(time+p.cycleSeconds);
    near(a.phase,b.phase);near(a.reveal,b.reveal);
  }
});
test('Only GR and modified paths are stroked; neither plots beyond the shared reveal point',()=>{
  const paths=[];let points=[];
  const context={save(){},restore(){},beginPath(){points=[];},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);},stroke(){paths.push(points.slice());}};
  const panel=createWaveformPanel(driver,v);panel.resize(664,498);
  panel.draw(context,driver.state(0));assert.equal(paths.length,0);
  const state=driver.state(8);panel.draw(context,state);assert.equal(paths.length,2);
  const x=664*(v.waveformLeft+(v.waveformRight-v.waveformLeft)*state.reveal);
  paths.forEach(path=>{near(path.at(-1)[0],x);assert.ok(path.every(([q])=>q<=x+1e-8));});
  panel.draw(context,{...driver.state(p.signalEnd),reveal:1,opacity:1});
  assert.equal(paths.length,4);paths.slice(2).forEach(path=>near(path.at(-1)[0],664*v.waveformRight));
});
test('Desktop and mobile panels fit a three-by-two 4:3 layout without overlap',()=>{
  near(v.canvasWidth/v.canvasHeight,4/3);
  for(const width of [960,664,375,320]){
    const height=width*3/4,panels=createPolarizationPanels(v);panels.resize(width,height);
    assert.equal(panels.cells.length,6);
    panels.cells.forEach(c=>{
      assert.ok(c.cy+c.radius*v.axisLength<c.y+c.height);
      assert.ok(c.cx-c.radius*1.35>c.x&&c.cx+c.radius*1.35<c.x+c.width);
      assert.ok(c.y+c.height<height*v.waveformPanelTop);
    });
  }
});
test('Invalid timing and oversized deviations fail clearly',()=>{
  assert.throws(()=>createWaveformDriver({...p,grWaveFrequency:0.0}),RangeError);
  assert.throws(()=>createWaveformDriver({...p,modifiedExtraFrequency:p.grWaveFrequency}),RangeError);
});

test('Embedded axis fonts have genuine CSS-pixel minima and waveform contrast remains bounded',()=>{
  for(const width of [664,375,320]){
    const font=Math.max(v.minAxisLabelFontSize,v.axisLabelFontSize*width/v.canvasWidth);
    assert.ok(font>=16); // 不是提高画布分辨率后再由 CSS 缩小。
  }
  near(p.modifiedExtraAmplitude/p.grWaveAmplitude,0.60);
  assert.ok((p.grWaveAmplitude+p.modifiedExtraAmplitude)*v.waveformAmplitudeScale<1);
  assert.ok(v.waveformLineWidthGR>v.waveformLineWidthModified);
});

test('Eight-cycle comparison retains one cosine theta and the half-frequency phase convention',()=>{
  near(p.grWaveAmplitude,1);near(p.modifiedExtraPhase,0.74);
  near(p.grWaveFrequency*p.signalEnd,8);
  for(let j=0;j<=400;j++){
    const u=j/400,theta=2*Math.PI*8*u-4.96,s=driver.evaluate(u*p.signalEnd);
    near(s.gr.phase,theta);near(s.gr.strain,Math.cos(theta));
    near(s.modified.extraPhase,0.5*theta+0.74);
    near(s.modified.strain,Math.cos(theta)+0.60*Math.cos(0.5*theta+0.74));
  }
});

test('All nine requested amplitude/phase candidates produce smooth, alternating extrema without clipping',()=>{
  for(const amplitude of [0.50,0.56,0.60])for(const phase of [0.65,0.74,0.85]){
    const candidate=createWaveformDriver({...p,modifiedExtraAmplitude:amplitude,modifiedExtraPhase:phase});
    const samples=Array.from({length:6001},(_,j)=>candidate.evaluate(p.signalEnd*j/6000).modified.strain);
    const peaks=[],troughs=[];
    for(let j=1;j<samples.length-1;j++){
      assert.ok(Math.abs(samples[j])*v.waveformAmplitudeScale<1);
      if(samples[j]>samples[j-1]&&samples[j]>samples[j+1])peaks.push(samples[j]);
      if(samples[j]<samples[j-1]&&samples[j]<samples[j+1])troughs.push(samples[j]);
    }
    for(const extrema of [peaks,troughs]){
      assert.ok(extrema.length>=5);
      for(let j=1;j<extrema.length-1;j++)
        assert.ok((extrema[j]-extrema[j-1])*(extrema[j+1]-extrema[j])<0);
    }
  }
});

test('Static waveform layer draws only two legend swatches, no horizontal reference line',()=>{
  const paths=[],labels=[];let points=[];
  const ctx={save(){},restore(){},beginPath(){points=[];},moveTo(x,y){points.push([x,y]);},
    lineTo(x,y){points.push([x,y]);},stroke(){paths.push({points:points.slice(),width:this.lineWidth});},fillText(t){labels.push(t);}};
  const panel=createWaveformPanel(driver,v);panel.resize(664,498);panel.drawStatic(ctx);
  assert.deepEqual(labels,['GR','modified']);assert.equal(paths.length,2);
  assert.ok(paths.every(q=>q.points[1][0]-q.points[0][0]<20));
  near(paths[0].width,2.8);near(paths[1].width,2.0);
});

test('Group headers reserve descent-aware clearance; arrow heads and dashes stay visible on small widgets',()=>{
  for(const width of [960,664,375,320]){
    const panel=createPolarizationPanels(v);panel.resize(width,width*3/4);
    const labels=[],dashes=[];
    const ctx={save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},arc(){},roundRect(){},
      setLineDash(a){if(a.length)dashes.push(a);},measureText(t){return {width:t.length*8,actualBoundingBoxDescent:3};},
      fillText(t,x,y){labels.push({t,x,y});}};
    panel.drawStatic(ctx);
    for(let column=0;column<3;column++){
      const label=labels.find(l=>l.t===v.columnLabels[column]);
      assert.ok(label.y+3<=panel.cells[column].y-v.minGroupHeaderGap);
      assert.ok(label.y-12>42); // 不进入固定主标题区域。
    }
    assert.ok(dashes.every(a=>a[0]>=5&&a[1]>=3));
    assert.ok(Math.max(v.minAxisArrowSize,v.axisArrowSize*width/v.canvasWidth)>=6);
    assert.ok(Math.max(v.minCurveLineWidth,v.deformedCurveLineWidth*width/v.canvasWidth)>=2.2);
  }
  assert.equal(v.tensorColor,v.waveformColorGR);assert.equal(v.scalarColor,v.waveformColorModified);
});
test('Six-panel grid shifts slightly upward while waveform coordinates stay fixed',()=>{
  for(const width of [960,664,375,320]){
    const panels=createPolarizationPanels(v),previous=createPolarizationPanels({...v,panelGridTop:0.155,panelGridBottom:0.765,minGridTopPixels:84});
    panels.resize(width,width*3/4);previous.resize(width,width*3/4);
    panels.cells.forEach((cell,i)=>{
      assert.ok(cell.y<previous.cells[i].y&&previous.cells[i].y-cell.y<=12);
      assert.ok(cell.y+cell.height<=width*3/4*v.panelGridBottom+1e-9);
      near(cell.x,previous.cells[i].x);near(cell.width,previous.cells[i].width);
    });
  }
  near(v.waveformPanelTop,0.795);near(v.waveformCenterY,0.89);near(v.waveformPanelHeight,0.155);
});
