export function createWaveformPanel(driver,v){
  const samples=Array.from({length:v.waveformSamples+1},(_,j)=>driver.evaluate(driver.parameters.signalEnd*j/v.waveformSamples));
  let width=1,height=1,scale=1;
  return {resize(w,h){width=w;height=h;scale=w/v.canvasWidth;},drawStatic(ctx){
    ctx.save(); // 不绘制 y=0 水平参考线，只保留两项图例。
    ctx.font=`${Math.max(v.minWaveformLabelFontSize,v.waveformLabelFontSize*scale)}px Arial,sans-serif`;
    for(const [j,label] of ['GR','modified'].entries()){
      const color=j===0?v.waveformColorGR:v.waveformColorModified;
      const x=width*v.waveformLeft+j*Math.max(72,v.waveformLegendSpacing*scale);
      const y=height*v.waveformPanelTop;
      ctx.strokeStyle=color;ctx.fillStyle=color;
      ctx.lineWidth=Math.max(v.minWaveformLineWidth,j===0?v.waveformLineWidthGR:v.waveformLineWidthModified);
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+v.waveformLegendLineLength*scale,y);ctx.stroke();
      ctx.fillText(label,x+v.waveformLegendLineLength*scale+5,y+4);
    }
    ctx.restore();
  },draw(ctx,state){
    if(state.opacity<=0.001||state.reveal<=0)return;
    ctx.save();ctx.globalAlpha=state.opacity;ctx.lineJoin='round';ctx.lineCap='round';
    const left=width*v.waveformLeft,span=width*(v.waveformRight-v.waveformLeft);
    const center=height*v.waveformCenterY,amplitude=height*v.waveformPanelHeight/2*v.waveformAmplitudeScale;
    const last=Math.floor(state.reveal*v.waveformSamples);
    // 严格两条路径：GR 主频与上方模式同源；modified 仅额外加入一个半频成分。
    for(const branch of ['gr','modified']){ // 金橙叠加曲线后绘制；灰白 GR 在相交位置外仍保持清楚。
      const color=branch==='gr'?v.waveformColorGR:v.waveformColorModified;
      const rgb=parseInt(color.slice(1),16);
      ctx.globalAlpha=state.opacity*(branch==='modified'?v.waveformModifiedOpacity:1);
      ctx.strokeStyle=color;ctx.shadowColor=`rgba(${rgb>>16},${(rgb>>8)&255},${rgb&255},${v.waveformGlowStrength})`;
      ctx.shadowBlur=v.waveformGlowBlur*scale;
      ctx.lineWidth=Math.max(v.minWaveformLineWidth,branch==='gr'?v.waveformLineWidthGR:v.waveformLineWidthModified);
      ctx.beginPath();ctx.moveTo(left,center-amplitude*samples[0][branch].strain);
      for(let j=1;j<=last;j++)ctx.lineTo(left+span*j/v.waveformSamples,center-amplitude*samples[j][branch].strain);
      if(state.reveal<1)ctx.lineTo(left+span*state.reveal,center-amplitude*state.signal[branch].strain);
      ctx.stroke();
    }
    ctx.restore();
  }};
}
