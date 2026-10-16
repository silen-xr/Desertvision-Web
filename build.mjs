/**
 * 流沙技术 — 次级页面生成器
 * 用法：node build.mjs
 * 说明：本文件为 UTF-8，请勿用 Windows PowerShell 5.1 的 Get-Content/Set-Content 编辑。
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));

/* ---------------- 通用片段 ---------------- */

/**
 * 预留跳转接口 —— 「建议与反馈」按钮的目标地址（站内相对路径）。
 * 接入真实工单 / 表单系统后，只改这一行即可让全站按钮改指向。
 * 也可在页面中预先设置 window.QS_FEEDBACK_URL 指向外部地址，优先级更高（见 assets/js/site.js）。
 */
const FEEDBACK_PATH = 'support/index.html#feedback';

const NAV = [
  { key: 'products',   href: 'products/index.html',   label: '产品' },
  { key: 'solutions',  href: 'solutions/index.html',  label: '解决方案' },
  { key: 'support',    href: 'support/index.html',    label: '支持与服务' },
  { key: 'developers', href: 'developers/index.html', label: '关于开发者' },
];

const FOOTER = [
  {
    title: '关于我们',
    links: [
      ['团队介绍', 'about/index.html#intro'],
      ['教育理念', 'about/index.html#idea'],
      ['发展历程', 'about/index.html#timeline'],
      ['联系与合作', 'about/index.html#contact'],
    ],
  },
  {
    title: '资源中心',
    links: [
      ['技术试题库', 'products/product-01.html'],
      ['课程讲义下载', 'products/product-02.html'],
      ['AI 通识读本', 'products/product-04.html'],
      ['教师研修计划', 'solutions/index.html'],
    ],
  },
  {
    title: '关于公众号',
    qr: true,
    text: '扫码关注「流沙技术」，每周推送试题解析、课程更新与 AI 教学案例。',
  },
  {
    title: '帮助与服务',
    links: [
      ['使用帮助', 'support/index.html#help'],
      ['常见问题', 'support/index.html#faq'],
      ['资源下载', 'support/index.html#download'],
      ['建议与反馈', 'support/index.html#feedback'],
    ],
  },
];

function iconPh(cls = 'ph--icon', label = '图标占位', text = '图标') {
  return `<span class="ph ${cls}" role="img" aria-label="${label}">${text}</span>`;
}

function crumbs(items, p) {
  const li = items.map((it, i) => {
    const last = i === items.length - 1;
    const inner = last
      ? `<span aria-current="page">${it.label}</span>`
      : `<a href="${p}${it.href}">${it.label}</a>`;
    return `<li>${inner}</li>`;
  }).join('');
  return `<nav class="crumbs" aria-label="面包屑"><ol>${li}</ol></nav>`;
}

function sectionHead(eyebrow, title, desc, id) {
  return `
      <div class="section__head" data-reveal>
        <span class="eyebrow">${eyebrow}</span>
        <h2 class="h2"${id ? ` id="${id}"` : ''}>${title}</h2>
        ${desc ? `<p class="lead muted">${desc}</p>` : ''}
      </div>`;
}

function card(opts) {
  const pills = opts.pills
    ? `<div class="pill-row">${opts.pills.map((t, i) => `<span class="pill ${i === 0 ? 'pill--cyan' : ''}">${t}</span>`).join('')}</div>`
    : '';
  const foot = opts.link
    ? `<div class="card__foot"><a class="${opts.linkStyle || 'textlink'}" href="${opts.link}">${opts.linkText}</a></div>`
    : '';
  return `
        <article class="card" data-reveal>
          ${iconPh(opts.iconCls || 'ph--icon', '图标占位', opts.iconText || '图标')}
          <h3 class="card__title">${opts.title}</h3>
          <p class="card__desc">${opts.desc}</p>
          ${pills}
          ${foot}
        </article>`;
}

function anchorNav(items) {
  return `<div class="anchor-nav" data-reveal>${items.map(([h, l]) => `<a href="#${h}">${l}</a>`).join('')}</div>`;
}

/* ---------------- 页面外壳 ---------------- */

