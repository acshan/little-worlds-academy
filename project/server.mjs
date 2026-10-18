import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)),
  port = Number(process.env.PORT ?? 4181);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};
http
  .createServer((req, res) => {
    try {
      const name =
        decodeURIComponent(new URL(req.url, "http://localhost").pathname).slice(
          1,
        ) || "index.html";
      const file = path.resolve(root, name);
      if (
        !file.startsWith(root + path.sep) ||
        name.split("/").some((p) => p.startsWith(".")) ||
        !fs.statSync(file).isFile()
      )
        throw Error();
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] ?? "text/plain",
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(file).pipe(res);
    } catch {
      res.writeHead(404);
      res.end("File not found");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`微光守林人：http://127.0.0.1:${port}/`),
  );
