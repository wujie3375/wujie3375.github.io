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

> **Last Update:** Mar 4, 2025

# Test Test Test Test Test Test Test Test Test Test Test Test Test

# Publications

<p style="text-indent: 0;">Publications are categorized and listed in reversed chronological order.</p>

<p style="text-indent: 0;">The dates are based on the publication time.</p>

<p style="text-indent: 0;">If unavailable, the submission date on arXiv is used instead.</p>

<p style="text-indent: 0; font-family: 'ARIAL';">(*: corresponding author)</p>

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
                label: 'Total',
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
  [   2,   3,   2]);//总计
</script>


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
      <td>Non first author</td>
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
<!-- {% for year_data in site.data.papers %}
  <h2>{{ year_data.year }}</h2>
  <hr>
{% endfor %}

{% if site.data.papers %}
  <p>YAML data loaded successfully!</p>
{% else %}
  <p>YAML data not loaded.</p>
{% endif %} -->

{% assign publications = site.data.papers %}

<!-- 转换日期为可排序格式 -->
{% for pub in publications %}
  {% assign date_parts = pub.date | split: " " %}
  {% assign month = date_parts[0] %}
  {% assign day = date_parts[1] | remove: "," %}
  {% assign year = date_parts[2] %}

  {% case month %}
    {% when "Jan" %}{% assign month_num = "01" %}
    {% when "Feb" %}{% assign month_num = "02" %}
    {% when "Mar" %}{% assign month_num = "03" %}
    {% when "Apr" %}{% assign month_num = "04" %}
    {% when "May" %}{% assign month_num = "05" %}
    {% when "Jun" %}{% assign month_num = "06" %}
    {% when "Jul" %}{% assign month_num = "07" %}
    {% when "Aug" %}{% assign month_num = "08" %}
    {% when "Sep" %}{% assign month_num = "09" %}
    {% when "Oct" %}{% assign month_num = "10" %}
    {% when "Nov" %}{% assign month_num = "11" %}
    {% when "Dec" %}{% assign month_num = "12" %}
  {% endcase %}

  {% assign sortable_date = year | append: "-" | append: month_num | append: "-" | append: day %}
  {% assign pub.sortable_date = sortable_date %}
{% endfor %}

<!-- 按 sortable_date 排序 -->
{% assign publications = publications | sort: "sortable_date"  %}

<!-- 按年份分组 -->
{% assign grouped_publications = publications | group_by: 'year' | sort: 'name' | reverse %}

{% assign total_number = publications.size %}

{% for group in grouped_publications %}
## {{ group.name }}

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