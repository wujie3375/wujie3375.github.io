/* 与目录共用原生滚动，不重复绑定，也尊重减少动画的系统偏好。 */
(function () {
  'use strict';
  const rocket = document.getElementById('rocket');
  if (!rocket) return;
  function scrollToTop() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }
  rocket.addEventListener('click', scrollToTop);
  rocket.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToTop();
    }
  });
}());
