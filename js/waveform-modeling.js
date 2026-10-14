import {mountAnimation} from './animation-loader.js';
const source=document.getElementById('waveform-modeling-source');
const strain=document.getElementById('waveform-modeling-strain');
if(source&&strain) mountAnimation(source,async()=>{
  const {startWaveformAnimation}=await import('./waveform-modeling/src/main.js');
  return startWaveformAnimation(source,strain);
});
