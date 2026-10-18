# 微光游戏工坊 · 从零种出你的 3D 游戏

18 课互动课程的文字备份。可执行实验、实时反馈与学习记录，请启动互动版：node server.mjs，然后打开 http://127.0.0.1:4180/。

## 00 先做一款小而完整的游戏

阶段：出发之前

从玩家，变成世界的搭建者。

**本课目标**：知道终点是什么，也知道今天先做什么。

> 你收到一枚会发光的种子。90 秒后天亮，在森林里活下来，带它回家。这就是我们的第一款游戏《微光守林人》。

### 你最后会做出什么

一位能移动的像素守林人、一片真正的 3D 场地、追赶你的软泥怪、自动发射的光球、经验拾取、三选一强化、进化、一个精英敌人、暂停与结算。这些会连成一次 90 秒的完整对局。

这里借鉴的是 PokéBonk 的技术路线和玩法结构。角色图案由代码原创绘制，不需要先学习建模、美术，也不需要复制它的上千条压缩变量。

### 为什么不一开始就做所有东西

先做最小可玩版本（MVP）：玩家能移动，敌人能追，攻击能命中。确认有趣后再加成长。联网排行榜、商业支付、复杂编辑器是另一阶段的工程，本课先把一款单机浏览器小游戏做扎实。

### 怎么使用这本互动书

每课先读左侧的目标，再观察右侧实验。拖动参数，猜测结果，再写代码验证。点击“提示”逐步获得帮助；先独立尝试，再看参考答案。挑战和小测都通过后，可以点“收下这一课”。

你可以随时跳课、返回和重做，学习记录自动保存在当前浏览器。完全不会 JavaScript，就按顺序开始；已经会前端，可以从第 5 课进入 3D。建议每次学 1–2 课，加上练习约需 10–16 小时，允许更慢。

### 动手任务

把第一款游戏的单局长度改为 90 秒。不要先做无限世界。

起点：

```js
// 把一个大愿望，缩成一个可以完成的版本。
const duration = 600;
return { duration };
```

参考答案：

```js
const duration = 90;
return { duration };
```

### 项目代码片段

对应文件：project/README.md。下面是讲解片段，完整上下文见对应源文件。

```js
// 项目的第一张任务单
// 1. 能移动  2. 能战斗  3. 有成长  4. 有结局
// 每次只实现并验证一个目标。
```

### 理解检查

第一版最应该优先完成什么？

1. 一整局“开始—游玩—结算”
2. 先准备 151 个角色
3. 先做全球账号与战队

答案：1。闭合的体验让你尽早发现问题。内容和联网之后再增长。

## 01 先认识代码里的四位朋友

阶段：出发之前

变量、对象、函数、数组。够我们迈出第一步。

**本课目标**：能读懂一小段游戏状态，并修改它。

> 种子要往右走三格。我们先用几个数，记住它的位置和生命。

### 变量是贴着名字的小盒子

const speed = 5 表示给数字 5 起名叫 speed。let hp = 100 表示 hp 以后可以重新赋值；const 的绑定不能重新赋值，但 const 对象的属性仍可修改。每行末尾的分号帮助划清一句话。

数字不加引号，文字需要引号。true 和 false 是布尔值，分别表示是/否。// 后面是注释，写给人看，不参与执行。

### 对象是一张角色卡

const player = { x: 0, z: 0, hp: 100 }; 把相关信息装在一起。player.x 就是在这张卡上找 x 这一项。我们约定 x 是左右，z 是地面上的前后，y 留给高度。

### 函数和数组把动作组织起来

function heal(hp) { return hp + 10; } 定义一个动作；heal(50) 才是执行，结果是 60。return 把结果交给调用者。数组 [a, b, c] 保存多个敌人；for...of 可以逐个处理。现在不必背会全部语法，后面会重复使用。

右侧“运行代码”在一个独立 Worker 里执行 JavaScript。它没有页面 DOM，结果通过 return 返回。下方输出框会告诉你实际结果或出错位置。

### 动手任务

让角色位于 x=3、z=-2，保留 100 点生命。

起点：

```js
const player = { x: 0, z: 0, hp: 100 };
player.x = 1;
return player;
```

参考答案：

```js
const player = { x: 0, z: 0, hp: 100 };
player.x = 3;
player.z = -2;
return player;
```

### 项目代码片段

对应文件：project/src/state.js。下面是讲解片段，完整上下文见对应源文件。

```js
const player = { x: 0, z: 0, hp: 100 };
function takeDamage(amount) {
  player.hp = Math.max(0, player.hp - amount);
}
takeDamage(9); // hp 变成 91。
```

### 理解检查

const player = { hp: 100 } 之后，哪一句可以执行？

1. const 就意味着整个对象永远不能变化。
2. player.hp = 80;
3. player = { hp: 80 };

答案：2。const 锁定的是变量绑定，不是对象里的每个属性。

## 02 把工作台搭起来

阶段：出发之前

文件、浏览器与一个小服务器。

**本课目标**：能在自己的文件夹里启动一个网页项目。

> 一间小工坊只需要一张桌子。我们的桌子是编辑器，展台是浏览器。

### 先认清三个文件

