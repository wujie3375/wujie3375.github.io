uniform float uInner;
uniform float uOuter;
uniform float uTime;
uniform float uLoopDuration;
uniform float uLoopBlend;
uniform float uAzimuthalStrength;
uniform float uAzimuthalColorStrength;
uniform float uAzimuthalAlphaStrength;
uniform float uAzimuthalScale;
uniform float uAzimuthalSecondaryWeight;
uniform float uFlowArcStrength;
uniform float uFlowArcSharpness;
uniform float uFlowAlphaStrength;
uniform float uFlowArcRadialStart;
uniform float uFlowArcRadialEnd;
uniform float uRotationMin;
uniform float uRotationMax;
uniform float uLayerPhase;
uniform float uCoreBoost;
uniform float uCoreWidth;
uniform float uBrightness;
uniform float uShearPower;
uniform float uSpiralArms;
uniform float uOpacity;
uniform float uRadialPower;
uniform float uEdgeFadeStart;
uniform float uEmissionFloor;
uniform float uEmissionRadial;
uniform float uAlphaFloor;
uniform float uAlphaRadial;
uniform vec3 uInnerColor;
uniform vec3 uMiddleColor;
uniform vec3 uOuterColor;
varying vec3 vDiskPosition;
varying vec3 vWorldPosition;

vec3 diskFlow(float r,float theta,float time){
  float omega=clamp(pow(max(r/uInner,1.0),-uShearPower),uRotationMin,uRotationMax);
  float shear=theta-time*omega;
  float broad=(1.0-uAzimuthalSecondaryWeight)*cos(shear+uAzimuthalScale*log(max(r/uInner,1.0))+0.20*uLayerPhase)
    +uAzimuthalSecondaryWeight*cos(2.0*shear-0.60*uAzimuthalScale*log(max(r/uInner,1.0))+0.20*uLayerPhase);
  // 两条连续、低频的软弧带：半径相关的角向相位随时间推进，不使用离散亮点或贴图平移。
  float radialPosition=clamp((r-uInner)/(uOuter-uInner),0.0,1.0);
  float arcWindow=smoothstep(0.0,uFlowArcRadialStart,radialPosition)*
    (1.0-smoothstep(uFlowArcRadialEnd,1.0,radialPosition));
  float arc=pow(0.5*(1.0+cos(uSpiralArms*(shear+uAzimuthalScale*log(max(r/uInner,1.0)))+uLayerPhase)),uFlowArcSharpness)*arcWindow;
  // B0(r) × (1 + epsilon F)：连续亮带为非负，不生成深褐色暗斑；不再使用随机噪声。
  return vec3(1.0+uAzimuthalStrength*broad+uFlowArcStrength*arc,broad,1.0+uFlowAlphaStrength*(arc-0.5*arcWindow));
}
void main() {
  float r=length(vDiskPosition.xy);
  float innerFade=smoothstep(uInner*0.95,uInner*1.17,r);
  float outerFade=1.0-smoothstep(uOuter*uEdgeFadeStart,uOuter,r);
  float mask=innerFade*outerFade;
  if(mask<0.002) discard;
  float theta=atan(vDiskPosition.y,vDiskPosition.x);
  float radial=pow(uInner/max(r,uInner),uRadialPower);
  // 连续低频扰动与差分旋转；没有离散亮斑或散布的黄色粒子。
  // 低频方位角结构差分流动；末段交叉淡化到下一周期，避免循环时贴图跳变。
  float blend=smoothstep(uLoopDuration-uLoopBlend,uLoopDuration,uTime);
  vec3 flow=mix(diskFlow(r,theta,uTime),diskFlow(r,theta,uTime-uLoopDuration),blend);
  vec3 color=mix(uOuterColor,uMiddleColor,smoothstep(0.05,0.55,radial));
  color=mix(color,uInnerColor,smoothstep(0.60,1.0,radial));
  vec3 sight=normalize(cameraPosition-vWorldPosition);
  vec3 tangent=vec3(-sin(theta),cos(theta),0.0);
  float gentleAsymmetry=1.0+0.12*dot(tangent,sight);
  float core=(r-uInner)/uCoreWidth;
  color*=vec3(1.0,1.0-0.25*uAzimuthalColorStrength*flow.y,1.0-uAzimuthalColorStrength*flow.y);
  color*=uBrightness*flow.x*gentleAsymmetry*(uEmissionFloor+uEmissionRadial*radial)*(1.0+uCoreBoost*exp(-core*core));
  float alpha=clamp(mask*uOpacity*(uAlphaFloor+uAlphaRadial*radial)*(1.0+uAzimuthalAlphaStrength*flow.y)*flow.z,0.0,0.94);
  gl_FragColor=vec4(color,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
