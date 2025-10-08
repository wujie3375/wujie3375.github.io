---
layout: page
permalink: /awards
title: Honors & Activities
---

> **Last Update:** Aug 23, 2025

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
  My role is usually marked as “Participant”. Hopefully, I’ll unlock the “Boss Level” soon.
</p>

<!-- 局部语言切换按钮：只作用于本区块 -->
<button id="funding-lang-toggle" style="margin: 6px 0 8px; padding: 2px 8px; cursor: pointer;">
  中 / EN
</button>

<div id="funding-block" style="height: 500px; overflow-y: scroll; border: 0px solid #ccc; padding: 0 10px 0 0;">
  <ul style="margin: 0; padding-left: 0em;">

    {% include funding_card.html
       time="Jan 2026 – Dec 2029" time_zh="2026年1月 – 2029年12月"
       institution_en="National Natural Science Foundation of China (NSFC)"
       institution_zh="国家自然科学基金委员会"
       type_en="General Program"
       type_zh="面上项目"
       project_en="Machine-learning optimization of waveform generation for multiple types of compact-binary mergers"
       project_zh="利用机器学习优化多类型致密双星并合引力波波形生成的研究"
       role_en="PARTICIPANT" role_zh="参与"
       meta_en="Grant No. 12575072 | CNY 540,000 | Ongoing"
       meta_zh="项目号：12575072｜经费：CNY 540,000｜在研" %}

    {% include funding_card.html
       time="Aug 2024 – Dec 2028" time_zh="2024年8月 – 2028年12月"
       institution_en="Ministry of Science and Technology of the People’s Republic of China"
       institution_zh="中华人民共和国科学技术部"
       type_en="National Key Research and Development Program"
       type_zh="国家重点研发计划课题"
       project_en="Simulation, processing, and verification of gravitational-wave signals from binary black-hole systems"
       project_zh="双黑洞系统引力波信号仿真、处理与验证研究"
       role_en="PARTICIPANT" role_zh="参与"
       meta_en="Grant No. 2023YFC2206702 | CNY 4,775,000 | Ongoing"
       meta_zh="项目号：2023YFC2206702｜经费：CNY 4,775,000｜在研" %}

    {% include funding_card.html
       time="Jul 2023 – Jun 2026" time_zh="2023年7月 – 2026年6月"
       institution_en="Natural Science Foundation of Chongqing"
       institution_zh="重庆市自然科学基金"
       type_en="General Program"
       type_zh="面上项目"
       project_en="Joint observation of the cosmic-string stochastic gravitational-wave background with space-based detectors"
       project_zh="利用空间引力波探测器联合观测宇宙弦随机引力波背景的研究"
       role_en="PARTICIPANT" role_zh="参与"
       meta_en="Grant No. CSTB2023NSCQ-MSX0103 | CNY 50,000 | Ongoing"
       meta_zh="项目号：CSTB2023NSCQ-MSX0103｜经费：CNY 50,000｜在研" %}

    {% include funding_card.html
       time="Jan 2022 – Sep 2026" time_zh="2022年1月 – 2026年9月"
       institution_en="Ministry of Science and Technology of the People’s Republic of China"
       institution_zh="中华人民共和国科学技术部"
       type_en="National Key Research and Development Program"
       type_zh="国家重点研发计划课题"
       project_en="Characteristics and signal identification of novel gravitational-wave sources (e.g., cosmic strings) and their stochastic backgrounds"
       project_zh="宇宙弦等新颖引力波源与随机引力波背景的特征和信号识别研究"
       role_en="PARTICIPANT" role_zh="参与"
       meta_en="Grant No. 2021YFC2203004 | CNY 4,400,000 | Ongoing"
       meta_zh="项目号：2021YFC2203004｜经费：CNY 4,400,000｜在研" %}

  </ul>
</div>

<script>
  // 仅切换 #funding-block 内所有 .funding-list 的语言（不影响全站）
  (function () {
    var btn = document.getElementById('funding-lang-toggle');
    btn.addEventListener('click', function () {
      document.querySelectorAll('#funding-block .funding-list').forEach(function (ul) {
        ul.classList.toggle('lang-zh');
      });
    });
  })();
</script>


---

# Meetings

<p style="margin-bottom: 3px;">
  Keep track of the meetings I've been to.
</p>

<div style="height: 500px; overflow-y: scroll; border: 0px solid #ccc; padding: 0 10px 0 0;">
  <ul style="margin: 0; padding-left: 1.2em;">

  {% include meeting_card.html 
  date="Apr 19, 2025" 
  role="PRESENTER" 
  title="The 2025 Annual Academic Conference and National Congress of the Gravitation and Relativistic Astrophysics Branch of the Chinese Physical Society." 
  location="Kunming, Yunnan, China" 
  photo="250420.jpg"
  ppt="250420.pdf" %}

  {% include meeting_card.html 
  date="Jan 14, 2025" 
  role="VOLUNTEER" 
  title="The 2025 Chongqing Symposium on Gravity and Cosmology" 
  location="Chongqing, China" 
  photo="250114.jpg" %}
  
  <!-- {% include meeting_card.html 
  date="Apr 19, 2024" 
  role="PRESENTER" 
  title="The 2024 Annual Meeting of Gravitation and Relativity Astrophysics Division of Chinese Physical Society and the Sixth Galileo-Xu Guangqi Meeting" 
  location="Hengyang, Hunan, China" 
  photo="240419.jpg" 
  ppt="240419.pdf" %} -->

  {% include meeting_card.html 
  date="Apr 19, 2024" 
  role="PRESENTER" 
  title="The 2024 Annual Meeting of Gravitation and Relativity Astrophysics Division of Chinese Physical Society and the Sixth Galileo-Xu Guangqi Meeting" 
  location="Hengyang, Hunan, China" %}
  
  {% include meeting_card.html 
  date="Apr 9, 2024" 
  role="PARTICIPANT" 
  title="The 2nd International Workshop on Gravitational Waves and the Early Universe" 
  location="Beijing, China" 
  photo="240409.jpg" %}

  {% include meeting_card.html 
  date="Oct 28, 2023" 
  role="PARTICIPANT" 
  title="The 2023 Electrodynamics textbook and course construction seminar" 
  location="Chongqing, China" 
  photo="231028.jpg" %}

  {% include meeting_card.html 
  date="Oct 13, 2023" 
  role="PARTICIPANT" 
  title="The 2023 Academic Symposium on the Frontiers of Theoretical Physics in Sichuan Chongqing Region" 
  location="Chengdu, Sichuan, China" 
  photo="231013.jpg" %}

  {% include meeting_card.html 
  date="Apr 22, 2023" 
  role="VOLUNTEER" 
  title="The 2023 Annual Meeting of the Chinese Physical Society, Division of Gravitation and Relativity Astrophysics" 
  location="Chongqing, China" %}

  {% include meeting_card.html 
  date="Apr 21, 2023" 
  role="VOLUNTEER" 
  title="Template Library and Signal Recognition Technology for Space Gravitational Wave Detection 2022 Annual Progress Conference" 
  location="Chongqing, China" %}

  {% include meeting_card.html 
  date="Apr 1, 2023" 
  role="PARTICIPANT" 
  title="Chongqing Theoretical Physics Frontier Academic Seminar" 
  location="Chongqing, China" 
  photo="230401.jpg" %}

</ul>
</div>

---

> I don't really see the point in writing these; just think of them as a way to keep track, kind of like collecting stamps. (●-●)
