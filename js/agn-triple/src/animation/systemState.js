import { orbitState, splitBinary } from '../physics/kepler.js';

export function elementsFor(p, suffix) {
  return Object.fromEntries(['a', 'e', 'i', 'Omega', 'omega', 'M0'].map(key => [key, p[key + suffix]]));
}

// 先求真实物理位置，再在单独函数中转换显示位置。
export function physicalState(timeYears, p, innerTimeYears=timeYears) {
  const outer = orbitState(elementsFor(p, 'Outer'), timeYears, p.G * (p.M_smbh + p.m1 + p.m2));
  const inner = orbitState(elementsFor(p, 'Inner'), innerTimeYears, p.G * (p.m1 + p.m2));
  const components = splitBinary(inner.position, p.m1, p.m2);
  return { outer, inner, components };
}

// 独立演示时钟，不改变任何轨道的 a/e/方向/mu；等倍率即可恢复同步物理快进。
export function playbackState(seconds,p,v) {
  return physicalState(seconds*v.timeScaleOuter,p,seconds*v.timeScaleInner);
}

export function renderState(state, v) {
  const center = state.outer.position.map(x => x * v.unitsPerAU);
  const components = state.components.map(component => component.map((x, axis) =>
    center[axis] + x * v.unitsPerAU * v.innerOrbitVisualScale));
  return { center, components };
}
