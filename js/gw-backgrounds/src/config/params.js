// 频率、轨道大小和振幅均为展示单位，不是实测银河系种群或 Hz 标定波形。
const cameraPosition=[0,-8,0.8],cameraHalfHeight=6.0,galaxyScreenY=0.34;
export const model=Object.freeze({
  cycleSeconds:14,numVisibleSystems:16,numSignalSources:48,seed:337526,componentRandomSeed:337526,
  // 偶整数 GW 周期数保证 f_GW=2*f_orb，两个天体自身也在 14 秒后回到原位。
  gwCycleRange:[14,84],frequencyClusterCenters:[20,38,58],frequencyClusterWidths:[6,8,7],frequencyClusterWeights:[0.28,0.44,0.28],
  amplitudeBands:[[0.24,0.52],[0.085,0.23],[0.035,0.095]],amplitudeCategoryWeights:[0.25,0.40,0.35],sumPeakSamples:4096,
  // 保留原32源（尤其上方16个DWD）的全部参数；新增16源才使用更宽的独立随机序列。
  additionalSourceStart:32,existingGWCycleRange:[16,66],
  additionalFrequencyCenters:[24,48,72],additionalFrequencyWidths:[12,16,12],additionalFrequencyWeights:[0.14,0.32,0.54],
  additionalAmplitudeBands:[[0.22,0.40],[0.065,0.18],[0.018,0.07]],additionalAmplitudeWeights:[0.04,0.16,0.80],
  additionalFrequencySalt:0x85ebca6b,additionalAmplitudeSalt:0xc2b2ae35,additionalPhaseSalt:0x27d4eb2f,
  representativeSources:Array.from({length:48},(_,i)=>i),
  systemPositionDistribution:'edge-on-disk-bulge',positionHalfLength:6.10,positionHalfDepth:2.0,
  positionHeight:0.20,positionElevatedHeight:0.35,positionElevatedFraction:0.15,
  // 16个可见代表中6个球核、10个盘面；新增信号源不增加可见DWD，原位置前缀保留。
  positionBulgeVisibleCount:6,positionBulgeSignalCount:8,
  positionBulgeHalfLength:1.30,positionBulgeHalfHeight:1.20,positionBulgeMinHeight:0.45,
  minimumProjectedSeparation:0.78,maxPositionAttempts:12000,
  orbitSeparationRange:[0.36,0.48],massRange:[0.50,0.85],
  orientationSeed:337527,orbitInclinationRange:[0.12,0.74],orbitAzimuthRange:[0,2*Math.PI],
  // 用固定视图排除主标题/下方波形区域；质心坐标生成后永远不随时间移动。
  projectionUpY:cameraPosition[2]/Math.hypot(...cameraPosition),projectionUpZ:-cameraPosition[1]/Math.hypot(...cameraPosition),cameraHalfHeight,galaxyScreenY,
  sourceScreenYRange:[0.22,0.46],
  wavefrontEnabled:true,wavefrontExpansionSpeed:0.38,wavefrontMaxRadius:0.42,
  wavefrontFadeStart:0.62,wavefrontFadeIn:0.10,wavefrontDamping:1.0,maxFrontsPerSource:7
});

