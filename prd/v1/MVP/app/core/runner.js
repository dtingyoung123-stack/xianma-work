// Agent 循环(OpenAI 兼容，GPT/DeepSeek/通义/智谱 改 baseURL+model 即可切换)
const OpenAI = require("openai");
const { createTools, TOOL_SCHEMAS } = require("./tools.js");
const { SKILLS } = require("./skills.js");
const { SecurityError } = require("./sandbox.js");

// 把 Anthropic 风格的 TOOL_SCHEMAS 转成 OpenAI function-calling 格式
function toOpenAITools() {
  return TOOL_SCHEMAS.map((t) => ({
    type: "function",
    function: { name: t.name, description: t.description, parameters: t.input_schema },
  }));
}

// modelConfig: { baseURL, apiKey, model }
// confirmHook: async (action) => boolean   （由主进程注入，走 IPC 弹窗）
// onEvent: (evt) => void                    （进度回调，推给渲染进程）
async function runSkill({ skillId, userRequest, workspace, modelConfig, confirmHook, onEvent }) {
  const skill = SKILLS[skillId];
  if (!skill) throw new Error(`未知技能：${skillId}`);

  const client = new OpenAI({ baseURL: modelConfig.baseURL, apiKey: modelConfig.apiKey });
  const tools = createTools(workspace, confirmHook);
  const openaiTools = toOpenAITools();

  const messages = [
    { role: "system", content: skill.systemPrompt },
    { role: "user", content: userRequest },
  ];

  onEvent({ type: "start", skill: skill.name });

  for (let step = 0; step < 12; step++) {
    let resp;
    try {
      resp = await client.chat.completions.create({
        model: modelConfig.model,
        messages,
        tools: openaiTools,
        tool_choice: "auto",
      });
    } catch (err) {
      const msg = friendlyApiError(err);
      onEvent({ type: "done", text: msg });
      return { ok: false, text: msg };
    }
    const msg = resp.choices[0].message;
    messages.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      onEvent({ type: "done", text: msg.content || "" });
      return { ok: true, text: msg.content || "" };
    }

    for (const call of msg.tool_calls) {
      const name = call.function.name;
      let args = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        /* 保留空参 */
      }
      onEvent({ type: "tool", name, args });

      const fn = tools[name];
      let content, isError = false;
      try {
        if (!fn) throw new SecurityError(`工具不在白名单：${name}`);
        content = String(await fn(args));
        onEvent({ type: "tool_result", name, ok: true, preview: content.slice(0, 80) });
      } catch (e) {
        isError = true;
        content = `${e.name}: ${e.message}`;
        onEvent({ type: "tool_result", name, ok: false, preview: content });
      }
      messages.push({ role: "tool", tool_call_id: call.id, content });
    }
  }
  onEvent({ type: "done", text: "达到最大步数，已中止" });
  return { ok: false, text: "达到最大步数" };
}

// 把 API 报错翻译成给非技术用户看的干净提示（不把原始 HTML/堆栈怼给用户）
function friendlyApiError(err) {
  const status = err?.status || err?.response?.status;
  if (status === 401 || status === 403) return "❌ API Key 无效或无权限，请到设置里检查 Key 是否填对、是否已过期。";
  if (status === 429)
    return "❌ 请求被限流或拦截(429)。可能原因：①API Key 余额/额度用尽 ②调用太频繁 ③当前网络/IP 被模型服务商的防护(Cloudflare)拦截。请检查账户额度，或稍后再试。";
  if (status === 404) return "❌ 模型名或 API 地址不对(404)，请到设置里确认「模型名」和「API 地址」。";
  if (status >= 500) return "❌ 模型服务商暂时不可用，请稍后重试。";
  const raw = String(err?.message || err || "");
  // 若错误体是 HTML，只提炼状态，不外泄整页
  if (raw.includes("<!DOCTYPE") || raw.includes("<html")) return "❌ 服务端返回了异常页面(可能被网络防护拦截)，请检查网络或稍后重试。";
  return "❌ 调用失败：" + raw.slice(0, 200);
}

module.exports = { runSkill };
