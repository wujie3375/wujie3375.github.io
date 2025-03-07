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
}

th, td {
    border: 0px solid black;
    padding: 8px;
}

th {
    border-top: 1.5px solid black;
    border-bottom: 1.5px solid black; /* 顶部线 */
}

tr:last-child td {
    border-bottom: 1.5px solid black; /* 底部线 */
}
</style>

> **Last Update:** Mar 7, 2025

# Publications

<p style="text-indent: 0;">The dates are based on the publication time.</p>

<p style="text-indent: 0;">If unavailable, the submission date on arXiv is used instead.</p>

<!-- ================================================================================================= -->
<!-- 统计图和表格 -->
<!-- 调试数据输出 -->

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<canvas id="myChart" style="height: 400px;"></canvas> <!-- 设置图的高度 -->
<script>
  function createBarChart(labels, data1, data2) {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'First author',
                data: data1,  // 第一组数据
                backgroundColor: 'rgba(54, 162, 235, 0.8)', // 第一组颜色
            },
            {
                label: 'All papers',
                data: data2,  // 第二组数据
                backgroundColor: 'rgba(255, 159, 64, 0.8)', // 第二组颜色
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1, // 只显示整数
                        callback: function(value) {
                            return Number.isInteger(value) ? value : null; // 只显示整数
                        }
                    },
                    title: {
                        display: true,
                        text: 'Number'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            }
        }
    });
  }
</script>
<!-- <script>
  createBarChart(
  [2023,2024,2025], 
  [   2,   3,   1],//一作 
  [   2,   3,   3]);//总计
</script> -->

{% comment %} 数据预处理模块 {% endcomment %}
{% assign raw_years = site.data.papers | map: "sortable_date" | compact %}

{% comment %} 年份提取与格式验证 {% endcomment %}
{% assign years = "" | split: "," %}
{% for date in raw_years %}
  {% assign date_parts = date | split: "-" %}
  {% if date_parts.size >= 1 and date_parts[0].size == 4 %}
    {% assign year = date_parts[0] | plus: 0 %}
    {% assign years = years | push: year %}
  {% endif %}
{% endfor %}
{% assign years = years | uniq | sort %}

{% comment %} 论文统计模块 {% endcomment %}
{% assign first_author_counts = "" | split: "," %}
{% assign all_counts = "" | split: "," %}
{% for year in years %}
  {% assign current_year_str = year | append: "" %}
  
  {% comment %} 数据过滤 {% endcomment %}
  {% assign first_author = site.data.papers | where: "highlight_author", 1 
    | where_exp: "item", "item.sortable_date contains current_year_str" %}
  
  {% assign all_papers = site.data.papers 
    | where_exp: "item", "item.sortable_date contains current_year_str" %}

  {% comment %} 计数处理 {% endcomment %}
  {% assign first_author_counts = first_author_counts | push: first_author.size %}
  {% assign all_counts = all_counts | push: all_papers.size %}
{% endfor %}

{% comment %} 图表参数计算 {% endcomment %}
{% assign max_value = all_counts | max %}
{% if max_value == 0 %}
  {% assign max_value = 1 %}
{% endif %}

{% comment %} SVG 图表生成模块 {% endcomment %}
<svg viewBox="0 0 800 400" style="width: 100%; height: auto; font-family: Arial;">
  <!-- 坐标轴 -->
  <line x1="50" y1="350" x2="750" y2="350" stroke="#666" stroke-width="2"/>
  <line x1="50" y1="350" x2="50" y2="50" stroke="#666" stroke-width="2"/>

  <!-- 动态柱状图 -->
  {% for year in years %}
    {% assign index = forloop.index0 %}
    {% assign x = 80 | times: forloop.index0 | plus: 100 %}
    {% assign bar_width = 30 %}
    
    <!-- 总论文柱 -->
    {% assign all_height = 300 | times: all_counts[index] | divided_by: max_value %}
    <rect x="{{ x }}" 
          y="{{ 350 | minus: all_height }}" 
          width="{{ bar_width }}" 
          height="{{ all_height }}" 
          fill="#FF9F40"
          data-count="{{ all_counts[index] }}"/>
    
    <!-- 一作论文柱 -->
    {% assign first_height = 300 | times: first_author_counts[index] | divided_by: max_value %}
    <rect x="{{ x | plus: bar_width }}" 
          y="{{ 350 | minus: first_height }}" 
          width="{{ bar_width }}" 
          height="{{ first_height }}" 
          fill="#3692EB"
          data-count="{{ first_author_counts[index] }}"/>
    
    <!-- 交互标签 -->
    <g transform="translate({{ x | plus: bar_width }} 370)">
      <text text-anchor="middle">{{ year }}</text>
      <title>Total: {{ all_counts[index] }}, First-author: {{ first_author_counts[index] }}</title>
    </g>
  {% endfor %}

  <!-- 数据提示 -->
  {% if all_counts.size == 0 %}
    <text x="400" y="200" text-anchor="middle" font-size="20" fill="#999">
      No publication data available
    </text>
  {% endif %}

  <!-- 图例 -->
  <g transform="translate(600 80)">
    <rect width="20" height="20" fill="#3692EB"/>
    <text x="25" y="15">First-author</text>
  </g>
  <g transform="translate(600 110)">
    <rect width="20" height="20" fill="#FF9F40"/>
    <text x="25" y="15">All papers</text>
  </g>
</svg>
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
    display: flex; /* 使用 Flexbox 布局 */
    align-items: center; /* 垂直居中对齐 */
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
  function toggleDisplay() {
    var showAll = document.getElementById("show-all").checked;
    document.getElementById("first-author-only").style.display = showAll ? "block" : "none";
    document.getElementById("all-articles").style.display = showAll ? "none" : "block";
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