export const visual=Object.freeze({
  shaderRevision:'foreground-dwd-layers-20261014', // 同一版vertex/fragment一起加载，避免本地或线上缓存混用。
  titleText:'Confusion Foreground',individualSourcesLabel:'Individual sources',confusionLabel:'DWD Confusion',
  canvasWidth:960,canvasHeight:720,aspectRatio:4/3,renderScale:1,
  maxPixelRatio:1.75,maxRenderPixels:1280*960,backgroundColor:0x0b111b,exposure:0.92,
  cameraPosition,cameraHalfHeight,galaxyScreenY,
  topSectionHeight:0.62,bottomSectionHeight:0.38,
  galaxyViewMode:'edge-on',galaxyDiskHalfLength:7.85,galaxyDiskThickness:0.26,galaxyDiskShoulder:0.16,galaxyDiskOuterThickness:0.36,
  galaxyDensityVariationStrength:0,galaxyDensityVariationScale:0.85,
  galaxyBrightness:0.90,galaxyDiskScale:4.0,galaxyDiskOpacity:0.66,galaxyEdgeFade:0.64,
  galaxyHaloRadius:7.95,galaxyHaloHalfHeight:0.95,galaxyHaloStrength:0.025,galaxyHaloFalloff:1.8,galaxyHaloColor:[0.34,0.36,0.42],
  galaxyScreenFade:[0.58,0.62], // 最外层柔光在文字区之前淡出，避免大盘压住下方标签。
  galaxyWarmColor:[1.15,1.02,0.84],galaxyCoolColor:[0.65,0.69,0.75],
  galaxyBulgeRadius:2.20*2/3,galaxyBulgeAspect:0.72,galaxyBulgeBrightness:1.0,galaxyBulgeColor:[1.30,1.15,0.93],
  galaxyBulgeCoreFraction:0.50,galaxyBulgeCoreStrength:0.85,galaxyBulgeEnvelopeStrength:0.24,galaxyBulgeEnvelopePower:1.20,
  galaxyBulgeEdgeStart:0.60,galaxyBulgeEdgeEnd:0.90,galaxyBulgeEnvelopeFalloff:4.5,
  // 只收紧外围包络/软边；球核本体尺度、核心亮度与薄盘不变。
  galaxyDarkLaneStrength:0.12,galaxyDarkLaneWidth:0.045,galaxyDarkLaneOffset:-0.025,
  // 保留原9个天空点；原33个均匀盘面点由下方统计星群取代。
  starfieldCount:9,starfieldSeed:14003375,starfieldLegacyDiskCount:33,starfieldSize:1.5,starfieldOpacity:0.30,
  starfieldColor:0xaabbd0,starfieldScreenYRange:[0.13,0.59],
  // 普通星点的投影统计先验，不是实测/距离标定银河种群；不发GW、不参与信号。
  galaxyStarBulgeCount:600,galaxyStarDiskCount:384,galaxyStarThickCount:60,galaxyStarSeed:14003376,
  galaxyStarBulgeHalfLength:1.70*2/3,galaxyStarBulgeHalfHeight:1.18*2/3,
  galaxyStarBulgeSersicIndex:1.5,galaxyStarBulgeFalloff:3.3,galaxyStarBulgeMaxRadius:1.20,
  galaxyStarDiskHalfLength:7.65,galaxyStarDiskRadialScale:3.15,
  galaxyStarDiskHeight:0.42,galaxyStarDiskVerticalScale:0.13,galaxyStarDiskOuterThickness:0.70,
  galaxyStarDiskVariationStrength:0.12,galaxyStarDiskVariationScale:0.80,galaxyStarDiskVariationPhase:0.60,
  galaxyStarThickRadialScale:4.2,galaxyStarThickVerticalScale:0.38,galaxyStarThickHalfHeight:1.45,
  galaxyStarSamplingBins:512,galaxyStarEdgeFadeFraction:0.12,
  // 82%弱点、15%中等、3%较亮；每档内仍偏向较小较暗端。
  galaxyStarWeakFraction:0.82,galaxyStarBrightFraction:0.03,galaxyStarAttributePower:1.8,
  // 尺寸是CSS像素直径（不是半径），三档统一扩大1.8倍；保持小于DWD的8～15px。
  galaxyStarWeakSizeRange:[1.8,2.79],galaxyStarMediumSizeRange:[2.79,3.78],galaxyStarBrightSizeRange:[3.78,4.77],
  galaxyStarWeakAlphaRange:[0.28,0.48],galaxyStarMediumAlphaRange:[0.48,0.64],galaxyStarBrightAlphaRange:[0.64,0.76],
  // 球核单独采用88%弱/11%中/1%亮，缩小和压低多数点，避免密集白噪块。
  galaxyStarBulgeWeakFraction:0.88,galaxyStarBulgeBrightFraction:0.01,
  galaxyStarBulgeSizeScale:0.82,galaxyStarBulgeAlphaScale:0.70,galaxyStarBulgeAttributePower:2.0,
  galaxyStarGlow:0.022,galaxyStarThickAlphaScale:0.72,
  galaxyStarCoolFraction:0.12,galaxyStarWarmthRange:[0.48,0.90],galaxyStarCoolWarmthRange:[0.05,0.35],
  galaxyStarWarmColor:[1.04,1.00,0.92],galaxyStarCoolColor:[0.91,0.96,1.02],
  // 同一组代表用于上方突出双星与下方曲线；仅显示倍率，不改变源的真实参数或相位。
  featuredSourceIds:[0,3,10,12,14],featuredOrbitScale:0.825,otherOrbitScale:0.45,
  featuredDwarfSizeRange:[12.0,15.0],featuredDwarfBrightnessRange:[0.80,1.0],
  whiteDwarfSizeRange:[8.0,11.0],whiteDwarfBrightnessRange:[0.45,0.66],
  weakDwarfSizeRange:[7.0,9.0],weakDwarfBrightnessRange:[0.28,0.42],
  weakDwarfAmplitudeMax:0.075, // 只将最低振幅的少数源作为弱显示档，其余非代表源用中等档。
  whiteDwarfCentralContrast:0.65,whiteDwarfOutlineRadius:0.43,whiteDwarfOutlineWidth:0.10,
  whiteDwarfBulgeBrightnessFloor:0.68,whiteDwarfBulgeSizeMin:10.0,
  whiteDwarfColdColor:[0.86,0.93,1.0],whiteDwarfWarmColor:[1.0,0.91,0.78],
  whiteDwarfCoreFalloff:14,whiteDwarfHaloFalloff:4,whiteDwarfCoreStrength:0.85,whiteDwarfHaloStrength:0.40,
  wavefrontAlpha:0.55,wavefrontColor:[0.62,0.73,0.86],wavefrontGlow:0.74,wavefrontOtherScale:0.60,wavefrontWeakScale:0.75,
  wavefrontThickness:0.16,wavefrontPeak:0.78,wavefrontVolumeStrength:0.16,
  wavefrontStrengthPower:0.85,wavefrontStrengthFloor:0.36, // 仅显示层最低强度，避免真实弱信号的波前完全消失。
  wavefrontRecentBoost:0.22,wavefrontRecentFalloff:0.40, // 对近期波前柔和加亮，不改发射时刻或传播半径。
  waveformLeft:0.065,waveformRight:0.95,waveformSamples:900,waveformTimeWindow:6,
  componentCenterY:0.704,componentHeight:0.10,componentWaveColor:'#b6c8dd',componentWaveAlpha:0.11,
  componentWeakAlpha:0.055,componentStrongAlpha:0.22,
  componentAlphaFloor:0.32,componentFeaturedAlpha:0.32,componentFeaturedLineWidth:1.15,
  componentLineWidth:0.95,componentLegendY:0.63,
  sumCenterY:0.891,sumHeight:0.13,sumWaveColor:'#f1ce8c',sumWaveLineWidth:2.2,sumWaveAlpha:0.98,
  sumLegendY:0.802,waveformLegendFont:15,minWaveformLegendFont:12,labelPadding:3,labelBackgroundAlpha:0.96,
  waveformGlowBlur:3,waveformGlowAlpha:0.18,staticTime:3.5
});
