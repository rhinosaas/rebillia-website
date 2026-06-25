/* ==========================================================================
   ENHANCED-NAV.JS — Best-of-both link rewiring (loaded ONLY by *-best-of-both
   pages). Rewrites internal link TARGETS so the enhanced site browses as one
   connected experience. Touches href attributes only — never page content/text.
   Originals are untouched because they do not load this file.
   ========================================================================== */
(function () {
  var names = ["index","about","bigcommerce","blog","customers","developers",
               "features","integrations","news","partnerships","privacy",
               "solutions","terms","global-payments"];
  var map = {};
  names.forEach(function (n) { map[n + ".html"] = n + "-best-of-both.html"; });
  map["pricing"] = "pricing-best-of-both.html";        /* /pricing has no extension */
  map["pricing.html"] = "pricing-best-of-both.html";

  function mapHref(href) {
    if (!href) return null;
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return null;   /* external / anchor-only */
    if (href.indexOf("-best-of-both") >= 0) return null;         /* already enhanced */
    var hash = "", path = href, hi = href.indexOf("#");
    if (hi >= 0) { path = href.slice(0, hi); hash = href.slice(hi); }
    var lead = path.charAt(0) === "/" ? "/" : "";
    var seg = path.split("/").pop();                             /* filename or "pricing" */
    if (!map[seg]) return null;                                  /* no enhanced version → leave as-is */
    return lead + map[seg] + hash;
  }

  function rewrite() {
    var links = document.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var m = mapHref(links[i].getAttribute("href"));
      if (m) links[i].setAttribute("href", m);
    }
    enhanceNav();
  }

  /* Enhanced-only nav tweaks: add a labeled "Home" item and stop the logo
     from acting as a home button. Idempotent — safe to run on every mutation. */
  function enhanceNav() {
    var nav = document.querySelector(".navbar__nav");
    if (nav && !nav.querySelector("[data-bob-home]")) {
      var home = document.createElement("a");
      home.href = "/index-best-of-both.html";
      home.className = "navbar__link";
      home.textContent = "Home";
      home.setAttribute("data-bob-home", "");
      nav.insertBefore(home, nav.firstChild);
    }
    /* (Videos now lives directly in components/header.html — which layout-loader
       fetches fresh on every page — so it can't be lost to a stale cached script.) */

    var logo = document.querySelector("a.navbar__logo");
    if (logo && logo.hasAttribute("href")) {
      logo.removeAttribute("href");          /* no longer a home link */
      logo.removeAttribute("aria-label");
      logo.style.cursor = "default";
    }
  }

  /* Header/footer are injected asynchronously, so observe their containers. */
  var header = document.getElementById("site-header");
  var footer = document.getElementById("site-footer");
  var obs = new MutationObserver(rewrite);
  if (header) obs.observe(header, { childList: true, subtree: true });
  if (footer) obs.observe(footer, { childList: true, subtree: true });

  if (document.readyState !== "loading") rewrite();
  else document.addEventListener("DOMContentLoaded", rewrite);
  window.addEventListener("load", function () { setTimeout(rewrite, 300); });
})();
