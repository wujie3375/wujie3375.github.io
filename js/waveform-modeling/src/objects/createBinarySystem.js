import * as THREE from '../../../vendor/three/three.module.js';
import {createBlackHole} from '../../../agn-triple/src/objects/createBlackHole.js';
import {createGWWavefronts} from '../../../agn-triple/src/effects/createGWWavefronts.js';
import {createGWSource} from '../animation/gwSource.js';

function prepareAppearance(object) {
  const bindings=[];
  object.traverse(child=>{
    if(!child.material) return;
    const material=child.material;
    if(material.isMeshBasicMaterial) material.transparent=true;
    bindings.push({material,strength:material.uniforms?.uStrength?.value});
  });
  return (opacity,boost,solidOpacity=opacity)=>{
    object.visible=opacity>0.002;
    bindings.forEach(({material,strength})=>{
      if(strength!==undefined) material.uniforms.uStrength.value=strength*opacity*boost;
      else {material.opacity=solidOpacity;material.depthWrite=solidOpacity>0.98;}
    });
  };
}
export async function createBinarySystem(v,appearance,model,shaderLoader) {
  if(!(Number.isFinite(v.gwRingdownFadeTime)&&v.gwRingdownFadeTime>0&&Number.isFinite(v.gwRingdownFadeDelay)&&v.gwRingdownFadeDelay>=0&&
    v.gwRingdownBrightnessFloor>=0&&v.gwRingdownBrightnessFloor<1))throw new RangeError('Invalid ringdown visibility damping');
  const scene=new THREE.Scene();scene.background=new THREE.Color(v.backgroundColor);
  const binary=new THREE.Group();
  const bodies=[v.largeRadius,v.smallRadius].map(radius=>createBlackHole(radius,appearance,'binary'));
  bodies.forEach(body=>binary.add(body));
  const final=createBlackHole(v.finalRadius,appearance,'central');
  const fadeBodies=bodies.map(prepareAppearance),fadeFinal=prepareAppearance(final);
  scene.add(binary,final);
  const radiation=await createGWWavefronts(model.parameters,v,shaderLoader,
    createGWSource(model,model.parameters,v),0);
  scene.add(radiation.group); // scene 根层，非 binary 或 final 的子对象。
  const haze=new THREE.Mesh(new THREE.PlaneGeometry(v.hazeSize,v.hazeSize),new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,
    uniforms:{uColor:{value:new THREE.Vector3(...v.hazeColor)},uAlpha:{value:0}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 uColor;uniform float uAlpha;varying vec2 vUv;
      void main(){float r=length(vUv-0.5)*2.0;float a=exp(-r*r*5.0)*(1.0-smoothstep(0.7,1.0,r))*uAlpha;
        gl_FragColor=vec4(uColor,a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  }));
  haze.userData.billboard=true;scene.add(haze);
  // 并合余波复用同一软体积投影，而不是另一套平面水波圆环。
  // 关闭持续辐射时仍可单独显示并合余波，不依赖一个不存在的池成员。
  const template=radiation.group.children[0]||(await createGWWavefronts(model.parameters,
    {...v,gwEnabled:true,gwMaxVisibleFronts:1},shaderLoader,createGWSource(model,model.parameters,v),0)).group.children[0];
  const ripple=new THREE.Mesh(template.geometry,template.material.clone());
  ripple.material.uniforms.uColor.value.set(...v.rippleColor);
  ripple.material.uniforms.uAlpha.value=0;
  ripple.material.uniforms.uAxis.value.set(0,0,1);
  if(!v.gwEnabled)template.material.dispose();
  ripple.renderOrder=v.gwRenderOrder;scene.add(ripple);
  const starPositions=new Float32Array(v.starCount*3);
  const starsGeometry=new THREE.BufferGeometry();starsGeometry.setAttribute('position',new THREE.BufferAttribute(starPositions,3));
  const stars=new THREE.Points(starsGeometry,new THREE.PointsMaterial({color:v.starColor,size:v.starSize,
    sizeAttenuation:false,transparent:true,opacity:v.starOpacity,depthWrite:false}));
  stars.frustumCulled=false;stars.renderOrder=4;stars.userData.staticBackground=true;scene.add(stars);
  const right=new THREE.Vector3(),up=new THREE.Vector3(),direction=new THREE.Vector3(),point=new THREE.Vector3();
  const billboards=[];scene.traverse(object=>{if(object.userData.billboard) billboards.push(object);});
  return {scene,bodies,final,fadeBodies,fadeFinal,haze,ripple,radiation,billboards,stars,
    layoutStars(camera){
      direction.copy(camera.position).normalize();right.crossVectors(new THREE.Vector3(0,0,1),direction).normalize();up.crossVectors(direction,right);
      let seed=v.starSeed>>>0;
      const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      let count=0;
      for(let attempt=0;attempt<2000&&count<v.starCount;attempt++) {
        const sx=0.5+(random()-0.5)*v.starFieldInset,sy=0.5+(random()-0.5)*v.starFieldInset;
        const x=camera.left+sx*(camera.right-camera.left),y=camera.top-sy*(camera.top-camera.bottom);
        if(Math.hypot(x,y)<v.starCoreExclusion)continue;
        if(sx>v.waveformLeft-v.starWaveformPadding&&sx<v.waveformRight+v.starWaveformPadding&&
          Math.abs(sy-v.waveformCenterY)<v.waveformHeight/2+v.starWaveformPadding)continue;
        point.copy(direction).multiplyScalar(-v.starDistance).addScaledVector(right,x).addScaledVector(up,y);
        point.toArray(starPositions,count++*3);
      }
      starsGeometry.setDrawRange(0,count);
      starsGeometry.attributes.position.needsUpdate=true;
    }
  };
}
