# 魔塔 World 插件交接记录（2026-11-05）

## 工作区

- 工作区根目录：`D:\WW\RUNkku\COO\coo魔塔`
- 游戏源码（参考副本）：`D:\WW\RUNkku\COO\coo魔塔\51`
- 本机实际运行的魔塔目录：`D:\WW\RUNkku\COO\51`（对应浏览器 `http://127.0.0.1:1055/extensions/coopanion.js`）
- 本机实际运行的 Coopanion 数据目录：`D:\coopanion\data`
- Coopanion 仓库：`D:\WW\RUNkku\COO\coo魔塔\coopanion`
- 插件源码：`D:\WW\RUNkku\COO\coo魔塔\coopanion\packages\cortico-world-mota`
- 当前安装包文件夹：`D:\WW\RUNkku\COO\coo魔塔\cortico-world-mota-0.1.34`（及归档 `cortico-world-mota-0.1.34.tgz`）
- 本地参考目录：`D:\WW\RUNkku\COO\coo魔塔\cortico-world-mota-local`

## 仓库规则与用户偏好

- 必读 `coopanion/AGENTS.md`；其中规定项目说明放在 `scratch/`，用户可见行为同时更新中英文 README，提交前需跑仓库检查，变更按明确路径暂存，不要使用 `git add .` 或 `git add -A`。
- 拒绝生硬的“严禁/绝不”禁令，全面采用机制解释与启发式正向引导；
- 提示词中统一使用“主人”称呼（替代“爬爬”），以便后续插件分发他人；
- 桌宠遇到卡关或困难时，**禁止默默放弃或直接停止，转为通过 `pet_say` 主动向主人求助商量**；
- 鼓励积极多存档、多读档优化路线与试错；
- 遇到缺钥匙或卡关时，不要局限在当前层，通过全塔资源工具检索并回溯。
- **本次用户明确要求：不进行热更新，由用户在 Coopanion 界面重新安装新版本**。

## 0.1.34 发布前整理（仅 UI/文案，未动核心）

- 显示名改为「h5魔塔（50层）」（label/配置标题/webUi 显示名；npm 包名 cortico-world-mota 不变）。
- 环境提示词页签中文化（config.ts 的 motaPromptDocText）。
- 游戏连接按钮收进带边框的网格按钮框（client.js buttonBox/fillButton），主动推塔区同样式。
- 设置页新增专属独立的「插件说明」标签栏（与「游戏连接」、「配置」、「魔塔 · 环境提示词」并列为一级页签），包含四大板块：
  1. **高消耗特别提示**：标明属于高消耗型插件、推荐高性价比模型（DeepSeek-Flash、Gemini-Flash）、随手暂停建议；
  2. **给主人的寄语（陪伴与成长机制）**：说明探索迷雾（只能感知当前已探区域）、非全知视角（路线非最优、初期略显笨拙）、共同成长（试错与复盘，耐心在聊天中指导）；
  3. **核心特性亮点**：智能瞬移与原生地形探索、全塔物资全局账本、飞行器与主动存读档、阶段战况简报与遇阻求助；
  4. **持续优化与反馈**：「本插件正在持续优化中，如有 bug 及建议可随时反馈，谢谢！」。
- 「游戏连接」标签栏恢复纯粹的连接配置，不混杂长篇简介。
- package.json 简介（对应扩展详情页弹窗展示）同步为：「让桌宠自主游玩 HTML5 魔塔。理论上支持所有基于 HTML5 样板制作的经典魔塔及其衍生变体，支持原生地形探索、全塔物资统筹与陪伴式互动。」
- 明确说明理论上支持所有基于 HTML5 样板制作的经典魔塔及其衍生变体。
- 同步更新中英文 README。
- game-adapter.js 与 world.ts 核心动作逻辑零改动。

## 0.1.33 修复记录

1. **动作工具互斥锁释放修复（解决飞层后 `action_in_progress` 死锁）**：
   - 原因：在 `src/world.ts` 中，`mota_fly` 被列入了上锁列表（置 `this.actionInFlight = true`），但在请求结束后的 `.finally()` 回调中漏掉了 `mota_fly`，导致 `this.actionInFlight` 永远停留在 `true`。后续所有动作类工具（`mota_move_to`、`mota_move`、`mota_save` 等）均直接被报错 `action_in_progress` 拦截。
   - 修复：在 `src/world.ts` 中提取公共常量集合 `ACTION_TOOLS`，统一定义包括 `mota_start_game`、`mota_move`、`mota_move_to`、`mota_event_action`、`mota_save`、`mota_load`、`mota_fly` 的所有动作工具，确保上锁、解锁和回执处理逻辑严格对齐，彻底杜绝漏解锁隐患。

## 产物与交付状态（非热改动）

- **GitHub 官方仓库**：[https://github.com/userchang/cortico-world-mota](https://github.com/userchang/cortico-world-mota)（分支 `main`，标签 `v0.1.34`，README 首页中文置顶）
- **npm 官方镜像包**：[https://www.npmjs.com/package/cortico-world-mota](https://www.npmjs.com/package/cortico-world-mota)（版本 `0.1.34`，通过 GitHub Actions Trusted Publisher 自动发布成功）
- 源码包已升级至 `0.1.34`。
- 本地独立仓库：`D:\WW\RUNkku\COO\插件开发\cortico-world-mota`
- 本地工作区副本：`C:\Users\20327\WorkBuddy\GitHub仓库\cortico-world-mota`
- 本地解包目录：`D:\WW\RUNkku\COO\coo魔塔\cortico-world-mota-0.1.34`。
- 本地归档包：`D:\WW\RUNkku\COO\coo魔塔\cortico-world-mota-0.1.34.tgz`。
- 本地参考目录：`D:\WW\RUNkku\COO\coo魔塔\cortico-world-mota-local`。
- **未执行热更新**：未修改正在运行的 `D:\coopanion\data\extensions\node_modules\cortico-world-mota`。用户可通过 Coopanion 扩展管理重新安装 `cortico-world-mota-0.1.34` 文件夹或选择 `.tgz` 文件安装。
