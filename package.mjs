import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { lessons, acts, references } from "./course.js";
const root = path.dirname(fileURLToPath(import.meta.url));
let book =
  "# 微光游戏工坊 · 从零种出你的 3D 游戏\n\n18 课互动课程的文字备份。可执行实验、实时反馈与学习记录，请启动互动版：node server.mjs，然后打开 http://127.0.0.1:4180/。\n\n";
for (const [i, l] of lessons.entries()) {
  book += `## ${String(i).padStart(2, "0")} ${l.title}\n\n阶段：${acts[l.act]}\n\n${l.subtitle}\n\n**本课目标**：${l.goal}\n\n> ${l.story}\n\n`;
  for (const s of l.sections) {
    book += `### ${s.title}\n\n`;
    book += s.paragraphs.join("\n\n") + "\n\n";
  }
  book += `### 动手任务\n\n${l.task}\n\n起点：\n\n\`\`\`js\n${l.code}\n\`\`\`\n\n参考答案：\n\n\`\`\`js\n${l.solution}\n\`\`\`\n\n### 项目代码片段\n\n对应文件：project/${l.source}。下面是讲解片段，完整上下文见对应源文件。\n\n\`\`\`js\n${l.projectCode}\n\`\`\`\n\n### 理解检查\n\n${l.quiz.question}\n\n${l.quiz.options.map((o, j) => `${j + 1}. ${o}`).join("\n")}\n\n答案：${l.quiz.answer + 1}。${l.quiz.explanation}\n\n`;
}
book +=
  "## 官方参考\n\n" +
  references.map((r) => `- [${r.title}](${r.url})：${r.note}`).join("\n") +
  "\n";
fs.writeFileSync(path.join(root, "COURSEBOOK.md"), book);
fs.mkdirSync(path.join(root, "downloads"), { recursive: true });
const script = `import pathlib,sys,zipfile
root=pathlib.Path(sys.argv[1])
plans=[('forest-survivor.zip',['project'],'forest-survivor'),('forest-starter.zip',['starter'],'my-first-pixel'),('learning-materials.zip',['README.md','BUILD-YOUR-OWN.md','COURSEBOOK.md','course.js'],'learning-materials')]
for filename,includes,prefix in plans:
 with zipfile.ZipFile(root/'downloads'/filename,'w',zipfile.ZIP_DEFLATED) as z:
  for name in includes:
   entry=root/name
   for f in sorted(entry.rglob('*')) if entry.is_dir() else [entry]:
    if f.is_file():
     rel=f.relative_to(entry) if entry.is_dir() else pathlib.Path(f.name)
     z.write(f,str(pathlib.Path(prefix)/rel))
 print(filename)
with zipfile.ZipFile(root/'downloads'/'interactive-course.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(root.rglob('*')):
  rel=f.relative_to(root)
  if f.is_file() and rel.parts[0] not in ['node_modules','downloads','.git'] and '__pycache__' not in rel.parts:
   z.write(f,str(pathlib.Path('little-worlds-academy')/rel))
 for filename in ['forest-survivor.zip','forest-starter.zip','learning-materials.zip']:
  z.write(root/'downloads'/filename,str(pathlib.Path('little-worlds-academy')/'downloads'/filename))
print('interactive-course.zip')
`;
execFileSync("python3", ["-c", script, root], { stdio: "inherit" });
console.log("文字课程、完整互动课与项目下载包已生成。");
