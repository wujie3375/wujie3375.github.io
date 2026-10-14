export function createWaveform(canvas,model,v) {
  const context=canvas.getContext('2d');
  if(!context) throw new Error('Canvas 2D is unavailable');
  const strain=new Float64Array(v.waveformSamples+1);
  const end=model.parameters.signalEnd;
  for(let j=0;j<strain.length;j++) strain[j]=model.evaluate(end*j/v.waveformSamples).strain;
  const glow=parseInt(v.waveformGlowColor.slice(1),16);
  let width=1,height=1,ratio=1;
  return {resize(w,h,pixelRatio){
    width=w;height=h;ratio=pixelRatio;
    canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);
    context.setTransform(ratio,0,0,ratio,0,0);
  },draw(state){
    context.clearRect(0,0,width,height);
    if(state.opacity<=0.001||state.reveal<=0) return;
    const left=width*v.waveformLeft,span=width*(v.waveformRight-v.waveformLeft);
    const center=height*v.waveformCenterY,amplitude=height*v.waveformHeight/2;
    const last=Math.floor(state.reveal*v.waveformSamples);
    context.beginPath();context.moveTo(left,center-amplitude*strain[0]);
    for(let j=1;j<=last;j++) context.lineTo(left+span*j/v.waveformSamples,center-amplitude*strain[j]);
    if(state.reveal<1) context.lineTo(left+span*state.reveal,center-amplitude*state.signal.strain);
    context.globalAlpha=state.opacity;context.lineWidth=v.waveformLineWidth;
    context.strokeStyle=v.waveformColor;context.lineJoin='round';context.lineCap='round';
    context.shadowColor=`rgba(${glow>>16},${(glow>>8)&255},${glow&255},${v.waveformGlowStrength})`;
    context.shadowBlur=v.waveformGlowBlur*ratio;context.stroke();context.globalAlpha=1;
  }};
}