index.html 是房间的骨架，CSS 是外观，JavaScript 是行为。结业项目的 <script type="module" src="./src/main.js"> 会从 main.js 出发，按 import 找到其他文件。import 路径里的 ./ 指当前文件夹，../ 指上一级。

### 启动你自己的项目

点击顶部“下载项目”，解压后在编辑器打开整个文件夹。电脑安装 Node.js 22 或更高版本后，在该文件夹的终端运行 npm run dev。终端会打印 http://127.0.0.1:4181/。打开它，再试着改 src/config.js 的 speed，保存并刷新。

如果 cd 一个含空格的路径，用引号包住，例如 cd "/path/My Game"。Windows 可在文件夹地址栏输入 powershell 后回车；macOS 可在终端输入 cd 再把文件夹拖进去。npm run dev 执行的是 package.json 里的 dev 命令。

### 为什么不能双击 HTML

模块和资源加载需要 HTTP 环境。file:// 下的跨文件请求可能受浏览器限制。localhost/127.0.0.1 是这台电脑；端口区分正在运行的不同服务。4180 是本教程，4181 是你的独立游戏。

修改后看不到变化：先保存、刷新，再打开浏览器开发者工具的 Console 看红色报错。找不到文件一般是路径/大小写不对；端口占用先检查是否已有同一个服务器，别反复开很多窗口。

### 动手任务

把 src/main.js 加进 files，并把独立游戏的端口设为 4181。

起点：

```js
const files = ["index.html", "style.css"];
return { files, port: 4180 };
```

参考答案：

```js
const files = ["index.html", "style.css", "src/main.js"];
return { files, port: 4181 };
```

### 项目代码片段

对应文件：project/index.html。下面是讲解片段，完整上下文见对应源文件。

```js
<!-- index.html -->
<canvas id="game" tabindex="0"></canvas>
<script type="module" src="./src/main.js"></script>

<!-- 终端：npm run dev，浏览器打开打印的本地地址 -->
```

### 理解检查

看到网页空白时，第一步怎么排查？

1. 立刻重装全部软件
2. 同时修改十处配置试运气
3. 先查看 Console 的第一个报错

答案：3。第一个错误经常会导致后续初始化都失败。从它开始，一次只改一处。

## 03 让一秒钟公平地流逝

阶段：让世界动起来

游戏循环与 delta time。

**本课目标**：理解游戏为什么要每帧更新，以及为什么不能每帧走固定距离。

> 慢电脑和快电脑里的种子，应该跑得一样快。

### 每一帧只做三件事

读输入 → 更新世界 → 把世界画出来。浏览器用 requestAnimationFrame 在合适的重绘时机调用下一帧。一次回调不是一秒，可能是 1/60 秒，也可能更久。

### 距离 = 速度 × 时间

如果 speed=5 米/秒，一帧过去 dt=0.0167 秒，就移动大约 0.0835 米。30 帧与 60 帧在同样一秒内都应移动 5 米。没有 dt 时，每帧加 5，快电脑反而跑得更快。

实验里改变假设的帧率，观察两条轨道：金色轨道按固定每帧距离计算，绿色轨道按经过时间计算。它们从同一点出发，却会在低帧率时分开。这里比较的是累计距离，不会改变浏览器实际的刷新率。

### 切后台回来不要瞬移

requestAnimationFrame 在后台可能被节流。用 Math.min(dt, 0.05) 限制一次模拟推进，避免恢复时跨越整个地图。这会丢弃一部分模拟时间，并不是精确回放；更严格的物理系统会用固定步长和累积器，后面性能课再区分。

### 动手任务

给每帧的移动乘上正确 dt，使 30 帧和 60 帧的“一秒总距离”都等于 5。

起点：

```js
const speed = 5;
const distance30 = speed * 30;
const distance60 = speed * 60;
return { distance30, distance60 };
```

参考答案：

```js
const speed = 5;
const distance30 = speed * (1 / 30) * 30;
const distance60 = speed * (1 / 60) * 60;
return { distance30, distance60 };
```

### 项目代码片段

对应文件：project/src/game.js。下面是讲解片段，完整上下文见对应源文件。

```js
let last = 0;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
  last = now;
  world.update(dt, input.read());
  view.sync(world);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
```

### 理解检查

dt 的单位在本项目中是什么？

1. 秒
2. 帧数
3. 像素

答案：1。时间单位必须统一。requestAnimationFrame 给毫秒，项目在入口除以 1000。

## 04 把方向交给玩家

阶段：让世界动起来

按键、向量与斜向移动。

**本课目标**：实现 WASD，并防止斜着走快出一截。

> 种子学会听指挥了。不过它偷偷发现：同时按两键，好像更快？

### 按键事件不是移动本身

keydown 记住“按住了”，keyup 删除标记；每帧读取这组状态来移动。不要用键盘自动重复的频率推进角色，它取决于系统设置。点击实验画布后按 WASD/方向键试试。

### 方向是一个小箭头

向右是 (1,0)，向前是 (0,-1)，右前方是 (1,-1)。最后一个箭头长度为 √2，所以未经处理时斜着走快约 41%。normalize（归一化）把箭头长度缩成 1，保留方向。

Math.hypot(x,z) 计算长度。如果长度为 0，直接返回零向量；不要除以 0。位置的更新仍然要乘 speed 和 dt。

### 输入需要清理

