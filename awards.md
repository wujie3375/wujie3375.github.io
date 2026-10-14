---
layout: page
permalink: /awards
title: Honors
---

<!-- > **Last Update:** Mar 13, 2026 -->

{% assign honors_styles = site.static_files | where: 'path', '/assets/css/honors.css' | first %}
<link rel="stylesheet" href="{{ '/assets/css/honors.css' | relative_url }}?v={{ honors_styles.modified_time | date: '%s' }}">

<div class="honors-page" id="honors-content" data-lang="en" lang="en" markdown="1">

# Honors

<div class="honors-language" role="group" aria-label="Language">
  <button type="button" data-language="en" aria-pressed="true" aria-controls="awards-block scholarships-block">English</button>
  <button type="button" data-language="zh" aria-pressed="false" aria-controls="awards-block scholarships-block" lang="zh">中文</button>
</div>

<section class="honors-section" id="awards-block" aria-labelledby="awards">
  <h2 id="awards">Awards</h2>
  <ul class="honors-list">
    {% for award in site.data.awards %}
    <li class="honor-entry">
      <div class="honor-entry__lang lang-en" lang="en">
        <span class="honor-entry__date">{{ award.date_en }}</span>
        <div class="honor-entry__body">
          <div class="honor-entry__title"><strong>{{ award.title_en }}</strong>{% if award.extra_en %} <span class="honor-entry__extra">{{ award.extra_en }}</span>{% endif %}</div>
          <div class="honor-entry__org">{{ award.org_en }}</div>
        </div>
      </div>
      <div class="honor-entry__lang lang-zh" lang="zh">
        <span class="honor-entry__date">{{ award.date_zh }}</span>
        <div class="honor-entry__body">
          <div class="honor-entry__title"><strong>{{ award.title_zh }}</strong>{% if award.extra_zh %} <span class="honor-entry__extra">{{ award.extra_zh }}</span>{% endif %}</div>
          <div class="honor-entry__org">{{ award.org_zh }}</div>
        </div>
      </div>
    </li>
    {% endfor %}
  </ul>
</section>

<section class="honors-section" id="scholarships-block" aria-labelledby="scholarships">
  <h2 id="scholarships">Scholarships</h2>
  <ul class="honors-list">
    {% for s in site.data.scholarships %}
    <li class="honor-entry">
      <div class="honor-entry__lang lang-en" lang="en">
        <span class="honor-entry__date">{{ s.date_en }}</span>
        <div class="honor-entry__body">
          <div class="honor-entry__title"><strong>{{ s.title_en }}</strong>{% if s.extra_en %} <span class="honor-entry__extra">{{ s.extra_en }}</span>{% endif %}</div>
          <div class="honor-entry__org">{{ s.org_en }}</div>
        </div>
      </div>
      <div class="honor-entry__lang lang-zh" lang="zh">
        <span class="honor-entry__date">{{ s.date_zh }}</span>
        <div class="honor-entry__body">
          <div class="honor-entry__title"><strong>{{ s.title_zh }}</strong>{% if s.extra_zh %} <span class="honor-entry__extra">{{ s.extra_zh }}</span>{% endif %}</div>
          <div class="honor-entry__org">{{ s.org_zh }}</div>
        </div>
      </div>
    </li>
    {% endfor %}
  </ul>
</section>

</div>

<script>
  (function () {
    const page = document.getElementById('honors-content');
    if (!page) return;
    const buttons = page.querySelectorAll('[data-language]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const language = button.getAttribute('data-language');
        page.setAttribute('data-lang', language);
        page.setAttribute('lang', language);
        buttons.forEach(function (item) {
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        // 切换语言后条目高度可能改变，同步目录的当前章节。
        document.dispatchEvent(new Event('toc:refresh'));
      });
    });
  })();
</script>




