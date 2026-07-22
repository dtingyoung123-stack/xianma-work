// 工具层：文件读写工具 + 白名单 + 高风险人工确认拦截(对齐 PRD 8.2.2 / 8.2.3)
const fs = require("fs");
const path = require("path");
const { validatePath, SecurityError } = require("./sandbox.js");

// 工具白名单：不在此表的工具调用一律拒绝
const TOOL_WHITELIST = new Set(["read_file", "write_file", "delete_file", "list_files"]);

// confirmHook: async (action) => boolean
//   action = { type, description, targets }
//   Spike 用命令行 readline 模拟；真机换成 Electron IPC 弹窗。
//   关键：确认必须由真人触发，Agent 无法自动点击(PRD 8.2.3)。
function createTools(workspacePath, confirmHook) {
  async function guardConfirm(action) {
    const ok = await confirmHook(action);
    if (!ok) {
      throw new SecurityError(`用户取消了高风险操作：${action.description}`);
    }
  }

  return {
    // 读文件：无副作用，不需确认
    read_file: async ({ file_path }) => {
      const real = validatePath(workspacePath, file_path);
      return fs.readFileSync(real, "utf-8");
    },

    // 列目录：无副作用
    list_files: async ({ dir = "." }) => {
      const real = validatePath(workspacePath, dir);
      return fs.readdirSync(real);
    },

    // 写文件：若覆盖已存在文件 → 高风险，需人工确认
    write_file: async ({ file_path, content }) => {
      const abs = path.resolve(workspacePath, file_path);
      const willOverwrite = fs.existsSync(abs);
      const real = validatePath(workspacePath, file_path);
      if (willOverwrite) {
        await guardConfirm({
          type: "overwrite",
          description: `覆盖已存在文件：${file_path}`,
          targets: [file_path],
        });
      }
      fs.writeFileSync(real, content, "utf-8");
      return `已写入：${file_path}（${Buffer.byteLength(content)} 字节）`;
    },

    // 删文件：始终高风险，必须确认
    delete_file: async ({ file_path }) => {
      const real = validatePath(workspacePath, file_path);
      await guardConfirm({
        type: "delete",
        description: `删除文件：${file_path}`,
        targets: [file_path],
      });
      fs.unlinkSync(real);
      return `已删除：${file_path}`;
    },
  };
}

// 工具的 JSON Schema 定义(供 Anthropic SDK 注册)
const TOOL_SCHEMAS = [
  {
    name: "read_file",
    description: "读取工作区内指定文件的文本内容",
    input_schema: {
      type: "object",
      properties: { file_path: { type: "string", description: "工作区内的相对路径" } },
      required: ["file_path"],
    },
  },
  {
    name: "list_files",
    description: "列出工作区内某目录的文件",
    input_schema: {
      type: "object",
      properties: { dir: { type: "string", description: "工作区内相对目录，默认根目录" } },
    },
  },
  {
    name: "write_file",
    description: "把内容写入工作区内文件(覆盖已存在文件需用户确认)",
    input_schema: {
      type: "object",
      properties: {
        file_path: { type: "string" },
        content: { type: "string" },
      },
      required: ["file_path", "content"],
    },
  },
  {
    name: "delete_file",
    description: "删除工作区内文件(必须用户确认)",
    input_schema: {
      type: "object",
      properties: { file_path: { type: "string" } },
      required: ["file_path"],
    },
  },
];

module.exports = { createTools, TOOL_SCHEMAS, TOOL_WHITELIST };
