(function () {
  var L = window.LUMA = window.LUMA || {};
  var TILE = 16;

  L.MapSystem = function () {};

  L.MapSystem.prototype.get = function (id) {
    return window.LUMA_DATA.maps[id];
  };

  L.MapSystem.prototype.draw = function (ctx, game) {
    var map = game.map;
    var camera = game.camera;
    var time = game.time;
    var startX = Math.max(0, Math.floor(camera.x / TILE) - 2);
    var startY = Math.max(0, Math.floor(camera.y / TILE) - 3);
    var endX = Math.min(map.w - 1, Math.ceil((camera.x + camera.width) / TILE) + 3);
    var endY = Math.min(map.h - 1, Math.ceil((camera.y + camera.height) / TILE) + 4);

    for (var y = startY; y <= endY; y += 1) {
      for (var x = startX; x <= endX; x += 1) {
        var index = y * map.w + x;
        L.Asset.drawTile(ctx, map.ground[index], x * TILE - camera.x, y * TILE - camera.y, time);
      }
    }

    var drawables = [];
    for (var yy = startY; yy <= endY; yy += 1) {
      for (var xx = startX; xx <= endX; xx += 1) {
        var code = map.decoration[yy * map.w + xx];
        if (code) {
          drawables.push({
            type: "decor",
            code: code,
            x: xx,
            y: yy,
            depth: L.Asset.objectDepth(code, xx, yy)
          });
        }
      }
    }

    map.items.forEach(function (item) {
      if (game.state.collectedItems[item.id]) return;
      if (item.hidden) return;
      drawables.push({ type: "item", item: item, x: item.x, y: item.y, depth: item.y * TILE + 16 });
    });

    game.npcs.current.forEach(function (npc) {
      drawables.push({ type: "npc", npc: npc, x: npc.x, y: npc.y, depth: npc.y * TILE + 18 });
    });
    if (game.roamers) {
      game.roamers.current.forEach(function (roamer) {
        drawables.push({ type: "roamer", roamer: roamer, depth: roamer.y + 20 });
      });
    }
    if (game.multiplayer) {
      game.multiplayer.sameMapPlayers(map.id).forEach(function (remote) {
        drawables.push({ type: "remote", remote: remote, depth: remote.y + 20 });
      });
    }
    var followerCreature = game.followerCreature && game.followerCreature();
    if (followerCreature && game.follower) {
      drawables.push({ type: "follower", creature: followerCreature, depth: game.follower.y + 18 });
    }
    drawables.push({ type: "player", depth: game.player.y + game.player.h });

    drawables.sort(function (a, b) { return a.depth - b.depth; });

    drawables.forEach(function (d) {
      if (d.type === "decor") L.Asset.drawObject(ctx, d.code, d.x * TILE - camera.x, d.y * TILE - camera.y, time);
      if (d.type === "item") L.Asset.drawObject(ctx, "chest", d.item.x * TILE - camera.x, d.item.y * TILE - camera.y, time);
      if (d.type === "npc") L.Asset.drawNpc(ctx, d.npc, d.npc.x * TILE + 1 - camera.x, d.npc.y * TILE - 2 - camera.y, time);
      if (d.type === "roamer") L.Asset.drawCreature(ctx, { id: d.roamer.creatureId }, Math.round(d.roamer.x - camera.x - 9), Math.round(d.roamer.y - camera.y - 12), .8, false, time);
      if (d.type === "remote") L.Asset.drawRemotePlayer(ctx, d.remote, Math.round(d.remote.x - camera.x), Math.round(d.remote.y - camera.y), time);
      if (d.type === "follower") L.Asset.drawCreature(ctx, d.creature, Math.round(game.follower.x - camera.x - 7), Math.round(game.follower.y - camera.y - 8), .65, false, time);
      if (d.type === "player") game.player.draw(ctx, camera, time, game.state && game.state.avatar);
    });

    game.particles.draw(ctx, camera);
  };

  L.MapSystem.prototype.exitAt = function (map, rect) {
    for (var i = 0; i < map.exits.length; i += 1) {
      var e = map.exits[i];
      if (rect.x < (e.x + e.w) * TILE && rect.x + rect.w > e.x * TILE &&
          rect.y < (e.y + e.h) * TILE && rect.y + rect.h > e.y * TILE) {
        return e;
      }
    }
    return null;
  };

  L.MapSystem.prototype.interactionAt = function (map, tx, ty) {
    for (var i = 0; i < map.interactions.length; i += 1) {
      var it = map.interactions[i];
      if (it.x === tx && it.y === ty) return it;
      var radius = it.type === "lab" ? 4 : (it.type === "door" ? 2 : 1);
      if (Math.abs(it.x - tx) <= radius && Math.abs(it.y - ty) <= radius && ["heal", "shop", "lab", "cave", "well", "door"].indexOf(it.type) >= 0) return it;
    }
    return null;
  };

  L.MapSystem.prototype.itemAt = function (map, tx, ty, state) {
    for (var i = 0; i < map.items.length; i += 1) {
      var item = map.items[i];
      if (state.collectedItems[item.id]) continue;
      var near = item.hidden ? Math.abs(item.x - tx) <= 1 && Math.abs(item.y - ty) <= 1 : item.x === tx && item.y === ty;
      if (near) return item;
    }
    return null;
  };

  L.MapSystem.prototype.encounterTile = function (map, player) {
    var foot = player.footRect(player.x, player.y);
    var tx = Math.floor((foot.x + foot.w / 2) / TILE);
    var ty = Math.floor((foot.y + foot.h / 2) / TILE);
    if (tx < 0 || ty < 0 || tx >= map.w || ty >= map.h) return false;
    return !!map.encounter[ty * map.w + tx];
  };
})();