切换窗口或打开弹层时，keyup 可能没送到原控件。blur/暂停时清掉按键，可以避免“松开键还一直跑”。让画布可聚焦，并只在操作画布时拦截方向键，编辑代码时就不会误操控角色。

### 动手任务

返回归一化后的 x、z：长度应为 1，并把 normalize 设为 true。

起点：

```js
const x = 1, z = -1;
const length = Math.hypot(x, z);
return { x, z, normalize: false, length };
```

参考答案：

```js
const x = 1, z = -1;
const length = Math.hypot(x, z);
return { x: x / length, z: z / length, normalize: true };
```

### 项目代码片段

对应文件：project/src/input.js。下面是讲解片段，完整上下文见对应源文件。

```js
const v = direction(input.x, input.z);
player.x += v.x * speed * dt;
player.z += v.z * speed * dt;

// direction 位于 math.js
const length = Math.hypot(x, z);
return length > 0 ? {x:x/length, z:z/length} : {x:0,z:0};
```

### 理解检查

角色没有任何输入时，归一化应该怎么做？

1. 把速度设为无限大
2. 返回 (0,0)，不要除以 0
3. 一直向右移动

答案：2。零向量没有方向。先检查长度，再做除法。

## 05 点亮第一个三维世界

阶段：走进三维森林

场景、相机、渲染器与网格。

**本课目标**：用 Three.js 理解“世界里有什么”和“从哪里看”。

> 刚才的纸面坐标，变成了可以看出远近的草地。

### 三个核心对象

Scene 像舞台，存放物体。PerspectiveCamera 像摄影机，决定观看位置和视角。WebGLRenderer 把相机看到的场景画到 canvas 上。Three.js 是 JavaScript 的 3D 渲染库，不会自动替你实现敌人、升级和存档。

### 几何体 × 材质 = 看得到的网格

Geometry 决定形状，Material 决定表面。new THREE.Mesh(geometry, material) 把二者结合。PlaneGeometry 默认立在 XY 平面；旋转 -Math.PI/2 后平躺在 XZ 地面。MeshStandardMaterial 需要光照，否则可能是黑的。

本课使用 PerspectiveCamera(48, aspect, 0.1, 100)。aspect 是宽/高，near 和 far 是可见距离边界。先把相机放在 (0,16,15)，lookAt(0,0,0)。

### 尺寸变化也要告诉相机

窗口/实验区尺寸变化时，更新 renderer.setSize，修改 camera.aspect，并调用 updateProjectionMatrix。设备像素比可以提高锐度，也增加 GPU 负担，本项目限制到 1.5。右侧调高相机，感受构图如何变化。

### 动手任务

把相机高度调为 18，并打开 grid，观察 XZ 地面的网格。

起点：

```js
return { cameraHeight: 4, grid: false };
```

参考答案：

```js
return { cameraHeight: 18, grid: true };
```

### 项目代码片段

对应文件：project/src/view.js。下面是讲解片段，完整上下文见对应源文件。

```js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas });
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(56, 56),
  new THREE.MeshStandardMaterial({ color: "#70956c" })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
camera.position.set(0, 16, 15);
camera.lookAt(0, 0, 0);
```

### 理解检查

Three.js 会自动帮你实现怪物追踪吗？

1. 会，只要创建 Scene
2. 会，只要使用透视相机
3. 不会，它主要负责渲染

答案：3。游戏规则是你写的。渲染只把状态变成画面。

## 06 让像素角色站进森林

阶段：走进三维森林

Billboard：一张图片也能有立体旅程。

**本课目标**：理解 Sprite、透明贴图、锚点和像素过滤。

> 不需要先学雕刻。一颗 16×16 的小种子，就可以成为你的主角。

### 它不一定是完整的三维模型

THREE.Sprite 是始终面向相机的平面，通常贴一张带透明背景的图。它能在三维空间里移动、与地形产生远近和遮挡。我们用真正的三维地面与场景，搭配二维像素角色，获得类似 PokéBonk 的混合观感。

### 像素不要被抹成奶油

CanvasTexture 可以把画在 canvas 上的图变成贴图。magFilter 和 minFilter 用 NearestFilter 时，放大会保留像素块。Sprite 的 center 控制锚点；把 center.y 靠近脚底，角色更容易站稳。

本项目的 art.js 用字符矩阵绘制原创小种子和软泥怪。字母表示颜色，点表示透明。之后你可以替换成自己绘制的 PNG，再增加动画图集。

### 下一步才是多方向动画

完整角色动画通常用一张 atlas，把行列切成单帧，通过 texture.offset/repeat 选帧。走路方向与相机方位共同决定显示哪一行。先做静态 Sprite，再加两帧呼吸，最后加多方向；一步步验证。THREE.Sprite 本身不会投射真实阴影，可以另放脚下椭圆影。

### 动手任务

把角色大小设为 1.6，观察它变大时脚下的位置是否保持稳定。

起点：

```js
const spriteScale = 0.4;
return { spriteScale };
```

参考答案：

```js
return { spriteScale: 1.6 };
```

### 项目代码片段

对应文件：project/src/art.js。下面是讲解片段，完整上下文见对应源文件。

