import {startAnimation} from './main.js';
startAnimation(document.getElementById('moving-sources-canvas')).catch(error=>{
  console.error(error);
  document.querySelector('.animation-error').hidden=false;
});
