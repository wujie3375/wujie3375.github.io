import {visual as series} from '../../../agn-triple/src/config/params.js';

// 全部时间/频率是展示单位；质量比用于质心分配，不将播放秒伪装成物理观测秒。
export const model=Object.freeze({
  massLarge:30,massSmall:20,
  cycleSeconds:14,
  inspiralEnd:8.6,mergerPeak:9.7,signalEnd:11.25,
  fadeInSeconds:0.40,fadeOutStart:13.35,fadeOutEnd:13.97,
  blendStart:9.1,
  frequencyStart:0.72,frequencyBridge:2.45,frequencyPeak:5.4,frequencyRingdown:5.05,
  amplitudeBridge:0.45,
  ringdownDecay:0.26,ringdownShoulder:0.13,ringdownFrequencyDecay:0.22,ringdownEndFade:0.20,
  initialSeparation:2.7,
  phaseSamples:6144
});
// 仅复用系列的颜色与黑洞 ShaderMaterial 外观，不共享 AGN 动力学。
export const appearance=Object.freeze({
  binaryOverlayRenderOrder:2,
  smallHaloColor:series.smallHaloColor,smallHaloStrength:0.65,smallHaloSize:series.smallHaloSize,
  smallHaloWidth:series.smallHaloWidth,
  centralHaloColor:series.centralHaloColor,centralHaloStrength:0.72,centralHaloSize:series.centralHaloSize,
  centralHaloWidth:series.centralHaloWidth,centralHaloRenderOrder:3,haloClipDisk:false,
  haloMinPixelWidth:series.haloMinPixelWidth
});
export const visual=Object.freeze({
  titleText:'Compact Binary Coalescence',
  canvasWidth:960,canvasHeight:720,aspectRatio:4/3,renderScale:1,maxRenderPixels:1280*960,
  backgroundColor:series.backgroundColor,exposure:series.exposure,maxPixelRatio:1.75,
  largeRadius:0.36,smallRadius:0.27,finalRadius:0.52,
  cameraPosition:[0,-8,5.5],cameraHalfHeight:2.8,sourceScreenY:0.39,
  sourceHalfWidth:2.7,
  mergerHaloBoost:1.20,
  mergerShapeDeformationStrength:0.28,mergerShapeDeformationDuration:1.65,
  ringdownDistortion:0.055, // 与 waveform 直接共用包络，不再叠加第二套阻尼。
  rippleStrength:0.68,rippleDuration:2.0,rippleRiseSeconds:0.24,
  rippleStartRadius:0.75,ripplePropagationSpeed:1.8, // 固定传播速度，与持续 GW 相同；半径永不回缩。
  rippleColor:[1.20,0.77,0.30],
  hazeColor:[0.32,0.18,0.07],hazeOpacity:0.09,hazeSize:6,
  starCount:24,starSize:2.15,starOpacity:0.52,starSeed:3375,starColor:series.starColor,starDistance:18,
  starFieldInset:0.93,starCoreExclusion:2.05,starWaveformPadding:0.035,
  waveformLeft:0.06,waveformRight:0.95,waveformCenterY:0.79,waveformHeight:0.26,
  waveformColor:'#f0cb88',waveformLineWidth:2.0,waveformGlowColor:'#d7a557',waveformGlowBlur:7,
  waveformGlowStrength:0.28,waveformSamples:2048,
  // 每个 GW 周期发射一次；首个事件对齐播放开始，随后始终跟随同一 chirp 相位。
  gwEnabled:true,gwPhaseMultiplier:2,gwEmissionPhaseStep:2*Math.PI,timeScaleInner:1,gwAlignEmissionStart:true,
  gwVisualSpeed:1.8,gwMaxVisibleFronts:22,gwMaxRadius:6.0,gwFadeInRadius:0.16,
  gwFadeStart:5.0,gwFadeEnd:6.0,gwAttenuation:0.12,gwAttenuationPower:1,
  gwColor:[0.62,0.74,0.86],gwAlpha:0.36,gwGlowStrength:1.15,
  gwVolumeStrength:0.22,gwFrontStrength:1.25,gwFrontPeak:0.84,gwFrontWidth:0.085,gwFrontVariation:0.10,
  gwFrontMaxWorldWidth:0.14, // 远处亮边不随半径无限加宽，避免高频历史波叠成整片灰雾。
  gwThickness:0.28,gwShellPeak:0.48,gwEdgeFadeStart:0.68,gwScreenFade:[0.63,0.69],
  gwDirectionalStrength:0.08,gwPhaseStrengthVariation:0,
  gwSphereWidthSegments:32,gwSphereHeightSegments:20,gwRenderOrder:1,gwPhaseRootIterations:32,
  gwInspiralFloor:0,gwAmplitudePower:1,
  gwBrightnessAmplitudeGain:1.20,
  gwGlobalBrightnessScale:1.45, // 同比例增强三阶段；merger 主余波 alpha 仍小于 1。
  gwAgeFadeRate:0.45,gwAgeFadeDelay:0.15,gwFrontAgeFadePower:0, // 远边缘仍保留淡影；源的快速振铃包络仍为原值。
  gwRingdownFadeDelay:0.10,gwRingdownFadeTime:0.65,gwRingdownBrightnessFloor:0.06, // 峰后显示亮度另行阻尼，不缩短传播半径。
  gwPhaseFadeStart:0,gwPhaseFadeEnd:0 // CBC 只按传播半径淡出，不再因高频发射过快回收较大的历史前沿。
});
