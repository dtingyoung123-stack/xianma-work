// 最小 Agent 闭环(对齐 PRD 阶段一完成标准：读文件 → 调 AI → 写文件)
// 证明：① Anthropic SDK 走公司网关 baseURL(客户端不持有真实 Key)
//       ② agent 循环 tool_use → 执行工具 → 回传 tool_result
//       ③ 高风险操作(覆盖/删除)执行前真人在 CLI 确认(真机换 Electron IPC)
const path = require("path");
const readline = require("readline");
const Anthropic = require("@anthropic-ai/sdk");
const { createTools, TOOL_SCHEMAS } = require("./tools.js");
const { SKILLS } = require("./skills.js");
const { SecurityError } = require("./sandbox.js");

const GATEWAY_URL = process.env.GATEWAY_URL || "http://127.0.0.1:8790";
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || "placeholder-jwt-token";
const USER_ID = process.env.USER_ID || "u001";
const WORKSPACE = path.join(__dirname, "..", "workspace-demo");

// 客户端不持有真实 Key：apiKey 是占位，真实 baseURL 指向公司网关
const client = new Anthropic({
  apiKey: GATEWAY_TOKEN,
  baseURL: GATEWAY_URL,
  defaultHeaders: { "x-user-id": USER_ID },
});

// 人工确认钩子：Spike 用 CLI readline；真机替换成 Electron 渲染进程弹窗(IPC)
function cliConfirm(action) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log(`\n⚠️  高风险操作需确认：${action.description}`);
    rl.question("   确认执行？(y/N) ", (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase() === "y");
    });
  });
}

async function runSkill(skillId, userRequest) {
  const skill = SKILLS[skillId];
  const tools = createTools(WORKSPACE, cliConfirm);
  const messages = [{ role: "user", content: userRequest }];

  console.log(`\n=== 执行技能：${skill.icon} ${skill.name} ===`);
  console.log(`工作区：${WORKSPACE}`);
  console.log(`网关：${GATEWAY_URL}（客户端不持有真实 Key）\n`);

  for (let step = 0; step < 10; step++) {
    const resp = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      system: skill.systemPrompt,
      tools: TOOL_SCHEMAS,
      messages,
    });

    messages.push({ role: "assistant", content: resp.content });

    if (resp.stop_reason !== "tool_use") {
      const text = resp.content.find((b) => b.type === "text");
      console.log(`\n✅ 完成：${text ? text.text : "(无文本)"}`);
      return;
    }

    // 执行本轮所有 tool_use
    const toolResults = [];
    for (const block of resp.content) {
      if (block.type !== "tool_use") continue;
      console.log(`🔧 调用工具：${block.name}(${JSON.stringify(block.input)})`);
      const fn = tools[block.name];
      let resultText;
      let isError = false;
      try {
        if (!fn) throw new SecurityError(`工具不在白名单：${block.name}`);
        resultText = String(await fn(block.input));
        console.log(`   ↳ ${resultText.slice(0, 60).replace(/\n/g, " ")}${resultText.length > 60 ? "…" : ""}`);
      } catch (e) {
        isError = true;
        resultText = `${e.name}: ${e.message}`;
        console.log(`   ↳ ❌ ${resultText}`);
      }
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: resultText, is_error: isError });
    }
    messages.push({ role: "user", content: toolResults });
  }
  console.log("\n⚠️ 达到最大步数，中止");
}

// 入口：跑周报技能
runSkill("weekly_report", "帮我生成上周(2026-07-14 ~ 2026-07-18)的周报，输出到 周报_20260718.md").catch((e) => {
  console.error("Agent 运行失败：", e.message);
  process.exit(1);
});
