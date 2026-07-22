// 预置技能定义(对齐 PRD 4 功能清单 / 5.2-5.5)
// Spike 只完整实现「周报生成」端到端；其余给出 schema 骨架 + system prompt。
// 每个技能 = 表单字段(params) + 给 Agent 的系统提示(systemPrompt) + 是否需完整实现。

const SKILLS = {
  weekly_report: {
    id: "weekly_report",
    name: "日报/周报生成",
    icon: "📊",
    implemented: true, // Spike 完整跑通
    params: [
      { key: "date_range", label: "时间范围", type: "daterange", required: true },
      {
        key: "sources",
        label: "数据源",
        type: "multiselect",
        options: ["项目文档", "Git 提交", "钉钉日历"],
        default: ["项目文档"],
      },
      { key: "format", label: "输出格式", type: "select", options: ["Markdown", "纯文本"], default: "Markdown" },
      { key: "output_path", label: "输出路径", type: "text", required: true },
    ],
    systemPrompt: `你是先马·Centaur 的周报助手。你只能操作工作区内的文件。
流程：用 list_files 查看工作区 → 用 read_file 读取相关文档 → 归纳成结构化周报
（本周完成事项 / 数据亮点 / 遇到的问题 / 下周计划）→ 用 write_file 写到用户指定的输出路径。
若输出路径已存在文件，write_file 会要求用户确认，请如实告知用户结果。
若工作区无可读文件，明确提示"未找到项目文档，请确认工作区路径"。`,
  },

  image_process: {
    id: "image_process",
    name: "P图/图片处理",
    icon: "🖼️",
    implemented: false, // Spike 只给骨架：需接图片处理工具(去背景/压缩/批量重命名)
    params: [
      { key: "input_dir", label: "图片文件夹", type: "text", required: true },
      { key: "operation", label: "操作", type: "select", options: ["去背景", "压缩", "批量重命名"], required: true },
      { key: "output_dir", label: "输出目录", type: "text", default: "processed" },
    ],
    systemPrompt: `你是图片处理助手。仅在工作区内操作。批量处理时单张失败要跳过并继续，最后汇总失败清单。`,
  },

  polish_text: {
    id: "polish_text",
    name: "文案润色/改写",
    icon: "✍️",
    implemented: false,
    params: [
      { key: "input", label: "原文(文件或直接输入)", type: "text", required: true },
      { key: "tone", label: "风格", type: "select", options: ["正式", "活泼", "简洁"], default: "简洁" },
    ],
    systemPrompt: `你是文案润色助手。保留原意，按指定风格改写。`,
  },

  meeting_notes: {
    id: "meeting_notes",
    name: "会议记录整理",
    icon: "📝",
    implemented: false,
    params: [
      { key: "input_file", label: "会议记录文件", type: "text", required: true },
      { key: "output_path", label: "输出路径", type: "text", required: true },
    ],
    systemPrompt: `你是会议纪要助手。把原始记录整理成：议题 / 决议 / 待办(负责人+截止时间)。`,
  },
};

module.exports = { SKILLS };
