/* 使用本地 Chart.js 2.9.4，保持原 QuickChart 的默认字体、图例、柱宽与坐标轴。
 * 修改统计规则请编辑 _includes/publication_chart.html 中的数据生成部分。
 */
(function () {
  'use strict';
  const canvas = document.getElementById('publication-chart');
  const config = document.getElementById('publication-chart-config');
  if (!canvas || !config || !window.Chart) return;
  new window.Chart(canvas.getContext('2d'), JSON.parse(config.textContent));
}());
