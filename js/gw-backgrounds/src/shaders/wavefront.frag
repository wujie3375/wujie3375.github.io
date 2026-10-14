uniform vec3 uColor;
uniform float uPeak,uThickness,uVolume,uGlow,uScreenHeight,uTopHeight;
varying vec2 vRadius;
varying float vOpacity;
void main(){
  float screenY=1.0-gl_FragCoord.y/uScreenHeight;
  if(screenY>uTopHeight)discard;
  float r=length(vRadius);
  if(r>=1.0)discard;
  float edge=1.0-smoothstep(0.88,1.0,r);
  float front=exp(-pow((r-uPeak)/uThickness,2.0))*edge;
  float haze=exp(-pow((r-0.46)/0.32,2.0))*edge;
  float angular=0.94+0.06*cos(2.0*atan(vRadius.y,vRadius.x));
  float alpha=vOpacity*(front+uVolume*haze)*angular;
  if(alpha<0.0002)discard;
  gl_FragColor=vec4(uColor*(1.0+uGlow*front),alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
