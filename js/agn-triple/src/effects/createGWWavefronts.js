import * as THREE from '../../../vendor/three/three.module.js';
import {GWEmissionManager} from './GWEmissionManager.js';
import {loadShader as readShader} from '../../../shader-loader.js';

const loadShader=name=>readShader('agn-triple',name);
export async function createGWWavefronts(p,v,shaderLoader=loadShader,sourceSampler,emissionStart=-Infinity) {
  const group=new THREE.Group();group.name='GW historical world-space fronts';
  const manager=new GWEmissionManager(p,v,sourceSampler,emissionStart);
  const pool=[];const view=new THREE.Vector3();let fronts=[];
  if(v.gwEnabled) {
    const [vertexShader,fragmentShader]=await Promise.all([shaderLoader('gwWavefront.vert'),shaderLoader('gwWavefront.frag')]);
    const geometry=v.gwPlanarProjection?new THREE.PlaneGeometry(2,2):new THREE.SphereGeometry(1,v.gwSphereWidthSegments,v.gwSphereHeightSegments);
    for(let j=0;j<v.gwMaxVisibleFronts;j++) {
      const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,transparent:true,depthWrite:false,side:THREE.FrontSide,
        uniforms:{uColor:{value:new THREE.Vector3(...v.gwColor)},uAlpha:{value:0},uGlow:{value:v.gwGlowStrength},
          uWidth:{value:v.gwThickness},uShellPeak:{value:v.gwShellPeak},uEdgeFadeStart:{value:v.gwEdgeFadeStart},
          uVolumeStrength:{value:v.gwVolumeStrength},uFrontStrength:{value:v.gwFrontStrength},
          uFrontPeak:{value:v.gwFrontPeak},uFrontWidth:{value:v.gwFrontWidth},
          uFrontVariation:{value:v.gwFrontVariation},uPattern:{value:0},
          uPlanarProjection:{value:v.gwPlanarProjection?1:0},
          uDirectionStrength:{value:v.gwDirectionalStrength},uAxis:{value:new THREE.Vector3()},
          uViewWorld:{value:view},uCentralRadius:{value:v.centralShadowRadius||0},
          uScreenHeight:{value:1},uScreenFade:{value:v.gwScreenFade||[1,1.01]}}});
      const mesh=new THREE.Mesh(geometry,material);mesh.visible=false;mesh.renderOrder=v.gwRenderOrder;group.add(mesh);pool.push(mesh);
    }
  }
  return {group,manager,get fronts(){return fronts;},get phase(){return manager.phase;},update(seconds){
    fronts=manager.update(seconds);
    pool.forEach((mesh,j)=>{
      const front=fronts[j];mesh.visible=!!front&&front.opacity>0.0001;
      if(!front)return;
      // 此 group 始终在 scene 根层。只复制发射原点，不用当前 BBH 位置。
      mesh.position.set(...front.event.origin);mesh.scale.setScalar(Math.max(front.radius,0.00001));
      mesh.material.uniforms.uAlpha.value=front.opacity;mesh.material.uniforms.uAxis.value.set(...front.event.axis);
      mesh.material.uniforms.uGlow.value=v.gwGlowStrength*front.ageFade;
      mesh.material.uniforms.uFrontStrength.value=v.gwFrontStrength*front.ageFade**(v.gwFrontAgeFadePower??1);
      mesh.material.uniforms.uFrontWidth.value=v.gwFrontMaxWorldWidth>0?
        Math.min(v.gwFrontWidth,v.gwFrontMaxWorldWidth/Math.max(front.radius,0.00001)):v.gwFrontWidth;
      mesh.material.uniforms.uPattern.value=((front.event.index%6)+6)%6*Math.PI/3;
    });
  },setOpacity(factor){pool.forEach((mesh,j)=>{mesh.material.uniforms.uAlpha.value=(fronts[j]?.opacity||0)*factor;});},
  setCentralRadius(radius){pool.forEach(mesh=>{mesh.material.uniforms.uCentralRadius.value=radius;});},
  updateView(camera,screenHeight=1){view.copy(camera.position).normalize();
    pool.forEach(mesh=>{mesh.material.uniforms.uScreenHeight.value=screenHeight;});}};
}
