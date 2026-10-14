import * as THREE from '../../../vendor/three/three.module.js';
// 独立源的真实三维示意轨道面；亮点与波前共用同一组基，禁止分别拉伸/旋转两者。
export function orbitalBasis(source,skyRight,skyUp,viewDirection){
  const c=Math.cos(source.azimuth),s=Math.sin(source.azimuth),ci=Math.cos(source.inclination),si=Math.sin(source.inclination);
  const u=skyRight.clone().multiplyScalar(c).addScaledVector(skyUp,s);
  const v=skyRight.clone().multiplyScalar(-s*ci).addScaledVector(skyUp,c*ci).addScaledVector(viewDirection,si);
  const normal=u.clone().cross(v).normalize();
  const quaternion=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(u,v,normal));
  return {u,v,normal,quaternion};
}
