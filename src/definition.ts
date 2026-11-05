import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describeTools, type WorldDefinition } from 'cortico/world.ts';
import { MOTA_DEFAULTS, type MotaConfigSection } from './config.ts';
import { MOTA_TOOL_DECLS, MotaWorld } from './world.ts';

export const MOTA: WorldDefinition<MotaConfigSection> = {
  id: 'mota',
  label: 'h5魔塔（50层）',
  defaults: () => ({ ...MOTA_DEFAULTS }),
  create: (ctx) => {
    const requireFromCortico = createRequire(join(ctx.repoRoot, 'package.json'));
    const { WebSocketServer } = requireFromCortico('ws') as typeof import('ws');
    return new MotaWorld(ctx.cfg, (options) => new WebSocketServer(options), (patch) => ctx.persist(patch), ctx.timezone);
  },
  describe: {
    tools: describeTools(MOTA_TOOL_DECLS, {
      mota_start_game: { zh: '从标题界面开始新游戏；如有难度选项，必须提供 mota_status 返回的准确难度名称。', en: 'Starts a new game from the title screen; provide the exact difficulty name returned by mota_status when required.' },
      mota_move: { zh: '按指定方向连续移动指定格数，遇到事件或阻挡时停止并返回实际移动结果。', en: 'Moves in one direction for the requested number of tiles and stops at an event or obstruction.' },
      mota_move_to: { zh: '移动到当前楼层的目标坐标（自动优先瞬移，不可瞬移时寻路步行），可直接指定门、道具、怪物或楼梯坐标，并返回移动方式与实际位置。', en: 'Moves to a target coordinate on the current floor (teleporting when allowed, otherwise walking the route); accepts door, item, enemy, or stairs coordinates and reports the movement mode and actual position.' },
      mota_event_action: { zh: '推进当前对话一行，或选择一个可见事件选项。', en: 'Advances one dialogue line or selects one visible event choice.' },
      mota_event: { zh: '读取当前游戏事件、显示的对话文字和选项。', en: 'Reads the active game event, visible dialogue text, and choices.' },
      mota_screenshot: { zh: '按游戏实际布局截取魔塔完整游戏区域，供视觉检查。', en: 'Captures the Magic Tower game area with its actual layout for visual inspection.' },
      mota_saves: { zh: '列出已有的手动存档槽和自动存档状态。', en: 'Lists occupied manual save slots and autosave availability.' },
      mota_save: { zh: '将当前游戏保存到指定存档槽，默认不覆盖已有存档。', en: 'Saves the current game to a slot without overwriting an existing save by default.' },
      mota_load: { zh: '读取指定存档槽；槽位 0 表示最近的自动存档。', en: 'Loads a save slot; slot 0 means the latest autosave.' },
      mota_status: { zh: '读取魔塔当前阶段与勇者状态。', en: 'Reads the current game phase and hero status.' },
      mota_map: { zh: '读取当前楼层的字符网格、瞬移可达性、零代价可达对象、上楼最短路线代价、道具数值、对象坐标与怪物伤害及临界摘要。', en: 'Reads the current floor character grid, teleport reachability, zero-cost reachable objects, minimum-cost route to up-stairs, item effect values, object coordinates, and enemy damage and critical summary.' },
      mota_resources: { zh: '查询全塔所有已探索楼层中残留的道具、未开的门与剩余怪物，包含总量汇总与每层坐标明细。', en: 'Reads uncollected items, unopened doors, and remaining enemies across all visited floors, with tower totals and per-floor details.' },
      mota_fly: { zh: '使用楼层跳跃器（fly道具）直接传送到任意已探索过的楼层。', en: 'Jumps directly to a previously visited floor using the floor jump device (fly item).' },
      mota_battle: { zh: '查询指定坐标单个怪物的详细游戏战斗计算结果。', en: 'Reads the full game-calculated combat details for an enemy at a map coordinate.' },
    }),
    events: [
      { type: 'mota.state', description: { zh: '主动推塔开启时定时发送当前游戏状态并唤醒 Coo。', en: 'Periodically sends the current game state and wakes Coo when autonomous play is enabled.' }, trigger: 'flush', tags: ['snapshot'] },
      { type: 'mota.autonomy', description: { zh: '操作者暂停了魔塔主动推塔。', en: 'The operator paused autonomous Magic Tower play.' }, trigger: 'interrupt' },
    ],
  },
};

