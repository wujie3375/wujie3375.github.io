import {playbackState} from '../animation/systemState.js';
const TAU=2*Math.PI;
const hermite=(x,a,b,da,db,dt)=>(2*x**3-3*x*x+1)*a+(x**3-2*x*x+x)*dt*da+(-2*x**3+3*x*x)*b+(x**3-x*x)*dt*db;

export function createDopplerModel(p,v){
  if(!(v.lightSpeedAUPerYear>0&&v.dopplerModulationDepth>0&&v.dopplerModulationDepth<0.6&&
    v.dopplerSafetyMargin>1&&v.intrinsicChirpRate===0&&v.waveformPhaseSamples>=512&&v.waveformVisibleWindow>0))
    throw new RangeError('Invalid early-inspiral Doppler configuration');
  const raw=v.observerDirection||v.cameraPosition,length=Math.hypot(...raw);
  if(!(length>0&&raw.every(Number.isFinite)))throw new RangeError('Observer direction must be finite and nonzero');
  const N=Object.freeze(raw.map(q=>q/length));
  const lineOfSight=time=>playbackState(time,p,v).outer.velocity.reduce((sum,q,j)=>sum+q*N[j],0);
  let maxBeta=0;
  for(let j=0;j<=v.waveformPhaseSamples;j++)maxBeta=Math.max(maxBeta,Math.abs(lineOfSight(v.totalDuration*j/v.waveformPhaseSamples)/v.lightSpeedAUPerYear));
  // 真实速度为 AU/yr；这里不乘空间放大或播放倍率。增强因子仅用于下方波形。
  const dopplerVisualBoost=v.dopplerModulationDepth/(Math.max(maxBeta,1e-12)*v.dopplerSafetyMargin);
  const baseFrequency=Math.sqrt(p.G*(p.m1+p.m2)/p.aInner**3)*v.timeScaleInner/Math.PI;
  function frequency(time){
    const state=playbackState(time,p,v),r=state.inner.position,u=state.inner.velocity;
    const angularMomentum=Math.hypot(r[1]*u[2]-r[2]*u[1],r[2]*u[0]-r[0]*u[2],r[0]*u[1]-r[1]*u[0]);
    // f_GW = 2 * d(phi_inner)/dt / (2*pi)，与现有 BBH 及发波相位同源；低偏心率下近单频。
    const source=angularMomentum/(Math.hypot(...r)**2)*v.timeScaleInner/Math.PI*(1+v.intrinsicChirpRate*time/v.totalDuration);
    const vLOS=state.outer.velocity.reduce((sum,q,j)=>sum+q*N[j],0),beta=vLOS/v.lightSpeedAUPerYear;
    return {source,physicalObserved:source*(1+beta),observed:source*(1+dopplerVisualBoost*beta),vLOS,beta};
  }
  const count=v.waveformPhaseSamples,dt=v.totalDuration/count,phases=new Float64Array(count+1);
  const sourceF=new Float64Array(count+1),observedF=new Float64Array(count+1),betas=new Float64Array(count+1);
  for(let j=0;j<=count;j++){const f=frequency(j*dt);sourceF[j]=f.source;observedF[j]=f.observed;betas[j]=f.beta;}
  phases[0]=v.waveformPhase0;
  for(let j=1;j<=count;j++){
    const a=(j-1)*dt,b=j*dt;
    phases[j]=phases[j-1]+TAU*dt*(observedF[j-1]+4*frequency((a+b)/2).observed+observedF[j])/6;
  }
  const phaseAdvance=phases[count]-phases[0];
  function evaluate(seconds){
    if(!Number.isFinite(seconds))throw new RangeError('Doppler time must be finite');
    const cycle=Math.floor(seconds/v.totalDuration),t=seconds-cycle*v.totalDuration,index=t/dt,lo=Math.min(count-1,Math.floor(index)),x=index-lo;
    // 跨周期累积相位，而非在边界重置；缓存真实轨道样本，使滚动历史不必逐像素重解 Kepler。
    const phase=cycle*phaseAdvance+hermite(x,phases[lo],phases[lo+1],TAU*observedF[lo],TAU*observedF[lo+1],dt);
    const source=sourceF[lo]*(1-x)+sourceF[lo+1]*x,beta=betas[lo]*(1-x)+betas[lo+1]*x;
    const amplitude=v.waveformAmplitude*(source/baseFrequency)**(2/3);
    return {time:seconds,phase,amplitude,strain:amplitude*Math.cos(phase),source,beta,vLOS:beta*v.lightSpeedAUPerYear,
      physicalObserved:source*(1+beta),observed:source*(1+dopplerVisualBoost*beta)};
  }
  return {N,dopplerVisualBoost,maxBeta,baseFrequency,frequency,evaluate,state(seconds){
    const t=((seconds%v.totalDuration)+v.totalDuration)%v.totalDuration;
    return {t,displayTime:seconds,signal:evaluate(seconds),reveal:1,opacity:1};
  }};
}