```js
const texture = new THREE.CanvasTexture(pixelCanvas);
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
const material = new THREE.SpriteMaterial({ map: texture });
const hero = new THREE.Sprite(material);
hero.center.set(0.5, 0.12);
hero.scale.setScalar(1.2);
scene.add(hero);
```

### 理解检查

为什么使用 NearestFilter？

1. 保留像素块的清晰边缘
2. 让角色自动拥有碰撞
3. 让贴图变成立体模型

答案：1。过滤决定图像缩放时怎样取样，不决定物理形状。

## 07 给森林安排一点麻烦

阶段：做出游戏的乐趣

生成、追踪与刷新节奏。

**本课目标**：创建敌人数组，并让每个敌人朝玩家移动。

> 软泥怪从林间走来。它们不聪明，但数量会制造压力。

### 先保存状态，再考虑画出来

一个敌人可以只是 { id, x, z, hp, speed, radius }。把它放进 enemies 数组，每帧逐个更新。显示用的 Sprite 放在渲染层；不要依赖 Sprite 的颜色判断敌人是否还活着。

### 追踪就是另一个方向向量

目标减自己得到方向，再归一化：direction(player.x-enemy.x, player.z-enemy.z)。用敌人速度乘 dt 更新位置。这是直接追踪，还没有绕障碍的寻路，不能把它当作导航网格。

刷新用 spawnClock += dt * spawnRate；每累计到 1 就生成一个。spawnRate 的单位是“每秒几个”，和每帧随机丢一个骰子相比，更容易比较与调平衡。生成位置放在玩家周围的圆环上，避免直接出现在脚下。

### 数量也是一种设计参数

先保持敌人比玩家慢，让玩家有机会理解走位。数量上限保护性能，但如果用上限改变了排名规则，就需要统一模拟规则。右侧打开后点“开始实验”，试着移动，不会受到伤害。

### 动手任务

让敌人每秒出现 1.5 个，速度设为 1.2；先给新玩家留出反应空间。

起点：

```js
return { spawnRate: 0.2, enemySpeed: 6 };
```

参考答案：

```js
return { spawnRate: 1.5, enemySpeed: 1.2 };
```

### 项目代码片段

对应文件：project/src/state.js。下面是讲解片段，完整上下文见对应源文件。

```js
spawnClock += dt * spawnRate;
while (spawnClock >= 1) {
  spawnClock -= 1;
  if (enemies.length < enemyCap) spawnEnemy();
}
for (const enemy of enemies) {
  const d = direction(player.x - enemy.x, player.z - enemy.z);
  enemy.x += d.x * enemy.speed * dt;
  enemy.z += d.z * enemy.speed * dt;
}
```

### 理解检查

敌人的追踪方向应该怎样计算？

1. 始终沿 x 轴向右
2. 玩家位置减敌人位置，再归一化
3. 每帧把敌人瞬移到玩家脚下

答案：2。差向量指向目标，归一化使距离不直接改变速度。

## 08 让光球自动找到目标

阶段：做出游戏的乐趣

最近目标、冷却与弹丸。

**本课目标**：完成自动攻击，并分清射速和弹速。

> 你负责走位，种子负责回击。两种动作第一次配合起来了。

### 选择目标

遍历活着的敌人，记录与玩家距离最小的那个。目标为空时别发射。先用朴素线性搜索就够；不要一开始给几十个敌人设计复杂树结构。

### 弹丸有自己的生命

创建 {x,z,vx,vz,damage,life}。目标减玩家的归一化方向乘 projectileSpeed，得到 vx/vz。每帧更新弹丸的位置，同时 life -= dt；生命归零就从数组移除。

这个弹丸不是每帧继续追踪目标的导弹：发射时确定方向，之后沿直线飞。敌人走动可能使它落空，这是两种不同的设计。

### 冷却像一个小闹钟

fireClock 每秒减少，<=0 且有目标时射击，再设为 1/fireRate。fireRate=2 表示每秒两发、间隔 0.5 秒。projectileSpeed 决定飞得多快，不决定每秒发几颗。

### 动手任务

设为每秒 4 发，并返回正确 cooldown（秒）。

起点：

```js
const fireRate = 1;
return { fireRate, cooldown: fireRate };
```

参考答案：

```js
const fireRate = 4;
return { fireRate, cooldown: 1 / fireRate };
```

### 项目代码片段

对应文件：project/src/state.js。下面是讲解片段，完整上下文见对应源文件。

```js
fireClock -= dt;
if (fireClock <= 0) {
  const target = nearest(player, enemies);
  if (target) {
    const d = direction(target.x - player.x, target.z - player.z);
    shots.push({ x: player.x, z: player.z, vx: d.x * 12, vz: d.z * 12, damage: 1, life: 2 });
    fireClock = 1 / fireRate;
  }
}
```

### 理解检查

增加 projectileSpeed 会直接增加发射频率吗？

1. 会，它们是同一参数
2. 会，所有速度都一样
3. 不会，发射频率由 fireRate 控制

答案：3。弹速、射速、伤害需要分别命名与调整，才能知道改动了什么。

## 09 命中了，为什么没反应？

阶段：做出游戏的乐趣

碰撞、伤害与清理。

**本课目标**：把“看起来碰到了”变成明确的规则。

> 一颗光球穿过软泥怪。我们要决定：哪一刻才叫命中？

