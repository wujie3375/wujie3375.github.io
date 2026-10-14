// 物理单位：AU、太阳质量、年。G = 4π² AU³/(M☉ yr²)。角度为弧度。
const radians = degrees => degrees * Math.PI / 180;
const aInner = 0.8 * 0.8 ** (2 / 3); // 固定质量：物理周期缩短 20%，不是篡改角速度。
const outerPlaybackPeriod = Math.sqrt(260 ** 3 / (1e6 + 50)) / 0.32;
const innerPhysicalPeriod = Math.sqrt(aInner ** 3 / 50);
export const physical = Object.freeze({
  G: 4 * Math.PI ** 2,
  M_smbh: 1e6,
  m1: 30,
  m2: 20,
  aOuter: 260,
  eOuter: 0.10,
  iOuter: radians(2),
  OmegaOuter: radians(12),
  omegaOuter: radians(32),
  M0Outer: radians(120),
  aInner,
  eInner: 0.02,
  iInner: radians(48), // 减轻内轨道在当前固定镜头下的压扁，保留真实三维旋转。
  OmegaInner: radians(15),
  omegaInner: radians(20),
  M0Inner: radians(35),
  timeScale: 0.06 // 同步物理快进的参考倍率；网页实际播放使用 visual 中的独立倍率。
});

