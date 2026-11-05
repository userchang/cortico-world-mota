import { createServer, type Server } from 'node:http';
import { execFile as execFileCallback } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import type { AddressInfo } from 'node:net';
import { nowIso } from 'cortico/core/util.ts';
import type { BlobInput, ToolCallContext, ToolDef, ToolOutcome, World, WorldHost, WorldWebUiDecl } from 'cortico/core/types.ts';
import type { Language } from 'cortico/core/language.ts';
import { motaConfigGroup, motaConnectionText, motaDisplayName, motaIntroTitle, motaPromptDocText, type MotaConfigSection } from './config.ts';
import type { WebSocket, WebSocketServer } from 'ws';

const PROTOCOL = 1;
const MAX_MESSAGE_BYTES = 512 * 1024;
const REQUEST_TIMEOUT_MS = 8_000;
const MOVE_REQUEST_TIMEOUT_MS = 120_000;
const START_REQUEST_TIMEOUT_MS = 35_000;
const SAVE_REQUEST_TIMEOUT_MS = 30_000;
const MAX_MOVE_STEPS = 16;
const MAX_SAVE_SLOT = 5_000;
const MAX_SCREENSHOT_BYTES = 384 * 1024;
const MIN_AUTOPLAY_INTERVAL_SECONDS = 60;
const MAX_AUTOPLAY_INTERVAL_SECONDS = 300;
const ACTION_TOOLS = new Set([
  'mota_start_game',
  'mota_move',
  'mota_move_to',
  'mota_event_action',
  'mota_save',
  'mota_load',
  'mota_fly',
]);
const ENV_PROMPT_FILE = fileURLToPath(new URL('./ENV_PROMPT.md', import.meta.url));
const ADAPTER_FILE = fileURLToPath(new URL('./game-adapter.js', import.meta.url));
const PACKAGE_DIR = fileURLToPath(new URL('../', import.meta.url));
const execFile = promisify(execFileCallback);

type Reply = { v: 1; id: string; ok: true; result: unknown } | { v: 1; id: string; ok: false; error: { code: string; message: string } };
type WebSocketServerFactory = (options: ConstructorParameters<typeof import('ws').WebSocketServer>[0]) => WebSocketServer;