### 用简单形状近似

我们的世界主要在 XZ 地面活动，用圆形碰撞就够。两点距离小于半径之和则重叠。贴图的透明边缘与碰撞圆不必完全一致，适当缩小玩家受击范围通常更友好。

### 命中是一串有顺序的事

检测 → 扣 hp → 标记弹丸结束 → 敌人 hp<=0 时发出击败事件 → 掉经验 → 清理数组。不要一边正向 for 循环一边随意 splice，容易跳过下一个对象；标记后统一 filter 更容易读懂。

高速弹丸可能在一帧从敌人一侧走到另一侧，两个端点都没重叠，称为穿隧。完整项目检查弹丸这一帧扫过的线段到敌人的最近距离；本课先从简单圆形重叠开始理解。

### 玩家需要受击间隔

重叠往往持续许多帧。如果每帧扣 9 点，60 FPS 时瞬间扣光。hurtCooldown=0.7 意味着两次接触伤害至少间隔 0.7 秒。画面闪烁只是反馈，真正控制规则的是这个计时器。

### 动手任务

修正 hit 的判断，使用双方半径之和，并把攻击 damage 设为 2。

起点：

```js
const distance = 0.6;
const playerRadius = 0.5;
const enemyRadius = 0.45;
return { hit: distance < playerRadius, damage: 1 };
```

参考答案：

```js
const distance = 0.6;
const playerRadius = 0.5, enemyRadius = 0.45;
return { hit: distance < playerRadius + enemyRadius, damage: 2 };
```

### 项目代码片段

对应文件：project/src/state.js。下面是讲解片段，完整上下文见对应源文件。

```js
if (distance(enemy, player) < enemy.radius + player.radius && player.hurtCooldown <= 0) {
  player.hp = Math.max(0, player.hp - 9);
  player.hurtCooldown = 0.7;
}
player.hurtCooldown = Math.max(0, player.hurtCooldown - dt);
enemies = enemies.filter(enemy => enemy.hp > 0);
```

### 理解检查

为什么要有 hurtCooldown？

1. 避免同一次重叠每帧都扣血
2. 让敌人永远不会命中
3. 让画面帧率更高

答案：1。这是战斗规则的时间间隔，不是渲染优化。

## 10 把一次胜利变成一个选择

阶段：做出游戏的乐趣

经验、等级与三选一。

**本课目标**：让“移动和射击”长出构筑乐趣。

> 散落的微光聚成第一次升级。你要更锋利、更迅捷，还是先恢复体力？

### 经验是一种可拾取的对象

敌人被击败时，留下 {x,z,value}。玩家距离小于 pickupRadius 时收集，xp += value，再删除经验对象。这样玩家会为了收益主动调整路线，移动就不只是逃跑。

### 升级时暂停整个模拟

当 xp>=xpNext，扣除门槛，level++，把 phase 设为 upgrade。update 开头检查 phase；不是 play 就直接 return。因此敌人、弹丸、倒计时都会暂停，玩家可以安心阅读。

三选一最好都是可理解的取舍。本项目提供每发伤害+1、每秒发射+0.5、回复35生命。先用固定选项做通流程，再引入随机池、稀有度和协同。

### 让选项说清实际改变

不要只写“加强力量”。写清 damage:1→2，或者 fireRate:2→2.5。回复满血时没有收益，也可以显示提醒。本实验增加拾取范围，让你更容易触发一次升级；可以移动去接住地面的青色晶体。

### 动手任务

把伤害从 1 加到 2，并将 pickupRadius 设为 4。然后在实验里实际触发一次升级。

起点：

```js
const oldDamage = 1;
const newDamage = oldDamage;
return { damage: newDamage, pickupRadius: 1 };
```

参考答案：

```js
const oldDamage = 1;
return { damage: oldDamage + 1, pickupRadius: 4 };
```

### 项目代码片段

对应文件：project/src/state.js。下面是讲解片段，完整上下文见对应源文件。

```js
if (distance(gem, player) < pickupRadius) {
  xp += gem.value;
  gem.collected = true;
}
if (xp >= xpNext) {
  xp -= xpNext; level++; xpNext += 3;
  phase = "upgrade";
}
// 用户选完卡片后：修改属性，再让 phase = "play"。
```

### 理解检查

出现升级选项时，敌人应该怎么办？

1. 只停止画面，后台继续扣血
2. 跟随整个模拟一起暂停
3. 保持行动，逼玩家读得更快

答案：2。暂停渲染与暂停模拟不是一回事。规则要停在 update 的入口。

## 11 让成长被看见

阶段：做出游戏的乐趣

进化门槛、表现与一次性事件。

**本课目标**：让进化既改变外观，也改变规则，并且只触发一次。

> 第三次绽放后，小种子长成了金色的守林人。它不是只换了张皮肤。

### 不要每帧反复发奖

条件 level>=3 在之后所有帧都成立。如果每帧都 damage+=1，伤害会爆炸。用 evolved 标志或明确的进化状态，只在第一次跨过门槛时触发一次。

### 把逻辑和表演分开

逻辑：evolved=true、damage+=1。表现：换贴图、体型增加、播放声音和文字。这两部分通过事件联系。动画失败不应该使成长重复发放；暂停也不应重新触发。

