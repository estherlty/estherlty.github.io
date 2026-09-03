---
layout: page
title: Publications
---
<ol class="pub-list">
{% for pub in site.data.publications %}
  <li class="pub-list__item">
    <p class="pub-list__title">{{ pub.title }}</p>
    <p class="pub-list__authors">
      {% for a in pub.authors %}{{ a.name }}{% if a.first_author %}*{% endif %}{% unless forloop.last %}, {% endunless %}{% endfor %}
    </p>
    <p class="pub-list__venue">
      {% if pub.status == "in preparation" %}In preparation ({{ pub.year }}){% else %}{{ pub.journal }}, {{ pub.volume }} ({{ pub.year }}) {{ pub.article_number }}{% endif %}
    </p>
    {% if pub.doi %}<a class="pub-list__doi" href="https://doi.org/{{ pub.doi }}">View DOI</a>{% endif %}
  </li>
{% endfor %}
</ol>
<p class="pub-list__legend">* First author. Where two names are marked, authorship is shared.</p>
