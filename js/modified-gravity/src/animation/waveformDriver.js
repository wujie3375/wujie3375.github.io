const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};

export function createWaveformDriver(p){
  if(!(p.cycleSeconds>=13&&p.cycleSeconds<=15&&p.signalEnd>0&&p.signalEnd<=p.fadeOutStart&&
    p.fadeOutStart<p.fadeOutEnd&&p.fadeOutEnd<=p.cycleSeconds&&p.fadeInSeconds>0&&p.fadeInSeconds<p.signalEnd&&
    p.grWaveFrequency>0&&p.grWaveAmplitude>0&&p.modifiedExtraAmplitude>=0&&p.modifiedExtraAmplitude<=0.65*p.grWaveAmplitude&&
    Number.isFinite(p.grWavePhase)&&Number.isFinite(p.modifiedExtraPhase)&&
    Math.abs(p.modifiedExtraFrequency*2-p.grWaveFrequency)<1e-12))
    throw new RangeError('Invalid single-frequency comparison configuration');
  function evaluate(seconds){
    if(!Number.isFinite(seconds))throw new RangeError('Waveform time must be finite');
    const t=Math.max(0,seconds); // 单频本身持续存在；signalEnd 仅限制画出的时间窗，不让上方主频提前停住。
    const phase=p.grWavePhase+2*Math.PI*p.grWaveFrequency*t;
    const extraPhase=0.5*phase+p.modifiedExtraPhase; // 共用 theta，包含主相位原点；不是独立从 t=0 定义第二个相位。
    const strain=p.grWaveAmplitude*Math.cos(phase),extra=p.modifiedExtraAmplitude*Math.cos(extraPhase);
    return {time:t,gr:{phase,frequency:p.grWaveFrequency,amplitude:p.grWaveAmplitude,strain},
      modified:{basePhase:phase,extraPhase,extraFrequency:p.modifiedExtraFrequency,extra,strain:strain+extra}};
  }
  function state(seconds){
    if(!Number.isFinite(seconds))throw new RangeError('Playback time must be finite');
    const t=((seconds%p.cycleSeconds)+p.cycleSeconds)%p.cycleSeconds,signal=evaluate(t);
    const opacity=smooth(t/p.fadeInSeconds)*(1-smooth((t-p.fadeOutStart)/(p.fadeOutEnd-p.fadeOutStart)));
    return {t,signal,phase:signal.gr.phase,frequency:signal.gr.frequency,
      oscillation:Math.cos(signal.gr.phase),opacity,reveal:Math.min(t,p.signalEnd)/p.signalEnd};
  }
  return {parameters:p,evaluate,state};
}