我们用原创金色像素版本替换主角材质，并增加体型。真正的多阶段进化可用数据表 { atLevel, nextForm, bonus }，而不在每个 UI 页面再写一份门槛。

### 进化不一定只加数值

可以改变攻击形状、发射方式、移动方式。先确保本次进化可以明显感知，再思考下一层复杂度。右侧保留完整经验系统，试着到达 Lv.3；也可以查看“项目里怎么写”的门槛逻辑。

### 动手任务

修正门槛，让 Lv.3 可以首次进化，并开启 evolution。

起点：

```js
const level = 3;
const evolved = false;
const shouldEvolve = level > 3 && !evolved;
return { shouldEvolve, evolution: false };
```

参考答案：

```js
const level = 3, evolved = false;
return { shouldEvolve: level >= 3 && !evolved, evolution: true };
```

### 项目代码片段

对应文件：project/src/state.js。下面是讲解片段，完整上下文见对应源文件。

```js
if (config.evolution && level >= 3 && !evolved) {
  evolved = true;
  config.damage += 1;
  emit("evolve");
}
// View 只读状态：
hero.material = world.evolved ? materials.evolved : materials.hero;
```

### 理解检查

为什么必须检查 !evolved？

1. 否则角色会消失
2. 提高贴图分辨率
3. 避免条件持续成立时反复增加奖励

答案：3。这是一次性事件的常见防重方式。任务奖励、成就领取也有类似问题。

## 12 给旅程一个高潮和终点

阶段：做出游戏的乐趣

时间轴、精英与胜负条件。

**本课目标**：做完一局游戏，而不是只做一段无限循环。

> 林中的大软泥怪出现了。天亮之前，先学会守住最后一段路。

### 关卡先是一张时间表

0 秒开始、逐步增加压力、60 秒出现精英、90 秒结束。这是最小的导演系统。把时间写在配置里，而不是散落在多个界面。精英可以先只是更大半径、更高 hp 和不同速度，等流程稳定再加攻击预警。

### 定义胜利，而不是让玩家猜

本项目目标是活到 duration，精英只是额外压力，不要求击败精英才算胜利。若你希望改成必须击败精英，应同时修改胜利条件、界面任务和测试，不要只改一处文字。

时间到了设为 won，hp<=0 则 over。把终局规则放在同一个地方，确保同一帧既死亡又到时如何判定是明确的。本项目优先检查死亡。

### 节奏可以比内容量更重要

先观察空闲、紧张、恢复、高潮四种状态是否交替。不能只每十秒把敌人数量乘二；成长速度与压力一起调整，一次改一个参数。实验将关卡缩到 30 秒，你不需要等很久。

### 动手任务

做一个测试用短关卡：30 秒结束，第 20 秒出现精英。

起点：

```js
return { duration: 90, bossAt: 60, boss: true };
```

参考答案：

```js
return { duration: 30, bossAt: 20, boss: true };
```

### 项目代码片段

对应文件：project/src/state.js。下面是讲解片段，完整上下文见对应源文件。

```js
if (config.boss && !bossSpawned && time >= config.bossAt) {
  spawn(true); bossSpawned = true;
}
if (player.hp <= 0) phase = "over";
else if (time >= config.duration) phase = "won";
```

### 理解检查

只把胜利提示改成“击败精英”，规则没变，会发生什么？

1. 玩家看到的目标与实际判定不一致
2. 精英会自动变强
3. 关卡会自动变长

答案：1。规则、提示和验证需要围绕同一个目标。

## 13 让菜单和战斗不再打架

阶段：完成并交付

状态机、暂停与界面。

**本课目标**：把什么时候能做什么，写成清楚的约束。

> 读升级卡的时候，森林应该等你。

### 给状态起名字

ready（准备）、play（游玩）、paused（暂停）、upgrade（选择）、over（失败）、won（胜利）。状态机就是一组允许的状态与切换路径，不是某个神秘框架。

### 一个入口控制是否更新

World.update 第一行 if (phase !== "play") return。界面只读 world 来显示生命、时间与弹层；点击按钮调用 game.pause 或 chooseUpgrade，再由规则改变状态。不要在按钮里直接扣敌人的 hp。

浏览器进入后台自动暂停，恢复可见时等待玩家继续。重开要清掉敌人、弹丸、经验、计时器、按键和本局标志；永久记录不应一起重置。

### HUD 是玩家的第二双眼睛

首先告诉玩家：还能承受多少伤害、下一步目标是什么、重要能力是否可用。用文字与形状辅助颜色；让血条变化和数字一致。升级、开始和结算按钮都应可键盘操作，焦点不要掉到不可见背景。

### 动手任务

仅当 phase 是 play 时才让 shouldUpdate 为 true。当前 upgrade 应返回 false。

起点：

```js
const phase = "upgrade";
const shouldUpdate = true;
return { shouldUpdate };
```

参考答案：

```js
const phase = "upgrade";
return { shouldUpdate: phase === "play" };
```

### 项目代码片段

对应文件：project/src/game.js。下面是讲解片段，完整上下文见对应源文件。

```js
pause() {
  if (world.phase === "play") world.phase = "paused";
  else if (world.phase === "paused") world.phase = "play";
  input.clear();
}
// world.update 内：
if (this.phase !== "play") return;
```

### 理解检查

