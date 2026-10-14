import {mountAnimation} from './animation-loader.js';
const source=document.getElementById('gw-backgrounds-source'),signal=document.getElementById('gw-backgrounds-strain');
if(source&&signal)mountAnimation(source,async()=>{
  const {startGWBackgroundAnimation}=await import('./gw-backgrounds/src/main.js?v=signals48-20261014');
  return startGWBackgroundAnimation(source,signal);
});
