---
layout: page
permalink: /awards
title: Honors & Activities
---

<!-- > **Last Update:** Mar 13, 2026 -->

<style>
  /* 勾选框样式（沿用你提供的风格，稍微改了 id） */
  .checkbox-container {
    font-size: 19px;
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 6px 0 14px 0;
  }
  #awards-lang-cn {
    width: 18px;
    height: 18px;
    margin: 0;
    accent-color: #36a2eb;
  }
  #awards-lang-cn + label {
    vertical-align: middle;
  }

  #awards-block .lang-en,
  #scholarships-block .lang-en { display: inline; }

  #awards-block .lang-zh,
  #scholarships-block .lang-zh { display: none; }

  #awards-block[data-lang="zh"] .lang-en,
  #scholarships-block[data-lang="zh"] .lang-en { display: none !important; }

  #awards-block[data-lang="zh"] .lang-zh,
  #scholarships-block[data-lang="zh"] .lang-zh { display: inline !important; }
</style>

# Awards

<div id="awards-block" data-lang="en">
  <div class="checkbox-container">
    <input type="checkbox" id="awards-lang-cn" />
    <label for="awards-lang-cn">中文/EN</label>
  </div>

  <ul>
    {% for award in site.data.awards %}
    <li>
      <span class="lang-en">
        <b>{{ award.date_en }}:</b>
        <b>{{ award.title_en }}</b>
        {% if award.extra_en %} {{ award.extra_en }}{% endif %},
        <i>{{ award.org_en }}</i>
      </span>

      <span class="lang-zh">
        <b>{{ award.date_zh }}：</b>
        <b>{{ award.title_zh }}</b>
        {% if award.extra_zh %}{{ award.extra_zh }}{% endif %},
        <i>{{ award.org_zh }}</i>
      </span>
    </li>
    {% endfor %}
  </ul>
</div>

<script>
  (function () {
    const block = document.getElementById("awards-block");
    const checkbox = document.getElementById("awards-lang-cn");
    if (!block || !checkbox) return;

    checkbox.checked = (block.getAttribute("data-lang") === "zh");

    checkbox.addEventListener("change", function () {
      block.setAttribute("data-lang", this.checked ? "zh" : "en");
    });
  })();
</script>

  <hr/>

  <!-- ===== Scholarships ===== -->
# Scholarships

<div id="scholarships-block" data-lang="en">
  <div class="checkbox-container">
    <input type="checkbox" id="scholarships-lang-cn" />
    <label for="scholarships-lang-cn">中文/EN</label>
  </div>
  <ul>
    {% for s in site.data.scholarships %}
    <li>
      <span class="lang-en">
        <b>{{ s.date_en }}:</b>
        <b>{{ s.title_en }}</b>
        {% if s.extra_en %} {{ s.extra_en }}{% endif %},
        <i>{{ s.org_en }}</i>
      </span>

      <span class="lang-zh">
        <b>{{ s.date_zh }}：</b>
        <b>{{ s.title_zh }}</b>
        {% if s.extra_zh %}{{ s.extra_zh }}{% endif %},
        <i>{{ s.org_zh }}</i>
      </span>
    </li>
    {% endfor %}
  </ul>
</div>

<script>
  (function () {
    const block = document.getElementById("scholarships-block");
    const checkbox = document.getElementById("scholarships-lang-cn");
    if (!block || !checkbox) return;

    checkbox.checked = (block.getAttribute("data-lang") === "zh");
    checkbox.addEventListener("change", function () {
      block.setAttribute("data-lang", this.checked ? "zh" : "en");
    });
  })();
</script>


---

# Funding

<!-- <p style="margin-bottom: 6px;">
  I’m still frequently a participant, but I’ve taken my first step as a PI — no longer only a supporting citation tucked away in the acknowledgments.
</p> -->

<!-- 复选框风格按钮：未选=英文；选中=中文 -->
<div class="checkbox-container" style="margin: 6px 0 8px;">
  <input type="checkbox" id="funding-lang-cn" aria-label="Show Chinese">
  <label for="funding-lang-cn">中文 / EN</label>
</div>

