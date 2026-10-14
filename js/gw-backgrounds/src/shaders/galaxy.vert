varying vec2 vGalaxy;
void main(){vGalaxy=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