function shell({ title, desc, active, body, crumbItems = [], depth = 0 }) {
  const p = '../'.repeat(depth);
  const navHtml = NAV.map((n) => {
    const cur = n.key === active ? ' aria-current="page"' : '';
    return `<li><a class="nav__link" href="${p}${n.href}"${cur}>${n.label}</a></li>`;
  }).join('');

  const footerCols = FOOTER.map((col) => {
    if (col.qr) {
      return `
        <div class="footer__col">
          <h3>${col.title}</h3>
          <div class="qr-box">
            <span class="ph ph--qr" role="img" aria-label="公众号二维码占位">二维码占位</span>
            <p style="font-size:13px">${col.text}</p>
          </div>
        </div>`;
    }
    return `
        <div class="footer__col">
          <h3>${col.title}</h3>
          <ul>${col.links.map(([l, h]) => `<li><a href="${p}${h}">${l}</a></li>`).join('')}</ul>
        </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#05070F">
<link rel="stylesheet" href="${p}assets/css/site.css">
<script>document.documentElement.className = document.documentElement.className.replace('no-js', '');</script>
</head>
<body>

<a class="skip-link" href="#main">跳转到主要内容</a>

<header class="site-header" data-header>
  <div class="wrap header__inner">
    <a class="brand" href="${p}index.html" aria-label="流沙技术 首页">
      <span class="ph ph--logo">流沙技术 Logo</span>
    </a>

    <nav class="nav" id="primaryNav" aria-label="主导航">
      <ul class="nav__list">${navHtml}</ul>
    </nav>

    <div class="header__actions">
      <a class="btn btn--ghost btn--sm" href="${p}${FEEDBACK_PATH}" data-feedback>建议与反馈</a>
    </div>

    <button class="nav-toggle" type="button" data-nav-toggle aria-controls="primaryNav" aria-expanded="false" aria-label="打开导航菜单">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
<div class="nav-backdrop" data-nav-backdrop></div>

<main id="main">
${body}
</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="footer__cols">${footerCols}</div>
    <div class="footer__bottom">
      <span>© <span data-year>2026</span> 流沙技术 Quicksand Tech · 面向技术学科教育的内容平台</span>
      <span>本站为教学演示站点，试题与讲义内容仅供学习交流使用</span>
    </div>
  </div>
</footer>

<button class="to-top" type="button" data-to-top aria-label="返回顶部">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 19V5"></path><path d="M5 12l7-7 7 7"></path>
  </svg>
</button>

<script src="${p}assets/js/site.js"></script>
</body>
</html>
`;
}

function pageHead(crumbHtml, h1, desc, extra = '') {
  return `
  <section class="page-head">
    <div class="wrap">
      ${crumbHtml}
      <h1>${h1}</h1>
      ${desc ? `<p class="lead muted" style="max-width:720px;margin-top:16px">${desc}</p>` : ''}
      ${extra}
    </div>
  </section>`;
}

/* ---------------- 页面内容 ---------------- */

const PAGES = [];

/* ---- 产品 ---- */
PAGES.push({
  file: 'products/index.html',
  depth: 1,
  title: '产品 — 流沙技术',
  desc: '流沙技术产品线：高中技术试题库、信息技术课程讲解、通用技术课程讲解、计算机与人工智能通识导论。',
  active: 'products',
  crumbs: [{ label: '首页', href: 'index.html' }, { label: '产品' }],
  body: pageHead(
    crumbs([{ label: '首页', href: 'index.html' }, { label: '产品' }], '../'),
    '产品 · <span class="accent">四条内容线</span>',
    '围绕技术学科教与学的真实场景，提供从试题训练到课程讲解、再到人工智能通识的完整内容体系。'
  ) + `
  <section class="section">
    <div class="wrap">
      <div class="grid grid--2">
${card({
  iconCls: 'ph--icon-lg',
  title: '产品占位01 · 流沙题库',
  desc: '高中技术试题库：学考与选考真题、优质模拟题与专题训练，逐题解析、考点标注，支持按章节与难度筛选并归类错题。',
  pills: ['真题解析', '考点标注', '错题本'],
  link: 'product-01.html',
  linkText: '查看产品详情',
})}
${card({
  iconCls: 'ph--icon-lg',
  title: '产品占位02 · 信息技术课堂',
  desc: '高中信息技术课程讲解：必修一数据与计算、必修二信息系统与社会、选择性必修算法初步，配套微课、示例与随堂练习。',
  pills: ['必修模块', '选择性必修', '同步讲义'],
  link: 'product-02.html',
  linkText: '查看产品详情',
})}
${card({
  iconCls: 'ph--icon-lg',
  title: '产品占位03 · 通用技术工坊',
  desc: '高中通用技术课程讲解：技术与设计 1/2、电子控制技术，含制图识读、结构受力分析与简易机器人制作案例。',
  pills: ['技术与设计', '电子控制', '制作案例'],
  link: 'product-03.html',
  linkText: '查看产品详情',
})}
${card({
  iconCls: 'ph--icon-lg',
  title: '产品占位04 · 智识导论',
  desc: '计算机与人工智能通识导论：从冯·诺依曼体系到机器学习与大语言模型，面向初高中与大学通识课的可裁剪课件与实验。',
  pills: ['计算机导论', 'AI 原理', '伦理安全'],
  link: 'product-04.html',
  linkText: '查看产品详情',
})}
      </div>
    </div>
  </section>`,
});

/* ---- 产品详情 01 ---- */
PAGES.push({
  file: 'products/product-01.html',
  depth: 1,
  title: '流沙题库 · 高中技术试题分享 — 流沙技术',
  desc: '高中技术试题库：信息技术与通用技术学考、选考真题与模拟题，逐题解析与考点标注。',
  active: 'products',
  body: pageHead(
    crumbs([{ label: '首页', href: 'index.html' }, { label: '产品', href: 'products/index.html' }, { label: '流沙题库' }], '../'),
    '流沙题库 · <span class="accent">高中技术试题分享</span>',
    '把散落在各地的真题、模拟题整理成可检索、可筛选、可追溯考点的结构化题库，每道题都能定位到具体知识点。'
  ) + `
  <section class="section">
    <div class="wrap">
${sectionHead('Features', '题库能做什么', '面向课堂讲评与学生自主训练两类场景设计。')}
      <div class="grid grid--3">
${card({ title: '考点标注与解析', desc: '每道题标注所属模块、知识点与难度系数，解析分步展开，先提示思路再给完整答案。', pills: ['模块标注', '难度分级'] })}
${card({ title: '多维筛选检索', desc: '按教材章节、题型、年份、地区、难度组合筛选，支持关键词全文检索与相似题推荐。', pills: ['组合筛选', '相似题'] })}
${card({ title: '变式题与举一反三', desc: '围绕同一考点推荐变式题与相近难度题目，便于讲评时把一类题讲透。', pills: ['变式推荐', '相近难度'] })}
${card({ title: '错题归类复习', desc: '学生作答记录自动进入错题本，按知识点聚合，定期生成针对性复习清单。', pills: ['错题本', '复习清单'] })}
${card({ title: '班级学情看板', desc: '教师可查看班级掌握度热力图，定位共性薄弱点，直接跳转对应讲解课程。', pills: ['学情看板', '薄弱点定位'] })}
${card({ title: '试题持续更新', desc: '每学期考后同步各地真题，教研团队复核答案与评分标准，标注争议题讨论结论。', pills: ['考后更新', '教研复核'] })}
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
${sectionHead('Coverage', '题型与模块覆盖', '信息技术与通用技术两条主线并行。')}
      <div class="grid grid--2">
        <div class="card" data-reveal>
          <h3 class="card__title">信息技术</h3>
          <div class="pill-row" style="margin-top:12px">
            <span class="pill pill--cyan">数据与计算</span><span class="pill pill--cyan">信息系统与社会</span>
            <span class="pill">算法与程序设计</span><span class="pill">数据库初步</span>
            <span class="pill">网络与信息安全</span><span class="pill">人工智能初步</span>
          </div>
        </div>
        <div class="card" data-reveal>
          <h3 class="card__title">通用技术</h3>
          <div class="pill-row" style="margin-top:12px">
            <span class="pill pill--violet">技术与设计 1</span><span class="pill pill--violet">技术与设计 2</span>
            <span class="pill">结构与设计</span><span class="pill">流程与设计</span>
            <span class="pill">系统与设计</span><span class="pill">控制与设计</span>
            <span class="pill">电子控制技术</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="card" data-reveal>
        <span class="eyebrow">Try it</span>
        <h2 class="h2">先用一套真题试试</h2>
        <p class="lead muted">全部试题与解析开放检索，教研组可申请协作空间与班级学情看板。</p>
        <div class="hero__cta" style="margin-top:24px">
          <a class="btn btn--primary" href="product-02.html">看看课程讲解</a>
          <a class="btn btn--ghost" href="../support/index.html#feedback">提交建议与反馈</a>
        </div>
      </div>
    </div>
  </section>`,
});

/* ---- 产品详情 02 ---- */
PAGES.push({
  file: 'products/product-02.html',
  depth: 1,
  title: '信息技术课堂 · 课程讲解 — 流沙技术',
  desc: '高中信息技术课程讲解：数据与计算、信息系统与社会、算法初步，配套微课、可运行示例与随堂练习。',
  active: 'products',
  body: pageHead(
    crumbs([{ label: '首页', href: 'index.html' }, { label: '产品', href: 'products/index.html' }, { label: '信息技术课堂' }], '../'),
    '信息技术课堂 · <span class="accent">课程讲解</span>',
    '按教材模块逐节展开，一节一张知识图谱，配可运行示例与课堂活动设计，备课与复习都能直接用。'
  ) + `
  <section class="section">
    <div class="wrap">
${sectionHead('Modules', '课程模块', '必修与选择性必修全覆盖，共 82 节微课。')}
      <div class="grid grid--3">
${card({ title: '必修一 · 数据与计算', desc: '数据及其采集、编码与数字化表达、算法概念与 Python 程序实现，含 12 个可运行示例。', pills: ['32 节微课', '配套示例'] })}
${card({ title: '必修二 · 信息系统与社会', desc: '信息系统组成与功能、网络应用、数据库与数据安全、信息社会责任与伦理讨论。', pills: ['26 节微课', '案例讨论'] })}
${card({ title: '选择性必修 · 算法初步', desc: '递归、分治、贪心与动态规划入门，配合可视化演示理解时间复杂度的差异。', pills: ['24 节微课', '可视化'] })}
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
${sectionHead('How', '每节课的标准结构', '教师拿来即用，学生自学也能形成闭环。')}
      <div class="steps" data-reveal>
        <div class="step"><h3 class="h3">知识图谱</h3><p class="muted">用一张图讲清本节概念之间的关系与前置依赖。</p></div>
        <div class="step"><h3 class="h3">示例演示</h3><p class="muted">可在浏览器中直接运行的 Python / 流程图示例。</p></div>
        <div class="step"><h3 class="h3">课堂活动</h3><p class="muted">给出分组任务、时间分配与评价要点。</p></div>
        <div class="step"><h3 class="h3">随堂练习</h3><p class="muted">5–8 道分层练习，自动对应题库中的同类题。</p></div>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="card" data-reveal>
        <span class="eyebrow">Next</span>
        <h2 class="h2">通用技术课程同样在系统讲解中</h2>
        <p class="lead muted">技术与设计、电子控制技术与制作案例，同步提供讲义与课堂活动方案。</p>
        <div class="hero__cta" style="margin-top:24px">
          <a class="btn btn--primary" href="product-03.html">通用技术工坊</a>
          <a class="btn btn--ghost" href="../support/index.html#feedback">提出课程需求</a>
        </div>
      </div>
    </div>
  </section>`,
});

/* ---- 产品详情 03 ---- */
PAGES.push({
  file: 'products/product-03.html',
  depth: 1,
  title: '通用技术工坊 · 课程讲解 — 流沙技术',
  desc: '高中通用技术课程讲解：技术与设计 1/2、电子控制技术，含制图识读、结构受力分析与制作案例。',
  active: 'products',
  body: pageHead(
    crumbs([{ label: '首页', href: 'index.html' }, { label: '产品', href: 'products/index.html' }, { label: '通用技术工坊' }], '../'),
    '通用技术工坊 · <span class="accent">课程讲解</span>',
    '把抽象的结构、流程、系统与控制讲成看得见、做得出的东西：图纸、模型与实验三件套。'
  ) + `
  <section class="section">
    <div class="wrap">
${sectionHead('Modules', '课程模块', '技术与设计 1/2 与电子控制技术，共 68 节微课。')}
      <div class="grid grid--3">
${card({ title: '技术与设计 1', desc: '技术的性质、设计原则与一般过程、技术图样识读与模型制作，含三视图与轴测图练习。', pills: ['22 节微课', '制图练习'] })}
${card({ title: '技术与设计 2', desc: '结构、流程、系统、控制四大主题，配合生活中的工程案例拆解。', pills: ['28 节微课', '工程案例'] })}
${card({ title: '电子控制技术', desc: '常见传感器、数字电路基础、开环与闭环控制、简易机器人制作与安全规范。', pills: ['18 节微课', '实验指导'] })}
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
${sectionHead('Materials', '配套资源', '可直接下载用于课堂与社团活动。')}
      <div class="list" data-reveal>
        <div class="list__item">${iconPh('ph--icon', '图标占位', '图标')}<span class="list__main"><span class="list__title">结构受力分析实验单（含材料清单）</span><span class="list__meta">PDF · 4 页 · 适合 2 课时</span></span><span class="pill pill--violet">下载</span></div>
        <div class="list__item">${iconPh('ph--icon', '图标占位', '图标')}<span class="list__main"><span class="list__title">三视图识读专项练习（30 题）</span><span class="list__meta">PDF · 含答案解析</span></span><span class="pill pill--violet">下载</span></div>
        <div class="list__item">${iconPh('ph--icon', '图标占位', '图标')}<span class="list__main"><span class="list__title">闭环控制系统演示装置搭建手册</span><span class="list__meta">PDF · 含电路图与元件表</span></span><span class="pill pill--violet">下载</span></div>
      </div>
    </div>
  </section>`,
});

/* ---- 产品详情 04 ---- */
PAGES.push({
  file: 'products/product-04.html',
  depth: 1,
  title: '智识导论 · 计算机与人工智能通识 — 流沙技术',
  desc: '计算机与人工智能通识导论：从冯·诺依曼体系到机器学习、神经网络与大语言模型原理，含伦理与安全讨论。',
  active: 'products',
  body: pageHead(
    crumbs([{ label: '首页', href: 'index.html' }, { label: '产品', href: 'products/index.html' }, { label: '智识导论' }], '../'),
    '智识导论 · <span class="accent">计算机与人工智能通识</span>',
    '不堆公式，先把图景讲清楚：计算机怎么工作，人工智能为什么能「学会」，以及它的边界在哪里。'
  ) + `
  <section class="section">
    <div class="wrap">
${sectionHead('Chapters', '导论大纲', '共 24 课时，可按 8 讲或 16 讲两种方式裁剪。')}
      <div class="grid grid--2">
        <div class="list" data-reveal>
          <div class="list__item"><span class="list__main"><span class="list__title">第 1 章 · 计算机是什么</span><span class="list__meta">从算盘到冯·诺依曼体系</span></span><span class="pill pill--sand">4 课时</span></div>
          <div class="list__item"><span class="list__main"><span class="list__title">第 2 章 · 数据如何表示</span><span class="list__meta">二进制、字符编码与多媒体数字化</span></span><span class="pill pill--sand">3 课时</span></div>
          <div class="list__item"><span class="list__main"><span class="list__title">第 3 章 · 算法与复杂度</span><span class="list__meta">从线性查找讲到二分与排序的代价</span></span><span class="pill pill--sand">5 课时</span></div>
        </div>
        <div class="list" data-reveal>
          <div class="list__item"><span class="list__main"><span class="list__title">第 4 章 · 人工智能的三次浪潮</span><span class="list__meta">符号主义、专家系统与深度学习</span></span><span class="pill pill--sand">3 课时</span></div>
          <div class="list__item"><span class="list__main"><span class="list__title">第 5 章 · 机器学习在做什么</span><span class="list__meta">特征、标签与损失函数：以预测房价为例</span></span><span class="pill pill--sand">4 课时</span></div>
          <div class="list__item"><span class="list__main"><span class="list__title">第 6 章 · 大模型与 AI 伦理</span><span class="list__meta">注意力机制初探、幻觉、隐私与职业影响</span></span><span class="pill pill--sand">5 课时</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
${sectionHead('Teaching', '教学建议', '三种落地方式，按课时与学情选择。')}
      <div class="grid grid--3">
${card({ title: '嵌入信息技术课', desc: '作为必修课程的拓展单元，每章 1–2 课时，与数据与算法章节自然衔接。', pills: ['1–2 课时/章'] })}
${card({ title: '社团与选修课', desc: '以可视化演示和动手实验为主，学生完成一个小型分类任务的全过程。', pills: ['项目式'] })}
${card({ title: '大学通识课', desc: '面向非计算机专业，提供完整课件、实验手册与考核题库，可按学分裁剪。', pills: ['可裁剪'] })}
      </div>
    </div>
  </section>`,
});

/* ---- 解决方案 ---- */
PAGES.push({
  file: 'solutions/index.html',
  depth: 1,
  title: '解决方案 — 流沙技术',
  desc: '面向初中、高中与大学的解决方案，以及备课、备考、教研与竞赛四类场景。',
  active: 'solutions',
  body: pageHead(
    crumbs([{ label: '首页', href: 'index.html' }, { label: '解决方案' }], '../'),
    '解决方案 · <span class="accent">按学段与场景落地</span>',
    '同一套内容库，在不同学段与教学场景下有不同的打开方式。'
  ) + `
  <section class="section">
    <div class="wrap">
${sectionHead('By Stage', '按学段', '初中启蒙、高中同步与备考、大学通识。')}
      <div class="grid grid--3">
${card({
  iconCls: 'ph--icon-lg',
  title: '初中 · 启蒙与体验',
  desc: '以图形化编程、生活中的算法与人工智能体验活动为主，衔接高中技术课程的前置概念，每周 1 课时即可开展。',
  pills: ['图形化编程', 'AI 体验活动'],
  link: '../support/index.html#contact', linkText: '联系教研组对接',
})}
${card({
  iconCls: 'ph--icon-lg',
  title: '高中 · 同步与备考',
  desc: '课程同步讲解配合学考、选考真题训练，按章节推进，错题自动归入复习清单，考前生成专项突破卷。',
  pills: ['同步讲解', '真题训练', '错题复习'],
  link: '../support/index.html#contact', linkText: '联系教研组对接',
})}
${card({
  iconCls: 'ph--icon-lg',
  title: '大学 · 通识与导论',
  desc: '面向非计算机专业的通识课，提供可裁剪课件、实验手册与考核题库，支持按 8 讲 / 16 讲两种方式组织。',
  pills: ['通识课件', '考核题库'],
  link: '../products/product-04.html', linkText: '查看通识大纲',
})}
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
${sectionHead('By Scenario', '按场景', '教师备课、学生备考、教研组协作与竞赛培优。')}
      <div class="grid grid--4">
${card({ title: '教师备课', desc: '按章节调取讲义、示例与课堂活动，40 分钟备好一节完整课。' })}
${card({ title: '学生备考', desc: '真题限时训练 + 错题重做 + 薄弱点专项卷，三轮复习节奏清晰。' })}
${card({ title: '教研组协作', desc: '组内共享试题与讲义，统一评分标准，沉淀校本资源库。' })}
${card({ title: '竞赛与培优', desc: '算法专题与项目式任务，为信息学竞赛与科技创新活动提供素材。' })}
      </div>
    </div>
  </section>`,
});

/* ---- 支持与服务 ---- */
PAGES.push({
  file: 'support/index.html',
  depth: 1,
  title: '支持与服务 — 流沙技术',
  desc: '使用帮助、常见问题、资源下载、建议与反馈与联系支持。',
  active: 'support',
  body: pageHead(
    crumbs([{ label: '首页', href: 'index.html' }, { label: '支持与服务' }], '../'),
    '支持与服务 · <span class="accent">让使用没有障碍</span>',
    '从上手引导到问题反馈，这里能找到你需要的大部分答案。',
    `<div style="margin-top:24px">${anchorNav([['help', '使用帮助'], ['faq', '常见问题'], ['download', '资源下载'], ['feedback', '建议与反馈'], ['contact', '联系与支持']])}</div>`
  ) + `
  <section class="section" id="help">
    <div class="wrap">
${sectionHead('Guide', '使用帮助', '四步走完从找题到讲评的完整流程。')}
      <div class="steps" data-reveal>
        <div class="step"><h3 class="h3">选择教材版本</h3><p class="muted">先确定所在地区与教材版本，题库与课程会自动对齐章节顺序。</p></div>
        <div class="step"><h3 class="h3">按章节检索</h3><p class="muted">按章节、题型、难度组合筛选，或直接搜索知识点关键词。</p></div>
        <div class="step"><h3 class="h3">收藏与下载</h3><p class="muted">把需要的试题与讲义加入收藏，公开资料可直接下载到本地。</p></div>
        <div class="step"><h3 class="h3">讲评与巩固</h3><p class="muted">参考分步解析与变式题组织讲评，把易错点纳入下一轮复习。</p></div>
      </div>
    </div>
  </section>

  <section class="section section--tight" id="faq">
    <div class="wrap">
${sectionHead('FAQ', '常见问题', '关于内容、版权与离线使用的三个高频问题。')}
      <div class="grid grid--3">
${card({ title: '试题来源与答案准确性如何保证？', desc: '真题来自公开考试资料与各地教研共享，答案经两名以上教师复核；争议题会在页面标注讨论结论与评分细则。' })}
${card({ title: '可以用于商业培训吗？', desc: '个人学习与校内教学可自由使用；用于校外商业培训需联系我们获取书面授权。' })}
${card({ title: '资料可以离线使用吗？', desc: '资源中心的 PDF / DOCX 可下载后离线使用；试题与课程页面需联网访问，以保证拿到最新版本与勘误。' })}
      </div>
    </div>
  </section>

  <section class="section section--tight" id="download">
    <div class="wrap">
${sectionHead('Downloads', '资源下载', '以下资料对所有访客开放，可直接下载。')}
      <div class="list" data-reveal>
        <div class="list__item">${iconPh('ph--icon', '图标占位', '图标')}<span class="list__main"><span class="list__title">高中技术学科知识点全景图</span><span class="list__meta">PDF · A2 海报尺寸 · 适合张贴于机房</span></span><span class="pill pill--cyan">免费下载</span></div>
        <div class="list__item">${iconPh('ph--icon', '图标占位', '图标')}<span class="list__main"><span class="list__title">Python 入门示例合集（12 个可运行示例）</span><span class="list__meta">ZIP · 含说明文档</span></span><span class="pill pill--cyan">免费下载</span></div>
        <div class="list__item">${iconPh('ph--icon', '图标占位', '图标')}<span class="list__main"><span class="list__title">人工智能通识导论教学大纲（样例）</span><span class="list__meta">DOCX · 可编辑</span></span><span class="pill pill--cyan">免费下载</span></div>
      </div>
    </div>
  </section>

  <section class="section section--tight" id="feedback">
    <div class="wrap">
${sectionHead('Feedback', '建议与反馈', '题目有误、功能缺失或内容需求，都欢迎告诉我们。')}
      <form class="form" data-static novalidate>
        <div class="field">
          <label for="fb-type">反馈类型</label>
          <select class="select" id="fb-type" name="type">
            <option>试题答案有误</option>
            <option>课程讲解建议</option>
            <option>功能与体验问题</option>
            <option>内容合作与投稿</option>
          </select>
        </div>
        <div class="field">
          <label for="fb-contact">联系方式</label>
          <input class="input" id="fb-contact" name="contact" type="text" inputmode="email" placeholder="邮箱或手机号，便于我们回复">
        </div>
        <div class="field">
          <label for="fb-body">详细描述</label>
          <textarea class="textarea" id="fb-body" name="body" placeholder="例如：2025 年 6 月某地通用技术卷第 14 题，选项 C 的受力分析图示与解析不一致……"></textarea>
          <span class="hint">如涉及具体试题，请注明年份、地区、题号，我们会优先复核。</span>
        </div>
        <label class="check"><input type="checkbox" name="agree"> 我同意流沙技术将上述内容用于问题核实与改进。</label>
        <div>
          <button class="btn btn--primary" type="submit">提交反馈</button>
        </div>
        <p class="note" data-form-tip hidden role="status">已接收你的反馈（演示站点未接入后端，内容不会实际提交）。正式版会在 3 个工作日内回复。</p>
      </form>
    </div>
  </section>

  <section class="section section--tight" id="contact">
    <div class="wrap">
${sectionHead('Contact', '联系与支持', '工作日 9:00–18:00 有人工回复。')}
      <div class="grid grid--3">
${card({ title: '在线反馈', desc: '通过页面下方的反馈表单或右下角帮助入口联系我们，工作日平均 5 分钟内响应。', link: '#feedback', linkText: '前往反馈表单' })}
${card({ title: '教师服务邮箱', desc: 'teachers@quicksand.example — 教研组开课、校本资源库搭建与考情数据对接。' })}
${card({ title: '内容合作邮箱', desc: 'content@quicksand.example — 试题投稿、讲义共建与教材版本适配。' })}
      </div>
    </div>
  </section>`,
});

/* ---- 关于开发者 ---- */
PAGES.push({
  file: 'developers/index.html',
  depth: 1,
  title: '关于开发者 — 流沙技术',
  desc: '流沙技术开发团队、技术栈与架构，以及加入与合作方式。',
  active: 'developers',
  body: pageHead(
    crumbs([{ label: '首页', href: 'index.html' }, { label: '关于开发者' }], '../'),
    '关于开发者 · <span class="accent">做技术教育的人</span>',
    '由一线技术教师与工程师共同维护的内容平台。',
    `<div style="margin-top:24px">${anchorNav([['team', '开发团队'], ['stack', '技术栈与架构'], ['join', '加入与合作']])}</div>`
  ) + `
  <section class="section" id="team">
    <div class="wrap">
${sectionHead('Team', '开发团队', '教学、教研与工程三条线并行。')}
      <div class="grid grid--3">
        <div class="card" data-reveal>
          <div style="display:flex;align-items:center;gap:16px">
            ${iconPh('ph--avatar', '头像占位', '头像')}
            <div><h3 class="card__title">陈老师</h3><p class="small">内容负责人 · 高中技术教研</p></div>
          </div>
          <p class="card__desc">十二年高中信息技术教学经历，负责题库审校与课程大纲设计。</p>
        </div>
        <div class="card" data-reveal>
          <div style="display:flex;align-items:center;gap:16px">
            ${iconPh('ph--avatar', '头像占位', '头像')}
            <div><h3 class="card__title">林工</h3><p class="small">前端与可视化</p></div>
          </div>
          <p class="card__desc">负责站点交互、算法可视化演示与移动端适配。</p>
        </div>
        <div class="card" data-reveal>
          <div style="display:flex;align-items:center;gap:16px">
            ${iconPh('ph--avatar', '头像占位', '头像')}
            <div><h3 class="card__title">苏同学</h3><p class="small">内容实习生 · 计算机专业</p></div>
          </div>
          <p class="card__desc">负责人工智能通识章节的资料整理与实验复现。</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--tight" id="stack">
    <div class="wrap">
${sectionHead('Stack', '技术栈与架构', '静态优先，能不引入依赖就不引入。')}
      <div class="list" data-reveal>
        <div class="list__item"><span class="list__main"><span class="list__title">前端 · 原生 HTML / CSS / JavaScript</span><span class="list__meta">无框架、无构建步骤，双击即可打开运行</span></span><span class="pill pill--cyan">Vanilla</span></div>
        <div class="list__item"><span class="list__main"><span class="list__title">样式 · CSS 自定义属性设计令牌</span><span class="list__meta">颜色、圆角、间距、字阶集中在 :root，便于整体换肤</span></span><span class="pill pill--cyan">Design Tokens</span></div>
        <div class="list__item"><span class="list__main"><span class="list__title">页面生成 · Node.js 构建脚本</span><span class="list__meta">build.mjs 复用同一套页头页脚，保证全站结构一致</span></span><span class="pill pill--cyan">Static Gen</span></div>
        <div class="list__item"><span class="list__main"><span class="list__title">可访问性 · WCAG 2.2 AA</span><span class="list__meta">语义标签、可见焦点环、键盘可操作、prefers-reduced-motion</span></span><span class="pill pill--violet">A11y</span></div>
      </div>
    </div>
  </section>

  <section class="section section--tight" id="join">
    <div class="wrap">
${sectionHead('Join', '加入与合作', '我们长期欢迎两类伙伴。')}
      <div class="grid grid--2">
${card({ title: '内容共创', desc: '在职技术教师可参与试题审校、讲义撰写与课程录制，按贡献署名并获得资源使用权益。', link: '../support/index.html#feedback', linkText: '提交合作意向' })}
${card({ title: '开源与工程', desc: '站点的样式与构建脚本以静态资源形式开放，欢迎提交改进建议与适配补丁。', link: '../support/index.html#feedback', linkText: '联系工程团队' })}
      </div>
    </div>
  </section>`,
});

/* ---- 关于我们 ---- */
PAGES.push({
  file: 'about/index.html',
  depth: 1,
  title: '关于我们 — 流沙技术',
  desc: '流沙技术团队介绍、教育理念、发展历程与联系方式。',
  active: null,
  body: pageHead(
    crumbs([{ label: '首页', href: 'index.html' }, { label: '关于我们' }], '../'),
    '关于我们 · <span class="accent">把技术课讲清楚</span>',
    '流沙技术由一线技术教师与工程师共同发起，面向初中、高中与大学师生提供技术学科与人工智能通识内容。',
    `<div style="margin-top:24px">${anchorNav([['intro', '团队介绍'], ['idea', '教育理念'], ['timeline', '发展历程'], ['contact', '联系与合作']])}</div>`
  ) + `
  <section class="section" id="intro">
    <div class="wrap">
${sectionHead('Who we are', '团队介绍', '一支教学与工程混编的小团队。')}
      <div class="grid grid--2">
        <div class="card" data-reveal>
          ${iconPh('ph--cover', '图片占位', '图片占位')}
          <h3 class="card__title">我们如何理解技术教育</h3>
          <p class="card__desc">技术课的核心不是背诵名词，而是建立「问题—抽象—实现—验证」的思维链条。我们把这条链条拆成可练习的颗粒：一道题、一节讲义、一个可运行的示例。</p>
        </div>
        <div class="card" data-reveal>
          ${iconPh('ph--cover', '图片占位', '图片占位')}
          <h3 class="card__title">我们与学校的关系</h3>
          <p class="card__desc">目前与 96 所学校的技术教研组保持内容协作：共享试题、共建讲义、反馈考情变化。课堂里缺什么内容，我们就先补什么内容。</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--tight" id="idea">
    <div class="wrap">
${sectionHead('Beliefs', '教育理念', '三条不变的原则。')}
      <div class="grid grid--3">
${card({ title: '先讲清楚，再谈技巧', desc: '任何算法或概念，先有一张能被记住的图景，再进入细节与解题套路。' })}
${card({ title: '题目要有出处', desc: '每道题标注年份、地区、题型与考点，答案给出推理过程而非直接结论。' })}
${card({ title: '人工智能要讲边界', desc: '不只讲 AI 能做什么，同样讲清它为什么会出错、 hallucination 与数据隐私问题。' })}
      </div>
    </div>
  </section>

  <section class="section section--tight" id="timeline">
    <div class="wrap">
${sectionHead('Timeline', '发展历程', '从一个题库表格开始。')}
      <div class="list" data-reveal>
        <div class="list__item"><span class="list__main"><span class="list__title">2023 · 起点</span><span class="list__meta">教研组内部的试题共享表格，累计整理 2,000 道技术学科试题。</span></span><span class="pill">2,000 题</span></div>
        <div class="list__item"><span class="list__main"><span class="list__title">2024 · 结构化</span><span class="list__meta">完成考点标注体系，上线按章节检索与错题归类。</span></span><span class="pill">章节检索</span></div>
        <div class="list__item"><span class="list__main"><span class="list__title">2025 · 课程化</span><span class="list__meta">信息技术与通用技术课程讲解上线，累计 480 节微课。</span></span><span class="pill pill--violet">480 节</span></div>
        <div class="list__item"><span class="list__main"><span class="list__title">2026 · 通识化</span><span class="list__meta">计算机与人工智能通识导论发布，覆盖初中到大学三个学段。</span></span><span class="pill pill--sand">3 学段</span></div>
      </div>
    </div>
  </section>

  <section class="section section--tight" id="contact">
    <div class="wrap">
${sectionHead('Contact', '联系与合作', '欢迎教研组、出版社与教育技术团队洽谈。')}
      <div class="grid grid--3">
${card({ title: '学校与教研组', desc: '校本资源库搭建与考情数据对接，可按学校进度调整章节口径。', link: '../support/index.html#contact', linkText: '获取联系方式' })}
${card({ title: '内容合作', desc: '试题投稿、讲义共建与教材版本适配。', link: '../support/index.html#feedback', linkText: '提交合作意向' })}
${card({ title: '媒体与活动', desc: '教师培训、公开课与人工智能教育主题活动。', link: '../support/index.html#contact', linkText: '活动邀约' })}
      </div>
    </div>
  </section>`,
});

/* ---------------- 输出 ---------------- */

let count = 0;
for (const page of PAGES) {
  const { file, depth, title, desc, active, body } = page;
  const out = join(ROOT, file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, shell({ title, desc, active, body, depth }), 'utf8');
  count++;
  console.log('生成 ' + file);
}
console.log('共生成 ' + count + ' 个页面。');
