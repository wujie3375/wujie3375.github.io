import * as THREE from '../../../vendor/three/three.module.js';
import {createBlackHole} from './createBlackHole.js';

export function createBBH(p,v) {
  const group=new THREE.Group();
  const bodies=[p.m1,p.m2].map(m=>createBlackHole(v.smallBlackHoleRadius*Math.cbrt(m/p.m1),v,'binary'));
  bodies.forEach(body=>group.add(body));
  return {group,bodies}; // 不建立尾流、历史残影或辅助轨道对象。
}