export const MOTA_TOOL_DECLS: ReadonlyArray<Omit<ToolDef, 'handler'>> = [
  {
    name: 'mota_start_game', description: 'Starts a new game from the title screen. Supply a listed difficulty when the game requires one.', tags: ['act'],
    barrierAfter: true,
    parameters: {
      type: 'object', additionalProperties: false,
      properties: { difficulty: { type: 'string', description: 'Exact difficulty name returned by mota_status; required when the title screen lists difficulty options.' } },
    },
  },
  {
    name: 'mota_move', description: 'Moves the hero up to the requested number of tiles in one cardinal direction, stopping at an event, obstruction, floor change, or game lock.', tags: ['act'],
    barrierAfter: true, interruptible: true,
    parameters: {
      type: 'object', additionalProperties: false,
      properties: {
        direction: { type: 'string', enum: ['up', 'down', 'left', 'right'] },
        steps: { type: 'integer', minimum: 1, maximum: MAX_MOVE_STEPS, description: `Number of tiles to attempt in this direction; defaults to 1 and cannot exceed ${MAX_MOVE_STEPS}.` },
      },
      required: ['direction'],
    },
  },
  {
    name: 'mota_move_to', description: 'Moves the hero to a tile on the current floor with the game click-to-move: it teleports when the game allows it and otherwise walks the route. A door, item, enemy, or stairs tile may be the target; a teleport then lands next to it and steps in to trigger it. Stops at events, obstructions, floor changes, or interruption and reports mode teleport, walk, or none, with teleportUnavailable explaining a walk.', tags: ['act'],
    barrierAfter: true, interruptible: true,
    parameters: {
      type: 'object', additionalProperties: false,
      properties: {
        x: { type: 'integer', description: 'Destination tile x coordinate on the current floor.' },
        y: { type: 'integer', description: 'Destination tile y coordinate on the current floor.' },
      },
      required: ['x', 'y'],
    },
  },
  {
    name: 'mota_event_action', description: 'Advances the current dialogue line or selects one visible event choice.', tags: ['act'],
    barrierAfter: true, interruptible: true,
    parameters: {
      type: 'object', additionalProperties: false,
      properties: {
        action: { type: 'string', enum: ['advance', 'choose'] },
        index: { type: 'integer', minimum: 0, description: 'Zero-based visible choice index; required for choose.' },
      },
      required: ['action'],
    },
  },
  {
    name: 'mota_event', description: 'Reads the active game event, visible dialogue text, and choices. Use mota_event_action to continue dialogue or choose an option.', tags: ['read'],
    parameters: { type: 'object', additionalProperties: false, properties: {} },
  },
  {
    name: 'mota_screenshot', description: 'Captures the full Magic Tower game area with its actual layout as an image for visual inspection.', tags: ['read', 'snapshot'],
    parameters: { type: 'object', additionalProperties: false, properties: {} },
  },
  {
    name: 'mota_saves', description: 'Lists occupied manual save slots and whether an autosave is available.', tags: ['read'],
    parameters: { type: 'object', additionalProperties: false, properties: {} },
  },
  {
    name: 'mota_save', description: 'Saves the current game to a numbered slot. Existing saves require explicit overwrite=true.', tags: ['act'],
    barrierAfter: true,
    parameters: {
      type: 'object', additionalProperties: false,
      properties: {
        slot: { type: 'integer', minimum: 1, maximum: MAX_SAVE_SLOT, description: 'Manual save slot number; autosave slot 0 cannot be overwritten.' },
        overwrite: { type: 'boolean', description: 'Set true only when the user explicitly asks to replace an existing save.' },
      },
      required: ['slot'],
    },
  },
  {
    name: 'mota_load', description: 'Loads a numbered save slot; slot 0 loads the latest autosave.', tags: ['act'],
    barrierAfter: true,
    parameters: {
      type: 'object', additionalProperties: false,
      properties: { slot: { type: 'integer', minimum: 0, maximum: MAX_SAVE_SLOT, description: 'Manual slot 1–5000, or 0 for the latest autosave.' } },
      required: ['slot'],
    },
  },
  {
    name: 'mota_status', description: 'Reads the current game phase and hero status.', tags: ['read', 'snapshot'],
    parameters: { type: 'object', additionalProperties: false, properties: {} },
  },
  {
    name: 'mota_map', description: 'Reads the current floor as a character grid with teleport reachability, zero-cost reachable objects (freeReachable), minimum-cost route to the up-stairs (upStairsRoute), item effect values (itemValues), object coordinates, damage tiles, and one row per enemy type with the game-calculated damage and next attack critical.', tags: ['read', 'snapshot'],
    parameters: { type: 'object', additionalProperties: false, properties: {} },
  },
  {
    name: 'mota_resources', description: 'Reads uncollected items, unopened doors, and remaining enemies across all visited floors, reporting both tower totals and per-floor coordinates.', tags: ['read', 'snapshot'],
    parameters: { type: 'object', additionalProperties: false, properties: {} },
  },
  {
    name: 'mota_fly', description: 'Jumps directly to a previously visited floor using the floor jump device (fly item).', tags: ['act'],
    barrierAfter: true,
    parameters: {
      type: 'object', additionalProperties: false,
      properties: { floorId: { type: 'string', description: 'Destination floor ID (e.g. "MT1", "MT5").' } },
      required: ['floorId'],
    },
  },
  {
    name: 'mota_battle', description: 'Reads the full game-calculated combat details for one enemy at a map coordinate. mota_map already lists damage, stats, and critical per enemy type.', tags: ['read'],
    parameters: {
      type: 'object', additionalProperties: false,
      properties: { x: { type: 'integer', description: 'Enemy tile x coordinate.' }, y: { type: 'integer', description: 'Enemy tile y coordinate.' } },
      required: ['x', 'y'],
    },
  },
];

export class MotaWorld implements World {
  readonly id = 'mota';
  private http: Server | null = null;
  private wss: WebSocketServer | null = null;
  private socket: WebSocket | null = null;
  private authenticatedToken: string | null = null;
  private phase = 'disconnected';
  private nextId = 1;
  private actionInFlight = false;
  private host: WorldHost | null = null;
  private timezone = 'UTC';
  private gameInstanceId: string | null = null;
  private adapterCapabilities = new Set<string>();
  private lastStateVersion = -1;
  private lastTerminalWakeKey: string | null = null;
  private latestState: Record<string, unknown> | null = null;
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private autoplayWakePendingUntil = 0;
  private autoplayWakeStateVersion: number | null = null;
  private autoplayWakeSequence = 0;
  private actionRoundCount = 0;
  private readonly pending = new Map<string, { resolve(value: unknown): void; reject(error: Error): void; timer: ReturnType<typeof setTimeout> }>();

