const TEXT = {
  zh: { token: '连接令牌', help: '先生成并保存令牌。game-adapter.js 是插件模板，放在插件安装目录的 src 文件夹；coopanion.js 已填入令牌，放在魔塔目录的 extensions 文件夹。令牌以明文保存在 Coopanion 配置中。', generate: '生成并保存令牌', copy: '复制令牌', downloadTemplate: '下载 game-adapter.js', downloadConfigured: '下载 coopanion.js', openFolder: '打开插件安装文件夹', saved: '令牌已保存', templateDownloaded: '请将下载的模板放入 Coopanion 插件安装目录下的 src 文件夹内。', adapterDownloaded: '请将下载的模板放入魔塔游戏目录下的 extensions 文件夹内。', copied: '令牌已保存并复制', opened: '已打开插件安装文件夹', empty: '请先生成或输入令牌。', copyFailed: '复制失败，请手动复制输入框内容。', error: '操作失败：' },
  'zh-Hant': { token: '連線權杖', help: '先產生並儲存權杖。game-adapter.js 是插件範本，放在插件安裝目錄的 src 資料夾；coopanion.js 已填入權杖，放在魔塔目錄的 extensions 資料夾。權杖以明文保存在 Coopanion 設定中。', generate: '產生並儲存權杖', copy: '複製權杖', downloadTemplate: '下載 game-adapter.js', downloadConfigured: '下載 coopanion.js', openFolder: '開啟插件安裝資料夾', saved: '權杖已儲存', templateDownloaded: '請將下載的範本放入 Coopanion 插件安裝目錄下的 src 資料夾。', adapterDownloaded: '請將下載的設定檔放入魔塔遊戲目錄下的 extensions 資料夾。', copied: '權杖已儲存並複製', opened: '已開啟插件安裝資料夾', empty: '請先產生或輸入權杖。', copyFailed: '複製失敗，請手動複製輸入框內容。', error: '操作失敗：' },
  en: { token: 'Connection token', help: 'Generate and save a token first. Put game-adapter.js in the plugin install directory’s src folder. coopanion.js contains the saved token and goes in the game’s extensions folder. The token is stored in plain text in Coopanion configuration.', generate: 'Generate and save token', copy: 'Copy token', downloadTemplate: 'Download game-adapter.js', downloadConfigured: 'Download coopanion.js', openFolder: 'Open plugin install folder', saved: 'Token saved', templateDownloaded: 'Place the downloaded template in the src folder under the Coopanion plugin install directory.', adapterDownloaded: 'Place the downloaded configuration file in the game’s extensions folder.', copied: 'Token saved and copied', opened: 'Plugin install folder opened', empty: 'Generate or enter a token first.', copyFailed: 'Copy failed. Copy the field manually.', error: 'Operation failed: ' },
  ja: { token: '接続トークン', help: '先にトークンを生成して保存してください。game-adapter.js はプラグインのインストール先にある src フォルダーに配置します。トークン設定済みの coopanion.js はゲームの extensions フォルダーに配置します。', generate: '生成して保存', copy: 'トークンをコピー', downloadTemplate: 'game-adapter.js をダウンロード', downloadConfigured: 'coopanion.js をダウンロード', openFolder: 'プラグインのインストールフォルダーを開く', saved: 'トークンを保存しました', templateDownloaded: 'ダウンロードしたテンプレートを Coopanion プラグインのインストール先にある src フォルダーへ配置してください。', adapterDownloaded: 'ダウンロードした設定ファイルをゲームの extensions フォルダーへ配置してください。', copied: '保存してコピーしました', opened: 'プラグインのインストールフォルダーを開きました', empty: '先にトークンを生成または入力してください。', copyFailed: 'コピーできません。入力欄から手動でコピーしてください。', error: '操作に失敗しました：' },
  ko: { token: '연결 토큰', help: '먼저 토큰을 생성하고 저장하세요. game-adapter.js는 플러그인 설치 경로의 src 폴더에 넣습니다. 토큰이 입력된 coopanion.js는 게임의 extensions 폴더에 넣습니다.', generate: '토큰 생성 및 저장', copy: '토큰 복사', downloadTemplate: 'game-adapter.js 다운로드', downloadConfigured: 'coopanion.js 다운로드', openFolder: '플러그인 설치 폴더 열기', saved: '토큰을 저장했습니다', templateDownloaded: '다운로드한 템플릿을 Coopanion 플러그인 설치 경로의 src 폴더에 넣으세요.', adapterDownloaded: '다운로드한 설정 파일을 게임의 extensions 폴더에 넣으세요.', copied: '저장하고 복사했습니다', opened: '플러그인 설치 폴더를 열었습니다', empty: '먼저 토큰을 생성하거나 입력하세요.', copyFailed: '복사하지 못했습니다. 입력란에서 직접 복사하세요.', error: '작업 실패: ' },
  fr: { token: 'Jeton de connexion', help: 'Enregistrez un jeton. Placez game-adapter.js dans src du dossier d’installation du plugin. Placez coopanion.js, qui contient le jeton, dans extensions du jeu.', generate: 'Générer et enregistrer le jeton', copy: 'Copier le jeton', downloadTemplate: 'Télécharger game-adapter.js', downloadConfigured: 'Télécharger coopanion.js', openFolder: 'Ouvrir le dossier du plugin', saved: 'Jeton enregistré', templateDownloaded: 'Placez le modèle téléchargé dans le dossier src de l’installation du plugin Coopanion.', adapterDownloaded: 'Placez le fichier téléchargé dans le dossier extensions du jeu.', copied: 'Jeton enregistré et copié', opened: 'Dossier du plugin ouvert', empty: 'Générez ou saisissez d’abord un jeton.', copyFailed: 'Échec de la copie. Copiez le champ manuellement.', error: 'Échec : ' },
  de: { token: 'Verbindungstoken', help: 'Speichere ein Token. Lege game-adapter.js im Ordner src der Plugin-Installation ab. Lege coopanion.js mit dem Token im extensions-Ordner des Spiels ab.', generate: 'Token erzeugen und speichern', copy: 'Token kopieren', downloadTemplate: 'game-adapter.js herunterladen', downloadConfigured: 'coopanion.js herunterladen', openFolder: 'Plugin-Installationsordner öffnen', saved: 'Token gespeichert', templateDownloaded: 'Lege die heruntergeladene Vorlage im Ordner src der Coopanion-Plugin-Installation ab.', adapterDownloaded: 'Lege die heruntergeladene Datei im extensions-Ordner des Spiels ab.', copied: 'Token gespeichert und kopiert', opened: 'Plugin-Installationsordner geöffnet', empty: 'Erzeuge zuerst ein Token oder gib eines ein.', copyFailed: 'Kopieren fehlgeschlagen. Kopiere den Inhalt manuell.', error: 'Aktion fehlgeschlagen: ' },
  'es-419': { token: 'Token de conexión', help: 'Guarda un token. Coloca game-adapter.js en src dentro de la instalación del plugin. Coloca coopanion.js, que contiene el token, en extensions del juego.', generate: 'Generar y guardar token', copy: 'Copiar token', downloadTemplate: 'Descargar game-adapter.js', downloadConfigured: 'Descargar coopanion.js', openFolder: 'Abrir carpeta de instalación del plugin', saved: 'Token guardado', templateDownloaded: 'Coloca la plantilla descargada en src dentro de la instalación del plugin Coopanion.', adapterDownloaded: 'Coloca el archivo descargado en extensions del juego.', copied: 'Token guardado y copiado', opened: 'Carpeta del plugin abierta', empty: 'Primero genera o escribe un token.', copyFailed: 'No se pudo copiar. Copia el campo manualmente.', error: 'Error: ' },
  'pt-BR': { token: 'Token de conexão', help: 'Salve um token. Coloque game-adapter.js em src na pasta de instalação do plugin. Coloque coopanion.js, que contém o token, em extensions do jogo.', generate: 'Gerar e salvar token', copy: 'Copiar token', downloadTemplate: 'Baixar game-adapter.js', downloadConfigured: 'Baixar coopanion.js', openFolder: 'Abrir pasta de instalação do plugin', saved: 'Token salvo', templateDownloaded: 'Coloque o modelo baixado na pasta src da instalação do plugin Coopanion.', adapterDownloaded: 'Coloque o arquivo baixado na pasta extensions do jogo.', copied: 'Token salvo e copiado', opened: 'Pasta do plugin aberta', empty: 'Gere ou digite um token primeiro.', copyFailed: 'Falha ao copiar. Copie o campo manualmente.', error: 'Falha na operação: ' },
  it: { token: 'Token di connessione', help: 'Salva un token. Metti game-adapter.js in src nella cartella di installazione del plugin. Metti coopanion.js con il token in extensions del gioco.', generate: 'Genera e salva token', copy: 'Copia token', downloadTemplate: 'Scarica game-adapter.js', downloadConfigured: 'Scarica coopanion.js', openFolder: 'Apri cartella di installazione plugin', saved: 'Token salvato', templateDownloaded: 'Metti il modello scaricato nella cartella src dell’installazione del plugin Coopanion.', adapterDownloaded: 'Metti il file scaricato nella cartella extensions del gioco.', copied: 'Token salvato e copiato', opened: 'Cartella del plugin aperta', empty: 'Genera o inserisci prima un token.', copyFailed: 'Copia non riuscita. Copia manualmente il campo.', error: 'Operazione non riuscita: ' },
  ru: { token: 'Токен подключения', help: 'Сохраните токен. Поместите game-adapter.js в src папки установки плагина. Файл coopanion.js с токеном поместите в extensions игры.', generate: 'Создать и сохранить токен', copy: 'Копировать токен', downloadTemplate: 'Скачать game-adapter.js', downloadConfigured: 'Скачать coopanion.js', openFolder: 'Открыть папку установки плагина', saved: 'Токен сохранён', templateDownloaded: 'Поместите скачанный шаблон в папку src установки плагина Coopanion.', adapterDownloaded: 'Поместите скачанный файл в папку extensions игры.', copied: 'Токен сохранён и скопирован', opened: 'Папка плагина открыта', empty: 'Сначала создайте или введите токен.', copyFailed: 'Не удалось скопировать. Скопируйте поле вручную.', error: 'Не удалось выполнить действие: ' },
};

