(() => {
  const params = new URLSearchParams(window.location.search);
  if (window.self !== window.top || params.get("embedded") === "true") return;
  if (document.querySelector("[data-workbench-home]")) return;

  const mount = () => {
    if (!document.body || document.querySelector("[data-workbench-home]")) return;

    const link = document.createElement("a");
    link.className = "workbench-home-link";
    link.href = "/";
    link.setAttribute("aria-label", "返回工作台");
    link.setAttribute("data-tooltip", "返回工作台");
    link.setAttribute("data-workbench-home", "");
    if (document.querySelector(".edit-toolbar")) {
      link.classList.add("workbench-home-link--raised");
    }
    link.innerHTML = [
      '<svg viewBox="0 0 24 24" aria-hidden="true">',
      '<path d="m3 11 9-8 9 8"></path>',
      '<path d="M5 10v10h14V10"></path>',
      '<path d="M9 20v-6h6v6"></path>',
      '</svg>'
    ].join("");
    document.body.appendChild(link);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
