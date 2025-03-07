---
layout: page
permalink: /publications
title: Publications
---

<style>
  @font-face {
    font-family: 'ARIAL';
    src: url('/assets/fonts/ARIAL.TTF') format('truetype');
  }
  @font-face {
    font-family: 'ARIALBD';
    src: url('/assets/fonts/ARIALBD.TTF') format('truetype');
  }
  /* li {
    font-family: 'times', serif;
  } */
  /* li {
    font-family: 'ARIALBD', serif;
    font-size: 20px;
  } */
  /* body {
    font-family: 'ARIAL', serif;
  } */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    text-align: center;
    table-layout: fixed; /* 新增：启用固定布局 */
}

/* 第一列宽度设置（比右侧所有列宽） */
td:first-child,
th:first-child {
    width: 35%;  /* 可根据需要调整，建议30%-40% */
    min-width: 120px; /* 保证最小宽度 */
    text-align: left; /* 可选：左对齐文本 */
    padding-left: 20px; /* 增加左侧间距 */
}

/* 右侧三列等宽设置 */
td:not(:first-child),
th:not(:first-child) {
    width: calc(65% / 3); /* 剩余宽度三等分 */
}

/* 保持原有边框样式 */
th {
    border-top: 1.5px solid black;
    border-bottom: 1.5px solid black;
}

tr:last-child td {
    border-bottom: 1.5px solid black;
}

th, td {
    border: 0px solid black;
    padding: 8px;
}
</style>

> **Last Update:** Mar 7, 2025

# Publications

<p style="text-indent: 0;">The dates are based on the publication time.</p>

<p style="text-indent: 0;">If unavailable, the submission date on arXiv is used instead.</p>

<!-- ================================================================================================= -->
<!-- 统计图和表格 -->

{% assign years = site.data.papers | group_by: 'year' | sort: 'name' %}
{% capture chart_url %}https://quickchart.io/chart?c={
  "type": "bar",
  "data": {
    "labels": [{{ years | map: 'name' | join: ',' }}],
    "datasets": [
      {
        "label": "First author",
        "data": [{% for y in years %}{{ y.items | where: 'highlight_author', 1 | size }}{% unless forloop.last %},{% endunless %}{% endfor %}],
        "backgroundColor": "rgba(54, 162, 235, 0.8)"
      },
      {
        "label": "Total",
        "data": [{% for y in years %}{{ y.items | size }}{% unless forloop.last %},{% endunless %}{% endfor %}],
        "backgroundColor": "rgba(255, 159, 64, 0.8)"
      }
    ]
  }
}{% endcapture %}

<img src="{{ chart_url | uri_escape }}" 
     alt="Publication Chart" 
     style="width:100%; height: 80%; position: relative; left: -30px;">

<!-- =============================================================================================== -->
<!-- 表格 -->
<!-- ----------------------------------------------------------------------------------------------- -->

<!-- |                  | Published | Preprint | Total |
|:----------------:|:---------:|:--------:|:-----:|
|  First author    |     4     |    2     |   6   |
| Non first author |     1     |    0     |   1   |
| Total            |     5     |    2     |   7   | -->


{% assign publications = site.data.papers %}

{% assign first_author_published = 0 %}
{% assign first_author_preprint = 0 %}
{% assign non_first_author_published = 0 %}
{% assign non_first_author_preprint = 0 %}

{% for pub in publications %}
  {% if pub.highlight_author == 1 %}
    {% if pub.journal != false %}
      {% assign first_author_published = first_author_published | plus: 1 %}
    {% endif %}
    {% if pub.arxiv != false and pub.journal == false %}
      {% assign first_author_preprint = first_author_preprint | plus: 1 %}
    {% endif %}
  {% else %}
    {% if pub.journal != false %}
      {% assign non_first_author_published = non_first_author_published | plus: 1 %}
    {% endif %}
    {% if pub.arxiv != false and pub.journal == false %}
      {% assign non_first_author_preprint = non_first_author_preprint | plus: 1 %}
    {% endif %}
  {% endif %}
{% endfor %}

{% assign total_published = first_author_published | plus: non_first_author_published %}
{% assign total_preprint = first_author_preprint | plus: non_first_author_preprint %}
{% assign total_articles = total_published | plus: total_preprint %}

<table>
  <thead>
    <tr>
      <th></th>
      <th>Published</th>
      <th>Preprint</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>First author</td>
      <td>{{ first_author_published }}</td>
      <td>{{ first_author_preprint }}</td>
      <td>{{ first_author_published | plus: first_author_preprint }}</td>
    </tr>
    <tr>
      <td>Non-first author</td>
      <td>{{ non_first_author_published }}</td>
      <td>{{ non_first_author_preprint }}</td>
      <td>{{ non_first_author_published | plus: non_first_author_preprint }}</td>
    </tr>
    <tr>
      <td>Total</td>
      <td>{{ total_published }}</td>
      <td>{{ total_preprint }}</td>
      <td>{{ total_articles }}</td>
    </tr>
  </tbody>