const AUTOPLAY_TEXT = {
  zh: { title: '主动推塔', desc: '开启后，游戏进行时会按下方间隔唤醒 Coo，无需新消息即可继续推塔。遇到需要你决定的选项、异常或游戏结束时会停下。', enabled: '主动推塔已开启', disabled: '主动推塔已暂停', enable: '启用主动推塔', pause: '暂停主动推塔', periodicReport: '阶段战况汇报（每 30 轮）', periodicReportDesc: '开启后，桌宠每推塔推进满 30 轮行动，会主动使用气泡向主人简要汇报当前战况。', reportOn: '阶段汇报已开启', reportOff: '阶段汇报已关闭' },
  'zh-Hant': { title: '主動推塔', desc: '開啟後，遊戲進行時會依照下方間隔喚醒 Coo，無需新訊息即可繼續推塔。遇到需要你決定的選項、異常或遊戲結束時會停止。', enabled: '主動推塔已開啟', disabled: '主動推塔已暫停', enable: '啟用主動推塔', pause: '暫停主動推塔', periodicReport: '階段戰況匯報（每 30 輪）', periodicReportDesc: '開啟後，桌寵每推塔推進滿 30 輪行動，會主動使用氣泡向主人簡要匯報當前戰況。', reportOn: '階段匯報已開啟', reportOff: '階段匯報已關閉' },
  en: { title: 'Autonomous tower play', desc: 'When enabled, Coo wakes at the interval below while the game is active and continues without a new message. It stops for choices that need your judgment, errors, or game over.', enabled: 'Autonomous play is on', disabled: 'Autonomous play is paused', enable: 'Enable autonomous play', pause: 'Pause autonomous play', periodicReport: 'Periodic battle report (every 30 actions)', periodicReportDesc: 'When enabled, Coo periodically uses bubble speech to report progress to the master every 30 actions.', reportOn: 'Periodic report is on', reportOff: 'Periodic report is off' },
  ja: { title: '自動で塔を進む', desc: '有効にすると、ゲーム中は設定した間隔で Coo が起動し、新しいメッセージなしで攻略を続けます。判断が必要な選択肢、エラー、ゲーム終了で停止します。', enabled: '自動攻略は有効です', disabled: '自動攻略は一時停止中です', enable: '自動攻略を有効にする', pause: '自動攻略を一時停止する', periodicReport: '定期戦況レポート（30手ごと）', periodicReportDesc: '有効にすると、Cooは30手行動するごとに吹き出しで戦況を簡単に報告します。', reportOn: '定期レポート有効', reportOff: '定期レポート無効' },
  ko: { title: '자동 탑 진행', desc: '켜면 게임이 진행 중일 때 설정한 간격으로 Coo가 깨어나 새 메시지 없이 계속 진행합니다. 판단이 필요한 선택지, 오류 또는 게임 종료 시 멈춥니다.', enabled: '자동 진행 켜짐', disabled: '자동 진행 일시 중지됨', enable: '자동 진행 켜기', pause: '자동 진행 일시 중지', periodicReport: '정기 상황 보고(30행동마다)', periodicReportDesc: '켜면 30회 행동할 때마다 말풍선으로 현재 전황을 주인에게 보고합니다.', reportOn: '정기 보고 켜짐', reportOff: '정기 보고 꺼짐' },
  fr: { title: 'Progression autonome', desc: 'Une fois activée, Coo se réveille selon l’intervalle défini pendant la partie et continue sans nouveau message. Elle s’arrête devant un choix qui demande votre avis, une erreur ou la fin de partie.', enabled: 'Progression autonome activée', disabled: 'Progression autonome en pause', enable: 'Activer la progression autonome', pause: 'Mettre en pause', periodicReport: 'Rapport périodique (toutes les 30 actions)', periodicReportDesc: 'Active un court compte-rendu toutes les 30 actions.', reportOn: 'Rapport activé', reportOff: 'Rapport désactivé' },
  de: { title: 'Turm automatisch spielen', desc: 'Wenn aktiviert, wacht Coo während des Spiels im eingestellten Intervall auf und spielt ohne neue Nachricht weiter. Bei Entscheidungen, Fehlern oder Spielende hält sie an.', enabled: 'Automatisches Spielen ist aktiv', disabled: 'Automatisches Spielen pausiert', enable: 'Automatisches Spielen aktivieren', pause: 'Automatisches Spielen pausieren', periodicReport: 'Statusbericht (alle 30 Aktionen)', periodicReportDesc: 'Gibt alle 30 Aktionen eine kurze Lagemeldung ab.', reportOn: 'Bericht aktiv', reportOff: 'Bericht inaktiv' },
  'es-419': { title: 'Avance autónomo', desc: 'Al activarlo, Coo se activa con el intervalo configurado mientras la partida esté en curso y avanza sin mensajes nuevos. Se detiene ante decisiones que requieran tu criterio, errores o el fin de la partida.', enabled: 'Avance autónomo activado', disabled: 'Avance autónomo en pausa', enable: 'Activar avance autónomo', pause: 'Pausar avance autónomo', periodicReport: 'Informe periódico (cada 30 acciones)', periodicReportDesc: 'Informa brevemente cada 30 acciones.', reportOn: 'Informe activado', reportOff: 'Informe desactivado' },
  'pt-BR': { title: 'Avanço autônomo', desc: 'Quando ativado, Coo desperta no intervalo configurado durante a partida e avança sem novas mensagens. Ela para diante de escolhas que precisam da sua decisão, erros ou fim de jogo.', enabled: 'Avanço autônomo ativado', disabled: 'Avanço autônomo pausado', enable: 'Ativar avanço autônomo', pause: 'Pausar avanço autônomo', periodicReport: 'Relatório periódico (a cada 30 ações)', periodicReportDesc: 'Relata o progresso brevemente a cada 30 ações.', reportOn: 'Relatório ativado', reportOff: 'Relatório desativado' },
  it: { title: 'Avanzamento autonomo', desc: 'Se attivato, Coo si riattiva secondo l’intervallo configurato durante la partita e avanza senza nuovi messaggi. Si ferma davanti a scelte che richiedono il tuo giudizio, errori o fine partita.', enabled: 'Avanzamento autonomo attivo', disabled: 'Avanzamento autonomo in pausa', enable: 'Attiva avanzamento autonomo', pause: 'Metti in pausa', periodicReport: 'Rapporto periodico (ogni 30 azioni)', periodicReportDesc: 'Invia un breve rapporto ogni 30 azioni.', reportOn: 'Rapporto attivato', reportOff: 'Rapporto disattivato' },
  ru: { title: 'Автономное прохождение', desc: 'После включения Coo просыпается с заданным интервалом во время игры и продолжает без новых сообщений. Она остановится перед выбором, ошибкой или окончанием игры.', enabled: 'Автономное прохождение включено', disabled: 'Автономное прохождение приостановлено', enable: 'Включить автопрохождение', pause: 'Приостановить автопрохождение', periodicReport: 'Периодический отчёт (каждые 30 действий)', periodicReportDesc: 'Кратко сообщает о ходе игры каждые 30 действий.', reportOn: 'Отчёт включён', reportOff: 'Отчёт выключен' },
};

