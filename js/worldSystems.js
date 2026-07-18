(function () {
  var L = window.LUMA = window.LUMA || {};

  var nodePositions = {
    isikpinar: [18, 74], yesilova: [30, 72], fisilti: [42, 66], kristalGol: [40, 82], magara: [50, 86],
    lumaSehir: [48, 48], pazarMeydani: [36, 48], belediyeBahcesi: [48, 31], lumaAkademi: [61, 48],
    trenIstasyonu: [36, 30], liman: [23, 48], sanayi: [36, 64], arenaMeydan: [73, 50],
    botanikBahce: [63, 31], rengarenkCayir: [77, 28], geceKorusu: [79, 15], sisBatakligi: [92, 17],
    meteorTepesi: [62, 16], lavKanyonu: [75, 12], kumruCukuru: [75, 27], kristalMaden: [90, 10],
    sahilRotasi: [62, 66], buzulKiyi: [78, 72], gokKulesi: [47, 12], antikaHarabe: [31, 18], kutupPatikasi: [35, 13]
  };

  var cityStations = {
    lumaSehir: true, pazarMeydani: true, trenIstasyonu: true, liman: true, sanayi: true,
    arenaMeydan: true, lumaAkademi: true, belediyeBahcesi: true
  };

  function ensureState(state) {
    state.world = Object.assign({ targetMapId: null, discovered: { isikpinar: true } }, state.world || {});
    state.world.discovered = Object.assign({ isikpinar: true }, state.world.discovered || {});
    state.dex = Object.assign({ seen: {}, caught: {} }, state.dex || {});
    state.dex.seen = Object.assign({}, state.dex.seen || {});
    state.dex.caught = Object.assign({}, state.dex.caught || {});
    state.badges = Object.assign({}, state.badges || {});
    state.multiplayerMeta = Object.assign({ emote: "", lastInvite: null }, state.multiplayerMeta || {});
  }

  function mapName(id) {
    var map = window.LUMA_DATA.maps[id];
    return map ? map.name : id;
  }

  function isPlayableMap(id) {
    return !!nodePositions[id] && !!window.LUMA_DATA.maps[id];
  }

  function neighbors(mapId) {
    var map = window.LUMA_DATA.maps[mapId];
    if (!map) return [];
    return (map.exits || []).map(function (exit) { return exit.to; }).filter(isPlayableMap);
  }

  function route(from, to) {
    if (!from || !to || from === to) return [];
    var queue = [from];
    var came = {};
    came[from] = null;
    while (queue.length) {
      var current = queue.shift();
      if (current === to) break;
      neighbors(current).forEach(function (next) {
        if (came.hasOwnProperty(next)) return;
        came[next] = current;
        queue.push(next);
      });
    }
    if (!came.hasOwnProperty(to)) return [];
    var path = [];
    var at = to;
    while (at) {
      path.unshift(at);
      at = came[at];
    }
    return path;
  }

  function questTarget(state) {
    var active = L.Quests.active(state)[0];
    if (!active || !active.state) return null;
    var open = active.state.objectives.filter(function (o) { return !o.done; })[0];
    if (!open) return null;
    var id = open.id || "";
    if (id.indexOf("visit_") === 0) return { mapId: id.replace("visit_", ""), label: open.text };
    var direct = { reachLake: "kristalGol", enterCave: "magara", findCrystal: "yesilova", findLantern: "magara", talkMayor: "belediyeBahcesi" };
    if (direct[id]) return { mapId: direct[id], label: open.text };
    if (id.indexOf("catch_") === 0) {
      var wanted = id.replace("catch_", "");
      var habitat = L.WorldMap.firstHabitat(wanted);
      if (habitat) return { mapId: habitat, label: open.text };
    }
    return null;
  }

  L.WorldMap = {
    positions: nodePositions,
    cityStations: cityStations,

    ensureState: ensureState,

    discover: function (state, mapId) {
      ensureState(state);
      if (isPlayableMap(mapId)) state.world.discovered[mapId] = true;
    },

    setTarget: function (state, mapId) {
      ensureState(state);
      state.world.targetMapId = isPlayableMap(mapId) ? mapId : null;
    },

    targetForHud: function (game) {
      if (!game.state || !game.map) return null;
      ensureState(game.state);
      var target = game.state.world.targetMapId || (questTarget(game.state) && questTarget(game.state).mapId);
      if (!target || target === game.map.id) return null;
      var path = route(game.map.id, target);
      if (path.length < 2) return null;
      var next = path[1];
      var exit = (game.map.exits || []).filter(function (e) { return e.to === next; })[0];
      return { target: target, next: next, exit: exit, label: mapName(target) };
    },

    route: route,
    neighbors: neighbors,
    questTarget: questTarget,

    allNodes: function () {
      return Object.keys(nodePositions).filter(isPlayableMap).map(function (id) {
        return { id: id, name: mapName(id), x: nodePositions[id][0], y: nodePositions[id][1] };
      });
    },

    allLinks: function () {
      var seen = {};
      var links = [];
      this.allNodes().forEach(function (node) {
        neighbors(node.id).forEach(function (next) {
          var key = [node.id, next].sort().join("-");
          if (seen[key]) return;
          seen[key] = true;
          links.push([node.id, next]);
        });
      });
      return links;
    },

    recordSeen: function (state, creatureId) {
      ensureState(state);
      if (creatureId) state.dex.seen[creatureId] = true;
    },

    recordCaught: function (state, creatureId) {
      ensureState(state);
      if (!creatureId) return;
      state.dex.seen[creatureId] = true;
      state.dex.caught[creatureId] = (state.dex.caught[creatureId] || 0) + 1;
    },

    firstHabitat: function (creatureOrElement) {
      var maps = window.LUMA_DATA.maps;
      var byElement = !window.LUMA_DATA.creatures[creatureOrElement];
      var found = null;
      Object.keys(maps).some(function (mapId) {
        var entries = maps[mapId].encounters || [];
        var ok = entries.some(function (entry) {
          var base = window.LUMA_DATA.creatures[entry.id];
          return byElement ? base && base.element === creatureOrElement : entry.id === creatureOrElement;
        });
        if (ok) found = mapId;
        return ok;
      });
      return found;
    },

    habitats: function (creatureId) {
      var maps = window.LUMA_DATA.maps;
      return Object.keys(maps).filter(function (mapId) {
        return (maps[mapId].encounters || []).some(function (entry) { return entry.id === creatureId; });
      });
    },

    canFastTravel: function (state, mapId) {
      ensureState(state);
      return !!state.world.discovered[mapId] && !!nodePositions[mapId];
    },

    fastTravelCost: function (from, to) {
      var path = route(from, to);
      return Math.max(40, (path.length || 3) * 35);
    }
  };
})();
