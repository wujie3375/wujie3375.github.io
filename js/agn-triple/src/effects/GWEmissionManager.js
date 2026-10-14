import {TAU,wrapAngle} from '../physics/kepler.js';
import {playbackState,renderState} from '../animation/systemState.js';

// 只读取既有开普勒结果：E -> 真近点角，再按未包裹的 M 补回完整圈数。
export function sampleGWSource(seconds,p,v) {
  const state=playbackState(seconds,p,v);
  const E=state.inner.eccentricAnomaly;
  const innerTime=seconds*v.timeScaleInner;
  const mean=p.M0Inner+state.inner.meanMotion*innerTime; // 与原求解器保持相同浮点运算次序。
  const turns=Math.round((mean-wrapAngle(mean))/TAU);
  const anomaly=Math.atan2(Math.sqrt(1-p.eInner*p.eInner)*Math.sin(E),Math.cos(E)-p.eInner);
  const phiInner=turns*TAU+anomaly+p.omegaInner;
  const [r,u]=[state.inner.position,state.inner.velocity];
  const axis=[r[1]*u[2]-r[2]*u[1],r[2]*u[0]-r[0]*u[2],r[0]*u[1]-r[1]*u[0]];
  const length=Math.hypot(...axis);
  return {phiInner,phiGW:v.gwPhaseMultiplier*phiInner,
    origin:renderState(state,v).center,axis:axis.map(q=>q/length)};
}
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function maximumDisplayedSourceSpeed(p,v) {
  const mu=p.G*(p.M_smbh+p.m1+p.m2);
  return Math.sqrt(mu*(1+p.eOuter)/(p.aOuter*(1-p.eOuter)))*v.unitsPerAU*v.timeScaleOuter;
}
export function wavefrontMetricDistance(a,b,v){
  const delta=a.map((q,j)=>q-b[j]);
  if(!v.gwPlanarProjection)return Math.hypot(...delta);
  const n=Math.hypot(...v.cameraPosition),[x,y,z]=v.cameraPosition.map(q=>q/n),r=Math.hypot(x,y);
  const right=[-y/r,x/r,0],up=[-z*x/r,-z*y/r,r];
  const dot=(a,b)=>a.reduce((sum,q,j)=>sum+q*b[j],0);
  return Math.hypot(dot(delta,right),dot(delta,up)/Math.abs(z)); // 相同椭圆映射的逆度量。
}
export function maximumWavefrontMetricSpeed(p,v){
  if(!v.gwPlanarProjection)return maximumDisplayedSourceSpeed(p,v);
  const [x,y,z]=v.cameraPosition;
  return maximumDisplayedSourceSpeed(p,v)*(1+Math.abs(Math.sin(p.iOuter))*Math.hypot(x,y)/Math.abs(z));
}

