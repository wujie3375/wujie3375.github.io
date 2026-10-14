export const TAU = 2 * Math.PI;
export const wrapAngle = angle => ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;

export function solveKepler(meanAnomaly, eccentricity) {
  if (!(eccentricity >= 0 && eccentricity < 1)) throw new RangeError('Elliptical orbit requires 0 <= e < 1');
  const M = wrapAngle(meanAnomaly);
  let E = eccentricity < 0.8 ? M : Math.sign(M || 1) * Math.PI;
  for (let iteration = 0; iteration < 32; iteration++) {
    const delta = (E - eccentricity * Math.sin(E) - M) / (1 - eccentricity * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-13) return E;
  }
  // 高偏心率或极端近心点的稳健后备：单调方程二分，不让画面跳变。
  let low = -Math.PI;
  let high = Math.PI;
  for (let iteration = 0; iteration < 64; iteration++) {
    E = (low + high) / 2;
    if (E - eccentricity * Math.sin(E) < M) low = E;
    else high = E;
  }
  return (low + high) / 2;
}

// Rz(Omega) Rx(i) Rz(omega)，返回普通数组，物理模块不依赖 Three.js。
export function rotateOrbit(x, y, i, Omega, omega) {
  const u = x * Math.cos(omega) - y * Math.sin(omega);
  const v = x * Math.sin(omega) + y * Math.cos(omega);
  return [
    u * Math.cos(Omega) - v * Math.cos(i) * Math.sin(Omega),
    u * Math.sin(Omega) + v * Math.cos(i) * Math.cos(Omega),
    v * Math.sin(i)
  ];
}

export function orbitState(elements, timeYears, mu) {
  const { a, e, i = 0, Omega = 0, omega = 0, M0 = 0, t0 = 0 } = elements;
  if (!(a > 0 && mu > 0)) throw new RangeError('a and mu must be positive');
  const n = Math.sqrt(mu / a ** 3);
  const M = M0 + n * (timeYears - t0);
  const E = solveKepler(M, e);
  const denominator = 1 - e * Math.cos(E);
  const x = a * (Math.cos(E) - e);
  const y = a * Math.sqrt(1 - e ** 2) * Math.sin(E);
  const vx = -a * Math.sin(E) * n / denominator;
  const vy = a * Math.sqrt(1 - e ** 2) * Math.cos(E) * n / denominator;
  return {
    position: rotateOrbit(x, y, i, Omega, omega),
    velocity: rotateOrbit(vx, vy, i, Omega, omega),
    eccentricAnomaly: E,
    meanMotion: n,
    period: TAU / n
  };
}

export function splitBinary(relativePosition, m1, m2) {
  const total = m1 + m2;
  return [relativePosition.map(x => -m2 / total * x), relativePosition.map(x => m1 / total * x)];
}
