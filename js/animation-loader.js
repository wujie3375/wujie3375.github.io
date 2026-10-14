/* 只负责首次初始化时机，不改变任何动画的物理参数、播放时钟或暂停机制。 */
const preloadMargin = '300px 0px';

export function mountAnimation(canvas, initialize) {
  if (!canvas) return;
  let started = false;
  let observer;
  canvas.dataset.loadState = 'waiting';
  function start() {
    if (started) return;
    started = true;
    observer?.disconnect();
    canvas.dataset.loadState = 'loading';
    Promise.resolve().then(initialize).then(() => {
      canvas.dataset.loadState = 'ready';
    }).catch(error => {
      canvas.dataset.loadState = 'error';
      console.error('Research animation initialization failed:', error);
      const message = canvas.parentElement?.querySelector('.research-animation-error');
      if (message) message.hidden = false;
    });
  }
  if (typeof IntersectionObserver !== 'function') {
    start();
    return;
  }
  observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) start();
  }, {rootMargin: preloadMargin});
  observer.observe(canvas);
}
