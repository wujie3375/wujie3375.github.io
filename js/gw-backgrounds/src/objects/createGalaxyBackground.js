import * as THREE from '../../../vendor/three/three.module.js';
export async function createGalaxyBackground(v,load){
  if(!(v.galaxyViewMode==='edge-on'&&v.galaxyDiskHalfLength>0&&v.galaxyDiskThickness>0&&v.galaxyDiskOuterThickness>0&&v.galaxyDiskOuterThickness<1&&
    v.galaxyHaloRadius>v.galaxyDiskHalfLength&&v.galaxyHaloHalfHeight>0&&v.galaxyHaloStrength>=0&&v.galaxyHaloStrength<0.3&&
    v.galaxyDarkLaneStrength>=0&&v.galaxyDarkLaneStrength<0.7&&v.galaxyDarkLaneWidth>0&&
    v.galaxyBulgeCoreFraction>0&&v.galaxyBulgeCoreFraction<1&&v.galaxyBulgeAspect>0&&
    v.galaxyBulgeEdgeStart>0&&v.galaxyBulgeEdgeEnd>v.galaxyBulgeEdgeStart&&v.galaxyBulgeEnvelopeFalloff>0))throw new RangeError('Invalid edge-on Galactic configuration');
  const [vertexShader,fragmentShader]=await Promise.all([load('galaxy.vert'),load('galaxy.frag')]);
  const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{uHalfLength:{value:v.galaxyDiskHalfLength},uThickness:{value:v.galaxyDiskThickness},uShoulder:{value:v.galaxyDiskShoulder},uOuterThickness:{value:v.galaxyDiskOuterThickness},
      uBrightness:{value:v.galaxyBrightness},uDiskScale:{value:v.galaxyDiskScale},uDiskOpacity:{value:v.galaxyDiskOpacity},uEdgeFade:{value:v.galaxyEdgeFade},
      uDensityVariation:{value:v.galaxyDensityVariationStrength},uDensityScale:{value:v.galaxyDensityVariationScale},
      uHaloRadius:{value:v.galaxyHaloRadius},uHaloHeight:{value:v.galaxyHaloHalfHeight},uHaloStrength:{value:v.galaxyHaloStrength},uHaloFalloff:{value:v.galaxyHaloFalloff},
      uHaloColor:{value:new THREE.Vector3(...v.galaxyHaloColor)},uWarm:{value:new THREE.Vector3(...v.galaxyWarmColor)},uCool:{value:new THREE.Vector3(...v.galaxyCoolColor)},
      uDustStrength:{value:v.galaxyDarkLaneStrength},uDustWidth:{value:v.galaxyDarkLaneWidth},uDustOffset:{value:v.galaxyDarkLaneOffset},
      uBulgeColor:{value:new THREE.Vector3(...v.galaxyBulgeColor)},uBulgeBrightness:{value:v.galaxyBulgeBrightness},
      uBulgeRadius:{value:v.galaxyBulgeRadius},uBulgeAspect:{value:v.galaxyBulgeAspect},uBulgeCoreFraction:{value:v.galaxyBulgeCoreFraction},
      uBulgeCoreStrength:{value:v.galaxyBulgeCoreStrength},uBulgeEnvelopeStrength:{value:v.galaxyBulgeEnvelopeStrength},uBulgeEnvelopePower:{value:v.galaxyBulgeEnvelopePower},
      uBulgeEdge:{value:new THREE.Vector2(v.galaxyBulgeEdgeStart,v.galaxyBulgeEdgeEnd)},
      uBulgeEnvelopeFalloff:{value:v.galaxyBulgeEnvelopeFalloff},
      uScreenHeight:{value:v.canvasHeight},uScreenFade:{value:new THREE.Vector2(...v.galaxyScreenFade)}}});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2*v.galaxyHaloRadius,6*v.galaxyHaloHalfHeight),material);
  // 波前(2)先绘制，再绘制银河积分亮度场，本体(3)最后绘制；不改波前传播逻辑。
  mesh.name='Static stylized Galactic disk';mesh.renderOrder=2.5;
  const group=new THREE.Group();group.name='Static edge-on Galactic disk and bulge';group.add(mesh);
  return group;
}