暂停时只停止 renderer.render，后台规则继续 update，会怎样？

1. 只会影响音量
2. 画面不动，但角色仍可能受伤和死亡
3. 游戏就正确暂停了

答案：2。真正的暂停要停止模拟推进。可以继续渲染静止世界。

## 14 把成果带到下一次打开

阶段：完成并交付

本地存档、版本与线上边界。

**本课目标**：学会保存小型进度，并正确理解“本地”和“云端”的区别。

> 明天再回来，森林会记得你曾经点亮过的微光。

### localStorage 保存的是文字

先 JSON.stringify 把对象变成文本，读取后 JSON.parse 还原。加 version 字段，未来改字段时知道如何迁移。读写可能失败，例如存储受限、数据损坏；用 try/catch 和合理默认值。

教程记录学习进度、笔记和上次停留的课程。独立项目只保存“历史最佳击败数”和“完成局数”，不保存半途对局，所以刷新会开新局。数据只在当前浏览器/站点，清理站点数据就可能丢失。

### 只在明确的时刻保存

不要每帧写本地存储。最好在领取、结算、设置改变时写。结算状态可能每帧都被 UI 观察到，用本局 settled 标志避免反复累计完成局数。

### 什么时候需要真正的后端

跨设备云存档、账号、多人经济和可信排行榜需要服务器。客户端提交“我打了十亿伤害”不能直接信任；需要对局票据、校验、幂等结算和数据库事务。这是进阶路线，本课没有假装本地数据等于安全联网系统。

### 动手任务

加入 version:1，并把 best 设为 25，返回序列化后的 text。

起点：

```js
const save = { best: 12 };
const text = JSON.stringify(save);
return { text };
```

参考答案：

```js
const save = { version: 1, best: 25 };
return { text: JSON.stringify(save) };
```

### 项目代码片段

对应文件：project/src/save.js。下面是讲解片段，完整上下文见对应源文件。

```js
function load() {
  try {
    const save = JSON.parse(localStorage.getItem("forest-save"));
    if (save?.version === 1) return save;
  } catch {}
  return { version: 1, best: 0, runs: 0 };
}
localStorage.setItem("forest-save", JSON.stringify(save));
```

### 理解检查

localStorage 中的分数可以直接用作可信的全球排行榜吗？

1. 能，JSON 会自动加密
2. 能，只要把按钮藏起来
3. 不能，用户可以修改客户端数据

答案：3。序列化不是加密，隐藏界面也不是安全边界。

## 15 当一百只怪物走进森林

阶段：完成并交付

先测量，再优化。

**本课目标**：理解 draw call、对象数量与规则复杂度。

> 森林越来越热闹，但优化不应该先从重写整个引擎开始。

### 先找到是哪一部分慢

CPU 可能忙着查询碰撞，GPU 可能忙着画很多透明物体，内存可能被不断创建的对象占满。平均 FPS 会藏起长帧，记录场景、实体数量、帧时间与设备，才能比较改动。实验计数来自实际模拟对象与 renderer.info，不是预填的性能成绩。

### 从朴素实现走向清楚的优化

每颗弹丸检查每个敌人，是 O(弹丸数×敌人数)。几十个时清楚可靠；很多时可以用空间网格，只查邻近格子。对象池复用已结束的对象，降低垃圾回收压力。先保持可读的基线，再针对热点替换。

画许多相同草叶可以用 InstancedMesh，分享几何体和材质；项目已经用它画 300 株草。Sprite 角色仍是逐对象渲染，适合教学规模，不等于已经实现 PokéBonk 的精灵批处理。

### 优化不能悄悄改变竞技规则

降低分辨率、减少装饰是画质；减少参与战斗的敌人可能改变难度。二者要分别命名。销毁关卡时还要 dispose 不再使用的几何体、材质和纹理，否则只是从场景移除并不会自动释放全部 GPU 资源。

### 动手任务

计算朴素碰撞一帧最多需要比较多少次（40×100），再把实验敌人上限设为 40。

起点：

```js
const bullets = 40, enemies = 100;
return { comparisons: bullets + enemies, enemyCap: 200 };
```

参考答案：

```js
const bullets = 40, enemies = 100;
return { comparisons: bullets * enemies, enemyCap: 40 };
```

### 项目代码片段

对应文件：project/src/view.js。下面是讲解片段，完整上下文见对应源文件。

```js
const grass = new THREE.InstancedMesh(geometry, material, 300);
for (let i = 0; i < 300; i++) {
  matrix.makeTranslation(x[i], 0.1, z[i]);
  grass.setMatrixAt(i, matrix);
}
scene.add(grass);
// 不再使用时：geometry.dispose(); material.dispose();
```

### 理解检查

降低画质时，哪个改动更直接属于渲染优化？

1. 降低像素比并减少装饰
2. 给玩家伤害翻倍
3. 把怪物生命减半

答案：1。后两者改变战斗规则。性能与难度要分开讨论。

## 16 给世界一点回应

阶段：完成并交付

声音、触屏与舒适度。

**本课目标**：让反馈服务操作，并照顾不同设备和玩家。

> 拾起一粒微光，听见轻轻的一声“叮”。世界终于回了你一句话。

### 先有事件，再播放反馈

