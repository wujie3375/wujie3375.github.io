uniform vec3 uCold,uWarm;
uniform float uCoreFalloff,uHaloFalloff,uCoreStrength,uHaloStrength;
uniform float uOutlineRadius,uOutlineWidth;
varying float vBrightness,vTemperature,vContrast;
void main(){
  float r=length(gl_PointCoord-0.5)*2.0;
  float core=exp(-r*r*uCoreFalloff),halo=exp(-r*r*uHaloFalloff);
  float alpha=min(0.98,(uCoreStrength*core+uHaloStrength*halo)*vBrightness*(1.0-smoothstep(0.72,1.0,r)));
  vec3 color=mix(uCold,uWarm,vTemperature)*(0.75+1.5*core);
  // 银心背景上加很窄的暗轮廓，不用大面积提高曝光或扩大光晕。
  float outline=vContrast*exp(-pow((r-uOutlineRadius)/uOutlineWidth,2.0));
  color=mix(color,vec3(0.055,0.075,0.10),outline);
  alpha=max(alpha,outline*0.75*(1.0-smoothstep(0.72,1.0,r)));
  gl_FragColor=vec4(color,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
