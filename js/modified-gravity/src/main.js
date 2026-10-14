import {model,visual} from './config/params.js';
import {createWaveformDriver} from './animation/waveformDriver.js';
import {createModifiedGravityView} from './view.js';
import {renderPixelRatio} from '../../agn-triple/src/scene/renderSize.js';

export async function startModifiedGravityAnimation(canvas,p=model,v=visual){
  if(!canvas)return;
  const driver=createWaveformDriver(p),view=createModifiedGravityView(canvas,driver,v);
  const label=canvas.parentElement?.querySelector('.research-animation-labels,.animation-labels');
  if(label){if(label.firstElementChild)label.firstElementChild.textContent=v.titleText;else label.textContent=v.titleText;}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed=0,last=0,frame=0,visible=true;
  function draw(){
    const state=driver.state(reduced.matches?v.staticTime:elapsed);
    view.draw(reduced.matches?{...state,reveal:1,opacity:1}:state);
  }
  function resize(){
    const {width,height}=canvas.getBoundingClientRect();if(!(width>0&&height>0))return;
    view.resize(width,height,renderPixelRatio(width,height,devicePixelRatio,v));draw();
  }
  function tick(timestamp){
    frame=0;if(!visible||document.hidden||reduced.matches)return;
    // 单频解析相位按播放时间取样；低帧率也不让整体 14 秒周期被人为放慢。
    if(last)elapsed+=Math.max(0,(timestamp-last)/1000);
    last=timestamp;draw();frame=requestAnimationFrame(tick);
  }
  function sync(){
    if(!visible||document.hidden||reduced.matches){cancelAnimationFrame(frame);frame=0;last=0;if(reduced.matches)draw();}
    else if(!frame){last=0;frame=requestAnimationFrame(tick);}
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});intersection.observe(canvas);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  canvas.dataset.engine='Canvas 2D + native ES modules';canvas.dataset.modeCount='6';canvas.dataset.waveformPaths='2';
  canvas.dataset.cycleDuration=String(p.cycleSeconds);
  resize();canvas.dataset.animationReady='true';sync();
  return {dispose(){cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();
    document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);
  }};
}
