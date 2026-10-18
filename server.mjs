import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 4180);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".zip": "application/zip",
  ".svg": "image/svg+xml",
};
http
  .createServer((req, res) => {
    try {
      let rel = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      ).slice(1);
      if (!rel) rel = "index.html";
      let file = path.resolve(root, rel);
      if (
        !file.startsWith(root + path.sep) ||
        rel.split("/").some((s) => s.startsWith(".") || s === "node_modules")
      )
        throw Error("Not found");
      if (fs.existsSync(file) && fs.statSync(file).isDirectory())
        file = path.join(file, "index.html");
      if (!fs.existsSync(file) || !fs.statSync(file).isFile())
        throw Error("Not found");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
      });
      if (req.method === "HEAD") res.end();
      else fs.createReadStream(file).pipe(res);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("没有找到这个文件。");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`微光游戏工坊：http://127.0.0.1:${port}/`),
  );
