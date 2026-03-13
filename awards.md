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

    {% include meeting_card.html 
      date_en="Dec 28, 2025" date_zh="2025-12-28"
      role_en="Volunteer" role_zh="会务"
      title_en="Workshop on Theory and Experiments of Multiband Gravitational-Wave Detection"
      title_zh="多波段引力波探测理论及实验研讨会"
      location_en="Chongqing, China" location_zh="重庆" %}

    {% include meeting_card.html 
      date_en="Dec 13, 2025" date_zh="2025-12-13"
      role_en="Participant" role_zh="参会"
      title_en="Chongqing Symposium on Frontiers of Theoretical Physics"
      title_zh="重庆市理论物理前沿学术研讨会"
      location_en="Chongqing, China" location_zh="重庆" %}

    {% include meeting_card.html 
      date_en="Jul 7, 2025" date_zh="2025-7-7"
      role_en="Presenter" role_zh="报告"
      title_en="Workshop on Space Gravitational-Wave Detection Signal Simulation, Processing, and Verification (National Key R&D Program Project)"
      title_zh="国家重点研发计划 “空间引力波探测信号仿真、处理与验证技术研究” 项目研讨会"
      location_en="Zhuhai, Guangdong, China" location_zh="广东珠海"
      photo="250706.jpg" %}

    {% include meeting_card.html 
      date_en="Apr 19, 2025" date_zh="2025-4-19"
      role_en="Presenter" role_zh="报告"
      title_en="The 2025 Annual Academic Conference and National Congress of the Gravitation and Relativistic Astrophysics Branch of the Chinese Physical Society"
      title_zh="中国物理学会引力与相对论天体物理分会2025年学术年会暨全国会员代表大会"
      location_en="Kunming, Yunnan, China" location_zh="云南昆明"
      photo="250420.jpg"
      ppt="250420.pdf" %}

    {% include meeting_card.html 
      date_en="Jan 14, 2025" date_zh="2025-1-14"
      role_en="Volunteer" role_zh="会务"
      title_en="The 2025 Chongqing Symposium on Gravity and Cosmology"
      title_zh="2025年重庆引力与宇宙学研讨会"
      location_en="Chongqing, China" location_zh="重庆"
      photo="250114.jpg" %}

    {% include meeting_card.html 
      date_en="Dec 14, 2024" date_zh="2024-12-14"
      role_en="Participant" role_zh="参会"
      title_en="Workshop on Space Gravitational-Wave Detection Signal Simulation, Processing, and Verification (National Key R&D Program Project)"
      title_zh="国家重点研发计划 “引力波探测” 重点专项 “空间引力波探测信号仿真、处理与验证技术研究” 项目启动暨实施方案论证会"
      location_en="Zhuhai, Guangdong, China" location_zh="广东珠海" %}

    {% include meeting_card.html 
      date_en="Apr 19, 2024" date_zh="2024-4-19"
      role_en="Presenter" role_zh="报告"
      title_en="The 2024 Annual Meeting of Gravitation and Relativity Astrophysics Division of Chinese Physical Society & 6th Galileo–Xu Guangqi Meeting"
      title_zh="中国物理学会引力与相对论天体物理分会2024年学术年会暨第六届伽利略—徐光启国际会议"
      location_en="Hengyang, Hunan, China" location_zh="湖南衡阳"
      photo="240419.jpg"
      ppt="240419.pdf" %}

    {% include meeting_card.html 
      date_en="Apr 9, 2024" date_zh="2024-4-9"
      role_en="Participant" role_zh="参会"
      title_en="The 2nd International Mini-Workshop on Gravitational Waves and the Early Universe"
      title_zh="第二届引力波与早期宇宙国际小型研讨会"
      location_en="Beijing, China" location_zh="北京"
      photo="240409.jpg" %}

    {% include meeting_card.html 
      date_en="Oct 28, 2023" date_zh="2023-10-28"
      role_en="Volunteer" role_zh="会务"
      title_en="The 2023 Electrodynamics Textbook and Course Construction Seminar"
      title_zh="2023年电动力学精品教材与课程建设研讨会"
      location_en="Chongqing, China" location_zh="重庆"
      photo="231028.jpg" %}

    {% include meeting_card.html 
      date_en="Oct 13, 2023" date_zh="2023-10-13"
      role_en="Participant" role_zh="参会"
      title_en="The 2023 Sichuan–Chongqing Theoretical Physics Frontier Symposium"
      title_zh="2023年度川渝地区理论物理前沿学术研讨会"
      location_en="Chengdu, Sichuan, China" location_zh="四川成都"
      photo="231013.jpg" %}

    {% include meeting_card.html 
      date_en="Apr 22, 2023" date_zh="2023-4-22"
      role_en="Volunteer" role_zh="会务"
      title_en="The 2023 Annual Meeting of the Chinese Physical Society, Division of Gravitation and Relativity Astrophysics"
      title_zh="中国物理学会引力与相对论天体物理分会2023年学术年会"
      location_en="Chongqing, China" location_zh="重庆" %}

    {% include meeting_card.html 
      date_en="Apr 21, 2023" date_zh="2023-4-21"
      role_en="Volunteer" role_zh="会务"
      title_en="2022 Annual Progress Meeting on Template Library and Signal Recognition for Space Gravitational Wave Detection"
      title_zh="空间引力波探测模板库与信号识别技术 2022 年度推进会"
      location_en="Chongqing, China" location_zh="重庆" %}

    {% include meeting_card.html 
      date_en="Apr 1, 2023" date_zh="2023-4-1"
      role_en="Participant" role_zh="参会"
      title_en="Chongqing Theoretical Physics Frontier Academic Seminar"
      title_zh="重庆市理论物理前沿学术研讨会"
      location_en="Chongqing, China" location_zh="重庆"
      photo="230401.jpg" %}

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
