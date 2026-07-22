# 先马·Centaur 技术方案(交付工程团队)

**版本**: V1.0 · Spike 阶段二产出  
**日期**: 2026-07-22  
**依据**: `../PRD.md` + `SPIKE-FINDINGS.md`  
**状态**: 技术路径已用可运行代码验证,待排期开发

---

## 0. Spike 结论速览

| Spike 目标 | 状态 | 证据 |
|---|---|---|
| Agent 框架可行性 | ✅ 已验证 | `src/agent.js` 用 `@anthropic-ai/sdk` 跑通 list→read→write 闭环 |
| 客户端不持有真实 Key | ✅ 已验证 | SDK `baseURL` 指向公司网关,`apiKey` 传占位 JWT |
| 工作区路径沙箱 | ✅ 已验证 | `src/sandbox.js` + `test/` 8/8 拦截 `../`/绝对路径/软链接 |
| 高风险人工确认 | ✅ 已验证 | `src/tools.js` 覆盖/删除前 `confirmHook`,输 n 抛 SecurityError 中止 |
| 客户端→网关→API 拓扑 | ✅ 已验证 | `src/mockGateway.js` 限流+用量记录+转发 |

**关键决策(已与梦蝶确认)**:
- Agent 核心 **不用 OpenClaw**(它是服务端多渠道网关,与桌面内嵌拓扑错配),改用 **Anthropic 官方 `@anthropic-ai/sdk`**
- 客户端框架用 **Electron**

---

## 1. 客户端框架:Electron vs Tauri 对比

| 维度 | Electron ✅选定 | Tauri |
|---|---|---|
| 打包体积 | 大(80-150MB,含 Chromium) | 小(3-10MB,用系统 WebView) |
| 内存占用 | 高(每实例 100MB+) | 低(30-50MB) |
| 开发语言 | 全 JS/TS,与 Agent SDK 同栈 | 前端 JS + 后端 **Rust** |
| 招人/上手 | 容易(前端即可) | 难(需 Rust) |
| Agent SDK 集成 | 主进程直接 `require` Node SDK | 需经 Rust ↔ JS 桥,或 sidecar |
| 沙箱/文件能力 | Node `fs` 直接可用 | Rust 侧实现,更底层但成本高 |

**为何选 Electron**:V1.0 目标是「技术闭环跑通」优先出活,团队是 JS 栈、招人易,Agent SDK 是 Node 包能在主进程直接跑。体积/内存劣势对内部工具(50-100 人)可接受。**Tauri 留作 V2.0 优化项**(若体积/内存成为推广阻力再迁)。

---

## 2. 系统架构(修正 PRD 7.2,替换 OpenClaw)

```
┌───────────────────── 员工本地(Electron 客户端) ─────────────────────┐
│  渲染进程(UI)                     主进程(Node)                        │
│  ┌──────────────┐   IPC          ┌────────────────────────────────┐  │
│  │ 主对话页      │◀──确认弹窗────▶│ Agent 编排(@anthropic-ai/sdk)  │  │
│  │ 技能卡/表单   │                │  - 工具循环 tool_use→执行       │  │
│  │ 执行进度/结果 │                │  - 沙箱 validatePath            │  │
│  │ 高风险确认框  │                │  - 工具白名单 + 人工确认钩子    │  │
│  └──────────────┘                └───────────────┬────────────────┘  │
│         工作区目录(用户配置) ~/先马Centaur/工作区/ │                   │
└────────────────────────────────────────────────┼───────────────────┘
                                    HTTPS(JWT)    │  客户端无真实 Key
                                                  ▼
┌───────────────────── 公司服务端 ────────────────────────────────────┐
│  公司网关(Node.js)                                                   │
│   鉴权(JWT 7天) → 限流(Redis 滑窗) → 用量记录(MySQL) → 代理转发       │
│   Kill Switch(远程熔断) + 异常告警(钉钉)                             │
│         │                          │                                 │
│    ┌────▼────┐  ┌────▼────┐   管理后台(React+AntD)                    │
│    │ MySQL   │  │ Redis   │   用量看板/限流配置/员工管理/管理员开关    │
│    │api_calls│  │限流计数 │                                          │
│    └─────────┘  └─────────┘                                          │
└──────────────────────────────────┼───────────────────────────────────┘
                              HTTPS │  真实 ANTHROPIC_API_KEY 只在网关
                                    ▼
                            Anthropic API (claude-opus-4-8 / sonnet)
```

**与 PRD 7.2 的唯一实质差异**:客户端内 Agent 层从「OpenClaw 封装」换成「Anthropic SDK + 自建沙箱/确认/白名单」。网关、MySQL、Redis、管理后台职责不变。模型从 OpenAI 换成 Claude(网关代理层对客户端透明,后续也可多模型)。

---

## 3. 模块拆分(Spike 代码 → 生产映射)

