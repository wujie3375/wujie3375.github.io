import {mountAnimation} from './animation-loader.js';
const source=document.getElementById('waveform-modeling-source');
const strain=document.getElementById('waveform-modeling-strain');
if(source&&strain) mountAnimation(source,({startWaveformAnimation})=>startWaveformAnimation(source,strain),
  ()=>import('./waveform-modeling/src/main.js'));
