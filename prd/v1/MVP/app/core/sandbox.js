// 工作区沙箱：路径校验(对齐 PRD 8.2.1)
// 所有文件读写前必须过这一层，防止访问工作区外文件 / 系统目录。
const fs = require("fs");
const path = require("path");

class SecurityError extends Error {
  constructor(message) {
    super(message);
    this.name = "SecurityError";
  }
}

// 系统关键目录黑名单：即使管理员模式也需二次确认(此处直接拒绝)
const SYSTEM_BLACKLIST =
  process.platform === "win32"
    ? ["C:\\Windows", "C:\\Program Files"]
    : ["/System", "/etc", "/usr", "/bin", "/sbin", "/var"];

// 把工作区路径规范化成「真实绝对路径 + 末尾分隔符」，供前缀比较
function normalizeWorkspace(workspacePath) {
  const abs = path.resolve(workspacePath);
  // 工作区本身必须存在，否则无法解析软链接真实路径
  const real = fs.realpathSync(abs);
  return real.endsWith(path.sep) ? real : real + path.sep;
}

// 核心校验：解析软链接 → 规范化 → 工作区前缀校验 → 系统黑名单校验
// targetPath 可以是尚不存在的文件(如待写入的输出文件)，此时校验其父目录。
function validatePath(workspacePath, targetPath) {
  const workspaceReal = normalizeWorkspace(workspacePath);

  // 拒绝含 .. 的原始路径(穿越攻击的显式信号)
  if (targetPath.split(/[\\/]/).includes("..")) {
    throw new SecurityError(`禁止路径穿越(含 ..)：${targetPath}`);
  }

  const abs = path.resolve(workspacePath, targetPath);

  // 目标存在则解析其真实路径(软链接会在此暴露真实目标)；
  // 不存在则解析父目录的真实路径，再拼回文件名。
  let real;
  if (fs.existsSync(abs)) {
    real = fs.realpathSync(abs);
  } else {
    const parent = path.dirname(abs);
    if (!fs.existsSync(parent)) {
      throw new SecurityError(`父目录不存在：${parent}`);
    }
    real = path.join(fs.realpathSync(parent), path.basename(abs));
  }

  // 1. 必须落在工作区内(前缀校验，已解析软链接真实目标)
  const realWithSep = real.endsWith(path.sep) ? real : real + path.sep;
  if (!realWithSep.startsWith(workspaceReal) && real + path.sep !== workspaceReal) {
    throw new SecurityError(`禁止访问工作区外路径：${targetPath}`);
  }

  // 2. 命中系统黑名单则拒绝
  if (SYSTEM_BLACKLIST.some((p) => real === p || real.startsWith(p + path.sep))) {
    throw new SecurityError(`禁止访问系统目录：${targetPath}`);
  }

  return real;
}

module.exports = { validatePath, SecurityError, SYSTEM_BLACKLIST, normalizeWorkspace };
