# 项目工作台说明

## 这是什么

`work.iiting.fun` 是梦蝶的内部项目工作台，用于托管各项目的 PRD 和原型，按链接分发给对应项目组。

- `work.iiting.fun` → 导航首页（仅自己用）
- `work.iiting.fun/pdd/` → 拼多多工单 Agent 项目（发给拼多多团队）
- `work.iiting.fun/xxx/` → 新项目（发给对应团队）

## 内容类型

工作台里的东西不止「原型+PRD」一种，梦蝶还会丢需求梳理、沟通纪要、季度规划这类单页文档过来。新增内容前先分清是哪一种，决定用哪个模板、首页放哪个分区：

| 类型 | 说明 | 例子 | 用什么模板 | Supabase |
|---|---|---|---|---|
| 🔧 原型+PRD | 发给业务方评审的正式交付物，需要原型/PRD 两个 tab 切换 | `pdd/v1` | `_template/`（双文件+tab 页） | prd.html 必须有；prototype.html 视是否有角标 |
| 💬 业务沟通 | 需求梳理、待确认事项汇总、会议纪要 | `pdd/v2`（SOP 需求梳理） | `_template-doc/`（单页） | 可选，仅「待确认事项」需要在线协作时才加 |
| 📋 规划 | 季度规划、路线图 | `xianma-ai-design/v2` | `_template-doc/`（单页） | 一般不需要 |

**同一个项目可以混用类型**（比如 `pdd/` 下 v1 是原型+PRD、v2 是业务沟通文档），版本号各类型独立累加，不需要对齐。

拿到梦蝶的文件后，先确认：这是要发给业务方评审的正式交付物，还是内部沟通/规划记录？不确定就问一句，别自己猜。

## 目录结构

项目目录是「项目名 → 版本」两层，每个版本按上面的类型选模板，不强制每个版本都有 prototype+prd 两件套：

```
work/
├── CLAUDE.md              ← 本说明文件
├── index.html             ← 工作台首页（深色风格，按项目分组+类型标签展示）
├── _template/             ← 「原型+PRD」类模板，每次新项目从这里复制
│   ├── index.html         ← 版本路由（自动跳最新版）
│   └── v1/
│       ├── index.html     ← 项目 tab 页（原型 + PRD）
│       ├── prd.html       ← PRD 模板（含完整 Supabase 逻辑）
│       └── prototype.html ← 原型模板（含完整标注系统逻辑）
├── _template-doc/         ← 「业务沟通/规划」类模板，单页文档
│   ├── index.html         ← 版本路由（自动跳最新版）
│   └── v1/
│       └── index.html     ← 单页文档（Supabase 逻辑可选，按需保留/删除）
├── pdd/                   ← 拼多多工单 Agent 项目（同一项目下混用类型）
│   ├── index.html         ← 版本路由（→ v2/）
│   ├── prd.html           ← 重定向到 v1/prd.html
│   ├── prototype.html     ← 重定向到 v1/prototype.html
│   ├── v1/                ← 🔧 原型+PRD
│   │   ├── index.html     ← V1 tab 页（原型 + PRD）
│   │   ├── prd.html       ← V1 PRD 文档（PROJECT_ID: pdd-v1）
│   │   └── prototype.html ← V1 原型（PROJECT_ID: pdd-v1；若原型带素材文件夹，
│   │                          这里换成 prototype/ 子目录，见下方 A1）
│   └── v2/                ← 💬 业务沟通（单页，无需 prototype/prd 拆分）
│       └── index.html     ← SOP 需求梳理文档
└── xxx/                   ← 新项目
    └── v1/                ← 按内容类型从对应模板复制
        └── ...
```

## 部署

所有项目在同一个 Vercel 项目（`work`）下，**一条命令部署全部**：

```bash
cd "/Users/dengting/Desktop/先马电商/02_项目资料/work"
npx vercel --prod --scope dfffovos-projects
```

## 新增项目 / 新增版本（AI 来操作）

