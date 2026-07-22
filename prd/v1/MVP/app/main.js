const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { runSkill } = require("./core/runner.js");
const { SKILLS } = require("./core/skills.js");

// 配置存 userData（不明文进代码，API Key 由用户在设置页填）
const CONFIG_PATH = () => path.join(app.getPath("userData"), "config.json");
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH(), "utf-8"));
  } catch {
    return { workspace: "", model: { provider: "deepseek", baseURL: "https://api.deepseek.com/v1", apiKey: "", model: "deepseek-chat" } };
  }
}
function saveConfig(cfg) {
  fs.mkdirSync(path.dirname(CONFIG_PATH()), { recursive: true });
  fs.writeFileSync(CONFIG_PATH(), JSON.stringify(cfg, null, 2));
}

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    title: "先马Centaur",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());

// —— IPC：配置读写 ——
ipcMain.handle("config:get", () => loadConfig());
ipcMain.handle("config:set", (_e, cfg) => {
  saveConfig(cfg);
  return true;
});

// —— IPC：选工作区目录 ——
ipcMain.handle("workspace:pick", async () => {
  const r = await dialog.showOpenDialog(mainWindow, { properties: ["openDirectory", "createDirectory"] });
  if (r.canceled || !r.filePaths[0]) return null;
  const cfg = loadConfig();
  cfg.workspace = r.filePaths[0];
  saveConfig(cfg);
  return r.filePaths[0];
});

// —— IPC：技能列表 ——
ipcMain.handle("skills:list", () =>
  Object.values(SKILLS).map((s) => ({ id: s.id, name: s.name, icon: s.icon, params: s.params, implemented: s.implemented }))
);

// —— IPC：高风险确认（真人在渲染进程点，主进程 Agent 无法自调）——
const pendingConfirms = new Map();
function requestConfirm(action) {
  return new Promise((resolve) => {
    const id = "cfm_" + Date.now() + "_" + Math.round(Math.random() * 1e6);
    pendingConfirms.set(id, resolve);
    mainWindow.webContents.send("confirm:request", { id, action });
  });
}
ipcMain.on("confirm:response", (_e, { id, ok }) => {
  const resolve = pendingConfirms.get(id);
  if (resolve) {
    resolve(!!ok);
    pendingConfirms.delete(id);
  }
});

// —— IPC：执行技能 ——
ipcMain.handle("skill:run", async (e, { skillId, userRequest }) => {
  const cfg = loadConfig();
  if (!cfg.workspace) return { ok: false, text: "未设置工作区，请先在设置里选择工作区目录" };
  if (!cfg.model?.apiKey) return { ok: false, text: "未配置模型 API Key，请先在设置里填写" };

  const onEvent = (evt) => e.sender.send("skill:event", evt);
  try {
    return await runSkill({
      skillId,
      userRequest,
      workspace: cfg.workspace,
      modelConfig: cfg.model,
      confirmHook: requestConfirm,
      onEvent,
    });
  } catch (err) {
    return { ok: false, text: `执行失败：${err.message}` };
  }
});
