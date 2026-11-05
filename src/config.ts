import type { ConfigGroup } from 'cortico/core/types.ts';
import type { Language } from 'cortico/core/language.ts';

export interface MotaConfigSection {
  enabled: boolean;
  autoplay: boolean;
  autoplayIntervalSeconds: number;
  periodicReport: boolean;
  port: number;
  gameOrigin: string;
  token: string;
}

export const MOTA_DEFAULTS: MotaConfigSection = {
  enabled: false,
  autoplay: false,
  autoplayIntervalSeconds: 60,
  periodicReport: true,
  port: 1060,
  gameOrigin: 'http://127.0.0.1:1055',
  token: '',
};

const COPY: Record<Language, {
  title: string; port: string; portDesc: string; origin: string; originDesc: string;
  connectionTitle: string; connectionDesc: string;
}> = {
  zh: {
    title: 'h5魔塔（50层）', port: '桥接端口', portDesc: '本机 WebSocket 服务端口，修改后需重启 World。',
    origin: '游戏来源', originDesc: '本地游戏页面的完整 HTTP 来源，必须与浏览器地址栏中的来源完全一致。',
    connectionTitle: '游戏连接', connectionDesc: '先生成并保存令牌。game-adapter.js 放在插件安装目录的 src 文件夹；已填令牌的 coopanion.js 放在魔塔目录的 extensions 文件夹。',
  },
  'zh-Hant': {
    title: 'h5魔塔（50層）', port: '橋接埠', portDesc: '本機 WebSocket 服務埠，修改後需重新啟動 World。',
    origin: '遊戲來源', originDesc: '本機遊戲頁面的完整 HTTP 來源，必須與瀏覽器網址列完全一致。',
    connectionTitle: '遊戲連線', connectionDesc: '先產生並儲存權杖。game-adapter.js 放在插件安裝目錄的 src 資料夾；已填入權杖的 coopanion.js 放在魔塔目錄的 extensions 資料夾。',
  },
  en: {
    title: 'H5 Magic Tower (50 floors)', port: 'Bridge port', portDesc: 'Local WebSocket port; restart the World after changing it.',
    origin: 'Game origin', originDesc: 'Exact HTTP origin of the local game page; it must match the browser address bar.',
    connectionTitle: 'Game connection', connectionDesc: 'Generate and save a token. Put game-adapter.js in the plugin install directory’s src folder and the token-filled coopanion.js in the game’s extensions folder.',
  },
  ja: {
    title: 'H5 Magic Tower (50 floors)', port: 'ブリッジポート', portDesc: 'ローカル WebSocket ポート。変更後は World を再起動してください。',
    origin: 'ゲームのオリジン', originDesc: 'ローカルゲームページの正確な HTTP オリジン。ブラウザーのアドレスと一致させてください。',
    connectionTitle: 'ゲーム接続', connectionDesc: 'トークンを生成して保存します。game-adapter.js はプラグインのインストール先の src に、トークン設定済みの coopanion.js はゲームの extensions に配置します。',
  },
  ko: {
    title: 'H5 Magic Tower (50 floors)', port: '브리지 포트', portDesc: '로컬 WebSocket 포트입니다. 변경 후 World를 다시 시작하세요.',
    origin: '게임 Origin', originDesc: '로컬 게임 페이지의 정확한 HTTP Origin입니다. 브라우저 주소와 일치해야 합니다.',
    connectionTitle: '게임 연결', connectionDesc: '토큰을 생성하고 저장하세요. game-adapter.js는 플러그인 설치 경로의 src 폴더에, 토큰이 입력된 coopanion.js는 게임 extensions 폴더에 넣으세요.',
  },
  fr: {
    title: 'H5 Magic Tower (50 floors)', port: 'Port du pont', portDesc: 'Port WebSocket local ; redémarrez le World après modification.',
    origin: 'Origine du jeu', originDesc: 'Origine HTTP exacte de la page locale du jeu ; elle doit correspondre à la barre d’adresse.',
    connectionTitle: 'Connexion au jeu', connectionDesc: 'Générez et enregistrez un jeton. Placez game-adapter.js dans src du dossier d’installation du plugin et coopanion.js configuré dans extensions du jeu.',
  },
  de: {
    title: 'H5 Magic Tower (50 floors)', port: 'Bridge-Port', portDesc: 'Lokaler WebSocket-Port; World nach einer Änderung neu starten.',
    origin: 'Spiel-Origin', originDesc: 'Exakter HTTP-Origin der lokalen Spielseite; er muss der Browser-Adresszeile entsprechen.',
    connectionTitle: 'Spielverbindung', connectionDesc: 'Erzeuge und speichere ein Token. Lege game-adapter.js im src-Ordner der Plugin-Installation und die konfigurierte coopanion.js im extensions-Ordner des Spiels ab.',
  },
  'es-419': {
    title: 'H5 Magic Tower (50 floors)', port: 'Puerto del puente', portDesc: 'Puerto WebSocket local; reinicia el World después de cambiarlo.',
    origin: 'Origen del juego', originDesc: 'Origen HTTP exacto de la página local del juego; debe coincidir con la barra del navegador.',
    connectionTitle: 'Conexión del juego', connectionDesc: 'Genera y guarda un token. Coloca game-adapter.js en src dentro de la instalación del plugin y coopanion.js configurado en extensions del juego.',
  },
  'pt-BR': {
    title: 'H5 Magic Tower (50 floors)', port: 'Porta da ponte', portDesc: 'Porta WebSocket local; reinicie o World após alterar.',
    origin: 'Origem do jogo', originDesc: 'Origem HTTP exata da página local do jogo; deve corresponder à barra do navegador.',
    connectionTitle: 'Conexão do jogo', connectionDesc: 'Gere e salve um token. Coloque game-adapter.js em src na instalação do plugin e o coopanion.js configurado em extensions do jogo.',
  },
  it: {
    title: 'H5 Magic Tower (50 floors)', port: 'Porta del bridge', portDesc: 'Porta WebSocket locale; riavvia il World dopo la modifica.',
    origin: 'Origine del gioco', originDesc: 'Origine HTTP esatta della pagina locale del gioco; deve corrispondere alla barra del browser.',
    connectionTitle: 'Connessione al gioco', connectionDesc: 'Genera e salva un token. Metti game-adapter.js in src nella cartella di installazione del plugin e coopanion.js configurato in extensions del gioco.',
  },
  ru: {
    title: 'H5 Magic Tower (50 floors)', port: 'Порт моста', portDesc: 'Локальный порт WebSocket; после изменения перезапустите World.',
    origin: 'Источник игры', originDesc: 'Точный HTTP-источник локальной страницы игры; он должен совпадать с адресом в браузере.',
    connectionTitle: 'Подключение игры', connectionDesc: 'Создайте и сохраните токен. Поместите game-adapter.js в src папки установки плагина, а настроенный coopanion.js — в extensions игры.',
  },
};

