/**
 * 流沙技术 — 静态检查：内链、锚点、aria 关联、单 h1
 * 用法：node verify.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const problems = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk(ROOT);
let linkCount = 0;

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');
  const dir = dirname(file);

  // 单 h1
  const h1 = html.match(/<h1[\s>]/g) || [];
  if (h1.length !== 1) problems.push(`[${rel}] h1 数量为 ${h1.length}，应为 1`);

  // 内链
  const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (id && !new RegExp(`id="${id}"`).test(html)) {
        problems.push(`[${rel}] 锚点 #${id} 在本页不存在`);
      }
      continue;
    }
    const [pathPart, hash] = href.split('#');
    const target = resolve(dir, pathPart);
    if (!existsSync(target)) {
      problems.push(`[${rel}] 链接目标不存在：${href}`);
      continue;
    }
    linkCount++;
    if (hash) {
      const targetHtml = readFileSync(target, 'utf8');
      if (!new RegExp(`id="${hash}"`).test(targetHtml)) {
        problems.push(`[${rel}] 跨页锚点缺失：${href}`);
      }
    }
  }

  // aria-controls / aria-labelledby
  for (const m of html.matchAll(/aria-controls="([^"]+)"/g)) {
    if (!new RegExp(`id="${m[1]}"`).test(html)) problems.push(`[${rel}] aria-controls 指向不存在的 #${m[1]}`);
  }

  // 资源
  for (const m of html.matchAll(/(?:src|href)="((?:assets)\/[^"]+)"/g)) {
    const t = resolve(dir, m[1]);
    if (!existsSync(t)) problems.push(`[${rel}] 资源缺失：${m[1]}`);
  }

  // 占位文本
  if (/lorem ipsum/i.test(html)) problems.push(`[${rel}] 出现 lorem ipsum`);

  // 标签配平（粗查）
  for (const tag of ['section', 'article', 'main', 'footer', 'header', 'nav', 'form']) {
    const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (open !== close) problems.push(`[${rel}] <${tag}> 配平异常：开 ${open} / 闭 ${close}`);
  }
}

console.log(`检查 ${files.length} 个页面，内链 ${linkCount} 条。`);
if (problems.length) {
  console.log(`发现 ${problems.length} 个问题：`);
  problems.forEach((p) => console.log(' - ' + p));
  process.exitCode = 1;
} else {
  console.log('全部通过：内链、锚点、aria 关联、标签配平、单 h1 均无问题。');
}