const INTERVAL_TEXT = {
  zh: { label: '唤醒间隔（秒）', help: '范围 60–300 秒，默认 60 秒。', save: '保存间隔', saved: '唤醒间隔已保存', invalid: '请输入 60 到 300 之间的整数。' },
  'zh-Hant': { label: '喚醒間隔（秒）', help: '範圍 60–300 秒，預設 60 秒。', save: '儲存間隔', saved: '喚醒間隔已儲存', invalid: '請輸入 60 到 300 之間的整數。' },
  en: { label: 'Wake interval (seconds)', help: '60–300 seconds; default 60.', save: 'Save interval', saved: 'Wake interval saved', invalid: 'Enter a whole number from 60 to 300.' },
  ja: { label: '起動間隔（秒）', help: '60～300 秒、初期値 60 秒。', save: '間隔を保存', saved: '起動間隔を保存しました', invalid: '60～300 の整数を入力してください。' },
  ko: { label: '깨우기 간격(초)', help: '60~300초, 기본값 60초.', save: '간격 저장', saved: '깨우기 간격을 저장했습니다', invalid: '60~300 사이의 정수를 입력하세요.' },
  fr: { label: 'Intervalle de réveil (secondes)', help: '60 à 300 secondes ; valeur par défaut : 60.', save: 'Enregistrer', saved: 'Intervalle enregistré', invalid: 'Saisissez un entier de 60 à 300.' },
  de: { label: 'Weckintervall (Sekunden)', help: '60–300 Sekunden; Standard: 60.', save: 'Intervall speichern', saved: 'Intervall gespeichert', invalid: 'Gib eine ganze Zahl von 60 bis 300 ein.' },
  'es-419': { label: 'Intervalo de activación (segundos)', help: '60–300 segundos; predeterminado: 60.', save: 'Guardar intervalo', saved: 'Intervalo guardado', invalid: 'Ingresa un entero de 60 a 300.' },
  'pt-BR': { label: 'Intervalo de ativação (segundos)', help: '60–300 segundos; padrão: 60.', save: 'Salvar intervalo', saved: 'Intervalo salvo', invalid: 'Digite um número inteiro de 60 a 300.' },
  it: { label: 'Intervallo di riattivazione (secondi)', help: '60–300 secondi; predefinito: 60.', save: 'Salva intervallo', saved: 'Intervallo salvato', invalid: 'Inserisci un numero intero da 60 a 300.' },
  ru: { label: 'Интервал пробуждения (секунды)', help: '60–300 секунд; по умолчанию: 60.', save: 'Сохранить интервал', saved: 'Интервал сохранён', invalid: 'Введите целое число от 60 до 300.' },
};

