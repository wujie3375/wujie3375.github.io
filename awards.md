---
layout: page
permalink: /awards
title: Honors & Activities
---

> **Last Update:** Oct 8, 2025

# Awards

-  **Dec 2023:**  
  **Second Prize** (Ranked 2nd/3rd), *The 7th Sichuan Chongqing Astronomy Competition*
-  **Jun 2022:**  
  **Excellent Graduation Thesis**, *China West Normal U.*
-  **May 2022:**  
  **Outstanding Graduate**, *China West Normal U.*
-  **Nov 2018:**  
  **Third Prize** (Ranked 7th/8th),  *The 5th Sichuan Chongqing Astronomy Competition* 

---

# Scholarships

-  **Spe 2024:**  
  **Theoretical Physics Graduate Scholarship** (Twice), *Chongqing U.*
-  **2022 - 2023:**  
  **Graduate Academic Scholarship** (Twice), *Chongqing U.*
-  **2020 - 2022:**  
  **Fist-class Scholarship** (Three times), *China West Normal U.* 
-  **Dec 2020:**  
  **Haotian Astronomy Scholarship**, *Nanjing VasTech Astronomical Instrument & Equipment Co. Ltd.*
-  **2018 - 2021:**  
  **Second-class Scholarship** (Four times), *China West Normal U.* 

---

# Funding

<p style="margin-bottom: 6px;">
  At the moment, I’m usually a participant; with luck, I’ll someday evolve into a PI instead of just a supporting citation in the acknowledgments.
</p>

<!-- 复选框风格按钮：未选=英文；选中=中文 -->
<div class="checkbox-container" style="margin: 6px 0 8px;">
  <input type="checkbox" id="funding-lang-cn" aria-label="Show Chinese">
  <label for="funding-lang-cn">中文 / EN</label>
</div>

<!-- 局部作用域容器：仅影响这里 -->
<div id="funding-block" data-lang="en" style="height: 500px; overflow-y: scroll; border: 0px solid #ccc; padding: 0 10px 0 0;">
  <ul style="margin: 0; padding-left: 0em;">

    {% include funding_card.html
       time="Jan 2026 – Dec 2029" time_zh="2026-1 至 2029-12"
       institution_en="National Natural Science Foundation of China (NSFC)"
       institution_zh="国家自然科学基金"
       type_en="General Program"
       type_zh="面上项目"
       project_en="Machine-learning optimization of waveform generation for multiple types of compact-binary mergers"
       project_zh="利用机器学习优化多类型致密双星并合引力波波形生成的研究"
       role_en="Participant" role_zh="参与"
       meta_en="Grant No. 12575072 | CNY 540,000 | Ongoing"
       meta_zh="项目号：12575072｜ CNY 54.0万元｜在研" %}

    {% include funding_card.html
       time="Aug 2024 – Dec 2028" time_zh="2024-8 至 2028-12"
       institution_en="Ministry of Science and Technology of the People’s Republic of China"
       institution_zh="中华人民共和国科学技术部"
       type_en="National Key Research and Development Program"
       type_zh="国家重点研发计划课题"
       project_en="Simulation, processing, and verification of gravitational-wave signals from binary black-hole systems"
       project_zh="双黑洞系统引力波信号仿真、处理与验证研究"
       role_en="Participant" role_zh="参与"
       meta_en="Grant No. 2023YFC2206702 | CNY 4,775,000 | Ongoing"
       meta_zh="项目号：2023YFC2206702｜ CNY 477.5万元｜在研" %}

    {% include funding_card.html
       time="Jul 2023 – Jun 2026" time_zh="2023-7 至 2026-6"
       institution_en="Natural Science Foundation of Chongqing"
       institution_zh="重庆市自然科学基金"
       type_en="General Program"
       type_zh="面上项目"
       project_en="Joint observation of the cosmic-string stochastic gravitational-wave background with space-based detectors"
       project_zh="利用空间引力波探测器联合观测宇宙弦随机引力波背景的研究"
       role_en="Participant" role_zh="参与"
       meta_en="Grant No. CSTB2023NSCQ-MSX0103 | CNY 50,000 | Ongoing"
       meta_zh="项目号：CSTB2023NSCQ-MSX0103｜ CNY 5.0万元｜在研" %}

    {% include funding_card.html
       time="Jan 2022 – Sep 2026" time_zh="2022-01 至 2026-09"
       institution_en="Ministry of Science and Technology of the People’s Republic of China"
       institution_zh="中华人民共和国科学技术部"
       type_en="National Key Research and Development Program"
       type_zh="国家重点研发计划课题"
       project_en="Characteristics and signal identification of novel gravitational-wave sources (e.g., cosmic strings) and their stochastic backgrounds"
       project_zh="宇宙弦等新颖引力波源与随机引力波背景的特征和信号识别研究"
       role_en="Participant" role_zh="参与"
       meta_en="Grant No. 2021YFC2203004 | CNY 4,400,000 | Ongoing"
       meta_zh="项目号：2021YFC2203004｜ CNY 440.0万元｜在研" %}

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
