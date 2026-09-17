(() => {
  const params = new URLSearchParams(location.search);
  const scenarios = new Set([
    'standard',
    'direct',
    'supplement',
    'not-recommended',
    'capability-error',
    'out-of-scope',
    'submit-error'
  ]);
  const initialScenario = scenarios.has(params.get('scenario')) ? params.get('scenario') : 'standard';
  let scenario = initialScenario;
  const runKey = params.get('run') || 'default';
  const draftKey = `xianma-ai-studio:v2.1.0:requirement-draft:${initialScenario}:${runKey}`;
  const demoRequirementId = 'REQ-20260901-158';
  const demoScenarios = Object.freeze({
    '测试不提交': 'not-recommended',
    '测试提交': 'standard',
    '测试坚持提交': 'not-recommended'
  });

  const questions = [
    '请讲一个最近真实发生的例子：当时你想完成什么，实际卡在了哪里？',
    '你现在通常通过哪些步骤完成这件事，其中最耗时或最容易出错的是哪一步？',
    '这种情况大约多久发生一次，每次会花多长时间或造成什么影响？',
    '你希望 AI Studio 最终做到什么程度，看到什么结果才算真正解决？'
  ];

  let state = {
    answers: [],
    corrections: [],
    questionIndex: 0,
    nextQuestionIndex: 0,
    phase: 'idle',
    pendingAI: false,
    stageReviewed: false,
    supplementCompleted: false,
    supplementAnswer: '',
    insistReason: '',
    capabilityRecovered: false,
    submitAttempts: 0,
    correctionReturn: '',
    matchLabel: '等待核对',
    demoScenario: initialScenario
  };

  const conversation = document.getElementById('conversation');
  const scroll = document.getElementById('chat-scroll');
  const composer = document.getElementById('composer');
  const send = document.getElementById('send-btn');
  const welcome = document.getElementById('welcome');
  const stageCopy = document.getElementById('stage-copy');
  const stageDot = document.getElementById('stage-dot');
  const railStatus = document.getElementById('rail-status');
  const matchStatus = document.getElementById('match-status');
  const capabilityCopy = document.getElementById('capability-copy');
  const solutionCopy = document.getElementById('solution-copy');
  const discardTrigger = document.getElementById('discard-draft');
  const discardModal = document.getElementById('discard-modal');
  const resumeNotice = document.getElementById('resume-notice');

  function safe(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function toast(message) {
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    document.getElementById('toast-host').appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function addMessage(role, text, typing = false) {
    const message = document.createElement('div');
    message.className = `message ${role === 'user' ? 'user' : ''}`;
    message.innerHTML = `<div class="message-label">${role === 'user' ? '你' : 'AI Studio · 需求分析'}</div><div class="bubble">${typing ? '<span class="typing"><i></i><i></i><i></i></span>' : safe(text)}</div>`;
    conversation.appendChild(message);
    scroll.scrollTop = scroll.scrollHeight;
    return message;
  }

  function addBlock(className, html) {
    const block = document.createElement('div');
    block.className = `ai-block flow-card ${className}`;
    block.innerHTML = html;
    conversation.appendChild(block);
    scroll.scrollTop = scroll.scrollHeight;
    return block;
  }

  function setStage(copy, color = 'var(--success)') {
    stageCopy.textContent = copy;
    stageDot.style.background = color;
  }

  function applyDemoScenario(firstMessage) {
    const matched = demoScenarios[firstMessage];
    if (!matched) return;
    scenario = matched;
    state.demoScenario = matched;
  }

  function setProgress(value, label, tone = '') {
    const normalized = Math.max(0, Math.min(100, value));
    document.getElementById('progress').style.width = `${normalized}%`;
    document.getElementById('progress-value').textContent = `${normalized}%`;
    railStatus.textContent = label;
    railStatus.className = `status ${tone || (normalized >= 80 ? 'warning' : normalized ? '' : 'muted')}`;
  }

  function setCapability(label, copy, tone = 'muted') {
    state.matchLabel = label;
    matchStatus.textContent = label;
    matchStatus.className = `status ${tone}`;
    capabilityCopy.textContent = copy;
  }

  function setComposer(enabled, placeholder) {
    composer.disabled = !enabled;
    send.disabled = !enabled;
    composer.placeholder = placeholder;
    if (enabled) composer.focus();
  }

  function setDraftControls(visible) {
    discardTrigger?.classList.toggle('hidden', !visible);
    if (!visible) resumeNotice?.classList.add('hidden');
  }

  function openDiscardModal() {
    discardModal?.classList.add('show');
    document.getElementById('discard-cancel')?.focus();
  }

  function closeDiscardModal() {
    discardModal?.classList.remove('show');
  }

  function renderFacts() {
    const list = document.getElementById('fact-list');
    const labels = ['原始诉求', '真实场景', '当前流程与瓶颈', '频率与影响', '期望结果'];
    const facts = state.answers.map((answer, index) => ({ label: labels[index] || '补充信息', value: answer }));
    state.corrections.forEach(correction => facts.push({ label: '修正说明', value: correction }));
    if (state.supplementAnswer) facts.push({ label: '补充信息', value: state.supplementAnswer });
    if (state.insistReason) facts.push({ label: '坚持提交理由', value: state.insistReason });
    list.innerHTML = facts.length
      ? facts.map(fact => `<div class="fact-row"><strong>${fact.label}</strong><br>${safe(fact.value)}</div>`).join('')
      : '<div class="fact-row" style="color:var(--text-faint)">对话中确认的信息会显示在这里</div>';
  }

  function snapshot() {
    return {
      state,
      title: document.getElementById('conversation-title').textContent,
      stage: stageCopy.textContent,
      stageColor: stageDot.style.background,
      railStatus: railStatus.textContent,
      railStatusClass: railStatus.className,
      progress: document.getElementById('progress-value').textContent,
      match: matchStatus.textContent,
      matchClass: matchStatus.className,
      capability: capabilityCopy.textContent,
      solution: solutionCopy.textContent,
      conversationHTML: conversation.innerHTML,
      welcomeHidden: welcome.classList.contains('hidden'),
      composerPlaceholder: composer.placeholder,
      savedAt: new Date().toISOString()
    };
  }

  function saveDraft() {
    if (['submitted', 'resolved', 'out-of-scope', 'discarded'].includes(state.phase)) return;
    if (state.answers.length) setDraftControls(true);
    try {
      localStorage.setItem(draftKey, JSON.stringify(snapshot()));
    } catch (error) {
      console.warn('draft_save_failed', error);
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(draftKey);
    } catch (error) {
      console.warn('draft_clear_failed', error);
    }
    setDraftControls(false);
  }

  function completeActions(card, copy) {
    const actions = card.querySelector('.summary-card-actions');
    if (actions) actions.innerHTML = `<span class="action-complete"><xianma-icon name="check"></xianma-icon>${safe(copy)}</span>`;
  }

  function withTyping(process) {
    state.pendingAI = true;
    const typing = addMessage('ai', '', true);
    saveDraft();
    setTimeout(() => {
      typing.remove();
      state.pendingAI = false;
      process();
      saveDraft();
    }, 480);
  }

  function askQuestion(index) {
    state.phase = 'analysis';
    state.questionIndex = index;
    setComposer(true, '回答当前问题，Enter 发送，Shift + Enter 换行');
    addMessage('ai', questions[index]);
    setProgress(Math.min(24 + index * 14, 72), '分析中');
    setStage('正在分析需求 · 每轮只确认一个关键问题');
  }

  function bindDirectActions(card) {
    card.querySelector('[data-action="resolved"]')?.addEventListener('click', () => {
      completeActions(card, '已确认由现有能力解决');
      state.phase = 'resolved';
      setStage('现有能力已解决 · 本次不生成需求记录');
      setProgress(100, '已解决', 'success');
      solutionCopy.textContent = '本次问题已由现有能力解决，不形成重复需求。';
      setComposer(false, '本次分析已结束');
      clearDraft();
      toast('已结束，本次未提交需求');
    });
    card.querySelector('[data-action="continue"]')?.addEventListener('click', () => {
      completeActions(card, '已确认仍有未覆盖差距');
      setCapability('现有能力部分解决', '已有能力覆盖基础操作，但仍需确认未覆盖的业务差距。', 'warning');
      solutionCopy.textContent = '继续分析现有能力未覆盖的部分。';
      askQuestion(0);
      saveDraft();
    });
  }

  function showDirectResolution() {
    state.phase = 'direct-decision';
    setCapability('现有能力直接解决', '已匹配到现有浏览器操作能力，可完成读取、点击、输入和下载。', 'success');
    solutionCopy.textContent = '优先使用现有能力，确认仍有差距后再进入需求分析。';
    setProgress(24, '等待确认');
    setStage('已找到可直接使用的现有能力');
    const card = addBlock('direct-card', `
      <h3>现有能力可以直接处理</h3>
      <p>当前浏览器工具已经支持网页读取、点击、输入和下载。建议先直接发起任务验证，不重复建设相同能力。</p>
      <div class="notice">确认“问题已解决”后，本次对话结束且不会生成需求记录。</div>
      <div class="summary-card-actions">
        <button class="btn secondary" type="button" data-action="continue">仍未解决，继续提报</button>
        <button class="btn primary" type="button" data-action="resolved">问题已解决</button>
      </div>`);
    bindDirectActions(card);
    setComposer(false, '请先确认现有能力是否解决问题');
  }

  function showOutOfScope() {
    state.phase = 'out-of-scope';
    setCapability('不属于本模块', '本入口只处理 AI Studio 自身产品需求。');
    solutionCopy.textContent = '请通过对应业务系统或需求渠道继续处理。';
    setProgress(0, '不在范围', 'muted');
    setStage('已识别为非 AI Studio 产品需求', 'var(--warning)');
    addBlock('scope-card', `
      <h3>这条内容不属于 AI Studio 产品需求</h3>
      <p>需求提报只收集 AI Studio 自身的能力、体验和治理需求。其他业务系统或具体业务执行问题需要进入对应渠道。</p>
      <div class="notice">本次不会生成需求记录。</div>`);
    setComposer(false, '本次分析已结束');
    clearDraft();
  }

  function evaluateInitialRequest() {
    if (scenario === 'out-of-scope') return showOutOfScope();
    if (scenario === 'direct') return showDirectResolution();

    if (scenario === 'capability-error') {
      setCapability('暂时无法判断', '能力资料读取异常，当前关系和建议只能作为条件性判断。', 'warning');
      setStage('能力资料异常 · 继续收集问题事实', 'var(--warning)');
    } else if (scenario === 'supplement') {
      setCapability('当前无对应能力', '能力资料演示版已核对，暂未发现完整覆盖该场景的能力。');
      setStage('能力资料已核对 · 正在确认真实差距');
    } else if (scenario === 'not-recommended') {
      setCapability('暂时无法判断', '当前描述缺少明确对象和判断标准，需要继续核实。', 'warning');
      setStage('能力资料已核对 · 当前信息不足以判断');
    } else {
      setCapability('现有能力部分解决', '能力资料演示版已核对，已有基础能力但仍需确认具体差距。', 'warning');
      setStage('能力资料已核对 · 正在确认未覆盖差距');
    }
    askQuestion(0);
  }

  function bindStageActions(card) {
    card.querySelector('[data-action="continue"]')?.addEventListener('click', () => {
      completeActions(card, '阶段总结已确认');
      state.stageReviewed = true;
      askQuestion(state.nextQuestionIndex);
      saveDraft();
    });
    card.querySelector('[data-action="revise"]')?.addEventListener('click', () => {
      completeActions(card, '等待修正');
      beginCorrection('analysis');
    });
  }

  function showStageSummary(nextIndex) {
    state.phase = 'stage-summary';
    state.nextQuestionIndex = nextIndex;
    setProgress(56, '阶段确认');
    setStage('阶段总结待确认 · 确认后继续分析');
    const card = addBlock('stage-card', `
      <h3>阶段总结</h3>
      <p><strong>真实场景：</strong>${safe(state.answers[1] || '待确认')}</p>
      <p><strong>当前瓶颈：</strong>${safe(state.answers[2] || '待确认')}</p>
      <div class="summary-card-actions">
        <button class="btn secondary" type="button" data-action="revise">有误，需要修正</button>
        <button class="btn primary" type="button" data-action="continue">内容准确，继续</button>
      </div>`);
    bindStageActions(card);
    setComposer(false, '请先确认阶段总结');
  }

  function beginCorrection(returnPhase) {
    state.phase = 'correction-input';
    state.correctionReturn = returnPhase;
    addMessage('ai', '请指出一处需要修正的内容，我会更新需求理解后继续。');
    setComposer(true, '说明需要修正的事实');
    saveDraft();
  }

  function handleCorrection() {
    renderFacts();
    addMessage('ai', '已记录这次修正，并更新当前需求理解。');
    if (state.correctionReturn === 'summary') finishAnalysis(true);
    else {
      state.stageReviewed = true;
      askQuestion(state.nextQuestionIndex);
    }
  }

  function handleAnsweredQuestion() {
    renderFacts();
    const nextIndex = state.questionIndex + 1;
    if (nextIndex === 2 && !state.stageReviewed) showStageSummary(nextIndex);
    else if (nextIndex < questions.length) askQuestion(nextIndex);
    else finishAnalysis();
  }

  function bindCapabilityErrorActions(card) {
    card.querySelector('[data-action="retry"]')?.addEventListener('click', () => {
      completeActions(card, '能力资料已重新读取');
      state.capabilityRecovered = true;
      setCapability('现有能力部分解决', '能力资料演示版已恢复，已有基础能力但仍存在场景差距。', 'warning');
      addMessage('ai', '能力资料已恢复，我已重新核对现有能力和本次需求差距。');
      finishAnalysis(true);
      saveDraft();
    });
  }

  function showCapabilityErrorReview() {
    state.phase = 'capability-review';
    setProgress(82, '等待复核', 'warning');
    setStage('需求事实已收集 · 能力关系暂不能确认', 'var(--warning)');
    const card = addBlock('capability-error-card', `
      <h3>能力资料需要重新读取</h3>
      <p>需求事实已经收集完整，但能力资料当前异常，不能给出确定的“已有能力”或“无对应能力”判断。</p>
      <div class="notice">资料恢复前，建议方向只能作为条件性建议，不能进入普通提交。</div>
      <div class="summary-card-actions">
        <button class="btn primary" type="button" data-action="retry">重新读取能力资料</button>
      </div>`);
    bindCapabilityErrorActions(card);
    setComposer(false, '请先重新读取能力资料');
  }

  function bindSupplementActions(card) {
    card.querySelector('[data-action="supplement"]')?.addEventListener('click', () => {
      completeActions(card, '继续补充');
      state.phase = 'supplement-input';
      addMessage('ai', '请补充一个可观察的成功标准：最终看到什么结果，才能确认这个问题已经解决？');
      setComposer(true, '补充可观察的成功标准');
      saveDraft();
    });
  }

  function showSupplementRecommendation() {
    state.phase = 'supplement-gate';
    setProgress(82, '建议补充', 'warning');
    setStage('需求信息仍有关键缺口 · 暂不能普通提交', 'var(--warning)');
    const card = addBlock('supplement-card', `
      <h3>AI建议：建议补充</h3>
      <p>当前问题和场景已经明确，但还缺少可观察的成功标准。补齐后才能形成可评估的需求摘要。</p>
      <div class="summary-card-actions">
        <button class="btn primary" type="button" data-action="supplement">继续补充</button>
      </div>`);
    bindSupplementActions(card);
    setComposer(false, '请先继续补充需求');
  }

  function handleSupplement() {
    state.supplementCompleted = true;
    renderFacts();
    addMessage('ai', '成功标准已补充，需求信息现在可以进入摘要确认。');
    finishAnalysis(true);
  }

  function bindPausedActions(card) {
    card.querySelector('[data-action="resume"]')?.addEventListener('click', () => {
      completeActions(card, '继续补充需求');
      state.phase = 'resume-input';
      addMessage('ai', '请补充新的事实、影响或成功标准，我会重新判断需求是否适合提交。');
      setStage('继续分析已暂存需求 · 尚未提交');
      setProgress(84, '继续分析', 'warning');
      setComposer(true, '补充新的需求信息');
      saveDraft();
    });
    card.querySelector('[data-action="discard"]')?.addEventListener('click', openDiscardModal);
  }

  function pauseDraft(card) {
    state.phase = 'paused';
    setStage('本需求已暂存 · 尚未提交，可稍后继续', 'var(--warning)');
    setProgress(84, '已暂存', 'warning');
    solutionCopy.textContent = '本次未生成提交记录；后续可补充信息并重新判断。';
    card.querySelector('.summary-card-actions').innerHTML = `
      <button class="btn secondary" type="button" data-action="discard">放弃本次提报</button>
      <button class="btn primary" type="button" data-action="resume">继续补充</button>`;
    bindPausedActions(card);
    setComposer(false, '需求已暂存，可稍后继续');
    saveDraft();
    toast('需求已暂存，尚未提交');
  }

  function handleResumedInformation() {
    renderFacts();
    addMessage('ai', '补充信息已记录，我已重新生成需求摘要和提交建议。');
    finishAnalysis(true);
  }

  function bindNotRecommendedActions(card) {
    card.querySelector('[data-action="stop"]')?.addEventListener('click', () => {
      pauseDraft(card);
    });
    card.querySelector('[data-action="insist"]')?.addEventListener('click', () => {
      completeActions(card, '选择坚持提交');
      state.phase = 'insist-input';
      addMessage('ai', '请说明仍需提交的原因。这段说明会与 AI 判断一起保存。');
      setComposer(true, '填写坚持提交理由');
      saveDraft();
    });
  }

  function showNotRecommended() {
    state.phase = 'not-recommended';
    setProgress(84, '暂不建议', 'warning');
    setStage('AI 暂不建议提交 · 员工可保留最终决定权', 'var(--warning)');
    const card = addBlock('not-recommended-card', `
      <h3>AI建议：暂不建议提交</h3>
      <p>当前需求的判断对象和成功标准仍较宽，直接进入需求池可能无法形成明确范围。</p>
      <div class="notice">你可以暂不提交，也可以说明理由后坚持提交。AI 判断不会覆盖你的最终决定。</div>
      <div class="summary-card-actions">
        <button class="btn secondary" type="button" data-action="stop">暂不提交</button>
        <button class="btn primary" type="button" data-action="insist">坚持提交</button>
      </div>`);
    bindNotRecommendedActions(card);
    setComposer(false, '请先选择是否坚持提交');
  }

  function handleInsistReason() {
    renderFacts();
    addMessage('ai', '坚持提交理由已记录。接下来仍需确认需求摘要，再单独确认提交。');
    showSummary();
  }

  function bindSummaryActions(card) {
    card.querySelector('[data-action="revise"]')?.addEventListener('click', () => {
      completeActions(card, '等待修正');
      beginCorrection('summary');
    });
    card.querySelector('[data-action="confirm-summary"]')?.addEventListener('click', () => toReady(card));
  }

  function summaryProblem() {
    return state.corrections[state.corrections.length - 1] || state.answers[1] || state.answers[0] || '待确认';
  }

  function showSummary() {
    state.phase = 'summary';
    setProgress(90, '待确认', 'warning');
    setStage('需求摘要待确认 · 确认不等于提交');
    solutionCopy.textContent = '已基于当前能力和已确认差距生成建议方向，等待确认摘要。';
    const insisting = Boolean(state.insistReason);
    const card = addBlock('solution-card', `
      <h3>需求摘要与建议解决方向</h3>
      <p><strong>真实问题：</strong>${safe(summaryProblem())}</p>
      <p><strong>当前影响：</strong>${safe(state.answers[3] || '待用户确认')}</p>
      <p><strong>期望结果：</strong>${safe(state.supplementAnswer || state.answers[4] || '待用户确认')}</p>
      <p><strong>现有能力关系：</strong>${safe(state.matchLabel)}</p>
      <p><strong>建议方向：</strong>优先复用现有能力，只针对确认后的差距形成最小解决闭环。</p>
      <p><strong>AI建议：</strong> <span class="status ${insisting ? 'warning' : 'success'}">${insisting ? '暂不建议提交' : '建议提交'}</span></p>
      ${insisting ? `<div class="notice"><strong>提交方式：</strong>提报人坚持提交<br>${safe(state.insistReason)}</div>` : ''}
      <div class="summary-card-actions">
        <button class="btn secondary" type="button" data-action="revise">需要修正</button>
        <button class="btn primary" type="button" data-action="confirm-summary">确认摘要</button>
      </div>`);
    bindSummaryActions(card);
    setComposer(false, '请先确认需求摘要');
  }

  function finishAnalysis(force = false) {
    if (!force && scenario === 'capability-error' && !state.capabilityRecovered) return showCapabilityErrorReview();
    if (!force && scenario === 'supplement' && !state.supplementCompleted) return showSupplementRecommendation();
    if (!force && scenario === 'not-recommended' && !state.insistReason) return showNotRecommended();
    showSummary();
  }

  function bindReadyActions(card) {
    card.querySelector('[data-action="revise"]')?.addEventListener('click', () => {
      completeActions(card, '等待修正');
      beginCorrection('summary');
    });
    card.querySelector('[data-action="submit"]')?.addEventListener('click', () => attemptSubmit(card));
  }

  function toReady(card) {
    state.phase = 'ready';
    setProgress(100, '待提交', 'warning');
    setStage('摘要已确认，目前尚未提交');
    card.querySelector('.summary-card-actions').innerHTML = `
      <button class="btn secondary" type="button" data-action="revise">返回修改</button>
      <button class="btn primary" type="button" data-action="submit">确认提交</button>`;
    bindReadyActions(card);
    setComposer(false, '摘要已确认，请单独确认提交');
    saveDraft();
  }

  function attemptSubmit(card) {
    state.submitAttempts += 1;
    state.phase = 'submitting';
    const submitButton = card.querySelector('[data-action="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = '提交中';
    }
    setStage('正在提交需求 · 请勿重复操作');
    setTimeout(() => {
      if (scenario === 'submit-error' && state.submitAttempts === 1) {
        state.phase = 'ready';
        setStage('提交失败 · 需求仍保持待提交', 'var(--danger)');
        card.querySelector('.submit-error')?.remove();
        const error = document.createElement('div');
        error.className = 'notice danger submit-error';
        error.textContent = '提交接口暂时不可用，摘要和提交授权均已保留，请重试。';
        card.querySelector('.summary-card-actions').before(error);
        card.querySelector('.summary-card-actions').innerHTML = `
          <button class="btn secondary" type="button" data-action="revise">返回修改</button>
          <button class="btn primary" type="button" data-action="submit">重新提交</button>`;
        bindReadyActions(card);
        toast('提交失败，请重试');
        saveDraft();
        return;
      }
      completeSubmission(card);
    }, 650);
  }

  function completeSubmission(card) {
    state.phase = 'submitted';
    card.querySelector('.submit-error')?.remove();
    setStage('需求已提交 · 可在“我的提报”查看');
    setProgress(100, '已提交', 'success');
    card.querySelector('.summary-card-actions').innerHTML = `
      <div class="submission-result"><span>需求 ID</span><strong>${demoRequirementId}</strong></div>
      <a class="btn secondary" href="应用端_我的提报.html">查看我的提报</a>`;
    setComposer(false, '需求已提交');
    clearDraft();
    toast('需求已提交');
  }

  function submit() {
    const value = composer.value.trim();
    if (!value) return toast('请先填写内容');
    if (!['idle', 'analysis', 'correction-input', 'supplement-input', 'insist-input', 'resume-input'].includes(state.phase)) return;

    addMessage('user', value);
    composer.value = '';

    if (state.phase === 'idle') {
      applyDemoScenario(value);
      welcome.classList.add('hidden');
      document.getElementById('conversation-title').textContent = value.length > 18 ? `${value.slice(0, 18)}…` : value;
      state.answers.push(value);
      setDraftControls(true);
      renderFacts();
      state.phase = 'capability-check';
      setStage('正在核对需求范围与现有能力');
      setProgress(12, '核对中');
      setComposer(false, '正在核对当前能力');
      withTyping(evaluateInitialRequest);
      return;
    }

    if (state.phase === 'analysis') {
      state.answers.push(value);
      state.phase = 'answer-processing';
      setComposer(false, '正在更新需求理解');
      withTyping(handleAnsweredQuestion);
      return;
    }

    if (state.phase === 'correction-input') {
      state.corrections.push(value);
      state.phase = 'correction-processing';
      setComposer(false, '正在更新修正内容');
      withTyping(handleCorrection);
      return;
    }

    if (state.phase === 'supplement-input') {
      state.supplementAnswer = value;
      state.phase = 'supplement-processing';
      setComposer(false, '正在检查补充内容');
      withTyping(handleSupplement);
      return;
    }

    if (state.phase === 'resume-input') {
      state.corrections.push(value);
      state.phase = 'resume-processing';
      setComposer(false, '正在重新分析补充信息');
      withTyping(handleResumedInformation);
      return;
    }

    state.insistReason = value;
    state.phase = 'insist-processing';
    setComposer(false, '正在记录坚持提交理由');
    withTyping(handleInsistReason);
  }

  function restoreBindings() {
    const last = selector => {
      const nodes = conversation.querySelectorAll(selector);
      return nodes[nodes.length - 1];
    };
    if (state.phase === 'direct-decision') bindDirectActions(last('.direct-card'));
    if (state.phase === 'stage-summary') bindStageActions(last('.stage-card'));
    if (state.phase === 'capability-review') bindCapabilityErrorActions(last('.capability-error-card'));
    if (state.phase === 'supplement-gate') bindSupplementActions(last('.supplement-card'));
    if (state.phase === 'not-recommended') bindNotRecommendedActions(last('.not-recommended-card'));
    if (state.phase === 'paused') bindPausedActions(last('.not-recommended-card'));
    if (state.phase === 'summary') bindSummaryActions(last('.solution-card'));
    if (state.phase === 'ready') bindReadyActions(last('.solution-card'));
  }

  function resumePending() {
    conversation.querySelectorAll('.typing').forEach(node => node.closest('.message')?.remove());
    state.pendingAI = false;
    if (state.phase === 'capability-check') evaluateInitialRequest();
    else if (state.phase === 'answer-processing') handleAnsweredQuestion();
    else if (state.phase === 'correction-processing') handleCorrection();
    else if (state.phase === 'supplement-processing') handleSupplement();
    else if (state.phase === 'insist-processing') handleInsistReason();
    else if (state.phase === 'resume-processing') handleResumedInformation();
  }

  function restoreDraft() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(draftKey) || 'null');
    } catch (error) {
      console.warn('draft_restore_failed', error);
    }
    if (!saved?.state?.answers?.length) return false;

    state = { ...state, ...saved.state };
    if (scenarios.has(state.demoScenario)) scenario = state.demoScenario;
    document.getElementById('conversation-title').textContent = saved.title || '未完成需求';
    stageCopy.textContent = saved.stage || '继续分析需求';
    stageDot.style.background = saved.stageColor || 'var(--success)';
    railStatus.textContent = saved.railStatus || '分析中';
    railStatus.className = saved.railStatusClass || 'status';
    const progress = saved.progress || '0%';
    document.getElementById('progress-value').textContent = progress;
    document.getElementById('progress').style.width = progress;
    matchStatus.textContent = saved.match || state.matchLabel;
    matchStatus.className = saved.matchClass || 'status';
    capabilityCopy.textContent = saved.capability || '继续核对当前能力资料。';
    solutionCopy.textContent = saved.solution || '分析完成后生成建议方向。';
    conversation.innerHTML = saved.conversationHTML || '';
    welcome.classList.toggle('hidden', Boolean(saved.welcomeHidden));
    renderFacts();
    setComposer(!['direct-decision', 'stage-summary', 'capability-review', 'supplement-gate', 'not-recommended', 'paused', 'summary', 'ready'].includes(state.phase), saved.composerPlaceholder || '继续回答');
    scroll.scrollTop = scroll.scrollHeight;
    setDraftControls(true);
    resumeNotice?.classList.remove('hidden');
    toast('已恢复上次未完成的需求分析');

    if (state.pendingAI) resumePending();
    else restoreBindings();
    return true;
  }

  send.addEventListener('click', submit);
  composer.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  });
  discardTrigger?.addEventListener('click', openDiscardModal);
  document.getElementById('discard-close')?.addEventListener('click', closeDiscardModal);
  document.getElementById('discard-cancel')?.addEventListener('click', closeDiscardModal);
  document.getElementById('discard-confirm')?.addEventListener('click', () => {
    state.phase = 'discarded';
    clearDraft();
    closeDiscardModal();
    location.reload();
  });
  discardModal?.addEventListener('click', event => {
    if (event.target === discardModal) closeDiscardModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && discardModal?.classList.contains('show')) closeDiscardModal();
  });
  window.addEventListener('pagehide', saveDraft);
  restoreDraft();
})();