  constructor(
    private readonly cfg: MotaConfigSection,
    private readonly createWebSocketServer: WebSocketServerFactory,
    private readonly persist: (patch: Partial<MotaConfigSection>) => void,
    timezone: string,
  ) {
    this.timezone = timezone;
    if (!Number.isInteger(cfg.autoplayIntervalSeconds) || cfg.autoplayIntervalSeconds < MIN_AUTOPLAY_INTERVAL_SECONDS || cfg.autoplayIntervalSeconds > MAX_AUTOPLAY_INTERVAL_SECONDS) {
      cfg.autoplayIntervalSeconds = 60;
    }
  }

  tools(): ToolDef[] {
    return MOTA_TOOL_DECLS.map((decl) => ({
      ...decl,
      handler: (args: Record<string, unknown>, ctx: ToolCallContext) => this.query(decl.name, args, ctx),
    }));
  }

  envPromptVars(): Record<string, string> {
    return {
      'mota.phase': this.phase,
      'mota.autoplay': this.cfg.autoplay ? 'enabled' : 'disabled',
      'mota.autoplay_interval': String(this.cfg.autoplayIntervalSeconds),
      'mota.screenshot': this.adapterCapabilities.has('game_canvas_screenshot') ? 'available' : 'requires the latest game adapter',
    };
  }

