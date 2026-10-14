// 对传播方向 +z 的六个对称极化基：E_A:E_B=2δ_AB。
// 来源与示意限制见 README；几何为一阶 test-particle 位移的显示放大。
const modes=[
  {id:'plus',symbol:'+',family:'tensor',axes:[0,1],horizontalSign:1,outAxis:2,outTowards:true,
    tensor:[[1,0,0],[0,-1,0],[0,0,0]]},
  {id:'breathing',symbol:'b',family:'scalar',axes:[0,1],horizontalSign:1,outAxis:2,outTowards:true,
    tensor:[[1,0,0],[0,1,0],[0,0,0]]},
  {id:'vector-x',symbol:'x',family:'vector',axes:[0,2],horizontalSign:1,outAxis:1,outTowards:false,
    tensor:[[0,0,1],[0,0,0],[1,0,0]]},
  {id:'cross',symbol:'×',family:'tensor',axes:[0,1],horizontalSign:1,outAxis:2,outTowards:true,
    tensor:[[0,1,0],[1,0,0],[0,0,0]]},
  {id:'longitudinal',symbol:'l',family:'scalar',axes:[0,2],horizontalSign:1,outAxis:1,outTowards:false,
    tensor:[[0,0,0],[0,0,0],[0,0,Math.SQRT2]]},
  // 从另一侧看 yz 平面：+y 指向左，避免人为改极化符号/相位来制造不同形状。
  {id:'vector-y',symbol:'y',family:'vector',axes:[1,2],horizontalSign:-1,outAxis:0,outTowards:false,
    tensor:[[0,0,0],[0,0,1],[0,1,0]]}
];
const order=['plus','vector-x','breathing','cross','vector-y','longitudinal'];
export const polarizationModes=Object.freeze(order.map(id=>modes.find(mode=>mode.id===id)).map(mode=>Object.freeze({...mode,
  axes:Object.freeze(mode.axes),tensor:Object.freeze(mode.tensor.map(row=>Object.freeze(row)))})));
export const axisNames=Object.freeze(['x','y','z']);

export function deformPoint(mode,position,strain){
  return position.map((q,j)=>q+strain*mode.tensor[j].reduce((sum,e,k)=>sum+e*position[k],0));
}
export function ringPoint(mode,angle,strain){
  const position=[0,0,0];position[mode.axes[0]]=mode.horizontalSign*Math.cos(angle);
  position[mode.axes[1]]=Math.sin(angle);
  const transformed=deformPoint(mode,position,strain);
  return [mode.horizontalSign*transformed[mode.axes[0]],transformed[mode.axes[1]]];
}
export function modeStrain(mode,state,v){
  const amplitude=mode.family==='tensor'?v.modeAmplitudeTensor:mode.family==='scalar'?v.modeAmplitudeScalar:v.modeAmplitudeVector;
  return amplitude*state.oscillation*state.opacity;
}
