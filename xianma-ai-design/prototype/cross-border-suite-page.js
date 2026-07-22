// AI 商品套图（跨境电商）—— 独立自包含页，复用 app.css 控件
// 同步自 suite-page.js（SPA 内嵌版），保持独立版可直接打开使用

// 嵌入模式：在 iframe 中运行时隐藏自身的顶栏和侧栏
(function(){
  if (window.self === window.top) return;
  if (new URLSearchParams(window.location.search).get('embed') !== '1') return;
  var s = document.createElement('style');
  s.textContent = '.topbar,.sidebar{display:none!important} .main{position:static!important;height:100%!important;margin:0!important;left:auto!important;top:auto!important;padding:24px!important;width:auto!important;min-width:0!important;overflow:hidden!important} .app{min-width:0!important}';
  document.head.appendChild(s);
})();

(function () {
  "use strict";

  var assetPool = ["assets/mat-1.png","assets/mat-2.png","assets/mat-3.png","assets/mat-4.png","assets/mat-5.png","assets/mat-6.png","assets/mat-7.png","assets/mat-8.png"];

  // 素材库数据（个人 + 公共，用于素材选择器）
  var materialLibrary = {
    personal: [
      { id:"m1", title:"绣里 1", filename:"2667924f-a212-4b8c-9cd0-ac013cf1bad6-1.jpg", source:"历史推送", category:"家居", tags:["商品原图","纹理"], img:"assets/mat-1.png" },
      { id:"m2", title:"AI买家秀-subject", filename:"89b0857902f047bfa7de1c3af8300d39.jpg", source:"历史推送", category:"服饰", tags:["模特","场景"], img:"assets/mat-2.png" },
      { id:"m3", title:"下载.png", filename:"下载.png", source:"手动上传", category:"其他", tags:["商品原图"], size:"1.7MB", img:"assets/mat-3.png" },
      { id:"m4", title:"波西米亚地毯", filename:"carpet-product.png", source:"历史推送", category:"家居", tags:["商品原图","主图"], img:"assets/mat-5.png" },
      { id:"m5", title:"护腰带主图", filename:"9a0c3b02e50b4921b2a07db4500ba7cd.jpg", source:"历史推送", category:"运动户外", tags:["商品原图","主图"], img:"assets/mat-6.png" },
      { id:"m6", title:"产品-1", filename:"52f5c2ae41f94c1a83e96d4835e26613.jpg", source:"历史推送", category:"其他", tags:["商品原图"], img:"assets/mat-7.png" },
      { id:"m7", title:"整体护腰图-1", filename:"f4281d95-4676-4a92-8454-fab901b2d410-1.png", source:"历史推送", category:"运动户外", tags:["细节","商品原图"], img:"assets/mat-4.png" },
      { id:"m8", title:"ScreenShot_2026", filename:"ScreenShot_2026-03-28_112723_922.png", source:"手动上传", category:"其他", tags:["参考图"], img:"assets/mat-8.png" }
    ],
    public: [
      { id:"p1", title:"公共·地毯样板A", filename:"public-carpet-a.jpg", source:"公共库", category:"家居", tags:["商品原图","主图"], img:"assets/mat-1.png" },
      { id:"p2", title:"公共·场景参考", filename:"public-scene.jpg", source:"公共库", category:"家居", tags:["场景","参考图"], img:"assets/mat-2.png" },
      { id:"p3", title:"公共·护腰带细节", filename:"public-waist-detail.png", source:"公共库", category:"运动户外", tags:["细节","商品原图"], img:"assets/mat-4.png" }
    ]
  };

  // 排版模板库（缩略图为真实竞品排版参考，仅原型占位演示，上线需替换为自有排版）。dir: square/horizontal/vertical
  var layoutTemplates = {
    platform: [
      { id:"p1",  name:"主图·居中留白",     dir:"square",     thumb:"assets/layout-square-1.png" },
      { id:"p2",  name:"横幅·场景大图",     dir:"horizontal", thumb:"assets/layout-horizontal-1.png" },
      { id:"p3",  name:"竖版长图·卖点罗列", dir:"vertical",   thumb:"assets/layout-vertical-1.png" },
      { id:"p4",  name:"主图·卖点三点",     dir:"square",     thumb:"assets/layout-square-2.png" },
      { id:"p5",  name:"A+·左图右文",       dir:"horizontal", thumb:"assets/layout-horizontal-2.png" },
      { id:"p6",  name:"移动端·尺寸对比",   dir:"vertical",   thumb:"assets/layout-vertical-2.png" },
      { id:"p7",  name:"主图·场景氛围",     dir:"square",     thumb:"assets/layout-square-3.jpg" },
      { id:"p8",  name:"A+·三段式对比",     dir:"horizontal", thumb:"assets/layout-horizontal-3.png" },
      { id:"p9",  name:"竖版·场景铺陈",     dir:"vertical",   thumb:"assets/layout-vertical-3.png" },
      { id:"p10", name:"主图·四宫格细节",   dir:"square",     thumb:"assets/layout-square-4.jpg" },
      { id:"p11", name:"横幅·卖点罗列",     dir:"horizontal", thumb:"assets/layout-horizontal-4.png" },
      { id:"p12", name:"竖版详情·材质特写", dir:"vertical",   thumb:"assets/layout-vertical-4.jpg" },
      { id:"p13", name:"主图·尺寸标注",     dir:"square",     thumb:"assets/layout-square-5.jpg" },
      { id:"p14", name:"A+·全景场景",       dir:"horizontal", thumb:"assets/layout-horizontal-5.jpg" },
      { id:"p15", name:"移动端A+·分段",     dir:"vertical",   thumb:"assets/layout-vertical-5.jpg" },
      { id:"p16", name:"主图·多色展示",     dir:"square",     thumb:"assets/layout-square-6.jpg" },
      { id:"p17", name:"横幅·中置标题",     dir:"horizontal", thumb:"assets/layout-horizontal-6.jpg" },
      { id:"p18", name:"竖版·使用说明",     dir:"vertical",   thumb:"assets/layout-vertical-6.jpg" },
      { id:"p19", name:"A+·细节特写带",     dir:"horizontal", thumb:"assets/layout-horizontal-7.jpg" },
      { id:"p20", name:"横幅·材质展示",     dir:"horizontal", thumb:"assets/layout-horizontal-8.jpg" }
    ],
    mine: [
      { id:"m1", name:"我的·爆款主图A", dir:"square",   thumb:"assets/layout-square-2.png" },
      { id:"m2", name:"我的·细节拼接",  dir:"vertical", thumb:"assets/layout-vertical-3.png" }
    ]
  };
  // 我的排版账号级持久化：上传项以 dataURL 存 localStorage，跨刷新保留
  var MY_LAYOUT_STORE_KEY = "suiteMyLayouts";
  function loadMyLayouts(){
    try { var raw = localStorage.getItem(MY_LAYOUT_STORE_KEY); if (raw) return JSON.parse(raw) || []; } catch (ignore) {}
    return [];
  }
  function saveMyLayouts(list){ try { localStorage.setItem(MY_LAYOUT_STORE_KEY, JSON.stringify(list)); } catch (ignore) {} }
  (function mergeStoredLayouts(){
    loadMyLayouts().forEach(function(t){
      if (t && t.id && !layoutTemplates.mine.some(function(x){ return x.id === t.id; })) {
        layoutTemplates.mine.push({ id:t.id, name:t.name, dir:t.dir, thumb:t.thumb, stored:true });
      }
    });
  })();
  // 收藏集合（id -> true）；收藏 tab 由此派生。账号级持久化：从 localStorage 载入，无则种一条演示数据
  var FAV_STORE_KEY = "suiteFavSet";
  function loadFavSet(){
    try { var raw = localStorage.getItem(FAV_STORE_KEY); if (raw) return JSON.parse(raw) || {}; } catch (ignore) {}
    return { p2:true };
  }
  function saveFavSet(){ try { localStorage.setItem(FAV_STORE_KEY, JSON.stringify(favSet)); } catch (ignore) {} }
  var favSet = loadFavSet();

  function createMainTypes() {
    return [
      { key:"selling", name:"卖点图", count:4 },
      { key:"detail", name:"细节特写图", count:4 },
      { key:"scene", name:"场景图", count:4 }
    ];
  }
  function createAplusTypes() {
    return [
      { key:"adv", name:"高级A+", size:"1464×600 px", count:4, on:true },
      { key:"mobile", name:"手机A+", size:"600×450 px", count:4, on:true }
    ];
  }
  function createState() {
    return {
      selectedProducts: [],
      sellPoints: "",
      outputLanguage: "英语",
      mainOn: { selling:true, detail:true, scene:true },
      mainNotext: false,
      layoutPick: { main: [], aplus: [] },
      model: "Nano Banana 2",
      resolution: "2K",
      ratio: "1:1",
      quality: "高画质",
      results: null,
      resultTab: "全部",
      collapsed: {},
      generating: false,
      done: 0,
      total: 0
    };
  }

  var mainTypes = createMainTypes();
  var aplusTypes = createAplusTypes();
  var modelOptions = [
    { name:"Nano Banana 2", desc:"多参考图生成，适合复杂主体与长文本画面", icon:"assets/gemini.png", eta:"75s" },
    { name:"Wan 2.7 Image Pro", desc:"中文指令稳定，适合商品、场景与主体编辑", icon:"assets/wan.png", eta:"61s" },
    { name:"Nano Banana Pro", desc:"多参考图生成，适合复杂主体与长文本画面", icon:"assets/gemini.png", eta:"79s" },
    { name:"Seedream 5.0", desc:"生成速度快，适合批量创意与商业出图", icon:"assets/seedream.svg", eta:"40s" },
    { name:"GPT Image 2", desc:"细节还原强，适合高质量生成与局部修改", icon:"assets/gpt.png", eta:"140s" }
  ];
  var resolutionOptions = ["1K", "2K", "4K"];
  var ratioOptions = [
    { label:"智能比例", icon:"ratio-smart" },
    { label:"1:1", icon:"ratio-square" },
    { label:"3:2", icon:"ratio-horizontal" },
    { label:"2:3", icon:"ratio-vertical" },
    { label:"16:9", icon:"ratio-horizontal" },
    { label:"4:3", icon:"ratio-horizontal" },
    { label:"3:4", icon:"ratio-vertical" },
    { label:"9:16", icon:"ratio-vertical" }
  ];

  var state = createState();
  var root = document.getElementById("suiteRoot");
  var productSeq = 0;
  var layoutSeq = 0;
  var uploadFeedback = "";

  function resetTaskState() {
    revokeProductList(state.selectedProducts);
    state = createState();
    mainTypes = createMainTypes();
    aplusTypes = createAplusTypes();
    uploadFeedback = "";
  }
  function productIdentity(item) { return item && item.id ? item.id : ""; }
  function revokeProduct(item) {
    if (item && item.local && item.img) {
      try { URL.revokeObjectURL(item.img); } catch (ignore) {}
    }
  }
  function revokeProductList(list) { (list || []).forEach(revokeProduct); }
  function fileSize(size) { return size >= 1048576 ? (size / 1048576).toFixed(1) + "MB" : Math.max(1, Math.round(size / 1024)) + "KB"; }
  function isAllowedImage(file) {
    var name = String(file && file.name || "").toLowerCase();
    return !!file && (/\.(jpe?g|png)$/i.test(name)) && (!file.type || file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png");
  }
  function validateImageFiles(files, capacity) {
    var accepted = [], messages = [], list = Array.prototype.slice.call(files || []);
    list.forEach(function(file){
      if (!isAllowedImage(file)) { messages.push(file.name + "：仅支持 JPG/JPEG/PNG"); return; }
      if (file.size > 20 * 1024 * 1024) { messages.push(file.name + "：超过 20MB"); return; }
      if (accepted.length >= capacity) { messages.push(file.name + "：已超过最多 16 张限制"); return; }
      accepted.push(file);
    });
    return { accepted:accepted, messages:messages };
  }
  function productFromFile(file) {
    var url = URL.createObjectURL(file);
    productSeq++;
    return { id:"local:product:" + productSeq, title:file.name, filename:file.name, source:"本地上传", size:fileSize(file.size), img:url, local:true };
  }
  function showUploadFeedback(messages, acceptedCount) {
    var parts = messages.slice();
    if (acceptedCount) parts.unshift("已接受 " + acceptedCount + " 张有效图片");
    uploadFeedback = parts.join("；");
    if (uploadFeedback) toast(uploadFeedback);
  }
  function effectiveCount(target, fallback) {
    var picks = state.layoutPick[target] || [];
    return picks.length ? picks.length : fallback;
  }
  function effectiveTotal() {
    var total = 0;
    mainTypes.forEach(function(t){ if (state.mainOn[t.key]) total += effectiveCount("main", t.count); });
    aplusTypes.forEach(function(t){ if (t.on) total += effectiveCount("aplus", t.count); });
    return total;
  }
  function resetSessionLayouts() { lay.draft = []; }

  render();

  function render() {
    if (!root) return;
    root.innerHTML =
      crumb() +
      pageHead() +
      '<section class="workspace">' +
        configPanel() +
        resultPanel() +
      '</section>';
    bind();
  }

  function crumb() {
    return '<div class="page-head topline-card" style="margin-bottom:14px;padding:10px 16px;min-height:auto;display:grid;grid-template-columns:92px 1fr auto;align-items:center;gap:12px;border:1px solid rgba(15,23,42,.08);border-radius:14px;background:rgba(255,255,255,.92);box-shadow:0 16px 44px rgba(72,102,137,.10);">' +
      '<button class="ghost-btn" style="flex:none;" onclick="window.parent.location.reload()">‹ 返回</button>' +
      '<div class="crumb">AI能力中心 <span>/</span> <strong>AI 商品套图</strong> <em>跨境电商</em></div>' +
      '<div style="margin-left:auto;"><a class="suite-prd-dl" href="prd/AI商品套图-PRD.md" download="AI商品套图-PRD.md"><span class="ic">⬇</span>下载 PRD</a></div>' +
    '</div>';
  }

  function pageHead() { return ""; }

  // ---- 左侧配置面板 ----
  function configPanel() {
    return '<div class="panel card suite-config">' +
      '<div class="suite-config-scroll">' +
        '<div class="panel-head" style="margin:10px 0 4px"><div><div class="eyebrow" style="margin-bottom:6px;font-size:13px;font-weight:900;letter-spacing:.03em;color:#2563eb">WORKSPACE</div><h1 class="panel-title" style="margin:0;font-size:20px;line-height:1.2;font-weight:900">AI 商品套图</h1><p class="desc" style="color:#526176;font-size:13px;line-height:1.55;margin:4px 0 0">多张商品图 + 卖点，一键产出亚马逊主副图矩阵与 A+ 套图。</p></div></div>' +
        moduleUpload() +
        moduleSellPoints() +
        moduleMain() +
        moduleAplus() +
        moduleParams() +
      '</div>' +
      '<div class="suite-config-foot">' +
        '<span class="prd-anchor" style="flex:1 1 auto;display:flex">' +
        (state.generating
          ? '<button class="primary-btn" style="flex:1" disabled>生成中… ' + state.done + '/' + state.total + '</button>'
          : '<button class="primary-btn" style="flex:1" data-act="generate">一键生成整套</button>') +
        '<span class="prd-badge prd-badge-corner" data-prd="generate" tabindex="0" role="button">15</span></span>' +
        '<span class="prd-anchor" style="flex:0 0 auto;display:flex"><button class="ghost-btn" data-act="reset"' + (state.generating?' disabled':'') + '>清空</button>' +
        '<span class="prd-badge prd-badge-corner" data-prd="clear" tabindex="0" role="button">16</span></span></div>' +
    '</div>';
  }

  function moduleUpload() {
    var n = state.selectedProducts.length;
    var listHtml = n ? state.selectedProducts.map(function(p, i){
      return '<div class="prod-item" draggable="true" data-drag-idx="' + i + '" title="拖拽调整顺序，第 1 张为主图">' +
        '<div class="prod-thumb"><img src="' + attr(p.img) + '" alt=""><span class="prod-main-badge">' + (i===0?'主图':'参考图') + '</span></div>' +
        '<div class="prod-info"><strong>' + esc(p.title) + '</strong><span>' + esc(p.filename) + (p.size ? ' · ' + esc(p.size) : '') + '</span></div>' +
        '<div class="prod-actions">' +
          '<button class="prod-act" data-act="preview-prod" data-idx="' + i + '" title="预览">查看</button>' +
          '<button class="prod-act" data-act="replace-prod" data-idx="' + i + '" title="从素材库替换">素材</button>' +
          '<button class="prod-act" data-act="replace-local-prod" data-idx="' + i + '" title="本地上传替换">本地</button>' +
          '<button class="prod-act danger" data-act="remove-prod" data-idx="' + i + '" title="删除">删除</button>' +
        '</div>' +
      '</div>';
    }).join("") : '<div class="suite-upload-empty">尚未添加商品图片，数组第 1 张将作为主图。</div>';
    var full = n >= 16;
    return '<div class="module"><div class="module-title"><strong>① 商品原图<span class="prd-badge" data-prd="product-images" tabindex="0" role="button">1</span></strong><span>' + n + ' / 16 · 单张 20MB 内</span></div>' +
      '<div class="upload-grid"><button class="upload-card' + (full?' disabled':'') + '" data-act="pick"' + (full?' disabled':'') + '><strong>素材库选择</strong><span>' + (full?'已达 16 张上限':'从个人或公共素材库选择') + '</span></button>' +
      '<button class="upload-card' + (full?' disabled':'') + '" data-act="upload"' + (full?' disabled':'') + '><strong>本地上传</strong><span>' + (full?'已达 16 张上限':'支持 JPG/JPEG/PNG，可多选') + '</span></button></div>' +
      (uploadFeedback ? '<div class="suite-upload-feedback">' + esc(uploadFeedback) + '</div>' : '') +
      '<div class="prod-list">' + listHtml + '</div>' +
    '</div>';
  }

  function moduleSellPoints() {
    var length = state.sellPoints.length;
    return '<div class="module"><div class="module-title"><strong>② 卖点文案<span class="prd-badge" data-prd="sell-points" tabindex="0" role="button">2</span></strong>' +
      '<span class="prd-anchor"><button class="soft-btn" data-act="polish">AI 润色</button><span class="prd-badge prd-badge-corner" data-prd="ai-polish" tabindex="0" role="button">3</span></span></div>' +
      '<div class="field"><label>填写商品卖点，生成时按所选语言上图</label>' +
      '<textarea data-sell maxlength="500" placeholder="请输入商品核心卖点">' + esc(state.sellPoints) + '</textarea>' +
      '<div class="suite-char-count"><span data-sell-count>' + length + '</span> / 500</div></div>' +
      '<p class="desc" style="margin:8px 0 0">卖点通过版式模板叠加到图上，文字清晰可改、可一字不差复刻。</p>' +
      '<div class="suite-language-field"><label>生成图片语言<span class="prd-badge" data-prd="output-language" tabindex="0" role="button">4</span></label>' +
        '<div class="suite-language-options">' +
          ['英语','中文'].map(function(language){ return '<button class="suite-language-option ' + (state.outputLanguage===language?'active':'') + '" data-act="set-language" data-v="' + language + '">' + language + '</button>'; }).join('') +
        '</div></div>' +
    '</div>';
  }

  function moduleMain() {
    var layoutCount = state.layoutPick.main.length;
    var rows = mainTypes.map(function(t){
      var on = state.mainOn[t.key];
      var shownCount = effectiveCount("main", t.count);
      return '<div class="suite-type-row ' + (on?'on':'') + '" data-type="' + t.key + '" style="margin-bottom:8px">' +
        '<div class="suite-type-head"><span class="chk" data-act="toggle-type" data-key="' + t.key + '">' + (on?'✓':'') + '</span>' +
          '<strong>' + t.name + '</strong>' +
          '<span style="font-size:11px;color:#94a3b8;font-weight:700;margin-right:6px">最多9张<span class="prd-badge" data-prd="count-stepper" tabindex="0" role="button">6</span></span>' +
          '<div class="stepper' + (layoutCount?' is-disabled':'') + '" data-stepper data-key="' + t.key + '"><button data-step="-1"' + (layoutCount?' disabled':'') + '>−</button><span class="stepper-value">' + shownCount + '</span><button data-step="1"' + (layoutCount?' disabled':'') + '>＋</button></div>' +
        '</div></div>';
    }).join("");
    var layoutRow = '<div class="suite-inline" style="margin-top:4px">' +
      '<span class="prd-anchor" style="flex:1;display:flex"><button class="layout-pick" data-act="layout" data-key="main" style="flex:1"><span>选择排版<br><span class="muted">' + layoutBtnSub("main") + '</span></span><span>›</span></button><span class="prd-badge prd-badge-corner" data-prd="layout-select" tabindex="0" role="button">7</span></span>' +
      '<label class="suite-notext"><span class="switch ' + (state.mainNotext?'on':'') + '" data-act="notext-main"></span>无文字模式<span class="prd-badge" data-prd="notext" tabindex="0" role="button">14</span></label></div>';
    var ratioRow = '<div style="margin-top:12px"><h4 style="margin:0 0 8px;font-size:14px">生成比例<span class="prd-badge" data-prd="ratio" tabindex="0" role="button">11</span></h4>' +
      '<div class="ratio-grid" data-group="ratio">' +
        ratioOptions.map(function(o){return '<button class="ratio-card ' + (state.ratio===o.label?'active':'') + '" data-act="set-ratio" data-v="' + o.label + '"><span class="ratio-icon ' + o.icon + '"></span>' + o.label + '</button>';}).join("") +
      '</div></div>';
    return '<div class="module"><div class="module-title"><strong>③ 主副图设置<span class="prd-badge" data-prd="categories" tabindex="0" role="button">5</span></strong><span>多选 · 常用 1:1</span></div>' +
      rows +
      layoutRow +
      ratioRow +
      '<div class="suite-note" style="margin-top:10px">💡 未选择排版时，将根据官方排版随机生成对应数量</div>' +
    '</div>';
  }

  function moduleParams() {
    return '<div class="module"><div class="module-title"><strong>生成参数</strong></div>' +
      '<div class="param-row">' +
        '<div class="param-dropdown-anchor">' +
          '<button class="select-card" data-act="dd" data-dd="modelDD"><span>模型</span><strong id="modelValue">' + modelIcon() + esc(state.model) + '</strong><em>⌄</em></button><span class="prd-badge prd-badge-corner" data-prd="model" tabindex="0" role="button" style="position:absolute;top:6px;right:8px;z-index:2">12</span>' +
          '<div class="dropdown-panel model-dd" id="modelDD">' +
            '<div class="model-dd-head"><strong>选择模型</strong><span>' + modelOptions.length + ' 个选项</span></div>' +
            '<div class="model-pop-list" style="grid-template-columns:repeat(2,1fr)">' +
            modelOptions.map(function(m){
              return '<button data-act="set-model" data-name="' + esc(m.name) + '" class="' + (state.model===m.name?'active':'') + '">' +
                '<span class="mdl-top"><img class="mdl-icon" src="' + m.icon + '" alt=""><strong>' + m.name + '</strong></span>' +
                '<em class="mdl-eta">' + m.eta + '</em>' +
                '<span class="mdl-desc">' + m.desc + '</span>' +
                '<b class="mdl-picked">已选</b></button>';
            }).join("") +
          '</div></div>' +
        '</div>' +
        '<div class="param-dropdown-anchor">' +
          '<button class="select-card" data-act="dd" data-dd="paramDD"><span>参数</span><strong id="paramValue">' + paramSummary() + '</strong><em>⌄</em></button><span class="prd-badge prd-badge-corner" data-prd="resolution" tabindex="0" role="button" style="position:absolute;top:6px;right:8px;z-index:2">13</span>' +
          '<div class="dropdown-panel" id="paramDD">' +
            '<section class="param-section"><h4>清晰度</h4><div class="segmented" data-group="resolution">' +
              resolutionOptions.map(function(r){return '<button class="segment ' + (state.resolution===r?'active':'') + '" data-act="set-res" data-v="' + r + '">' + r + '</button>';}).join("") +
            '</div></section>' +
            '<p class="desc" style="margin:0">图片尺寸在「主副图设置」里选；图片张数按每类图各自数量生成。</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function modelIcon(){ var m=modelOptions.filter(function(x){return x.name===state.model;})[0]; return m?'<img src="'+m.icon+'" alt="">':''; }
  function paramSummary(){ return state.resolution + ' · ' + state.quality; }

  function moduleAplus() {
    var layoutCount = state.layoutPick.aplus.length;
    var rows = aplusTypes.map(function(t){
      var shownCount = effectiveCount("aplus", t.count);
      return '<div class="suite-type-row ' + (t.on?'on':'') + '" data-aplus="' + t.key + '">' +
        '<div class="suite-type-head"><span class="chk" data-act="toggle-aplus" data-key="' + t.key + '">' + (t.on?'✓':'') + '</span>' +
          '<strong>' + t.name + ' <span style="color:#64748b;font-weight:600;font-size:12px">' + t.size + '</span></strong>' +
          '<div class="stepper' + (layoutCount?' is-disabled':'') + '" data-stepper data-akey="' + t.key + '"><button data-step="-1"' + (layoutCount?' disabled':'') + '>−</button><span class="stepper-value">' + shownCount + '</span><button data-step="1"' + (layoutCount?' disabled':'') + '>＋</button></div>' +
        '</div></div>';
    }).join("");
    return '<div class="module"><div class="module-title"><strong>④ A+ 详情页套图</strong><span>可同时勾选</span></div>' +
      rows +
      '<button class="layout-pick" data-act="layout" data-key="aplus" style="width:100%;margin-top:2px"><span>选择排版<br><span class="muted">' + layoutBtnSub("aplus") + '</span></span><span>›</span></button>' +
      '<div class="suite-aplus-note">A+ 固定生成 1464×600 px / 600×450 px，不受主副图比例和清晰度设置影响。<span class="prd-badge" data-prd="aplus-size" tabindex="0" role="button">10</span></div>' +
    '</div>';
  }

  function resultCopy(groupName, language) {
    var copies = language === "中文"
      ? { "卖点图":"防滑耐磨 · 易清洗", "细节特写图":"加厚绒面 · 细腻触感", "场景图":"舒适生活 · 四季通用", "高级A+":"品质细节 · 全面展示", "手机A+":"舒适耐用 · 轻松打理" }
      : { "卖点图":"NON-SLIP · EASY TO CLEAN", "细节特写图":"PLUSH TEXTURE · SOFT TOUCH", "场景图":"EVERYDAY COMFORT · ALL SEASONS", "高级A+":"PREMIUM DETAILS · BUILT TO LAST", "手机A+":"COMFORTABLE · DURABLE · EASY CARE" };
    return copies[groupName] || (language === "中文" ? "品质之选" : "PREMIUM QUALITY");
  }

  function cellHtml(g, i, globalIdx, ready) {
    if (!ready) {
      return '<div class="suite-cell' + (g.cellClass ? ' ' + g.cellClass : '') + ' loading" data-seq="' + globalIdx + '"><span class="cell-badge">' + (i+1) + '</span><span class="spinner">生成中…</span></div>';
    }
    return '<div class="suite-cell' + (g.cellClass ? ' ' + g.cellClass : '') + '" data-act="zoom" data-group="' + attr(g.name) + '" data-idx="' + i + '" data-seq="' + globalIdx + '"><span class="cell-badge">' + (i+1) + '</span><img src="' + attr(g.imgs[i]) + '" alt="">' +
      (g.kind === "main" && state.mainNotext ? '' : '<div class="suite-image-copy">' + esc(resultCopy(g.tab, g.language)) + '</div>') +
      '<div class="cell-actions"><button data-act="dl">下载</button><button data-act="fix">局部编辑</button><button data-act="mat">加素材</button></div></div>';
  }

  function resultPanel() {
    var inner;
    if (!state.results) {
      inner = '<div class="suite-empty"><strong>还没有生成结果</strong>配置好左侧参数，点"一键生成整套"，这里按类别展示整套图。</div>';
    } else {
      var offset = 0, offsets = {};
      state.results.forEach(function(g){ offsets[g.name] = offset; offset += g.imgs.length; });
      var progress = state.generating
        ? '<div class="suite-progress"><span class="ptxt">生成中… ' + state.done + ' / ' + state.total + ' 张</span>' +
          '<div class="bar"><i style="width:' + Math.round(state.done/state.total*100) + '%"></i></div></div>'
        : '';
      var tabs = ["全部"].concat(state.results.map(function(g){ return g.tab; }));
      var tabRow = '<div class="suite-tabs">' + tabs.map(function(t){
        var n = t === "全部" ? state.total : (state.results.filter(function(g){return g.tab===t;})[0]||{imgs:[]}).imgs.length;
        return '<button class="suite-tab ' + (state.resultTab===t?'active':'') + '" data-act="rtab" data-tab="' + esc(t) + '">' + t + ' <span>' + n + '</span></button>';
      }).join("") + '</div>';
      var shown = state.results.filter(function(g){ return state.resultTab==="全部" || g.tab===state.resultTab; });
      var groupsHtml = shown.map(function(g){
        var isCol = !!state.collapsed[g.name];
        var base = offsets[g.name];
        return '<div class="suite-result-group">' +
          '<h3 class="suite-group-head" data-act="collapse" data-name="' + esc(g.name) + '"><span class="caret">' + (isCol?'▸':'▾') + '</span>' + g.name + ' <span class="tag">' + g.imgs.length + ' 张</span></h3>' +
          (isCol ? '' : '<div class="suite-grid ' + (g.wide?'wide':'') + '">' +
            g.imgs.map(function(src,i){
              var gi = base + i;
              return cellHtml(g, i, gi, gi < state.done);
            }).join("") +
          '</div>') +
        '</div>';
      }).join("");
      inner = progress + tabRow + groupsHtml;
    }
    return '<div class="panel card suite-result">' +
      '<div class="suite-result-head"><div><h2 style="margin:0">结果预览<span class="prd-badge" data-prd="result-status" tabindex="0" role="button">17</span></h2><div class="desc">按类别分组展示整套图，可逐张下载 / 返修<span class="prd-badge" data-prd="local-edit" tabindex="0" role="button">18</span> / 加素材库<span class="prd-badge" data-prd="add-material" tabindex="0" role="button">19</span>。</div></div>' +
      '<div class="actions">' +
        (state.results && !state.generating ?'<button class="ghost-btn" data-act="dl-all">打包下载</button>':'') +
        '<span class="prd-anchor" style="display:inline-flex"><button class="suite-history-btn" data-act="history"><span class="ic">◷</span>历史记录</button><span class="prd-badge prd-badge-corner" data-prd="history" tabindex="0" role="button">20</span></span>' +
      '</div></div>' +
      '<div class="suite-result-scroll">' + inner + '</div>' +
    '</div>';
  }

  function bind() {
    var sell = root.querySelector("[data-sell]");
    if (sell) sell.addEventListener("input", function(){
      state.sellPoints = sell.value;
      var count = root.querySelector("[data-sell-count]");
      if (count) count.textContent = state.sellPoints.length;
    });

    if (bind._clickBound) return;
    bind._clickBound = true;
    root.addEventListener("click", function(e){
      var stepBtn = e.target.closest("[data-step]");
      if (stepBtn) return onStep(stepBtn);

      var el = e.target.closest("[data-act]");
      if (!el) return;
      var act = el.dataset.act, key = el.dataset.key;
      if (act === "toggle-type") { state.mainOn[key] = !state.mainOn[key]; render(); }
      else if (act === "toggle-aplus") { var a=aplusTypes.filter(function(t){return t.key===key;})[0]; a.on=!a.on; render(); }
      else if (act === "notext-main") { state.mainNotext = !state.mainNotext; el.classList.toggle("on"); }
      else if (act === "dd") { toggleDropdown(el.dataset.dd); }
      else if (act === "set-model") { state.model = el.dataset.name; refreshModel(); }
      else if (act === "set-language") { state.outputLanguage = el.dataset.v; render(); }
      else if (act === "set-res") { state.resolution = el.dataset.v; refreshParam("resolution"); }
      else if (act === "set-ratio") { state.ratio = el.dataset.v; refreshParam("ratio"); }
      else if (act === "rtab") { state.resultTab = el.dataset.tab; render(); }
      else if (act === "collapse") { var nm=el.dataset.name; state.collapsed[nm] = !state.collapsed[nm]; render(); }
      else if (act === "generate") { generate(); }
      else if (act === "reset") { if (!state.generating) openClearConfirm(); }
      else if (act === "polish") { openPolish(); }
      else if (act === "layout") { openLayout(key); }
      else if (act === "pick") { if (state.selectedProducts.length < 16) openMaterialPicker(null); }
      else if (act === "upload") { if (state.selectedProducts.length < 16) localUploadMaterial(null); }
      else if (act === "preview-prod") { openProductLightbox(parseInt(el.dataset.idx,10)); }
      else if (act === "replace-prod") { openMaterialPicker(parseInt(el.dataset.idx,10)); }
      else if (act === "replace-local-prod") { localUploadMaterial(parseInt(el.dataset.idx,10)); }
      else if (act === "remove-prod") { var idx=parseInt(el.dataset.idx,10); var removed=state.selectedProducts.splice(idx,1)[0]; revokeProduct(removed); render(); }
      else if (act === "dl" || act === "dl-all") { toast("下载中…"); }
      else if (act === "fix") { var cell=el.closest(".suite-cell"); if(cell) openEditor(cell.dataset.group, parseInt(cell.dataset.idx,10)); }
      else if (act === "mat") { toast("已加入素材库"); }
      else if (act === "zoom") { openLightbox(el.dataset.group, parseInt(el.dataset.idx,10)); }
      else if (act === "history") { toast("跳转历史记录页并筛选套图…"); window.location.href = "index.html#/history?type=" + encodeURIComponent("AI商品套图"); }
    });

    // 商品图拖拽排序
    var dragFrom = null;
    root.addEventListener("dragstart", function(e){
      var item = e.target.closest("[data-drag-idx]");
      if (!item) return;
      dragFrom = parseInt(item.dataset.dragIdx, 10);
      e.dataTransfer.effectAllowed = "move";
      item.classList.add("dragging");
    });
    root.addEventListener("dragend", function(e){
      var item = e.target.closest("[data-drag-idx]");
      if (item) item.classList.remove("dragging");
      dragFrom = null;
    });
    root.addEventListener("dragover", function(e){
      var item = e.target.closest("[data-drag-idx]");
      if (item && dragFrom !== null) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }
    });
    root.addEventListener("drop", function(e){
      var item = e.target.closest("[data-drag-idx]");
      if (!item || dragFrom === null) return;
      e.preventDefault();
      var to = parseInt(item.dataset.dragIdx, 10);
      if (isNaN(to) || to === dragFrom) return;
      var moved = state.selectedProducts.splice(dragFrom, 1)[0];
      state.selectedProducts.splice(to, 0, moved);
      dragFrom = null;
      render();
    });

    // 键盘：Esc 关闭、←→ 切换
    if (!bind._keyBound) {
      document.addEventListener("keydown", function(e){
        if (confirmBox.open) { if (e.key === "Escape") closeClearConfirm(); return; }
        if (polish.open) { if (e.key === "Escape") closePolish(); return; }
        if (document.querySelector("#layZoomRoot .lightbox-mask")) { if (e.key === "Escape") closeLayZoom(); return; }
        if (mp.open) { if (e.key === "Escape") closeMaterialPicker(); return; }
        if (lay.open) { if (e.key === "Escape") closeLayout(); return; }
        if (ed.open) { if (e.key === "Escape") closeEditor(); return; }
        if (!lb.open) return;
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowLeft") stepLightbox(-1);
        else if (e.key === "ArrowRight") stepLightbox(1);
      });
      bind._keyBound = true;
    }

    // 点面板外关闭下拉
    if (!bind._outsideBound) {
      document.addEventListener("click", function(e){
        if (!root || !root.isConnected) return;
        if (e.target.closest(".param-dropdown-anchor")) return;
        root.querySelectorAll(".dropdown-panel.show").forEach(function(p){ p.classList.remove("show"); });
      });
      bind._outsideBound = true;
    }
  }

  function toggleDropdown(id){
    var panel = document.getElementById(id);
    if (!panel) return;
    var wasShow = panel.classList.contains("show");
    root.querySelectorAll(".dropdown-panel.show").forEach(function(p){ p.classList.remove("show"); });
    if (!wasShow) panel.classList.add("show");
  }

  function refreshModel(){
    var v = document.getElementById("modelValue");
    if (v) v.innerHTML = modelIcon() + esc(state.model);
    root.querySelectorAll('[data-act="set-model"]').forEach(function(b){ b.classList.toggle("active", b.dataset.name===state.model); });
  }
  function refreshParam(group){
    var v = document.getElementById("paramValue");
    if (v) v.textContent = paramSummary();
    var sel = group === "resolution" ? '[data-act="set-res"]' : '[data-act="set-ratio"]';
    var cur = group === "resolution" ? state.resolution : state.ratio;
    root.querySelectorAll(sel).forEach(function(b){ b.classList.toggle("active", b.dataset.v===cur); });
  }

  function onStep(btn) {
    if (btn.disabled) return;
    var box = btn.closest("[data-stepper]");
    if (!box) return;
    if (box.dataset.key && state.layoutPick.main.length) return;
    if (box.dataset.akey && state.layoutPick.aplus.length) return;
    var valEl = box.querySelector(".stepper-value");
    var v = Math.max(1, Math.min(9, parseInt(valEl.textContent,10) + parseInt(btn.dataset.step,10)));
    valEl.textContent = v;
    if (box.dataset.key) { var t=mainTypes.filter(function(x){return x.key===box.dataset.key;})[0]; if(t)t.count=v; }
    if (box.dataset.akey) { var a=aplusTypes.filter(function(x){return x.key===box.dataset.akey;})[0]; if(a)a.count=v; }
  }

  function pick(n){ var out=[]; for(var i=0;i<n;i++) out.push(assetPool[i%assetPool.length]); return out; }

  var genTimer = null;

  function generate() {
    if (state.generating) return;
    if (!state.selectedProducts.length) { toast("请至少添加一张商品图片"); return; }
    var points = state.sellPoints.trim();
    if (!points) { toast("请填写商品卖点"); return; }
    if (state.sellPoints.length > 500) { toast("商品卖点不能超过 500 字"); return; }
    var groups = [];
    mainTypes.forEach(function(t){
      if(state.mainOn[t.key]) groups.push({ tab:t.name, name:t.name, kind:"main", imgs:pick(effectiveCount("main", t.count)), language:state.outputLanguage });
    });
    aplusTypes.forEach(function(t){
      if(t.on) groups.push({ tab:t.name, name:t.name+" " + t.size, kind:"aplus", cellClass:t.key==="mobile"?"aplus-mobile":"aplus-adv", imgs:pick(effectiveCount("aplus", t.count)), wide:t.key==="adv", language:state.outputLanguage });
    });
    if (!groups.length) { toast("请至少勾选一种图片类型"); return; }
    state.results = groups;
    state.resultTab = "全部";
    state.collapsed = {};
    state.total = effectiveTotal();
    state.done = 0;
    state.generating = true;
    render();
    toast("开始生成整套 " + state.total + " 张…");
    if (genTimer) clearInterval(genTimer);
    genTimer = setInterval(function(){
      state.done++;
      if (state.done >= state.total) {
        clearInterval(genTimer); genTimer = null;
        state.generating = false;
        state.done = state.total;
        render();
        toast("整套生成完成，共 " + state.total + " 张");
      } else {
        renderResultOnly();
        updateGenButton();
      }
    }, 320);
  }

  function renderResultOnly() {
    var panel = root.querySelector(".workspace > .panel.card:last-child");
    if (panel) panel.outerHTML = resultPanel();
  }
  function updateGenButton() {
    var b = root.querySelector('.suite-config-foot .primary-btn[disabled]');
    if (b) b.textContent = "生成中… " + state.done + "/" + state.total;
  }

  // ---- 点击放大 lightbox ----
  var lb = { open:false, mode:"result", group:null, idx:0 };

  function openLightbox(groupName, idx) {
    lb.open = true; lb.mode = "result"; lb.group = groupName; lb.idx = idx;
    renderLightbox();
  }
  function openProductLightbox(idx) {
    if (!state.selectedProducts[idx]) return;
    lb.open = true; lb.mode = "product"; lb.group = null; lb.idx = idx;
    renderLightbox();
  }
  function closeLightbox() {
    lb.open = false;
    var m = document.getElementById("lightboxRoot");
    if (m) m.innerHTML = "";
  }
  function stepLightbox(d) {
    var len = 0;
    if (lb.mode === "product") len = state.selectedProducts.length;
    else {
      var g = state.results && state.results.filter(function(x){return x.name===lb.group;})[0];
      if (g) len = g.imgs.length;
    }
    if (!len) return;
    lb.idx = (lb.idx + d + len) % len;
    renderLightbox();
  }
  function renderLightbox() {
    var host = document.getElementById("lightboxRoot");
    if (!host) { host = document.createElement("div"); host.id = "lightboxRoot"; document.body.appendChild(host); }
    var src, title, len, actions = "";
    if (lb.mode === "product") {
      var product = state.selectedProducts[lb.idx];
      if (!product) { closeLightbox(); return; }
      src = product.img; title = (lb.idx === 0 ? "主图 · " : "参考图 · ") + product.title; len = state.selectedProducts.length;
    } else {
      var g = state.results && state.results.filter(function(x){return x.name===lb.group;})[0];
      if (!g) { host.innerHTML = ""; return; }
      src = g.imgs[lb.idx]; title = g.name; len = g.imgs.length;
      actions = '<div class="lb-actions"><button data-act="dl">下载原图</button><button data-act="fix">局部编辑</button><button data-act="mat">加入素材库</button></div>';
    }
    var multi = len > 1;
    host.innerHTML =
      '<div class="lightbox-mask" data-act="lb-mask">' +
        '<div class="lightbox-body">' +
          '<button class="lightbox-close" data-act="lb-close">×</button>' +
          (multi ? '<button class="lightbox-nav prev" data-act="lb-prev">‹</button><button class="lightbox-nav next" data-act="lb-next">›</button>' : '') +
          '<div class="lightbox-img"><img src="' + attr(src) + '" alt=""></div>' +
          '<div class="lightbox-bar"><div class="lb-title">' + esc(title) + '<span>第 ' + (lb.idx+1) + ' / ' + len + ' 张</span></div>' + actions + '</div>' +
        '</div>' +
      '</div>';
    host.querySelector('[data-act="lb-mask"]').addEventListener("click", function(e){ if (e.target===this) closeLightbox(); });
    host.querySelector('[data-act="lb-close"]').addEventListener("click", closeLightbox);
    if (multi) {
      host.querySelector('[data-act="lb-prev"]').addEventListener("click", function(){ stepLightbox(-1); });
      host.querySelector('[data-act="lb-next"]').addEventListener("click", function(){ stepLightbox(1); });
    }
    host.querySelectorAll(".lb-actions [data-act]").forEach(function(b){
      b.addEventListener("click", function(){
        var a = b.dataset.act;
        if (a === "fix") { var group = lb.group, index = lb.idx; closeLightbox(); openEditor(group, index); return; }
        toast(a==="dl"?"下载原图…":"已加入素材库");
      });
    });
  }

  // ---- 选择排版弹窗 ----
  var LAY_MAX = 8;
  var lay = { open:false, target:"main", tab:"platform", dir:"horizontal", draft:[] };
  var layTabNames = { platform:"平台推荐", mine:"我的", fav:"收藏" };
  var layDirNames = { horizontal:"横版", square:"方形", vertical:"竖版" };

  function allTemplates(){ return layoutTemplates.platform.concat(layoutTemplates.mine); }
  function tplById(id){ return allTemplates().filter(function(t){return t.id===id;})[0]; }
  function favTemplates(){ return allTemplates().filter(function(t){ return favSet[t.id]; }); }
  function toggleFav(id){ if(favSet[id]){ delete favSet[id]; } else { favSet[id]=true; } saveFavSet(); renderLayout(); }
  function tabSource(tab){ return tab === "fav" ? favTemplates() : (layoutTemplates[tab] || []); }
  function firstDirOf(tab){
    var src = tabSource(tab);
    var order = ["horizontal", "square", "vertical"];
    for (var i = 0; i < order.length; i++) {
      if (src.some(function(t){ return t.dir === order[i]; })) return order[i];
    }
    return "horizontal";
  }
  function layoutBtnSub(target){
    var n = (state.layoutPick[target] || []).length;
    return n ? ('已选 ' + n + ' 个排版 · 每版生成一张') : '未选排版 · 按数量随机套用平台排版';
  }

  function openLayout(target){
    lay.open = true;
    lay.target = target || "main";
    lay.tab = "platform";
    lay.dir = firstDirOf("platform");
    lay.draft = (state.layoutPick[lay.target] || []).slice();
    renderLayout();
  }
  function closeLayout(){
    lay.open = false;
    var m = document.getElementById("layoutRoot");
    if (m) m.innerHTML = "";
  }
  function confirmLayout(){
    state.layoutPick[lay.target] = lay.draft.slice();
    closeLayout();
    render();
  }
  function toggleTpl(id){
    var i = lay.draft.indexOf(id);
    if (i >= 0) { lay.draft.splice(i,1); }
    else {
      if (lay.draft.length >= LAY_MAX) { toast("最多选择 " + LAY_MAX + " 个排版"); return; }
      lay.draft.push(id);
    }
    renderLayout();
  }

  function closeLayZoom(){
    var host = document.getElementById("layZoomRoot");
    if (host) host.innerHTML = "";
  }
  function openLayZoom(id){
    var t = tplById(id); if(!t) return;
    var host = document.getElementById("layZoomRoot");
    if (!host) { host = document.createElement("div"); host.id = "layZoomRoot"; document.body.appendChild(host); }
    host.innerHTML =
      '<div class="lightbox-mask" data-zclose="1">' +
        '<div class="lightbox-body">' +
          '<button class="lightbox-close" data-zclose="1">×</button>' +
          '<div class="lightbox-img"><img src="' + attr(t.thumb) + '" alt=""></div>' +
          '<div class="lightbox-bar"><div class="lb-title">' + esc(t.name) + '<span>' + layDirNames[t.dir] + '</span></div></div>' +
        '</div>' +
      '</div>';
    host.querySelectorAll("[data-zclose]").forEach(function(el){
      el.addEventListener("click", function(e){ if(e.target===el) host.innerHTML=""; });
    });
  }

  function renderLayout(){
    var host = document.getElementById("layoutRoot");
    if (!host) { host = document.createElement("div"); host.id = "layoutRoot"; document.body.appendChild(host); }
    if (!lay.open) { host.innerHTML = ""; return; }

    var source = tabSource(lay.tab);
    var list = source.filter(function(t){ return t.dir===lay.dir; });
    var targetName = lay.target === "aplus" ? "A+ 详情页套图" : "主副图";

    var tabsHtml = Object.keys(layTabNames).map(function(k){
      var btn = '<button class="lay-tab ' + (lay.tab===k?'active':'') + '" data-lact="tab" data-v="' + k + '">' + layTabNames[k] + '</button>';
      if (k === "fav") return '<span class="prd-anchor" style="display:inline-flex">' + btn + '<span class="prd-badge prd-badge-corner" data-prd="layout-fav" tabindex="0" role="button">8</span></span>';
      return btn;
    }).join("");
    var dirHtml = Object.keys(layDirNames).map(function(k){
      return '<button class="' + (lay.dir===k?'active':'') + '" data-lact="dir" data-v="' + k + '">' + layDirNames[k] + '</button>';
    }).join("");

    var uploadCard = lay.tab === "mine"
      ? '<span class="prd-anchor" style="display:block"><div class="lay-card lay-upload" data-lact="upload"><span class="plus">＋</span><span>上传我的排版</span></div><span class="prd-badge prd-badge-corner" data-prd="layout-mine-upload" tabindex="0" role="button">9</span></span>'
      : '';
    var cardsHtml = list.map(function(t){
      var on = lay.draft.indexOf(t.id) >= 0;
      var faved = !!favSet[t.id];
      return '<div class="lay-card' + (on?' on':'') + '" data-lact="pick" data-v="' + attr(t.id) + '" title="' + attr(t.name) + '">' +
        '<div class="thumb"><img src="' + attr(t.thumb) + '" alt=""></div>' +
        '<button class="lay-zoom" data-lact="zoom" data-v="' + attr(t.id) + '" title="查看大图">⛶</button>' +
        '<button class="lay-fav' + (faved?' on':'') + '" data-lact="fav" data-v="' + attr(t.id) + '" title="' + (faved?'取消收藏':'加入收藏') + '">' + (faved?'★':'☆') + '</button>' +
        '<div class="mask-on"><span class="tick">✓</span></div>' +
      '</div>';
    }).join("");
    if (!list.length) {
      cardsHtml = '<div class="lay-grid-empty">' + (lay.tab==="fav"
        ? '还没有收藏的排版<br>在「平台推荐 / 我的」里点右上角 ☆ 收藏常用排版'
        : '该筛选下暂无排版') + '</div>';
    }

    var selHtml = lay.draft.length
      ? lay.draft.map(function(id){ var t = tplById(id); if(!t) return ""; return '<div class="lay-sel-item"><img src="' + attr(t.thumb) + '" alt=""><strong>' + esc(t.name) + '</strong><button class="rm" data-lact="rm" data-v="' + attr(id) + '">×</button></div>'; }).join("")
      : '<div class="lay-sel-empty">暂无已选排版<br>从左侧挑选，最多 ' + LAY_MAX + ' 个</div>';

    var layoutSub = lay.target === "aplus"
      ? "A+ 排版用于固定 1464×600 px / 600×450 px 尺寸，不受主副图比例和清晰度设置影响"
      : "排版决定卖点文案如何排布上图；最终横/竖以主副图生成比例为准";
    host.innerHTML =
      '<div class="lay-mask" data-lact="mask">' +
        '<div class="lay-modal">' +
          '<div class="lay-head"><div><h3>选择排版 · ' + targetName + '</h3><div class="sub">' + layoutSub + '</div></div>' +
            '<button class="lay-close" data-lact="close">×</button></div>' +
          '<div class="lay-body">' +
            '<div class="lay-left">' +
              '<div class="lay-toolbar"><div class="lay-tabs">' + tabsHtml + '</div><div class="lay-dir">' + dirHtml + '</div></div>' +
              '<div class="lay-grid-wrap">' +
                '<div class="lay-tips">💡 选中排版后，对应类别将<b>每个排版各生成 1 张</b>，张数由排版数量决定；未选则按步进器数量随机套用平台排版。</div>' +
                '<div class="lay-grid dir-' + lay.dir + '">' + uploadCard + cardsHtml + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="lay-right">' +
              '<h4>已选排版 <em>' + lay.draft.length + ' / ' + LAY_MAX + '</em></h4>' +
              '<div class="lay-sel-list">' + selHtml + '</div>' +
              '<div class="lay-foot"><button class="ghost-btn" data-lact="clear">清空</button><button class="primary-btn" data-lact="confirm">确认（' + lay.draft.length + '）</button></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    host.querySelectorAll("[data-lact]").forEach(function(el){
      el.addEventListener("click", function(e){
        var a = el.dataset.lact, v = el.dataset.v;
        if (a === "mask") { if (e.target===el) closeLayout(); return; }
        if (a === "close") return closeLayout();
        if (a === "tab") { lay.tab = v; if(!tabSource(v).some(function(t){return t.dir===lay.dir;})) lay.dir = firstDirOf(v); renderLayout(); return; }
        if (a === "dir") { lay.dir = v; renderLayout(); return; }
        if (a === "fav") { e.stopPropagation(); return toggleFav(v); }
        if (a === "zoom") { e.stopPropagation(); return openLayZoom(v); }
        if (a === "pick") return toggleTpl(v);
        if (a === "rm") { var i=lay.draft.indexOf(v); if(i>=0)lay.draft.splice(i,1); renderLayout(); return; }
        if (a === "clear") { lay.draft = []; renderLayout(); return; }
        if (a === "upload") return uploadLayoutTemplate();
        if (a === "confirm") return confirmLayout();
      });
    });
  }

  function uploadLayoutTemplate() {
    var input = document.createElement("input");
    input.type = "file"; input.accept = ".jpg,.jpeg,.png,image/jpeg,image/png";
    input.onchange = function(){
      var file = input.files && input.files[0];
      if (!file) return;
      if (!isAllowedImage(file)) { toast("仅支持 JPG/JPEG/PNG 格式"); return; }
      if (file.size > 10 * 1024 * 1024) { toast("排版图超过 10MB，请压缩后重新上传"); return; }
      var reader = new FileReader();
      reader.onload = function(){
        var dataUrl = reader.result;
        var img = new Image();
        img.onload = function(){
          var ratio = img.naturalWidth / img.naturalHeight;
          var dir = ratio > 1.15 ? "horizontal" : (ratio < 0.87 ? "vertical" : "square");
          var id = "my-layout:" + Date.now() + ":" + (++layoutSeq);
          var tpl = { id:id, name:file.name, dir:dir, thumb:dataUrl, stored:true };
          layoutTemplates.mine.push(tpl);
          var stored = loadMyLayouts();
          stored.push({ id:id, name:file.name, dir:dir, thumb:dataUrl });
          saveMyLayouts(stored);
          lay.tab = "mine"; lay.dir = dir;
          renderLayout();
          toast("已上传排版并归入“" + layDirNames[dir] + "”");
        };
        img.onerror = function(){ toast("无法读取该图片，请重新选择"); };
        img.src = dataUrl;
      };
      reader.onerror = function(){ toast("无法读取该图片，请重新选择"); };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  // ---- 素材库选择弹窗 ----
  var mp = { open:false, tab:"personal", keyword:"", category:"全部类目", tag:"全部标签", draft:[], targetIndex:null, temp:[] };

  function materialItems() { return materialLibrary.personal.concat(materialLibrary.public).concat(mp.temp); }
  function materialById(id) { return materialItems().filter(function(item){ return item.id === id; })[0]; }
  function releasePickerTemps(keepIds) {
    var keep = keepIds || [];
    mp.temp.forEach(function(item){ if (keep.indexOf(item.id) < 0) revokeProduct(item); });
    mp.temp = mp.temp.filter(function(item){ return keep.indexOf(item.id) >= 0; });
  }
  function openMaterialPicker(targetIndex) {
    if (targetIndex == null && state.selectedProducts.length >= 16) { toast("最多添加 16 张商品图片"); return; }
    uploadFeedback = "";
    mp.open = true; mp.tab = "personal"; mp.keyword = ""; mp.category = "全部类目"; mp.tag = "全部标签";
    mp.draft = []; mp.targetIndex = targetIndex == null ? null : targetIndex; mp.temp = [];
    renderMaterialPicker();
  }
  function closeMaterialPicker() {
    releasePickerTemps([]);
    mp.open = false; mp.draft = []; mp.targetIndex = null; uploadFeedback = "";
    var m = document.getElementById("materialRoot");
    if (m) m.innerHTML = "";
  }
  function confirmMaterialPicker() {
    if (!mp.draft.length) { toast(mp.targetIndex == null ? "请选择要添加的图片" : "请选择一张替换图片"); return; }
    var chosen = mp.draft.map(materialById).filter(Boolean);
    if (mp.targetIndex != null) {
      var replacement = chosen[0];
      var old = state.selectedProducts[mp.targetIndex];
      if (!replacement || !old) return;
      state.selectedProducts[mp.targetIndex] = replacement;
      releasePickerTemps(replacement.local ? [replacement.id] : []);
      mp.temp = [];
      revokeProduct(old);
    } else {
      var existing = {};
      state.selectedProducts.forEach(function(item){ existing[productIdentity(item)] = true; });
      var transferred = [];
      chosen.forEach(function(item){
        var id = productIdentity(item);
        if (!existing[id] && state.selectedProducts.length < 16) {
          state.selectedProducts.push(item); existing[id] = true;
          if (item.local) transferred.push(id);
        }
      });
      releasePickerTemps(transferred);
      mp.temp = [];
    }
    mp.open = false; mp.draft = []; mp.targetIndex = null;
    var host = document.getElementById("materialRoot"); if (host) host.innerHTML = "";
    uploadFeedback = "";
    render();
  }
  function toggleMaterial(id) {
    var existing = state.selectedProducts.some(function(item){ return productIdentity(item) === id; });
    if (mp.targetIndex == null && existing) { toast("该图片已在商品图片中"); return; }
    if (mp.targetIndex != null) { mp.draft = mp.draft[0] === id ? [] : [id]; renderMaterialPicker(); return; }
    var i = mp.draft.indexOf(id);
    if (i >= 0) mp.draft.splice(i, 1);
    else {
      if (state.selectedProducts.length + mp.draft.length >= 16) { toast("最多选择 16 张图片"); return; }
      mp.draft.push(id);
    }
    renderMaterialPicker();
  }
  function localUploadMaterial(targetIndex) {
    if (targetIndex != null && !state.selectedProducts[targetIndex]) return;
    var input = document.createElement("input");
    input.type = "file"; input.accept = ".jpg,.jpeg,.png,image/jpeg,image/png"; input.multiple = targetIndex == null;
    input.onchange = function(){
      var capacity = targetIndex == null ? 16 - state.selectedProducts.length - (mp.open ? mp.draft.length : 0) : 1;
      var checked = validateImageFiles(input.files, capacity);
      var products = checked.accepted.map(productFromFile);
      showUploadFeedback(checked.messages, products.length);
      if (!products.length) { if (!mp.open) render(); return; }
      if (mp.open) {
        products.forEach(function(item){ mp.temp.push(item); });
        if (mp.targetIndex != null) {
          releasePickerTemps(products.length ? [products[0].id] : []);
          mp.draft = products.length ? [products[0].id] : [];
          mp.temp = products.length ? [products[0]] : [];
        } else {
          products.forEach(function(item){ mp.draft.push(item.id); });
        }
        mp.tab = "upload";
        renderMaterialPicker();
      } else if (targetIndex != null) {
        if (products[0] && state.selectedProducts[targetIndex]) {
          var old = state.selectedProducts[targetIndex];
          state.selectedProducts[targetIndex] = products[0];
          revokeProduct(old);
          render();
        } else { revokeProductList(products); }
      } else {
        products.forEach(function(item){ state.selectedProducts.push(item); });
        render();
      }
    };
    input.click();
  }

  function renderMaterialPicker() {
    var host = document.getElementById("materialRoot");
    if (!host) { host = document.createElement("div"); host.id = "materialRoot"; document.body.appendChild(host); }
    if (!mp.open) { host.innerHTML = ""; return; }

    var source = mp.tab === "personal" ? materialLibrary.personal : (mp.tab === "public" ? materialLibrary.public : mp.temp);
    var keyword = mp.keyword.toLowerCase();
    var list = source.filter(function(item){
      return (!keyword || item.title.toLowerCase().indexOf(keyword) >= 0) &&
        (mp.category === "全部类目" || item.category === mp.category) &&
        (mp.tag === "全部标签" || (item.tags || []).indexOf(mp.tag) >= 0);
    });
    var categories = ["全部类目","家居","服饰","运动户外","其他"];
    var tags = ["全部标签","商品原图","主图","细节","场景","模特","纹理","参考图"];
    var tabsHtml = [["personal","个人素材库","只看你自己的素材"], ["public","公共素材库","查看所有人共享素材"], ["upload","本地上传","从电脑选择文件"]].map(function(t){
      return '<button class="mp-tab ' + (mp.tab===t[0]?'active':'') + '" data-mact="tab" data-v="' + t[0] + '"><strong>' + t[1] + '</strong><span>' + t[2] + '</span></button>';
    }).join("");
    var cardsHtml = list.map(function(m){
      var on = mp.draft.indexOf(m.id) >= 0;
      var existing = state.selectedProducts.some(function(item){ return productIdentity(item) === m.id; });
      return '<div class="mp-card' + (on?' on':'') + (existing && mp.targetIndex==null?' existing':'') + '" data-mact="toggle" data-v="' + attr(m.id) + '">' +
        '<div class="mp-thumb"><img src="' + attr(m.img) + '" alt=""></div>' +
        '<div class="mp-card-info"><strong>' + esc(m.title) + '</strong><span class="muted">' + esc(m.category || "其他") + ' · ' + esc((m.tags || []).join(" / ")) + '</span></div>' +
        '<div class="mp-check"><span class="tick">✓</span></div>' +
      '</div>';
    }).join("");
    if (!cardsHtml) cardsHtml = '<div class="mp-no-result">没有符合当前筛选条件的图片</div>';
    var uploadLead = '<div class="mp-upload-card" data-mact="local-upload"><span class="plus">＋</span><strong>' + (mp.targetIndex==null?'选择本地图片':'上传一张替换图片') + '</strong><span>支持 JPG/JPEG/PNG，单张不超过 20MB</span></div>';

    host.innerHTML =
      '<div class="mp-mask" data-mact="mask"><div class="mp-modal">' +
        '<div class="mp-head"><div><span class="mp-tag">' + (mp.targetIndex==null?'添加图片':'替换图片') + '</span><h3>' + (mp.targetIndex==null?'选择商品图片':'替换第 ' + (mp.targetIndex+1) + ' 张商品图片') + '</h3><p class="sub">' + (mp.targetIndex==null?'确认后追加并自动去重，不会覆盖已有商品图片。':'只能选择一张，确认后仅替换当前目标位置。') + '</p></div><button class="mp-close" data-mact="close">×</button></div>' +
        '<div class="mp-tabs">' + tabsHtml + '</div>' +
        (mp.tab !== "upload" ? '<div class="mp-filter"><input placeholder="按标题搜索" data-mact="keyword" value="' + attr(mp.keyword) + '"><select data-mact="category">' + categories.map(function(v){return '<option' + (mp.category===v?' selected':'') + '>' + v + '</option>';}).join("") + '</select><select data-mact="tag">' + tags.map(function(v){return '<option' + (mp.tag===v?' selected':'') + '>' + v + '</option>';}).join("") + '</select></div>' : '') +
        '<div class="mp-body">' + (mp.tab === "upload" ? '<div class="mp-upload-area">' + uploadLead + '</div>' + (uploadFeedback ? '<div class="suite-upload-feedback">' + esc(uploadFeedback) + '</div>' : '') : '') + '<div class="mp-grid">' + cardsHtml + '</div></div>' +
        '<div class="mp-foot"><div class="mp-count"><strong>本次已选择 ' + mp.draft.length + ' 张</strong><span class="muted">' + (mp.targetIndex==null?'商品图片最多 16 张':'替换不改变图片总数') + '</span></div>' +
          '<div class="mp-actions"><button class="ghost-btn" data-mact="close">取消</button><button class="primary-btn" data-mact="confirm">确认选择</button></div></div>' +
      '</div></div>';

    host.querySelectorAll("[data-mact]").forEach(function(el){
      var a = el.dataset.mact, v = el.dataset.v;
      if (a === "keyword") { el.addEventListener("input", function(){
        mp.keyword = el.value;
        var cursor = el.selectionStart;
        renderMaterialPicker();
        var next = host.querySelector('[data-mact="keyword"]');
        if (next) { next.focus(); if (next.setSelectionRange) next.setSelectionRange(cursor, cursor); }
      }); return; }
      if (a === "category" || a === "tag") { el.addEventListener("change", function(){ mp[a] = el.value; renderMaterialPicker(); }); return; }
      el.addEventListener("click", function(e){
        if (a === "mask") { if (e.target===el) closeMaterialPicker(); return; }
        if (a === "close") return closeMaterialPicker();
        if (a === "tab") { mp.tab = v; renderMaterialPicker(); return; }
        if (a === "toggle") return toggleMaterial(v);
        if (a === "local-upload") return localUploadMaterial(mp.targetIndex);
        if (a === "confirm") return confirmMaterialPicker();
      });
    });
  }

  // ---- AI 润色弹窗 ----
  var polish = { open:false, original:"", result:"" };

  function polishText(text) {
    var clean = text.trim().replace(/\s+/g, " ").replace(/[。；;，,]+$/g, "");
    return clean + "；突出核心优势、使用体验与购买价值，表达简洁有力。";
  }
  function openPolish() {
    if (!state.sellPoints.trim()) { toast("请先填写商品卖点再进行 AI 润色"); return; }
    polish.open = true; polish.original = state.sellPoints; polish.result = polishText(state.sellPoints).slice(0, 500);
    renderPolish();
  }
  function closePolish() {
    polish.open = false;
    var host = document.getElementById("suitePolishRoot"); if (host) host.innerHTML = "";
  }
  function applyPolish() {
    state.sellPoints = polish.result.slice(0, 500);
    closePolish(); render(); toast("已应用润色结果");
  }
  function renderPolish() {
    var anchor = root.querySelector(".suite-config");
    var host = anchor ? anchor.querySelector("#suitePolishRoot") : document.getElementById("suitePolishRoot");
    if (!host) { host = document.createElement("div"); host.id = "suitePolishRoot"; (anchor || document.body).appendChild(host); }
    host.innerHTML = '<div class="suite-polish-scrim" data-pact="mask"><div class="suite-polish-modal">' +
      '<div class="suite-polish-head"><strong>AI 卖点润色</strong><span class="polish-status">已完成</span></div>' +
      '<div class="suite-polish-body">' + esc(polish.result) + '</div>' +
      '<div class="suite-polish-foot"><button class="ghost-btn" data-pact="cancel">取消</button><button class="primary-btn" data-pact="apply">确认</button></div>' +
    '</div></div>';
    host.querySelectorAll("[data-pact]").forEach(function(el){ el.addEventListener("click", function(e){
      if (el.dataset.pact === "mask") { if (e.target===el) closePolish(); return; }
      if (el.dataset.pact === "cancel") return closePolish();
      if (el.dataset.pact === "apply") return applyPolish();
    }); });
  }

  // ---- 清空确认弹窗 ----
  var confirmBox = { open:false };
  function openClearConfirm() { confirmBox.open = true; renderClearConfirm(); }
  function closeClearConfirm() { confirmBox.open = false; var host=document.getElementById("suiteConfirmRoot"); if(host)host.innerHTML=""; }
  function confirmClear() {
    closeLightbox(); closeEditor();
    if (mp.open) closeMaterialPicker();
    closeLayout(); closeLayZoom(); closePolish();
    resetTaskState(); closeClearConfirm(); render(); toast("已清空当前配置和结果");
  }
  function renderClearConfirm() {
    var host = document.getElementById("suiteConfirmRoot");
    if (!host) { host=document.createElement("div"); host.id="suiteConfirmRoot"; document.body.appendChild(host); }
    host.innerHTML = '<div class="suite-overlay-mask" data-cact="mask"><div class="suite-overlay-modal suite-confirm-modal">' +
      '<div class="suite-overlay-head"><div><h3>确认清空</h3></div><button data-cact="cancel">×</button></div>' +
      '<div class="suite-confirm-copy">清空后当前配置和结果将无法在本页恢复，是否继续？</div>' +
      '<div class="suite-overlay-foot"><button class="ghost-btn" data-cact="cancel">取消</button><button class="primary-btn danger" data-cact="confirm">确认清空</button></div>' +
    '</div></div>';
    host.querySelectorAll("[data-cact]").forEach(function(el){ el.addEventListener("click", function(e){
      if (el.dataset.cact === "mask") { if(e.target===el) closeClearConfirm(); return; }
      if (el.dataset.cact === "cancel") return closeClearConfirm();
      if (el.dataset.cact === "confirm") return confirmClear();
    }); });
  }

  // ---- 局部编辑弹窗 ----
  var ed = { open:false, group:null, idx:0, src:"", tool:"brush", brush:36, prompt:"", drawn:false, generating:false, done:0, total:0, result:null };
  var edStrokes = [];
  var edCanvas = null, edCtx = null, edDrawing = false, edLast = null, edRectStart = null;

  function openEditor(groupName, idx) {
    var g = state.results && state.results.filter(function(x){return x.name===groupName;})[0];
    if (!g) return;
    ed.open = true; ed.group = groupName; ed.idx = idx; ed.src = g.imgs[idx];
    ed.tool = "brush"; ed.brush = 36; ed.prompt = ""; ed.drawn = false;
    ed.generating = false; ed.result = null;
    edStrokes = [];
    renderEditor();
  }
  function closeEditor() {
    if (ed._timer) { clearInterval(ed._timer); ed._timer = null; }
    ed.open = false; ed.generating = false; edCanvas = null; edCtx = null; edDrawing = false;
    var m = document.getElementById("editorRoot");
    if (m) m.innerHTML = "";
  }

  function setupEditorCanvas() {
    var img = document.getElementById("edBaseImg");
    edCanvas = document.getElementById("edMaskCanvas");
    if (!img || !edCanvas) return;
    var apply = function() {
      var w = img.clientWidth, h = img.clientHeight;
      if (!w || !h) return;
      edCanvas.width = w; edCanvas.height = h;
      edCanvas.style.width = w + "px"; edCanvas.style.height = h + "px";
      edCtx = edCanvas.getContext("2d");
      redrawMask();
    };
    if (img.complete && img.clientWidth) apply();
    else img.onload = apply;
  }
  function redrawMask() {
    if (!edCtx) return;
    edCtx.clearRect(0, 0, edCanvas.width, edCanvas.height);
    edCtx.fillStyle = "rgba(124,58,237,.42)";
    edCtx.strokeStyle = "rgba(124,58,237,.42)";
    edStrokes.forEach(function(s){
      if (s.type === "rect") { edCtx.fillRect(s.x, s.y, s.w, s.h); return; }
      edCtx.lineJoin = edCtx.lineCap = "round";
      edCtx.lineWidth = s.brush;
      edCtx.beginPath();
      s.pts.forEach(function(p,i){ i ? edCtx.lineTo(p.x,p.y) : edCtx.moveTo(p.x,p.y); });
      if (s.pts.length === 1) { edCtx.arc(s.pts[0].x, s.pts[0].y, s.brush/2, 0, 7); edCtx.fill(); }
      else edCtx.stroke();
    });
    ed.drawn = edStrokes.length > 0;
  }
  function edPos(e) {
    var r = edCanvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function edDown(e) {
    if (!edCtx || ed.generating || ed.result) return;
    e.preventDefault();
    edDrawing = true;
    var p = edPos(e);
    if (ed.tool === "rect") { edRectStart = p; }
    else { edStrokes.push({ type:"brush", brush:ed.brush, pts:[p] }); }
    redrawMask();
  }
  function edMove(e) {
    if (!edDrawing || !edCtx) return;
    var p = edPos(e);
    if (ed.tool === "rect") {
      redrawMask();
      edCtx.fillStyle = "rgba(124,58,237,.42)";
      edCtx.fillRect(edRectStart.x, edRectStart.y, p.x-edRectStart.x, p.y-edRectStart.y);
    } else {
      edStrokes[edStrokes.length-1].pts.push(p);
      redrawMask();
    }
  }
  function edUp(e) {
    if (!edDrawing) return;
    edDrawing = false;
    if (ed.tool === "rect" && edRectStart) {
      var p = edPos(e);
      var x = Math.min(edRectStart.x, p.x), y = Math.min(edRectStart.y, p.y);
      var w = Math.abs(p.x-edRectStart.x), h = Math.abs(p.y-edRectStart.y);
      if (w > 4 && h > 4) edStrokes.push({ type:"rect", x:x, y:y, w:w, h:h });
      edRectStart = null;
    }
    redrawMask();
    syncEditorButtons();
  }

  function edGenerate() {
    if (!ed.drawn) { toast("请先涂抹或框选要修改的区域"); return; }
    if (!ed.prompt.trim()) { toast("请描述选区内希望生成什么"); return; }
    ed.generating = true; ed.done = 0; ed.total = 100;
    renderEditor();
    if (ed._timer) clearInterval(ed._timer);
    ed._timer = setInterval(function(){
      ed.done += 8 + Math.round(Math.random()*7);
      if (ed.done >= ed.total) {
        clearInterval(ed._timer); ed._timer = null;
        ed.generating = false;
        var pool = assetPool.filter(function(s){ return s !== ed.src; });
        ed.result = pool[Math.floor(Math.random()*pool.length)] || ed.src;
        renderEditor();
      } else {
        var bar = document.querySelector("#editorRoot .ed-progress i");
        var txt = document.querySelector("#editorRoot .ed-progress .ptxt");
        if (bar) bar.style.width = ed.done + "%";
        if (txt) txt.textContent = "AI 重绘中… " + ed.done + "%";
      }
    }, 160);
  }
  function edApply() {
    var g = state.results && state.results.filter(function(x){return x.name===ed.group;})[0];
    if (g && ed.result) { g.imgs[ed.idx] = ed.result; }
    closeEditor();
    render();
    toast("已应用局部编辑结果");
  }
  function edRegenerate() {
    ed.result = null;
    renderEditor();
  }

  function syncEditorButtons() {
    var host = document.getElementById("editorRoot");
    if (!host) return;
    var undo = host.querySelector('[data-eact="undo"]');
    var clr = host.querySelector('[data-eact="clear"]');
    var gen = host.querySelector('[data-eact="gen"]');
    if (undo) undo.disabled = !edStrokes.length;
    if (clr) clr.disabled = !edStrokes.length;
    if (gen) gen.disabled = !edStrokes.length || !ed.prompt.trim();
  }

  function renderEditor() {
    var host = document.getElementById("editorRoot");
    if (!host) { host = document.createElement("div"); host.id = "editorRoot"; document.body.appendChild(host); }
    if (!ed.open) { host.innerHTML = ""; return; }

    var groupLabel = esc(ed.group) + " · 第 " + (ed.idx+1) + " 张";
    var canvasArea;
    if (ed.result) {
      canvasArea =
        '<div class="ed-compare">' +
          '<figure><img src="' + ed.src + '" alt=""><figcaption>原图</figcaption></figure>' +
          '<figure class="after"><img src="' + ed.result + '" alt=""><figcaption>局部编辑后</figcaption></figure>' +
        '</div>';
    } else {
      canvasArea =
        '<div class="ed-stage">' +
          '<div class="ed-imgwrap"><img id="edBaseImg" src="' + ed.src + '" alt="">' +
            '<canvas id="edMaskCanvas"></canvas>' +
            (ed.generating ? '<div class="ed-genmask"><span class="spinner">AI 重绘中…</span></div>' : '') +
          '</div>' +
          (ed.generating
            ? '<div class="ed-progress"><span class="ptxt">AI 重绘中… ' + ed.done + '%</span><div class="bar"><i style="width:' + ed.done + '%"></i></div></div>'
            : '<div class="ed-hint">💡 用画笔涂抹或框选要修改的区域（紫色为选区），再在右侧写清楚改成什么，其余保持不变。</div>') +
        '</div>';
    }

    var toolsDisabled = ed.generating || ed.result;
    var rightPanel = ed.result
      ? '<div class="ed-side">' +
          '<h4>生成完成</h4>' +
          '<p class="ed-desc">对比满意就应用，会替换回套图结果中的这一张；不满意可重新生成。</p>' +
          '<div class="ed-prompt-recap"><label>本次提示词</label><div>' + esc(ed.prompt) + '</div></div>' +
          '<div class="ed-foot"><button class="ghost-btn" data-eact="regen">重新生成</button><button class="primary-btn" data-eact="apply">应用替换</button></div>' +
        '</div>'
      : '<div class="ed-side">' +
          '<h4>局部编辑</h4>' +
          '<div class="ed-tools">' +
            '<button class="ed-tool ' + (ed.tool==="brush"?"active":"") + '" data-eact="tool" data-v="brush"' + (toolsDisabled?" disabled":"") + '>✎ 画笔</button>' +
            '<button class="ed-tool ' + (ed.tool==="rect"?"active":"") + '" data-eact="tool" data-v="rect"' + (toolsDisabled?" disabled":"") + '>▭ 框选</button>' +
          '</div>' +
          '<label class="ed-brush">画笔粗细 <b>' + ed.brush + '</b>' +
            '<input type="range" min="8" max="80" value="' + ed.brush + '" data-eact="brush"' + (ed.tool==="rect"||toolsDisabled?" disabled":"") + '></label>' +
          '<div class="ed-rowbtns"><button class="ghost-btn" data-eact="undo"' + (edStrokes.length?"":" disabled") + '>撤销</button>' +
            '<button class="ghost-btn" data-eact="clear"' + (edStrokes.length?"":" disabled") + '>清空选区</button></div>' +
          '<div class="ed-field"><label>重绘提示词</label>' +
            '<textarea data-eact="prompt" placeholder="描述选区内希望生成什么，例如：把这块地毯纹样换成灰色几何图案">' + esc(ed.prompt) + '</textarea></div>' +
          '<div class="ed-foot"><button class="primary-btn wide" data-eact="gen"' + ((ed.drawn && ed.prompt.trim())?"":" disabled") + '>' + (ed.generating?"重绘中…":"生成") + '</button></div>' +
        '</div>';

    host.innerHTML =
      '<div class="ed-mask" data-eact="mask">' +
        '<div class="ed-modal">' +
          '<div class="ed-head"><div><h3>局部编辑</h3><div class="sub">' + groupLabel + '</div></div>' +
            '<button class="ed-close" data-eact="close">×</button></div>' +
          '<div class="ed-body"><div class="ed-left">' + canvasArea + '</div>' + rightPanel + '</div>' +
        '</div>' +
      '</div>';

    if (!ed.result && !ed.generating) setupEditorCanvas();

    host.querySelectorAll("[data-eact]").forEach(function(el){
      var a = el.dataset.eact;
      if (a === "prompt") {
        el.addEventListener("input", function(){ ed.prompt = el.value; syncEditorButtons(); });
        return;
      }
      if (a === "brush") {
        el.addEventListener("input", function(){ ed.brush = parseInt(el.value,10); var b=host.querySelector(".ed-brush b"); if(b)b.textContent=ed.brush; });
        return;
      }
      el.addEventListener("click", function(e){
        if (a === "mask") { if (e.target===el) closeEditor(); return; }
        if (a === "close") return closeEditor();
        if (a === "tool") { ed.tool = el.dataset.v; renderEditor(); return; }
        if (a === "undo") { edStrokes.pop(); redrawMask(); syncEditorButtons(); return; }
        if (a === "clear") { edStrokes = []; redrawMask(); syncEditorButtons(); return; }
        if (a === "gen") return edGenerate();
        if (a === "apply") return edApply();
        if (a === "regen") return edRegenerate();
      });
    });

    if (edCanvas) {
      edCanvas.addEventListener("pointerdown", edDown);
      if (!renderEditor._moveBound) {
        window.addEventListener("pointermove", edMove);
        window.addEventListener("pointerup", edUp);
        renderEditor._moveBound = true;
      }
    }
  }

  function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  function attr(s){return esc(s).replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
  function toast(msg){var r=document.getElementById("toastRoot");var t=document.createElement("div");t.textContent=msg;t.style.cssText="position:fixed;right:24px;bottom:24px;z-index:90;background:#0f172a;color:#fff;padding:12px 18px;border-radius:12px;font-weight:800;box-shadow:0 16px 40px rgba(15,23,42,.3)";r.appendChild(t);setTimeout(function(){t.remove();},2000);}
})();
