# 流沙技术 Quicksand Tech — 教育内容网站

面向初中、高中与大学师生的技术学科教育内容站点。核心内容为三类：
**高中技术试题分享**、**高中信息技术与通用技术课程讲解**、**计算机与人工智能通识导论讲解**。

纯静态实现：**原生 HTML + CSS + JavaScript，零依赖、零构建步骤**，双击 `index.html` 即可打开运行。

## 设计与实现

- **视觉**：深色科技感主题。深蓝近黑底 + 青蓝（`#3DDCFF`）/ 靛蓝（`#6C8CFF`）/ 紫（`#A97BFF`）渐变辉光，
  首页大标题使用渐变裁切 + 多层 `text-shadow` 发光效果。
- **设计令牌**：全部集中在 `assets/css/site.css` 的 `:root`，换肤只改一处。
- **占位区块**：Logo、图标、二维码、封面图、头像一律使用圆角虚线占位块（`.ph` 系列），可直接替换为真实图片。
- **响应式**：栅格用 `auto-fit + minmax` 自适应；≤860px 主导航变为右侧抽屉，≤640px 页脚四栏堆叠为单列。
- **无账号体系**：站点不提供登录、注册，全部内容开放访问；页面内唯一的交互表单是支持页的「建议与反馈」。

## 预留跳转接口（建议与反馈按钮）

页头右侧的「建议与反馈」按钮默认跳站内 `support/index.html#feedback`，但它是一个可替换的接口，
有两级配置方式：

| 方式 | 位置 | 作用范围 |
| --- | --- | --- |
| 构建期常量 `FEEDBACK_PATH` | `build.mjs` 顶部 | 改一行后重新 `node build.mjs`，全站 9 个次级页面生效（首页需同步改 `index.html`） |
| 运行期变量 `window.QS_FEEDBACK_URL` | 在页面加载前注入 | 无需重新构建，`site.js` 会把所有带 `data-feedback` 的按钮改指向该外部地址，并以新窗口打开 |

接入外部工单/表单系统时，任选其一即可，例如：

```html
<script>window.QS_FEEDBACK_URL = 'https://example.com/ticket/new';</script>
```

按钮统一带 `data-feedback` 标记，后续要接埋点或改成弹窗表单，也只需针对这个选择器处理。
- **可访问性**：每页单个 `h1`、跳转链接、可见焦点环、Esc 关闭抽屉、`prefers-reduced-motion` 下关闭全部动效。

## 页面结构（依据 信息架构层级.md）

| 路径 | 信息架构节点 |
| --- | --- |
| `index.html` | 首页（顶部导航栏 / 主内容 / 页脚 / 悬浮组件） |
| `products/index.html` | 产品 |
| `products/product-01.html` | 产品 › 产品占位01（流沙题库 · 高中技术试题分享） |
| `products/product-02.html` | 产品 › 产品占位02（信息技术课堂） |
| `products/product-03.html` | 产品 › 产品占位03（通用技术工坊） |
| `products/product-04.html` | 产品 › 产品占位04（智识导论 · 计算机与 AI 通识） |
| `solutions/index.html` | 解决方案（初中 / 高中 / 大学 + 四类场景） |
| `support/index.html` | 支持与服务（建议与反馈 / 使用帮助 / 常见问题 / 资源下载 / 联系与支持） |
| `developers/index.html` | 关于开发者（开发团队 / 技术栈与架构 / 加入与合作） |
| `about/index.html` | 页脚「关于我们」入口 |

> 信息架构中的「登录与注册」节点已按需求移除，不再生成对应页面。

## 首页对应关系

| 要求 | 实现 |
| --- | --- |
| 顶部导航栏 · 左上圆角 logo 占位 | `.ph--logo`，标注「流沙技术 Logo」 |
| 主导航 | `.nav`：产品 / 解决方案 / 支持与服务 / 关于开发者 |
| 右侧按钮 | `.header__actions`：「建议与反馈」按钮（全站 10 个页面一致），跳转目标走预留接口 |
| 发光品牌大标题 + 标语 | `.glow` + `.hero__tagline` |
| 产品展示区三张卡片 | `#products`，含图标占位、标题、简介、跳转按钮（锚点 + 子页面双入口） |
| 页脚四栏 | 关于我们 / 资源中心 / 关于公众号（二维码占位）/ 帮助与服务 |
| 右下返回顶部 | `.to-top`，滚动超过一屏（`window.innerHeight`）后淡入，平滑回顶 |

## 开发命令

```bash
node serve.mjs 5179      # 本地预览 http://127.0.0.1:5179/
node build.mjs           # 重新生成 9 个次级页面（index.html 为手写，不受影响）
node verify.mjs          # 静态检查：内链、锚点、aria 关联、标签配平、单 h1
```

`verify.mjs` 当前结果：10 个页面 / 232 条内链，全部通过。

## 注意

- `build.mjs` 为 UTF-8 文件。**不要用 Windows PowerShell 5.1 的 `Get-Content` / `Set-Content` 编辑**，
  非 ASCII 会被静默重编码并破坏中文字面量。
- 未接入后端：「建议与反馈」表单为静态演示，提交后仅显示提示文案。
- 不依赖外部 CDN 字体与图片，离线环境可正常渲染。
