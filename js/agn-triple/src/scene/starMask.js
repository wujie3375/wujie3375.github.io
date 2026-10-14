const norm=a=>Math.hypot(...a);
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];

export function starViewDirection(v,offset=0) {
  const [x,y,z]=v.cameraPosition;
  const angle=Math.atan2(y,x)+offset,radius=Math.hypot(x,y);
  const direction=[radius*Math.cos(angle),radius*Math.sin(angle),z];
  return direction.map(q=>q/norm(direction));
}
export function starMaskRadii(v) {
  return {
    disk:v.diskOuterRadius+v.starExclusionPadding,
    central:v.centralShadowRadius*(1+v.centralHaloSize*v.centralHaloWidth)+v.starExclusionPadding,
    binary:v.smallBlackHoleRadius*(1+v.smallHaloSize*v.smallHaloWidth)+v.starBinaryPadding
  };
}
// 正交视线与盘面投影相交；厚度和 padding 为保守扩大，不按透明度阈值漏出星点。
export function isStarMasked(position,direction,v,binary=[]) {
  const radii=starMaskRadii(v);
  if(Math.abs(direction[2])<1e-6) return true;
  const hit=position.slice(0,2).map((q,i)=>q-position[2]*direction[i]/direction[2]);
  const thickness=v.diskThickness*Math.hypot(direction[0],direction[1])/Math.abs(direction[2]);
  if(norm(hit)<=radii.disk+thickness) return true;
  for(const [center,radius] of [[[0,0,0],radii.central],...binary.map(a=>[a,radii.binary])]) {
    const delta=position.map((q,i)=>q-center[i]);
    const along=dot(delta,direction);
    if(norm(delta.map((q,i)=>q-direction[i]*along))<=radius) return true;
  }
  return false;
}
export function generateStarPositions(halfWidth,halfHeight,v) {
  const direction=starViewDirection(v);
  const rawRight=cross([0,0,1],direction),right=rawRight.map(q=>q/norm(rawRight));
  const up=cross(direction,right);
  const checks=[-v.cameraDrift,0,v.cameraDrift].map(a=>starViewDirection(v,a));
  const positions=new Float32Array(v.starCount*3);
  const centerY=((v.systemScreenY??0.5)-0.5)*2*halfHeight;
  let seed=v.starSeed>>>0,count=0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let attempt=0;attempt<v.starMaxAttempts&&count<v.starCount;attempt++) {
    const x=(2*random()-1)*halfWidth*v.starFieldInset;
    const y=(2*random()-1)*halfHeight*v.starFieldInset+centerY;
    if(v.waveformEnabled&&0.5-(y-centerY)/(2*halfHeight)>v.starScreenBottom)continue;
    const point=direction.map((q,i)=>-q*v.starDistance+right[i]*x+up[i]*y);
    if(checks.some(view=>isStarMasked(point,view,v))) continue;
    positions.set(point,count++*3);
  }
  return {positions,count}; // 无足够背景区域时宁可少画，不向禁区填充。
}

