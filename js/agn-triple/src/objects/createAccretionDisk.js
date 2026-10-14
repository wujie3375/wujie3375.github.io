import * as THREE from '../../../vendor/three/three.module.js';
import {loadShader} from '../../../shader-loader.js';

const shader=name=>loadShader('agn-triple',name);
export async function createAccretionDisk(v) {
  const [vertexShader,fragmentShader]=await Promise.all([shader('accretionDisk.vert'),shader('accretionDisk.frag')]);
  const group=new THREE.Group();
  const materials=[];
  const geometry=new THREE.PlaneGeometry(v.diskOuterRadius*2.1,v.diskOuterRadius*2.1);
  // 三个薄层提供有限厚度。所有层均软化边界，不存在可见的椭圆贴片边缘。
  for(const [j,z] of [-v.diskThickness,0,v.diskThickness].entries()) {
    const material=new THREE.ShaderMaterial({
      vertexShader,fragmentShader,
      uniforms:{uInner:{value:v.diskInnerRadius},uOuter:{value:v.diskOuterRadius},uTime:{value:0},
        uLoopDuration:{value:v.totalDuration*v.diskRotationSpeed*v.diskLayerSpeeds[j]},
        uLoopBlend:{value:v.diskLoopBlendSeconds*v.diskRotationSpeed*v.diskLayerSpeeds[j]},
        uAzimuthalStrength:{value:v.diskAzimuthalVariationStrength},
        uAzimuthalColorStrength:{value:v.diskAzimuthalColorStrength},
        uAzimuthalAlphaStrength:{value:v.diskAzimuthalAlphaStrength},
        uAzimuthalScale:{value:v.diskAzimuthalVariationScale},
        uAzimuthalSecondaryWeight:{value:v.diskAzimuthalSecondaryWeight},
        uFlowArcStrength:{value:v.diskFlowArcStrength},
        uFlowArcSharpness:{value:v.diskFlowArcSharpness},uFlowAlphaStrength:{value:v.diskFlowAlphaStrength},
        uFlowArcRadialStart:{value:v.diskFlowArcRadialStart},uFlowArcRadialEnd:{value:v.diskFlowArcRadialEnd},
        uRotationMin:{value:v.diskRotationMin},uRotationMax:{value:v.diskRotationMax},
        uLayerPhase:{value:v.diskLayerPhases[j]},uCoreBoost:{value:v.diskCoreBoost},uCoreWidth:{value:v.diskCoreWidth},
        uBrightness:{value:v.diskBrightness},uOpacity:{value:v.diskLayerOpacities[j]},
        uShearPower:{value:v.diskShearPower},uSpiralArms:{value:v.diskSpiralArms},
        uRadialPower:{value:v.diskRadialPower},uEdgeFadeStart:{value:v.diskEdgeFadeStart},
        uEmissionFloor:{value:v.diskEmissionFloor},uEmissionRadial:{value:v.diskEmissionRadial},
        uAlphaFloor:{value:v.diskAlphaFloor},uAlphaRadial:{value:v.diskAlphaRadial},
        uInnerColor:{value:new THREE.Vector3(...v.diskInnerColor)},uMiddleColor:{value:new THREE.Vector3(...v.diskMiddleColor)},
        uOuterColor:{value:new THREE.Vector3(...v.diskOuterColor)}},
      transparent:true,depthWrite:false,side:THREE.DoubleSide
    });
    const mesh=new THREE.Mesh(geometry,material);
    mesh.position.z=z;
    group.add(mesh);
    materials.push(material);
  }
  return {group,update:seconds=>materials.forEach((m,j)=>{
    m.uniforms.uTime.value=((seconds%v.totalDuration)+v.totalDuration)%v.totalDuration*v.diskRotationSpeed*v.diskLayerSpeeds[j];
  })};
}
