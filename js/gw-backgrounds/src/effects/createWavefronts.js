import * as THREE from '../../../vendor/three/three.module.js';
export async function createWavefronts(model,v,load){
  if(!(Number.isFinite(v.wavefrontStrengthFloor)&&v.wavefrontStrengthFloor>=0&&v.wavefrontStrengthFloor<=1&&
    Number.isFinite(v.wavefrontStrengthPower)&&v.wavefrontStrengthPower>0&&
    Number.isFinite(v.wavefrontRecentBoost)&&v.wavefrontRecentBoost>=0&&v.wavefrontRecentFalloff>0&&
    v.wavefrontOtherScale>0&&v.wavefrontOtherScale<=1&&v.wavefrontWeakScale>0&&v.wavefrontWeakScale<=1))throw new RangeError('Invalid wavefront display strength');
  const [vertexShader,fragmentShader]=await Promise.all([load('wavefront.vert'),load('wavefront.frag')]);
  const count=model.parameters.numVisibleSystems*model.parameters.maxFrontsPerSource;
  const alphas=new Float32Array(count),geometry=new THREE.PlaneGeometry(2,2);
  geometry.setAttribute('aOpacity',new THREE.InstancedBufferAttribute(alphas,1).setUsage(THREE.DynamicDrawUsage));
  const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,transparent:true,depthWrite:false,
    uniforms:{uColor:{value:new THREE.Vector3(...v.wavefrontColor)},uPeak:{value:v.wavefrontPeak},
      uThickness:{value:v.wavefrontThickness},uVolume:{value:v.wavefrontVolumeStrength},uGlow:{value:v.wavefrontGlow},
      uScreenHeight:{value:720},uTopHeight:{value:v.topSectionHeight}}});
  const mesh=new THREE.InstancedMesh(geometry,material,count);mesh.name='Projected spherical GW shells';
  mesh.userData.propagationGeometry='spherical-shell-projection';
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.renderOrder=2;
  const position=new THREE.Vector3(),scale=new THREE.Vector3(),matrix=new THREE.Matrix4();
  let visibleFronts=0;
  return {mesh,get visibleFronts(){return visibleFronts;},update(state,camera){
    let index=0;visibleFronts=0;
    state.systems.slice(0,model.parameters.numVisibleSystems).forEach(({source,fronts})=>{
      // 只提升光效的最低可见度；不改变 source.amplitude 或下方真实线性叠加。
      const strength=v.wavefrontStrengthFloor+(1-v.wavefrontStrengthFloor)*(source.amplitude/model.maximumAmplitude)**v.wavefrontStrengthPower;
      const weak=source.category==='weak'&&source.amplitude<v.weakDwarfAmplitudeMax;
      const emphasis=v.featuredSourceIds.includes(source.id)?1:v.wavefrontOtherScale*(weak?v.wavefrontWeakScale:1);
      for(let j=0;j<model.parameters.maxFrontsPerSource;j++,index++){
        const front=fronts[j],radius=front?.radius||0;
        position.set(...source.center);scale.setScalar(Math.max(radius,0.00001));
        // R=c_visual*age 是三维球壳半径；朝向相机的软圆是球壳轮廓投影，和轨道平面无关。
        matrix.compose(position,camera.quaternion,scale);mesh.setMatrixAt(index,matrix);
        const recentGain=front?1+v.wavefrontRecentBoost*Math.exp(-front.radius/(model.parameters.wavefrontMaxRadius*v.wavefrontRecentFalloff)):1;
        alphas[index]=front?v.wavefrontAlpha*strength*front.opacity*recentGain*emphasis:0;
        if(alphas[index]>0.0002)visibleFronts++;
      }
    });
    geometry.attributes.aOpacity.needsUpdate=true;mesh.instanceMatrix.needsUpdate=true;
  },resize(height){material.uniforms.uScreenHeight.value=height;}};
}
