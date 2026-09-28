(function () {
  "use strict";

  var html = document.documentElement;
  html.classList.remove("no-js");

  /* ---------- i18n (PT / EN) ---------- */
  var STORAGE_KEY = "sbtech-lang";
  var langBtn = document.getElementById("langToggle");

  function applyLang(lang) {
    html.setAttribute("data-lang", lang);
    html.setAttribute("lang", lang === "pt" ? "pt-BR" : "en");

    document.querySelectorAll("[data-pt][data-en]").forEach(function (el) {
      el.textContent = el.getAttribute("data-" + lang);
    });
    document.querySelectorAll("[data-ph-pt][data-ph-en]").forEach(function (el) {
      el.setAttribute("placeholder", el.getAttribute("data-ph-" + lang));
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function (opt) {
      opt.classList.toggle("active", opt.getAttribute("data-lang-btn") === lang);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }
  }

  function getInitialLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "pt" || saved === "en") return saved;
    } catch (e) { /* storage unavailable */ }
    return "pt";
  }

  if (langBtn) {
    langBtn.addEventListener("click", function () {
      applyLang(html.getAttribute("data-lang") === "pt" ? "en" : "pt");
    });
    applyLang(getInitialLang());
  }

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    var setMenu = function (open) {
      navLinks.classList.toggle("open", open);
      menuToggle.classList.toggle("is-active", open);
      menuToggle.setAttribute("aria-expanded", String(open));
    };
    menuToggle.addEventListener("click", function () {
      setMenu(!navLinks.classList.contains("open"));
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ---------- Process steps (expand on hover / focus / click) ---------- */
  var steps = document.querySelectorAll(".step");
  function activateStep(step) {
    steps.forEach(function (s) { s.classList.toggle("is-active", s === step); });
  }
  steps.forEach(function (step) {
    step.addEventListener("mouseenter", function () { activateStep(step); });
    step.addEventListener("focus", function () { activateStep(step); });
    step.addEventListener("click", function () { activateStep(step); });
  });

  /* ---------- Solution tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        panel.hidden = !on;
        panel.classList.toggle("is-active", on);
      }
    });
    if (focus) tab.focus();
    // keep the active tab visible when the tab bar scrolls horizontally (mobile)
    var bar = tab.parentElement;
    bar.scrollTo({ left: tab.offsetLeft - (bar.clientWidth - tab.clientWidth) / 2, behavior: "smooth" });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      selectTab(tabs[(i + dir + tabs.length) % tabs.length], true);
    });
  });

  // Segment cards open the matching solution tab
  document.querySelectorAll(".seg[data-tab]").forEach(function (card) {
    card.addEventListener("click", function () {
      var tab = document.getElementById(card.getAttribute("data-tab"));
      if (tab) selectTab(tab);
    });
  });

  /* ---------- Paths (dark section) ---------- */
  var paths = document.querySelectorAll(".path");
  var views = document.querySelectorAll(".pc-view");
  paths.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = Number(btn.getAttribute("data-path"));
      paths.forEach(function (p, i) {
        p.classList.toggle("is-active", i === idx);
        p.setAttribute("aria-selected", String(i === idx));
      });
      views.forEach(function (v, i) { v.classList.toggle("is-active", i === idx); });
    });
  });

  /* ---------- Contact form → opens e-mail client ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var pt = html.getAttribute("data-lang") === "pt";
      var ok = true;
      ["name", "email", "message"].forEach(function (n) {
        var field = form.elements[n];
        var valid = field.value.trim() !== "" && (n !== "email" || /\S+@\S+\.\S+/.test(field.value));
        field.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        status.textContent = pt ? "Preencha nome, e-mail válido e mensagem." : "Please fill in name, a valid email and message.";
        return;
      }
      var topic = form.elements.topic.value;
      var subject = "[Site] " + topic + " — " + form.elements.name.value.trim();
      var body =
        (pt ? "Nome: " : "Name: ") + form.elements.name.value.trim() + "\n" +
        "E-mail: " + form.elements.email.value.trim() + "\n" +
        (pt ? "Interesse: " : "Interest: ") + topic + "\n\n" +
        form.elements.message.value.trim();
      window.location.href = "mailto:admin@sbtechgroup.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.textContent = pt ? "Abrindo seu aplicativo de e-mail…" : "Opening your email app…";
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (el.closest(".hero") ? i * 90 : 0) + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
