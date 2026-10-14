attribute float aOpacity;
varying vec2 vRadius;
varying float vOpacity;
void main(){
  vRadius=position.xy;vOpacity=aOpacity;
  gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);
}
