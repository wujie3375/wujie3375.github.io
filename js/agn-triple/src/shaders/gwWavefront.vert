varying vec3 vShell;
varying vec3 vNormalView;
varying vec3 vWorld;
void main() {
  vShell=position; // 单位球或 [-1,1] 盘面坐标；平面不能归一化顶点，否则椭圆半径会被误缩。
  vNormalView=normalize(normalMatrix*normal);
  vWorld=(modelMatrix*vec4(position,1.0)).xyz;
  gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.0);
}
