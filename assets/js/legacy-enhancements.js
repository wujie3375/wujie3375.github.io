/* 普通页面不再下载 jQuery 与旧灯箱包；需要时仍保留原有功能。 */
(function () {
  'use strict';
  const script = document.currentScript;
  if (!script) return;
  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      const element = document.createElement('script');
      element.src = url;
      element.async = true;
      element.onload = resolve;
      element.onerror = function () { reject(new Error('Could not load ' + url)); };
      document.head.appendChild(element);
    });
  }
  function initialize() {
    const needsLegacy = document.querySelector(
      "a[href$='.jpg'], a[href$='.png'], a[href$='.gif'], .toc h3, " +
      "article iframe[src*='player.vimeo.com'], article iframe[src*='www.youtube.com'], " +
      "article iframe[src*='www.youtube-nocookie.com'], article iframe[src*='www.kickstarter.com'], " +
      "article object, article embed"
    );
    if (!needsLegacy) return;
    const jquery = window.jQuery ? Promise.resolve() : loadScript(script.dataset.jqueryUrl);
    jquery.then(function () {
      return loadScript(script.dataset.mainUrl);
    }).catch(function (error) {
      // 原始图片链接/嵌入内容仍能正常使用，只是不启用可选增强。
      console.error('Optional legacy enhancements unavailable:', error);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
}());
