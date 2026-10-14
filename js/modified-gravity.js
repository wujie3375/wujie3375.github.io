import {mountAnimation} from './animation-loader.js';
const canvas=document.getElementById('modified-gravity-canvas');
mountAnimation(canvas,async()=>{
  const {startModifiedGravityAnimation}=await import('./modified-gravity/src/main.js');
  return startModifiedGravityAnimation(canvas);
});
