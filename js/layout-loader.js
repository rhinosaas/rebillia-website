/* ==========================================================================
   LAYOUT-LOADER.JS — Inject shared header/footer components
   ========================================================================== */

(function () {
  async function loadPartial(targetId, urls) {
    const container = document.getElementById(targetId);
    if (!container) return;

    let lastError = null;
    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: "no-cache" });
        if (!response.ok) {
          lastError = new Error("Failed to load " + url + ": " + response.status);
          continue;
        }
        container.innerHTML = await response.text();
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Failed to load layout partial");
  }

  async function initLayout() {
    try {
      await Promise.all([
        loadPartial("site-header", [
          "/components/header.html",
          "../components/header.html",
          "components/header.html",
        ]),
        loadPartial("site-footer", [
          "/components/footer.html",
          "../components/footer.html",
          "components/footer.html",
        ]),
      ]);

      if (typeof window.initSiteNavigation === "function") {
        window.initSiteNavigation();
      }
    } catch (error) {
      console.error("Layout loader error:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLayout, { once: true });
  } else {
    initLayout();
  }
})();
