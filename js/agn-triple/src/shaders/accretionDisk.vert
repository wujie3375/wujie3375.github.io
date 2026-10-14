varying vec3 vDiskPosition;
varying vec3 vWorldPosition;
void main() {
  vDiskPosition = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPosition = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
