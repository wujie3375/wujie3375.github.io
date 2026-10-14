uniform vec3 uColor;
uniform float uAlpha;
uniform float uGlow;
uniform float uWidth;
uniform float uShellPeak;
uniform float uEdgeFadeStart;
uniform float uVolumeStrength;
uniform float uFrontStrength;
uniform float uFrontPeak;
uniform float uFrontWidth;
uniform float uFrontVariation;
uniform float uPattern;
uniform float uPlanarProjection;
uniform float uDirectionStrength;
uniform vec3 uAxis;
uniform vec3 uViewWorld;
uniform float uCentralRadius;
uniform float uScreenHeight;
uniform vec2 uScreenFade;
varying vec3 vShell;
varying vec3 vNormalView;
varying vec3 vWorld;
void main() {
  // 只为构图保留中央剪影，不是 GR 射线遮挡计算。
  if(length(vWorld-uViewWorld*dot(vWorld,uViewWorld))<uCentralRadius) discard;
  float facing=abs(normalize(vNormalView).z);
  float impact2=uPlanarProjection>0.5?dot(vShell.xy,vShell.xy):max(0.0,1.0-facing*facing);
  if(impact2>=1.0)discard;
  if(uPlanarProjection>0.5)facing=sqrt(1.0-impact2);
  float impact=sqrt(impact2),column=0.0;
  // 八点积分近似软球形密度的视线厚度。不绘制轮廓线、经线或双面球壳。
  // 球面只是不可见的支持几何，密度在到达几何边界之前已平滑消失。
  for(int j=0;j<8;j++){
    float z=(-1.0+2.0*(float(j)+0.5)/8.0)*facing;
    float rho=sqrt(impact2+z*z);
    column+=exp(-pow((rho-uShellPeak)/uWidth,2.0));
  }
  column*=2.0*facing/8.0;
  column*=1.0-smoothstep(uEdgeFadeStart,1.0,impact);
  // 在原三维软体积之外叠加有限厚度亮波前。峰值位于支持球内部，不显示网格边界。
  float angle=uPlanarProjection>0.5?atan(vShell.y,vShell.x):atan(vNormalView.y,vNormalView.x);
  float width=uFrontWidth*(1.0+uFrontVariation*cos(2.0*angle+uPattern));
  float front=exp(-pow((impact-uFrontPeak)/width,2.0));
  front*=1.0-smoothstep(0.94,1.0,impact);
  front*=0.82+0.18*cos(2.0*angle+uPattern);
  float direction=1.0-uDirectionStrength+uDirectionStrength*0.5*(1.0+pow(dot(vShell,uAxis),2.0));
  float screenY=1.0-gl_FragCoord.y/uScreenHeight;
  float alpha=uAlpha*direction*(uVolumeStrength*column+uFrontStrength*front)
    *(1.0-smoothstep(uScreenFade.x,uScreenFade.y,screenY));
  if(alpha<0.0002)discard;
  alpha=min(alpha,0.98); // 仅保护最强的局部软亮边，不允许 alpha 大于 1 造成不合理叠加。
  gl_FragColor=vec4(uColor*(1.0+uGlow*(column+front)),alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
