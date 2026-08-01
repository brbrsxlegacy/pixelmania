(function () {
  var L = window.LUMA = window.LUMA || {};
  if (!L.Asset) return;

  var atlasDefs = {
    lumas: { src: "assets/artpack/lumas.png", cols: 16, count: 211, cellW: 64, cellH: 64 },
    characters: { src: "assets/artpack/characters.png", cols: 12, count: 34, cellW: 64, cellH: 72 },
    buildings: { src: "assets/artpack/buildings.png", cols: 6, count: 29, cellW: 176, cellH: 128 }
  };
  var atlases = {};
  var creatureIndex = {};
  var lumaManualIndex = {
    filizik: 0, cimsirik: 1, kozpati: 12, korcik: 13, kopukcu: 24, minsu: 25,
    tasburun: 36, ruzgocuk: 46, voltik: 56, golgemir: 68, parilti: 78,
    kristalik: 90, nilperi: 102, agackulak: 114, lumeru: 82,
    crownlex: 46, barbo: 56
  };
  var lumaBodyPools = {
    sprout: range(0, 11),
    flower: range(0, 11).concat(range(132, 135)),
    cat: range(12, 23),
    fox: range(12, 23),
    otter: range(24, 35),
    drop: range(24, 35),
    fish: range(102, 113),
    penguin: range(102, 113).concat(range(24, 35)),
    beetle: range(36, 45),
    crystal: range(90, 101),
    golem: range(160, 171),
    rhino: range(192, 196),
    bird: range(46, 55),
    owl: range(46, 55),
    moth: range(136, 147),
    mantis: range(136, 147),
    mouse: range(56, 67),
    bat: range(68, 77),
    wolf: range(68, 77),
    orb: range(78, 89),
    sprite: range(78, 89),
    star: range(198, 206),
    deer: range(114, 123),
    turtle: range(124, 135),
    snail: range(124, 135),
    lizard: range(148, 159),
    serpent: range(148, 159),
    crab: range(172, 181),
    scorpion: range(197, 203),
    rabbit: range(182, 190),
    frog: range(182, 190),
    jelly: range(182, 190),
    mushroom: range(207, 210)
  };

  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function loadAtlas(key, def) {
    var image = new Image();
    atlases[key] = { image: image, def: def, ready: false };
    image.onload = function () { atlases[key].ready = true; };
    image.onerror = function () { atlases[key].ready = false; };
    image.src = def.src;
  }

  function range(start, end) {
    var values = [];
    for (var i = start; i <= end; i += 1) values.push(i);
    return values;
  }

  function hashId(value) {
    var hash = 0;
    value = String(value || "");
    for (var i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  function chooseFromPool(pool, id, base) {
    if (!pool || !pool.length) return null;
    var variant = base && base.sprite && base.sprite.variant != null ? base.sprite.variant : 0;
    return pool[(hashId(id) + variant) % pool.length];
  }

  function chooseCreatureArtIndex(id, base, fallbackIndex) {
    if (lumaManualIndex[id] != null) return lumaManualIndex[id];
    var body = base && base.sprite && base.sprite.body;
    var byBody = chooseFromPool(lumaBodyPools[body], id, base);
    if (byBody != null) return byBody;
    return fallbackIndex % atlasDefs.lumas.count;
  }
  function buildCreatureIndex() {
    var data = window.LUMA_DATA && window.LUMA_DATA.creatures || {};
    Object.keys(data).forEach(function (id, index) {
      creatureIndex[id] = chooseCreatureArtIndex(id, data[id], index);
    });
  }

  function ready(key) {
    return !!(atlases[key] && atlases[key].ready);
  }

  function drawCell(ctx, key, index, x, y, w, h, flip) {
    var atlas = atlases[key];
    if (!atlas || !atlas.ready || index == null || index < 0 || index >= atlas.def.count) return false;
    var def = atlas.def;
    var sx = (index % def.cols) * def.cellW;
    var sy = Math.floor(index / def.cols) * def.cellH;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (flip) {
      ctx.translate(Math.round(x + w), Math.round(y));
      ctx.scale(-1, 1);
      ctx.drawImage(atlas.image, sx, sy, def.cellW, def.cellH, 0, 0, Math.round(w), Math.round(h));
    } else {
      ctx.drawImage(atlas.image, sx, sy, def.cellW, def.cellH, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }
    ctx.restore();
    return true;
  }

  function artShadow(ctx, x, y, w, h) {
    rect(ctx, x, y, w, h, "rgba(9, 15, 24, .24)");
  }

  var buildingArt = {
    houseBlue: { index: 0, w: 82, h: 66, x: 0, y: -4 },
    houseRed: { index: 1, w: 82, h: 66, x: 0, y: -4 },
    shop: { index: 2, w: 82, h: 66, x: -2, y: -4 },
    lab: { index: 3, w: 112, h: 82, x: -2, y: -8 },
    healingStation: { index: 4, w: 62, h: 58, x: -3, y: -8 },
    mayorHall: { index: 5, w: 96, h: 76, x: 0, y: -4 },
    apartment: { index: 6, w: 74, h: 76, x: -1, y: -4 },
    styleShop: { index: 7, w: 66, h: 66, x: -1, y: -4 },
    realEstate: { index: 8, w: 70, h: 64, x: 0, y: -4 },
    stall: { index: 9, w: 50, h: 44, x: -1, y: -4 },
    cityTower: { index: 10, w: 64, h: 84, x: 0, y: -6 },
    station: { index: 11, w: 94, h: 68, x: -4, y: -5 },
    factory: { index: 12, w: 96, h: 70, x: 0, y: -6 },
    arena: { index: 13, w: 96, h: 78, x: -1, y: -8 },
    caveMouth: { index: 14, w: 72, h: 58, x: -4, y: -7 },
    ruinGate: { index: 15, w: 70, h: 60, x: -3, y: -6 },
    dock: { index: 16, w: 82, h: 34, x: -1, y: -8 },
    fountain: { index: 17, w: 48, h: 42, x: 0, y: -10 },
    well: { index: 18, w: 34, h: 34, x: -1, y: -6 },
    sign: { index: 19, w: 22, h: 22, x: -3, y: -4 },
    bookshelf: { index: 20, w: 32, h: 32, x: 0, y: 0 },
    bedBlue: { index: 21, w: 32, h: 30, x: 0, y: 0 },
    bedRed: { index: 21, w: 32, h: 30, x: 0, y: 0 },
    table: { index: 22, w: 34, h: 30, x: -1, y: 0 },
    labDesk: { index: 23, w: 64, h: 34, x: 0, y: -2 },
    shopCounter: { index: 24, w: 96, h: 32, x: 0, y: -1 },
    shelfGoods: { index: 25, w: 32, h: 32, x: 0, y: 0 },
    healingBed: { index: 26, w: 50, h: 32, x: -1, y: -1 },
    healingCore: { index: 27, w: 48, h: 44, x: 0, y: -10 },
    chest: { index: 28, w: 20, h: 18, x: -2, y: -2 }
  };

  var interiorObjectFallback = {
    bookshelf: true,
    bedBlue: true,
    bedRed: true,
    table: true,
    labDesk: true,
    shopCounter: true,
    shelfGoods: true,
    healingBed: true,
    healingCore: true
  };
  var outfitArt = {
    guardian: { front: 0, back: 8 },
    ranger: { front: 4, back: 12 },
    courier: { front: 2, back: 10 },
    night: { front: 5, back: 13 },
    scholar: { front: 3, back: 11 },
    ember: { front: 6, back: 14 },
    aqua: { front: 1, back: 9 },
    crystal: { front: 7, back: 15 }
  };

  var npcArt = {
    professor: 16,
    elder: 17,
    healer: 18,
    merchant: 19,
    shopkeeper: 19,
    child: 20,
    traveler: 21,
    trainer: 22,
    trainer2: 22,
    ranger: 23,
    fisher: 24,
    collector: 25,
    explorer: 26,
    rival: 27,
    stylist: 28,
    broker: 29,
    worker: 30,
    clerk: 31,
    guard: 32,
    mayor: 33
  };

  Object.keys(atlasDefs).forEach(function (key) { loadAtlas(key, atlasDefs[key]); });
  buildCreatureIndex();

  L.ArtPack = {
    status: function () {
      return {
        lumas: ready("lumas"),
        characters: ready("characters"),
        buildings: ready("buildings"),
        creatures: Object.keys(creatureIndex).length,
        allReady: ready("lumas") && ready("characters") && ready("buildings")
      };
    },

    drawObject: function (ctx, code, x, y) {
      if (interiorObjectFallback[code]) return false;
      var art = buildingArt[code];
      if (!art || !ready("buildings")) return false;
      var dx = x + (art.x || 0);
      var dy = y + (art.y || 0);
      artShadow(ctx, dx + Math.max(2, art.w * .12), dy + art.h - 7, Math.max(8, art.w * .72), 6);
      return drawCell(ctx, "buildings", art.index, dx, dy, art.w, art.h, false);
    },

    drawPlayer: function (ctx, x, y, dir, moving, running, time, avatar) {
      if (!ready("characters")) return false;
      var outfit = avatar && avatar.outfit || "guardian";
      var art = outfitArt[outfit] || outfitArt.guardian;
      var index = dir === "up" ? art.back : art.front;
      var bob = moving ? Math.sin((time || 0) * (running ? 14 : 9)) * 1.2 : 0;
      artShadow(ctx, x + 1, y + 18, 18, 5);
      return drawCell(ctx, "characters", index, x - 5, y - 11 + bob, 26, 34, dir === "left");
    },

    drawRemotePlayer: function (ctx, remote, x, y, time) {
      if (!ready("characters")) return false;
      var bob = Math.sin((time || 0) * 3 + remote.x) > .5 ? 1 : 0;
      if (!drawCell(ctx, "characters", 5, x - 5, y - 11 + bob, 26, 34, false)) return false;
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
      if (!ready("characters")) return false;
      var key = npc.sprite || npc.type;
      var index = npcArt[key];
      if (index == null) return false;
      var bob = Math.sin((time || 0) * 3 + npc.x) > .7 ? 1 : 0;
      artShadow(ctx, x + 1, y + 18, 18, 5);
      return drawCell(ctx, "characters", index, x - 5, y - 11 + bob, 26, 34, false);
    },

    drawCreature: function (ctx, creatureOrBase, x, y, scale, flip, time) {
      if (!ready("lumas")) return false;
      var base = creatureOrBase && creatureOrBase.id ? window.LUMA_DATA.creatures[creatureOrBase.id] : creatureOrBase;
      if (!base) return false;
      var index = creatureIndex[base.id];
      if (index == null) return false;
      var s = scale || 1;
      var size = 35 * s;
      var bob = Math.sin((time || 0) * 3 + index) * 1.1 * s;
      artShadow(ctx, x + 7 * s, y + 27 * s, 20 * s, 5 * s);
      var ok = drawCell(ctx, "lumas", index, x - 2 * s, y - 5 * s + bob, size, size, flip);
      if (ok && creatureOrBase && creatureOrBase.shiny) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = .18 + Math.sin((time || 0) * 5) * .05;
        ctx.fillStyle = "#fff08a";
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(size), Math.round(size));
        ctx.restore();
      }
      return ok;
    }
  };

  var original = {
    drawObject: L.Asset.drawObject,
    drawPlayer: L.Asset.drawPlayer,
    drawRemotePlayer: L.Asset.drawRemotePlayer,
    drawNpc: L.Asset.drawNpc,
    drawCreature: L.Asset.drawCreature
  };

  L.Asset.drawObject = function (ctx, code, x, y, time) {
    if (L.ArtPack.drawObject(ctx, code, x, y, time)) return;
    original.drawObject.call(L.Asset, ctx, code, x, y, time);
  };

  L.Asset.drawPlayer = function (ctx, x, y, dir, moving, running, time, avatar) {
    if (L.ArtPack.drawPlayer(ctx, x, y, dir, moving, running, time, avatar)) return;
    original.drawPlayer.call(L.Asset, ctx, x, y, dir, moving, running, time, avatar);
  };

  L.Asset.drawRemotePlayer = function (ctx, remote, x, y, time) {
    if (L.ArtPack.drawRemotePlayer(ctx, remote, x, y, time)) return;
    original.drawRemotePlayer.call(L.Asset, ctx, remote, x, y, time);
  };

  L.Asset.drawNpc = function (ctx, npc, x, y, time) {
    if (L.ArtPack.drawNpc(ctx, npc, x, y, time)) return;
    original.drawNpc.call(L.Asset, ctx, npc, x, y, time);
  };

  L.Asset.drawCreature = function (ctx, creatureOrBase, x, y, scale, flip, time) {
    if (L.ArtPack.drawCreature(ctx, creatureOrBase, x, y, scale, flip, time)) return;
    original.drawCreature.call(L.Asset, ctx, creatureOrBase, x, y, scale, flip, time);
  };
})();