function autoplayWords(language) {
  return AUTOPLAY_TEXT[language] ?? AUTOPLAY_TEXT.en;
}

function words(language) {
  return TEXT[language] ?? TEXT.en;
}

function makeToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const NOTICE_TEXT = {
  zh: '⚠ 高消耗插件：开启主动推塔后，Coo 会按间隔持续调用模型，Token 消耗很大，请留意用量与费用。',
  'zh-Hant': '⚠ 高消耗插件：開啟主動推塔後，Coo 會依間隔持續呼叫模型，Token 消耗很大，請留意用量與費用。',
  en: '⚠ High-consumption plugin: with autonomous play on, Coo keeps calling the model at the set interval and uses a lot of tokens. Watch your usage and cost.',
};

/** A bordered box that lays its buttons out in an even grid, every button the same width. */
function buttonBox(ui, columns) {
  const box = ui.h('div', 'mota-button-box');
  box.style.display = 'grid';
  box.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  box.style.gap = '8px';
  box.style.padding = '10px';
  box.style.marginTop = '12px';
  box.style.border = '1px solid var(--border, #d9d9d9)';
  box.style.borderRadius = '8px';
  box.style.background = 'var(--surface-2, rgba(127, 127, 127, 0.06))';
  return box;
}

function fillButton(button, span) {
  button.style.width = '100%';
  button.style.justifyContent = 'center';
  button.style.textAlign = 'center';
  button.style.whiteSpace = 'normal';
  if (span) button.style.gridColumn = `span ${span}`;
  return button;
}

