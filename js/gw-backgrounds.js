import {mountAnimation} from './animation-loader.js';
const source=document.getElementById('gw-backgrounds-source'),signal=document.getElementById('gw-backgrounds-strain');
if(source&&signal)mountAnimation(source,({startGWBackgroundAnimation})=>startGWBackgroundAnimation(source,signal),
  ()=>import('./gw-backgrounds/src/main.js?v=signals48-20261014'));