<!-- 局部作用域容器：仅影响这里 -->
<div id="funding-block" data-lang="en" style="height: 500px; overflow-y: scroll; border: 0px solid #ccc; padding: 0 10px 0 0;">
  <ul style="margin: 0; padding-left: 0em;">
  {% for f in site.data.fundings %}

  {% include funding_card.html
    time=f.time
    time_zh=f.time_zh
    institution_en=f.institution_en
    institution_zh=f.institution_zh
    type_en=f.type_en
    type_zh=f.type_zh
    project_en=f.project_en
    project_zh=f.project_zh
    role_en=f.role_en
    role_zh=f.role_zh
    meta_en=f.meta_en
    meta_zh=f.meta_zh %}

  {% endfor %}
  </ul>
</div>

<style>
  /* 复选框样式（按你提供的） */
  .checkbox-container {
    font-size: 19px;
    display: flex;
    align-items: center;
  }
  #funding-lang-cn {
    width: 18px;
    height: 18px;
    margin: 0 6px 0 0;
    accent-color: #36a2eb;
  }
  #funding-lang-cn + label {
    vertical-align: middle;
  }

  /* —— 语言切换：仅作用于 #funding-block —— */
  #funding-block .lang-en { display: inline; }
  #funding-block .lang-zh { display: none; }

  /* 勾选中文时：用 data-lang 切换，增加优先级并加 !important 防止后加载样式干扰 */
  #funding-block[data-lang="zh"] .lang-en { display: none !important; }
  #funding-block[data-lang="zh"] .lang-zh { display: inline !important; }
</style>

<script>
  (function () {
    const checkbox = document.getElementById('funding-lang-cn');
    const block = document.getElementById('funding-block');

    // 默认英文：data-lang="en"
    checkbox.addEventListener('change', function () {
      block.setAttribute('data-lang', checkbox.checked ? 'zh' : 'en');
    });
  })();
</script>

---

<!-- Meetings -->
# Meetings

<p style="margin-bottom: 6px;">
  A record of meetings I’ve attended — proof that I’m still alive and haven’t escaped from the academic world yet.
</p>

<!-- 复选框样式的语言切换（仅影响下方 #meetings-block） -->
<div class="checkbox-container" style="margin: 6px 0 8px;">
  <input type="checkbox" id="meetings-lang-cn" aria-label="Show Chinese">
  <label for="meetings-lang-cn">中文 / EN</label>
</div>

<div id="meetings-block" data-lang="en" style="height: 500px; overflow-y: scroll; border: 0px solid #ccc; padding: 0 10px 0 0;">
  <ul style="margin: 0; padding-left: 1.2em;">

  {% for m in site.data.meetings %}

  {% include meeting_card.html
    date_en=m.date_en
    date_zh=m.date_zh
    role_en=m.role_en
    role_zh=m.role_zh
    title_en=m.title_en
    title_zh=m.title_zh
    location_en=m.location_en
    location_zh=m.location_zh
    photo=m.photo
    ppt=m.ppt %}

  {% endfor %}

  </ul>
</div>

<style>
  /* 复选框样式（与你之前一致） */
  .checkbox-container {
    font-size: 19px; 
    display: flex; 
    align-items: center;
  }
  #meetings-lang-cn {
    width: 18px; 
    height: 18px; 
    margin: 0 6px 0 0; 
    accent-color: #36a2eb;
  }
  #meetings-lang-cn + label { vertical-align: middle; }

  /* —— 语言切换：仅作用于 #meetings-block —— */
  #meetings-block .lang-en { display: inline; }
  #meetings-block .lang-zh { display: none; }
  #meetings-block[data-lang="zh"] .lang-en { display: none !important; }
  #meetings-block[data-lang="zh"] .lang-zh { display: inline !important; }
</style>

<script>
  (function () {
    const checkbox = document.getElementById('meetings-lang-cn');
    const block = document.getElementById('meetings-block');
    checkbox.addEventListener('change', function () {
      block.setAttribute('data-lang', checkbox.checked ? 'zh' : 'en');
    });
  })();
</script>


---

> I don't really see the point in writing these; just think of them as a way to keep track, kind of like collecting stamps. (●-●)
