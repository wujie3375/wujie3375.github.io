// 入口保持轻量：接近屏幕时才下载并初始化核心模块。
import {mountAnimation} from './animation-loader.js';
const canvas=document.getElementById('moving-sources-canvas');
mountAnimation(canvas,({startAnimation})=>startAnimation(canvas),
  ()=>import('./agn-triple/src/main.js'));