  webUi(language?: Language): WorldWebUiDecl {
    const text = motaConnectionText(language ?? 'zh');
    const promptText = motaPromptDocText(language ?? 'zh');
    return {
      label: motaDisplayName(language ?? 'zh'),
      config: [motaConfigGroup(language ?? 'zh')],
      panels: [
        { id: 'intro', title: motaIntroTitle(language ?? 'zh') },
        { id: 'connection', title: text.connectionTitle, description: text.connectionDesc },
      ],
      invoke: async (panel, method, args) => {
        if (panel === 'intro') return {};
        if (panel !== 'connection') throw new Error(`Unknown Mota panel: ${panel}`);
        if (method === 'getToken') return { token: this.cfg.token };
        if (method === 'getPeriodicReport') return { enabled: this.cfg.periodicReport !== false };
        if (method === 'setPeriodicReport') {
          const enabled = args[0];
          if (typeof enabled !== 'boolean') throw new Error('Periodic report state must be a boolean.');
          this.persist({ periodicReport: enabled });
          return { enabled: this.cfg.periodicReport };
        }
        if (method === 'getAutoplay') return { enabled: this.cfg.autoplay };
        if (method === 'getAutoplayInterval') return { seconds: this.cfg.autoplayIntervalSeconds };
        if (method === 'setAutoplayInterval') {
          const seconds = args[0];
          if (typeof seconds !== 'number' || !Number.isInteger(seconds) || seconds < MIN_AUTOPLAY_INTERVAL_SECONDS || seconds > MAX_AUTOPLAY_INTERVAL_SECONDS) {
            throw new Error(`Autoplay interval must be an integer from ${MIN_AUTOPLAY_INTERVAL_SECONDS} to ${MAX_AUTOPLAY_INTERVAL_SECONDS} seconds.`);
          }
          this.persist({ autoplayIntervalSeconds: Number(seconds) });
          if (this.cfg.autoplay) this.restartAutoplayTimer();
          return { seconds: this.cfg.autoplayIntervalSeconds };
        }
        if (method === 'setAutoplay') {
          const enabled = args[0];
          if (typeof enabled !== 'boolean') throw new Error('Autoplay state must be a boolean.');
          this.persist({ autoplay: enabled });
          this.autoplayWakePendingUntil = 0;
          this.autoplayWakeStateVersion = null;
          if (enabled) {
            this.startAutoplayTimer();
            if (this.latestState?.started === true && this.latestState.gameOver !== true) {
              await this.publishAutoplayWake(this.gameInstanceId ?? 'current-game');
            }
          } else {
            this.stopAutoplayTimer();
            await this.pushAutoplayEvent();
          }
          return { enabled: this.cfg.autoplay };
        }
        if (method === 'downloadGameAdapter') {
          const source = await readFile(ADAPTER_FILE);
          return { $binary: { mime: 'application/javascript', base64: source.toString('base64') } };
        }
        if (method === 'createAdapter') {
          const token = args[0];
          if (typeof token !== 'string' || token.length < 32 || /\s/.test(token)) throw new Error('Use at least 32 non-whitespace characters.');
          const source = await readFile(ADAPTER_FILE, 'utf8');
          const tokenDeclaration = source.match(/^(\s*var BRIDGE_TOKEN\s*=\s*)(['"])(.*)\2;(\s*)$/m);
          if (!tokenDeclaration) throw new Error('game-adapter.js must declare BRIDGE_TOKEN as a string.');
          const adapter = source.replace(tokenDeclaration[0], `${tokenDeclaration[1]}${JSON.stringify(token)};${tokenDeclaration[4]}`);
          return { $binary: { mime: 'application/javascript', base64: Buffer.from(adapter).toString('base64') } };
        }
        if (method === 'openFolder') {
          const details = await stat(PACKAGE_DIR);
          if (!details.isDirectory()) throw new Error('Plugin install directory is unavailable.');
          if (process.platform === 'win32') {
            await execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', 'Invoke-Item -LiteralPath $env:MOTA_PLUGIN_DIR'], {
              windowsHide: true,
              env: { ...process.env, MOTA_PLUGIN_DIR: PACKAGE_DIR },
            });
          } else {
            await execFile(process.platform === 'darwin' ? 'open' : 'xdg-open', [PACKAGE_DIR]);
          }
          return { opened: true };
        }
        if (method !== 'setToken') throw new Error(`Unknown Mota connection method: ${method}`);
        const token = args[0];
        if (typeof token !== 'string' || (token !== '' && (token.length < 32 || /\s/.test(token)))) {
          throw new Error('Use at least 32 non-whitespace characters, or leave the token empty.');
        }
        this.persist({ token });
        return { token: this.cfg.token };
      },
      promptDocs: [{
        key: 'worlds.mota.envPrompt', title: promptText.title,
        description: promptText.description,
        path: ENV_PROMPT_FILE, role: 'envPrompt',
        vars: promptText.vars,
      }],
    };
  }

  async start(host: WorldHost): Promise<void> {
    this.host = host;
    const origin = new URL(this.cfg.gameOrigin);
    if (origin.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(origin.hostname) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
      throw new Error('gameOrigin must be an HTTP origin on localhost or 127.0.0.1');
    }
    this.phase = this.cfg.token.trim() ? 'disconnected' : 'awaiting_token';
    this.http = createServer((_req, res) => { res.writeHead(404).end(); });
    this.wss = this.createWebSocketServer({ noServer: true, maxPayload: MAX_MESSAGE_BYTES });
    this.http.on('upgrade', (req, socket, head) => {
      if (req.url !== '/mota' || req.headers.origin !== origin.origin) { socket.destroy(); return; }
      this.wss!.handleUpgrade(req, socket, head, (ws) => this.wss!.emit('connection', ws, req));
    });
    this.wss.on('connection', (ws) => this.accept(ws));
    await new Promise<void>((resolve, reject) => {
      this.http!.once('error', reject);
      this.http!.listen(this.cfg.port, '127.0.0.1', () => { this.http!.off('error', reject); resolve(); });
    });
    const address = this.http.address() as AddressInfo;
    if (address.port !== this.cfg.port) throw new Error('Mota bridge bound to an unexpected port');
    if (this.cfg.autoplay) this.startAutoplayTimer();
  }

  async stop(): Promise<void> {
    this.stopAutoplayTimer();
    this.host = null;
    this.phase = 'disconnected';
    this.authenticatedToken = null;
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Mota bridge stopped'));
      this.pending.delete(id);
    }
    this.socket?.terminate();
    this.socket = null;
    await new Promise<void>((resolve) => this.wss ? this.wss.close(() => resolve()) : resolve());
    await new Promise<void>((resolve) => this.http?.close(() => resolve()) ?? resolve());
    this.wss = null;
    this.http = null;
  }

