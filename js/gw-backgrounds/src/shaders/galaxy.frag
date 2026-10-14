uniform float uHalfLength,uThickness,uShoulder,uOuterThickness,uBrightness,uDiskScale,uDiskOpacity,uEdgeFade;
uniform float uHaloRadius,uHaloHeight,uHaloStrength,uHaloFalloff;
uniform float uDustStrength,uDustWidth,uDustOffset,uScreenHeight;
uniform float uDensityVariation,uDensityScale;
uniform float uBulgeRadius,uBulgeAspect,uBulgeBrightness,uBulgeCoreFraction;
uniform float uBulgeCoreStrength,uBulgeEnvelopeStrength,uBulgeEnvelopePower,uBulgeEnvelopeFalloff;
uniform vec2 uScreenFade,uBulgeEdge;
uniform vec3 uWarm,uCool,uHaloColor,uBulgeColor;
varying vec2 vGalaxy;
// sech²垂直恒星密度：平滑中线、有限宽度；不是一条额外叠加的发光线。
float verticalProfile(float height,float scale){
  float e=exp(-abs(height)/scale),e2=e*e;
  return 4.0*e2/pow(1.0+e2,2.0);
}
void main(){
  float x=abs(vGalaxy.x),y=vGalaxy.y; // 中线始终y=0，无翘曲或局部位移。
  // B：水平薄盘，独立的径向与窄垂向恒星密度项。
  float diskEdge=1.0-smoothstep(uHalfLength*uEdgeFade,uHalfLength,x);
  float radial=exp(-x/uDiskScale);
  float thickness=uThickness*(uOuterThickness+(1.0-uOuterThickness)*exp(-pow(x/(uDiskScale*0.90),2.0)));
  float thin=verticalProfile(y,thickness);
  float shoulder=uShoulder*verticalProfile(y,thickness*2.1);
  float variation=1.0+uDensityVariation*cos(vGalaxy.x*uDensityScale);
  float diskDensity=radial*(thin+shoulder)*diskEdge*variation;
  // A：独立椭球核球项；上下厚度由自身恒星分布定义，不由halo或盘面glow定义。
  float bulgeR=length(vec2(x/uBulgeRadius,y/(uBulgeRadius*uBulgeAspect)));
  // 紧凑中心和快速变淡的包络：减去幂律长尾白雾，显出核球与薄盘的尺度差异。
  float core=exp(-bulgeR/uBulgeCoreFraction);
  float envelope=exp(-uBulgeEnvelopeFalloff*pow(bulgeR,uBulgeEnvelopePower));
  float bulgeEdge=1.0-smoothstep(uBulgeEdge.x,uBulgeEdge.y,bulgeR);
  float bulgeDensity=(uBulgeCoreStrength*core+uBulgeEnvelopeStrength*envelope)*bulgeEdge;
  float density=diskDensity+bulgeDensity;
  vec3 diskColor=mix(uCool,uWarm,exp(-x/(uDiskScale*0.70)))*uBrightness*(0.65+0.35*radial);
  vec3 bulgeColor=uBulgeColor*uBulgeBrightness*(0.72+0.28*core);
  vec3 stellarColor=(diskColor*diskDensity+bulgeColor*bulgeDensity)/max(density,0.00001);
  // C：单一水平、细软尘带；不重复衰减alpha，不劈开球核。
  float dustWidth=max(uDustWidth,fwidth(y)*0.8);
  float dust=1.0-uDustStrength*exp(-pow((y-uDustOffset)/dustWidth,2.0));
  float diskAlpha=uDiskOpacity*(1.0-exp(-2.0*density));
  vec3 stellarRadiance=stellarColor*dust;
  float haloEdge=1.0-smoothstep(uHaloRadius*0.82,uHaloRadius,x);
  float haloAlpha=uHaloStrength*exp(-pow(x/(uHaloRadius*0.72),uHaloFalloff)-pow(abs(y)/uHaloHeight,uHaloFalloff))*haloEdge;
  float alpha=diskAlpha+haloAlpha*(1.0-diskAlpha);
  vec3 radiance=(stellarRadiance*diskAlpha+uHaloColor*haloAlpha*(1.0-diskAlpha))/max(alpha,0.00001);
  float screenY=1.0-gl_FragCoord.y/uScreenHeight;
  alpha*=1.0-smoothstep(uScreenFade.x,uScreenFade.y,screenY);
  if(alpha<0.0002)discard;
  gl_FragColor=vec4(radiance,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
