---
layout: page
title: Talks & Posters
---
{% assign grouped = site.data.talks | group_by: "year" %}
{% for group in grouped %}
<h2 class="talks-list__year">{{ group.name }}</h2>
<ul class="talks-list">
  {% for t in group.items %}
  <li class="talks-list__item">
    <p class="talks-list__title">{{ t.title }}{% if t.invited %} <span class="talks-list__badge">Invited</span>{% endif %}</p>
    <p class="talks-list__meta">{{ t.type | capitalize }} — {{ t.event }}, {{ t.location }}, {{ t.date_display }}</p>
  </li>
  {% endfor %}
</ul>
{% endfor %}