| 生产模块 | Spike 对应文件 | 说明 |
|---|---|---|
| 沙箱层 `sandbox` | `src/sandbox.js` | ✅ 可直接进生产,补 Windows 黑名单测试 |
| 工具层 `tools` | `src/tools.js` | ✅ 骨架完整,`confirmHook` 从 CLI 换 Electron IPC |
| 技能定义 `skills` | `src/skills.js` | 周报已通,P图/文案/会议补实现 |
| Agent 编排 `agent` | `src/agent.js` | 循环逻辑可复用,移入 Electron 主进程 |
| 公司网关 | `src/mockGateway.js` | mock→真实:接 JWT 鉴权、Redis 限流、MySQL 记账、真实 API 转发 |
| Electron 外壳 | 待建 | 主进程跑 agent,渲染进程 UI,IPC 传确认 |
| 管理后台 | 待建 | React+AntD,读 MySQL 用量数据 |

**IPC 人工确认时序**(替换 Spike 的 CLI readline):
```
主进程 tools.write_file 检测到覆盖
  → ipcMain 发 'confirm-request' {description}
  → 渲染进程弹确认框(真人点)
  → ipcRenderer 回 'confirm-response' {ok}
  → 主进程 resolve(ok);false 则抛 SecurityError 中止
```
关键:确认由渲染进程真人点击触发,主进程 Agent 无法自调用(对齐 PRD 8.2.3「不可被 Agent 自动点击」)。

---

## 4. 安全六维落地映射(对齐 PRD 8.2)

| PRD 维度 | 落地方式 | Spike 验证 |
|---|---|---|
| 8.2.1 文件沙箱 | `validatePath` realpath+前缀+黑名单 | ✅ 8/8 逃逸测试 |
| 8.2.2 命令执行 | 工具白名单;命令走数组传参不过 shell;拦截 `curl\|sh` | 白名单已验证,命令工具 Sprint2 补 |
| 8.2.3 高风险确认 | 覆盖/删除/外发/批量>10/执行新增可执行文件 → IPC 弹窗真人确认 | ✅ 覆盖确认已验证 |
| 8.2.4 身份权限 | 真实 Key 只在网关;客户端存 JWT(Keychain/凭据管理器);JWT 7天;full_shell 需二人复核 | baseURL 代理已验证,Keychain 存储 Sprint1 |
| 8.2.5 网络数据 | 全 HTTPS;外发域名白名单;用量日志只记元数据不记原文 | mock 网关已只记元数据 |
| 8.2.6 审计熔断 | 全操作审计日志;Kill Switch;异常告警钉钉;强制升级 | 网关记账挂载点已就位,熔断 Sprint3 |

---

## 5. 公司网关职责清单(生产实现要点)

1. **鉴权**:校验客户端 JWT(钉钉 SSO 签发,7 天过期),失效返 401
2. **限流**:Redis 滑动窗口(PRD 7.3.1),单人默认 50/天可配置,超限返 429
3. **用量记录**:每次调用写 MySQL `api_calls`(PRD 6.1),含 model/tokens/cost/skill/status
4. **成本计算**:按模型定价算 cost(PRD 7.3.2),Claude 定价表替换 OpenAI
5. **代理转发**:真实 `ANTHROPIC_API_KEY` 只此处持有,转发到 Anthropic API
6. **Kill Switch**:全局/单用户禁用表,客户端每次调用前校验,被熔断拒绝执行
7. **告警**:单人量突增/频繁高风险/日成本超阈值 → 钉钉通知数智中心

---

## 6. Sprint 排期建议(对齐 PRD 10.2 阶段三)

| Sprint | 周期 | 内容 | 复用 Spike |
|---|---|---|---|
| S1 | 2周 | Electron 外壳 + 钉钉 SSO 登录 + JWT/Keychain 存储 + 工作区选择 | agent.js 主进程化 |
| S2 | 2周 | 技能库 UI + 4 技能实现 + 沙箱 + 命令白名单 + IPC 确认框 | sandbox/tools/skills 直接用 |
| S3 | 2周 | 公司网关(鉴权/限流/记账/转发/熔断) + 管理后台 | mockGateway 升级为真实网关 |
| S4 | 1周 | 集成测试 + PRD 8.2.7 五项安全测试 | sandbox.test 扩成全量安全测试 |
| S5 | 1周 | 数智中心 10 人内测(限流 10/天) | — |

---

## 7. 如何验证本 Spike(复现步骤)

```bash
cd prd/v1/MVP
npm install
npm test                 # 沙箱逃逸 8/8 全绿
node src/mockGateway.js   # 另开终端起网关
node src/agent.js         # 跑周报:list→read→write 闭环
                          # 第二次跑会触发覆盖确认,输 n 则中止
```

全程走 mock 网关,不用真实 API Key,不部署,不碰线上。接真实 Anthropic API 需梦蝶明确授权后在网关侧配 Key。

---

## 8. 待梦蝶决策/确认的点

1. **接真实 API 验证**:是否要用真实 Anthropic Key 跑一次端到端(证明真实模型能正确编排工具)?需你授权 + 提供网关侧 Key。
2. **模型选型**:默认 `claude-opus-4-8`(能力强成本高)还是 `claude-sonnet-4-6`(便宜快)做主力?影响 $2000/月预算下的调用次数。
3. **PRD 更新**:是否要我把这份方案的架构修正同步回 `../PRD.md` 的第 7 章(把 OpenClaw 换成 Anthropic SDK)?——**默认不动 V1,等你确认**。
