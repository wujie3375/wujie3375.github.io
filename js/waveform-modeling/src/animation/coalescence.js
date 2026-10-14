export const clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const hermite=(x,a,b,da,db,duration)=>(2*x**3-3*x*x+1)*a+(x**3-2*x*x+x)*duration*da+(-2*x**3+3*x*x)*b+(x**3-x*x)*duration*db;

export function createCoalescenceModel(p) {
  if(!(p.massLarge>p.massSmall&&p.massSmall>0&&0<p.blendStart&&p.inspiralEnd<p.blendStart&&p.blendStart<p.mergerPeak&&
    p.mergerPeak<p.signalEnd&&p.signalEnd<=p.fadeOutStart&&p.fadeOutStart<p.fadeOutEnd&&p.fadeOutEnd<=p.cycleSeconds))
    throw new RangeError('Invalid coalescence masses or timing order');
  if(!(0<p.frequencyStart&&p.frequencyStart<p.frequencyBridge&&p.frequencyBridge<p.frequencyPeak&&p.frequencyRingdown>0&&
    p.ringdownDecay>0&&p.ringdownShoulder>0&&p.ringdownFrequencyDecay>0&&
    p.ringdownEndFade>0&&p.ringdownEndFade<p.signalEnd-p.mergerPeak&&p.phaseSamples>=128&&Number.isInteger(p.phaseSamples)&&
    p.fadeInSeconds>0&&p.fadeInSeconds<p.inspiralEnd&&p.initialSeparation>0&&p.amplitudeBridge>0&&p.amplitudeBridge<1))
    throw new RangeError('Invalid waveform frequencies or sampling');
  const tau=p.inspiralEnd/(1-(p.frequencyStart/p.frequencyBridge)**(8/3));
  const frequencySlope=3*p.frequencyBridge/(8*(tau-p.inspiralEnd));
  const amplitudeSlope=p.amplitudeBridge*(2/3)*frequencySlope/p.frequencyBridge;
  const transition=p.mergerPeak-p.inspiralEnd;
  if(frequencySlope*transition>3*(p.frequencyPeak-p.frequencyBridge)||amplitudeSlope*transition>3*(1-p.amplitudeBridge))
    throw new RangeError('Transition is too long for monotonic C1 frequency/amplitude matching');
  function frequency(t) {
    t=Math.max(0,t);
    if(t<=p.inspiralEnd) return p.frequencyStart*(1-t/tau)**(-3/8);
    if(t<p.mergerPeak) return hermite((t-p.inspiralEnd)/transition,p.frequencyBridge,p.frequencyPeak,frequencySlope,0,transition);
    const x=(t-p.mergerPeak)/p.ringdownFrequencyDecay;
    return p.frequencyRingdown+(p.frequencyPeak-p.frequencyRingdown)*(1+x)*Math.exp(-x);
  }
  function amplitude(t) {
    if(t<=p.inspiralEnd) return p.amplitudeBridge*(frequency(t)/p.frequencyBridge)**(2/3);
    if(t<p.mergerPeak) return hermite((t-p.inspiralEnd)/transition,p.amplitudeBridge,1,amplitudeSlope,0,transition);
    const x=t-p.mergerPeak;
    // 同一源包络供 waveform、剪影振荡、halo 和新发射强度使用；末端平滑归零，不冻结微小残余。
    return Math.exp(-x*x/(p.ringdownDecay*(x+p.ringdownShoulder)))*
      (1-smooth((t-(p.signalEnd-p.ringdownEndFade))/p.ringdownEndFade));
  }
  const dt=p.signalEnd/p.phaseSamples;
  const phases=new Float64Array(p.phaseSamples+1);
  for(let j=1;j<phases.length;j++) {
    const a=(j-1)*dt,b=j*dt;
    phases[j]=phases[j-1]+2*Math.PI*dt*(frequency(a)+4*frequency((a+b)/2)+frequency(b))/6;
  }
  function phase(t) {
    const index=Math.max(0,Math.min(p.phaseSamples,t/dt));
    const lo=Math.min(p.phaseSamples-1,Math.floor(index));
    return hermite(index-lo,phases[lo],phases[lo+1],2*Math.PI*frequency(lo*dt),2*Math.PI*frequency((lo+1)*dt),dt);
  }
  const phaseAtPeak=phase(p.mergerPeak);
  const evaluate=t=>{t=Math.max(0,Math.min(p.signalEnd,t));const a=amplitude(t),angle=phase(t)-phaseAtPeak;
    return {time:t,amplitude:a,frequency:frequency(t),phase:angle,strain:a*Math.cos(angle)};};
  const bridgeSeparation=p.initialSeparation*(p.frequencyStart/p.frequencyBridge)**(2/3);
  const separationSlope=-2*bridgeSeparation*frequencySlope/(3*p.frequencyBridge);
  function state(seconds) {
    const t=((seconds%p.cycleSeconds)+p.cycleSeconds)%p.cycleSeconds;
    const signal=evaluate(t);
    const merger=clamp((t-p.blendStart)/(p.mergerPeak-p.blendStart));
    let separation=0;
    if(t<=p.inspiralEnd) separation=p.initialSeparation*(p.frequencyStart/signal.frequency)**(2/3);
    else if(t<p.mergerPeak) separation=Math.max(0,hermite((t-p.inspiralEnd)/transition,bridgeSeparation,0,separationSlope,0,transition));
    const angle=signal.phase/2;
    const relative=[separation*Math.cos(angle),separation*Math.sin(angle),0];
    const total=p.massLarge+p.massSmall;
    const positions=[relative.map(q=>-p.massSmall/total*q),relative.map(q=>p.massLarge/total*q)];
    const opacity=smooth(t/p.fadeInSeconds)*(1-smooth((t-p.fadeOutStart)/(p.fadeOutEnd-p.fadeOutStart)));
    return {t,signal,positions,separation,blend:smooth(merger),opacity,
      reveal:Math.min(t,p.signalEnd)/p.signalEnd,
      stage:t<p.inspiralEnd?'inspiral':t<p.mergerPeak?'merger':'ringdown'};
  }
  return {evaluate,state,frequency,amplitude,parameters:p};
}
