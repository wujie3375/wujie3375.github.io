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

> **Last Update:** Feb 21, 2025

# Publications

<p style="text-indent: 0;">publications by categories in reversed chronological order.</p>

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
                barThickness: 20 // 设置柱子的具体宽度
            },
            {
                label: 'Total',
                data: data2,  // 第二组数据
                backgroundColor: 'rgba(255, 159, 64, 0.8)', // 第二组颜色
                barThickness: 20 // 设置柱子的具体宽度
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

  window.onload = function() {
    // 调用函数生成图表
    createBarChart(['2023', '2024', '2025'], [2, 3, 1], [2, 3, 2]);
  };
</script>



|                  | Published | Preprint | Total |
|:----------------:|:---------:|:--------:|:-----:|
|  First author    |     4     |    2     |   6   |
| Non first author |     1     |    0     |   1   |
| Total            |     5     |    2     |   7   |

<!-- ================================================================================================= -->
---

## 2025

<!-- ===================================================== -->
{% include paper_card.html
  title="Effect of kick velocity on gravitational wave detection of binary black holes with space- and ground-based detectors"
  authors="Jie Wu, Mengfei Sun, Xianghe Ma, Xiaolin Liu, Jin Li*, Zhoujian Cao*"
  date="Feb 19, 2025"
  arxiv="2502.13710"
  pdf="https://wujie3375.github.io\file\250219.pdf"
  number="7"
  highlight_author=1
  etal=4
%}

{% include paper_card.html
  title="Parallel manipulation of multiple ink droplets via near-infrared light on lubricant infused surface"
  subtitle="(Responsible for data processing and visualization)"
  authors="Yalin Hu, Jie Wu, Haiyan Luo, Guanqi Su, Xiangxi Meng, Liyu Liu, Guo Chen*"
  date="Jan 13, 2025"
  journal="Appl. Phys. Lett."
  journal_link="https://pubs.aip.org/aip/apl/article/126/2/021602/3330590"
  volume="126"
  article_number="021602"
  pdf="https://wujie3375.github.io\file\241223.pdf"
  number="6"
  highlight_author=2
  etal=4
%}
   
---

## 2024


{% include paper_card.html
  title="Constraints and detection capabilities of GW polarizations with space-based detectors in different TDI combinations"
  authors="Jie Wu, Mengfei Sun, Jin Li*"
  date="Nov 6, 2024"
  arxiv="2411.03631"
  pdf="https://wujie3375.github.io\file\241106.pdf"
  number="5"
  highlight_author=1
  etal=4
%}

{% include paper_card.html
  title="Prospects of constraining on the polarizations of gravitational waves from binary black holes using space-and ground-based detectors"
  authors="Jie Wu, Jin Li*"
  date="Oct 22, 2024"
  journal="Phys.Rev.D"
  journal_link="https://journals.aps.org/prd/abstract/10.1103/PhysRevD.110.084057"
  volume="110"
  article_number="084057"
  arxiv="2407.13590"
  pdf="https://wujie3375.github.io/file/240924.pdf"
  number="4"
  highlight_author=1
%}

{% include paper_card.html
  title="Comparison and application of different post-Newtonian models for inspiralling stellar-mass binary black holes with space-based GW detectors"
  authors="Jie Wu, Jin Li*, Xiaolin Liu, Zhoujian Cao"
  date="May 7, 2024"
  journal="Phys.Rev.D"
  journal_link="https://journals.aps.org/prd/abstract/10.1103/PhysRevD.109.104014"
  volume="109"
  article_number="104014"
  arxiv="2401.03113"
  pdf="https://wujie3375.github.io/file/240406.pdf"
  number="3"
  highlight_author=1
  etal=4
%}
   
---

## 2023

{% include paper_card.html
  title="Subtraction of the confusion foreground and parameter uncertainty of resolvable galactic binaries on the networks of space-based gravitational-wave detectors"
  authors="Jie Wu, Jin Li*"
  date="Dec 18, 2023"
  journal="Phys.Rev.D"
  journal_link="https://journals.aps.org/prd/abstract/10.1103/PhysRevD.108.124047"
  volume="108"
  article_number="124047"
  arxiv="2307.05568"
  pdf="https://wujie3375.github.io/file/231130.pdf"
  number="2"
  highlight_author=1
%}

{% include paper_card.html
  title="Application of Newtonian approximate model to LIGO gravitational wave data processing"
  subtitle="(Suggested by editors)"
  authors="Jie Wu, Jin Li*, Qing-Quan Jiang*"
  date="Sep 1, 2023"
  journal="Chin.Phys.B"
  journal_link="https://iopscience.iop.org/article/10.1088/1674-1056/acd8a3"
  volume="32"
  article_number="090401"
  pdf="https://wujie3375.github.io/file/230525.pdf"
  number="1"
  highlight_author=1
%}

---

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
---

> I'm hoping that by listing these, it'll be easier for me to find them later on. (￢_￢)