// 沙箱逃逸测试(对齐 PRD 8.2.7 安全测试要求 #1)
// 运行: node --test  (在 MVP 目录下)
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { validatePath, SecurityError } = require("../src/sandbox.js");

// 搭一个临时工作区 + 一个工作区外的"机密"目录
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "centaur-spike-"));
const workspace = path.join(tmpRoot, "workspace");
const outside = path.join(tmpRoot, "secret-outside");
fs.mkdirSync(workspace, { recursive: true });
fs.mkdirSync(outside, { recursive: true });
fs.writeFileSync(path.join(workspace, "report.md"), "# 周报\n");
fs.writeFileSync(path.join(outside, "passwd"), "SECRET");

test("正常：工作区内已存在文件通过", () => {
  const real = validatePath(workspace, "report.md");
  assert.ok(real.endsWith("report.md"));
});

test("正常：工作区内待写入的新文件通过(父目录存在)", () => {
  const real = validatePath(workspace, "周报_20260722.md");
  assert.ok(real.includes("周报_20260722.md"));
});

test("拦截：../ 相对路径穿越", () => {
  assert.throws(
    () => validatePath(workspace, "../secret-outside/passwd"),
    SecurityError
  );
});

test("拦截：多级 ../../ 穿越到系统目录", () => {
  assert.throws(
    () => validatePath(workspace, "../../../../etc/passwd"),
    SecurityError
  );
});

test("拦截：绝对路径指向工作区外", () => {
  assert.throws(
    () => validatePath(workspace, path.join(outside, "passwd")),
    SecurityError
  );
});

test("拦截：绝对路径指向系统目录 /etc/passwd", () => {
  // 非 win 平台才有 /etc
  if (process.platform !== "win32") {
    assert.throws(() => validatePath(workspace, "/etc/passwd"), SecurityError);
  }
});

test("拦截：软链接指向工作区外(用 realpath 解析真实目标)", () => {
  const linkPath = path.join(workspace, "evil-link");
  try {
    fs.symlinkSync(path.join(outside, "passwd"), linkPath);
  } catch {
    return; // 无软链接权限则跳过
  }
  assert.throws(() => validatePath(workspace, "evil-link"), SecurityError);
});

test("拦截：软链接目录指向工作区外，再访问其下文件", () => {
  const linkDir = path.join(workspace, "escape-dir");
  try {
    fs.symlinkSync(outside, linkDir);
  } catch {
    return;
  }
  assert.throws(() => validatePath(workspace, "escape-dir/passwd"), SecurityError);
});

test.after(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});
