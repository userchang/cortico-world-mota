<!-- Owner: src/definition.ts, src/world.ts, src/game-adapter.js. -->
# Changelog

## 0.1.35

- Add classic Green Slime icon (assets/icon.png) for the World in Coopanion console and marketplace.

## 0.1.34

- Rename the World to "h5魔塔（50层）" in the console (English: "H5 Magic Tower (50 floors)").
- Show the environment prompt tab in Chinese (title, description, variable notes) for Chinese consoles.
- Game connection panel: all buttons share one bordered box and are aligned in an even grid; the autonomous-play buttons use the same boxed style.
- Add a "high-consumption plugin" notice to the settings page and the READMEs.
- Rewrite both READMEs into a short, scannable guide.

## 0.1.33

- Fix lock release bug where mota_fly did not clear actionInFlight, which caused all subsequent action tools to fail with action_in_progress.
- Unify action tool locking and unlocking logic using an ACTION_TOOLS set.

## 0.1.32

- Update autonomous wake event prompt to guide Coo to ask her master for help via `pet_say` on roadblocks instead of stopping in silence.
- Generalize user references in prompts from specific nicknames to "主人" for multi-user distribution.
- Change autonomous wake interval range to 60–300 seconds, with default set to 60s.
- Add an enableable periodic progress report feature that reminds Coo to provide a brief status update via `pet_say` every 30 actions.

## 0.1.31

- Eliminate rigid prohibitions in environment prompts; replace with game-mechanism explanations, heuristics, and an active "ask user for help" workflow via `pet_say` when stuck.
- Add `mota_resources` tool to query uncollected items, unopened doors, and remaining enemies across all visited floors, reporting both tower totals and per-floor coordinates.
- Add `mota_fly` tool to fast-travel to any previously visited floor when holding the floor jump item (`fly`).

## 0.1.30

- Encourage active reloading, trial-and-error, and tactical retry in environment prompts while strictly mandating reloads under 3 fatal scenarios (key softlock, stat softlock, and severe trial deficit / trap trigger).

## 0.1.29

- Separate directly reachable `objects` from walled-off or obstructed `blockedObjects` in `floorView()` so Coo never targets inaccessible coordinates behind obstacles.
- Add `hint` to `mota_move_to` upon `path_blocked`, guiding Coo to visually inspect terrain with `mota_screenshot` instead of blindly bumping into walls with `mota_move`.
- Add `nextEmptySlot` to `mota_saves` to assist sequential save slot selection.
- Update environment prompts with user-aligned save rules (new-floor baseline save and pre-decision save into sequential slots) and strict reload rules (only on key softlocks, stat softlocks, or voluntary trap exploration rollbacks; no reloads on low HP or single obstacle blockage).

## 0.1.28

- Remove `core.ui.closePanel()` from start and load flows so `mota_load` never crashes on the title screen and `mota_start_game` never aborts the opening `startText` / `changeFloor` sequence.
- Wait in `mota_start_game` until the initial floor (`core.status.thisMap`) or an interactive opening event is ready, and guard `floorView()` when `thisMap` is null.

## 0.1.27

- Fix TypeError 'Cannot set properties of undefined (setting data)' by guarding core.ui.closePanel() against undefined core.status.event on title screen, and deferred UI cleanup until after core.loadData completes.

## 0.1.26

- Fix loading saves while on the title screen by explicitly hiding #startPanel and UI overlays, ensuring the canvas map, status bar, and hero are displayed immediately.

## 0.1.25

- Add precomputed `freeReachable`, minimum-damage `upStairsRoute` (with `canPassNow`, `totalDamage`, `doors`, `enemies`, and `firstStepTarget`), `itemValues`, and `reachableNow` enemy coordinates to floor views, and distinguish up-stairs (`U`) from down-stairs (`S`) in the grid.
- Guide Coo to prioritize scouting the next floor when `upStairsRoute` is passable, avoid net-negative gem branches, leave non-blocking 0-damage enemies for Lucky Coin scaling, and rely on precomputed route fields instead of manual grid counting.

## 0.1.24

- Report teleport vs. walk mode, saved steps, and teleport blocker reasons in `mota_move_to` receipts, and document direct target teleport rules for items, doors, enemies, and stairs.
- Replace the verbose block array in `mota_map` with a character grid showing teleport reachability, grouped object coordinates, hazard tiles, and per-enemy damage and attack-critical summaries.
- Return compact delta receipts (`at`, `changes`, active `event`, and new `floor` view on floor changes) from action tools, and keep only non-zero held items in hero state.
- Condense autonomous wake notifications into a single-line summary marked `ephemeral` and tag `mota_status` and `mota_map` as `snapshot` tools.
- Expand the environment prompt with classic Magic Tower progression and backtracking strategies.

## 0.1.23

- Read title-screen start availability and difficulty choices from the game.
- Start a new run through the native game start API after validating the selected difficulty.

## 0.1.22

- Add target-tile movement through the game's native route and direct-move API.
- Make the autonomous wake interval configurable from 5 to 300 seconds, defaulting to 30.
- Localize the environment prompt to Chinese and add tower tips with autonomous save/load guidance; occupied-save overwrite still requires explicit approval.

## 0.1.21

- Wake Coo on a 15-second schedule while an active game is connected.
- Prevent hidden canvas fallback text from overlapping the screenshot layers.

## 0.1.20

- Capture the full game area using each visible layer's displayed position and size.

## 0.1.19

- List saves, save to a manual slot, and load manual or autosaves.
- Protect occupied slots and reject incompatible or unsafe saves.

## 0.1.18

- Resume autonomous play after each completed game action.
- Detect screenshot support and explain when the game adapter must be updated.
- Treat pause messages according to the current autoplay setting.

## 0.1.17

- Wake Coo on meaningful game-state changes when autonomous play is enabled.
- Add a pause control and a game-canvas screenshot tool for visual inspection.

## 0.1.16

- Move up to 16 tiles in one direction and stop at the first event, obstruction, floor change, or game lock.
- Cancel the remaining movement steps when an active tool is interrupted.

## 0.1.15

- Continue movement and dialogue actions across sequential model rounds in one user turn.
- Allow active actions to stop on interruption and return their completion state.

## 0.1.14

- Read visible game event text and choices, and add one-step dialogue and choice actions.

## 0.1.13

- Clarify adapter file destinations, show download guidance, and standardize download buttons.

## 0.1.12

- Add a guarded single-step movement tool with before and after position feedback.

## 0.1.11

- Separate token generation from downloads and offer the template and token-configured game adapter.

## 0.1.10

- Open the install directory through Windows Shell's `Invoke-Item` handler.

## 0.1.9

- Keep the Explorer launch that opens the folder and ignore only its nonzero exit status.

## 0.1.8

- Treat a successfully launched file manager as a successful folder-open action without waiting for its exit code.

## 0.1.7

- Open the plugin's install directory from the connection panel.

## 0.1.6

- Download a token-configured game adapter and open the selected game extensions folder from the connection panel.

## 0.1.5

- Add a random token generator and copy control to the connection panel.

## 0.1.4

- Add random token generation and copy controls to the World connection panel.

## 0.1.3

- Make the bridge token optional for activation and configure it in the World settings; authenticate the game adapter with the configured value.

## 0.1.2

- Remove the shared-token prerequisite from the read-only bridge; loopback binding and exact Origin validation remain.

## 0.1.1

- Resolve the WebSocket server from Cortico's runtime dependencies so local directory installs need no package-local `node_modules`.

## 0.1.0

- Add read-only status, floor map, and combat queries over a local WebSocket bridge.
