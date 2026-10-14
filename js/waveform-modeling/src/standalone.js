import {startWaveformAnimation} from './main.js';
startWaveformAnimation(document.getElementById('waveform-modeling-source'),document.getElementById('waveform-modeling-strain')).catch(error=>{
  console.error(error);document.querySelector('.animation-error').hidden=false;
});
