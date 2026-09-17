(() => {
  if (window.XianmaAppSidebar) {
    window.XianmaAppSidebar.mount();
    return;
  }
  const current = document.currentScript?.src || '';
  const script = document.createElement('script');
  script.src = current ? new URL('v210-app-sidebar.js', current).href : '../assets/v210-app-sidebar.js';
  document.head.appendChild(script);
})();
