const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("centaur", {
  getConfig: () => ipcRenderer.invoke("config:get"),
  setConfig: (cfg) => ipcRenderer.invoke("config:set", cfg),
  pickWorkspace: () => ipcRenderer.invoke("workspace:pick"),
  listSkills: () => ipcRenderer.invoke("skills:list"),
  runSkill: (payload) => ipcRenderer.invoke("skill:run", payload),
  onSkillEvent: (cb) => ipcRenderer.on("skill:event", (_e, evt) => cb(evt)),
  onConfirmRequest: (cb) => ipcRenderer.on("confirm:request", (_e, data) => cb(data)),
  respondConfirm: (id, ok) => ipcRenderer.send("confirm:response", { id, ok }),
});
