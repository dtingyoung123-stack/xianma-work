// Mock 公司网关(对齐 PRD 7.2 网关职责 + 6.1 用量记录)
// 作用：无真实 API Key 也能跑通「客户端 → 公司网关 → API」闭环。
// 它模拟 Anthropic Messages API 的响应，按对话进度返回工具调用，
// 同时记录用量(模拟 api_calls 表)、演示限流挂载点。
//
// 真机上这一层换成真正的 Node.js 网关：鉴权(JWT)→ 限流(Redis)→ 记账(MySQL)→ 转发真实 Anthropic API。
const http = require("http");

const PORT = 8790;

// 模拟用量记录表 api_calls(PRD 6.1)
const usageLog = [];
// 模拟限流(PRD 7.3.1 滑动窗口)——此处内存计数，真机用 Redis
const RATE_LIMIT_PER_DAY = 50;
const callCounter = {};

function countToolResults(messages) {
  let n = 0;
  for (const m of messages) {
    if (Array.isArray(m.content)) {
      for (const b of m.content) if (b.type === "tool_result") n++;
    }
  }
  return n;
}

// 按对话进度编排工具调用，驱动周报技能完整闭环
function planResponse(messages) {
  const done = countToolResults(messages);
  if (done === 0) {
    return { type: "tool_use", name: "list_files", input: { dir: "." } };
  }
  if (done === 1) {
    return { type: "tool_use", name: "read_file", input: { file_path: "项目进展.md" } };
  }
  if (done === 2) {
    const content =
      "# 周报（2026-07-14 ~ 2026-07-18）\n\n" +
      "## 本周完成事项\n- 完成 Centaur Spike 阶段一，核实 OpenClaw 架构错配\n- 决策改用 Anthropic SDK + Electron\n\n" +
      "## 数据亮点\n- 沙箱逃逸测试 8/8 通过\n\n## 遇到的问题\n- OpenClaw 与 PRD 拓扑不匹配\n\n## 下周计划\n- 完成技术方案文档，进入 Sprint 1\n";
    return { type: "tool_use", name: "write_file", input: { file_path: "周报_20260718.md", content } };
  }
  return { type: "text", text: "周报已生成：周报_20260718.md。结构含本周完成/数据亮点/问题/下周计划。" };
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405);
    return res.end();
  }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const userId = req.headers["x-user-id"] || "u001";

    // —— 限流中间件(PRD 7.3.1)——
    const today = new Date().toISOString().slice(0, 10);
    const key = `${userId}:${today}`;
    callCounter[key] = (callCounter[key] || 0) + 1;
    if (callCounter[key] > RATE_LIMIT_PER_DAY) {
      res.writeHead(429, { "content-type": "application/json" });
      return res.end(JSON.stringify({ error: { type: "rate_limit", message: "今日额度已用完" } }));
    }

    const payload = JSON.parse(body || "{}");
    const decision = planResponse(payload.messages || []);

    // —— 用量记录(PRD 6.1，只记元数据不记原文，对齐 8.2.5 脱敏)——
    usageLog.push({
      user_id: userId,
      timestamp: new Date().toISOString(),
      model: payload.model || "claude-opus-4-8",
      prompt_tokens: 500,
      completion_tokens: 120,
      skill_name: "weekly_report",
      status: "success",
    });

    // 组装成 Anthropic Messages API 响应形状
    const content =
      decision.type === "tool_use"
        ? [{ type: "tool_use", id: "toolu_" + usageLog.length, name: decision.name, input: decision.input }]
        : [{ type: "text", text: decision.text }];
    const response = {
      id: "msg_mock_" + usageLog.length,
      type: "message",
      role: "assistant",
      model: payload.model || "claude-opus-4-8",
      content,
      stop_reason: decision.type === "tool_use" ? "tool_use" : "end_turn",
      usage: { input_tokens: 500, output_tokens: 120 },
    };
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(response));
  });
});

server.listen(PORT, () => {
  console.log(`[mock 网关] 监听 http://127.0.0.1:${PORT}  (限流 ${RATE_LIMIT_PER_DAY}/天/人)`);
  console.log(`[mock 网关] 模拟职责：鉴权占位 → 限流计数 → 用量记录(api_calls) → 代理转发`);
});

// 暴露给 agent 同进程调用时读取用量(演示监控)
module.exports = { usageLog, callCounter, PORT };
