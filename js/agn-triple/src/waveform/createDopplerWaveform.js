export function createDopplerWaveform(canvas,model,v){
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D is unavailable');
  let width=1,height=1,ratio=1;
  return {resize(w,h,pixelRatio){width=w;height=h;ratio=pixelRatio;canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);},
    draw(state){
      ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
      const left=width*v.waveformLeft,span=width*(v.waveformRight-v.waveformLeft),center=height*v.waveformCenterY,amp=height*v.waveformHeight/2;
      ctx.save();ctx.globalAlpha=state.opacity;ctx.strokeStyle=v.waveformColor;ctx.lineWidth=v.waveformLineWidth;
      ctx.lineJoin='round';ctx.lineCap='round';ctx.shadowColor='rgba(241,207,141,0.22)';ctx.shadowBlur=v.waveformGlowBlur;
      ctx.beginPath();
      for(let j=0;j<=v.waveformSamples;j++){
        const u=j/v.waveformSamples,sample=model.evaluate(state.displayTime-u*v.waveformVisibleWindow);
        const x=left+span*u,y=center-amp*sample.strain;
        if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.stroke();ctx.restore();canvas.dataset.cycleTime=state.t.toFixed(4);
      canvas.dataset.sourceFrequency=state.signal.source.toFixed(6);canvas.dataset.observedFrequency=state.signal.observed.toFixed(6);
      canvas.dataset.betaLOS=state.signal.beta.toFixed(8);canvas.dataset.dopplerVisualBoost=model.dopplerVisualBoost.toFixed(3);
      canvas.dataset.windowSeconds=String(v.waveformVisibleWindow);canvas.dataset.scrollDirection='left-to-right';
    }};
}