export class GWEmissionManager {
  constructor(p,v,sourceSampler,emissionStart=-Infinity) {
    if(!(v.gwVisualSpeed>0&&v.gwEmissionPhaseStep>0&&v.gwPhaseMultiplier>0&&v.timeScaleInner>0&&
      Number.isInteger(v.gwMaxVisibleFronts)&&v.gwMaxVisibleFronts>=1&&v.gwMaxVisibleFronts<=24&&
      v.gwMaxRadius>0&&v.gwFadeInRadius>0&&v.gwFadeStart>=v.gwFadeInRadius&&v.gwFadeEnd>v.gwFadeStart&&
      v.gwFadeEnd<=v.gwMaxRadius&&v.gwPhaseRootIterations>=20&&
      v.gwFrontPeak>0&&v.gwFrontPeak<1&&v.gwFrontWidth>0&&v.gwFrontStrength>=0&&v.gwVolumeStrength>=0&&
      (v.gwAgeFadeRate===undefined||(Number.isFinite(v.gwAgeFadeRate)&&v.gwAgeFadeRate>=0))&&
      (v.gwAgeFadeDelay===undefined||(Number.isFinite(v.gwAgeFadeDelay)&&v.gwAgeFadeDelay>=0))))
      throw new RangeError('Invalid GW emission configuration');
    if(!sourceSampler&&v.gwEnabled&&v.gwFrontPeak*v.gwVisualSpeed<=maximumWavefrontMetricSpeed(p,v))
      throw new RangeError('Visible GW front must outrun the displayed barycenter; increase gwVisualSpeed');
    this.p=p;this.v=v;this.sample=sourceSampler||(seconds=>sampleGWSource(seconds,p,v));this.emissionStart=emissionStart;
    this.events=[];this.initialized=false;this.lastTime=0;this.phase=0;
    this.phaseOrigin=v.gwAlignEmissionStart&&Number.isFinite(emissionStart)?this.sample(emissionStart).phiGW:0;
    this.lifetime=v.gwMaxRadius/v.gwVisualSpeed;
  }
  update(now) {
    if(!Number.isFinite(now)) throw new RangeError('GW time must be finite');
    if(!this.v.gwEnabled){this.events=[];return [];}
    if(!this.initialized||now<this.lastTime||now-this.lastTime>2*this.lifetime) {
      // 首帧/时间跳跃只重建仍可见的过去，不枚举无限久以前的事件。
      this.events=[];this.lastTime=Math.max(now-this.lifetime,this.emissionStart);this.initialized=true;
      this.nextIndex=Math.floor((this.sample(this.lastTime).phiGW-this.phaseOrigin)/this.v.gwEmissionPhaseStep)+1;
      if(this.v.gwAlignEmissionStart&&this.lastTime===this.emissionStart)this.nextIndex=0;
    }
    const current=this.sample(now);
    this.phase=current.phiGW;
    // 即使把相位间隔调得极小，也只解算最终能保留的事件，避免大量无效发射。
    this.nextIndex=Math.max(this.nextIndex,Math.floor((this.phase-this.phaseOrigin)/this.v.gwEmissionPhaseStep)-this.v.gwMaxVisibleFronts+1);
    while(this.phaseOrigin+this.nextIndex*this.v.gwEmissionPhaseStep<=this.phase) {
      const phase=this.phaseOrigin+this.nextIndex*this.v.gwEmissionPhaseStep;
      let lo=this.lastTime,hi=now;
      // 相位过阈值的子帧时刻；不同帧率得到同一发射时间、同一历史原点。
      for(let j=0;j<this.v.gwPhaseRootIterations;j++) {
        const mid=(lo+hi)/2;
        if(this.sample(mid).phiGW<phase) lo=mid;else hi=mid;
      }
      const emitTime=(lo+hi)/2,source=this.sample(emitTime);
      this.events.push(Object.freeze({index:this.nextIndex,emitTime,phase,
        origin:Object.freeze(source.origin.slice()),axis:Object.freeze(source.axis.slice()),
        strength:source.strength??(1+this.v.gwPhaseStrengthVariation*Math.cos(phase))}));
      if(this.events.length>this.v.gwMaxVisibleFronts)this.events.shift();
      this.nextIndex++;
    }
    this.lastTime=now;
    this.events=this.events.filter(event=>now-event.emitTime<this.lifetime);
    return this.events.map(event=>{
      const age=Math.max(0,now-event.emitTime),radius=this.v.gwVisualSpeed*age;
      const fade=smooth(0,this.v.gwFadeInRadius,radius)*(1-smooth(this.v.gwFadeStart,this.v.gwFadeEnd,radius));
      const phaseFade=this.v.gwPhaseFadeEnd?1-smooth(this.v.gwPhaseFadeStart,this.v.gwPhaseFadeEnd,
        (this.phase-event.phase)/this.v.gwEmissionPhaseStep):1;
      // 可选的传播龄期阻尼只改变亮度，不改变历史原点、半径或存活范围。AGN 默认不启用。
      const ageFade=Math.exp(-(this.v.gwAgeFadeRate||0)*Math.max(0,age-(this.v.gwAgeFadeDelay||0)));
      const distanceFade=1/(1+this.v.gwAttenuation*radius**(this.v.gwAttenuationPower??2));
      return {event,age,radius,ageFade,opacity:this.v.gwAlpha*event.strength*fade*phaseFade*ageFade*distanceFade};
    });
  }
}
