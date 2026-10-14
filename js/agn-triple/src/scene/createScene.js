import * as THREE from '../../../vendor/three/three.module.js';
import {createBlackHole} from '../objects/createBlackHole.js';
import {createAccretionDisk} from '../objects/createAccretionDisk.js';
import {createBBH} from '../objects/createBBH.js';
import {generateStarPositions} from './starMask.js';
import {createGWWavefronts} from '../effects/createGWWavefronts.js';

export async function createScene(p,v) {
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(v.backgroundColor);
  const central=createBlackHole(v.centralShadowRadius,v,'central');
  const disk=await createAccretionDisk(v),binary=createBBH(p,v),gw=await createGWWavefronts(p,v);
  scene.add(central,disk.group,binary.group,gw.group);
  const positions=new Float32Array(v.starCount*3),stars=new THREE.BufferGeometry();
  const attribute=new THREE.BufferAttribute(positions,3);stars.setAttribute('position',attribute);
  let seed=v.starSeed>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const appearance=new Float32Array(v.starCount*2);
  for(let j=0;j<v.starCount;j++) {
    appearance[j*2]=v.starSizeVariation[0]+random()*(v.starSizeVariation[1]-v.starSizeVariation[0]);
    appearance[j*2+1]=v.starBrightnessVariation[0]+random()*(v.starBrightnessVariation[1]-v.starBrightnessVariation[0]);
  }
  stars.setAttribute('aAppearance',new THREE.BufferAttribute(appearance,2));
  // 禁区在生成阶段静态剔除。无时间、GW 遮罩、闪烁或位置更新 uniform。
  const starMaterial=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,
    uniforms:{uColor:{value:new THREE.Color(v.starColor)},uSize:{value:v.starSize},uOpacity:{value:v.starOpacity}},
    vertexShader:`uniform float uSize;attribute vec2 aAppearance;varying float vBrightness;
      void main(){vBrightness=aAppearance.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
        gl_PointSize=uSize*aAppearance.x;}`,
    fragmentShader:`uniform vec3 uColor;uniform float uOpacity;varying float vBrightness;
      void main(){float soft=1.0-smoothstep(0.15,0.5,length(gl_PointCoord-0.5));
        gl_FragColor=vec4(uColor,uOpacity*soft*vBrightness);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const starPoints=new THREE.Points(stars,starMaterial);
  starPoints.frustumCulled=false;starPoints.renderOrder=4;starPoints.userData.staticBackground=true;
  scene.add(starPoints);
  let starCount=0;
  return {scene,disk,binary,gw,stars:starPoints,get starCount(){return starCount;},layoutStars(halfWidth,halfHeight){
    const generated=generateStarPositions(halfWidth,halfHeight,v);
    positions.set(generated.positions);starCount=generated.count;
    stars.setDrawRange(0,starCount);attribute.needsUpdate=true;
  },updateStars(_camera,pixelRatio){
    // 只在窗口尺寸变化时适配像素尺寸；动画播放不更新星点。
    starMaterial.uniforms.uSize.value=v.starSize*pixelRatio;
  }};
}
