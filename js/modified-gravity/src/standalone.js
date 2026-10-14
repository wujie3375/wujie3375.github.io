import {startModifiedGravityAnimation} from './main.js';
startModifiedGravityAnimation(document.getElementById('modified-gravity-canvas')).catch(error=>{
  console.error(error);
  document.querySelector('.animation-error').hidden=false;
});
