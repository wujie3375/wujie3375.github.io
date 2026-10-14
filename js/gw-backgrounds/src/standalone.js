import {startGWBackgroundAnimation} from './main.js';
startGWBackgroundAnimation(document.getElementById('gw-backgrounds-source'),document.getElementById('gw-backgrounds-strain')).catch(error=>{
  console.error('GW Backgrounds initialization failed:',error);document.querySelector('.animation-error').hidden=false;
});