const INTRO_TEXT = {
  zh: {
    title: '插件说明',
    desc: '让桌宠自主游玩 HTML5 魔塔。理论上支持所有基于 HTML5 样板制作的经典魔塔及其衍生变体，支持原生地形探索、全塔物资统筹与陪伴式互动。',
    costTitle: '⚠️ 高消耗特别提示',
    costPoints: [
      '本插件属于高消耗型插件。开启「主动推塔」后，桌宠会按间隔（默认 60 秒）持续自主苏醒，密集读取全图地形与战损矩阵；推塔期间会持续调用模型并产生密集的上下文交互。',
      '模型建议：推荐搭配 DeepSeek-Flash、Gemini-Flash 等高性价比模型。',
      '随手暂停：不玩魔塔或离开电脑时，请在下方点击「暂停主动推塔」，避免产生不必要的 API 消耗。',
    ],
    growthTitle: '🌱 给主人的寄语：陪伴与成长机制',
    growthQuote: '“孩子还在摸索，请给 Ta 一些耐心与指引”',
    growthPoints: [
      '探索迷雾：在没有通关经验的情况下，Coo 只能通过内置工具获取当前已探索区域的信息，并不知道后面楼层的具体隐藏资源与怪物分布。',
      '非全知视角：因为缺少全局上帝视角，Coo 规划出的路线通常不是理论最优解，前期的探索策略甚至可能显得比人类玩家还要笨拙。',
      '共同成长：请不要指望孩子能一路轻松平推通关，魔塔的真正魅力本就在于试错与复盘。遇到卡关、绕路或算错战损时，请耐心地在聊天中教导与指点 Coo，Ta 会听，也会在您的陪伴中越学越聪明。',
    ],
    featuresTitle: '✨ 核心特性亮点',
    features: [
      '智能瞬移与原生地形探索：支持直接指定门、道具、怪物或楼梯坐标；开阔直达自动极速瞬移，遇阻自动步行寻路，保留原生碰撞判定与剧情触发。',
      '全塔物资全局账本：内置 mota_resources 工具，随时检索盘点所有已探楼层遗留的钥匙、药水与宝石，彻底解决大模型在长上下文中遗忘低层资源的难题。',
      '飞行器与主动存读档：支持使用飞行器快捷跳层，支持主动存档与读档，方便随时试错与回退。',
      '阶段战况简报与遇阻求助：每行动 30 轮主动向主人气泡汇报当前进展；遇到钥匙断供、战损不足等真正死锁时，主动向主人发泡商量对策，拒绝默默放弃。',
    ],
    feedbackTitle: '💌 持续优化与反馈',
    feedbackDesc: '本插件正在持续优化中，如有 bug 及建议可随时反馈，谢谢！',
  },
  'zh-Hant': {
    title: '插件說明',
    desc: '讓桌寵自主遊玩 HTML5 魔塔。理論上支援所有基於 HTML5 樣板製作的經典魔塔及其衍生變體，支援原生地形探索、全塔物資統籌與陪伴式互動。',
    costTitle: '⚠️ 高消耗特別提示',
    costPoints: [
      '本插件屬於高消耗型插件。開啟「主動推塔」後，桌寵會依間隔（預設 60 秒）持續自主甦醒，密集讀取全圖地形與戰損矩陣；推塔期間會持續呼叫模型並產生密集的上下文互動。',
      '模型建議：推薦搭配 DeepSeek-Flash、Gemini-Flash 等高性價比模型。',
      '隨手暫停：不玩魔塔或離開電腦時，請在下方點擊「暫停主動推塔」，避免產生不必要的 API 消耗。',
    ],
    growthTitle: '🌱 給主人的寄語：陪伴與成長機制',
    growthQuote: '“孩子還在摸索，請給 Ta 一些耐心與指引”',
    growthPoints: [
      '探索迷霧：在沒有通關經驗的情況下，Coo 只能透過內建工具獲取當前已探索區域的資訊，並不知道後面樓層的具體隱藏資源與怪物分佈。',
      '非全知視角：因為缺少全局上帝視角，Coo 規劃出的路線通常不是理論最優解，前期的探索策略甚至可能顯得比人類玩家還要笨拙。',
      '共同成長：請不要指望孩子能一路輕鬆平推通關，魔塔的真正魅力本就在於試錯與複盤。遇到卡關、繞路或算錯戰損時，請耐心地在聊天中教導與指點 Coo，Ta 會聽，也會在您的陪伴中越學越聰明。',
    ],
    featuresTitle: '✨ 核心特性亮點',
    features: [
      '智慧瞬移與原生地形探索：支援直接指定門、道具、怪物或樓梯座標；開闊直達自動極速瞬移，遇阻自動步行尋路，保留原生碰撞判定與劇情觸發。',
      '全塔物資全局帳本：內建 mota_resources 工具，隨時檢索盤點所有已探樓層遺留的鑰匙、藥水與寶石，徹底解決大模型在長上下文中遺忘低層資源的難題。',
      '飛行器與主動存讀檔：支援使用飛行器快捷跳層，支援主動存檔與讀檔，方便隨時試錯與回退。',
      '階段戰況簡報與遇阻求助：每行動 30 輪主動向主人氣泡匯報當前進展；遇到鑰匙斷供、戰損不足等真正死鎖時，主動向主人發泡商量對策，拒絕默默放棄。',
    ],
    feedbackTitle: '💌 持續優化與反饋',
    feedbackDesc: '本插件正在持續優化中，如有 bug 及建議可隨時反饋，謝謝！',
  },
  en: {
    title: 'Plugin Overview',
    desc: 'Empowers Coo to autonomously play HTML5 Magic Tower games. Theoretically supports any classic Magic Tower or derivative variant built on HTML5 templates, with native terrain exploration, tower-wide resource ledgers, and interactive companion updates.',
    costTitle: '⚠️ High Consumption Warning',
    costPoints: [
      'This is a high-token-consumption plugin. When Autonomous Play is enabled, Coo wakes periodically (60s default) to analyze the floor map and damage matrix, leading to dense model calls and context interactions.',
      'Recommended models: DeepSeek-Flash, Gemini-Flash, or other cost-effective models.',
      'Pause anytime: When away or pausing gameplay, click "Pause autonomous play" below to prevent unnecessary API costs.',
    ],
    growthTitle: '🌱 Note to Masters: Companionship & Learning',
    growthQuote: '"Your companion is still learning — please offer patience and guidance"',
    growthPoints: [
      'Fog of Exploration: Without prior playthroughs, Coo only perceives tiles and objects in currently visited floors and cannot foresee hidden secrets or future traps.',
      'Heuristic Pathing: Without omniscient foresight, routes chosen may not be mathematically optimal and early strategies may appear unpolished.',
      'Grow Together: Tower climbing is about trial, error, and planning. When stuck, guide Coo via chat — Coo listens, learns, and improves with your guidance.',
    ],
    featuresTitle: '✨ Key Highlights',
    features: [
      'Smart Teleport & Routing: Target items, doors, stairs, or enemies directly; automatically teleports when clear and routes via walking when obstructed.',
      'Tower Resource Ledger: Queries uncollected keys, potions, and gems across all visited floors, solving context memory limits.',
      'Floor Jump & Active Save/Load: Supports fast-travel via the floor jump device, along with active saving and loading for easy experimentation and backtracking.',
      'Periodic Battle Briefings & Asking for Help: Reports progress every 30 actions, and actively asks the master for advice via bubbles upon softlocks.',
    ],
    feedbackTitle: '💌 Continuous Improvement',
    feedbackDesc: 'This plugin is actively maintained and optimized. Feedback, bug reports, and suggestions are always welcome!',
  },
};

