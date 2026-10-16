/* serve.mjs — 零依赖静态服务器，仅供本地预览
   用法：node serve.mjs [port]（默认 5179） */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2] || 5179);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (path === "/") path = "/index.html";

    const target = normalize(join(ROOT, path));
    if (!target.startsWith(ROOT)) {
      res.writeHead(403).end("forbidden");
      return;
    }

    const info = await stat(target).catch(() => null);
    if (!info || !info.isFile()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("404 " + path);
      return;
    }

    const body = await readFile(target);
    res.writeHead(200, {
      "content-type": TYPES[extname(target).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-store",
    }).end(body);
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" }).end("500 " + err.message);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`serving ${ROOT} at http://127.0.0.1:${PORT}/`);
});
