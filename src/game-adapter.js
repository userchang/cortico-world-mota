/* Template used by the World to generate the game-side coopanion.js adapter. */
(function () {
    'use strict';

    var BRIDGE_URL = 'ws://127.0.0.1:1060/mota';
    var BRIDGE_TOKEN = 'paste-the-same-token-from-the-Mota-World-settings';
    var PROTOCOL = 1;
    var socket = null;
    var reconnectTimer = null;
    var phaseTimer = null;
    var gameInstanceId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    var stateVersion = 0;
    var lastState = '';
    var lastSentStateVersion = -1;
    var movementInProgress = false;
    var activeMove = null;
    var eventActionInProgress = false;
    var observedEventText = null;
    var uiObserverInstalled = false;

    function installUiObserver() {
        if (uiObserverInstalled || !core.ui || typeof core.ui.drawTextBox !== 'function') return;
        ['drawTextBox', 'drawChoices', 'drawConfirmBox'].forEach(function (method) {
            if (typeof core.ui[method] !== 'function') return;
            var original = core.ui[method];
            core.ui[method] = function (content) {
                observedEventText = typeof content === 'string' ? content : null;
                return original.apply(this, arguments);
            };
        });
        uiObserverInstalled = true;
    }

    function choiceLabel(choice) {
        if (typeof choice === 'string') return choice;
        if (choice && typeof choice.text === 'string') return choice.text;
        return null;
    }

    function eventSummary() {
        var e = core.status && core.status.event;
        if (!e || !e.id) return { active: false };
        var data = e.data || {};
        var current = data.current;
        var eventType = data.type || (e.id === 'text' ? 'text' : (e.id === 'confirmBox' ? 'confirm' : e.id));
        var text = ['text', 'choices', 'confirm'].indexOf(eventType) >= 0 ? observedEventText : null;
        if (text == null && e.ui && typeof e.ui.text === 'string') text = e.ui.text;
        if (text == null && current && typeof current.text === 'string') text = current.text;
        if (text == null && e.id === 'text' && Array.isArray(data.list) && data.list.length && typeof data.list[0] === 'string') text = data.list[0];
        var rawChoices = eventType === 'choices' && e.ui && Array.isArray(e.ui.choices) ? e.ui.choices : null;
        if (!rawChoices && eventType === 'choices' && current && Array.isArray(current.choices)) rawChoices = current.choices;
        var choices = rawChoices ? rawChoices.map(choiceLabel) : (eventType === 'confirm' ? ['确定', '取消'] : []);
        var selection = Number.isInteger(e.selection) ? e.selection : null;
        return {
            active: true, eventId: e.id, eventType: eventType,
            text: text, choices: choices, selection: selection
        };
    }

    function eventSnapshot() {
        return { phase: phase(), event: eventSummary(), stateVersion: stateVersion };
    }

    function titleMenuSnapshot() {
        var gameMain = window.main;
        if (!gameMain || core.status && core.status.played) return null;
        var difficulties = Array.isArray(gameMain.levelChoose) ? gameMain.levelChoose.map(function (item) {
            return { name: String(item && item.name || ''), title: String(item && item.title || item && item.name || '') };
        }) : [];
        return {
            visible: !!(core.dom && core.dom.startPanel && core.dom.startPanel.style.display === 'block'),
            mode: gameMain.mode || null,
            canStart: gameMain.mode === 'play',
            difficulties: difficulties
        };
    }

    function hideTitlePanel() {
        var doms = [core.dom, window.main && window.main.dom];
        var keys = ['startPanel', 'startTop', 'startButtonGroup', 'startButtons', 'levelChooseButtons'];
        doms.forEach(function (container) {
            if (!container) return;
            keys.forEach(function (k) {
                if (container[k] && container[k].style) {
                    container[k].style.display = 'none';
                }
            });
        });
    }

    function revealLoadedGameUi() {
        hideTitlePanel();
        if (core.dom && core.dom.musicBtn) core.dom.musicBtn.style.display = 'block';
        if (core.dom && core.dom.enlargeBtn) core.dom.enlargeBtn.style.display = 'block';
        if (typeof core.setMusicBtn === 'function') {
            try { core.setMusicBtn(); } catch (_) {}
        }
        if (typeof core.showStatusBar === 'function' && (!core.hasFlag || !core.hasFlag('hideStatusBar'))) {
            try { core.showStatusBar(); } catch (_) {}
        }
        if (typeof core.updateStatusBar === 'function') {
            try { core.updateStatusBar(true); } catch (_) {}
        }
        if (typeof core.drawHero === 'function') {
            try { core.drawHero(); } catch (_) {}
        }
    }

    function phase() {
        if (!window.core || !core.status || !core.status.played) return 'menu';
        if (core.status.gameOver) return 'ended';
        if (core.isReplaying && core.isReplaying()) return 'replaying';
        if (core.status.event && core.status.event.id) return 'busy';
        if (core.status.heroMoving > 0 || core.status.heroStop === false) return 'busy';
        return 'playing';
    }

    /* Item counts above zero across tools, constants and unequipped equipment, keyed by item id. */
    function heldItems(items) {
        var held = {};
        Object.keys(items || {}).forEach(function (group) {
            var entries = items[group];
            if (!entries || typeof entries !== 'object') return;
            Object.keys(entries).forEach(function (id) {
                var count = entries[id] === true ? 1 : entries[id];
                if (typeof count === 'number' && count > 0) held[id] = (held[id] || 0) + count;
            });
        });
        return held;
    }

    function readyState() {
        var s = core.status;
        if (!s || !s.played || !s.hero || !s.hero.loc) return { phase: phase(), started: false, menu: titleMenuSnapshot(), stateVersion: stateVersion };
        var hero = {
            lv: s.hero.lv, hp: s.hero.hp, hpmax: s.hero.hpmax,
            atk: s.hero.atk, def: s.hero.def, mdef: s.hero.mdef,
            money: s.hero.money, exp: s.hero.exp, loc: { x: s.hero.loc.x, y: s.hero.loc.y },
            items: heldItems(s.hero.items)
        };
        var equipped = Array.isArray(s.hero.equipment) ? s.hero.equipment.filter(Boolean) : [];
        if (equipped.length) hero.equipment = equipped;
        return {
            phase: phase(), started: true, gameOver: !!s.gameOver, event: eventSummary(),
            replaying: !!(s.replay && s.replay.replaying), floorId: s.floorId,
            stateVersion: stateVersion, hero: hero
        };
    }

    var HERO_NUMBERS = ['lv', 'hp', 'hpmax', 'atk', 'def', 'mdef', 'money', 'exp'];

    /* Signed differences in hero numbers and held items; null when nothing changed. */
    function heroChanges(before, after) {
        var changes = {}, any = false;
        HERO_NUMBERS.forEach(function (key) {
            if (typeof before[key] === 'number' && typeof after[key] === 'number' && before[key] !== after[key]) {
                changes[key] = after[key] - before[key]; any = true;
            }
        });
        var items = {}, anyItem = false;
        Object.keys(before.items).concat(Object.keys(after.items)).forEach(function (id) {
            var delta = (after.items[id] || 0) - (before.items[id] || 0);
            if (delta) { items[id] = delta; anyItem = true; }
        });
        if (anyItem) { changes.items = items; any = true; }
        if (JSON.stringify(before.equipment || []) !== JSON.stringify(after.equipment || [])) { changes.equipment = after.equipment || []; any = true; }
        return any ? changes : null;
    }

    /*
     * Action receipt shared by movement, event, start and load actions. It reports the position,
     * hero changes since `before`, the active event and, after a floor change, the new floor view.
     * `state` carries the full snapshot for the World, which removes it before Coo reads the receipt.
     */
    function actionReceipt(before, fields) {
        refreshStateVersion();
        var after = readyState();
        if (after.started) {
            fields.at = { floorId: after.floorId, x: after.hero.loc.x, y: after.hero.loc.y };
            if (before && before.started) {
                var changes = heroChanges(before.hero, after.hero);
                if (changes) fields.changes = changes;
                if (before.floorId !== after.floorId) {
                    var nextFloor = floorView();
                    if (nextFloor) fields.floor = nextFloor;
                }
            }
            if (after.event && after.event.active) fields.event = after.event;
            if (after.gameOver) fields.gameOver = true;
        }
        fields.phase = after.phase;
        fields.state = after;
        return fields;
    }

    var GRID_LEGEND = '# wall; @ hero; . floor reachable by teleport; , floor not reachable by teleport; ! damage tile; '
        + 'M enemy, D door, I item, U up-stairs, S down/other stairs, N npc, E other event (uppercase: teleport can reach it, lowercase: teleport path blocked).';

    function blockKind(block) {
        var e = block.event || {}, cls = String(e.cls || '');
        if (cls.indexOf('enemy') === 0) return 'enemy';
        if (e.trigger === 'openDoor') return 'door';
        if (e.trigger === 'changeFloor') return e.id === 'upFloor' ? 'upStairs' : 'stairs';
        if (cls === 'items') return 'item';
        if (cls.indexOf('npc') === 0) return 'npc';
        if (e.trigger || e.script || e.event) return 'event';
        if (e.noPass) return 'wall';
        return null;
    }

    var KIND_CHAR = { enemy: 'M', door: 'D', item: 'I', upStairs: 'U', stairs: 'S', npc: 'N', event: 'E' };

    function enemyName(id) {
        var enemy = core.material && core.material.enemys && core.material.enemys[id];
        return enemy && enemy.name || id;
    }

    function itemEffectText(id) {
        var ratio = (core.status.thisMap && core.status.thisMap.ratio) || 1;
        var v = core.values || {};
        if (id === 'redGem' && typeof v.redGem === 'number') return 'atk+' + (v.redGem * ratio);
        if (id === 'blueGem' && typeof v.blueGem === 'number') return 'def+' + (v.blueGem * ratio);
        if (id === 'greenGem' && typeof v.greenGem === 'number') return 'mdef+' + (v.greenGem * ratio);
        if (id === 'redPotion' && typeof v.redPotion === 'number') return 'hp+' + (v.redPotion * ratio);
        if (id === 'bluePotion' && typeof v.bluePotion === 'number') return 'hp+' + (v.bluePotion * ratio);
        if (id === 'yellowPotion' && typeof v.yellowPotion === 'number') return 'hp+' + (v.yellowPotion * ratio);
        if (id === 'greenPotion' && typeof v.greenPotion === 'number') return 'hp+' + (v.greenPotion * ratio);
        var item = core.material && core.material.items && core.material.items[id];
        if (item && item.equip && item.equip.value && typeof item.equip.value === 'object') {
            var parts = [];
            Object.keys(item.equip.value).forEach(function (k) {
                var val = item.equip.value[k];
                if (typeof val === 'number' && val !== 0) parts.push(k + (val > 0 ? '+' : '') + val);
            });
            if (parts.length) return (item.name || id) + '(' + parts.join(',') + ')';
        }
        return item && item.name || null;
    }

    /*
     * Dijkstra search from the hero to `targets` ([x, y] pairs) to report the minimum-damage,
     * minimum-door route and the exact doors/enemies blocking that route.
     */
    function bestRouteToTargets(width, height, heroX, heroY, targets, blockByPos, hazards) {
        if (!targets || !targets.length) return null;
        var targetSet = {};
        targets.forEach(function (t) { targetSet[t[0] + ',' + t[1]] = t; });
        var dist = {}, prev = {}, stepCost = {};
        var startKey = heroX + ',' + heroY;
        dist[startKey] = [0, 0, 0, 0]; // [unbeatableCount, totalDamage, doorCount, steps]
        var queue = [startKey];
        var less = function (a, b) {
            for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
            return false;
        };
        var bestTargetKey = null;
        while (queue.length) {
            var bestIdx = 0;
            for (var qi = 1; qi < queue.length; qi++) {
                if (less(dist[queue[qi]], dist[queue[bestIdx]])) bestIdx = qi;
            }
            var curKey = queue.splice(bestIdx, 1)[0];
            if (targetSet[curKey]) { bestTargetKey = curKey; break; }
            var parts = curKey.split(','), cx = Number(parts[0]), cy = Number(parts[1]);
            var curDist = dist[curKey];
            var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (var di = 0; di < dirs.length; di++) {
                var nx = cx + dirs[di][0], ny = cy + dirs[di][1];
                if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                var nKey = nx + ',' + ny;
                var b = blockByPos[nKey];
                var kind = b ? blockKind(b) : null;
                if (kind === 'wall' || kind === 'npc' || (kind === 'stairs' && !targetSet[nKey])) continue;
                var unbeat = 0, dmg = Number(hazards[nKey] || 0), doors = 0, info = null;
                if (kind === 'door') {
                    var doorId = b.event && b.event.id || b.id;
                    doors = doorId === 'yellowDoor' ? 1 : (doorId === 'blueDoor' ? 3 : 10);
                    info = { kind: 'door', id: doorId, at: [nx, ny] };
                } else if (kind === 'enemy') {
                    var enemyId = b.event && b.event.id || b.id;
                    var dInfo = core.getDamageInfo(enemyId, null, nx, ny);
                    var eDmg = dInfo == null ? null : (typeof dInfo === 'number' ? dInfo : dInfo.damage);
                    if (eDmg == null) unbeat = 1;
                    else dmg += Math.max(0, eDmg);
                    info = { kind: 'enemy', id: enemyId, damage: eDmg, at: [nx, ny] };
                }
                var cand = [curDist[0] + unbeat, curDist[1] + dmg, curDist[2] + doors, curDist[3] + 1];
                if (!dist[nKey] || less(cand, dist[nKey])) {
                    dist[nKey] = cand;
                    prev[nKey] = curKey;
                    stepCost[nKey] = info;
                    if (queue.indexOf(nKey) < 0) queue.push(nKey);
                }
            }
        }
        if (!bestTargetKey) return null;
        var doorsNeeded = {}, enemiesOnRoute = [], totalDamage = dist[bestTargetKey][1], unbeatable = dist[bestTargetKey][0] > 0;
        var trace = bestTargetKey, blockers = [];
        while (trace && trace !== startKey) {
            if (stepCost[trace]) blockers.unshift(stepCost[trace]);
            trace = prev[trace];
        }
        blockers.forEach(function (item) {
            if (item.kind === 'door') doorsNeeded[item.id] = (doorsNeeded[item.id] || 0) + 1;
            else if (item.kind === 'enemy') enemiesOnRoute.push({ id: item.id, damage: item.damage, at: item.at });
        });
        return {
            target: targetSet[bestTargetKey],
            canPassNow: !unbeatable && totalDamage < core.status.hero.hp,
            totalDamage: unbeatable ? null : totalDamage,
            doors: doorsNeeded,
            enemies: enemiesOnRoute,
            firstStepTarget: blockers.length ? blockers[0].at : targetSet[bestTargetKey]
        };
    }

    /*
     * Compact view of the current floor: a character grid (grid[y][x]), object coordinates grouped
     * by kind and id, zero-cost reachable objects, minimum-cost route to upFloor, item effect values,
     * damage tiles, and one summary row per enemy type and damage value.
     */
    function floorView() {
        var map = core.status && core.status.thisMap;
        if (!map || !Array.isArray(map.blocks)) return null;
        var width = map.width || core.bigmap.width, height = map.height || core.bigmap.height;
        var heroX = core.getHeroLoc('x'), heroY = core.getHeroLoc('y');
        var hazards = core.status.checkBlock && core.status.checkBlock.damage || {};
        var locs = [];
        for (var ly = 0; ly < height; ly++) for (var lx = 0; lx < width; lx++) locs.push([lx, ly]);
        var teleportDistances = typeof core.canMoveDirectlyArray === 'function' ? core.canMoveDirectlyArray(locs) : [];
        var canMoveArray = core.maps.generateMovableArray();
        var floorReach = function (x, y) {
            if (x < 0 || y < 0 || x >= width || y >= height) return false;
            var distance = teleportDistances[y * width + x];
            return typeof distance === 'number' && distance >= 0;
        };
        // Mirrors control.tryMoveDirectly: land on the target, or on a neighbour that can step into it.
        var objectReach = function (x, y) {
            if (Math.abs(x - heroX) + Math.abs(y - heroY) <= 1) return true;
            var sides = [[x - 1, y, 'right'], [x, y - 1, 'down'], [x, y + 1, 'up'], [x + 1, y, 'left']];
            return sides.some(function (side) {
                return floorReach(side[0], side[1]) && core.inArray(canMoveArray[side[0]][side[1]], side[2]);
            });
        };
        var rows = [];
        for (var y = 0; y < height; y++) {
            var row = [];
            for (var x = 0; x < width; x++) row.push(hazards[x + ',' + y] ? '!' : (floorReach(x, y) ? '.' : ','));
            rows.push(row);
        }
        var objects = {}, blockedObjects = {}, freeReachable = {}, itemValues = {}, enemyRows = {}, enemyOrder = [], blockByPos = {};
        (map.blocks || []).forEach(function (block) {
            if (block.disable || block.x < 0 || block.y < 0 || block.x >= width || block.y >= height) return;
            blockByPos[block.x + ',' + block.y] = block;
            var kind = blockKind(block);
            if (!kind) return;
            if (kind === 'wall') { rows[block.y][block.x] = '#'; return; }
            var reach = objectReach(block.x, block.y);
            rows[block.y][block.x] = reach ? KIND_CHAR[kind] : KIND_CHAR[kind].toLowerCase();
            var id = block.event && block.event.id || block.id;
            if (kind === 'enemy') {
                var info = core.getDamageInfo(id, null, block.x, block.y);
                var damage = info == null ? null : (typeof info === 'number' ? info : info.damage);
                var key = id + '|' + damage;
                if (!enemyRows[key]) {
                    var stats = core.getEnemyInfo(id, null, block.x, block.y) || {};
                    var criticals = core.enemys.nextCriticals(id, 1, block.x, block.y) || [];
                    enemyRows[key] = {
                        id: id, name: enemyName(id), damage: damage,
                        hp: stats.hp, atk: stats.atk, def: stats.def, money: stats.money, exp: stats.exp,
                        special: core.enemys.getSpecialText(id), at: [], reachableNow: []
                    };
                    if (criticals[0] && criticals[0][0] > 0) enemyRows[key].critical = criticals[0];
                    enemyOrder.push(key);
                }
                enemyRows[key].at.push([block.x, block.y]);
                if (reach) enemyRows[key].reachableNow.push([block.x, block.y]);
                return;
            }
            var groupKind = kind === 'upStairs' ? 'stairs' : kind;
            if (reach) {
                objects[groupKind] = objects[groupKind] || {};
                (objects[groupKind][id] = objects[groupKind][id] || []).push([block.x, block.y]);
                if (groupKind === 'item' || groupKind === 'door' || groupKind === 'stairs' || groupKind === 'npc') {
                    freeReachable[groupKind] = freeReachable[groupKind] || {};
                    (freeReachable[groupKind][id] = freeReachable[groupKind][id] || []).push([block.x, block.y]);
                }
            } else {
                blockedObjects[groupKind] = blockedObjects[groupKind] || {};
                (blockedObjects[groupKind][id] = blockedObjects[groupKind][id] || []).push([block.x, block.y]);
            }
            if (groupKind === 'item' && !itemValues[id]) {
                var eff = itemEffectText(id);
                if (eff) itemValues[id] = eff;
            }
        });
        if (heroY >= 0 && heroY < height && heroX >= 0 && heroX < width) rows[heroY][heroX] = '@';
        var damageTiles = {};
        Object.keys(hazards).forEach(function (loc) { if (hazards[loc]) damageTiles[loc] = hazards[loc]; });
        var upTargets = (objects.stairs && objects.stairs.upFloor) || (blockedObjects.stairs && blockedObjects.stairs.upFloor) || [];
        var upStairsRoute = bestRouteToTargets(width, height, heroX, heroY, upTargets, blockByPos, hazards);
        var floor = core.status.maps && core.status.maps[core.status.floorId] || {};
        var view = {
            floorId: core.status.floorId, title: floor.title || floor.name || null,
            width: width, height: height, hero: [heroX, heroY],
            teleportAllowed: !!(core.maps._canMoveDirectly_checkGlobal && core.maps._canMoveDirectly_checkGlobal()),
            legend: GRID_LEGEND,
            grid: rows.map(function (row) { return row.join(''); }),
            freeReachable: freeReachable,
            upStairsRoute: upStairsRoute,
            itemValues: itemValues,
            objects: objects,
            blockedObjects: blockedObjects,
            enemies: enemyOrder.map(function (key) {
                var row = enemyRows[key];
                if (!row.reachableNow.length) delete row.reachableNow;
                return row;
            })
        };
        if (Object.keys(damageTiles).length) view.damageTiles = damageTiles;
        return view;
    }

    /* Why a click on (x, y) could not teleport; mirrors maps.canMoveDirectlyArray's checks. */
    function teleportUnavailableReason(x, y) {
        var heroX = core.getHeroLoc('x'), heroY = core.getHeroLoc('y');
        if (Math.abs(x - heroX) + Math.abs(y - heroY) <= 1) return 'adjacent_target';
        if (core.maps._canMoveDirectly_checkGlobal && !core.maps._canMoveDirectly_checkGlobal()) return 'disabled_on_floor';
        if (core.maps._canMoveDirectly_checkStartPoint && !core.maps._canMoveDirectly_checkStartPoint(heroX, heroY)) return 'hero_on_event_or_damage_tile';
        return 'path_blocked';
    }

    function teleportCount() {
        var statistics = core.status.hero && core.status.hero.statistics;
        return { moves: statistics && statistics.moveDirectly || 0, saved: statistics && statistics.ignoreSteps || 0 };
    }

    function refreshStateVersion() {
        var snapshotState, snapshot;
        try { snapshotState = readyState(); delete snapshotState.stateVersion; snapshot = JSON.stringify(snapshotState); }
        catch (_) { return; }
        if (snapshot !== lastState) { lastState = snapshot; stateVersion++; }
    }

    function heroPosition() {
        return { floorId: core.status.floorId, x: core.getHeroLoc('x'), y: core.getHeroLoc('y') };
    }

    function moveInDirection(request) {
        var direction = request.args && request.args.direction;
        var requestedSteps = request.args && request.args.steps != null ? request.args.steps : 1;
        if (['up', 'down', 'left', 'right'].indexOf(direction) < 0) {
            fail(request.id, 'invalid_direction', 'direction must be up, down, left, or right.');
            return;
        }
        if (!Number.isInteger(requestedSteps) || requestedSteps < 1 || requestedSteps > 16) {
            fail(request.id, 'invalid_steps', 'steps must be an integer between 1 and 16.');
            return;
        }
        if (movementInProgress) {
            fail(request.id, 'action_in_progress', 'A game action is already in progress.');
            return;
        }
        if (phase() !== 'playing' || core.status.lockControl || (core.status.automaticRoute && core.status.automaticRoute.autoHeroMove)) {
            fail(request.id, 'game_busy', 'The game is busy or input is locked. Wait for it to return to play, then retry.');
            return;
        }

        movementInProgress = true;
        var beforeState = readyState();
        var move = { id: request.id, direction: direction, requestedSteps: requestedSteps, completedSteps: 0, cancelled: false };
        activeMove = move;
        var timer = setTimeout(function () {
            move.cancelled = true;
            finish('timeout');
        }, 25000);
        var finish = function (reason, error) {
            if (activeMove !== move) return;
            clearTimeout(timer);
            activeMove = null;
            movementInProgress = false;
            try {
                if (error) {
                    refreshStateVersion();
                    respond(request.id, false, { code: 'move_error', message: String(error && error.message || error), completedSteps: move.completedSteps, to: heroPosition() });
                    return;
                }
                respond(request.id, true, actionReceipt(beforeState, {
                    direction: direction, requestedSteps: requestedSteps, completedSteps: move.completedSteps, stoppedReason: reason
                }));
            } catch (failure) { fail(request.id, 'move_result_error', String(failure && failure.message || failure)); }
        };

        var moveNext = function () {
            if (activeMove !== move) return;
            if (move.cancelled) { finish('interrupted'); return; }
            if (phase() !== 'playing' || core.status.lockControl || (core.status.automaticRoute && core.status.automaticRoute.autoHeroMove)) {
                finish('game_busy'); return;
            }
            var stepFrom = heroPosition();
            try {
                core.moveHero(direction, function () {
                    if (activeMove !== move) return;
                    var stepTo = heroPosition();
                    var moved = stepFrom.floorId !== stepTo.floorId || stepFrom.x !== stepTo.x || stepFrom.y !== stepTo.y;
                    if (moved) move.completedSteps++;
                    refreshStateVersion();
                    if (move.cancelled) { finish('interrupted'); return; }
                    if (stepFrom.floorId !== stepTo.floorId) { finish('floor_changed'); return; }
                    if (phase() !== 'playing') { finish('event'); return; }
                    if (core.status.lockControl) { finish('game_busy'); return; }
                    if (!moved) { finish('blocked'); return; }
                    if (move.completedSteps >= move.requestedSteps) { finish('completed'); return; }
                    setTimeout(moveNext, 0);
                });
            } catch (error) { finish('error', error); }
        }
        moveNext();
    }

    function moveToTile(request) {
        var x = request.args && request.args.x, y = request.args && request.args.y;
        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            fail(request.id, 'invalid_target', 'x and y must be integer tile coordinates.');
            return;
        }
        if (movementInProgress) {
            fail(request.id, 'action_in_progress', 'A game action is already in progress.');
            return;
        }
        if (phase() !== 'playing' || core.status.lockControl || (core.status.automaticRoute && core.status.automaticRoute.autoHeroMove)) {
            fail(request.id, 'game_busy', 'The game is busy or input is locked. Wait for it to return to play, then retry.');
            return;
        }
        var map = core.status.thisMap;
        var width = map && (map.width || core.bigmap.width), height = map && (map.height || core.bigmap.height);
        if (!map || x < 0 || y < 0 || x >= width || y >= height) {
            fail(request.id, 'invalid_target', 'The destination is outside the current floor.');
            return;
        }
        var before = heroPosition();
        var beforeState = readyState();
        if (before.x === x && before.y === y) {
            respond(request.id, true, actionReceipt(beforeState, { target: { x: x, y: y }, reached: true, mode: 'none', stoppedReason: 'already_there' }));
            return;
        }
        var route;
        try { route = core.automaticRoute(x, y); }
        catch (error) { fail(request.id, 'route_failed', String(error && error.message || error)); return; }
        if (!Array.isArray(route)) {
            fail(request.id, 'route_failed', 'The game route finder returned an invalid route.');
            return;
        }
        var teleportBlocker = teleportUnavailableReason(x, y);
        var teleportsBefore = teleportCount();

        movementInProgress = true;
        var move = { id: request.id, mode: 'route', cancelled: false };
        activeMove = move;
        var startedAt = Date.now();
        var finished = false;
        var finish = function (reason, error) {
            if (finished || activeMove !== move) return;
            finished = true;
            clearInterval(poll);
            clearTimeout(timer);
            activeMove = null;
            movementInProgress = false;
            try {
                var after = heroPosition();
                if (error) {
                    refreshStateVersion();
                    fail(request.id, 'route_error', String(error && error.message || error));
                    return;
                }
                var teleportsAfter = teleportCount();
                var teleported = teleportsAfter.moves > teleportsBefore.moves;
                var receipt = {
                    target: { x: x, y: y },
                    reached: after.floorId === before.floorId && after.x === x && after.y === y,
                    mode: teleported ? 'teleport' : (route.length ? 'walk' : 'none'),
                    stoppedReason: reason
                };
                if (teleported) receipt.savedSteps = teleportsAfter.saved - teleportsBefore.saved;
                else {
                    receipt.teleportUnavailable = teleportBlocker;
                    if (route.length) receipt.plannedSteps = route.length;
                    if (teleportBlocker === 'path_blocked' || (!receipt.reached && receipt.mode === 'none')) {
                        receipt.hint = 'Target path is blocked by a wall, closed door, or enemy. You can inspect the floor layout via mota_screenshot or find an open passage; only step directly if you suspect a fake wall.';
                    }
                }
                respond(request.id, true, actionReceipt(beforeState, receipt));
            } catch (failure) { fail(request.id, 'route_result_error', String(failure && failure.message || failure)); }
        };
        var poll = setInterval(function () {
            if (activeMove !== move) return;
            var after = heroPosition();
            var routeActive = !!(core.status.automaticRoute && core.status.automaticRoute.autoHeroMove);
            var moving = core.status.heroMoving > 0 || core.status.heroStop === false;
            if (move.cancelled) {
                if (!moving) finish('interrupted');
                return;
            }
            if (after.floorId !== before.floorId) { finish('floor_changed'); return; }
            if (core.status.gameOver) { finish('game_over'); return; }
            if (core.status.event && core.status.event.id) {
                try { core.stopAutomaticRoute(); } catch (_) {}
                if (!moving) finish('event');
                return;
            }
            if (after.x === x && after.y === y) { if (!moving) finish('completed'); return; }
            if (!routeActive && !moving && Date.now() - startedAt > 250) {
                finish(core.status.lockControl ? 'game_locked' : 'stopped_before_target');
                return;
            }
        }, 50);
        var timer = setTimeout(function () {
            move.cancelled = true;
            try { core.stopAutomaticRoute(); } catch (_) {}
            finish('timeout');
        }, 115_000);
        try { core.setAutomaticRoute(x, y, []); }
        catch (error) { finish('error', error); return; }
        if (heroPosition().x === x && heroPosition().y === y && core.status.heroMoving === 0) finish('completed');
    }

    function startNewGame(request) {
        var isOrphanStart = !!(core.status && core.status.played && !core.status.floorId && (!core.status.event || !core.status.event.id));
        if (isOrphanStart) core.status.played = false;
        var menu = titleMenuSnapshot();
        var requestedDifficulty = request.args && request.args.difficulty;
        if (core.status && core.status.played) {
            fail(request.id, 'game_already_started', 'A game is already active. Return to the title screen before starting a new game.');
            return;
        }
        if (!menu || !menu.canStart || !core.events || typeof core.events.startGame !== 'function') {
            fail(request.id, 'start_unavailable', 'The game is not at a playable title screen.');
            return;
        }
        if (menu.difficulties.length && requestedDifficulty === undefined) {
            respond(request.id, false, { code: 'difficulty_required', message: 'Choose one of the listed difficulty names before starting.', difficulties: menu.difficulties });
            return;
        }
        if (!menu.difficulties.length && requestedDifficulty !== undefined) {
            fail(request.id, 'invalid_difficulty', 'This game does not offer a difficulty selection.');
            return;
        }
        if (menu.difficulties.length && !menu.difficulties.some(function (item) { return item.name === requestedDifficulty; })) {
            fail(request.id, 'invalid_difficulty', 'The selected difficulty is not listed on the title screen.');
            return;
        }
        var difficulty = requestedDifficulty || '';
        var completed = false;
        var isStartReady = function () {
            if (!core.status || !core.status.played) return false;
            if (core.status.replay && core.status.replay.animate) return false;
            if (core.status.floorId && core.status.thisMap) return true;
            var ev = eventSummary();
            return !!(ev && ev.active);
        };
        var finish = function (error) {
            if (completed) return;
            completed = true;
            clearInterval(poll);
            clearTimeout(timer);
            if (error) { fail(request.id, 'start_failed', String(error && error.message || error)); return; }
            try {
                hideTitlePanel();
                sendStateSnapshot();
                var receipt = actionReceipt(null, { started: true, difficulty: difficulty });
                if (receipt.state.started) {
                    receipt.hero = receipt.state.hero;
                    var view = floorView();
                    if (view) receipt.floor = view;
                }
                respond(request.id, true, receipt);
            } catch (err) {
                fail(request.id, 'start_failed', String(err && err.message || err));
            }
        };
        var poll = setInterval(function () {
            if (isStartReady()) finish();
        }, 50);
        var timer = setTimeout(function () { finish(new Error('The game did not enter a playable run before the start timeout.')); }, 30_000);
        try {
            if (core.control && typeof core.control.checkBgm === 'function') core.control.checkBgm();
            core.events.startGame(difficulty);
            if (isStartReady()) finish();
        } catch (error) { finish(error); }
    }

    function actOnEvent(request) {
        var action = request.args && request.args.action;
        var index = request.args && request.args.index;
        var e = core.status.event;
        var data = e && e.data || {};
        var eventType = data.type || (e && e.id === 'text' ? 'text' : (e && e.id === 'confirmBox' ? 'confirm' : e && e.id));
        if (!e || !e.id || phase() !== 'busy') { fail(request.id, 'no_active_event', 'There is no active game event.'); return; }
        if (eventActionInProgress || movementInProgress || e.animateUI) {
            fail(request.id, 'event_busy', 'The current event is still transitioning. Read it again after the display settles.'); return;
        }
        var beforeState = readyState();
        if (action === 'advance') {
            if (eventType !== 'text') {
                fail(request.id, 'event_action_unavailable', 'Advance is available only for a visible dialogue line.'); return;
            }
            if (e.id === 'text' && typeof core.drawText === 'function') core.drawText();
            else if (e.id === 'action' && typeof core.actions._clickAction_text === 'function') core.actions._clickAction_text();
            else { fail(request.id, 'event_action_unavailable', 'The current dialogue cannot be advanced by the game adapter.'); return; }
        } else if (action === 'choose') {
            if (!Number.isInteger(index) || index < 0) { fail(request.id, 'invalid_choice', 'Choose requires a non-negative visible choice index.'); return; }
            if (eventType === 'choices' && e.ui && Array.isArray(e.ui.choices)) {
                if (index >= e.ui.choices.length) { fail(request.id, 'invalid_choice', 'The choice index is outside the visible options.'); return; }
                var top = core.actions._getChoicesTopIndex(e.ui.choices.length);
                core.actions._clickAction(core.actions.HSIZE, top + index);
            } else if (eventType === 'confirm' && index < 2) {
                e.selection = index;
                if (e.id === 'action') core.actions._keyUpAction(13);
                else core.actions._keyUpConfirmBox(13);
            } else {
                fail(request.id, 'event_action_unavailable', 'Choose is available only for visible choices or a two-option confirmation.'); return;
            }
        } else {
            fail(request.id, 'invalid_event_action', 'Use advance or choose.'); return;
        }
        refreshStateVersion();
        var beforeVersion = stateVersion;
        eventActionInProgress = true;
        setTimeout(function () {
            eventActionInProgress = false;
            var receipt = actionReceipt(beforeState, { action: action });
            receipt.stateChanged = stateVersion !== beforeVersion;
            if (!receipt.event) receipt.eventEnded = true;
            respond(request.id, true, receipt);
        }, 250);
    }

    function respond(id, ok, value) {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        var packet = ok
            ? { v: PROTOCOL, kind: 'reply', id: id, ok: true, result: value }
            : { v: PROTOCOL, kind: 'reply', id: id, ok: false, error: value };
        socket.send(JSON.stringify(packet));
    }

    function fail(id, code, message) { respond(id, false, { code: code, message: message }); }

    function maxSaveSlot() {
        return 5 * (Number.isInteger(main.savePages) && main.savePages > 0 ? main.savePages : 1000);
    }

    function listSaves(request) {
        core.getSaveIndexes(function (indexes) {
            var slots = Object.keys(indexes || {}).map(Number).filter(function (slot) {
                return Number.isInteger(slot) && slot > 0 && slot <= maxSaveSlot();
            }).sort(function (a, b) { return a - b; });
            var nextSlot = 1;
            while (slots.indexOf(nextSlot) >= 0 && nextSlot <= maxSaveSlot()) nextSlot++;
            respond(request.id, true, { slots: slots, nextEmptySlot: nextSlot, autosaveAvailable: !!(indexes && indexes[0]), autosaveSlot: 0, maxSlot: maxSaveSlot() });
        });
    }

    function saveToSlot(request) {
        var args = request.args || {}, slot = args.slot, overwrite = args.overwrite === true;
        if (!Number.isInteger(slot) || slot < 1 || slot > maxSaveSlot()) {
            fail(request.id, 'invalid_save_slot', 'slot must be an available manual slot between 1 and ' + maxSaveSlot() + '.');
            return;
        }
        if (phase() !== 'playing' || core.status.lockControl || (core.status.automaticRoute && core.status.automaticRoute.autoHeroMove)) {
            fail(request.id, 'game_busy', 'Save only while the game is in stable play.');
            return;
        }
        core.getSaveIndexes(function (indexes) {
            if (indexes && indexes[slot] && !overwrite) {
                fail(request.id, 'save_exists', 'Save slot ' + slot + ' already contains a save. Set overwrite=true only when the user asked to replace it.');
                return;
            }
            var data;
            try { data = core.saveData(); }
            catch (error) { fail(request.id, 'save_failed', String(error && error.message || error)); return; }
            core.setLocalForage('save' + slot, data, function () {
                core.saves.saveIndex = slot;
                core.setLocalStorage('saveIndex', slot);
                refreshStateVersion();
                respond(request.id, true, { saved: true, slot: slot, overwritten: !!(indexes && indexes[slot]), state: readyState() });
            }, function (error) {
                fail(request.id, 'save_failed', String(error && error.message || error));
            });
        });
    }

    function loadFromSlot(request) {
        var slot = request.args && request.args.slot;
        if (!Number.isInteger(slot) || slot < 0 || slot > maxSaveSlot()) {
            fail(request.id, 'invalid_save_slot', 'slot must be 0 (latest autosave) or an integer between 1 and ' + maxSaveSlot() + '.');
            return;
        }
        core.getSave(slot, function (stored) {
            var data = stored;
            if (slot === 0 && Array.isArray(stored)) {
                var autosaveIndex = Math.max(0, Math.min(stored.length - 1, (core.saves.autosave && core.saves.autosave.now || stored.length) - 1));
                data = stored.length ? stored[autosaveIndex] : null;
            }
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                fail(request.id, 'save_empty', slot === 0 ? 'No autosave is available.' : 'Save slot ' + slot + ' is empty.');
                return;
            }
            if (data.version !== core.firstData.version) {
                fail(request.id, 'save_version_mismatch', 'This save belongs to a different game version. Load it through the game UI to review replay compatibility.');
                return;
            }
            if (!data.hero || !data.hero.loc || !data.maps || typeof data.floorId !== 'string' || typeof data.route !== 'string') {
                fail(request.id, 'invalid_save', 'The selected save is missing required game data.');
                return;
            }
            if (data.hero.flags && data.hero.flags.__events__ && data.guid !== core.getGuid()) {
                fail(request.id, 'save_security_check', 'This save contains event state from a different game installation. Load it through the game UI to review the safety prompt.');
                return;
            }
            try {
                hideTitlePanel();
                if (core.ui && typeof core.ui.clearUI === 'function') {
                    try { core.ui.clearUI(); } catch (_) {}
                }
                core.loadData(data, function () {
                    try {
                        core.removeFlag('__fromLoad__');
                        revealLoadedGameUi();
                        if (typeof core.drawTip === 'function') {
                            try { core.drawTip('读档成功'); } catch (_) {}
                        }
                        if (slot > 0) {
                            core.saves.saveIndex = slot;
                            core.setLocalStorage('saveIndex', slot);
                        }
                        sendStateSnapshot();
                        var receipt = actionReceipt(null, { loaded: true, slot: slot });
                        receipt.hero = receipt.state.hero;
                        var view = floorView();
                        if (view) receipt.floor = view;
                        respond(request.id, true, receipt);
                    } catch (err) {
                        fail(request.id, 'load_failed', String(err && err.message || err));
                    }
                });
            } catch (error) { fail(request.id, 'load_failed', String(error && error.message || error)); }
        });
    }

    function towerResources() {
        if (!core.status || !core.status.maps || !Array.isArray(core.floorIds)) return null;
        var visitedFloors = [];
        var totalItems = {}, totalDoors = {}, totalEnemies = 0;
        core.floorIds.forEach(function (floorId) {
            if (typeof core.hasVisitedFloor === 'function' && !core.hasVisitedFloor(floorId)) return;
            var floor = core.status.maps[floorId];
            if (!floor || !Array.isArray(floor.blocks)) return;
            var items = {}, doors = {}, enemies = 0;
            floor.blocks.forEach(function (block) {
                if (block.disable) return;
                var kind = blockKind(block);
                var id = block.event && block.event.id || block.id;
                if (kind === 'item') {
                    items[id] = items[id] || [];
                    items[id].push([block.x, block.y]);
                    totalItems[id] = (totalItems[id] || 0) + 1;
                } else if (kind === 'door') {
                    doors[id] = (doors[id] || 0) + 1;
                    totalDoors[id] = (totalDoors[id] || 0) + 1;
                } else if (kind === 'enemy') {
                    enemies++;
                    totalEnemies++;
                }
            });
            visitedFloors.push({
                floorId: floorId,
                title: floor.title || floor.name || floorId,
                items: items,
                doors: doors,
                remainingEnemies: enemies
            });
        });
        return {
            visitedFloorsCount: visitedFloors.length,
            totals: {
                items: totalItems,
                doors: totalDoors,
                remainingEnemies: totalEnemies
            },
            floors: visitedFloors
        };
    }

    function flyToFloor(request) {
        var targetFloorId = request.args && request.args.floorId;
        if (!targetFloorId || typeof targetFloorId !== 'string') {
            fail(request.id, 'invalid_target', 'floorId must be a valid floor identifier (e.g. "MT1").');
            return;
        }
        if (phase() !== 'playing' || core.status.lockControl || (core.status.automaticRoute && core.status.automaticRoute.autoHeroMove)) {
            fail(request.id, 'game_busy', 'Floor jump is only available when the game is in stable play.');
            return;
        }
        if (!core.hasItem || !core.hasItem('fly')) {
            fail(request.id, 'fly_unavailable', 'The hero does not possess the floor jump device (fly).');
            return;
        }
        if (!core.hasVisitedFloor || !core.hasVisitedFloor(targetFloorId)) {
            fail(request.id, 'floor_not_visited', 'You can only jump to previously visited floors.');
            return;
        }
        var curFloor = core.status.floorId;
        if (curFloor === targetFloorId) {
            fail(request.id, 'already_there', 'You are already on floor ' + targetFloorId + '.');
            return;
        }
        var mapFrom = core.status.maps && core.status.maps[curFloor];
        var mapTo = core.status.maps && core.status.maps[targetFloorId];
        if (mapFrom && mapFrom.canFlyFrom === false) {
            fail(request.id, 'cannot_fly_from', 'Floor jump is disabled on current floor ' + curFloor + '.');
            return;
        }
        if (mapTo && mapTo.canFlyTo === false) {
            fail(request.id, 'cannot_fly_to', 'Floor jump is disabled to destination floor ' + targetFloorId + '.');
            return;
        }
        var beforeState = readyState();
        try {
            var ok = core.flyTo(targetFloorId, function () {
                var receipt = actionReceipt(beforeState, { mode: 'fly', to: targetFloorId });
                respond(request.id, true, receipt);
            });
            if (ok === false) {
                fail(request.id, 'fly_failed', 'Game rejected the floor jump.');
            }
        } catch (error) {
            fail(request.id, 'fly_failed', String(error && error.message || error));
        }
    }

    function handle(request) {
        if (!request || request.v !== PROTOCOL || typeof request.id !== 'string') return;
        if (request.kind === 'cancel') {
            if (activeMove && activeMove.id === request.id) {
                activeMove.cancelled = true;
                if (activeMove.mode === 'route') {
                    try { core.stopAutomaticRoute(); } catch (_) {}
                }
            }
            return;
        }
        if (request.kind !== 'request') return;
        var gamePhase = phase();
        if (request.tool === 'mota_status') {
            respond(request.id, true, readyState());
            return;
        }
        if (request.tool === 'mota_event') {
            respond(request.id, true, eventSnapshot());
            return;
        }
        if (request.tool === 'mota_screenshot') {
            captureGameCanvas().then(function (image) {
                respond(request.id, true, image);
            }).catch(function (error) {
                fail(request.id, 'screenshot_failed', String(error && error.message || error));
            });
            return;
        }
        if (request.tool === 'mota_start_game') {
            startNewGame(request);
            return;
        }
        if (request.tool === 'mota_saves') { listSaves(request); return; }
        if (request.tool === 'mota_save') { saveToSlot(request); return; }
        if (request.tool === 'mota_load') { loadFromSlot(request); return; }
        if (!core.status.played || core.status.gameOver) {
            fail(request.id, core.status.gameOver ? 'game_over' : 'not_started', 'There is no active game run.');
            return;
        }
        if (request.tool === 'mota_move') {
            moveInDirection(request);
            return;
        }
        if (request.tool === 'mota_move_to') {
            moveToTile(request);
            return;
        }
        if (request.tool === 'mota_event_action') {
            actOnEvent(request);
            return;
        }
        if (request.tool === 'mota_resources') {
            var res = towerResources();
            if (!res) { fail(request.id, 'resources_unavailable', 'Cannot read tower resources right now.'); return; }
            respond(request.id, true, res);
            return;
        }
        if (request.tool === 'mota_fly') {
            flyToFloor(request);
            return;
        }
        if (request.tool === 'mota_map') {
            var map = core.status.thisMap;
            if (!map || !Array.isArray(map.blocks)) { fail(request.id, 'map_unavailable', 'The current floor map is unavailable.'); return; }
            var view = floorView();
            view.phase = gamePhase;
            respond(request.id, true, view);
            return;
        }
        if (request.tool === 'mota_battle') {
            var x = request.args && request.args.x, y = request.args && request.args.y;
            if (!Number.isInteger(x) || !Number.isInteger(y)) { fail(request.id, 'invalid_target', 'x and y must be integer map coordinates.'); return; }
            var block = core.getBlock(x, y);
            if (!block || !block.event || !block.event.id || String(block.event.cls || '').indexOf('enemy') !== 0) {
                fail(request.id, 'invalid_target', 'There is no enemy at that coordinate.');
                return;
            }
            var enemyId = block.event.id;
            respond(request.id, true, {
                phase: gamePhase, floorId: core.status.floorId, x: x, y: y,
                enemyId: enemyId,
                enemy: core.getEnemyInfo(enemyId, null, x, y),
                battle: core.getDamageInfo(enemyId, null, x, y),
                stateVersion: stateVersion
            });
            return;
        }
        fail(request.id, 'unknown_tool', 'The requested read operation is not supported.');
    }

    function captureGameCanvas() {
        var root = document.getElementById('gameGroup') || document.getElementById('gameDraw');
        if (!root) return Promise.reject(new Error('The Magic Tower game area is not available.'));
        var rootRect = root.getBoundingClientRect();
        var width = Math.max(1, Math.round(rootRect.width));
        var height = Math.max(1, Math.round(rootRect.height));
        var output = document.createElement('canvas');
        output.width = width;
        output.height = height;
        var context = output.getContext('2d');
        if (!context) return Promise.reject(new Error('Could not create a canvas for the game screenshot.'));
        var elements = [root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));
        var backgroundImages = new Map();
        var imageLoads = [];
        elements.forEach(function (element) {
            var style = getComputedStyle(element), match = /url\(["']?(.*?)["']?\)/.exec(style.backgroundImage || '');
            if (!match || backgroundImages.has(match[1])) return;
            var image = new Image();
            backgroundImages.set(match[1], image);
            imageLoads.push(new Promise(function (resolve) {
                image.onload = resolve;
                image.onerror = resolve;
                image.src = new URL(match[1], document.baseURI).href;
                if (image.complete) resolve();
            }));
        });

        return Promise.all(imageLoads).then(function () {
            context.fillStyle = '#000000';
            context.fillRect(0, 0, width, height);

            function drawText(element, alpha) {
                Array.prototype.slice.call(element.childNodes).filter(function (node) { return node.nodeType === Node.TEXT_NODE; }).forEach(function (node) {
                    if (!node.nodeValue || !node.nodeValue.trim()) return;
                    var range = document.createRange();
                    range.selectNodeContents(node);
                    var textRects = Array.prototype.slice.call(range.getClientRects());
                    var style = getComputedStyle(node.parentElement);
                    if (style.display === 'none' || style.visibility === 'hidden') return;
                    context.save();
                    context.globalAlpha = alpha;
                    context.font = style.font || (style.fontSize + ' ' + style.fontFamily);
                    context.fillStyle = style.color;
                    context.textBaseline = 'alphabetic';
                    textRects.forEach(function (textRect) {
                        var x = textRect.left - rootRect.left;
                        if (style.textAlign === 'center') x += textRect.width / 2;
                        else if (style.textAlign === 'right' || style.textAlign === 'end') x += textRect.width;
                        var y = textRect.bottom - rootRect.top - Math.max(1, parseFloat(style.fontSize) * 0.12);
                        context.textAlign = style.textAlign === 'center' ? 'center' : (style.textAlign === 'right' || style.textAlign === 'end' ? 'right' : 'left');
                        context.fillText(node.nodeValue.trim(), x, y, Math.max(1, textRect.width));
                    });
                    context.restore();
                });
            }

            function drawElement(element, parentAlpha) {
                var style = getComputedStyle(element);
                if (style.display === 'none' || style.visibility === 'hidden') return;
                var rect = element.getBoundingClientRect();
                if (rect.width <= 0 || rect.height <= 0) return;
                var x = rect.left - rootRect.left, y = rect.top - rootRect.top;
                var alpha = parentAlpha * (Number(style.opacity) || 0);
                if (style.opacity === '1') alpha = parentAlpha;
                if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    context.save();
                    context.globalAlpha = alpha;
                    context.fillStyle = style.backgroundColor;
                    context.fillRect(x, y, rect.width, rect.height);
                    context.restore();
                }
                var borderWidth = parseFloat(style.borderTopWidth) || 0;
                if (borderWidth > 0 && style.borderTopStyle !== 'none') {
                    context.save(); context.globalAlpha = alpha; context.lineWidth = borderWidth;
                    context.strokeStyle = style.borderTopColor; context.strokeRect(x + borderWidth / 2, y + borderWidth / 2, rect.width - borderWidth, rect.height - borderWidth);
                    context.restore();
                }
                var backgroundMatch = /url\(["']?(.*?)["']?\)/.exec(style.backgroundImage || '');
                if (backgroundMatch) {
                    var backgroundImage = backgroundImages.get(backgroundMatch[1]);
                    if (backgroundImage && backgroundImage.naturalWidth) {
                        context.save();
                        context.globalAlpha = alpha;
                        context.beginPath(); context.rect(x, y, rect.width, rect.height); context.clip();
                        var pattern = context.createPattern(backgroundImage, style.backgroundRepeat === 'no-repeat' ? 'no-repeat' : 'repeat');
                        if (pattern) { context.fillStyle = pattern; context.fillRect(x, y, rect.width, rect.height); }
                        context.restore();
                    }
                }
                if (element instanceof HTMLCanvasElement) {
                    if (element.width && element.height) {
                        context.save(); context.globalAlpha = alpha;
                        context.drawImage(element, x, y, rect.width, rect.height); context.restore();
                    }
                    return;
                } else if (element instanceof HTMLImageElement) {
                    if (element.complete && element.naturalWidth) {
                    context.save(); context.globalAlpha = alpha;
                    context.drawImage(element, x, y, rect.width, rect.height); context.restore();
                    }
                    return;
                }
                if (element.childNodes.length) drawText(element, alpha);
                var children = Array.prototype.slice.call(element.children);
                children.sort(function (a, b) {
                    var za = parseInt(getComputedStyle(a).zIndex, 10), zb = parseInt(getComputedStyle(b).zIndex, 10);
                    return (isNaN(za) ? 0 : za) - (isNaN(zb) ? 0 : zb);
                });
                children.forEach(function (child) { drawElement(child, alpha); });
            }

            Array.prototype.slice.call(root.children).sort(function (a, b) {
                var za = parseInt(getComputedStyle(a).zIndex, 10), zb = parseInt(getComputedStyle(b).zIndex, 10);
                return (isNaN(za) ? 0 : za) - (isNaN(zb) ? 0 : zb);
            }).forEach(function (child) { drawElement(child, 1); });
            var image = output.toDataURL('image/jpeg', 0.78);
            if (image.length > 440000) image = output.toDataURL('image/jpeg', 0.52);
            if (image.length > 440000) throw new Error('The game screenshot is too large to send.');
            return { mime: 'image/jpeg', width: width, height: height, base64: image.slice(image.indexOf(',') + 1) };
        });
    }

    function sendStateSnapshot() {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        refreshStateVersion();
        socket.send(JSON.stringify({ v: PROTOCOL, kind: 'state', gameInstanceId: gameInstanceId, state: readyState() }));
        lastSentStateVersion = stateVersion;
    }

    function connect() {
        if (!window.WebSocket || !window.core) { reconnectTimer = setTimeout(connect, 1500); return; }
        installUiObserver();
        try { socket = new WebSocket(BRIDGE_URL); }
        catch (_) { reconnectTimer = setTimeout(connect, 1500); return; }
        socket.onopen = function () {
            socket.send(JSON.stringify({
                v: PROTOCOL, kind: 'hello', token: BRIDGE_TOKEN, gameInstanceId: gameInstanceId,
                features: ['state_snapshots', 'game_canvas_screenshot', 'compact_floor_view']
            }));
            lastSentStateVersion = -1;
            sendStateSnapshot();
            if (!phaseTimer) phaseTimer = setInterval(function () {
                refreshStateVersion();
                if (stateVersion !== lastSentStateVersion) sendStateSnapshot();
            }, 500);
        };
        socket.onmessage = function (event) {
            var request;
            try { request = JSON.parse(event.data); } catch (_) { return; }
            if (!request || typeof request !== 'object' || Array.isArray(request)) return;
            try { handle(request); }
            catch (error) { fail(request.id, 'game_error', String(error && error.message || error)); }
        };
        socket.onclose = function () {
            if (socket) socket = null;
            if (phaseTimer) { clearInterval(phaseTimer); phaseTimer = null; }
            movementInProgress = false;
            reconnectTimer = setTimeout(connect, 1500);
        };
        socket.onerror = function () { /* onclose schedules reconnection */ };
    }

    connect();
})();
