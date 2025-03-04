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

> **Last Update:** Feb 22, 2025

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


|                  | Published | Preprint | Total |
|:----------------:|:---------:|:--------:|:-----:|
|  First author    |     4     |    2     |   6   |
| Non first author |     1     |    0     |   1   |
| Total            |     5     |    2     |   7   |

<!-- ================================================================================================= -->
---
{% assign papers = paper.yml %}

{% if papers %}
  <!-- 按日期排序（最新的排在最上面） -->
  {% assign papers_sorted = papers | sort: "date" | reverse %}

  <!-- 按年份分组 -->
  {% assign papers_by_year = papers_sorted | group_by_exp: "paper", "paper.date | date: '%Y'" | sort: "name" | reverse %}

  {% for year_group in papers_by_year %}
    ## {{ year_group.name }}

    {% for paper in year_group.items %}
      {% include paper_card.html
        title=paper.title
        subtitle=paper.subtitle
        authors=paper.authors
        date=paper.date
        arxiv=paper.arxiv
        journal=paper.journal
        journal_link=paper.journal_link
        volume=paper.volume
        article_number=paper.article_number
        pdf=paper.pdf
        highlight_author=paper.highlight_author
        etal=paper.etal
        number=forloop.index
      %}
    {% endfor %}
    ---
  {% endfor %}
{% else %}
  <p>No papers found.</p>
{% endif %}

# Degree Thesis

{% include paper_card.html
  title="An Analysis of the LIGO Gravitational Waves Data Based on Newtonian Approximate Model"
  subtitle="(Excellent Graduation Thesis)"
  authors="Jie Wu"
  date="May 2022, advisor: Assoc. Prof. Di Wu"
  journal="Undergraduate Thesis"
  volume=" "
  article_number="(in Chinese)"
  pdf="https://wujie3375.github.io/file/Undergraduate-Thesis.pdf"
  number="0"
  highlight_author=1
%}

> I'm hoping that by listing these, it'll be easier for me to find them later on. (￢_￢)