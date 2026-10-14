---
layout: page
permalink: /publications
title: Publications
description: Research publications by Jie Wu, listed in reverse chronological order.
---



<script>
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']]
    },
    options: {
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    }
  };
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<!-- > **Last Update:** Mar 13, 2026 -->

{% assign publication_styles = site.static_files | where: 'path', '/assets/css/publications.css' | first %}
<link rel="stylesheet" href="{{ '/assets/css/publications.css' | relative_url }}?v={{ publication_styles.modified_time | date: '%s' }}">
{% assign role_styles = site.static_files | where: 'path', '/assets/css/author-roles.css' | first %}
<link rel="stylesheet" href="{{ '/assets/css/author-roles.css' | relative_url }}?v={{ role_styles.modified_time | date: '%s' }}">

<div class="publications-page" markdown="1">

# Publications

<p style="text-indent: 0;">The dates are based on the publication time.</p>

<p style="text-indent: 0;">If unavailable, the submission date on arXiv is used instead.</p>

<!-- ================================================================================================= -->
<!-- 统计图和表格 -->

{% include publication_chart.html papers=site.data.papers %}

<!-- =============================================================================================== -->
<!-- 表格 -->
<!-- ----------------------------------------------------------------------------------------------- -->

{% assign publications = site.data.papers %}

{% assign first_author_published = 0 %}
{% assign first_author_preprint = 0 %}
{% assign non_first_author_published = 0 %}
{% assign non_first_author_preprint = 0 %}

{% for pub in publications %}
  {% capture pub_role %}{% include paper_role.html authors=pub.authors author_order=pub.author_order %}{% endcapture %}
  {% assign pub_role = pub_role | strip %}
  <!-- 只有期刊名、卷号和文章号均完整才计入 Published；已接收但未正式发表仍计入 Preprint。 -->
  {% assign pub_is_published = false %}
  {% assign pub_journal = pub.journal | default: '' | strip %}
  {% assign pub_volume = pub.volume | default: '' | strip %}
  {% assign pub_article_number = pub.article_number | default: '' | strip %}
  {% if pub_journal != '' and pub_volume != '' and pub_article_number != '' %}
    {% assign pub_is_published = true %}
  {% endif %}
  {% unless pub_role == 'co-author' %}
    {% if pub_is_published %}
      {% assign first_author_published = first_author_published | plus: 1 %}
    {% else %}
      {% assign first_author_preprint = first_author_preprint | plus: 1 %}
    {% endif %}
  {% else %}
    {% if pub_is_published %}
      {% assign non_first_author_published = non_first_author_published | plus: 1 %}
    {% else %}
      {% assign non_first_author_preprint = non_first_author_preprint | plus: 1 %}
    {% endif %}
  {% endunless %}
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
      <td>Co-author</td>
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



<div class="checkbox-container">
  <input type="checkbox" id="show-all" onchange="toggleDisplay()">
  <label for="show-all">&nbsp;Show first-author papers only</label>
</div>

<p style="text-indent: 0;">Publications are listed in reverse chronological order.</p>

<p class="publication-note" style="text-indent: 0;">(*: corresponding author; †: these authors contributed equally)</p>
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
    <section class="publication-year">
    <h2 class="publication-year__heading" id="publications-{{ group.name }}">{{ group.name }}</h2>
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
        aliases=pub.aliases
        author_order=pub.author_order
        etal=pub.etal
        number=total_number %}
      {% assign total_number = total_number | plus: -1 %}
    {% endfor %}
    </section>
  {% endfor %}
</div>

<!-- 默认隐藏“我的文章”：排序为 1，或对应作者名带 *（通讯）/†（共一）。按钮名称保持原样。 -->
<div id="first-author-only" style="display: none;">
  {% assign filtered_publications = '' | split: ',' %}
  {% for pub in publications %}
    {% capture pub_role %}{% include paper_role.html authors=pub.authors author_order=pub.author_order %}{% endcapture %}
    {% assign pub_role = pub_role | strip %}
    {% unless pub_role == 'co-author' %}
      {% assign selected_publication = publications | slice: forloop.index0, 1 %}
      {% assign filtered_publications = filtered_publications | concat: selected_publication %}
    {% endunless %}
  {% endfor %}
  {% assign total_number = filtered_publications.size %}
  {% assign filtered_groups = filtered_publications | group_by_exp: "pub", "pub.sortable_date | split: '-' | first" | sort: "name" | reverse %}
  {% for group in filtered_groups %}
    {% assign filtered_group_items = group.items %}
    {% if filtered_group_items.size > 0 %}
      <section class="publication-year">
      <h2 class="publication-year__heading" id="first-author-{{ group.name }}">{{ group.name }}</h2>
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
        aliases=pub.aliases
        author_order=pub.author_order
        etal=pub.etal 
        number=total_number %}
      {% assign total_number = total_number | plus: -1 %}
    {% endfor %}
      </section>
    {% endif %}
  {% endfor %}
</div>

{% assign publication_controls = site.static_files | where: 'path', '/assets/js/publications.js' | first %}
<script src="{{ '/assets/js/publications.js' | relative_url }}?v={{ publication_controls.modified_time | date: '%s' }}" defer></script>



<!-- =============================================================================================== -->
<!-- 学位论文 -->
<!-- ----------------------------------------------------------------------------------------------- -->
# Degree Thesis

<div class="publication-thesis">
{% include paper_card.html
  title="An Analysis of the LIGO Gravitational Waves Data Based on Newtonian Approximate Model"
  subtitle="(Excellent Graduation Thesis)"
  authors="Jie Wu"
  date="May 2022, advisor: Assoc. Prof. Di Wu"
  journal="Undergraduate Thesis"
  volume=" "
  arxiv=false
  article_number="(in Chinese)"
  number="0"
  show_role=false
  author_order=1
%}
</div>
> I'm hoping that by listing these, it'll be easier for me to find them later on. (￢_￢)

</div>
