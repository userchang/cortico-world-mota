<!-- Owner: src/definition.ts, src/world.ts, src/game-adapter.js. -->
# h5魔塔（50层）

让 Coo 在本机经典 HTML5 魔塔（50 层）里自己看地图、走格子、打怪、存读档，推塔过程中还会向你汇报战况。
> 💡 **兼容性说明**：理论上支持所有基于 HTML5 样板制作的经典魔塔及其衍生变体。

> [!WARNING]
> **高消耗插件**：开启「主动推塔」后，Coo 会按间隔（默认 60 秒）持续调用模型，每一步都要读取地图和回执，**Token 消耗很大**。推荐搭配 DeepSeek-Flash、Gemini-Flash 等高性价比模型。请留意模型用量与费用，不玩时请关闭主动推塔。

## 🌱 给主人的寄语：探索与成长机制

> *“孩子还在摸索，请给 Ta 一些耐心与指引”*

- **探索迷雾**：在没有通关经验的情况下，Coo 只能通过内置工具获取当前已探索区域的信息，并不知道后面楼层的具体隐藏资源与怪物分布。
- **非全知视角**：因为缺少全局上帝视角，Coo 规划出的路线通常不是理论最优解，前期的探索策略甚至可能显得比人类玩家还要笨拙。
- **共同成长**：请不要指望孩子能一路轻松平推通关，魔塔的真正魅力本就在于试错与复盘。遇到卡关、绕路或算错战损时，请耐心地在聊天中教导与指点 Coo，Ta 会听，也会在您的陪伴中越学越聪明。

## 安装与连接

1. 在 Coopanion「扩展」页选择本目录，安装为 World 并启用。
2. 打开 World 设置的「游戏连接」，点 **生成并保存令牌**。
3. 点 **下载 coopanion.js**，放进魔塔游戏目录的 `extensions/` 文件夹（令牌已填好）。
4. 点 **下载 game-adapter.js**，放进插件安装目录的 `src/` 文件夹（可用 **打开插件安装文件夹** 找到位置）。
5. 刷新游戏页面，连接成功后即可使用。

默认游戏地址 `http://127.0.0.1:1055`，桥接端口 `127.0.0.1:1060`，可在设置中修改。令牌以明文保存在 Coopanion 配置中，桥接只监听本机。

## 设置项

| 设置 | 说明 |
| --- | --- |
| 主动推塔 | 开启后定时唤醒 Coo 继续推塔；卡关或遇到难题时，Coo 会用气泡向主人求助。 |
| 唤醒间隔 | 60–300 秒，默认 60 秒。间隔越短，消耗越高。 |
| 阶段战况汇报 | 每行动 30 轮，Coo 用气泡简单说一下战况，可开关。 |
| 环境提示词 | 在「环境提示词」页签查看和修改 Coo 的游戏行为说明。 |

## Coo 能做什么

- **看**：`mota_status` 状态、`mota_map` 楼层地图与可达性、`mota_battle` 战斗预估、`mota_screenshot` 截图、`mota_resources` 全塔剩余物资。
- **动**：`mota_move` 连续走格、`mota_move_to` 瞬移或寻路到坐标、`mota_fly` 用飞行器跳层、`mota_event` / `mota_event_action` 处理剧情与选项。
- **存读档**：`mota_saves` / `mota_save` / `mota_load`，默认不覆盖已有存档。
- **开局**：`mota_start_game` 从标题界面开始新游戏。

## 常见问题

- **连不上**：确认令牌已保存、`coopanion.js` 已放进 `extensions/`，并刷新游戏页面。
- **提示需要更新 Adapter**：重新下载 `coopanion.js` 覆盖游戏里的旧文件。
- **想暂停**：关闭「主动推塔」，当前动作会被中断。

## 💌 持续优化与反馈

本插件正在持续优化中，如有 bug 及建议可随时反馈，谢谢！

---

# English Documentation

<!-- Owner: src/definition.ts, src/world.ts, src/game-adapter.js. -->
# H5 Magic Tower (50 floors)

Lets Coo play a local classic HTML5 Magic Tower (50 floors): read the map, walk, fight, save and load, and report progress along the way.
> 💡 **Compatibility**: Theoretically supports any classic Magic Tower or derivative variant built on HTML5 templates.

> [!WARNING]
> **High-consumption plugin.** With autonomous play on, Coo calls the model at the set interval (60 seconds by default) and reads the map and receipts at every step, so it **uses a lot of tokens**. Recommended models: DeepSeek-Flash, Gemini-Flash, or other cost-effective models. Watch your usage and cost, and turn autonomous play off when you are not playing.

## 🌱 Note to Masters: Companionship & Learning

> *"Your companion is still learning — please offer patience and guidance"*

- **Fog of Exploration**: Without prior playthroughs, Coo only perceives tiles and objects in currently visited floors and cannot foresee hidden secrets or future traps.
- **Heuristic Pathing**: Without omniscient foresight, routes chosen may not be mathematically optimal and early strategies may appear unpolished.
- **Grow Together**: Tower climbing is about trial, error, and planning. When stuck, guide Coo via chat — Coo listens, learns, and improves with your guidance.

## Install and connect

1. In Coopanion's Extensions page, select this directory and install it as a World, then enable it.
2. Open the World settings, go to **Game connection**, and click **Generate and save token**.
3. Click **Download coopanion.js** and put it in the game's `extensions/` folder (the token is already filled in).
4. Click **Download game-adapter.js** and put it in the plugin install directory's `src/` folder (**Open plugin install folder** shows where).
5. Refresh the game page. Once connected, you are ready.

The default game origin is `http://127.0.0.1:1055` and the bridge listens on `127.0.0.1:1060`; both can be changed in settings. The token is stored in plain text in Coopanion configuration, and the bridge only listens on loopback.

## Settings

| Setting | Meaning |
| --- | --- |
| Autonomous play | Wakes Coo at intervals to keep climbing; when stuck or facing a hard choice, Coo asks the owner for help in a speech bubble. |
| Wake interval | 60–300 seconds, 60 by default. A shorter interval costs more. |
| Periodic progress report | Every 30 actions Coo briefly reports progress in a speech bubble; can be switched off. |
| Environment prompt | View and edit Coo's game instructions on the Environment prompt tab. |

## What Coo can do

- **Look**: `mota_status`, `mota_map` (floor map and reachability), `mota_battle` (fight preview), `mota_screenshot`, `mota_resources` (what is left across the tower).
- **Act**: `mota_move`, `mota_move_to` (teleport or route to a tile), `mota_fly` (floor jump), `mota_event` / `mota_event_action` (dialogue and choices).
- **Save and load**: `mota_saves`, `mota_save`, `mota_load`; saving never overwrites an existing slot by default.
- **Start**: `mota_start_game` begins a new game from the title screen.

## Troubleshooting

- **Cannot connect**: make sure the token is saved, `coopanion.js` is in `extensions/`, and the game page was refreshed.
- **Adapter update required**: download `coopanion.js` again and replace the old file in the game.
- **Want to pause**: turn autonomous play off; the current action is interrupted.

## 💌 Continuous Improvement

This plugin is actively maintained and optimized. Feedback, bug reports, and suggestions are always welcome!