const introPanel = {
  mount(ctx) {
    const { ui, root } = ctx;
    const intro = INTRO_TEXT[ctx.language] ?? INTRO_TEXT.en;

    const introCard = ui.sheet({ title: intro.title, desc: intro.desc });

    // 1. High-consumption warning
    const costBox = ui.h('div', 'mota-intro-cost-box');
    costBox.style.margin = '0 0 16px';
    costBox.style.padding = '10px 12px';
    costBox.style.border = '1px solid var(--warn, #e0a030)';
    costBox.style.borderRadius = '8px';
    costBox.style.background = 'rgba(224, 160, 48, 0.12)';
    const costTitleEl = ui.h('strong', 'mota-intro-cost-title', intro.costTitle);
    costTitleEl.style.display = 'block';
    costTitleEl.style.marginBottom = '6px';
    const costList = ui.h('ul', 'mota-intro-cost-list');
    costList.style.margin = '0';
    costList.style.paddingLeft = '20px';
    costList.style.fontSize = '13px';
    costList.style.lineHeight = '1.6';
    for (const pt of intro.costPoints) {
      const li = ui.h('li', '', pt);
      costList.append(li);
    }
    costBox.append(costTitleEl, costList);

    // 2. Note to masters (Growth & Companionship)
    const growthBox = ui.h('div', 'mota-intro-growth-box');
    growthBox.style.margin = '0 0 16px';
    growthBox.style.padding = '10px 12px';
    growthBox.style.border = '1px solid var(--border, #d9d9d9)';
    growthBox.style.borderRadius = '8px';
    growthBox.style.background = 'var(--surface-2, rgba(127, 127, 127, 0.05))';
    const growthTitleEl = ui.h('strong', 'mota-intro-growth-title', intro.growthTitle);
    growthTitleEl.style.display = 'block';
    growthTitleEl.style.marginBottom = '4px';
    const growthQuoteEl = ui.h('p', 'mota-intro-growth-quote', intro.growthQuote);
    growthQuoteEl.style.fontStyle = 'italic';
    growthQuoteEl.style.margin = '0 0 6px';
    growthQuoteEl.style.color = 'var(--text-dim, #666)';
    const growthList = ui.h('ul', 'mota-intro-growth-list');
    growthList.style.margin = '0';
    growthList.style.paddingLeft = '20px';
    growthList.style.fontSize = '13px';
    growthList.style.lineHeight = '1.6';
    for (const pt of intro.growthPoints) {
      const li = ui.h('li', '', pt);
      growthList.append(li);
    }
    growthBox.append(growthTitleEl, growthQuoteEl, growthList);

    // 3. Features
    const featBox = ui.h('div', 'mota-intro-feat-box');
    featBox.style.margin = '0 0 16px';
    const featTitleEl = ui.h('strong', 'mota-intro-feat-title', intro.featuresTitle);
    featTitleEl.style.display = 'block';
    featTitleEl.style.marginBottom = '6px';
    const featList = ui.h('ol', 'mota-intro-feat-list');
    featList.style.margin = '0';
    featList.style.paddingLeft = '20px';
    featList.style.fontSize = '13px';
    featList.style.lineHeight = '1.6';
    for (const f of intro.features) {
      const li = ui.h('li', '', f);
      featList.append(li);
    }
    featBox.append(featTitleEl, featList);

    // 4. Ongoing optimization & feedback
    const feedbackBox = ui.h('div', 'mota-intro-feedback-box');
    feedbackBox.style.padding = '8px 12px';
    feedbackBox.style.border = '1px dashed var(--border, #ccc)';
    feedbackBox.style.borderRadius = '6px';
    feedbackBox.style.fontSize = '13px';
    feedbackBox.style.background = 'var(--surface-3, rgba(127, 127, 127, 0.03))';
    const feedbackTitleEl = ui.h('strong', '', intro.feedbackTitle);
    feedbackTitleEl.style.display = 'inline-block';
    feedbackTitleEl.style.marginRight = '8px';
    const feedbackTextEl = ui.h('span', '', intro.feedbackDesc);
    feedbackBox.append(feedbackTitleEl, feedbackTextEl);

    introCard.body.append(costBox, growthBox, featBox, feedbackBox);
    root.append(introCard.el);
  },
};

