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

Gravitational waves carry clues about compact binaries, their surroundings, and the nature of gravity. My research combines GW modeling and data analysis to explore the physics encoded in individual signals and stochastic backgrounds.

Explore the themes below through short introductions, illustrative animations, and related papers. Full citations and author lists are available on the [Publications page]({{ '/publications' | relative_url }}).

</div>

<div class="research-themes">

<!-- Edit each theme's text here; paper membership is in _data/research.yml. -->
<!-- Future animation scripts belong in /js. -->

<!-- Moving sources -->
{% capture moving_sources_description %}
Gravitational waves can carry information not only about a binary, but also about how it moves through its surroundings. My research examines waveform changes caused by recoil, orbital motion, and gas-induced dynamical friction. These studies explore how such effects can reveal kick velocities, globular cluster properties, supermassive black hole masses and spins, and gas densities in active galactic nucleus disks.
{% endcapture %}

{% include research_card.html
  id="moving-sources"
  title="Moving Sources"
  question="How does a binary’s motion leave its imprint on gravitational waves?"
  description=moving_sources_description
  animation="moving-sources"
%}

<!-- Waveform Modeling -->
{% capture waveform_modeling_description %}
Reliable gravitational-wave astronomy depends on waveform models that balance accuracy with computational cost. My work examines Newtonian and post-Newtonian approximations and explores fast generation of binary neutron star waveforms with tidal and precession effects. Related studies use deep learning to identify multiband signals lensed by dark matter halos, linking waveform modeling with signal recognition.
{% endcapture %}

{% include research_card.html
  id="waveform-modeling"
  title="Waveform Modeling"
  question="How can we model and identify gravitational-wave signals accurately and efficiently?"
  description=waveform_modeling_description
  animation="waveform-modeling"
%}

<!-- Tests of Gravity -->
{% capture modified_gravity_description %}
General relativity predicts two tensor polarizations and specific gravitational-wave signatures of binary evolution. My research explores how additional polarizations and parametrized waveform deviations could be constrained by observations. These studies examine detector networks, multiband observations, and time-delay interferometry, while developing analytical waveform derivatives for efficient and stable Fisher-matrix forecasts.
{% endcapture %}

{% include research_card.html
  id="modified-gravity"
  title="Tests of Gravity"
  question="How can gravitational waves put general relativity to the test?"
  description=modified_gravity_description
  animation="modified-gravity"
%}

<!-- Gravitational-Wave Backgrounds -->
{% capture backgrounds_description %}
Many weak sources overlap in gravitational-wave data, while correlated detector noise can complicate the search for a cosmic background. My work studies Galactic binary foreground subtraction, parameter estimation for resolvable binaries, and machine-learning identification of cosmic-string backgrounds. It also examines how correlated solar-wind plasma noise can bias network measurements, helping assess the reliability of future space-based background searches.
{% endcapture %}

{% include research_card.html
  id="gw-backgrounds"
  title="GW Backgrounds"
  question="How can we recover gravitational-wave backgrounds amid foregrounds and correlated noise?"
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
