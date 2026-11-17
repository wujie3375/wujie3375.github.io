---
layout: page
permalink: /research
title: Research
description: Research on moving sources, waveform modeling, tests of gravity, and gravitational-wave backgrounds.
---

{% assign research_styles = site.static_files | where: 'path', '/assets/css/research.css' | first %}
<link rel="stylesheet" href="{{ '/assets/css/research.css' | relative_url }}?v={{ research_styles.modified_time | date: '%s' }}">
{% assign role_styles = site.static_files | where: 'path', '/assets/css/author-roles.css' | first %}
<link rel="stylesheet" href="{{ '/assets/css/author-roles.css' | relative_url }}?v={{ role_styles.modified_time | date: '%s' }}">

<div class="research-page" markdown="1">
<div class="research-intro" markdown="1">

# Research

Gravitational waves carry clues about compact binaries, their environments, and the nature of gravity. My research combines GW modeling and data analysis to connect physical models with observable signals, from individual binaries to stochastic backgrounds.

Explore the themes below through short introductions, illustrative animations, and related papers. Full citations and author lists are available on the [Publications page]({{ '/publications' | relative_url }}).

</div>

<div class="research-themes">

<!-- Edit each theme's text here; paper membership is in _data/research.yml. -->
<!-- Future animation scripts belong in /js. -->

<!-- Moving sources -->
{% capture moving_sources_description %}
A binary’s gravitational-wave signal can reveal not only its internal dynamics, but also its motion and environment. My work studies recoil, orbital modulation, gas-induced dynamical friction, and repeated lensing in hierarchical systems. These studies explore how waveform changes can probe kick velocities, globular clusters, supermassive black holes, and AGN disks, including how eccentric and precessing outer orbits alter successive lensing events and the information they carry.
{% endcapture %}

{% include research_card.html
  id="moving-sources"
  title="Moving Sources"
  question="How do a binary’s motion and surroundings shape its gravitational-wave signal?"
  description=moving_sources_description
  animation="moving-sources"
%}

<!-- Waveform Modeling -->
{% capture waveform_modeling_description %}
Reliable gravitational-wave astronomy requires waveform models that are both accurate and practical to compute. My work examines Newtonian and post-Newtonian approximations and combines physical modeling with machine learning for rapid waveform generation. Recent collaborative work develops a unified framework for binary black holes, binary neutron stars, and neutron star–black hole binaries. Related studies investigate signal identification, including gravitational waves lensed by dark matter halos.
{% endcapture %}

{% include research_card.html
  id="waveform-modeling"
  title="Waveform Modeling"
  question="How can we generate and identify gravitational-wave signals accurately and efficiently?"
  description=waveform_modeling_description
  animation="waveform-modeling"
%}

<!-- Tests of Gravity -->
{% capture modified_gravity_description %}
Testing gravity requires understanding both how alternative theories change gravitational-wave signals and how detectors can measure those changes. My work connects black-hole scalar charges with binary dynamics, inspiral waveforms, additional polarizations, and dispersive propagation in massive scalar–Gauss–Bonnet gravity. Complementary studies investigate parametrized deviations from general relativity, detector networks, and time-delay interferometry, and develop analytical waveform derivatives for efficient Fisher-matrix forecasts.
{% endcapture %}

{% include research_card.html
  id="modified-gravity"
  title="Tests of Gravity"
  question="How can gravitational waves reveal physics beyond general relativity?"
  description=modified_gravity_description
  animation="modified-gravity"
%}

<!-- Gravitational-Wave Backgrounds -->
{% capture backgrounds_description %}
Many weak sources overlap in gravitational-wave data, while correlated detector noise can complicate searches for a cosmic background. My work studies Galactic binary foreground subtraction, parameter estimation for resolvable binaries, and machine-learning identification of cosmic-string backgrounds. It also examines how correlated solar-wind plasma noise affects background recovery and parameter inference with space-based detector networks.
{% endcapture %}

{% include research_card.html
  id="gw-backgrounds"
  title="GW Backgrounds"
  question="How can we distinguish gravitational-wave backgrounds from foregrounds and correlated noise?"
  description=backgrounds_description
  animation="gw-backgrounds"
%}

</div>
</div>

<!-- 有发布构建时使用压缩入口；否则保留原生源码预览。每个动画仍独立按需加载。 -->
{% assign animation_names = 'moving-sources,waveform-modeling,modified-gravity,gw-backgrounds' | split: ',' %}
{% for animation_name in animation_names %}
  {% assign animation_path = '/js/dist/' | append: animation_name | append: '.js' %}
  {% assign animation_script = site.static_files | where: 'path', animation_path | first %}
  {% if jekyll.environment == 'development' %}{% assign animation_script = nil %}{% endif %}
  {% unless animation_script %}
    {% assign animation_path = '/js/' | append: animation_name | append: '.js' %}
    {% assign animation_script = site.static_files | where: 'path', animation_path | first %}
  {% endunless %}
  <script type="module" src="{{ animation_path | relative_url }}?v={{ animation_script.modified_time | date: '%s' }}"></script>
{% endfor %}
