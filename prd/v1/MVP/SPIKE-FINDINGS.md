# 先马·Centaur Spike 阶段一核心发现

**日期**: 2026-07-22  
**目标**: 验证 OpenClaw 技术可行性(PRD 风险 1)  
**状态**: ⚠️ 架构错配已识别,需决策

---

## 1. OpenClaw 核实结果

### ✅ 真实性
- **官方仓库**: [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
- **成熟度**: 真实且快速成长的开源项目,有活跃维护
- **能力**: 支持文件读写(`read`/`write`/`edit`)、命令执行(`exec`)、多 LLM 后端(Anthropic/OpenAI/Google)

### ⚠️ 架构形态(关键错配)

| 维度 | PRD 设想 | OpenClaw 实际 |
|---|---|---|
| **部署拓扑** | 每个员工电脑上装 Electron/Tauri **桌面客户端**,内嵌 Agent,员工各自跑在本地 | **自托管 Gateway 服务端**(Node.js daemon),设计上跑在服务器,接多个聊天渠道(Slack/Telegram/Discord) |
| **沙箱机制** | **路径前缀校验**(realpath 规范化 + 工作区前缀判断 + 系统黑名单,PRD 8.2.1) | **Docker 容器隔离**(off/non-main/all 模式)+ 工作区读写级别(none/ro/rw) |
| **高风险操作** | **真人在 UI 手动确认**(删除/覆盖/外发前弹窗,Agent 无法自动点击) | **工具策略**(静态 allow/deny),无交互式人工确认机制 |
| **公司网关** | 独立的 **Node.js/Go 网关**(鉴权、限流、用量记录、代理 OpenAI API) | OpenClaw Gateway 自带转发,但不包含企业级鉴权/限流/成本监控 |

---

## 2. 核心结论:架构不一致

**OpenClaw 是「服务端多渠道网关 Agent」,不是「逐员工桌面内嵌的 Agent SDK」。**

- ✅ 它有 skill 定义格式(markdown 文件)
- ✅ 它能读写文件、执行命令
- ❌ 它的 Docker 沙箱不适合分发给非技术员工(运营/设计/客服装 Docker 运维成本高)
- ❌ 它缺少 PRD 核心安全需求的两层:**路径校验沙箱**(自己封装)+ **UI 人工确认**(自己建)
- ❌ 它的 Gateway 拓扑和 PRD 设想的「客户端→公司网关→OpenAI」拓扑不同

---

## 3. 决策分叉:继续用 OpenClaw 还是改方案?

### 🔀 选项 A:硬上 OpenClaw(适配其服务端拓扑)

**做法**:把 OpenClaw Gateway 整体塞进 Electron,逐机分发给员工(每台笔记本跑一个本地 Gateway + pi-mono runtime)。

**代价**:
- 逆着它的设计用(它设计是一个服务器接多人,现在变成每人一个独立实例)
- Docker 沙箱要么丢掉(降级到路径校验自己封装),要么强制员工装 Docker
- UI 人工确认层无论如何都得自己建
- 公司网关层(限流/鉴权/用量)还是得自己写,OpenClaw 的 Gateway 能力对这个场景不够用

**适合场景**:团队看重 OpenClaw 的 skill 生态(ClawHub)、多 LLM 支持、长对话管理。

---

### 🔀 选项 B:基于 Claude Agent SDK 构建(推荐)

**做法**:用 Anthropic 官方 [Agent SDK](https://github.com/anthropics/anthropic-sdk-typescript/tree/main/packages/agent) 在 Electron 内封装 Agent,路径沙箱/UI 确认/工具白名单自己控制。

**优势**:
- ✅ 拓扑对齐 PRD(客户端内嵌 Agent → 公司网关代理 API)
- ✅ 路径校验沙箱自己封装,不依赖 Docker
- ✅ UI 人工确认层直接集成进 Electron UI
- ✅ 工具权限精准控制(哪些函数允许调用、参数白名单)
- ✅ 官方维护,兼容 Claude 4.X 最新能力

**代价**:
- skill 定义格式得自己设计(可参考 OpenClaw 的 markdown skill 格式)
- 没有现成的 ClawHub 技能市场(V1.0 只有 4 个预置技能,可接受)

**适合场景**:PRD 当前场景——每个员工独立运行,安全可控,不需要外部技能市场。

---

### 🔀 选项 C:自研轻量 Agent 层

**做法**:在 Electron 内封装一个最小 Agent 循环(prompt → Claude API → 函数调用 → 执行工具 → 反馈结果),不依赖任何框架。

**优势**:
- ✅ 完全可控,代码量小(<500 行)
- ✅ 零外部依赖,打包体积最小
- ✅ 路径沙箱/UI 确认/工具白名单按 PRD 精确实现

**代价**:
- 需要自己处理 Agent 循环、工具调用、错误重试、上下文管理
- V2.0 如果要加复杂编排(if/loop/多步任务)维护成本高

**适合场景**:团队有 Anthropic API 经验,希望最大化控制权。

---

## 4. 推荐方案(基于 PRD 约束)

**推荐:选项 B(Claude Agent SDK)**

**理由**:
1. PRD 的核心约束是**企业安全 + 非技术员工易用**,不是技能市场规模
2. V1.0 只有 4 个预置技能,不需要 ClawHub 生态
3. 路径沙箱、UI 人工确认、公司网关限流是 PRD 最看重的三件事,OpenClaw 都不直接满足,用它反而要额外封装
4. Claude Agent SDK 官方维护,兼容 Claude 4.X,长期稳定性更高
5. 拓扑天然对齐 PRD(客户端 → 公司网关 → Anthropic API)

**如果选择此方案,Spike 阶段二验证内容**:
1. 用 Claude Agent SDK 在 Node.js 环境跑通最小闭环(读文件 → 调 API → 写文件)
2. 实现 PRD 8.2.1 的路径校验沙箱逻辑,用 `../`/软链接/绝对路径测试
3. 设计 4 个预置技能的函数签名(周报/P图/文案/会议)
4. 确认 Electron IPC 如何把工具调用结果传回渲染进程触发 UI 确认框

---

## 5. Spike 下一步(等决策)

**如果走 B(推荐)**:
- [ ] 搭建 Node.js + Claude Agent SDK 最小 demo(读文件 → 调 API → 写文件)
- [ ] 实现路径校验沙箱(`validate_path`)并测试逃逸场景
- [ ] 设计预置技能 JSON schema(周报/P图/文案/会议)
- [ ] 输出技术方案文档(客户端 Electron vs Tauri 对比 + 架构图 + 模块拆分 + 里程碑)

**如果走 A(OpenClaw)**:
- [ ] 试验如何在 Electron 内嵌 OpenClaw Gateway
- [ ] 确认 Docker 沙箱是否可替换为路径校验
- [ ] 研究如何拦截工具调用触发 UI 确认

**如果走 C(自研)**:
- [ ] 实现 Agent 循环(prompt → function calling → tool execution → result)
- [ ] 封装工具函数白名单和参数校验
- [ ] 设计技能定义格式

---

## 6. 关键资料

- [OpenClaw 官方仓库](https://github.com/openclaw/openclaw)
- [OpenClaw 架构深度分析 Gist](https://gist.github.com/royosherove/971c7b4a350a30ac8a8dad41604a95a0)
- [Anthropic Agent SDK](https://github.com/anthropics/anthropic-sdk-typescript/tree/main/packages/agent)
- [Claude API 工具使用文档](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)

---

**Spike 责任人签字**: Claude (AI)  
**待决策人**: 梦蝶
