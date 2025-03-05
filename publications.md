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

> **Last Update:** Mar 5, 2025

# Publications

<p style="text-indent: 0;">The dates are based on the publication time.</p>

<p style="text-indent: 0;">If unavailable, the submission date on arXiv is used instead.</p>

<!-- ================================================================================================= -->
<!-- 统计图和表格 -->
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
<script>
  createBarChart(
  [2023,2024,2025], 
  [   2,   3,   1],//一作 
  [   2,   3,   3]);//总计
</script>

---

{% assign publications = site.data.publications %}
{% assign years = publications | map: "year" | uniq | sort %}

{% assign first_author_counts = "" | split: "" %}
{% assign total_counts = "" | split: "" %}

{% for year in years %}
  {% assign first_author_count = publications | where: "year", year | where: "highlight_author", 1 | size %}
  {% assign first_author_counts = first_author_counts | push: first_author_count %}

  {% assign total_count = publications | where: "year", year | size %}
  {% assign total_counts = total_counts | push: total_count %}
{% endfor %}

<table>
  <thead>
    <tr>
      <th>年份</th>
      {% for year in years %}
        <th>{{ year }}</th>
      {% endfor %}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>一作</td>
      {% for count in first_author_counts %}
        <td>{{ count }}</td>
      {% endfor %}
    </tr>
    <tr>
      <td>所有</td>
      {% for count in total_counts %}
        <td>{{ count }}</td>
      {% endfor %}
    </tr>
  </tbody>
</table>


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
  <label for="show-all">&nbsp;Show all papers (including non-first author)</label>
</div>

<p style="text-indent: 0;">Publications are categorized and listed in reversed chronological order.</p>

<p style="text-indent: 0; font-family: 'ARIAL';">(*: corresponding author)</p>
---

{% assign publications = site.data.papers %}

<!-- 按 sortable_date 排序，最新的排在前面 -->
{% assign publications = publications | sort: "sortable_date" | reverse %}

<!-- 按年份分组 -->
{% assign grouped_publications = publications | group_by_exp: "pub", "pub.sortable_date | split: '-' | first" | sort: "name" | reverse %}

<!-- 默认只显示一作文章 -->
{% assign filtered_publications = publications | where: "highlight_author", 1 %}

<!-- 根据复选框状态切换显示模式 -->
<div id="first-author-only">
  {% assign total_number = filtered_publications.size %}
  {% for group in grouped_publications %}
    {% assign filtered_group_items = group.items | where: "highlight_author", 1 %}
    {% if filtered_group_items.size > 0 %}
      <h2>{{ group.name }}</h2>
      {% for pub in filtered_group_items %}
        {% include paper_card.html 
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

<div id="all-articles" style="display: none;">
  {% assign total_number = publications.size %}
  {% for group in grouped_publications %}
    <!-- <h2>{{ group.name }}</h2> -->
    <p style="text-indent: 0;font-size:36px;margin-bottom:0.61875rem;text-rendering:optimizeLegibility;line-height:1;margin-top:0;font-family:'PT Sans Narrow',sans-serif;font-weight:700;">{{ group.name }}</p>
    {% for pub in group.items %}
      {% include paper_card.html 
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

<script>
  function toggleDisplay() {
    var showAll = document.getElementById("show-all").checked;
    document.getElementById("first-author-only").style.display = showAll ? "none" : "block";
    document.getElementById("all-articles").style.display = showAll ? "block" : "none";
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