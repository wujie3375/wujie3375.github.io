const TAU=2*Math.PI;
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const modulo=(x,period)=>((x%period)+period)%period;
const randomStream=initial=>{let seed=initial>>>0;return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
const validWeights=w=>Array.isArray(w)&&w.length>0&&w.every(n=>n>0)&&Math.abs(w.reduce((sum,n)=>sum+n,0)-1)<1e-9;
function weightedIndex(weights,random){const pick=random();let sum=0;for(let j=0;j<weights.length;j++){sum+=weights[j];if(pick<sum)return j;}return weights.length-1;}

export function createForegroundModel(p){
  if(!(p.cycleSeconds>=13&&p.cycleSeconds<=15&&Number.isInteger(p.numVisibleSystems)&&p.numVisibleSystems>=8&&p.numVisibleSystems<=16&&
    Number.isInteger(p.numSignalSources)&&Number.isFinite(p.componentRandomSeed)&&
    p.numSignalSources>=p.numVisibleSystems&&p.numSignalSources<=48&&
    Number.isInteger(p.additionalSourceStart)&&p.additionalSourceStart>=p.numVisibleSystems&&p.additionalSourceStart<=p.numSignalSources&&
    p.existingGWCycleRange.length===2&&p.existingGWCycleRange.every(n=>Number.isInteger(n)&&n>0&&n%2===0)&&p.existingGWCycleRange[1]>p.existingGWCycleRange[0]&&
    p.additionalFrequencyCenters.length===p.additionalFrequencyWidths.length&&p.additionalFrequencyCenters.length===p.additionalFrequencyWeights.length&&
    p.additionalFrequencyCenters.every(Number.isFinite)&&p.additionalFrequencyWidths.every(n=>n>0)&&validWeights(p.additionalFrequencyWeights)&&
    p.additionalAmplitudeBands.length===3&&p.additionalAmplitudeBands.every(a=>a.length===2&&a[0]>0&&a[1]>=a[0])&&p.additionalAmplitudeWeights.length===3&&validWeights(p.additionalAmplitudeWeights)&&
    [p.additionalFrequencySalt,p.additionalAmplitudeSalt,p.additionalPhaseSalt].every(Number.isFinite)&&
    p.gwCycleRange.length===2&&p.gwCycleRange.every(n=>Number.isInteger(n)&&n>0&&n%2===0)&&p.gwCycleRange[1]>p.gwCycleRange[0]&&
    p.existingGWCycleRange[0]>=p.gwCycleRange[0]&&p.existingGWCycleRange[1]<=p.gwCycleRange[1]&&
    p.frequencyClusterCenters.length===p.frequencyClusterWidths.length&&p.frequencyClusterCenters.length===p.frequencyClusterWeights.length&&
    p.frequencyClusterWidths.every(w=>w>0)&&p.frequencyClusterWeights.every(w=>w>0)&&
    Math.abs(p.frequencyClusterWeights.reduce((sum,w)=>sum+w,0)-1)<1e-9&&
    p.amplitudeBands.length===3&&p.amplitudeBands.every(a=>a[0]>0&&a[1]>=a[0])&&
    p.amplitudeCategoryWeights.length===3&&p.amplitudeCategoryWeights.every(w=>w>0)&&
    Math.abs(p.amplitudeCategoryWeights.reduce((sum,w)=>sum+w,0)-1)<1e-9&&p.sumPeakSamples>=1024&&
    p.representativeSources.length>=5&&p.representativeSources.length<=p.numSignalSources&&
    new Set(p.representativeSources).size===p.representativeSources.length&&
    p.representativeSources.every(i=>Number.isInteger(i)&&i>=0&&i<p.numSignalSources)&&
    Number.isFinite(p.orientationSeed)&&p.orbitInclinationRange.length===2&&p.orbitInclinationRange.every(Number.isFinite)&&
    p.orbitInclinationRange[0]>=0&&p.orbitInclinationRange[1]<Math.PI/2&&p.orbitInclinationRange[1]>=p.orbitInclinationRange[0]&&
    p.orbitAzimuthRange.length===2&&p.orbitAzimuthRange.every(Number.isFinite)&&p.orbitAzimuthRange[1]>=p.orbitAzimuthRange[0]&&
    p.orbitSeparationRange[0]>0&&p.orbitSeparationRange[1]>=p.orbitSeparationRange[0]&&p.massRange[0]>0&&
    p.massRange[1]>=p.massRange[0]&&p.wavefrontExpansionSpeed>0&&p.wavefrontMaxRadius>0&&
    p.systemPositionDistribution==='edge-on-disk-bulge'&&p.positionHalfLength>0&&p.positionHalfDepth>0&&p.positionHeight>0&&
    p.positionElevatedHeight>=p.positionHeight&&p.positionElevatedFraction>=0&&p.positionElevatedFraction<0.5&&
    Number.isInteger(p.positionBulgeVisibleCount)&&p.positionBulgeVisibleCount>=0&&p.positionBulgeVisibleCount<=p.numVisibleSystems&&
    Number.isInteger(p.positionBulgeSignalCount)&&p.positionBulgeSignalCount>=p.positionBulgeVisibleCount&&
    p.positionBulgeSignalCount-p.positionBulgeVisibleCount<=p.numSignalSources-p.numVisibleSystems&&
    p.positionBulgeHalfLength>0&&p.positionBulgeHalfLength<p.positionHalfLength&&
    p.positionBulgeHalfHeight>p.positionBulgeMinHeight&&p.positionBulgeMinHeight>p.positionHeight&&
    p.wavefrontFadeIn>0&&p.wavefrontFadeIn<p.wavefrontFadeStart&&p.wavefrontFadeStart<1&&
    p.wavefrontDamping>=0&&p.maxFrontsPerSource>=Math.ceil(p.gwCycleRange[1]/p.cycleSeconds*p.wavefrontMaxRadius/p.wavefrontExpansionSpeed)))
    throw new RangeError('Invalid DWD foreground configuration');
  let seed=p.seed>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const centers=[],populations=[];
  for(let attempt=0;attempt<p.maxPositionAttempts&&centers.length<p.numSignalSources;attempt++){
    const i=centers.length;
    const inVisibleBulge=i<p.positionBulgeVisibleCount;
    const inHiddenBulge=i>=p.numVisibleSystems&&i<p.numVisibleSystems+p.positionBulgeSignalCount-p.positionBulgeVisibleCount;
    const bulge=inVisibleBulge||inHiddenBulge;
    const halfLength=bulge?p.positionBulgeHalfLength:p.positionHalfLength;
    const x=(2*random()-1)*halfLength,y=(2*random()-1)*p.positionHalfDepth;
    let z,projectedY;
    if(bulge){
      // 椭圆区域内分层抽样，编号交替上/下；逆投影为三维坐标，非每帧漂移。
      const bulgeIndex=inVisibleBulge?i:i-p.numVisibleSystems;
      projectedY=(bulgeIndex%2===0?1:-1)*(p.positionBulgeMinHeight+random()*(p.positionBulgeHalfHeight-p.positionBulgeMinHeight));
      if((x/p.positionBulgeHalfLength)**2+(projectedY/p.positionBulgeHalfHeight)**2>1)continue;
      z=(projectedY-p.projectionUpY*y)/p.projectionUpZ;
    }else{
      const height=random()<p.positionElevatedFraction?p.positionElevatedHeight:p.positionHeight;
      z=(random()+random()-1)*height;
      projectedY=p.projectionUpY*y+p.projectionUpZ*z;
    }
    const screenY=p.galaxyScreenY-projectedY/(2*p.cameraHalfHeight);
    if(screenY<p.sourceScreenYRange[0]||screenY>p.sourceScreenYRange[1])continue;
    const spacing=centers.length<p.numVisibleSystems?p.minimumProjectedSeparation:p.minimumProjectedSeparation*0.45;
    if(centers.some(c=>Math.hypot(x-c[0],projectedY-p.projectionUpY*c[1]-p.projectionUpZ*c[2])<spacing))continue;
    centers.push(Object.freeze([x,y,z]));
    populations.push(bulge?'bulge':'disk');
  }
  if(centers.length!==p.numSignalSources)throw new RangeError('Cannot fit source distribution; relax spacing/radius');
  seed=p.componentRandomSeed>>>0; // 信号种子与位置采样解耦，微调频率分布不会挪动质心。
  let amplitudeSeed=(p.componentRandomSeed^0x9e3779b9)>>>0;
  const amplitudeRandom=()=>{amplitudeSeed=(Math.imul(amplitudeSeed,1664525)+1013904223)>>>0;return amplitudeSeed/4294967296;};
  let geometrySeed=p.orientationSeed>>>0;
  const geometryRandom=()=>{geometrySeed=(Math.imul(geometrySeed,1664525)+1013904223)>>>0;return geometrySeed/4294967296;};
  const extraFrequencyRandom=randomStream(p.componentRandomSeed^p.additionalFrequencySalt);
  const extraAmplitudeRandom=randomStream(p.componentRandomSeed^p.additionalAmplitudeSalt);
  const extraPhaseRandom=randomStream(p.componentRandomSeed^p.additionalPhaseSalt);
  const sources=Object.freeze(centers.map((center,i)=>{
    const pick=random();let weight=0,cluster=p.frequencyClusterWeights.length-1;
    for(let j=0;j<p.frequencyClusterWeights.length;j++){weight+=p.frequencyClusterWeights[j];if(pick<weight){cluster=j;break;}}
    const drawn=p.frequencyClusterCenters[cluster]+(random()+random()-1)*p.frequencyClusterWidths[cluster];
    // 固定种子的非均匀聚簇随机频率，量化为偶整数谐波，确保两颗星及半频轨道首尾闭合。
    let cycles=Math.max(p.existingGWCycleRange[0],Math.min(p.existingGWCycleRange[1],2*Math.round(drawn/2)));
    // 强弱类别也随机抽样，不再按源编号固定分组；振幅/频率/相位均只在初始化采样。
    const amplitudePick=amplitudeRandom();let category=p.amplitudeCategoryWeights.length-1,amplitudeWeight=0;
    for(let j=0;j<p.amplitudeCategoryWeights.length;j++){amplitudeWeight+=p.amplitudeCategoryWeights[j];if(amplitudePick<amplitudeWeight){category=j;break;}}
    const band=p.amplitudeBands[category];
    // 原序列继续消耗相同的随机数，保证32个既有源/轨道参数前缀严格不变。
    const amplitude=Math.exp(Math.log(band[0])+random()*Math.log(band[1]/band[0])),phase=TAU*random();
    let extraAmplitude=amplitude,extraPhase=phase;
    if(i>=p.additionalSourceStart){
      const k=weightedIndex(p.additionalFrequencyWeights,extraFrequencyRandom);
      const sampled=p.additionalFrequencyCenters[k]+(extraFrequencyRandom()+extraFrequencyRandom()-1)*p.additionalFrequencyWidths[k];
      cycles=Math.max(p.gwCycleRange[0],Math.min(p.gwCycleRange[1],2*Math.round(sampled/2)));
      category=weightedIndex(p.additionalAmplitudeWeights,extraAmplitudeRandom);
      const extraBand=p.additionalAmplitudeBands[category];
      extraAmplitude=Math.exp(Math.log(extraBand[0])+extraAmplitudeRandom()*Math.log(extraBand[1]/extraBand[0]));
      extraPhase=TAU*extraPhaseRandom();
    }
    return Object.freeze({
    id:i,center,population:populations[i],category:['strong','medium','weak'][category],frequency:cycles/p.cycleSeconds,
    amplitude:extraAmplitude,phase:extraPhase,
    separation:p.orbitSeparationRange[0]+random()*(p.orbitSeparationRange[1]-p.orbitSeparationRange[0]),
    m1:p.massRange[0]+random()*(p.massRange[1]-p.massRange[0]),
    m2:p.massRange[0]+random()*(p.massRange[1]-p.massRange[0]),temperature:random(),
    inclination:p.orbitInclinationRange[0]+geometryRandom()*(p.orbitInclinationRange[1]-p.orbitInclinationRange[0]),
    azimuth:p.orbitAzimuthRange[0]+geometryRandom()*(p.orbitAzimuthRange[1]-p.orbitAzimuthRange[0])
  });}));
  const amplitudeBound=sources.reduce((sum,s)=>sum+s.amplitude,0),maximumAmplitude=Math.max(...sources.map(s=>s.amplitude));
  function signal(source,time){
    if(!Number.isFinite(time))throw new RangeError('Foreground time must be finite');
    const phase=TAU*source.frequency*time+source.phase;
    return {phase,strain:source.amplitude*Math.cos(phase),frequency:source.frequency,amplitude:source.amplitude};
  }
  function wavefronts(source,time){
    if(!p.wavefrontEnabled)return [];
    const interval=1/source.frequency;
    const latestAge=modulo(time+source.phase/(TAU*source.frequency),interval),fronts=[];
    for(let j=0;j<p.maxFrontsPerSource;j++){
      const age=latestAge+j*interval,radius=p.wavefrontExpansionSpeed*age;
      if(radius>=p.wavefrontMaxRadius)continue;
      const normalized=radius/p.wavefrontMaxRadius;
      const opacity=smooth(normalized/p.wavefrontFadeIn)*
        (1-smooth((normalized-p.wavefrontFadeStart)/(1-p.wavefrontFadeStart)))*Math.exp(-p.wavefrontDamping*age);
      fronts.push({sourceId:source.id,center:source.center,emitTime:time-age,age,radius,opacity});
    }
    return fronts;
  }
  function state(seconds){
    if(!Number.isFinite(seconds))throw new RangeError('Foreground time must be finite');
    const t=modulo(seconds,p.cycleSeconds);
    return {t,systems:sources.map(source=>{
      const wave=signal(source,t),phase=wave.phase/2;
      const relative=[source.separation*Math.cos(phase),source.separation*Math.sin(phase)];
      const total=source.m1+source.m2;
      return {source,wave,positions:[relative.map(q=>-source.m2/total*q),relative.map(q=>source.m1/total*q)],
        fronts:source.id<p.numVisibleSystems?wavefronts(source,t):[]};
    })};
  }
  const sum=time=>sources.reduce((total,source)=>total+signal(source,time).strain,0);
  let sampledPeak=0;
  for(let j=0;j<=p.sumPeakSamples;j++)sampledPeak=Math.max(sampledPeak,Math.abs(sum(p.cycleSeconds*j/p.sumPeakSamples)));
  const derivativeBound=sources.reduce((total,s)=>total+s.amplitude*TAU*s.frequency,0);
  // 固定整周期显示比例，附加 Lipschitz 余量保证采样间隙也不裁切；绝不每帧自动归一化。
  const sumDisplayBound=Math.min(amplitudeBound,sampledPeak+derivativeBound*p.cycleSeconds/(2*p.sumPeakSamples));
  return {parameters:p,sources,amplitudeBound,sumDisplayBound,maximumAmplitude,signal,wavefronts,state,sum};
}
