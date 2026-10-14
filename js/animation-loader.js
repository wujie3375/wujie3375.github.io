/* 提前下载模块，仍在原来的 300px 范围初始化；预下载不创建 GPU 或推进动画时钟。 */
const preloadMargin = '900px 0px';
const initializationMargin = '300px 0px';

export function mountAnimation(canvas, initialize, preload) {
  if (!canvas) return;
  let started = false;
  let observer;
  let preloadObserver;
  let prepared;
  canvas.dataset.loadState = 'waiting';
  function prepare() {
    if (!prepared) {
      canvas.dataset.resourceState = 'loading';
      prepared = Promise.resolve().then(() => preload?.()).then(module => {
        canvas.dataset.resourceState = 'ready';
        return module;
      });
      // 提前下载失败由 start 的统一错误处理显示，避免未处理的 Promise 拒绝。
      prepared.catch(() => { canvas.dataset.resourceState = 'error'; });
    }
    preloadObserver?.disconnect();
    return prepared;
  }
  function start() {
    if (started) return;
    started = true;
    observer?.disconnect();
    preloadObserver?.disconnect();
    canvas.dataset.loadState = 'loading';
    prepare().then(initialize).then(() => {
      canvas.dataset.loadState = 'ready';
    }).catch(error => {
      canvas.dataset.loadState = 'error';
      console.error('Research animation initialization failed:', error);
      const message = canvas.parentElement?.querySelector('.research-animation-error, .animation-error');
      if (message) message.hidden = false;
    });
  }
  if (typeof IntersectionObserver !== 'function') {
    start();
    return;
  }
  if (preload) {
    preloadObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) prepare();
    }, {rootMargin: preloadMargin});
    preloadObserver.observe(canvas);
  }
  observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) start();
  }, {rootMargin: initializationMargin});
  observer.observe(canvas);
}