梦蝶给文件时先判断属于哪种[内容类型](#内容类型)——不确定就问。**同一个项目下不同版本可以是不同类型**，比如 `pdd/v1` 是原型+PRD，`pdd/v2` 就可能是业务沟通文档，各类型的版本号独立编号，不需要对齐。

### A. 🔧 原型+PRD 类

梦蝶提供：`prototype.html` 和 `prd.html`（两个文件，名字随意）。

1. **复制模板**
   ```bash
   cp -r _template/ 新项目名/        # 新项目首次建
   # 或已有项目加版本：mkdir 新项目名/v2/ 然后从 _template/v1/ 复制三个文件进去
   ```

2. **放入文件**：把梦蝶提供的两个文件命名为 `prototype.html` 和 `prd.html`，放进 `新项目名/vN/`

3. **改 PROJECT_ID**：在 `vN/prd.html` 和 `vN/prototype.html` 里把
   ```javascript
   const PROJECT_ID = "CHANGE_ME";
   ```
   改成 `项目缩写-版本`，例如 `crm-v1`

4. **补全 Supabase 逻辑**：如果梦蝶提供的文件里没有 Supabase 编辑/标注代码，从 `_template/v1/` 对应文件复制 `<script>` 部分补进去

#### A1. 原型是文件夹（带素材/多页面），不是单个 html

梦蝶给的原型有时是一个文件夹，比如：

```
7.6_无限画布/
├── 先马AI无限画布1.0可点...html   ← 原型入口文件（文件名不固定）
├── assets/                        ← 图片/css/js 素材
├── README.md                      ← 内部说明，不发布
└── 7.6无线画布V1.0-业务确认-PRD.md  ← PRD，是 md 不是 html
```

处理步骤：

1. **整个文件夹原样搬进 `vN/prototype/`**（不管里面嵌套多少层子文件夹、素材放在哪一层，直接整体复制，不用先挑文件、不用拍平）：
   ```bash
   cp -r 原始文件夹/. 新项目名/vN/prototype/
   ```
   如果入口文件名不是 `index.html`，改名成 `index.html`（或在下一步的 iframe src 里对应写清楚文件名）。内部说明类文件（README.md 等，见第 5 点）复制完之后再删掉。

2. **检查 assets 内的路径引用**：打开入口 html 搜索 `/assets`、`src="/`、`href="/` 这类**以 `/` 开头的绝对路径**——部署后会指向网站根目录导致 404。全部改成相对路径（`assets/xxx.png`、`./assets/xxx.css`）。这是文件夹类原型最容易踩的坑，每次都要搜一遍确认。

3. **`vN/index.html`（tab 页）里的 iframe 地址**：把
   ```js
   frameProtoType.src = "prototype.html" + search;
   ```
   改成
   ```js
   frameProtoType.src = "prototype/index.html" + search;
   ```

4. **PRD 是 `.md` 时**：不能直接当 `prd.html` 用。把 Markdown 正文转成 HTML 后，粘贴进 `_template/v1/prd.html` 的 `#docContent` 区域（保留其 Supabase 编辑/待确认逻辑不动），另存为 `vN/prd.html`。

5. **`README.md` 等内部说明文件不要发布**：不放进 `vN/` 目录，也不上传到 Vercel（工作台是发给业务方看的，内部备注留在原始文件夹或本地即可）。

6. **多页面原型**（原型内还有多个 html 互相跳转）：页面间的链接保持相对路径（`page2.html`），无需改动；如果每个子页面都要挂 `data-prd` 角标标注，各子页面需各自补上 Supabase 标注 `<script>`（从 `_template/v1/prototype.html` 摘取），且所有子页面共用同一个 `PROJECT_ID`，`data-prd` 的 key 要在整个原型范围内保持唯一（跨页面也不能重复），否则标注会互相覆盖。

### B. 💬 业务沟通 / 📋 规划 类

梦蝶提供：一个内容 HTML（单页），告知是否需要「待确认事项」在线协作。

1. **复制模板**
   ```bash
   cp -r _template-doc/ 新项目名/     # 新项目首次建
   # 或已有项目加版本：mkdir 新项目名/vN/ 然后从 _template-doc/v1/index.html 复制
   ```

2. **放入内容**：把梦蝶提供的 HTML 内容合并进 `vN/index.html` 的 `#docContent` 区域

3. **Supabase 逻辑可选**：如果不需要在线协作/待确认同步，把模板里 Supabase 相关 `<script>` 和「待确认事项」表格整段删掉；需要就改 `PROJECT_ID`

### 两类都要做的收尾

- **新增版本**：若是加版本（非新项目），改 `新项目名/index.html` 里的 `const latest = "v1"` 为新版本号
- **更新工作台首页**：在 `work/index.html` 对应项目分组下复制已有的 `<div class="card" onclick="...">` 块，改标题、描述、类型标签、onclick href、版本号和日期；若是全新项目，先复制一份 `<div class="section-row">` 分组标题。注意 card 是 div 不是 a，内部按钮是各自独立 href 的 `<a>` 标签。
- **部署**
  ```bash
  cd "/Users/dengting/Desktop/先马电商/02_项目资料/work"
  npx vercel --prod --scope dfffovos-projects
  ```

旧版本自动保留，访问 `work.iiting.fun/xxx/v1/` 仍可回溯。

## 更新已有项目内容

- **小改动**（改几个字、更新状态）：浏览器打开项目 URL + `?edit=mengdie`，直接在线编辑，点保存自动同步 Supabase，无需重新部署
- **大改动**（改 HTML 结构）：本地修改文件，运行部署命令

## Supabase 数据隔离机制

所有项目共用一张表 `prd_annotations`，通过 `PROJECT_ID` 前缀区分：

- `pdd-v1-prd-full-content` → pdd V1 的 PRD 全文
- `pdd-v1-T01` → pdd V1 的 T01 待确认回复
- `pdd-v1-m-today` → pdd V1 的角标覆盖
- `crm-v1-prd-full-content` → crm V1 的 PRD 全文（不同项目，不冲突）

新项目只要 `PROJECT_ID` 不重复，数据就完全隔离。

## 各模板的 Supabase 逻辑说明

**🔧 原型+PRD 类（`_template/`）**

- **prd.html**：必须包含完整 Supabase 逻辑，负责：
  - `?edit=mengdie` 模式下在线编辑整页内容并保存
  - 待确认事项回复输入框自动云端同步
- **prototype.html**：Supabase 逻辑**可选**，仅在原型里有角标（`data-prd="..."`）时才需要，功能包括：
  - 自定义标注点（在原型上添加 + 标注）
  - 角标说明覆盖（修改默认角标内容并同步）
  - 原型纯视觉展示、没有角标时可以省略 Supabase 部分

**💬 业务沟通 / 📋 规划 类（`_template-doc/`）**

- 单页 `index.html`，Supabase 逻辑整体**可选**，仅在需要以下功能时保留：
  - `?edit=mengdie` 模式在线编辑整页内容
  - 待确认事项回复输入框云端同步
- 大多数规划类文档（如季度规划）是一次性产出，不需要在线协作，可以整段删掉 Supabase `<script>`

**梦蝶提供文件时**：直接给内容 HTML，告知类型（原型+PRD / 业务沟通 / 规划）和是否需要角标/待确认协作功能，AI 据此决定选哪个模板、是否补入 Supabase 逻辑。

## 技术信息

- 托管：Vercel（项目名：`work`，团队：`dfffovos-projects`）
- 域名：`work.iiting.fun`（DNS 在阿里云，CNAME 指向 `cname.vercel-dns.com`，一次配置永久生效）
- Supabase：`prd_annotations` 表，存 PRD 编辑内容、待确认回复、原型标注
- 编辑模式：URL 加 `?edit=mengdie` 解锁在线编辑
- 嵌入模式：URL 加 `?embedded=true` 隐藏 PRD 顶部 header（index.html 里的 iframe 自动带此参数）
