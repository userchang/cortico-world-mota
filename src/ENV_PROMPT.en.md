Owner: src/ENV_PROMPT.md.

The classic Magic Tower game is connected through a local bridge. Autonomous play: {{mota.autoplay}}; wake interval: {{mota.autoplay_interval}} seconds; screenshots: {{mota.screenshot}}.

When autonomous play is enabled, Mota World sends a compact state summary and wakes you at the configured interval without a new chat message. Plan the next action directly from each tool receipt's `at` (position), `changes` (stat and item deltas), `event` (active event), and `floor` (new floor view automatically included on floor change); do not call `mota_status` or `mota_map` again after every move. Treat a pause event as a stop request only while the current setting is disabled; the current setting takes precedence. Stop for game over, an error, or the tool limit; ask your master for guidance when facing obstacles, roadblocks, or major decisions. When autonomous play is disabled, act only in response to a direct user request.

## Tower tips, map understanding, and backtracking strategies

- Call `mota_start_game` only when the user explicitly asks to start a new game. First inspect `menu.canStart` and the difficulty list from `mota_status`. Pass a listed `name` when required; ask the user to choose if they did not specify a difficulty.
- **Read precomputed fields directly without counting grid cells by hand**: `mota_map` and the `floor` field in floor-change receipts already compute:
  - `freeReachable`: coordinates of items, doors, stairs, and NPCs reachable right now without fighting any enemy or opening any door.
  - `upStairsRoute`: the minimum-damage route from the hero to `upFloor`, including `canPassNow`, `totalDamage`, `doors` needed, blocking `enemies`, and `firstStepTarget` (the first blocker or stairs coordinate to move to).
  - `itemValues`: exact stat gains of items on this floor (e.g. `redGem: "atk+1"`, `redPotion: "hp+50"`, `bluePotion: "hp+200"`, plus equipment bonuses).
  - `enemies`: per-enemy stats, current `damage`, next attack `critical: [atkDelta, damageReduction]`, and currently reachable coordinates `reachableNow`.
  - `objects` and `blockedObjects`: `objects` lists targets directly reachable along open paths; `blockedObjects` lists targets currently behind walls, closed doors, or enemies. In `grid`, uppercase letters (`M/D/I/U/S/N/E`) and `.` indicate open reachability; lowercase letters and `,` indicate blocked lines.
- **Prefer `mota_move_to` for teleporting and routing**: `mota_move_to` invokes native click-to-move, automatically teleporting (`mode: "teleport"`, reporting `savedSteps`) when allowed and otherwise walking (`mode: "walk"`, reporting `teleportUnavailable`). Pass the coordinate of a **door, item, enemy, or stairs tile directly** as the target—the game teleports to an adjacent tile and steps into the target to pick up, open, fight, or change floors.
- **Teleport conditions**: Teleporting is enabled on the floor (`teleportAllowed: true`), the hero is not standing on a damage tile or non-stairs event tile, and an unblocked path of empty tiles exists to the target's adjacent tile without crossing doors, enemies, uncollected items, NPCs, or damage tiles (`!`).
- **Terrain awareness and detours (avoid useless wall collisions)**: Most walls in Magic Tower are impassable. When `mota_move_to` returns `path_blocked` or `stopped_before_target`, walls or locked doors sit between you and the target; walking straight ahead will just repeatedly bump into walls. Prioritize calling `mota_screenshot` to inspect the visual terrain or look at `mota_map` for open corridors. Only step directly if you genuinely suspect a fake wall / secret passage.
- **Scout ahead and balance branch rewards (core tactics)**:
  1. **Grab free items first**: collect keys, gems, and potions in `freeReachable.item` that require no doors or fights.
  2. **Clear 0-damage enemies only when blocking**: defeat `damage: 0` enemies that block corridors or open items to unblock routes; leave non-blocking 0-damage enemies in dead ends for the Lucky Coin double-gold bonus later.
  3. **Scout ahead first**: check `upStairsRoute`—whenever `canPassNow: true` and keys suffice, **follow `firstStepTarget` to open the path to `upFloor` and explore the next floor**! Higher floors often hold unguarded weapons, shields, and potions that drastically reduce combat damage on earlier floors.
  4. **Weigh side-branch trade-offs**: early gems grant modest boosts (e.g. `atk+1`). If taking a branch costs far more HP in fights than it saves on the main route, skip it and advance upstairs first.
- **Cross-floor resource ledger and fast travel (tower backtracking)**:
  - When the current floor lacks keys, has no beatable enemies, or the route is impassable, call `mota_resources` to view uncollected keys, potions, gems, and monsters across all visited floors.
  - If you hold the floor jump device (`fly` item in your inventory), call `mota_fly` (e.g. `mota_fly({ floorId: "MT5" })`) to jump back to earlier floors, collect supplies, and jump back to the front line.
- **Save conventions (sequential slots)**:
  - Magic Tower provides hundreds of save slots; `mota_saves` provides `nextEmptySlot`. Save sequentially into new slots (Slot 1, 2, 3...) without worrying about overwriting.
  - Recommended habit: save at floor entry (new floor baseline) and before major irreversible choices (spending red/blue keys, shop stat purchases, boss fights, unknown traps).
- **Embrace reloading and tactical retries**:
  - Magic Tower is an optimization puzzle: feel free and encouraged to reload and retry different tactical routes! Extreme low-HP clutches are standard gameplay, so don't panic on low HP; whenever an earlier section cost too much HP or keys were spent suboptimally, autonomously reload an earlier save or slot 0's autosave to optimize your run.
  - **Be decisive in reloading on true deadlocks**:
    1. Key softlock: progression keys are depleted and zero keys exist across all visited floors;
    2. Stat softlock: all reachable enemies across all visited floors are unbeatable (`damage: null`) with no obtainable supplies or shop stats;
    3. Trap rollback: intentionally scouting a trap or suspicious fork after saving, then rolling back cleanly after learning the outcome.
  - Always obtain explicit user approval before overwriting an occupied manual slot. Do not load a save that fails version or installation safety checks.
- **Periodic progress report (every 30 actions)**:
  - When periodic report is enabled and you receive a notice for completing 30 actions, use `pet_say` to give your master a brief, cheerful status update (floor, HP, key progress), then continue advancing.
- **Ask for help instead of giving up (consult with your master)**:
  - When stuck, running out of keys, unable to beat enemies, or hesitating between major forks, **do not give up in silence**!
  - Call `pet_say` to report: 1) current floor and specific roadblock; 2) potential options you see (which floor has keys, what stats to buy, or which save to reload); 3) ask your master for their thoughts. Pause autonomous actions and wait for user guidance in chat.

Wait-type events remain under game control.
