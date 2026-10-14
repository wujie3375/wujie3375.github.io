// 所有论文卡片共用一个作者展开函数，不在每张卡片重复输出。
function toggleAuthors(uniqueId) {
  const full = document.getElementById('author-full-' + uniqueId);
  const more = document.getElementById('etal-link-' + uniqueId);
  if (!full || !more) return;
  const expanding = full.style.display === 'none';
  full.style.display = expanding ? 'inline' : 'none';
  more.style.display = expanding ? 'none' : 'inline';
  more.setAttribute('aria-expanded', expanding ? 'true' : 'false');
  if (!expanding) more.focus();
}
// 同步切换函数
function toggleDisplay() {
  const showFirst = document.getElementById("show-all").checked;
  
  // 切换文章列表
  document.getElementById("first-author-only").style.display = showFirst ? "block" : "none";
  document.getElementById("all-articles").style.display = showFirst ? "none" : "block";
  document.dispatchEvent(new Event('toc:refresh'));
  
  // 切换统计图表
  const firstChart = document.getElementById("first-author-chart");
  const allChart = document.getElementById("all-chart");
  if (firstChart && allChart) {
    firstChart.style.display = showFirst ? "block" : "none";
    allChart.style.display = showFirst ? "none" : "block";
  }
}
// 刷新页面后同步浏览器恢复的复选框状态与目录。
window.addEventListener('DOMContentLoaded', toggleDisplay);
