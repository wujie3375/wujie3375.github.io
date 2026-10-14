attribute float aSize,aBrightness,aTemperature,aContrast;
uniform float uPixelRatio;
varying float vBrightness,vTemperature,vContrast;
void main(){
  vBrightness=aBrightness;vTemperature=aTemperature;vContrast=aContrast;
  gl_PointSize=aSize*uPixelRatio;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}