规则发出 pickup/hurt/evolve 事件，声音和画面去响应它。这样关闭声音不会影响经验增加，也不会因为动画没播完卡住结算。Web Audio 通常需要用户手势才能启用，在点击开始时创建/恢复 AudioContext。

### 触屏不是把键盘藏起来

独立项目提供屏幕方向键，按住移动、松开停止，处理 pointercancel。更成熟的版本可以加入虚拟摇杆、自动瞄准与适合拇指的按钮布局。实际手机仍需真机验证，桌面缩窄窗口不能代替全部触摸测试。

### 舒适度也是玩法质量

提供关闭声音、减少闪动、明确暂停与容易读的文字。不要用闪白屏代替所有命中反馈。我们的 reducedMotion 关闭角色受击闪烁和晶体旋转；它没有声称能去掉所有动画。保留文字、状态和生命变化，让反馈不只依赖颜色或声音。

### 动手任务

开启 reducedMotion，保持 sound=false，建立一个安静的学习预设。

起点：

```js
return { reducedMotion: false, sound: false };
```

参考答案：

```js
return { reducedMotion: true, sound: false };
```

### 项目代码片段

对应文件：project/src/audio.js。下面是讲解片段，完整上下文见对应源文件。

```js
// 在用户点击“开始”时调用：
const ctx = new AudioContext();
const oscillator = ctx.createOscillator();
const gain = ctx.createGain();
oscillator.frequency.value = 650;
gain.gain.setValueAtTime(0.035, ctx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
oscillator.connect(gain); gain.connect(ctx.destination);
oscillator.start(); oscillator.stop(ctx.currentTime + 0.09);
```

### 理解检查

关闭声音时，经验拾取应该怎么处理？

1. 先等待音乐结束
2. 规则照常执行，只不播放声音
3. 不再获得经验

答案：2。规则和表现解耦，才能安全地调整体验。

## 17 把你的第一个世界交出去

阶段：完成并交付

测试、发布与下一款游戏。

**本课目标**：能独立启动、修改、验证，并发布一个小型完整作品。

> 天亮了。最珍贵的奖励不是通关，而是你已经知道一个世界怎样被做出来。

### 下载后先完成三个独立改动

顶部“下载项目”包含完整源码、Three.js 本地模块和说明，不依赖教程运行。1）在 art.js 换一个原创角色图案；2）在 config.js 改节奏，保证仍能完成一局；3）在 state.js 加一种新升级，例如移动速度+10%。完成后你已经开始设计自己的游戏。

### 发布前走一张真实检查表

首次打开可开始；WASD 与触屏能移动；没敌人时不报错；升级时所有模拟暂停；重开不残留弹丸；死亡不会继续扣血；胜利与失败显示正确；连续重开不会持续泄漏；存档损坏有回退；浏览器缩放/窗口变化后画面正常。

先在 localhost 测试，再用支持静态 HTML/JS 的托管发布 project 文件夹。确保保留 src、vendor 的相对路径，用 HTTPS，发布后再走一次完整流程。本教程没有替你创建公网网站或账号；具体托管的操作按所选服务的官方文档执行。

### 从这里走向 PokéBonk 的规模

下一条路线可以是动画图集→多方向精灵→程序化高差地形→技能数据表→关卡事件→空间索引/批处理→版本化云存档。一次只选一个目标。多人、反作弊与商业运营应单独做项目设计，不是再加几行 fetch。

学习过这套教程，不代表立刻具备生产团队所有能力。你已经有了一个可运行、能解释、能修改的单机基础；接下来靠自己完成几次功能迭代，才会把知识变成能力。

### 动手任务

设计你自己的 45 秒版本：speed 为 4–7，damage 为 1–3，fireRate 为 1–4，spawnRate 为 0.8–2。其他参数沿用默认值。

起点：

```js
return { duration: 90, speed: 5, damage: 1, fireRate: 2, spawnRate: 1.2 };
```

参考答案：

```js
return { duration: 45, speed: 5.5, damage: 2, fireRate: 2.5, spawnRate: 1.4 };
```

### 项目代码片段

对应文件：project/src/main.js。下面是讲解片段，完整上下文见对应源文件。

```js
// 结业任务：增加“轻盈步伐”升级。
// state.js / chooseUpgrade:
else if (id === "stride") this.config.speed *= 1.1;

// main.js 的升级按钮区域添加一个对应按钮，
// onclick 调用 game.upgrade("stride")。
// 最后检查：升级一次，实际速度只增加 10%。
```

### 理解检查

怎样检验你真的学会了？

1. 只把所有页面翻到最后
2. 背出全部 Three.js 类名
3. 脱离教程独立加一个功能，并解释和验证它

答案：3。能解释、能修改、能定位错误，才是这次旅程的结业目标。

## 官方参考

- [Three.js：Sprite](https://threejs.org/docs/pages/Sprite.html)：精灵、面向相机与锚点
- [Three.js：Billboards](https://threejs.org/manual/pages/billboards.html)：二维贴图放进三维世界
- [Three.js：WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer)：渲染器、尺寸与设备像素比
- [MDN：游戏的组成](https://developer.mozilla.org/en-US/docs/Games/Anatomy)：输入、更新与主循环
- [MDN：JavaScript 入门](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Scripting)：需要更多语法练习时使用
