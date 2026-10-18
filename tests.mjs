import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { lessons } from "./course.js";
import { results } from "./project/tests.mjs";
const root = path.dirname(fileURLToPath(import.meta.url));
assert.equal(lessons.length, 18);
assert.equal(new Set(lessons.map((l) => l.id)).size, 18);
let paragraphs = 0;
for (const l of lessons) {
  const result = new Function("config", l.solution)({});
  assert(l.test(result), `${l.id}: 参考答案未通过自身检查`);
  assert(!l.test({}), `${l.id}: 空结果不应该通过`);
  assert(l.sections.length >= 3);
  assert(l.quiz.answer >= 0 && l.quiz.answer < l.quiz.options.length);
  assert(
    fs.existsSync(path.join(root, "project", l.source)),
    `${l.id}: 关联源码不存在`,
  );
  paragraphs += l.sections.reduce((n, s) => n + s.paragraphs.length, 0);
}
const allFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "vendor"].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(mjs|js)$/.test(file)) allFiles.push(file);
  }
}
walk(root);
for (const file of allFiles)
  execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
assert(
  fs
    .readFileSync(path.join(root, "project/vendor/three.core.js"), "utf8")
    .includes("186"),
);
const report = {
  date: new Date().toISOString(),
  lessons: lessons.length,
  referenceSolutionsVerified: 18,
  sourceLinksVerified: 18,
  paragraphs,
  syntaxCheckedFiles: allFiles.length,
  coreRuleTests: results.length,
  scope:
    "Automated checks of original course solutions and pure game rules; browser UI checks recorded separately.",
};
fs.writeFileSync(
  path.join(root, "test-results.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
