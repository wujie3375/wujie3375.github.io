import {smooth} from './coalescence.js';

export function updateBinarySystem(objects,state,p,v) {
  const boost=1+v.mergerHaloBoost*state.signal.amplitude;
  objects.bodies.forEach((body,j)=>{
    body.position.set(...state.positions[j]);
    // 同一对象整体形变：黑色本体与贴边 halo 一起沿双星轴拉伸，不修改轨道位置。
    const deformation=v.mergerShapeDeformationStrength*
      smooth((state.t-(p.mergerPeak-v.mergerShapeDeformationDuration))/v.mergerShapeDeformationDuration);
    body.rotation.z=state.signal.phase/2;
    body.scale.set(1+deformation,1/(1+deformation),1);
    objects.fadeBodies[j]((1-state.blend)**2*state.opacity,boost,(1-state.blend)*state.opacity);
  });
  // 最终剪影保持深黑；用尺寸增长完成融合，避免透明黑球变成灰色发光球。
  objects.fadeFinal(state.blend*state.opacity,boost,state.opacity);
  const q=state.blend*v.ringdownDistortion*state.signal.amplitude*
    Math.cos(state.signal.phase);
  const scale=Math.max(0.001,Math.sqrt(state.blend));
  objects.final.scale.set(scale*(1+q),scale*(1-q),scale);
  objects.haze.material.uniforms.uAlpha.value=v.hazeOpacity*state.opacity*(1+state.signal.amplitude);
  const age=state.t-p.mergerPeak;
  objects.ripple.visible=age>=-v.rippleRiseSeconds&&age<=v.rippleDuration;
  if(objects.ripple.visible) {
    objects.ripple.scale.setScalar(v.rippleStartRadius+v.ripplePropagationSpeed*(age+v.rippleRiseSeconds));
    const attack=smooth((age+v.rippleRiseSeconds)/v.rippleRiseSeconds);
    objects.ripple.material.uniforms.uAlpha.value=v.rippleStrength*attack*state.signal.amplitude*state.opacity*v.gwGlobalBrightnessScale;
  }else objects.ripple.material.uniforms.uAlpha.value=0;
  objects.radiation.update(state.t);
  // 源形变/并合光晕使用当前包络，已发出的波则保留发射时的包络并继续外传。
  // 只限制叠层总亮度；额外峰后显示阻尼保留弱残影，不把已发出的波半径缩回。
  const total=objects.radiation.fronts.reduce((sum,front)=>sum+front.opacity,0);
  const budget=v.gwAlpha*v.gwBrightnessAmplitudeGain;
  const gain=total>0?Math.min(v.gwBrightnessAmplitudeGain,budget/total):0;
  const dampingAge=Math.max(0,age-v.gwRingdownFadeDelay);
  const ringdownVisibility=v.gwRingdownBrightnessFloor+(1-v.gwRingdownBrightnessFloor)*Math.exp(-dampingAge/v.gwRingdownFadeTime);
  objects.radiation.setOpacity(state.opacity*gain*v.gwGlobalBrightnessScale*ringdownVisibility);
  objects.radiation.setCentralRadius(v.finalRadius*Math.sqrt(state.blend));
  objects.ripple.material.uniforms.uCentralRadius.value=v.finalRadius*Math.sqrt(state.blend);
}
