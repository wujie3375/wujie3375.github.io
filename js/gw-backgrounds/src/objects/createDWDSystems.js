import * as THREE from '../../../vendor/three/three.module.js';
export async function createDWDSystems(model,v,load){
  if(!(v.whiteDwarfCoreStrength>0&&v.whiteDwarfHaloStrength>=0&&v.whiteDwarfCoreFalloff>0&&v.whiteDwarfHaloFalloff>0&&v.weakDwarfAmplitudeMax>0))
    throw new RangeError('Invalid white dwarf display strength');
  if(!(v.featuredSourceIds.length>=4&&v.featuredSourceIds.length<=6&&new Set(v.featuredSourceIds).size===v.featuredSourceIds.length&&
    v.featuredSourceIds.every(i=>Number.isInteger(i)&&i>=0&&i<model.parameters.numVisibleSystems)&&
    v.featuredOrbitScale>0&&v.otherOrbitScale>0&&v.whiteDwarfOutlineWidth>0))throw new RangeError('Invalid featured DWD configuration');
  const [vertexShader,fragmentShader]=await Promise.all([load('whiteDwarf.vert'),load('whiteDwarf.frag')]);
  const count=2*model.parameters.numVisibleSystems,positions=new Float32Array(count*3),sizes=new Float32Array(count),brightness=new Float32Array(count),temperatures=new Float32Array(count),contrasts=new Float32Array(count);
  const displayScales=model.sources.slice(0,model.parameters.numVisibleSystems).map(s=>v.featuredSourceIds.includes(s.id)?v.featuredOrbitScale:v.otherOrbitScale);
  model.sources.slice(0,model.parameters.numVisibleSystems).forEach((s,j)=>{
    const strength=s.amplitude/model.maximumAmplitude;
    const featured=v.featuredSourceIds.includes(s.id),weak=!featured&&s.category==='weak'&&s.amplitude<v.weakDwarfAmplitudeMax;
    const sizeRange=featured?v.featuredDwarfSizeRange:weak?v.weakDwarfSizeRange:v.whiteDwarfSizeRange;
    const brightnessRange=featured?v.featuredDwarfBrightnessRange:weak?v.weakDwarfBrightnessRange:v.whiteDwarfBrightnessRange;
    for(let k=0;k<2;k++){
      sizes[2*j+k]=sizeRange[0]+strength*(sizeRange[1]-sizeRange[0]);
      brightness[2*j+k]=brightnessRange[0]+strength*(brightnessRange[1]-brightnessRange[0]);
      temperatures[2*j+k]=s.temperature;
      contrasts[2*j+k]=s.population==='bulge'?v.whiteDwarfCentralContrast:0;
      if(s.population==='bulge'){
        sizes[2*j+k]=Math.max(sizes[2*j+k],v.whiteDwarfBulgeSizeMin);
        brightness[2*j+k]=Math.max(brightness[2*j+k],v.whiteDwarfBulgeBrightnessFloor);
      }
    }
  });
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
  geometry.setAttribute('aBrightness',new THREE.BufferAttribute(brightness,1));
  geometry.setAttribute('aTemperature',new THREE.BufferAttribute(temperatures,1));
  geometry.setAttribute('aContrast',new THREE.BufferAttribute(contrasts,1));
  const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,transparent:true,depthWrite:false,
    uniforms:{uPixelRatio:{value:1},uCold:{value:new THREE.Vector3(...v.whiteDwarfColdColor)},
      uWarm:{value:new THREE.Vector3(...v.whiteDwarfWarmColor)},uCoreFalloff:{value:v.whiteDwarfCoreFalloff},uHaloFalloff:{value:v.whiteDwarfHaloFalloff},
      uCoreStrength:{value:v.whiteDwarfCoreStrength},uHaloStrength:{value:v.whiteDwarfHaloStrength},
      uOutlineRadius:{value:v.whiteDwarfOutlineRadius},uOutlineWidth:{value:v.whiteDwarfOutlineWidth}}});
  const points=new THREE.Points(geometry,material);points.name=model.parameters.numVisibleSystems+' fixed-barycenter DWD pairs';points.renderOrder=3;points.frustumCulled=false;
  return {points,displayScales:Object.freeze(displayScales),update(state,bases){
    state.systems.slice(0,model.parameters.numVisibleSystems).forEach(({source,positions:local},j)=>local.forEach(([x,y],k)=>{
      const base=(2*j+k)*3;
      for(let axis=0;axis<3;axis++)positions[base+axis]=source.center[axis]+displayScales[j]*(bases[j].u.getComponent(axis)*x+bases[j].v.getComponent(axis)*y);
    }));
    geometry.attributes.position.needsUpdate=true;
  },resize(pixelRatio){material.uniforms.uPixelRatio.value=pixelRatio;}};
}
