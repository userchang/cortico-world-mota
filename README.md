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
