export function createWaveformPanel(canvas,model,v){
  if(!([v.componentWeakAlpha,v.componentWaveAlpha,v.componentStrongAlpha,v.componentFeaturedAlpha].every(a=>a>0&&a<=1)&&
    v.componentWeakAlpha<v.componentWaveAlpha&&v.componentWaveAlpha<v.componentStrongAlpha&&v.componentAlphaFloor>0&&v.componentAlphaFloor<=1))
    throw new RangeError('Invalid component waveform visibility');
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D is unavailable');
  const count=v.waveformSamples,spatial=model.sources.map(source=>{
    const cosine=new Float64Array(count+1),sine=new Float64Array(count+1);
    for(let j=0;j<=count;j++){
      const phase=2*Math.PI*source.frequency*(j/count-0.5)*v.waveformTimeWindow;
      cosine[j]=Math.cos(phase);sine[j]=Math.sin(phase);
    }
    return {cosine,sine};
  });
  let width=1,height=1,ratio=1;
  const weights=new Float64Array(model.sources.length*2),sum=new Float64Array(count+1);
  // 弱曲线先绘、强曲线最后绘，避免随机编号顺序把强曲线反复盖暗；所有曲线共用固定比例。
  const featured=new Set(v.featuredSourceIds);
  // 每源分层显示透明度，不改变真实振幅、相位或参与求和的分量。
  const opacities=model.sources.map(s=>{
    if(featured.has(s.id))return v.componentFeaturedAlpha;
    const base=s.category==='strong'?v.componentStrongAlpha:s.category==='weak'?v.componentWeakAlpha:v.componentWaveAlpha;
    return base*(v.componentAlphaFloor+(1-v.componentAlphaFloor)*Math.sqrt(s.amplitude/model.maximumAmplitude));
  });
  const drawingOrder=model.parameters.representativeSources.slice().sort((a,b)=>
    Number(featured.has(a))-Number(featured.has(b))||model.sources[a].amplitude-model.sources[b].amplitude);
  function path(center,halfHeight,values,color,alpha,lineWidth,glow=false){
    ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.lineWidth=lineWidth;ctx.lineJoin='round';ctx.lineCap='round';
    ctx.shadowBlur=glow?v.waveformGlowBlur:0;ctx.shadowColor=`rgba(241,206,140,${v.waveformGlowAlpha})`;
    const left=width*v.waveformLeft,span=width*(v.waveformRight-v.waveformLeft);
    ctx.beginPath();
    for(let j=0;j<=count;j++){
      const x=left+span*j/count,y=center-halfHeight*values(j);
      if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();ctx.shadowBlur=0;
  }
  return {resize(w,h,pixelRatio){width=w;height=h;ratio=pixelRatio;canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);},
    draw(state){
      ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
      state.systems.forEach(({source,wave},i)=>{weights[2*i]=source.amplitude*Math.cos(wave.phase);weights[2*i+1]=source.amplitude*Math.sin(wave.phase);});
      sum.fill(0);
      model.sources.forEach((source,i)=>{
        const {cosine,sine}=spatial[i],a=weights[2*i],b=weights[2*i+1];
        for(let j=0;j<=count;j++)sum[j]+=a*cosine[j]-b*sine[j];
      });
      ctx.save();
      for(const i of drawingOrder){
        const {cosine,sine}=spatial[i];
        path(height*v.componentCenterY,height*v.componentHeight/(2*model.maximumAmplitude),
          j=>weights[2*i]*cosine[j]-weights[2*i+1]*sine[j],v.componentWaveColor,
          opacities[i],
          featured.has(i)?v.componentFeaturedLineWidth:v.componentLineWidth);
      }
      path(height*v.sumCenterY,height*v.sumHeight/(2*model.sumDisplayBound),j=>sum[j],
        v.sumWaveColor,v.sumWaveAlpha,v.sumWaveLineWidth,true);
      const font=Math.max(v.minWaveformLegendFont,v.waveformLegendFont*width/v.canvasWidth);
      ctx.font=`${font}px Arial,sans-serif`;ctx.textBaseline='alphabetic';
      for(const [text,y,color] of [[v.individualSourcesLabel,height*v.componentLegendY,v.componentWaveColor],
        [v.confusionLabel,height*v.sumLegendY,v.sumWaveColor]]){
        const x=width*v.waveformLeft,metrics=ctx.measureText(text),ascent=metrics.actualBoundingBoxAscent??font*0.8,descent=metrics.actualBoundingBoxDescent??font*0.2;
        ctx.globalAlpha=v.labelBackgroundAlpha;ctx.fillStyle='#'+v.backgroundColor.toString(16).padStart(6,'0');
        ctx.fillRect(x-v.labelPadding,y-ascent-v.labelPadding,metrics.width+2*v.labelPadding,ascent+descent+2*v.labelPadding);
        ctx.globalAlpha=1;ctx.fillStyle=color;ctx.fillText(text,x,y);
      }
      ctx.restore();
      canvas.dataset.componentWaves=String(model.parameters.representativeSources.length);
      canvas.dataset.summedSources=String(model.sources.length);canvas.dataset.cycleTime=state.t.toFixed(4);
    }};
}
