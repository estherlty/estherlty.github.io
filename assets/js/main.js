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

  initThemeToggle();
  initRegisterToggles();
  initScaleIndicator();
})();