</table>

<!-- =============================================================================================== -->
<!-- 文章 -->
<!-- ----------------------------------------------------------------------------------------------- -->
---

<style>
.checkbox-container {
  font-size: 19px;  /* 整体字体放大 */
  display: flex; /* 使用 Flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
}

#show-all {
  width: 18px;      /* 复选框宽度 */
  height: 18px;     /* 复选框高度 */
  margin: 0 6px 0 0; /* 右边距 */
  accent-color: #36a2eb; /* 选中颜色 */
}

#show-all + label {
  vertical-align: middle; /* 文字垂直居中 */
}
</style>

<div class="checkbox-container">
  <input type="checkbox" id="show-all" onchange="toggleDisplay()">
  <label for="show-all">&nbsp;Show first-author papers only</label>
</div>

<p style="text-indent: 0;">Publications are categorized and listed in reversed chronological order.</p>

<p style="text-indent: 0; font-family: 'ARIAL';">(*: corresponding author)</p>
---

{% assign publications = site.data.papers %}

<!-- 按 sortable_date 排序，最新的排在前面 -->
{% assign publications = publications | sort: "sortable_date" | reverse %}

<!-- 按年份分组 -->
{% assign grouped_publications = publications | group_by_exp: "pub", "pub.sortable_date | split: '-' | first" | sort: "name" | reverse %}

<!-- 默认显示全部文章 -->
<div id="all-articles">
  {% assign total_number = publications.size %}
  {% for group in grouped_publications %}
    <h2>{{ group.name }}</h2>
    {% for pub in group.items %}
      {% capture unique_id %}all-{{ group.name }}-{{ forloop.index }}{% endcapture %}
      {% include paper_card.html 
        unique_id=unique_id
        title=pub.title 
        subtitle=pub.subtitle 
        authors=pub.authors 
        date=pub.date 
        journal=pub.journal 
        journal_link=pub.journal_link 
        volume=pub.volume 
        article_number=pub.article_number 
        arxiv=pub.arxiv 
        pdf=pub.pdf 
        highlight_author=pub.highlight_author 
        etal=pub.etal
        number=total_number %}
      {% assign total_number = total_number | plus: -1 %}
    {% endfor %}
    <hr>
  {% endfor %}
</div>

<!-- 默认隐藏一作文章 -->
<div id="first-author-only" style="display: none;">
  {% assign filtered_publications = publications | where: "highlight_author", 1 %}
  {% assign total_number = filtered_publications.size %}
  {% for group in grouped_publications %}
    {% assign filtered_group_items = group.items | where: "highlight_author", 1 %}
    {% if filtered_group_items.size > 0 %}
      <p style="text-indent: 0;font-size:36px;margin-bottom:0.61875rem;text-rendering:optimizeLegibility;line-height:1;margin-top:0;font-family:'PT Sans Narrow',sans-serif;font-weight:700;">{{ group.name }}</p>
      {% for pub in filtered_group_items %}
      {% capture unique_id %}first-{{ group.name }}-{{ forloop.index }}{% endcapture %}
      {% include paper_card.html 
        unique_id=unique_id
        title=pub.title 
        subtitle=pub.subtitle 
        authors=pub.authors 
        date=pub.date 
        journal=pub.journal 
        journal_link=pub.journal_link 
        volume=pub.volume 
        article_number=pub.article_number 
        arxiv=pub.arxiv 
        pdf=pub.pdf 
        highlight_author=pub.highlight_author 
        etal=pub.etal 
        number=total_number %}
      {% assign total_number = total_number | plus: -1 %}
    {% endfor %}
      <hr>
    {% endif %}
  {% endfor %}
</div>

<script>
// 同步切换函数
function toggleDisplay() {
  const showFirst = document.getElementById("show-all").checked;
  
  // 切换文章列表
  document.getElementById("first-author-only").style.display = showFirst ? "block" : "none";
  document.getElementById("all-articles").style.display = showFirst ? "none" : "block";
  
  // 切换统计图表
  document.getElementById("first-author-chart").style.display = showFirst ? "block" : "none";
  document.getElementById("all-chart").style.display = showFirst ? "none" : "block";
}
</script>



<!-- =============================================================================================== -->
<!-- 学位论文 -->
<!-- ----------------------------------------------------------------------------------------------- -->
# Degree Thesis

{% include paper_card.html
  title="An Analysis of the LIGO Gravitational Waves Data Based on Newtonian Approximate Model"
  subtitle="(Excellent Graduation Thesis)"
  authors="Jie Wu"
  date="May 2022, advisor: Assoc. Prof. Di Wu"
  journal="Undergraduate Thesis"
  volume=" "
  arxiv=false
  article_number="(in Chinese)"
  pdf="https://wujie3375.github.io/file/Undergraduate-Thesis.pdf"
  number="0"
  highlight_author=1
%}
> I'm hoping that by listing these, it'll be easier for me to find them later on. (￢_￢)