// 仅渲染参数：不进入开普勒求解器，也不改变平均运动、周期或质量比。
export const visual = Object.freeze({
  unitsPerAU: 0.01,
  innerOrbitVisualScale: 52 * 0.8 / aInner, // 补偿物理轨道缩小，保留原来的显示半长轴。
  totalDuration: outerPlaybackPeriod, // 约 13.101 秒；外轨道速度和全部轨道元素保持原样。
  canvasWidth: 960,canvasHeight: 720,aspectRatio: 4 / 3,renderScale: 1,
  maxRenderPixels: 1280 * 960,
  centralShadowRadius: 0.82, // 本轮再增大约 18.3%，补偿窄屏扩盘后的构图缩放；不改变质量。
  smallBlackHoleRadius: 0.074,
  diskInnerRadius: 0.97, // 随中央剪影扩大，保留亮盘与黑洞边缘的间隙。
  diskOuterRadius: 4.8,
  diskThickness: 0.035,
  diskBrightness: 1.58,
  diskRadialPower: 1.30,
  diskCoreBoost: 0.45,
  diskCoreWidth: 0.68,
  diskEdgeFadeStart: 0.70,
  diskEmissionFloor: 0.45,
  diskEmissionRadial: 1.05,
  diskAlphaFloor: 0.54,
  diskAlphaRadial: 0.40,
  diskInnerColor: [3.20, 2.65, 1.65], // 线性 HDR RGB；暖白金亮核，不重复手动 gamma 转换。
  diskMiddleColor: [2.10, 1.05, 0.28],
  diskOuterColor: [0.68, 0.26, 0.055],
  diskLayerOpacities: [0.22, 0.85, 0.20],
  diskAzimuthalVariationStrength: 0.34,
  diskAzimuthalColorStrength: 0.045,
  diskAzimuthalAlphaStrength: 0.10,
  diskAzimuthalVariationScale: 1.80,
  diskAzimuthalSecondaryWeight: 0.42, // 两个低阶角向分量形成柔和弧带，不添加颗粒或高频噪声。
  diskFlowArcStrength: 0.62,diskFlowArcRadialStart: 0.06,diskFlowArcRadialEnd: 0.68,
  diskFlowArcSharpness: 2.0,diskFlowAlphaStrength: 0.32, // 暖白亮核经色调映射后容易压平对比；软弧带同步轻调透明度。
  diskRotationMin: 0.38,diskRotationMax: 1.0,
  diskLoopBlendSeconds: 1.2,
  diskRotationSpeed: 1.38, // 仅平滑切向纹理推进；三薄层更相干，避免把亮带混成均匀泛光。
  diskLayerSpeeds: [0.94, 1.0, 1.06],
  diskLayerPhases: [0.0, 0.15, 0.30],
  diskShearPower: 1.15,
  diskSpiralArms: 2,
  exposure: 0.92,
  maxPixelRatio: 1.75,
  starCount: 42,
  starSize: 2.35, // CSS 像素；固定大小，无时间噪声或闪烁。
  starOpacity: 0.60,
  starSizeVariation: [0.80,1.25],starBrightnessVariation: [0.75,1.15],
  starColor: 0xb9c7d8,
  starDistance: 18,
  starFieldInset: 0.94,
  starSeed: 3375,
  starExclusionPadding: 0.40, // 世界单位，覆盖真实盘投影、软边、薄层及视角漂移。
  starBinaryPadding: 0.08,
  starMaxAttempts: 4000,
  backgroundColor: 0x0b111b,
  binaryOverlayRenderOrder: 2, // 小黑洞示意剪影及轮廓在透明盘层后绘制；仍保留中央黑洞深度遮挡。
  smallHaloColor: [0.64, 0.77, 0.88],
  smallHaloStrength: 0.72,
  smallHaloSize: 2.8,
  smallHaloWidth: 0.065,
  centralHaloColor: [0.64, 0.73, 0.82],
  centralHaloStrength: 0.84,
  centralHaloSize: 2.8,
  centralHaloWidth: 0.038,
  centralHaloRenderOrder: 3,
  haloClipDisk: true, // 遮掉吸积盘前景覆盖的下缘，不让 halo 穿透盘面变成独立弧线。
  haloMinPixelWidth: 0.9, // 导数控制的最小设备像素厚度，窄屏仍能看到小黑洞轮廓。
  // 独立演示时钟（年/播放秒）；不改轨道参数或开普勒平均运动。
  // 设成同一值可恢复“同一物理时刻”的同步快进。
  timeScaleOuter: 0.32,
  timeScaleInner: innerPhysicalPeriod * 12 / outerPlaybackPeriod, // 独立演示时钟：内显示周期再短 1/6。
  cameraPosition: [3.2, -7.2, 4.2], // 约 28° 高于盘面，原约 38°；仍非完全侧视。
  cameraHalfHeight: 3.05,
  cameraFramingMargin: 1.07,
  systemScreenY: 0.40, // 主体下移画面高度的 6%；只改 framing，波形位置/机制、天体尺寸和轨道不变。
  starScreenBottom: 0.70, // 静态生成时避开下方单条波形。
  cameraDrift: 0, // 固定镜头保证背景星点完全静止。
  cameraDriftPeriod: outerPlaybackPeriod,
  // GW 是历史发射事件上的显示层；不改任何轨道元素或物理求解器。
  gwEnabled: true,
  gwPhaseMultiplier: 2,
  gwEmissionPhaseStep: 2*Math.PI, // 减速后稀疏抽样：每内轨道两次，不堆积前沿。
  gwVisualSpeed: 2.2, // 示意速度，较前轮降低 45%；亮边仍略快于源在椭圆度量下的最高速度。
  gwPlanarProjection: true, // XY 盘面中的视觉投影，自动随相机投成同方向椭圆；不是声称 GW 只在盘内传播。
  gwMaxVisibleFronts: 3,
  gwMaxRadius: 2.5,
  gwFadeStart: 1.20,
  gwFadeEnd: 2.5,
  gwFadeInRadius: 0.12,
  gwAttenuation: 0.5,
  gwColor: [0.62, 0.74, 0.86],
  gwAlpha: 0.48,
  gwGlowStrength: 1.12,
  gwVolumeStrength: 0.44,
  gwFrontStrength: 1.15,gwFrontPeak: 0.84,gwFrontWidth: 0.082,gwFrontVariation: 0.10,
  gwThickness: 0.28, // 宽缓体积密度；不再绘制 Fresnel 硬边和大圆经线。
  gwShellPeak: 0.48,gwEdgeFadeStart: 0.68,
  gwDirectionalStrength: 0.08,
  gwPhaseStrengthVariation: 0.05,
  gwSphereWidthSegments: 32,
  gwSphereHeightSegments: 20,
  gwRenderOrder: 1,
  gwPhaseRootIterations: 32,
  waveformEnabled: true,waveformLeft: 0.06,waveformRight: 0.95,waveformCenterY: 0.84,waveformHeight: 0.18,
  waveformColor: '#f1cf8d',waveformLineWidth: 1.6,waveformGlowBlur: 3,waveformSamples: 2304,waveformPhaseSamples: 4096,
  waveformVisibleWindow: 18, // 左端为当前时刻，右端为历史；新信号从左进入并向右滚动。
  waveformAmplitude: 0.80,waveformPhase0: 0,intrinsicChirpRate: 0, // 早期准单频近似；默认严格跟随现有内轨道，不引入不自洽的轨道反作用。
  lightSpeedAUPerYear: 299792458*31557600/149597870700,
  observerDirection: null, // null 时沿 cameraPosition 的远场方向；正 v_los 表示朝向观察者。
  dopplerModulationDepth: 0.44,dopplerSafetyMargin: 1.01 // 从真实轨道速度自动推导 dopplerVisualBoost，仅用于显示。
});
