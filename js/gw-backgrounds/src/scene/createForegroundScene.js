import * as THREE from '../../../vendor/three/three.module.js';
import {createGalaxyBackground} from '../objects/createGalaxyBackground.js?v=dwd-layers-20261014';
import {createDWDSystems} from '../objects/createDWDSystems.js?v=dwd-layers-20261014';
import {createWavefronts} from '../effects/createWavefronts.js?v=dwd-layers-20261014';
import {orbitalBasis} from '../objects/orbitalBasis.js';
import {loadShader as readShader} from '../../../shader-loader.js';

const loadShader=(name,revision)=>readShader('gw-backgrounds',name,revision);
// 在有界区间上积分概率密度再逆CDF采样；球核密度需乘R，避免漏掉面积Jacobian。
// 所有随机值只在确定性布局时产生，播放中不重新采样。
function inverseDensity(pdf,max,bins){
  const cdf=new Float64Array(bins+1),step=max/bins;
  for(let i=1;i<=bins;i++)cdf[i]=cdf[i-1]+(pdf((i-1)*step)+pdf(i*step))*step/2;
  const total=cdf[bins];
  if(!(total>0&&Number.isFinite(total)))throw new RangeError('Invalid stellar density');
  return u=>{
    const target=u*total;let lo=0,hi=bins;
    while(hi-lo>1){const mid=(lo+hi)>>1;if(cdf[mid]<target)lo=mid;else hi=mid;}
    return step*(lo+(target-cdf[lo])/(cdf[hi]-cdf[lo]||1));
  };
}
function softBoundary(value,max,fraction){
  const t=Math.max(0,Math.min(1,(value/max-(1-fraction))/fraction));
  return 1-t*t*(3-2*t);
}
export async function createForegroundScene(model,v,load=name=>loadShader(name,v.shaderRevision)){
  const scene=new THREE.Scene();scene.background=new THREE.Color(v.backgroundColor);
  const [galaxy,binaries,waves]=await Promise.all([createGalaxyBackground(v,load),createDWDSystems(model,v,load),createWavefronts(model,v,load)]);
  scene.add(galaxy,binaries.points,waves.mesh);
  const positions=new Float32Array(v.starfieldCount*3),geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const stars=new THREE.Points(geometry,new THREE.PointsMaterial({color:v.starfieldColor,size:v.starfieldSize,
    sizeAttenuation:false,transparent:true,opacity:v.starfieldOpacity,depthWrite:false}));
  stars.frustumCulled=false;stars.renderOrder=1;scene.add(stars);
  // 连续光背景与离散普通星群分开；三类星群共用一个Points批次。
  const stellarCount=v.galaxyStarBulgeCount+v.galaxyStarDiskCount+v.galaxyStarThickCount;
  if(!([v.galaxyStarBulgeCount,v.galaxyStarDiskCount,v.galaxyStarThickCount,v.galaxyStarSamplingBins].every(n=>Number.isInteger(n)&&n>0)&&
    v.galaxyStarBulgeHalfLength>0&&v.galaxyStarBulgeHalfHeight>0&&v.galaxyStarDiskHalfLength>0&&v.galaxyStarDiskHeight>0&&
    [v.galaxyStarBulgeSersicIndex,v.galaxyStarBulgeFalloff,v.galaxyStarBulgeMaxRadius,v.galaxyStarDiskRadialScale,
      v.galaxyStarDiskVerticalScale,v.galaxyStarThickRadialScale,v.galaxyStarThickVerticalScale,v.galaxyStarThickHalfHeight,v.galaxyStarAttributePower].every(n=>n>0&&Number.isFinite(n))&&
    v.galaxyStarWeakFraction>0&&v.galaxyStarBrightFraction>0&&v.galaxyStarWeakFraction+v.galaxyStarBrightFraction<1&&
    v.galaxyStarEdgeFadeFraction>0&&v.galaxyStarEdgeFadeFraction<1&&v.galaxyStarDiskVariationStrength>=0&&v.galaxyStarDiskVariationStrength<1&&
    v.galaxyStarDiskOuterThickness>0&&v.galaxyStarDiskOuterThickness<=1&&
    v.galaxyStarBulgeWeakFraction>0&&v.galaxyStarBulgeBrightFraction>0&&v.galaxyStarBulgeWeakFraction+v.galaxyStarBulgeBrightFraction<1&&
    [v.galaxyStarBulgeSizeScale,v.galaxyStarBulgeAlphaScale,v.galaxyStarBulgeAttributePower].every(n=>Number.isFinite(n)&&n>0)))throw new RangeError('Invalid Galactic star display');
  const boundary=(r,max)=>softBoundary(r,max,v.galaxyStarEdgeFadeFraction);
  const bulgeRadius=inverseDensity(r=>r*Math.exp(-v.galaxyStarBulgeFalloff*r**(1/v.galaxyStarBulgeSersicIndex))*boundary(r,v.galaxyStarBulgeMaxRadius),
    v.galaxyStarBulgeMaxRadius,v.galaxyStarSamplingBins);
  // 有符号x直接积分，因此微弱低频起伏可自然不对称，不移动水平盘面中线。
  const diskX=inverseDensity(s=>{const x=s-v.galaxyStarDiskHalfLength;
    return Math.exp(-Math.abs(x)/v.galaxyStarDiskRadialScale)*boundary(Math.abs(x),v.galaxyStarDiskHalfLength)*
      (1+v.galaxyStarDiskVariationStrength*Math.cos(v.galaxyStarDiskVariationScale*x+v.galaxyStarDiskVariationPhase));
  },2*v.galaxyStarDiskHalfLength,v.galaxyStarSamplingBins);
  const thickX=inverseDensity(s=>{const x=s-v.galaxyStarDiskHalfLength;
    return Math.exp(-Math.abs(x)/v.galaxyStarThickRadialScale)*boundary(Math.abs(x),v.galaxyStarDiskHalfLength);
  },2*v.galaxyStarDiskHalfLength,v.galaxyStarSamplingBins);
  const thickHeight=inverseDensity(y=>Math.exp(-y/v.galaxyStarThickVerticalScale)*boundary(y,v.galaxyStarThickHalfHeight),
    v.galaxyStarThickHalfHeight,v.galaxyStarSamplingBins);
  const stellarPositions=new Float32Array(stellarCount*3),stellarSizes=new Float32Array(stellarCount),stellarAlphas=new Float32Array(stellarCount),stellarWarmth=new Float32Array(stellarCount);
  const stellarGeometry=new THREE.BufferGeometry();
  stellarGeometry.setAttribute('position',new THREE.BufferAttribute(stellarPositions,3));
  stellarGeometry.setAttribute('aSize',new THREE.BufferAttribute(stellarSizes,1));
  stellarGeometry.setAttribute('aOpacity',new THREE.BufferAttribute(stellarAlphas,1));
  stellarGeometry.setAttribute('aWarmth',new THREE.BufferAttribute(stellarWarmth,1));
  const stellarMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
    uniforms:{uPixelRatio:{value:1},uGlow:{value:v.galaxyStarGlow},uWarm:{value:new THREE.Vector3(...v.galaxyStarWarmColor)},uCool:{value:new THREE.Vector3(...v.galaxyStarCoolColor)}},
    vertexShader:`attribute float aSize,aOpacity,aWarmth;
      uniform float uPixelRatio;
      varying float vOpacity,vWarmth;
      void main(){vOpacity=aOpacity;vWarmth=aWarmth;gl_PointSize=aSize*uPixelRatio;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 uWarm,uCool;uniform float uGlow;
      varying float vOpacity,vWarmth;
      void main(){float r=2.0*length(gl_PointCoord-0.5);
        float core=1.0-smoothstep(0.15,0.75,r),edge=1.0-smoothstep(0.75,1.0,r);
        float alpha=vOpacity*(core+uGlow*exp(-2.0*r*r))*edge;
        if(alpha<0.001)discard;
        gl_FragColor=vec4(mix(uCool,uWarm,vWarmth)*(1.0+uGlow*core),min(alpha,0.98));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  const stellarPoints=new THREE.Points(stellarGeometry,stellarMaterial);
  stellarPoints.name='Static bulge, thin-disk and thick-disk stellar populations';stellarPoints.frustumCulled=false;stellarPoints.renderOrder=2.75;scene.add(stellarPoints);
  const right=new THREE.Vector3(),up=new THREE.Vector3(),direction=new THREE.Vector3(),position=new THREE.Vector3();
  let bases=[];
  return {scene,galaxy,binaries,waves,stars,stellarPoints,right,up,get bases(){return bases;},layout(camera,pixelRatio,screenHeight=v.canvasHeight){
    galaxy.getObjectByName('Static stylized Galactic disk').material.uniforms.uScreenHeight.value=screenHeight;
    right.set(1,0,0).applyQuaternion(camera.quaternion);up.set(0,1,0).applyQuaternion(camera.quaternion);
    direction.copy(camera.position).normalize();
    bases=model.sources.slice(0,model.parameters.numVisibleSystems).map(s=>orbitalBasis(s,right,up,direction));
    // 银河shader表达沿视线积分后的edge-on外观；与真实三维源投影共用同一相机。
    galaxy.children.forEach(layer=>layer.quaternion.copy(camera.quaternion));
    let seed=v.starfieldSeed>>>0;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    // 跳过已移除的旧均匀盘点，使原天空背景9点保持原来的位置。
    for(let j=0;j<v.starfieldLegacyDiskCount*4;j++)random();
    for(let j=0;j<v.starfieldCount;j++){
        const sx=0.05+random()*0.9,sy=v.starfieldScreenYRange[0]+random()*(v.starfieldScreenYRange[1]-v.starfieldScreenYRange[0]);
        const x=camera.left+sx*(camera.right-camera.left),y=camera.top-sy*(camera.top-camera.bottom);
        position.copy(direction).multiplyScalar(-12).addScaledVector(right,x).addScaledVector(up,y);
      position.toArray(positions,j*3);
    }
    geometry.attributes.position.needsUpdate=true;
    stars.material.size=v.starfieldSize*pixelRatio;binaries.resize(pixelRatio);
    let stellarSeed=v.galaxyStarSeed>>>0;
    const stellarRandom=()=>{stellarSeed=(Math.imul(stellarSeed,1664525)+1013904223)>>>0;return stellarSeed/4294967296;};
    for(let j=0;j<stellarCount;j++){
      const bulge=j<v.galaxyStarBulgeCount;
      const thick=j>=v.galaxyStarBulgeCount+v.galaxyStarDiskCount;
      let x,py;
      if(bulge){
        // Sérsic风格投影密度，中心密、外围疏；软边避免出现散点云的硬椭圆边界。
        const r=bulgeRadius(stellarRandom()),angle=2*Math.PI*stellarRandom();
        x=v.galaxyStarBulgeHalfLength*r*Math.cos(angle);py=v.galaxyStarBulgeHalfHeight*r*Math.sin(angle);
      }else if(thick){
        x=thickX(stellarRandom())-v.galaxyStarDiskHalfLength;
        py=thickHeight(stellarRandom())*(stellarRandom()<0.5?-1:1);
      }else{
        x=diskX(stellarRandom())-v.galaxyStarDiskHalfLength;
        const h=v.galaxyStarDiskVerticalScale*(v.galaxyStarDiskOuterThickness+(1-v.galaxyStarDiskOuterThickness)*Math.exp(-((x/v.galaxyStarDiskRadialScale)**2)));
        // 截断sech²的解析逆CDF；上下对称，端部更薄，无几何中线弯曲。
        py=h*Math.atanh((2*stellarRandom()-1)*Math.tanh(v.galaxyStarDiskHeight/h));
      }
      position.copy(right).multiplyScalar(x).addScaledVector(up,py);position.toArray(stellarPositions,j*3);
      const tier=stellarRandom(),weak=tier<(bulge?v.galaxyStarBulgeWeakFraction:v.galaxyStarWeakFraction),bright=tier>1-(bulge?v.galaxyStarBulgeBrightFraction:v.galaxyStarBrightFraction);
      const size=weak?v.galaxyStarWeakSizeRange:bright?v.galaxyStarBrightSizeRange:v.galaxyStarMediumSizeRange;
      const alpha=weak?v.galaxyStarWeakAlphaRange:bright?v.galaxyStarBrightAlphaRange:v.galaxyStarMediumAlphaRange;
      const luminosity=stellarRandom()**(bulge?v.galaxyStarBulgeAttributePower:v.galaxyStarAttributePower);
      stellarSizes[j]=(size[0]+luminosity*(size[1]-size[0]))*(bulge?v.galaxyStarBulgeSizeScale:1);
      stellarAlphas[j]=(alpha[0]+luminosity*(alpha[1]-alpha[0]))*(bulge?v.galaxyStarBulgeAlphaScale:thick?v.galaxyStarThickAlphaScale:1);
      const warmth=stellarRandom()<v.galaxyStarCoolFraction?v.galaxyStarCoolWarmthRange:v.galaxyStarWarmthRange;
      stellarWarmth[j]=warmth[0]+stellarRandom()*(warmth[1]-warmth[0]);
    }
    for(const attribute of Object.values(stellarGeometry.attributes))attribute.needsUpdate=true;
    stellarMaterial.uniforms.uPixelRatio.value=pixelRatio;
  },update(state,camera){binaries.update(state,bases);waves.update(state,camera);}};
}
