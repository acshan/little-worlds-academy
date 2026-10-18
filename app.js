import { acts, lessons, references } from "./course.js";
import { Lab, safeConfig } from "./labs.js";
import { SandboxedRunner } from "./runner.js";

const $ = (selector) => document.querySelector(selector);
const storageKey = "little-worlds-course-v1";
let storageAvailable = true;
let progress = { version: 1, lessons: {}, last: "welcome" };
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (
    saved?.version === 1 &&
    saved.lessons &&
    typeof saved.lessons === "object"
  )
    progress = saved;
} catch {
  storageAvailable = false;
}
let index = 0,
  lab = null,
  worker = null,
  timeout = null,
  renderVersion = 0,
  activeTab = "read";
const record = () =>
  (progress.lessons[lessons[index].id] ??= {
    notes: "",
    code: lessons[index].code,
    codePass: false,
    quizPass: false,
    completed: false,
  });
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  $("#save-status").textContent = storageAvailable
    ? "已自动保存在当前浏览器。也可以导出记录，避免清理数据后丢失。"
    : "浏览器暂时不允许保存。本次仍能学习，请导出记录备份。";
}
function download(name, text, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function renderNav() {
  const host = $("#lesson-list");
  host.replaceChildren();
  acts.forEach((name, act) => {
    const heading = document.createElement("p");
    heading.className = "act";
    heading.textContent = `0${act + 1} / ${name}`;
    host.append(heading);
    lessons.forEach((item, i) => {
      if (item.act !== act) return;
      const button = document.createElement("button");
      button.className = "lesson-link" + (i === index ? " active" : "");
      button.setAttribute("aria-current", i === index ? "step" : "false");
      button.dataset.lesson = item.id;
      const number = document.createElement("span");
      number.className = "num";
      number.textContent = String(i).padStart(2, "0");
      const title = document.createElement("span");
      title.textContent = item.title;
      const status = document.createElement("span");
      status.className = "check";
      status.textContent = progress.lessons[item.id]?.completed ? "✓" : "·";
      button.append(number, title, status);
      button.onclick = () => navigate(i);
      host.append(button);
    });
  });
  const done = lessons.filter(
    (item) => progress.lessons[item.id]?.completed,
  ).length;
  $("#progress-count").textContent =
    `${String(done).padStart(2, "0")} / ${lessons.length}`;
  $("#progress-bar").style.width = `${(done / lessons.length) * 100}%`;
}
function tab(name, focus = false) {
  activeTab = name;
  for (const button of document.querySelectorAll("[data-tab]")) {
    const selected = button.dataset.tab === name;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  }
  for (const panel of document.querySelectorAll("[role=tabpanel]"))
    panel.hidden = panel.id !== `panel-${name}`;
}
function status() {
  const r = record();
  $("#task-state").textContent = r.codePass ? "✓ 代码任务通过" : "尚未验证";
  $("#task-state").className = r.codePass ? "passed" : "";
  $("#complete").disabled = r.completed || !(r.codePass && r.quizPass);
  $("#complete").textContent = r.completed
    ? "这颗种子已点亮 ✳"
    : "收下这一课 ✓";
  $("#completion-text").textContent = r.completed
    ? "你已经完成本课。随时回来试新的参数，也可以继续探索下一课。"
    : r.codePass && r.quizPass
      ? "代码和理解都已验证，收下这一课，再继续前进。"
      : `还需要：${[!r.codePass ? "完成代码任务" : "", !r.quizPass ? "答对小测" : ""].filter(Boolean).join("、")}。`;
  $("#footer-status").textContent = r.completed
    ? "本课已点亮"
    : `${r.codePass ? "代码 ✓" : "代码 ○"} · ${r.quizPass ? "理解 ✓" : "理解 ○"}`;
}
function renderQuiz() {
  const item = lessons[index],
    r = record();
  $("#quiz-question").textContent = item.quiz.question;
  $("#quiz-options").replaceChildren();
  item.quiz.options.forEach((text, i) => {
    const button = document.createElement("button");
    button.textContent = `${String.fromCharCode(65 + i)}. ${text}`;
    if (r.quizPass && i === item.quiz.answer) button.className = "correct";
    button.onclick = () => {
      for (const other of $("#quiz-options").children) other.className = "";
      if (i === item.quiz.answer) {
        r.quizPass = true;
        button.className = "correct";
        $("#quiz-feedback").textContent = "✓ " + item.quiz.explanation;
      } else {
        button.className = "wrong";
        $("#quiz-feedback").textContent =
          "再想一下。这项选择没有解决本课讨论的问题；可以回到“理解”寻找线索。";
      }
      status();
      persist();
    };
    $("#quiz-options").append(button);
  });
  $("#quiz-feedback").textContent = r.quizPass
    ? "✓ " + item.quiz.explanation
    : "";
}
function renderControls(item) {
  const host = $("#controls");
  host.replaceChildren();
  for (const control of item.controls) {
    const row = document.createElement("div");
    row.className = "control-row";
    const label = document.createElement("label");
    label.htmlFor = `control-${control.key}`;
    label.append(document.createTextNode(control.label));
    const output = document.createElement("output");
    output.htmlFor = label.htmlFor;
    output.textContent =
      lab.config[control.key] ??
      item.config[control.key] ??
      {
        cameraHeight: 16,
        cameraAngle: 0,
        spriteScale: 1.2,
        enemySpeed: 1.5,
        spawnRate: 1.2,
        fireRate: 2,
        projectileSpeed: 12,
        pickupRadius: 1.8,
        damage: 1,
        enemyCap: 70,
        bossAt: 60,
      }[control.key] ??
      0;
    label.append(output);
    const input = document.createElement("input");
    input.id = label.htmlFor;
    input.type = "range";
    input.min = control.min;
    input.max = control.max;
    input.step = control.step;
    input.value = output.textContent;
    input.oninput = () => {
      output.textContent = input.value;
      lab.apply({ [control.key]: Number(input.value) });
    };
    row.append(label, input);
    host.append(row);
  }
  if (!item.controls.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent =
      "这一课用代码改变实验。切换到“动手”，试着运行你的第一个结果。";
    host.append(p);
  }
}
function render() {
  renderVersion++;
  stopWorker();
  lab?.dispose();
  const item = lessons[index],
    r = record();
  progress.last = item.id;
  $("#act-label").textContent = `第 ${item.act + 1} 阶段 · ${acts[item.act]}`;
  $("#lesson-number").textContent = `LESSON ${String(index).padStart(2, "0")}`;
  $("#lesson-title").textContent = item.title;
  $("#lesson-subtitle").textContent = item.subtitle;
  $("#lesson-goal").textContent = item.goal;
  $("#story").textContent = item.story;
  $("#reading").replaceChildren();
  item.sections.forEach((section) => {
    const h = document.createElement("h3");
    h.textContent = section.title;
    $("#reading").append(h);
    for (const text of section.paragraphs) {
      const p = document.createElement("p");
      p.textContent = text;
      $("#reading").append(p);
    }
  });
  $("#task-text").textContent = item.task;
  $("#code-editor").value = r.code ?? item.code;
  $("#solution-code").textContent = item.solution;
  $("#project-code").textContent = item.projectCode;
  $("#source-name").textContent = `project/${item.source}`;
  $("#source-full").hidden = true;
  $("#source-full").textContent = "";
  document.querySelectorAll("details").forEach((el) => (el.open = false));
  $("#hint-text").hidden = true;
  $("#hint-text").dataset.step = "0";
  $("#code-output").textContent = r.codePass
    ? "上次的代码任务已通过。你仍可以修改并重新运行，观察不同结果。"
    : "这里会显示真正运行后的结果。";
  $("#code-output").className = "console";
  $("#notes").value = r.notes ?? "";
  $("#previous").disabled = index === 0;
  $("#next").disabled = index === lessons.length - 1;
  $("#lab-status").textContent = "先预测结果，再动手验证。";
  lab = new Lab(
    $("#lab"),
    item,
    (text) => ($("#lab-status").textContent = text),
  );
  // Show controls using their true live defaults, not a separate UI-only preset.
  if (lab.game) Object.assign(lab.config, lab.game.world.config);
  renderControls(item);
  renderQuiz();
  renderNav();
  status();
  tab("read");
  persist();
  document.title = `${String(index).padStart(2, "0")} ${item.title} · 微光游戏工坊`;
}
function navigate(i) {
  index = Math.max(0, Math.min(lessons.length - 1, i));
  const id = lessons[index].id;
  if (location.hash.slice(1) !== id) {
    location.hash = id;
    return;
  }
  render();
  $("#syllabus").classList.remove("open");
  if (window.innerWidth < 640)
    $("#lesson").scrollIntoView({
      block: "start",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
}
function stopWorker() {
  clearTimeout(timeout);
  worker?.terminate();
  worker = null;
  $("#run-code").disabled = false;
}
async function runCode() {
  stopWorker();
  const item = lessons[index],
    r = record(),
    generation = renderVersion;
  r.code = $("#code-editor").value;
  r.codePass = false;
  status();
  persist();
  if (r.code.length > 16000) {
    $("#code-output").textContent =
      "这段练习太长了，请保持在 16,000 个字符以内。";
    return;
  }
  const button = $("#run-code");
  button.disabled = true;
  $("#code-output").className = "console";
  $("#code-output").textContent = "代码正在独立 Worker 中运行……";
  worker = new SandboxedRunner();
  const fail = (text) => {
    if (generation !== renderVersion) return;
    stopWorker();
    $("#code-output").className = "console error";
    $("#code-output").textContent = text;
    status();
  };
  timeout = setTimeout(
    () =>
      fail(
        "运行超过 1.2 秒，已停止这次代码。\n检查是否写了没有出口的 while/for 循环。页面和学习记录仍然安全。",
      ),
    1200,
  );
  worker.onerror = (e) => {
    e.preventDefault();
    fail("代码运行失败：" + e.message);
  };
  worker.onmessage = ({ data }) => {
    if (generation !== renderVersion) return;
    if (!data.ok) {
      fail(
        (data.logs ?? []).join("\n") +
          "\n" +
          (data.error ?? "返回的数据无法读取"),
      );
      return;
    }
    try {
      if (
        !data.result ||
        typeof data.result !== "object" ||
        Array.isArray(data.result)
      )
        throw Error("请返回一个对象，例如 return { speed: 5 };");
      const output = JSON.stringify(data.result, null, 2);
      if (output.length > 100000)
        throw Error("结果太大了，请只返回本课需要的数据。");
      safeConfig(data.result);
      lab.apply(data.result);
      r.codePass = Boolean(item.test(data.result));
      const message =
        (data.logs?.length ? data.logs.join("\n") + "\n\n" : "") +
        output +
        "\n\n" +
        (r.codePass
          ? "✓ 挑战通过！去“检验”回答一个小问题。"
          : "还差一点：代码运行成功，但结果没有满足本课任务。对照任务要求，再试一次。");
      stopWorker();
      $("#code-output").textContent = message;
      $("#code-output").className = "console";
      status();
      persist();
      renderNav();
      // Keep exact result-driven values visible in sliders too.
      for (const control of item.controls) {
        const input = $(`#control-${control.key}`);
        if (input && Object.hasOwn(data.result, control.key)) {
          input.min = Math.min(Number(input.min), data.result[control.key]);
          input.max = Math.max(Number(input.max), data.result[control.key]);
          input.value = data.result[control.key];
          input.previousElementSibling.querySelector("output").textContent =
            String(data.result[control.key]);
        }
      }
    } catch (error) {
      fail(error.message);
    }
  };
  worker.postMessage({ code: r.code, config: { ...lab.config } });
}
for (const button of document.querySelectorAll("[data-tab]"))
  button.onclick = () => tab(button.dataset.tab);
for (const button of document.querySelectorAll("[data-go]"))
  button.onclick = () => tab(button.dataset.go, true);
$(".lesson-tabs").addEventListener("keydown", (e) => {
  const tabs = [...document.querySelectorAll("[data-tab]")],
    current = tabs.findIndex((b) => b === document.activeElement);
  if (current < 0) return;
  let next;
  if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
  if (e.key === "ArrowLeft") next = (current + tabs.length - 1) % tabs.length;
  if (e.key === "Home") next = 0;
  if (e.key === "End") next = tabs.length - 1;
  if (next !== undefined) {
    e.preventDefault();
    tab(tabs[next].dataset.tab, true);
  }
});
$("#run-code").onclick = runCode;
$("#code-editor").oninput = () => {
  const r = record();
  r.code = $("#code-editor").value;
  r.codePass = false;
  status();
  persist();
};
$("#code-editor").addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    runCode();
  }
});
$("#reset-code").onclick = () => {
  $("#code-editor").value = lessons[index].code;
  record().code = $("#code-editor").value;
  record().codePass = false;
  status();
  persist();
};
$("#hint").onclick = () => {
  const hints = [
    "先读任务里要求的字段名与数值。编辑器最后的 return 决定实际返回什么。",
    "把鼠标放在变量名上读一遍：这是位置、速度、时间，还是一个 true/false？先打印中间值：console.log(变量)。",
    "下面的“参考答案”给出一种可运行的写法。读懂后放进编辑器运行，再改一个值观察变化。",
  ];
  const box = $("#hint-text");
  const step = Number(box.dataset.step ?? 0);
  box.hidden = false;
  box.textContent = hints[Math.min(step, hints.length - 1)];
  box.dataset.step = String(step + 1);
};
$("#use-solution").onclick = () => {
  $("#code-editor").value = lessons[index].solution;
  record().code = $("#code-editor").value;
  record().codePass = false;
  status();
  persist();
  $("#code-editor").focus();
};
$("#notes").oninput = () => {
  record().notes = $("#notes").value.slice(0, 40000);
  persist();
};
$("#complete").onclick = () => {
  const r = record();
  if (!(r.codePass && r.quizPass)) return;
  r.completed = true;
  r.completedAt = new Date().toISOString();
  persist();
  renderNav();
  status();
};
$("#previous").onclick = () => navigate(index - 1);
$("#next").onclick = () => navigate(index + 1);
$("#outline-toggle").onclick = () => $("#syllabus").classList.toggle("open");
$("#export-progress").onclick = () =>
  download("微光游戏工坊-学习记录.json", JSON.stringify(progress, null, 2));
$("#view-source").onclick = async () => {
  const target = $("#source-full");
  if (!target.hidden) {
    target.hidden = true;
    return;
  }
  target.hidden = false;
  target.textContent = "正在读取对应源码……";
  const generation = renderVersion;
  try {
    const response = await fetch(`./project/${lessons[index].source}`);
    if (!response.ok) throw Error("文件未找到");
    const text = await response.text();
    if (generation === renderVersion) target.textContent = text;
  } catch (error) {
    if (generation === renderVersion)
      target.textContent = "读取失败：" + error.message;
  }
};
for (const reference of references) {
  const a = document.createElement("a");
  a.href = reference.url;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = reference.title;
  const small = document.createElement("small");
  small.textContent = reference.note;
  a.append(small);
  $("#references").append(a);
}
window.addEventListener("hashchange", () => {
  const found = lessons.findIndex((item) => item.id === location.hash.slice(1));
  if (found >= 0) {
    index = found;
    render();
    $("#syllabus").classList.remove("open");
  }
});
window.addEventListener("pagehide", () => {
  persist();
  stopWorker();
  lab?.dispose();
});
const wanted = location.hash.slice(1) || progress.last;
index = Math.max(
  0,
  lessons.findIndex((item) => item.id === wanted),
);
render();
