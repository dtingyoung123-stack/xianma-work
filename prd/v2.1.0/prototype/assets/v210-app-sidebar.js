(() => {
  const sourceUrl = document.currentScript?.src || '';
  const navItems = [
    { key: 'new', label: '新对话', icon: 'square-pen', href: '应用端_新对话.html' },
    { key: 'search', label: '搜索', icon: 'search', href: '应用端_搜索.html' },
    { key: 'skills', label: '技能库', icon: 'zap', href: '应用端_技能库.html' },
    { key: 'prompts', label: '提示词库', icon: 'lightbulb', href: '应用端_提示词库.html' },
    { key: 'scheduled', label: '定时任务', icon: 'clock-3', href: '应用端_已安排.html' },
    { key: 'requirement', label: '需求提报', icon: 'clipboard-pen-line', href: '应用端_需求提报.html', separated: true }
  ];

  const projectGroups = [
    {
      label: '运营工作',
      items: [
        { key: 'weekly', label: '本周周报生成', time: '刚刚' },
        { key: 'copywriting', label: '618活动文案润色', time: '2 小时' },
        { key: 'meeting', label: '周会会议记录整理', time: '昨天' }
      ]
    },
    {
      label: '设计工作',
      items: [
        { key: 'image', label: '产品图批量去背景', time: '1 周' },
        { key: 'format', label: '详情页图片格式转换', time: '1 周' }
      ]
    }
  ];

  function currentFile() {
    return decodeURIComponent(location.pathname.split('/').pop() || '');
  }

  function inferState() {
    const file = currentFile();
    const skill = new URLSearchParams(location.search).get('skill') || '';
    if (file.includes('需求提报') || file.includes('我的提报')) return { active: 'requirement', conversation: '' };
    if (file.includes('技能库')) return { active: 'skills', conversation: '' };
    if (file.includes('已安排')) return { active: 'scheduled', conversation: '' };
    if (file.includes('搜索')) return { active: 'search', conversation: '' };
    if (file.includes('提示词库')) return { active: 'prompts', conversation: '' };
    if (file.includes('任务_执行结果')) return { active: '', conversation: skill };
    return { active: 'new', conversation: '' };
  }

  function projectMarkup(activeConversation) {
    return `<div class="side-label">项目</div>${projectGroups.map(group => `
      <div class="side-project">${group.label}</div>
      ${group.items.map(item => {
        const queryKey = item.key === 'format' ? 'image' : item.key;
        const active = activeConversation === item.key || (item.key === 'format' && activeConversation === 'format');
        return `<a class="side-history${active ? ' active' : ''}" href="应用端_任务_执行结果.html?skill=${queryKey}"${active ? ' aria-current="page"' : ''}><span>${item.label}</span><small>${item.time}</small></a>`;
      }).join('')}
    `).join('')}`;
  }

  class XianmaAppSidebar extends HTMLElement {
    connectedCallback() {
      const inferred = inferState();
      const active = this.getAttribute('active') ?? inferred.active;
      const conversation = this.getAttribute('conversation') || inferred.conversation;
      this.classList.add('app-sidebar');
      this.setAttribute('aria-label', '先马·AI Studio 应用侧栏');
      this.innerHTML = `
        <div class="app-brand"><img src="../icon.png" alt=""><span>先马·AI Studio</span></div>
        <nav class="app-nav" aria-label="应用导航">
          ${navItems.map(item => `${item.separated ? '<span class="app-nav-separator" role="separator"></span>' : ''}<a${active === item.key ? ' class="active" aria-current="page"' : ''} href="${item.href}"><span class="nav-mark"><xianma-icon name="${item.icon}"></xianma-icon></span><span>${item.label}</span></a>`).join('')}
        </nav>
        <div class="side-scroll">${projectMarkup(conversation)}</div>
        <div class="side-spacer"></div>
        <div class="side-account-wrap">
          <div class="side-account-menu" role="menu">
            <button class="account-menu-item" type="button" role="menuitem" data-account-action="settings"><span class="account-menu-icon"><xianma-icon name="settings"></xianma-icon></span><span>系统设置</span></button>
            <div class="account-menu-sep"></div>
            <a class="account-menu-item danger" role="menuitem" href="应用端_登录.html"><span class="account-menu-icon"><xianma-icon name="log-out"></xianma-icon></span><span>退出登录</span></a>
          </div>
          <button class="side-account side-account-trigger" type="button" aria-haspopup="menu" aria-expanded="false"><span class="avatar">蝶</span><span class="account-copy"><strong>梦蝶</strong><span>数智中心</span></span></button>
        </div>`;
      this.bindAccountMenu();
      document.dispatchEvent(new CustomEvent('xianma-sidebar-ready', { detail: { active, conversation } }));
    }

    bindAccountMenu() {
      const wrap = this.querySelector('.side-account-wrap');
      const trigger = wrap?.querySelector('.side-account-trigger');
      const close = () => {
        wrap?.classList.remove('open');
        trigger?.setAttribute('aria-expanded', 'false');
      };
      trigger?.addEventListener('click', event => {
        event.stopPropagation();
        const open = !wrap.classList.contains('open');
        wrap.classList.toggle('open', open);
        trigger.setAttribute('aria-expanded', String(open));
      });
      wrap?.querySelector('[data-account-action="settings"]')?.addEventListener('click', () => {
        close();
        if (typeof window.openSettings === 'function') window.openSettings();
        else if (typeof window.toast === 'function') window.toast('打开系统设置');
      });
      document.addEventListener('click', close);
      document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    }
  }

  function ensureStyles() {
    if ([...document.styleSheets].some(sheet => sheet.href?.includes('/assets/ui-tokens.css'))) return Promise.resolve();
    const href = sourceUrl ? new URL('ui-tokens.css', sourceUrl).href : '../assets/ui-tokens.css';
    return new Promise(resolve => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
    });
  }

  function normalizeLegacyShell() {
    const legacyWindow = document.querySelector('.window');
    if (!legacyWindow) return;
    document.body.classList.add('v210-app-page');
    legacyWindow.classList.add('app-window');
    document.querySelector('.body')?.classList.add('app-body');
    document.querySelector('.main')?.classList.add('app-main');
    document.querySelectorAll('.titlebar .dot').forEach(dot => dot.classList.add('window-dot'));
  }

  function mount() {
    normalizeLegacyShell();
    const existing = document.querySelector('xianma-app-sidebar');
    if (existing) return;
    const target = document.querySelector('.app-sidebar, .sidebar');
    if (!target) return;
    target.replaceWith(document.createElement('xianma-app-sidebar'));
  }

  if (!customElements.get('xianma-app-sidebar')) customElements.define('xianma-app-sidebar', XianmaAppSidebar);
  window.XianmaAppSidebar = { mount };
  const start = () => ensureStyles().then(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
