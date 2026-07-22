const C = window.centaur;
let activeSkill = null;
let running = false;

const PROVIDER_DEFAULTS = {
  deepseek: { baseURL: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  openai: { baseURL: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  custom: { baseURL: "", model: "" },
};

// 只刷新配置显示 + 技能卡（可重复调用）
async function init() {
  const cfg = await C.getConfig();
  document.getElementById("wsPath").textContent = cfg.workspace || "未设置工作区";
  document.getElementById("modelBadge").textContent = cfg.model?.model || "未配置模型";

  const skills = await C.listSkills();
  const list = document.getElementById("skillList");
  list.innerHTML = "";
  skills.forEach((s) => {
    const el = document.createElement("div");
    el.className = "skill-card";
    el.innerHTML = `<div class="ic">${s.icon}</div><div class="nm">${s.name}</div><div class="st">${s.implemented ? "可用" : "开发中"}</div>`;
    el.onclick = () => selectSkill(s, el);
    list.appendChild(el);
  });
}

// 事件监听只注册一次（避免重复注册导致事件触发多次）
C.onSkillEvent(handleEvent);
C.onConfirmRequest(showConfirm);

function selectSkill(s, el) {
  document.querySelectorAll(".skill-card").forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  activeSkill = s.id;
  const input = document.getElementById("userInput");
  input.placeholder = `已选「${s.name}」，描述需求后点执行`;
  input.focus();
}

function addEvent(html, cls) {
  const chat = document.getElementById("chat");
  const empty = chat.querySelector(".empty");
  if (empty) empty.remove();
  const el = document.createElement("div");
  el.className = "event " + cls;
  el.innerHTML = html;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function esc(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function handleEvent(evt) {
  if (evt.type === "start") addEvent(`开始执行技能：${esc(evt.skill)}`, "tool");
  else if (evt.type === "tool") addEvent(`🔧 ${esc(evt.name)}(${esc(JSON.stringify(evt.args))})`, "tool");
  else if (evt.type === "tool_result")
    addEvent(`&nbsp;&nbsp;↳ <span class="${evt.ok ? "ok" : "err"}">${evt.ok ? "✓" : "✗"} ${esc(evt.preview)}</span>`, "tool");
  else if (evt.type === "done") {
    addEvent(esc(evt.text), "done");
    setRunning(false);
  }
}

function setRunning(v) {
  running = v;
  document.getElementById("sendBtn").disabled = v;
  document.getElementById("sendBtn").textContent = v ? "执行中…" : "执行";
}

async function send() {
  if (running) return;
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;
  if (!activeSkill) {
    activeSkill = "weekly_report"; // 默认技能
  }
  addEvent(`<span>${esc(text)}</span>`, "user");
  input.value = "";
  setRunning(true);
  const res = await C.runSkill({ skillId: activeSkill, userRequest: text });
  if (res && !res.ok && res.text) {
    addEvent(esc(res.text), "done");
    setRunning(false);
  }
}

// —— 高风险确认弹窗 ——
let confirmId = null;
function showConfirm({ id, action }) {
  confirmId = id;
  document.getElementById("confirmText").textContent = action.description;
  document.getElementById("confirmModal").classList.add("show");
}
function resolveConfirm(ok) {
  document.getElementById("confirmModal").classList.remove("show");
  if (confirmId) {
    C.respondConfirm(confirmId, ok);
    confirmId = null;
  }
}

// —— 设置 ——
async function openSettings() {
  const cfg = await C.getConfig();
  document.getElementById("setWs").value = cfg.workspace || "";
  document.getElementById("setProvider").value = cfg.model?.provider || "deepseek";
  document.getElementById("setBaseURL").value = cfg.model?.baseURL || "";
  document.getElementById("setModel").value = cfg.model?.model || "";
  document.getElementById("setKey").value = cfg.model?.apiKey || "";
  document.getElementById("settingsModal").classList.add("show");
}
function closeSettings() {
  document.getElementById("settingsModal").classList.remove("show");
}
function onProviderChange() {
  const p = document.getElementById("setProvider").value;
  const d = PROVIDER_DEFAULTS[p];
  document.getElementById("setBaseURL").value = d.baseURL;
  document.getElementById("setModel").value = d.model;
}
async function pickWs() {
  const p = await C.pickWorkspace();
  if (p) document.getElementById("setWs").value = p;
}
async function saveSettings() {
  const cfg = await C.getConfig();
  cfg.workspace = document.getElementById("setWs").value;
  cfg.model = {
    provider: document.getElementById("setProvider").value,
    baseURL: document.getElementById("setBaseURL").value.trim(),
    model: document.getElementById("setModel").value.trim(),
    apiKey: document.getElementById("setKey").value.trim(),
  };
  await C.setConfig(cfg);
  closeSettings();
  init();
}

init();
