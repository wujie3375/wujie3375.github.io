// 播放秒、频率和应变均为展示单位；双频叠加不对应某个已拟合的修改引力理论。
const signalEnd=13.2,visibleGRCycles=8;
const grFrequency=visibleGRCycles/signalEnd;
const grColor='#D7DDE3',modifiedColor='#FF982F';
export const model=Object.freeze({
  cycleSeconds:14,signalEnd,visibleGRCycles,
  fadeInSeconds:0.45,fadeOutStart:13.2,fadeOutEnd:13.98,
  grWaveFrequency:grFrequency,grWaveAmplitude:1,grWavePhase:-4.96,
  modifiedExtraFrequency:grFrequency/2,modifiedExtraAmplitude:0.60,modifiedExtraPhase:0.74 // cos(0.5*theta + 0.74)，相位相对同一个 theta。
});
export const visual=Object.freeze({
  canvasWidth:960,canvasHeight:720,aspectRatio:4/3,renderScale:1,
  maxPixelRatio:1.75,maxRenderPixels:1280*960,
  backgroundColor:'#0b111b',
  titleText:'Six Polarization Modes',
  panelGridRows:2,panelGridCols:3,panelGridLeft:0.035,panelGridRight:0.965,
  panelGridTop:0.140,panelGridBottom:0.750,minGridTopPixels:78, // 整体小幅上移；主标题及下方波形/图例不动。
  columnLabels:['Tensor','Vector','Scalar'],columnFamilies:['tensor','vector','scalar'],
  groupHeaderVisible:true,groupLabelFontSize:18,minGroupLabelFontSize:14,
  groupHeaderGap:7,minGroupHeaderGap:6, // 按实际字形 descent 留出标题到面板的净空，不再只移动基线。
  modeLabelOffsetY:26,minModeLabelOffsetY:17,
  panelSpacing:7,panelCornerRadius:10,panelFill:'rgba(173,190,210,0.055)',
  panelBorder:'rgba(155,172,192,0.34)',panelBorderLineWidth:1.0,
  ringRadiusFraction:0.29,ringCenterY:0.58,ringSamples:128,
  modeAmplitudeTensor:0.235,modeAmplitudeScalar:0.195,modeAmplitudeVector:0.26,
  tensorColor:grColor,scalarColor:modifiedColor,vectorColor:'#83b9a5',
  referenceColor:'#c3cfdc',referenceCircleAlpha:0.62,referenceLineWidth:1.3,minReferenceLineWidth:1.1,
  referenceDash:[8,5],minReferenceDash:[5,3],axisColor:'#b2c1d2',axisLength:1.30,axisLineWidth:1.5,minAxisLineWidth:1.2,
  axisArrowSize:8,minAxisArrowSize:6,axisArrowHalfAngle:0.5,
  axisLabelFontSize:26,minAxisLabelFontSize:16,
  axisLabelOffsetPixels:6,minAxisLabelOffsetPixels:3,
  labelFontSize:28,minModeLabelFontSize:16,
  deformedCurveLineWidth:3.0,minCurveLineWidth:2.2,
  curveGlowBlur:5,curveNeutralOpacity:0.40,
  particleCount:8,particleRadius:2.3,minParticleRadius:1.3,
  waveformPanelTop:0.795,waveformCenterY:0.89,waveformPanelHeight:0.155,
  waveformLeft:0.06,waveformRight:0.95,waveformSamples:2048,
  waveformColorGR:grColor,waveformColorModified:modifiedColor,
  waveformLineWidthGR:2.8,waveformLineWidthModified:2.0, // CSS px，不随内部渲染倍率缩小。
  waveformAmplitudeScale:0.60, // 两条曲线统一显示比例，留出 1 + 0.60 的叠加峰值空间，不改数学振幅。
  minWaveformLineWidth:1.2,waveformGlowBlur:2,waveformGlowStrength:0.15,waveformModifiedOpacity:0.98,
  waveformLabelFontSize:18,minWaveformLabelFontSize:13,
  waveformLegendSpacing:94,waveformLegendLineLength:18,
  staticTime:12
});
