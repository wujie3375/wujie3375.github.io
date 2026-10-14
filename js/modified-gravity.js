import {mountAnimation} from './animation-loader.js';
const canvas=document.getElementById('modified-gravity-canvas');
mountAnimation(canvas,({startModifiedGravityAnimation})=>startModifiedGravityAnimation(canvas),
  ()=>import('./modified-gravity/src/main.js'));
