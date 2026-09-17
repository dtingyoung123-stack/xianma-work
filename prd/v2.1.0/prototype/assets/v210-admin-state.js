(() => {
  const demo = new URLSearchParams(location.search).get('demo');
  if (!['loading', 'empty', 'error'].includes(demo)) return;

  const copy = {
    '首页': {
      loading: ['正在加载平台数据', '正在同步实时概况、周期指标和图表，请稍候。'],
      empty: ['当前时间范围暂无数据', '所选时间范围内还没有可用于统计的任务与功能使用记录。'],
      error: ['部分数据刷新失败', '当前展示上次成功数据，数据时间：2026-08-13 09:20。']
    },
    '技能管理': {
      loading: ['正在加载技能记录', '正在同步审批、发布和企业技能数据，请稍候。'],
      empty: ['暂无技能记录', '当前范围内还没有可展示的技能记录。'],
      error: ['技能记录加载失败', '网络异常，暂时无法获取最新技能数据。']
    },
    '需求管理': {
      loading: ['正在加载需求记录', '正在同步员工已提交的需求，请稍候。'],
      empty: ['暂无需求记录', '当前范围内还没有员工提交的需求。'],
      error: ['需求记录加载失败', '网络异常，暂时无法获取最新需求数据。']
    },
    '需求详情': {
      loading: ['正在加载需求详情', '正在读取需求分析和提报记录，请稍候。'],
      empty: ['未找到需求', '该需求可能不存在，或已不在当前可查看范围内。'],
      error: ['需求详情加载失败', '网络异常，暂时无法读取该需求。']
    },
    'AI Studio 用户': {
      loading: ['正在加载用户数据', '正在同步账号使用状态与平台使用概况，请稍候。'],
      empty: ['暂无用户数据', '当前还没有可展示的 AI Studio 用户记录。'],
      error: ['用户数据加载失败', '网络异常，暂时无法获取最新用户数据。']
    },
    '基础配置': {
      loading: ['正在加载基础配置', '正在同步分类和标签数据，请稍候。'],
      empty: ['暂无基础配置', '当前还没有可展示的分类或标签。'],
      error: ['基础配置加载失败', '网络异常，暂时无法获取分类和标签。']
    },
    '版本发布': {
      loading: ['正在加载版本数据', '正在同步发布表单和历史版本，请稍候。'],
      empty: ['暂无版本记录', '当前还没有已发布的客户端版本。'],
      error: ['版本数据加载失败', '网络异常，暂时无法获取版本发布信息。']
    }
  };

  function cleanUrl() {
    const url = new URL(location.href);
    url.searchParams.delete('demo');
    return url;
  }

  function retry(button) {
    button.disabled = true;
    button.textContent = '处理中…';
    setTimeout(() => { location.href = cleanUrl().href; }, 420);
  }

  function skeleton() {
    return '<div class="state-skeleton title"></div><div class="state-skeleton"></div><div class="state-skeleton short"></div><div class="state-skeleton"></div>';
  }

  function stateMarkup(type, title, detail, compact = false) {
    const icon = type === 'error' ? '!' : type === 'empty' ? '—' : '';
    const body = type === 'loading' ? skeleton() : `<div class="admin-demo-state-icon" aria-hidden="true">${icon}</div><h3>${title}</h3><p>${detail}</p>${type === 'error' ? '<div class="state-actions"><button class="btn secondary" data-admin-retry>重新加载</button></div>' : ''}`;
    return `<section class="admin-demo-state ${compact ? 'compact' : ''} ${type === 'error' ? 'is-error' : ''}" aria-live="polite"><div class="admin-demo-state-inner">${body}</div></section>`;
  }

  function disableHeadAction(head) {
    if (demo !== 'loading') return;
    head.querySelectorAll('button').forEach(button => {
      button.disabled = true;
      button.dataset.adminOriginalText = button.textContent;
      button.textContent = '处理中…';
    });
  }

  function applyGeneric(content, head, title) {
    const [stateTitle, detail] = (copy[title] || copy['技能管理'])[demo];
    [...content.children].filter(node => node !== head).forEach(node => { node.hidden = true; });
    head.insertAdjacentHTML('afterend', stateMarkup(demo, stateTitle, detail));
    disableHeadAction(head);
    const retryButton = content.querySelector('[data-admin-retry]');
    if (retryButton) retryButton.addEventListener('click', () => retry(retryButton));
  }

  function applyHome(content, head) {
    const [stateTitle, detail] = copy['首页'][demo];
    if (demo === 'loading') {
      applyGeneric(content, head, '首页');
      return;
    }
    if (demo === 'error') {
      head.insertAdjacentHTML('afterend', `<div class="admin-state-banner" role="status"><div><strong>${stateTitle}</strong><span>${detail}</span></div><button class="btn secondary" data-admin-retry>重新加载</button></div>`);
      const retryButton = content.querySelector('[data-admin-retry]');
      retryButton.addEventListener('click', () => retry(retryButton));
      const chartBody = content.querySelector('.trend-chart')?.parentElement;
      if (chartBody) chartBody.innerHTML = stateMarkup('error', '任务趋势加载失败', '趋势服务暂时不可用，其他区域继续展示上次成功数据。', true);
      return;
    }
    content.querySelectorAll('.dashboard-grid .panel-body').forEach(panel => {
      panel.innerHTML = stateMarkup('empty', stateTitle, detail, true);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.module-content');
    const head = content?.querySelector('.admin-page-head, .requirement-detail-head');
    if (!content || !head) return;
    const title = content.classList.contains('requirement-admin-detail') ? '需求详情' : head.querySelector('h2')?.textContent.trim() || '';
    if (title === '首页') applyHome(content, head);
    else applyGeneric(content, head, title);
  });
})();

(() => {
  const demo = new URLSearchParams(location.search).get('demo');
  if (['loading', 'empty', 'error'].includes(demo)) return;

  const storageKey = 'xianma-v210-requirement-exports';
  const requirements = [
    {
      id: 'REQ-20260831-142',
      title: '自动将新品资料转填至固定 Excel 登记表',
      owner: '产品角色 A', dept: '数智中心',
      original: '能不能自动帮我操作 Excel，帮我登记新品资料。',
      problem: '固定表格间重复复制粘贴耗时且存在漏填、错填风险',
      user: '新品资料登记人员', scene: '一次约 5 个新品，人工处理数小时',
      process: '打开两份表格，逐项复制粘贴并人工核对', outcome: '一句指令完成转填并生成新文件',
      success: '正常项自动通过，用户只检查异常', match: '当前无对应能力', matched: '无',
      rec: '建议提交', method: '正常提交', time: '2026-08-31 14:19',
      plan: '增加可复用的“新品 Excel 自动登记”能力。第一期只支持固定源表和固定登记模板，生成新结果文件并输出异常项。',
      why: ['固定模板适合先做稳定映射', '直接减少重复复制粘贴', '生成新文件且不覆盖原件'],
      flow: ['上传源表与模板', '检查必要内容', '固定映射转填', '生成新文件', '逐项核对', '异常人工处理'],
      scope: ['固定源表与固定登记模板', '约 5 个新品的批量转填', '新文件输出，不覆盖原件', '输出异常清单'],
      excluded: '任意格式表格自动理解、外部业务系统写入、复杂公式与宏全面兼容。',
      risks: ['需要真实源表和目标模板确认字段映射', '数据异常时不能静默填写', '复杂 Excel 兼容范围需真实样例验证'],
      validation: ['5 个正常新品全部正确转填', '缺失或格式异常进入异常清单', '源表和原始模板不被修改'],
      aiReasons: ['存在真实重复流程', '现有能力不能直接覆盖', '目标结果和成功标准明确'],
      summaryAt: '2026-08-31 14:18', authAt: '2026-08-31 14:19'
    },
    {
      id: 'REQ-20260828-108',
      title: '浏览器支持多个店铺批量执行相同任务',
      owner: '运营角色 A', dept: '电商运营部',
      original: '相同的网页任务能不能一次在多个店铺执行？',
      problem: '同一任务需要在多个店铺重复操作', user: '多店铺运营人员',
      scene: '活动前需要逐店铺重复配置相同内容', process: '逐个登录店铺并重复录入、检查',
      outcome: '一次配置后按店铺逐个执行并汇总结果', success: '每个店铺都有独立结果，失败店铺可单独重试',
      match: '现有能力部分解决', matched: '浏览器自动化 V1', rec: '建议提交', method: '正常提交', time: '2026-08-28 10:32',
      plan: '在现有浏览器任务基础上增加受控的多店铺顺序执行能力，保留逐店铺确认和结果。',
      why: ['复用已有浏览器执行能力', '优先顺序执行以控制风险', '逐店铺结果便于人工复核'],
      flow: ['选择任务', '确认店铺范围', '逐店铺执行', '记录单店结果', '失败单独重试'],
      scope: ['固定任务模板', '店铺顺序执行', '单店结果与失败重试'],
      excluded: '无限并发、跨平台自动适配和无人值守高风险操作。',
      risks: ['不同店铺页面状态可能不一致', '登录失效需要人工接管'],
      validation: ['至少 3 个测试店铺逐个完成', '单店失败不影响其他店铺结果'],
      aiReasons: ['现有能力能够执行单店任务', '多店铺重复操作尚未覆盖'],
      summaryAt: '2026-08-28 10:31', authAt: '2026-08-28 10:32',
      seededExport: { count: 1, firstExportedAt: '2026-08-28 11:05', lastExportedAt: '2026-08-28 11:05' }
    },
    {
      id: 'REQ-20260826-094',
      title: '希望 AI 自动判断所有业务数据是否正确',
      owner: '职能角色 B', dept: '职能部门',
      original: '希望 AI 自动判断所有业务数据是否正确。',
      problem: '业务数据核对依赖人工，但数据范围与判断标准尚未明确', user: '业务数据使用人员',
      scene: '提交人希望减少例行数据检查工作', process: '人工查看数据并凭经验判断',
      outcome: '自动发现异常并提示处理', success: '待补充具体数据范围、规则和错误样例',
      match: '暂时无法判断', matched: '待明确范围后重新匹配', rec: '暂不建议提交', method: '坚持提交', time: '2026-08-26 16:08',
      plan: '先保留需求记录，后续补充具体业务表、字段、校验规则与错误样例后再评估。',
      why: ['当前目标过宽', '缺少可执行判断标准', '保留原始诉求便于后续补充'],
      flow: ['明确数据对象', '提供判断规则', '补充错误样例', '重新评估'],
      scope: ['保留当前需求档案', '记录待补信息'], excluded: '本期不建设通用的“所有数据正确性”判断平台。',
      risks: ['范围不清会造成错误判断', '业务规则缺失时 AI 结论不可作为依据'],
      validation: ['能追溯 AI 原始判断', '能识别为提报人坚持提交'],
      aiReasons: ['数据范围和标准不明确', '当前无法形成可验证的 MVP'],
      summaryAt: '2026-08-26 16:06', authAt: '2026-08-26 16:08'
    },
    {
      id: 'REQ-20260822-071',
      title: '日报整理增加固定格式导出',
      owner: '运营角色 C', dept: '电商运营部',
      original: '日报整理完以后能不能直接导出固定格式？',
      problem: '现有日报结果仍需手工调整格式', user: '运营人员',
      scene: '每日汇总后需要再次整理为团队固定模板', process: '复制 AI 结果并手工调整标题和字段',
      outcome: '按固定模板直接生成可交付文件', success: '字段完整、格式稳定且可直接提交',
      match: '现有能力部分解决', matched: '文档生成能力', rec: '建议提交', method: '正常提交', time: '2026-08-22 11:25',
      plan: '在日报整理结果上增加固定模板导出，先覆盖一个已确认模板。',
      why: ['复用现有文档能力', '固定模板范围清晰', '可直接减少二次排版'],
      flow: ['完成日报整理', '选择固定模板', '生成文件', '人工确认'],
      scope: ['一个固定模板', '字段完整性检查', '生成新文件'], excluded: '模板市场和任意格式自动适配。',
      risks: ['模板变更需要同步维护'], validation: ['示例日报字段完整', '导出文件格式与模板一致'],
      aiReasons: ['存在稳定重复流程', '现有能力可作为实现基础'],
      summaryAt: '2026-08-22 11:24', authAt: '2026-08-22 11:25',
      seededExport: { count: 2, firstExportedAt: '2026-08-22 11:40', lastExportedAt: '2026-08-25 09:40' }
    }
  ];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function readExports() {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); }
    catch (error) { return {}; }
  }

  function writeExports(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function getRequirement(id) {
    const source = requirements.find(item => item.id === id);
    if (!source) return null;
    const saved = readExports()[id] || source.seededExport || null;
    return { ...source, exportRecord: saved };
  }

  function listRequirements() {
    return requirements.map(item => getRequirement(item.id)).sort((a, b) => b.time.localeCompare(a.time));
  }

  function formatDateTime(date) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function recordExport(id) {
    const state = readExports();
    const current = getRequirement(id);
    const now = new Date();
    const previous = state[id] || current.seededExport || null;
    const record = {
      count: (previous?.count || 0) + 1,
      firstExportedAt: previous?.firstExportedAt || formatDateTime(now),
      lastExportedAt: formatDateTime(now)
    };
    state[id] = record;
    writeExports(state);
    return getRequirement(id);
  }

  function bulletList(items) {
    return items.map(item => `- ${item}`).join('\n');
  }

  function markdown(item) {
    const record = item.exportRecord;
    return `# ${item.id} ${item.title}\n\n> 需求 ID：${item.id}\n> 提报时间：${item.time}\n> 提报人：${item.owner} / ${item.dept}\n> AI 判断：${item.rec}\n> 提交方式：${item.method}\n\n## 原始诉求\n\n${item.original}\n\n## 需求分析\n\n- 真实问题：${item.problem}\n- 主要用户：${item.user}\n- 最近真实场景：${item.scene}\n- 当前流程：${item.process}\n- 期望结果：${item.outcome}\n- 成功标准：${item.success}\n\n## 现有能力对比\n\n- 能力关系：${item.match}\n- 匹配功能：${item.matched}\n\n## 建议解决方向\n\n${item.plan}\n\n### 方案理由\n\n${bulletList(item.why)}\n\n### 建议流程\n\n${item.flow.join(' → ')}\n\n### 第一期最小范围\n\n${bulletList(item.scope)}\n\n### 本期暂不建设\n\n${item.excluded}\n\n### 依赖与风险\n\n${bulletList(item.risks)}\n\n### 最低验证方式\n\n${bulletList(item.validation)}\n\n## AI 判断与用户决定\n\n${bulletList(item.aiReasons)}\n\n- 摘要确认时间：${item.summaryAt}\n- 独立提交授权时间：${item.authAt}\n\n---\n首次导出时间：${record.firstExportedAt}\n最近导出时间：${record.lastExportedAt}\n导出次数：${record.count}\n`;
  }

  function downloadMarkdown(item) {
    const blob = new Blob([markdown(item)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${item.id}-${item.title.replace(/[\\/:*?"<>|]/g, '-')}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function toast(message) {
    const host = document.getElementById('toast-host');
    if (!host) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    host.appendChild(node);
    setTimeout(() => node.remove(), 2400);
  }

  function exportController({ getCurrent, modal, notice, name, confirm, closeButtons, onSuccess }) {
    let failedOnce = false;
    const defaultConfirm = '<xianma-icon name="file"></xianma-icon>确认导出';

    function open() {
      const item = getCurrent();
      if (!item) return;
      const record = item.exportRecord;
      notice.className = 'notice info';
      notice.textContent = record ? `本次为重复导出，将继续沿用需求 ID ${item.id}，并更新导出记录。` : `导出将沿用提交时生成的需求 ID ${item.id}，不会重新编号。`;
      if (name) name.innerHTML = `<strong>${escapeHtml(item.title)}</strong><br>需求 ID：${escapeHtml(item.id)}`;
      confirm.disabled = false;
      confirm.innerHTML = defaultConfirm;
      modal.classList.add('show');
    }

    closeButtons.forEach(button => { button.onclick = () => modal.classList.remove('show'); });
    confirm.onclick = () => {
      const item = getCurrent();
      if (!item || confirm.disabled) return;
      confirm.disabled = true;
      confirm.textContent = '导出中…';
      setTimeout(() => {
        const shouldFail = new URLSearchParams(location.search).get('export') === 'error' && !failedOnce;
        if (shouldFail) {
          failedOnce = true;
          notice.className = 'notice danger';
          notice.textContent = '导出失败，需求状态未改变。请重新导出。';
          confirm.disabled = false;
          confirm.innerHTML = '<xianma-icon name="rotate-cw"></xianma-icon>重新导出';
          return;
        }
        try {
          const exported = recordExport(item.id);
          downloadMarkdown(exported);
          modal.classList.remove('show');
          onSuccess(exported);
          toast(`Markdown 已导出，需求 ID：${exported.id}`);
        } catch (error) {
          notice.className = 'notice danger';
          notice.textContent = '导出失败，未能生成文件。请重新导出。';
          confirm.disabled = false;
          confirm.innerHTML = '<xianma-icon name="rotate-cw"></xianma-icon>重新导出';
        }
      }, 420);
    };
    return { open };
  }

  function initList() {
    const content = document.querySelector('.module-content');
    const table = document.querySelector('.requirement-table');
    if (!content || !table) return;
    table.style.minWidth = '1180px';
    table.style.tableLayout = 'auto';
    content.querySelector('.requirement-metrics')?.remove();
    const headCopy = content.querySelector('.admin-page-head p');
    if (headCopy) headCopy.textContent = '查看员工已提交的需求并单条导出 Markdown；当前角色具备需求查看与导出权限。';

    const filters = content.querySelector('.filters');
    filters.innerHTML = '<input class="input" id="requirement-search" placeholder="搜索需求 ID、标题、真实问题或提报人"><select class="select" id="requirement-export-filter"><option value="">全部导出状态</option><option>未导出</option><option>已导出</option></select><button class="btn secondary" id="requirement-reset">重置</button>';
    table.querySelector('thead').innerHTML = '<tr><th>需求 ID</th><th>需求标题</th><th>提报人 / 部门</th><th>AI 判断 / 提交方式</th><th>提交时间</th><th>导出状态</th><th>操作</th></tr>';

    const search = document.getElementById('requirement-search');
    const exportFilter = document.getElementById('requirement-export-filter');
    const reset = document.getElementById('requirement-reset');
    const tbody = document.getElementById('tbody');
    const pageSizeSelect = document.getElementById('page-size');
    let currentPage = 1;
    let pageSize = Number(pageSizeSelect.value);
    let currentId = null;

    function filtered() {
      const query = search.value.trim();
      return listRequirements().filter(item => (!query || `${item.id}${item.title}${item.problem}${item.owner}`.includes(query)) && (!exportFilter.value || (exportFilter.value === '已导出') === Boolean(item.exportRecord)));
    }

    function render() {
      const list = filtered();
      const pageCount = Math.max(1, Math.ceil(list.length / pageSize));
      currentPage = Math.min(currentPage, pageCount);
      const start = (currentPage - 1) * pageSize;
      const pageRows = list.slice(start, start + pageSize);
      const from = list.length ? start + 1 : 0;
      const to = list.length ? start + pageRows.length : 0;
      document.getElementById('page-summary').textContent = `第 ${from}–${to} 条，共 ${list.length} 条记录`;
      document.getElementById('page-controls').innerHTML = `<button class="page-btn" aria-label="上一页" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}><xianma-icon name="chevron-left"></xianma-icon></button>${Array.from({ length: pageCount }, (_, index) => `<button class="page-btn ${currentPage === index + 1 ? 'active' : ''}" data-page="${index + 1}" aria-current="${currentPage === index + 1 ? 'page' : 'false'}">${index + 1}</button>`).join('')}<button class="page-btn" aria-label="下一页" data-page="${currentPage + 1}" ${currentPage === pageCount ? 'disabled' : ''}><xianma-icon name="chevron-right"></xianma-icon></button>`;
      document.getElementById('page-controls').querySelectorAll('[data-page]').forEach(button => {
        button.onclick = () => { currentPage = Number(button.dataset.page); render(); };
      });
      tbody.innerHTML = pageRows.length ? pageRows.map(item => {
        const record = item.exportRecord;
        return `<tr><td><div class="table-id" style="white-space:nowrap;font-weight:600">${escapeHtml(item.id)}</div></td><td><div class="table-title">${escapeHtml(item.title)}</div></td><td>${escapeHtml(item.owner)}<div class="table-sub">${escapeHtml(item.dept)}</div></td><td><span class="status ${item.rec === '建议提交' ? 'success' : 'warning'}">${escapeHtml(item.rec)}</span><div class="table-sub">${escapeHtml(item.method)}</div></td><td>${escapeHtml(item.time)}</td><td>${record ? `<span class="status success">已导出</span><div class="table-sub">${record.count} 次</div>` : '<span class="status muted">未导出</span>'}</td><td><div class="table-actions"><a class="link-btn" href="管理后台_需求详情.html?id=${encodeURIComponent(item.id)}">查看详情</a><button class="link-btn" data-export-id="${escapeHtml(item.id)}">导出</button></div></td></tr>`;
      }).join('') : '<tr><td colspan="7" class="empty-row"><strong>没有符合条件的需求</strong><br>请调整筛选条件或重置<br><button class="btn small secondary" id="empty-reset" style="margin-top:14px">清空筛选</button></td></tr>';
      tbody.querySelectorAll('[data-export-id]').forEach(button => {
        button.onclick = () => { currentId = button.dataset.exportId; exporter.open(); };
      });
      const emptyReset = document.getElementById('empty-reset');
      if (emptyReset) emptyReset.onclick = resetFilters;
    }

    function resetFilters() {
      search.value = '';
      exportFilter.value = '';
      currentPage = 1;
      render();
    }

    const exporter = exportController({
      getCurrent: () => getRequirement(currentId),
      modal: document.getElementById('export-modal'),
      notice: document.getElementById('export-notice'),
      name: document.getElementById('export-name'),
      confirm: document.getElementById('confirm-export'),
      closeButtons: [document.getElementById('close'), document.getElementById('cancel')],
      onSuccess: render
    });

    search.oninput = exportFilter.onchange = () => { currentPage = 1; render(); };
    reset.onclick = resetFilters;
    pageSizeSelect.onchange = () => { pageSize = Number(pageSizeSelect.value); currentPage = 1; render(); };
    render();
  }

  function listHtml(items) {
    return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function detailArticle(item) {
    return `<section class="requirement-section"><h3>原始诉求</h3><p>“${escapeHtml(item.original)}”</p></section><section class="requirement-section"><h3>需求分析</h3><div class="kv-grid"><div class="kv-card"><span>真实问题</span><strong>${escapeHtml(item.problem)}</strong></div><div class="kv-card"><span>主要用户</span><strong>${escapeHtml(item.user)}</strong></div><div class="kv-card"><span>最近真实场景</span><strong>${escapeHtml(item.scene)}</strong></div><div class="kv-card"><span>当前流程</span><strong>${escapeHtml(item.process)}</strong></div><div class="kv-card"><span>期望结果</span><strong>${escapeHtml(item.outcome)}</strong></div><div class="kv-card"><span>成功标准</span><strong>${escapeHtml(item.success)}</strong></div></div></section><section class="requirement-section"><h3>现有能力对比</h3><div class="notice info">能力关系：${escapeHtml(item.match)}；匹配功能：${escapeHtml(item.matched)}。</div></section><section class="requirement-section"><h3>建议解决方向 <span class="tag">AI 建议</span></h3><div class="notice">以下为 AI 基于提交时需求和平台现状生成的产品建议，不等于正式 PRD、技术方案、立项或开发授权。</div><h4>首选方案</h4><p>${escapeHtml(item.plan)}</p><h4>为什么最合理</h4>${listHtml(item.why)}<h4>建议业务流程</h4><div class="flow">${item.flow.map((step, index) => `${index ? '<i>→</i>' : ''}<span>${escapeHtml(step)}</span>`).join('')}</div><h4>第一期最小范围</h4>${listHtml(item.scope)}<h4>本期暂不建设</h4><p>${escapeHtml(item.excluded)}</p><h4>依赖与风险</h4>${listHtml(item.risks)}<h4>最低验证方式</h4>${listHtml(item.validation)}</section><section class="requirement-section"><h3>AI 判断与用户决定</h3><p><span class="status ${item.rec === '建议提交' ? 'success' : 'warning'}">${escapeHtml(item.rec)}</span> <span class="status ${item.method === '坚持提交' ? 'danger' : 'muted'}">${escapeHtml(item.method)}</span></p>${listHtml(item.aiReasons)}<ul><li>摘要确认时间：${escapeHtml(item.summaryAt)}</li><li>独立提交授权时间：${escapeHtml(item.authAt)}</li></ul></section>`;
  }

  function initDetail() {
    const content = document.querySelector('.requirement-admin-detail');
    if (!content) return;
    const id = new URLSearchParams(location.search).get('id') || requirements[0].id;
    let current = getRequirement(id);
    if (!current) {
      content.querySelector('.requirement-detail-grid').innerHTML = '<section class="admin-demo-state is-error"><div class="admin-demo-state-inner"><xianma-icon name="circle-x"></xianma-icon><h3>未找到需求</h3><p>该需求不存在，或已不在当前可查看范围内。</p><div class="state-actions"><a class="btn secondary" href="管理后台_需求管理.html">返回需求列表</a></div></div></section>';
      content.querySelector('.admin-page-actions').hidden = true;
      return;
    }

    const title = content.querySelector('.requirement-detail-head h2');
    const idCopy = content.querySelector('.requirement-detail-head p');
    const article = content.querySelector('.content-panel');
    const side = content.querySelector('.requirement-side');
    const modal = document.getElementById('modal');
    const modalNotice = modal.querySelector('.notice');

    function render() {
      current = getRequirement(id);
      title.textContent = current.title;
      idCopy.textContent = `需求 ID：${current.id}`;
      article.innerHTML = detailArticle(current);
      const record = current.exportRecord;
      side.innerHTML = `<h3>基本信息</h3><div class="side-kv"><span>需求 ID</span><strong>${escapeHtml(current.id)}</strong></div><div class="side-kv"><span>提报人</span><strong>${escapeHtml(current.owner)}</strong></div><div class="side-kv"><span>部门</span><strong>${escapeHtml(current.dept)}</strong></div><div class="side-kv"><span>提交时间</span><strong>${escapeHtml(current.time)}</strong></div><div class="side-kv"><span>当前状态</span><strong><span class="status muted">已提交</span></strong></div><div class="side-kv"><span>AI 建议</span><strong><span class="status ${current.rec === '建议提交' ? 'success' : 'warning'}">${escapeHtml(current.rec)}</span></strong></div><div class="side-kv"><span>提交方式</span><strong>${escapeHtml(current.method)}</strong></div><div class="side-kv"><span>导出状态</span><strong>${record ? '<span class="status success">已导出</span>' : '<span class="status muted">未导出</span>'}</strong></div><div class="export-record"><h3>导出记录</h3><p>${record ? `首次导出：${escapeHtml(record.firstExportedAt)}<br>最近导出：${escapeHtml(record.lastExportedAt)}<br>共导出 ${record.count} 次` : '尚未导出；导出时沿用当前需求 ID。'}</p></div>`;
      modalNotice.textContent = record ? `重复导出将沿用需求 ID ${current.id}，并更新导出次数和最近导出时间。` : `导出将沿用需求 ID ${current.id}，不会重新编号。`;
    }

    const exporter = exportController({
      getCurrent: () => getRequirement(id),
      modal,
      notice: modalNotice,
      name: null,
      confirm: document.getElementById('confirm'),
      closeButtons: [document.getElementById('close'), document.getElementById('cancel')],
      onSuccess: render
    });
    document.getElementById('export-btn').onclick = exporter.open;
    render();
  }

  window.XianmaRequirementStore = Object.freeze({ list: listRequirements, get: getRequirement, export: recordExport, markdown });
  document.addEventListener('DOMContentLoaded', () => {
    initList();
    initDetail();
  });
})();