  private accept(ws: WebSocket): void {
    if (this.socket && this.socket.readyState === this.socket.OPEN) this.socket.close(1008, 'Only one game connection is supported');
    this.socket = ws;
    this.phase = 'authenticating';
    const authTimer = setTimeout(() => ws.close(1008, 'Authentication timeout'), 3_000);
    ws.on('message', (data) => {
      if (this.socket !== ws) return;
      const raw = data.toString();
      if (Buffer.byteLength(raw, 'utf8') > MAX_MESSAGE_BYTES) { ws.close(1009, 'Message too large'); return; }
      let parsed: unknown;
      try { parsed = JSON.parse(raw); } catch { ws.close(1007, 'Invalid JSON'); return; }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) { ws.close(1007, 'Invalid message shape'); return; }
      const msg = parsed as Record<string, unknown>;
      if (this.phase === 'authenticating') {
        if (msg.kind !== 'hello' || msg.v !== PROTOCOL || typeof msg.gameInstanceId !== 'string'
          || !this.cfg.token.trim() || msg.token !== this.cfg.token) {
          clearTimeout(authTimer); ws.close(1008, 'Authentication failed'); return;
        }
        clearTimeout(authTimer);
        this.authenticatedToken = this.cfg.token;
        this.phase = 'menu';
        this.gameInstanceId = null;
        this.adapterCapabilities = new Set(Array.isArray(msg.features)
          ? msg.features.filter((feature): feature is string => typeof feature === 'string')
          : []);
        this.lastStateVersion = -1;
        this.lastTerminalWakeKey = null;
        this.autoplayWakePendingUntil = 0;
        this.autoplayWakeStateVersion = null;
        this.latestState = null;
        return;
      }
      if (!this.cfg.token.trim() || this.authenticatedToken !== this.cfg.token) { ws.close(1008, 'Token changed'); return; }
      if (msg.v !== PROTOCOL) { ws.close(1002, 'Protocol version mismatch'); return; }
      if (msg.kind === 'state') {
        this.observeState(msg);
        return;
      }
      if (msg.kind === 'phase' && typeof msg.phase === 'string') {
        this.phase = msg.phase;
      }
      if (msg.kind === 'reply' && typeof msg.id === 'string') this.resolveReply(msg as unknown as Reply);
    });
    ws.on('close', () => {
      clearTimeout(authTimer);
      if (this.socket === ws) {
        this.socket = null;
        this.authenticatedToken = null;
        this.phase = this.cfg.token.trim() ? 'disconnected' : 'awaiting_token';
        this.latestState = null;
        this.autoplayWakePendingUntil = 0;
        this.autoplayWakeStateVersion = null;
      }
      for (const [id, pending] of this.pending) {
        clearTimeout(pending.timer); pending.reject(new Error('Game adapter disconnected')); this.pending.delete(id);
      }
    });
    ws.on('error', () => undefined);
  }

  private resolveReply(reply: Reply): void {
    if (typeof reply.ok !== 'boolean') return;
    const pending = this.pending.get(reply.id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(reply.id);
    if (reply.ok) pending.resolve(reply.result);
    else if (reply.error && typeof reply.error.message === 'string' && typeof reply.error.code === 'string') {
      pending.reject(Object.assign(new Error(reply.error.message), { code: reply.error.code }));
    } else pending.reject(new Error('Game adapter returned an invalid error reply.'));
  }

  private observeState(message: Record<string, unknown>): void {
    if (typeof message.gameInstanceId !== 'string' || !message.state || typeof message.state !== 'object' || Array.isArray(message.state)) return;
    const state = message.state as Record<string, unknown>;
    if (typeof state.stateVersion !== 'number' || !Number.isInteger(state.stateVersion) || typeof state.phase !== 'string' || typeof state.started !== 'boolean') return;
    const changedInstance = message.gameInstanceId !== this.gameInstanceId;
    const previous = changedInstance ? null : this.latestState;
    if (changedInstance) {
      this.lastStateVersion = -1;
      this.lastTerminalWakeKey = null;
      this.autoplayWakePendingUntil = 0;
      this.autoplayWakeStateVersion = null;
    }
    if (state.stateVersion <= this.lastStateVersion) return;
    this.gameInstanceId = message.gameInstanceId;
    this.lastStateVersion = state.stateVersion;
    this.latestState = state;
    this.phase = state.phase;
    if (!this.cfg.autoplay || !state.started) return;
    if (state.gameOver === true) {
      const terminalKey = `${message.gameInstanceId}:${String(state.stateVersion)}`;
      if (terminalKey !== this.lastTerminalWakeKey) {
        this.lastTerminalWakeKey = terminalKey;
        void this.publishAutoplayWake(message.gameInstanceId, true);
      }
      return;
    }
    if (!previous || previous.started !== state.started) void this.publishAutoplayWake(message.gameInstanceId);
  }

  private startAutoplayTimer(): void {
    if (this.autoplayTimer) return;
    this.autoplayTimer = setInterval(() => { void this.autoplayTick(); }, this.cfg.autoplayIntervalSeconds * 1_000);
    this.autoplayTimer.unref?.();
  }

  private restartAutoplayTimer(): void {
    this.stopAutoplayTimer();
    this.startAutoplayTimer();
  }

  private stopAutoplayTimer(): void {
    if (this.autoplayTimer) clearInterval(this.autoplayTimer);
    this.autoplayTimer = null;
    this.autoplayWakePendingUntil = 0;
    this.autoplayWakeStateVersion = null;
  }

  private async autoplayTick(): Promise<void> {
    const state = this.latestState;
    if (!this.cfg.autoplay || !state || state.started !== true || state.gameOver === true || this.actionInFlight) return;
    if (!this.socket || this.socket.readyState !== this.socket.OPEN) return;
    if (Date.now() < this.autoplayWakePendingUntil) return;
    await this.publishAutoplayWake(this.gameInstanceId ?? 'current-game');
  }

  private formatWakeSummary(state: Record<string, unknown>, terminal: boolean): string {
    const hero = state.hero && typeof state.hero === 'object' ? state.hero as Record<string, unknown> : {};
    const loc = hero.loc && typeof hero.loc === 'object' ? hero.loc as Record<string, unknown> : {};
    const items = hero.items && typeof hero.items === 'object' ? hero.items as Record<string, unknown> : {};
    const event = state.event && typeof state.event === 'object' ? state.event as Record<string, unknown> : {};
    const itemSummary = Object.entries(items).map(([k, v]) => `${k}:${String(v)}`).join(' ');
    const eventSummary = event.active ? ` | 事件:${String(event.eventType ?? event.eventId)}${event.text ? ` "${String(event.text).slice(0, 60)}"` : ''}` : '';
    const status = terminal || state.gameOver === true ? '游戏已结束' : `阶段:${String(state.phase)}`;
    const periodicNotice = (this.cfg.periodicReport !== false && this.actionRoundCount >= 30)
      ? '；你已连续推塔行动满 30 轮，请在继续推进的同时用 pet_say 向主人简要说一下战况'
      : '';
    if (this.cfg.periodicReport !== false && this.actionRoundCount >= 30) {
      this.actionRoundCount = 0;
    }
    return `魔塔进度检查（${status}）。楼层:${String(state.floorId)}(${String(loc.x ?? '?')},${String(loc.y ?? '?')}) HP:${String(hero.hp)} ATK:${String(hero.atk)} DEF:${String(hero.def)} MDEF:${String(hero.mdef)} 金:${String(hero.money)} 经:${String(hero.exp)}${itemSummary ? ` 物品:[${itemSummary}]` : ''}${eventSummary}。请用 Mota 工具继续推进；若遇卡关、疑难抉择或无法继续推进，使用 pet_say 向主人求助并商量对策；遇游戏结束、错误或轮次上限时停止${periodicNotice}。`;
  }

  private async publishAutoplayWake(gameInstanceId: string, terminal = false): Promise<void> {
    const host = this.host;
    const state = this.latestState;
    if (!host || !this.cfg.autoplay || !state || state.started !== true) return;
    if (!this.socket || this.socket.readyState !== this.socket.OPEN) return;
    if (!terminal && state.gameOver === true) return;
    if (!terminal && this.actionInFlight) return;
    if (!terminal && Date.now() < this.autoplayWakePendingUntil) return;
    const sequence = ++this.autoplayWakeSequence;
    const hero = state.hero && typeof state.hero === 'object' ? state.hero as Record<string, unknown> : {};
    const event = state.event && typeof state.event === 'object' ? state.event as Record<string, unknown> : {};
    const text = this.formatWakeSummary(state, terminal);
    this.autoplayWakePendingUntil = Date.now() + this.cfg.autoplayIntervalSeconds * 1_000;
    this.autoplayWakeStateVersion = typeof state.stateVersion === 'number' ? state.stateVersion : null;
    try {
      await host.pushEvent({
        type: 'mota.state', source: this.id, senderKey: `${gameInstanceId}:${sequence}`,
        ts: nowIso(this.timezone), tags: ['snapshot'], ephemeral: true,
        meta: { gameInstanceId, stateVersion: state.stateVersion, floorId: state.floorId, hero, event, autoplayEnabled: true, scheduled: true, terminal }, text,
      }, { trigger: 'flush' });
    } catch (error) {
      this.autoplayWakePendingUntil = 0;
      this.autoplayWakeStateVersion = null;
      host.log.warn(`Magic Tower state event could not be delivered: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async pushAutoplayEvent(): Promise<void> {
    if (!this.host) return;
    try {
      await this.host.pushEvent({
        type: 'mota.autonomy', source: this.id, senderKey: 'mota.autonomy', ts: nowIso(this.timezone),
        meta: { autoplayEnabled: false },
        text: '魔塔主动推塔已暂停。只有当前 Mota World 设置为关闭时才停止游戏操作；始终以当前设置为准。',
      }, { trigger: 'interrupt' });
    } catch (error) {
      this.host.log.warn(`Magic Tower pause event could not be delivered: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async query(tool: string, args: Record<string, unknown>, ctx: ToolCallContext): Promise<string | ToolOutcome> {
    if (!this.cfg.token.trim()) {
      return { text: JSON.stringify({ error: { code: 'token_required', message: 'Set the connection token in the Mota World configuration.' } }), failed: true };
    }
    const ws = this.socket;
    if (!ws || ws.readyState !== ws.OPEN || this.phase === 'authenticating' || this.phase === 'disconnected' || this.phase === 'awaiting_token') {
      return { text: JSON.stringify({ error: { code: 'disconnected', message: 'Game adapter is not connected.' } }), failed: true };
    }
    if (this.authenticatedToken !== this.cfg.token) {
      ws.close(1008, 'Token changed');
      return { text: JSON.stringify({ error: { code: 'unauthorized', message: 'The configured connection token changed. Waiting for the game adapter to reconnect.' } }), failed: true };
    }
    if (tool === 'mota_screenshot' && !this.adapterCapabilities.has('game_canvas_screenshot')) {
      return { text: JSON.stringify({ error: { code: 'adapter_update_required', message: 'The game adapter is outdated. Download the latest token-configured coopanion.js from the Mota World settings and replace the file in the game extensions folder.' } }), failed: true };
    }
    if (ACTION_TOOLS.has(tool)) {
      if (tool === 'mota_fly' && (typeof args.floorId !== 'string' || !args.floorId.trim())) {
        return { text: JSON.stringify({ error: { code: 'invalid_target', message: 'floorId must be a non-empty floor identifier (e.g. "MT1").' } }), failed: true };
      }
      if (tool === 'mota_event_action') {
        const action = args.action;
        if (!['advance', 'choose'].includes(String(action)) || (action === 'choose' && (!Number.isInteger(args.index) || Number(args.index) < 0))) {
          return { text: JSON.stringify({ error: { code: 'invalid_event_action', message: 'Use advance, or choose with a non-negative index.' } }), failed: true };
        }
      }
      if (tool === 'mota_move' && !['up', 'down', 'left', 'right'].includes(String(args.direction))) {
        return { text: JSON.stringify({ error: { code: 'invalid_direction', message: 'direction must be up, down, left, or right.' } }), failed: true };
      }
      if (tool === 'mota_move' && args.steps !== undefined && (!Number.isInteger(args.steps) || Number(args.steps) < 1 || Number(args.steps) > MAX_MOVE_STEPS)) {
        return { text: JSON.stringify({ error: { code: 'invalid_steps', message: `steps must be an integer between 1 and ${MAX_MOVE_STEPS}.` } }), failed: true };
      }
      if (tool === 'mota_move_to' && (!Number.isInteger(args.x) || !Number.isInteger(args.y))) {
        return { text: JSON.stringify({ error: { code: 'invalid_target', message: 'x and y must be integer tile coordinates.' } }), failed: true };
      }
      if (tool === 'mota_start_game' && args.difficulty !== undefined && (typeof args.difficulty !== 'string' || !args.difficulty.trim())) {
        return { text: JSON.stringify({ error: { code: 'invalid_difficulty', message: 'difficulty must be a non-empty difficulty name from mota_status.' } }), failed: true };
      }
      if (tool === 'mota_save' && (!Number.isInteger(args.slot) || Number(args.slot) < 1 || Number(args.slot) > MAX_SAVE_SLOT || (args.overwrite !== undefined && typeof args.overwrite !== 'boolean'))) {
        return { text: JSON.stringify({ error: { code: 'invalid_save_slot', message: `slot must be an integer between 1 and ${MAX_SAVE_SLOT}; overwrite must be a boolean.` } }), failed: true };
      }
      if (tool === 'mota_load' && (!Number.isInteger(args.slot) || Number(args.slot) < 0 || Number(args.slot) > MAX_SAVE_SLOT)) {
        return { text: JSON.stringify({ error: { code: 'invalid_save_slot', message: `slot must be 0 (latest autosave) or an integer between 1 and ${MAX_SAVE_SLOT}.` } }), failed: true };
      }
      if (ctx.signal?.aborted) return { text: JSON.stringify({ error: { code: 'interrupted', message: 'Action was cancelled before it was sent to the game.' } }), failed: true };
      if (this.actionInFlight) return { text: JSON.stringify({ error: { code: 'action_in_progress', message: 'A game action is already in progress.' } }), failed: true };
      this.actionInFlight = true;
    }
    const id = String(this.nextId++);
    let removeAbortListener = (): void => undefined;
    const cancelMove = (): void => {
      if ((tool !== 'mota_move' && tool !== 'mota_move_to') || ws.readyState !== ws.OPEN) return;
      try { ws.send(JSON.stringify({ v: PROTOCOL, kind: 'cancel', id })); } catch {}
    };
    const result = await new Promise<unknown>((resolve, reject) => {
      const timeout = tool === 'mota_start_game' ? START_REQUEST_TIMEOUT_MS
        : tool === 'mota_move' || tool === 'mota_move_to' || tool === 'mota_fly' ? MOVE_REQUEST_TIMEOUT_MS
        : tool === 'mota_save' || tool === 'mota_load' || tool === 'mota_saves' ? SAVE_REQUEST_TIMEOUT_MS
        : REQUEST_TIMEOUT_MS;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        cancelMove();
        removeAbortListener();
        reject(Object.assign(new Error('Game adapter did not reply in time.'), { code: 'timeout' }));
      }, timeout);
      const onAbort = () => {
        clearTimeout(timer);
        this.pending.delete(id);
        cancelMove();
        removeAbortListener();
        reject(Object.assign(new Error('Action interrupted. The current game input may still finish; read the game state before acting again.'), { code: 'interrupted' }));
      };
      removeAbortListener = () => ctx.signal?.removeEventListener('abort', onAbort);
      this.pending.set(id, { resolve, reject, timer });
      ctx.signal?.addEventListener('abort', onAbort, { once: true });
      if (ctx.signal?.aborted) { onAbort(); return; }
      try { ws.send(JSON.stringify({ v: PROTOCOL, kind: 'request', id, tool, args: args ?? {} })); }
      catch (error) {
        clearTimeout(timer);
        this.pending.delete(id);
        removeAbortListener();
        reject(error);
      }
    }).catch((error: unknown) => ({ error: { code: (error as { code?: string }).code ?? 'bridge_error', message: error instanceof Error ? error.message : String(error) } }))
      .finally(() => {
        removeAbortListener();
        if (ACTION_TOOLS.has(tool)) this.actionInFlight = false;
      });
    if (typeof result === 'object' && result !== null && 'error' in result) {
      return { text: JSON.stringify(result), failed: true };
    }
    if (tool === 'mota_screenshot' && typeof result === 'object' && result !== null) {
      const shot = result as Record<string, unknown>;
      if (shot.mime !== 'image/jpeg' || typeof shot.base64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(shot.base64) || shot.base64.length > Math.ceil(MAX_SCREENSHOT_BYTES * 4 / 3)) {
        return { text: JSON.stringify({ error: { code: 'invalid_screenshot', message: 'The game adapter returned an invalid or oversized screenshot.' } }), failed: true };
      }
      const bytes = Buffer.from(shot.base64, 'base64');
      if (bytes.length > MAX_SCREENSHOT_BYTES) return { text: JSON.stringify({ error: { code: 'screenshot_too_large', message: 'The screenshot exceeds the bridge size limit.' } }), failed: true };
      if (!this.host?.modelFacts.accepts('image/jpeg')) return `The game screenshot was captured (${String(shot.width)}×${String(shot.height)}), but the active model cannot view images.`;
      return {
        text: `Current Magic Tower game area (${String(shot.width)}×${String(shot.height)}). Use it to inspect visual details that are missing from the structured state.`,
        blobs: [{ bytes, mime: 'image/jpeg', name: 'magic-tower.jpg', fallbackText: `Magic Tower game screenshot ${String(shot.width)}×${String(shot.height)}` }],
      };
    }
    if (ACTION_TOOLS.has(tool) && typeof result === 'object' && result !== null && 'state' in result) {
      const receipt = { ...(result as Record<string, unknown>) };
      const state = receipt.state;
      delete receipt.state;
      if (this.cfg.periodicReport !== false) {
        this.actionRoundCount++;
        if (this.actionRoundCount >= 30) {
          this.actionRoundCount = 0;
          receipt.periodicReport = '你已连续行动推进满 30 轮，请在下一步使用 pet_say 向主人简单汇报一下当前楼层、血量与推塔进展，汇报后继续推塔。';
        }
      }
      if (state && typeof state === 'object' && typeof (state as Record<string, unknown>).stateVersion === 'number') {
        this.latestState = state as Record<string, unknown>;
        this.lastStateVersion = Math.max(this.lastStateVersion, Number(this.latestState.stateVersion));
        if (this.latestState.stateVersion !== this.autoplayWakeStateVersion) {
          this.autoplayWakePendingUntil = 0;
          this.autoplayWakeStateVersion = null;
        }
      }
      return JSON.stringify(receipt);
    }
    return JSON.stringify(result);
  }
}
