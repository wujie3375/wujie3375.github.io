// 共用同一 chirp 相位：inspiral 为 2φ_orb，并合后平滑接到 QNM 阻尼振铃。
// CBC 的质心固定，历史原点自然相同；绝不人为挪动原点伪造传播效果。
export function createGWSource(model,p,v) {
  return seconds=>{
    const state=model.state(Math.max(0,Math.min(p.signalEnd,seconds)));
    const signal=model.evaluate(seconds),total=p.massLarge+p.massSmall;
    const origin=state.positions[0].map((q,i)=>(p.massLarge*q+p.massSmall*state.positions[1][i])/total);
    const amplitude=signal.amplitude**v.gwAmplitudePower;
    return {phiInner:signal.phase/2,phiGW:signal.phase,origin,axis:[0,0,1],
      strength:seconds<p.mergerPeak?v.gwInspiralFloor+(1-v.gwInspiralFloor)*amplitude:amplitude};
  };
}
