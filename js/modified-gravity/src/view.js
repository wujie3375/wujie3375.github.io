import {createPolarizationPanels} from './panels/polarizationPanels.js';
import {createWaveformPanel} from './panels/waveformPanel.js';

export function createModifiedGravityView(canvas,driver,v){
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw new Error('Canvas 2D is unavailable');
  const background=canvas.ownerDocument.createElement('canvas'),staticCtx=background.getContext('2d',{alpha:false});
  const panels=createPolarizationPanels(v),waveform=createWaveformPanel(driver,v);
  let ratio=1;
  return {resize(width,height,pixelRatio){
    ratio=pixelRatio;canvas.width=background.width=Math.floor(width*ratio);canvas.height=background.height=Math.floor(height*ratio);
    panels.resize(width,height);waveform.resize(width,height);
    staticCtx.setTransform(ratio,0,0,ratio,0,0);staticCtx.fillStyle=v.backgroundColor;staticCtx.fillRect(0,0,width,height);
    panels.drawStatic(staticCtx);waveform.drawStatic(staticCtx);
  },draw(state){
    ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(background,0,0);
    ctx.setTransform(ratio,0,0,ratio,0,0);panels.draw(ctx,state);waveform.draw(ctx,state);
    canvas.dataset.phase=state.phase.toFixed(6);canvas.dataset.polarizationPhase=state.phase.toFixed(6);
    canvas.dataset.modifiedExtraPhase=state.signal.modified.extraPhase.toFixed(6);
    canvas.dataset.modifiedExtraFrequency=state.signal.modified.extraFrequency.toFixed(6);
    canvas.dataset.grPhase=state.signal.gr.phase.toFixed(6);canvas.dataset.frequency=state.frequency.toFixed(6);
    canvas.dataset.cycleTime=state.t.toFixed(4);canvas.dataset.reveal=state.reveal.toFixed(6);
    canvas.dataset.loopOpacity=state.opacity.toFixed(6);
  }};
}
