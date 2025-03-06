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

> **Last Update:** Mar 6, 2025

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
    display: flex;
    align-items: center;
  }
</style>

<div class="checkbox-container">
  <input type="checkbox" id="show-all" onchange="toggleDisplay()">
  <label for="show-all">&nbsp;Show first-author papers only</label>
</div>

<p style="text-indent: 0;">Publications are categorized and listed in reversed chronological order.</p>
<p style="text-indent: 0; font-family: 'ARIAL';">(*: corresponding author)</p>
---

<div id="publications-container"></div>

<script>
  // Liquid 数据转换
  {% raw %}
  const publicationsData = [
    {% for pub in site.data.papers %}
    {
      title: {{ pub.title | jsonify }},
      subtitle: {{ pub.subtitle | jsonify }},
      authors: {{ pub.authors | jsonify }},
      date: {{ pub.date | jsonify }},
      journal: {{ pub.journal | jsonify }},
      journal_link: {{ pub.journal_link | jsonify }},
      volume: {{ pub.volume | jsonify }},
      article_number: {{ pub.article_number | jsonify }},
      arxiv: {{ pub.arxiv | jsonify }},
      pdf: {{ pub.pdf | jsonify }},
      highlight_author: {{ pub.highlight_author | default: 0 }},
      etal: {{ pub.etal | default: 10 }},
      sortable_date: {{ pub.sortable_date | jsonify }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];
  {% endraw %}

  // 分组排序逻辑
  function processData(showFirstAuthor) {
    // 深拷贝原始数据
    let data = JSON.parse(JSON.stringify(publicationsData));
    
    // 过滤数据
    if(showFirstAuthor) {
      data = data.filter(p => p.highlight_author === 1);
    }
    
    // 按日期排序
    data.sort((a, b) => new Date(b.sortable_date) - new Date(a.sortable_date));
    
    // 按年份分组
    const grouped = data.reduce((acc, pub) => {
      const year = pub.sortable_date.split('-')[0];
      acc[year] = acc[year] || [];
      acc[year].push(pub);
      return acc;
    }, {});
    
    // 按年份倒序排序
    return Object.entries(grouped)
      .sort(([a], [b]) => b - a)
      .map(([year, pubs]) => ({ year, pubs }));
  }

  // 渲染函数
  function renderPublications(showFirstAuthor) {
    const container = document.getElementById('publications-container');
    container.innerHTML = '';
    
    const groupedData = processData(showFirstAuthor);
    let totalNumber = groupedData.reduce((sum, group) => sum + group.pubs.length, 0);

    groupedData.forEach(group => {
      // 添加年份标题
      const yearHeader = document.createElement('p');
      yearHeader.style.cssText = `
        text-indent: 0;
        font-size: 36px;
        margin-bottom: 0.61875rem;
        text-rendering: optimizeLegibility;
        line-height: 1;
        margin-top: 0;
        font-family: 'PT Sans Narrow', sans-serif;
        font-weight: 700;
      `;
      yearHeader.textContent = group.year;
      container.appendChild(yearHeader);

      // 添加文章卡片
      group.pubs.forEach(pub => {
        const card = document.createElement('div');
        card.innerHTML = `
          <div class="paper-card">
            <div class="paper-number">#${totalNumber--}</div>
            <h3 class="paper-title">${pub.title}</h3>
            ${pub.subtitle ? `<div class="paper-subtitle">${pub.subtitle}</div>` : ''}
            <div class="paper-authors">
              ${pub.authors.replace(/\*/g, '<sup>*</sup>')}
              ${pub.etal > 0 ? ` et al.` : ''}
            </div>
            <div class="paper-meta">
              <span class="journal">${pub.journal}</span>
              ${pub.volume ? `<span class="volume">${pub.volume}</span>` : ''}
              ${pub.article_number ? ` (${pub.article_number})` : ''}
              <span class="date">${pub.date}</span>
            </div>
            <div class="paper-links">
              ${pub.pdf ? `<a href="${pub.pdf}" class="pdf-link">PDF</a>` : ''}
              ${pub.arxiv ? `<a href="${pub.arxiv}" class="arxiv-link">arXiv</a>` : ''}
            </div>
          </div>
        `;
        container.appendChild(card);
      });

      // 添加分隔线
      container.appendChild(document.createElement('hr'));
    });
  }

  // 切换显示
  function toggleDisplay() {
    const showFirstAuthor = document.getElementById('show-all').checked;
    renderPublications(showFirstAuthor);
  }

  // 初始渲染
  renderPublications(false);
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