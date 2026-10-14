uniform vec3 uColor;
uniform float uBrightness,uAspect;
uniform float uCoreFraction,uCoreStrength,uEnvelopeStrength,uEnvelopePower;
uniform float uRadius,uDustStrength,uDustWidth,uDustOffset,uDustRoughness;
varying vec2 vUv;
void main(){
  vec2 q=(vUv-0.5)*2.0;q.y/=uAspect;
  float r=length(q),edge=1.0-smoothstep(0.72,1.0,r);
  float core=1.0/(1.0+pow(r/uCoreFraction,2.0));
  float envelope=pow(1.0+r*r*4.0,-uEnvelopePower);
  float density=(uCoreStrength*core+uEnvelopeStrength*envelope)*edge;
  if(density<0.001)discard;
  float x=q.x*uRadius,y=q.y*uAspect*uRadius;
  float dustCenter=uDustOffset+uDustRoughness*(sin(x*1.8)+0.35*sin(x*5.3));
  float dustWidth=uDustWidth*(1.0+0.25*sin(x*0.9+0.3)+0.10*sin(x*2.3));
  float dustDepth=uDustStrength*(0.82+0.18*sin(x*0.65+0.7));
  float dust=1.0-dustDepth*exp(-pow((y-dustCenter)/dustWidth,2.0));
  gl_FragColor=vec4(uColor*uBrightness*(0.52+0.48*core)*dust,density*dust);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