const connectionPanel = {
  mount(ctx) {
    const t = words(ctx.language);
    const a = autoplayWords(ctx.language);
    const intervalText = INTERVAL_TEXT[ctx.language] ?? INTERVAL_TEXT.en;
    const { ui, root } = ctx;
    const card = ui.sheet({ title: t.token, desc: t.help });
    const label = ui.h('label', 'mota-token-label', t.token);
    const input = ui.input({ type: 'text', value: '', onChange: () => { message.textContent = ''; } });
    input.id = 'mota-connection-token';
    input.autocomplete = 'off';
    input.spellcheck = false;
    label.htmlFor = input.id;

    const row = ui.h('div', 'mota-token-row');
    row.style.display = 'flex';
    row.style.gap = '8px';
    input.style.flex = '1 1 auto';
    input.style.width = '100%';
    row.append(input);

    const generate = fillButton(ui.button(t.generate, { size: 'sm', variant: 'primary' }));
    const copy = fillButton(ui.button(t.copy, { size: 'sm' }));
    const downloadTemplate = fillButton(ui.button(t.downloadTemplate, { size: 'sm' }));
    const downloadConfigured = fillButton(ui.button(t.downloadConfigured, { size: 'sm' }));
    const openFolder = fillButton(ui.button(t.openFolder, { size: 'sm' }), 2);
    const actions = buttonBox(ui, 2);
    actions.append(generate, copy, downloadTemplate, downloadConfigured, openFolder);
    const message = ui.msgline('', true);
    card.body.append(label, row, actions, message);
    root.append(card.el);

    const autoplayCard = ui.sheet({ title: a.title, desc: a.desc });
    const notice = ui.h('p', 'mota-high-cost-notice', NOTICE_TEXT[ctx.language] ?? NOTICE_TEXT.en);
    notice.style.margin = '0 0 12px';
    notice.style.padding = '8px 10px';
    notice.style.border = '1px solid var(--warn, #e0a030)';
    notice.style.borderRadius = '8px';
    notice.style.background = 'rgba(224, 160, 48, 0.12)';
    notice.style.fontWeight = '600';
    const autoplayState = ui.h('p', 'mota-autoplay-state', a.disabled);
    const autoplayButton = fillButton(ui.button(a.enable, { size: 'sm', variant: 'primary' }));
    const autoplayBox = buttonBox(ui, 1);
    autoplayBox.append(autoplayButton);

    const intervalLabel = ui.h('label', 'mota-autoplay-interval-label', intervalText.label);
    intervalLabel.style.display = 'block';
    intervalLabel.style.marginTop = '16px';
    intervalLabel.style.marginBottom = '6px';
    const intervalInput = ui.input({ type: 'number', value: '60' });
    intervalInput.min = '60';
    intervalInput.max = '300';
    intervalInput.step = '1';
    intervalInput.style.width = '100%';
    intervalLabel.htmlFor = 'mota-autoplay-interval';
    intervalInput.id = 'mota-autoplay-interval';
    const intervalHelp = ui.h('p', 'mota-autoplay-interval-help', intervalText.help);
    const intervalButton = fillButton(ui.button(intervalText.save, { size: 'sm' }));
    const intervalBox = buttonBox(ui, 1);
    intervalBox.append(intervalButton);

    const reportRow = ui.h('div', 'mota-report-row');
    reportRow.style.marginTop = '16px';
    reportRow.style.paddingTop = '12px';
    reportRow.style.borderTop = '1px solid var(--border, #d9d9d9)';
    const reportLabel = ui.h('strong', 'mota-report-label', a.periodicReport);
    reportLabel.style.display = 'block';
    reportLabel.style.marginBottom = '4px';
    const reportHelp = ui.h('p', 'mota-report-help', a.periodicReportDesc);
    const reportButton = fillButton(ui.button(a.reportOn, { size: 'sm' }));
    const reportBox = buttonBox(ui, 1);
    reportBox.append(reportButton);
    reportRow.append(reportLabel, reportHelp, reportBox);

    autoplayCard.body.append(notice, autoplayState, autoplayBox, intervalLabel, intervalInput, intervalHelp, intervalBox, reportRow);
    root.append(autoplayCard.el);

    let autoplayEnabled = false;
    const renderAutoplay = (enabled) => {
      autoplayEnabled = !!enabled;
      autoplayState.textContent = autoplayEnabled ? a.enabled : a.disabled;
      autoplayButton.textContent = autoplayEnabled ? a.pause : a.enable;
      autoplayButton.setAttribute('aria-pressed', String(autoplayEnabled));
    };
    let periodicReportEnabled = true;
    const renderReport = (enabled) => {
      periodicReportEnabled = !!enabled;
      reportButton.textContent = periodicReportEnabled ? a.reportOn : a.reportOff;
      reportButton.setAttribute('aria-pressed', String(periodicReportEnabled));
    };
    autoplayButton.addEventListener('click', async () => {
      autoplayButton.disabled = true;
      try {
        const state = await ctx.invoke('setAutoplay', [!autoplayEnabled]);
        renderAutoplay(state.enabled);
        ui.toast(state.enabled ? a.enabled : a.disabled, 'ok');
      } catch (error) { showError(error); }
      finally { autoplayButton.disabled = false; }
    }, { signal: ctx.signal });
    intervalButton.addEventListener('click', async () => {
      const seconds = Number(intervalInput.value);
      if (!Number.isInteger(seconds) || seconds < 60 || seconds > 300) {
        ui.toast(intervalText.invalid, 'bad');
        return;
      }
      intervalButton.disabled = true;
      try {
        const state = await ctx.invoke('setAutoplayInterval', [seconds]);
        intervalInput.value = String(state.seconds);
        ui.toast(intervalText.saved, 'ok');
      } catch (error) { showError(error); }
      finally { intervalButton.disabled = false; }
    }, { signal: ctx.signal });
    reportButton.addEventListener('click', async () => {
      reportButton.disabled = true;
      try {
        const state = await ctx.invoke('setPeriodicReport', [!periodicReportEnabled]);
        renderReport(state.enabled);
        ui.toast(state.enabled ? a.reportOn : a.reportOff, 'ok');
      } catch (error) { showError(error); }
      finally { reportButton.disabled = false; }
    }, { signal: ctx.signal });

    const save = async (value) => ctx.invoke('setToken', [value]);
    const showError = (error) => { if (!ctx.signal.aborted) ui.toast(`${t.error}${error instanceof Error ? error.message : String(error)}`, 'bad'); };
    const download = (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.hidden = true;
      root.append(link);
      link.click();
      link.remove();
      ctx.timeout(() => URL.revokeObjectURL(url), 30_000);
    };

    generate.addEventListener('click', async () => {
      generate.disabled = true;
      try {
        const token = makeToken();
        await save(token);
        input.value = token;
        message.textContent = t.saved;
      } catch (error) { showError(error); }
      finally { generate.disabled = false; }
    }, { signal: ctx.signal });

    downloadTemplate.addEventListener('click', async () => {
      downloadTemplate.disabled = true;
      try {
        const blob = await ctx.invokeBinary('downloadGameAdapter');
        download(blob, 'game-adapter.js');
        message.textContent = t.templateDownloaded;
        ui.toast(t.templateDownloaded, 'ok');
      } catch (error) { showError(error); }
      finally { downloadTemplate.disabled = false; }
    }, { signal: ctx.signal });

    downloadConfigured.addEventListener('click', async () => {
      downloadConfigured.disabled = true;
      try {
        const token = input.value.trim();
        if (!token) throw new Error(t.empty);
        await save(token);
        const blob = await ctx.invokeBinary('createAdapter', [token]);
        download(blob, 'coopanion.js');
        message.textContent = t.adapterDownloaded;
        ui.toast(t.adapterDownloaded, 'ok');
      } catch (error) {
        if (error instanceof Error && error.message === t.empty) message.textContent = t.empty;
        else showError(error);
      } finally { downloadConfigured.disabled = false; }
    }, { signal: ctx.signal });

    openFolder.addEventListener('click', async () => {
      openFolder.disabled = true;
      try {
        await ctx.invoke('openFolder');
        message.textContent = t.opened;
      } catch (error) { showError(error); }
      finally { openFolder.disabled = false; }
    }, { signal: ctx.signal });

    copy.addEventListener('click', async () => {
      copy.disabled = true;
      try {
        const token = input.value.trim();
        if (!token) throw new Error(t.empty);
        await save(token);
        await navigator.clipboard.writeText(token);
        message.textContent = t.copied;
      } catch (error) {
        if (error instanceof Error && error.message === t.empty) message.textContent = t.empty;
        else if (input.value.trim()) message.textContent = t.copyFailed;
        else showError(error);
      } finally { copy.disabled = false; }
    }, { signal: ctx.signal });

    void ctx.invoke('getToken').then((state) => { input.value = state.token ?? ''; }).catch(showError);
    void ctx.invoke('getAutoplay').then((state) => renderAutoplay(state.enabled)).catch(showError);
    void ctx.invoke('getAutoplayInterval').then((state) => { intervalInput.value = String(state.seconds); }).catch(showError);
    void ctx.invoke('getPeriodicReport').then((state) => renderReport(state.enabled)).catch(showError);
  },
};

export default { panels: { intro: introPanel, connection: connectionPanel } };
