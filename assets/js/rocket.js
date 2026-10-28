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

  // 页面滚到页脚时，火箭保持在白色正文区域，不盖住黑色页脚。
  const footer = document.querySelector('.footer-wrap');
  if (footer) {
    let pending = false;
    function updateRocketPosition() {
      pending = false;
      const overlap = Math.max(0, window.innerHeight - footer.getBoundingClientRect().top + 12);
      rocket.style.setProperty('--rocket-footer-clearance', overlap + 'px');
    }
    function schedulePositionUpdate() {
      if (!pending) {
        pending = true;
        window.requestAnimationFrame(updateRocketPosition);
      }
    }
    window.addEventListener('scroll', schedulePositionUpdate, { passive: true });
    window.addEventListener('resize', schedulePositionUpdate, { passive: true });
    updateRocketPosition();
  }
}());
