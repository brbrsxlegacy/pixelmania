(function () {
  var L = window.LUMA = window.LUMA || {};
  if (!L.Asset) return;

  var KEY = { r: 255, g: 0, b: 255 };
  var KEY_TOLERANCE = 92;

  var atlasDefs = {
    luma: { src: "assets/luma-atlas-ai.png", cols: 10, rows: 15, pad: 4 },
    tiles: { src: "assets/world-tiles-ai.png", cols: 10, rows: 10, pad: 3 },
    buildings: { src: "assets/buildings-ai.png", cols: 6, rows: 5, pad: 5 },
    chars: { src: "assets/characters-ai.png", cols: 14, rows: 8, pad: 2 }
  };

  var atlases = {};
  var creatureIndexById = {};

  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function keyDistance(r, g, b) {
    return Math.abs(r - KEY.r) + Math.abs(g - KEY.g) + Math.abs(b - KEY.b);
  }

  function stripChroma(image) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0);
    try {
      var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var data = img.data;
      for (var i = 0; i < data.length; i += 4) {
        var dist = keyDistance(data[i], data[i + 1], data[i + 2]);
        if (dist < KEY_TOLERANCE || (data[i] > 210 && data[i + 1] < 95 && data[i + 2] > 210)) {
          data[i + 3] = 0;
        } else if (dist < KEY_TOLERANCE + 65) {
          data[i + 3] = Math.min(data[i + 3], 160);
        }
      }
      ctx.putImageData(img, 0, 0);
    } catch (err) {
      canvas = image;
    }
    return canvas;
  }

  function loadAtlas(key, def) {
    var image = new Image();
    atlases[key] = { def: def, image: image, canvas: null, ready: false };
    image.onload = function () {
      atlases[key].canvas = stripChroma(image);
      atlases[key].ready = true;
    };
    image.src = def.src;
  }

  function atlasCell(key, index, pad) {
    var atlas = atlases[key];
    if (!atlas || !atlas.ready || !atlas.canvas) return null;
    var def = atlas.def;
    var col = index % def.cols;
    var row = Math.floor(index / def.cols);
    if (row >= def.rows) return null;
    var cw = atlas.canvas.width / def.cols;
    var ch = atlas.canvas.height / def.rows;
    var p = pad == null ? def.pad : pad;
    return {
      image: atlas.canvas,
      sx: col * cw + p,
      sy: row * ch + p,
      sw: Math.max(1, cw - p * 2),
      sh: Math.max(1, ch - p * 2)
    };
  }

  function drawCell(ctx, key, index, x, y, w, h, options) {
    var cell = atlasCell(key, index, options && options.pad);
    if (!cell) return false;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (options && options.alpha != null) ctx.globalAlpha = options.alpha;
    if (options && options.flip) {
      ctx.translate(Math.round(x + w), Math.round(y));
      ctx.scale(-1, 1);
      ctx.drawImage(cell.image, cell.sx, cell.sy, cell.sw, cell.sh, 0, 0, Math.round(w), Math.round(h));
    } else {
      ctx.drawImage(cell.image, cell.sx, cell.sy, cell.sw, cell.sh, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }
    ctx.restore();
    return true;
  }

  function buildCreatureIndex() {
    var ids = Object.keys((window.LUMA_DATA && window.LUMA_DATA.creatures) || {});
    ids.forEach(function (id, index) {
      creatureIndexById[id] = index % (atlasDefs.luma.cols * atlasDefs.luma.rows);
      var base = window.LUMA_DATA.creatures[id];
      if (base) base.aiIndex = creatureIndexById[id];
    });
  }

  var tileIndex = {
    grass: 0, meadow: 1, forest: 2, sandGrass: 3, road: 4, leafRoad: 7, tallGrass: 8, water: 9,
    bridge: 11, plaza: 6, cave: 13, caveFloor: 14, woodFloor: 15, labFloor: 16, clinicFloor: 17, shopFloor: 18,
    rug: 19, roomWall: 20, cityStone: 23, asphalt: 24, marketTile: 25, gardenTile: 26,
    desert: 27, snow: 28, lava: 29, swamp: 30, ruinFloor: 32
  };

  var objectArt = {
    tree: { atlas: "tiles", index: 40, w: 36, h: 40, y: -4, pad: 2 },
    pine: { atlas: "tiles", index: 42, w: 34, h: 42, y: -5, pad: 2 },
    flowerPink: { atlas: "tiles", index: 53, w: 18, h: 18, x: -1, y: -2, pad: 7 },
    flowerYellow: { atlas: "tiles", index: 54, w: 18, h: 18, x: -1, y: -2, pad: 7 },
    mushroom: { atlas: "tiles", index: 59, w: 18, h: 18, x: -1, y: -2, pad: 7 },
    rock: { atlas: "tiles", index: 60, w: 22, h: 18, x: -3, y: -2, pad: 5 },
    caveWall: { atlas: "tiles", index: 34, w: 22, h: 20, x: -3, y: -3, pad: 5 },
    log: { atlas: "tiles", index: 64, w: 32, h: 18, y: -2, pad: 5 },
    dock: { atlas: "tiles", index: 91, w: 82, h: 26, y: -5, pad: 3 },
    sign: { atlas: "tiles", index: 78, w: 20, h: 24, x: -2, y: -6, pad: 4 },
    well: { atlas: "tiles", index: 74, w: 34, h: 34, x: -1, y: -6, pad: 3 },
    fountain: { atlas: "tiles", index: 75, w: 48, h: 42, y: -10, pad: 2 },
    chest: { atlas: "tiles", index: 80, w: 20, h: 18, x: -2, y: -2, pad: 5 },
    crystalBlue: { atlas: "tiles", index: 38, w: 24, h: 28, x: -4, y: -10, pad: 4 },
    crystalPink: { atlas: "tiles", index: 37, w: 24, h: 28, x: -4, y: -10, pad: 4 },
    cityLamp: { atlas: "tiles", index: 76, w: 18, h: 34, x: -1, y: -13, pad: 4 },
    iceRock: { atlas: "tiles", index: 99, w: 24, h: 22, x: -4, y: -5, pad: 4 },
    lavaRock: { atlas: "tiles", index: 97, w: 24, h: 22, x: -4, y: -5, pad: 4 },
    palm: { atlas: "tiles", index: 96, w: 26, h: 38, x: -5, y: -16, pad: 3 },
    houseBlue: { atlas: "buildings", index: 0, w: 86, h: 66, x: -2, y: -4 },
    houseRed: { atlas: "buildings", index: 1, w: 86, h: 66, x: -2, y: -4 },
    shop: { atlas: "buildings", index: 2, w: 88, h: 66, x: -4, y: -4 },
    lab: { atlas: "buildings", index: 3, w: 112, h: 78, x: -2, y: -5 },
    healingStation: { atlas: "buildings", index: 4, w: 66, h: 58, x: -5, y: -8 },
    mayorHall: { atlas: "buildings", index: 5, w: 102, h: 76, x: -3, y: -4 },
    apartment: { atlas: "buildings", index: 6, w: 82, h: 78, x: -5, y: -5 },
    styleShop: { atlas: "buildings", index: 7, w: 74, h: 66, x: -5, y: -5 },
    realEstate: { atlas: "buildings", index: 8, w: 74, h: 66, x: -3, y: -5 },
    stall: { atlas: "buildings", index: 9, w: 54, h: 44, x: -3, y: -4 },
    cityTower: { atlas: "buildings", index: 10, w: 68, h: 84, x: -3, y: -4 },
    station: { atlas: "buildings", index: 11, w: 96, h: 68, x: -5, y: -4 },
    factory: { atlas: "buildings", index: 12, w: 98, h: 70, x: -2, y: -6 },
    arena: { atlas: "buildings", index: 13, w: 98, h: 78, x: -3, y: -8 },
    caveMouth: { atlas: "buildings", index: 14, w: 74, h: 58, x: -5, y: -8 },
    ruinGate: { atlas: "buildings", index: 15, w: 74, h: 62, x: -5, y: -6 },
    bookshelf: { atlas: "buildings", index: 26, w: 32, h: 32, pad: 12 },
    table: { atlas: "buildings", index: 25, w: 34, h: 30, y: 1, pad: 12 },
    labDesk: { atlas: "buildings", index: 27, w: 64, h: 34, y: -2, pad: 8 },
    bedBlue: { atlas: "buildings", index: 24, w: 34, h: 32, pad: 10 },
    bedRed: { atlas: "buildings", index: 25, w: 34, h: 32, pad: 10 },
    healingBed: { atlas: "buildings", index: 27, w: 50, h: 32, pad: 8 },
    healingCore: { atlas: "buildings", index: 23, w: 48, h: 42, y: -8, pad: 8 },
    shopCounter: { atlas: "buildings", index: 28, w: 96, h: 30, pad: 8 },
    shelfGoods: { atlas: "buildings", index: 28, w: 34, h: 32, pad: 10 },
    jobBoard: { atlas: "tiles", index: 79, w: 32, h: 30, pad: 3 },
    guildBoard: { atlas: "tiles", index: 79, w: 32, h: 30, pad: 3 }
  };

  var npcIndex = {
    professor: 28, elder: 30, healer: 32, merchant: 58, shopkeeper: 58, child: 38,
    traveler: 41, trainer: 42, trainer2: 44, ranger: 44, fisher: 46, collector: 48,
    explorer: 50, rival: 54, stylist: 56, broker: 58, worker: 60, clerk: 62,
    guard: 64, mayor: 65, board: 79
  };

  var outfitIndex = {
    guardian: 0, ranger: 2, courier: 3, night: 5, scholar: 6, ember: 8, aqua: 10, crystal: 12
  };

  Object.keys(atlasDefs).forEach(function (key) {
    loadAtlas(key, atlasDefs[key]);
  });
  buildCreatureIndex();

  L.AIArt = {
    status: function () {
      var status = {};
      Object.keys(atlases).forEach(function (key) {
        status[key] = !!(atlases[key] && atlases[key].ready);
      });
      status.creatures = Object.keys(creatureIndexById).length;
      status.allReady = Object.keys(atlases).every(function (key) { return !!(atlases[key] && atlases[key].ready); });
      return status;
    },

    drawTile: function (ctx, code, x, y) {
      var index = tileIndex[code];
      if (index == null) return false;
      return drawCell(ctx, "tiles", index, x, y, 16, 16, { pad: 4 });
    },

    drawObject: function (ctx, code, x, y) {
      var art = objectArt[code];
      if (!art) return false;
      var dx = x + (art.x || 0);
      var dy = y + (art.y || 0);
      rect(ctx, dx + Math.max(2, art.w * .12), dy + art.h - 7, Math.max(8, art.w * .72), 6, "rgba(9, 15, 24, .24)");
      return drawCell(ctx, art.atlas, art.index, dx, dy, art.w, art.h, { pad: art.pad });
    },

    drawPlayer: function (ctx, x, y, dir, moving, running, time, avatar) {
      var outfit = avatar && avatar.outfit || "guardian";
      var base = outfitIndex[outfit] == null ? outfitIndex.guardian : outfitIndex[outfit];
      var index = dir === "up" ? base + atlasDefs.chars.cols : base;
      var bob = moving ? Math.sin((time || 0) * (running ? 14 : 9)) * 1.2 : 0;
      rect(ctx, x + 1, y + 19, 19, 5, "rgba(9, 15, 24, .28)");
      return drawCell(ctx, "chars", index, x - 4, y - 8 + bob, 26, 32, { pad: 4, flip: dir === "left" });
    },

    drawRemotePlayer: function (ctx, remote, x, y, time) {
      var index = 5;
      var bob = Math.sin((time || 0) * 3 + remote.x) > .5 ? 1 : 0;
      var ok = drawCell(ctx, "chars", index, x - 4, y - 8 + bob, 26, 32, { pad: 4 });
      if (!ok) return false;
      var label = String(remote.name || "Oyuncu").slice(0, 12);
      ctx.font = "7px monospace";
      var width = Math.max(22, ctx.measureText(label).width + 6);
      rect(ctx, x + 7 - width / 2, y - 9, width, 8, "rgba(23, 32, 51, .78)");
      ctx.fillStyle = "#fff4d2";
      ctx.fillText(label, Math.round(x + 10 - width / 2), y - 3);
      return true;
    },

    drawNpc: function (ctx, npc, x, y, time) {
      if (npc.type === "sign" || npc.sprite === "sign") return this.drawObject(ctx, "sign", x, y + 2);
      var key = npc.sprite || npc.type;
      var index = npcIndex[key] == null ? npcIndex.traveler : npcIndex[key];
      var bob = Math.sin((time || 0) * 3 + npc.x) > .7 ? 1 : 0;
      rect(ctx, x + 1, y + 18, 18, 5, "rgba(9, 15, 24, .26)");
      return drawCell(ctx, "chars", index, x - 4, y - 8 + bob, 26, 32, { pad: 4 });
    },

    drawCreature: function (ctx, creatureOrBase, x, y, scale, flip, time) {
      var base = creatureOrBase && creatureOrBase.id ? window.LUMA_DATA.creatures[creatureOrBase.id] : creatureOrBase;
      if (!base) return false;
      var index = base.aiIndex != null ? base.aiIndex : creatureIndexById[base.id];
      if (index == null) return false;
      var s = scale || 1;
      var bob = Math.sin((time || 0) * 3 + index) * 1.2 * s;
      var w = 36 * s;
      var h = 36 * s;
      rect(ctx, x + 7 * s, y + 27 * s, 20 * s, 5 * s, "rgba(9, 15, 24, .25)");
      var ok = drawCell(ctx, "luma", index, x - 2 * s, y - 4 * s + bob, w, h, { pad: 6, flip: flip });
      if (ok && creatureOrBase && creatureOrBase.shiny) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = .22 + Math.sin((time || 0) * 5) * .06;
        ctx.fillStyle = "#fff08a";
        ctx.fillRect(Math.round(x - 1 * s), Math.round(y - 2 * s), Math.round(w), Math.round(h));
        ctx.restore();
      }
      return ok;
    }
  };

  var original = {
    drawTile: L.Asset.drawTile,
    drawObject: L.Asset.drawObject,
    drawPlayer: L.Asset.drawPlayer,
    drawRemotePlayer: L.Asset.drawRemotePlayer,
    drawNpc: L.Asset.drawNpc,
    drawCreature: L.Asset.drawCreature
  };

  L.Asset.drawTile = function (ctx, code, x, y, time) {
    if (L.AIArt.drawTile(ctx, code, x, y, time)) return;
    original.drawTile.call(L.Asset, ctx, code, x, y, time);
  };

  L.Asset.drawObject = function (ctx, code, x, y, time) {
    if (L.AIArt.drawObject(ctx, code, x, y, time)) return;
    original.drawObject.call(L.Asset, ctx, code, x, y, time);
  };

  L.Asset.drawPlayer = function (ctx, x, y, dir, moving, running, time, avatar) {
    if (L.AIArt.drawPlayer(ctx, x, y, dir, moving, running, time, avatar)) return;
    original.drawPlayer.call(L.Asset, ctx, x, y, dir, moving, running, time, avatar);
  };

  L.Asset.drawRemotePlayer = function (ctx, remote, x, y, time) {
    if (L.AIArt.drawRemotePlayer(ctx, remote, x, y, time)) return;
    original.drawRemotePlayer.call(L.Asset, ctx, remote, x, y, time);
  };

  L.Asset.drawNpc = function (ctx, npc, x, y, time) {
    if (L.AIArt.drawNpc(ctx, npc, x, y, time)) return;
    original.drawNpc.call(L.Asset, ctx, npc, x, y, time);
  };

  L.Asset.drawCreature = function (ctx, creatureOrBase, x, y, scale, flip, time) {
    if (L.AIArt.drawCreature(ctx, creatureOrBase, x, y, scale, flip, time)) return;
    original.drawCreature.call(L.Asset, ctx, creatureOrBase, x, y, scale, flip, time);
  };
})();
