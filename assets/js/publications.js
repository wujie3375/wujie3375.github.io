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
// 原生 radio 保证两项互斥；保留方框勾选外观与共享身份规则。
function filterPublications() {
  const controls = document.querySelectorAll('.publication-filters input[name="publication-view"]');
  const list = document.getElementById('all-articles');
  if (!controls.length || !list) return;
  const showFirst = Array.from(controls).some(input => input.checked && input.value === 'first');
  const cards = Array.from(list.querySelectorAll('.paper-card'));
  cards.forEach(card => {
    // 与原 First author 筛选一致，保留共一/通讯身份的既有归类逻辑。
    card.hidden = showFirst && card.dataset.authorRole === 'co-author';
  });
  const visibleCards = cards.filter(card => !card.hidden);
  visibleCards.forEach((card, index) => {
    const number = card.querySelector('.paper-card__number');
    if (number) number.textContent = '#' + (visibleCards.length - index);
  });
  list.querySelectorAll('.publication-year').forEach(section => {
    section.hidden = !Array.from(section.querySelectorAll('.paper-card')).some(card => !card.hidden);
  });
  document.dispatchEvent(new Event('toc:refresh'));
}
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.publication-filters input').forEach(input => {
    input.addEventListener('change', filterPublications);
  });
  filterPublications();
});
// 包括浏览器后退恢复的单选状态。
window.addEventListener('pageshow', filterPublications);
