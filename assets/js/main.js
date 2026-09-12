(function () {
  "use strict";

  var root = document.documentElement;

  function currentTheme() {
    return (
      root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  }

  function initThemeToggle() {
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    function render() {
      var target = currentTheme() === "dark" ? "light" : "dark";
      toggle.textContent = target === "dark" ? "Quench" : "Anneal";
      toggle.setAttribute(
        "aria-label",
        target === "dark" ? "Switch to dark mode (quench)" : "Switch to light mode (anneal)"
      );
    }

    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* storage unavailable, theme just won't persist */
      }
      render();
    });

    render();
  }

  function initRegisterToggles() {
    var buttons = document.querySelectorAll(".research-section__toggle");
    buttons.forEach(function (button) {
      var section = button.closest(".research-section");
      if (!section) return;
      var technical = section.querySelector(".research-section__register--technical");
      var plain = section.querySelector(".research-section__register--plain");
      if (!technical || !plain) return;

      button.addEventListener("click", function () {
        var showPlain = technical.hidden === false;
        technical.hidden = showPlain;
        plain.hidden = !showPlain;
        button.textContent = showPlain ? "Technical version" : "Plain-language version";
        button.setAttribute("aria-pressed", String(showPlain));
      });
    });
  }

  function initScaleIndicator() {
    var indicator = document.querySelector(".scale-indicator__value");
    var sections = document.querySelectorAll("[data-scale-label]");
    if (!indicator || !sections.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            indicator.textContent = entry.target.getAttribute("data-scale-label");
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function cssColor(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function drawLattice(ctx, w, h, t) {
    var lineColor = cssColor("--color-border");
    var dotColor = cssColor("--color-text-muted");
    var spacing = 44;
    var jitter = t === null ? 0 : 3;
    var cols = Math.ceil(w / spacing) + 1;
    var rows = Math.ceil(h / spacing) + 1;
    var time = t || 0;

    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    function point(i, j) {
      var bx = i * spacing;
      var by = j * spacing;
      var ox = jitter ? Math.sin(time * 0.0006 + i * 0.7 + j * 1.3) * jitter : 0;
      var oy = jitter ? Math.cos(time * 0.0005 + j * 0.9 + i * 1.1) * jitter : 0;
      return [bx + ox, by + oy];
    }

    var i, j, p, p2;
    for (i = 0; i < cols; i++) {
      for (j = 0; j < rows; j++) {
        p = point(i, j);
        if (i + 1 < cols) {
          p2 = point(i + 1, j);
          ctx.beginPath();
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
        }
        if (j + 1 < rows) {
          p2 = point(i, j + 1);
          ctx.beginPath();
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = dotColor;
    for (i = 0; i < cols; i++) {
      for (j = 0; j < rows; j++) {
        p = point(i, j);
        ctx.beginPath();
        ctx.arc(p[0], p[1], 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawVoronoi(ctx, w, h) {
    var lineColor = cssColor("--color-text-muted");
    var cell = 8;
    var cols = Math.max(1, Math.ceil(w / cell));
    var rows = Math.max(1, Math.ceil(h / cell));
    var seedCount = Math.max(6, Math.round((w * h) / 110000));
    var seeds = [];
    var i, j, s;

    for (s = 0; s < seedCount; s++) {
      seeds.push([Math.random() * w, Math.random() * h]);
    }

    var owner = new Int32Array(cols * rows);
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        var x = i * cell;
        var y = j * cell;
        var best = 0;
        var bestD = Infinity;
        for (s = 0; s < seeds.length; s++) {
          var dx = seeds[s][0] - x;
          var dy = seeds[s][1] - y;
          var d = dx * dx + dy * dy;
          if (d < bestD) {
            bestD = d;
            best = s;
          }
        }
        owner[j * cols + i] = best;
      }
    }

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = lineColor;
    ctx.globalAlpha = 0.16;
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        var idx = j * cols + i;
        var o = owner[idx];
        var right = i + 1 < cols ? owner[idx + 1] : o;
        var down = j + 1 < rows ? owner[idx + cols] : o;
        if (o !== right || o !== down) {
          ctx.fillRect(i * cell, j * cell, cell, cell);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawContours(ctx, w, h) {
    var lineColor = cssColor("--color-text-muted");
    var lines = 9;
    var k;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.18;

    for (k = 0; k < lines; k++) {
      var amp = 16 + k * 5;
      var freq = 0.006 + k * 0.0007;
      var yBase = (h / (lines + 1)) * (k + 1);
      ctx.beginPath();
      for (var x = 0; x <= w; x += 8) {
        var y = yBase + Math.sin(x * freq + k) * amp;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  var CANVAS_DRAWERS = {
    lattice: drawLattice,
    voronoi: function (ctx, w, h) {
      drawVoronoi(ctx, w, h);
    },
    contours: function (ctx, w, h) {
      drawContours(ctx, w, h);
    }
  };

  function initCanvasBackgrounds() {
    var canvases = document.querySelectorAll(".canvas-bg");
    if (!canvases.length) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvases.forEach(function (canvas) {
      var variant = canvas.getAttribute("data-variant");
      var draw = CANVAS_DRAWERS[variant];
      if (!draw) return;

      var ctx = canvas.getContext("2d");
      var w = 0;
      var h = 0;

      function resize() {
        var rect = canvas.getBoundingClientRect();
        w = Math.max(1, Math.round(rect.width));
        h = Math.max(1, Math.round(rect.height));
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (reduceMotion || variant !== "lattice") {
          draw(ctx, w, h, null);
        }
      }

      resize();
      window.addEventListener("resize", debounce(resize, 200));

      if (!reduceMotion && variant === "lattice") {
        (function loop(t) {
          draw(ctx, w, h, t);
          requestAnimationFrame(loop);
        })(0);
      }
    });
  }

  function debounce(fn, wait) {
    var timer;
    return function () {
      clearTimeout(timer);
      var args = arguments;
      timer = setTimeout(function () {
        fn.apply(null, args);
      }, wait);
    };
  }

  initThemeToggle();
  initRegisterToggles();
  initScaleIndicator();
  initCanvasBackgrounds();
})();