export function motaConnectionText(language: Language): Pick<(typeof COPY)[Language], 'connectionTitle' | 'connectionDesc'> {
  const { connectionTitle, connectionDesc } = COPY[language];
  return { connectionTitle, connectionDesc };
}

export function motaConfigGroup(language: Language): ConfigGroup {
  const c = COPY[language];
  return {
    id: 'world:mota', owner: 'world:mota',
    schema: {
      type: 'object', title: c.title, description: motaHighCostNotice(language),
      properties: {
        'worlds.mota.port': { type: 'integer', title: c.port, description: c.portDesc, minimum: 1024, maximum: 65535, 'x-hot': false },
        'worlds.mota.gameOrigin': { type: 'string', title: c.origin, description: c.originDesc, 'x-hot': false },
      },
    },
  };
}

const NAMES: Partial<Record<Language, string>> = { zh: 'h5魔塔（50层）', 'zh-Hant': 'h5魔塔（50層）' };
const DEFAULT_NAME = 'H5 Magic Tower (50 floors)';

/** Display name of the World in the console for `language`. */
export function motaDisplayName(language: Language): string {
  return NAMES[language] ?? DEFAULT_NAME;
}

const NOTICE: Partial<Record<Language, string>> = {
  zh: '⚠ 高消耗插件：开启主动推塔后，Coo 会按间隔持续调用模型，推塔期间 Token 消耗很大，请留意用量与费用。',
  'zh-Hant': '⚠ 高消耗插件：開啟主動推塔後，Coo 會依間隔持續呼叫模型，推塔期間 Token 消耗很大，請留意用量與費用。',
  en: '⚠ High-consumption plugin: with autonomous play on, Coo keeps calling the model at the set interval and uses a lot of tokens. Watch your usage and cost.',
};

/** The high-consumption warning shown on the settings page. */

const INTRO_TITLES: Partial<Record<Language, string>> = {
  zh: '插件说明',
  'zh-Hant': '插件說明',
  en: 'Plugin Guide',
};

/** Display title of the intro/guide panel in the console for `language`. */
export function motaIntroTitle(language: Language): string {
  return INTRO_TITLES[language] ?? 'Plugin Guide';
}

export function motaHighCostNotice(language: Language): string {
  return NOTICE[language] ?? NOTICE.en!;
}

const PROMPT_DOC = {
  zh: {
    title: '魔塔 · 环境提示词',
    description: 'Coo 在魔塔 World 启用期间读取的行为说明。',
    vars: {
      'mota.phase': '最近一次观察到的游戏阶段。',
      'mota.autoplay': '魔塔 World 是否开启了主动推塔。',
      'mota.autoplay_interval': '主动推塔的唤醒间隔（秒）。',
      'mota.screenshot': '已连接的游戏 Adapter 是否支持截图。',
    },
  },
  'zh-Hant': {
    title: '魔塔 · 環境提示詞',
    description: 'Coo 在魔塔 World 啟用期間讀取的行為說明。',
    vars: {
      'mota.phase': '最近一次觀察到的遊戲階段。',
      'mota.autoplay': '魔塔 World 是否開啟了主動推塔。',
      'mota.autoplay_interval': '主動推塔的喚醒間隔（秒）。',
      'mota.screenshot': '已連線的遊戲 Adapter 是否支援截圖。',
    },
  },
  en: {
    title: 'H5 Magic Tower · Environment prompt',
    description: 'Instructions Coo reads while the Magic Tower World is mounted.',
    vars: {
      'mota.phase': 'Most recently observed game phase.',
      'mota.autoplay': 'Whether autonomous tower play is enabled in the Mota World.',
      'mota.autoplay_interval': 'Seconds between autonomous progress checks.',
      'mota.screenshot': 'Whether the connected game adapter supports screenshots.',
    },
  },
} as const;

/** Title, description, and variable descriptions of the environment prompt tab. */
export function motaPromptDocText(language: Language): { title: string; description: string; vars: Array<{ name: string; description: string }> } {
  const doc = PROMPT_DOC[language as keyof typeof PROMPT_DOC] ?? PROMPT_DOC.en;
  return { title: doc.title, description: doc.description, vars: Object.entries(doc.vars).map(([name, description]) => ({ name, description })) };
}
