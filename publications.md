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
    margin-bottom: 1rem;
  }
  .paper-card {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 4px;
  }
</style>

<div class="checkbox-container">
  <input type="checkbox" id="show-first-author" onchange="toggleDisplay()">
  <label for="show-first-author">&nbsp;Show first-author papers only</label>
</div>

<p style="text-indent: 0;">Publications are categorized and listed in reversed chronological order.</p>
<p style="text-indent: 0; font-family: Arial;">(*: corresponding author)</p>

<div id="publications-container"></div>

<script>
  // 数据初始化 (确保 Liquid 到 JSON 的正确转换)
  (function init() {
    window.publicationsData = [
      {% for pub in site.data.papers %}
      {
        "title": {{ pub.title | jsonify }},
        "subtitle": {{ pub.subtitle | default: "" | jsonify }},
        "authors": {{ pub.authors | jsonify }},
        "date": {{ pub.date | jsonify }},
        "journal": {{ pub.journal | jsonify }},
        "journal_link": {{ pub.journal_link | default: "#" | jsonify }},
        "volume": {{ pub.volume | default: "" | jsonify }},
        "article_number": {{ pub.article_number | default: "" | jsonify }},
        "arxiv": {{ pub.arxiv | default: "#" | jsonify }},
        "pdf": {{ pub.pdf | default: "#" | jsonify }},
        "highlight_author": {{ pub.highlight_author | default: 0 }},
        "etal": {{ pub.etal | default: 0 }},
        "sortable_date": {{ pub.sortable_date | jsonify }}
      }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ];
    
    // 调试输出
    console.log('Loaded publications:', window.publicationsData);
  })();

  // 数据处理函数
  function processData(showFirstAuthor) {
    try {
      // 深拷贝数据
      let data = JSON.parse(JSON.stringify(window.publicationsData));
      
      // 过滤数据
      if(showFirstAuthor) {
        data = data.filter(p => p.highlight_author === 1);
      }
      
      // 按日期排序
      data.sort((a, b) => {
        const dateA = new Date(a.sortable_date);
        const dateB = new Date(b.sortable_date);
        return dateB - dateA;
      });
      
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
        
    } catch (error) {
      console.error('Data processing error:', error);
      return [];
    }
  }

  // 渲染函数
  function renderPublications(showFirstAuthor) {
    const container = document.getElementById('publications-container');
    if (!container) {
      console.error('Container element not found');
      return;
    }
    
    try {
      container.innerHTML = '';
      const groupedData = processData(showFirstAuthor);
      let totalNumber = groupedData.reduce((sum, group) => sum + group.pubs.length, 0);

      groupedData.forEach(group => {
        // 创建年份标题
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

        // 创建论文卡片
        group.pubs.forEach(pub => {
          const card = document.createElement('div');
          card.className = 'paper-card';
          
          // 构建卡片内容
          const content = `
            <div class="paper-number">#${totalNumber--}</div>
            <h3 class="paper-title">${pub.title}</h3>
            ${pub.subtitle ? `<div class="paper-subtitle">${pub.subtitle}</div>` : ''}
            <div class="paper-authors">${pub.authors.replace(/\*/g, '<sup>*</sup>')}</div>
            <div class="paper-meta">
              <a href="${pub.journal_link}" class="journal">${pub.journal}</a>
              ${pub.volume ? `<span class="volume">${pub.volume}</span>` : ''}
              ${pub.article_number ? `<span class="article-number">${pub.article_number}</span>` : ''}
              <span class="date">${pub.date}</span>
            </div>
            <div class="paper-links">
              ${pub.pdf !== '#' ? `<a href="${pub.pdf}" class="pdf-link">PDF</a>` : ''}
              ${pub.arxiv !== '#' ? `<a href="${pub.arxiv}" class="arxiv-link">arXiv</a>` : ''}
            </div>
          `;
          
          card.innerHTML = content;
          container.appendChild(card);
        });

        // 添加分隔线
        container.appendChild(document.createElement('hr'));
      });
      
      console.log('Rendered', groupedData.length, 'year groups');
      
    } catch (error) {
      console.error('Rendering error:', error);
      container.innerHTML = '<p>Error loading publications</p>';
    }
  }

  // 切换显示
  function toggleDisplay() {
    try {
      const checkbox = document.getElementById('show-first-author');
      if (!checkbox) {
        console.error('Checkbox element not found');
        return;
      }
      renderPublications(checkbox.checked);
    } catch (error) {
      console.error('Toggle error:', error);
    }
  }

  // 初始化加载
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    renderPublications(false);
  });
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