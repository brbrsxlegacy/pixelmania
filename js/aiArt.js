(function () {
  var L = window.LUMA = window.LUMA || {};
  if (!L.Asset || !window.Image) return;

  var atlas = new Image();
  var atlasReady = false;
  atlas.onload = function () { atlasReady = true; };
  atlas.onerror = function () { atlasReady = false; };
  atlas.src = "assets/ai/crownlex-master-atlas.png";

  var original = {
    drawTile: L.Asset.drawTile,
    drawObject: L.Asset.drawObject,
    drawPlayer: L.Asset.drawPlayer,
    drawRemotePlayer: L.Asset.drawRemotePlayer,
    drawNpc: L.Asset.drawNpc,
    drawCreature: L.Asset.drawCreature
  };

  var tileRects = {
    grass: [14, 12, 98, 98], meadow: [126, 12, 98, 98], forest: [239, 12, 98, 98],
    road: [352, 12, 98, 98], plaza: [465, 12, 98, 98], cityStone: [579, 12, 98, 98],
    asphalt: [691, 12, 98, 98], water: [806, 12, 98, 98], bridge: [918, 12, 98, 98],
    cave: [1032, 12, 98, 98], caveFloor: [1032, 12, 98, 98], crystalFloor: [1145, 12, 98, 98],
    woodFloor: [14, 126, 98, 98], labFloor: [126, 126, 98, 98], clinicFloor: [239, 126, 98, 98],
    shopFloor: [352, 126, 98, 98], snow: [465, 126, 98, 98], desert: [579, 126, 98, 98],
    sandGrass: [579, 126, 98, 98], lava: [691, 126, 98, 98], emberPatch: [691, 126, 98, 98],
    swamp: [806, 126, 98, 98], ruinFloor: [918, 126, 98, 98], secretFloor: [1032, 126, 98, 98],
    gardenTile: [126, 12, 98, 98], royalStone: [918, 126, 98, 98], crystalCurrent: [1145, 12, 98, 98],
    icePath: [465, 126, 98, 98], boneSand: [579, 126, 98, 98], bonePit: [918, 126, 98, 98],
    sulfur: [691, 126, 98, 98], roomWall: [126, 126, 98, 98], tallGrass: [126, 12, 98, 98]
  };

  var objectRects = {
    houseBlue: [12, 282, 112, 126], houseRed: [135, 282, 112, 126], shop: [250, 282, 122, 126],
    lab: [382, 282, 120, 126], healingStation: [520, 282, 116, 126], mayorHall: [650, 282, 126, 126],
    apartment: [806, 282, 112, 126], station: [940, 282, 116, 126], arena: [1080, 280, 135, 132],
    ruinGate: [14, 430, 130, 116], caveMouth: [267, 430, 112, 110], tree: [410, 430, 82, 116],
    pine: [510, 430, 74, 116], palm: [604, 430, 78, 116], rock: [700, 430, 86, 92],
    caveWall: [700, 430, 86, 92], crystalPink: [810, 430, 82, 92], crystalBlue: [905, 430, 82, 92],
    chest: [1000, 445, 62, 72], sign: [1075, 445, 68, 74], well: [1155, 445, 78, 88],
    bookshelf: [15, 575, 78, 92], table: [145, 575, 86, 82], bedBlue: [255, 575, 82, 86],
    bedRed: [255, 575, 82, 86], healingBed: [255, 575, 82, 86], healingCore: [360, 565, 95, 100],
    stall: [495, 570, 126, 90], cityLamp: [665, 560, 62, 116], campfire: [755, 570, 90, 82],
    primeAltar: [875, 570, 98, 92], basaltPillar: [1015, 565, 86, 102], shelfGoods: [15, 575, 78, 92],
    labDesk: [145, 575, 86, 82], shopCounter: [495, 570, 126, 90], realEstate: [940, 282, 116, 126],
    styleShop: [250, 282, 122, 126], factory: [806, 282, 112, 126], jobBoard: [1075, 445, 68, 74],
    guildBoard: [1075, 445, 68, 74], fountain: [875, 570, 98, 92], iceRock: [700, 430, 86, 92],
    lavaRock: [700, 430, 86, 92], royalBanner: [1080, 280, 135, 132], glowFungus: [1032, 126, 98, 98],
    bonePile: [918, 126, 98, 98], flowerPink: [126, 12, 98, 98], flowerYellow: [126, 12, 98, 98],
    mushroom: [1032, 126, 98, 98], dock: [918, 12, 98, 98], log: [14, 126, 98, 98]
  };

  var npcRects = [
    [18, 684, 58, 96], [95, 684, 58, 96], [175, 680, 64, 98], [255, 682, 58, 98],
    [340, 682, 58, 96], [423, 684, 58, 96], [508, 684, 58, 96], [590, 684, 58, 96],
    [672, 684, 58, 96], [754, 684, 58, 96], [835, 684, 58, 96], [915, 684, 58, 96],
    [995, 684, 58, 96], [1075, 684, 58, 96], [15, 805, 58, 96], [95, 805, 58, 96],
    [175, 805, 58, 96], [255, 805, 58, 96], [338, 805, 58, 96], [420, 805, 58, 96]
  ];

  var creatureRects = [
    [575, 805, 66, 78], [657, 805, 72, 78], [740, 805, 76, 78], [823, 805, 78, 78],
    [910, 805, 84, 78], [1006, 780, 118, 110], [25, 925, 88, 88], [130, 925, 88, 88],
    [235, 925, 88, 88], [340, 925, 88, 88], [445, 925, 88, 88], [550, 925, 88, 88],
    [655, 925, 88, 88], [760, 925, 88, 88]
  ];

  var objectSize = {
    houseBlue: [92, 78], houseRed: [92, 78], shop: [94, 78], lab: [122, 92], healingStation: [72, 66],
    mayorHall: [112, 90], styleShop: [82, 74], realEstate: [84, 74], factory: [112, 82], station: [104, 80],
    arena: [112, 88], apartment: [88, 88], ruinGate: [78, 76], caveMouth: [80, 64], tree: [44, 54],
    pine: [44, 54], palm: [42, 48], dock: [88, 28], bookshelf: [44, 44], table: [48, 44],
    labDesk: [76, 46], shopCounter: [108, 46], shelfGoods: [44, 44], bedBlue: [44, 44], bedRed: [44, 44],
    healingBed: [64, 44], healingCore: [58, 48], stall: [62, 56], fountain: [64, 48], cityTower: [78, 98],
    cityLamp: [28, 42], campfire: [32, 30], primeAltar: [46, 46], royalBanner: [42, 46], basaltPillar: [34, 46],
    glowFungus: [26, 28], bonePile: [28, 24], well: [44, 44], chest: [30, 28], sign: [28, 28],
    rock: [30, 28], caveWall: [30, 28], crystalBlue: [34, 36], crystalPink: [34, 36], iceRock: [30, 28],
    lavaRock: [30, 28], flowerPink: [22, 22], flowerYellow: [22, 22], mushroom: [22, 22], log: [42, 26]
  };

  var objectCache = {};

  function ready() {
    return atlasReady && atlas.naturalWidth > 0;
  }

  function hash(value) {
    var str = String(value || "");
    var h = 0;
    for (var i = 0; i < str.length; i += 1) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function createCanvas(w, h) {
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return { canvas: canvas, ctx: ctx };
  }

  function drawAtlas(ctx, rect, x, y, w, h, alpha, composite) {
    if (!ready() || !rect) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    if (composite) ctx.globalCompositeOperation = composite;
    ctx.drawImage(atlas, rect[0], rect[1], rect[2], rect[3], Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    ctx.restore();
  }

  function paintMasked(offCtx, w, h, rect, alpha) {
    offCtx.save();
    offCtx.globalCompositeOperation = "source-atop";
    drawAtlas(offCtx, rect, 0, 0, w, h, alpha == null ? .52 : alpha);
    offCtx.restore();
  }

  function creatureRect(creatureOrBase) {
    var id = creatureOrBase && creatureOrBase.id || "luma";
    var base = window.LUMA_DATA && window.LUMA_DATA.creatures && window.LUMA_DATA.creatures[id];
    var body = base && base.sprite && base.sprite.body || "";
    if (body === "dragon" || body === "serpent" || String(id).indexOf("boss") >= 0) return [1006, 780, 118, 110];
    return creatureRects[hash(id) % creatureRects.length];
  }

  L.Asset.aiArt = {
    src: atlas.src,
    ready: function () { return ready(); }
  };

  L.Asset.drawTile = function (ctx, code, x, y, time) {
    original.drawTile.call(this, ctx, code, x, y, time);
    if (!ready()) return;
    drawAtlas(ctx, tileRects[code] || tileRects.grass, x, y, 16, 16, .64, "source-atop");
    ctx.save();
    ctx.globalAlpha = .24;
    ctx.fillStyle = "rgba(255,244,210,.18)";
    ctx.fillRect(Math.round(x), Math.round(y), 16, 1);
    ctx.restore();
  };

  L.Asset.drawObject = function (ctx, code, x, y, time) {
    if (!ready()) {
      original.drawObject.call(this, ctx, code, x, y, time);
      return;
    }
    var size = objectSize[code] || [96, 96];
    var pad = 10;
    var frame = Math.floor((time || 0) * 3) % 3;
    var key = code + ":" + frame;
    var cached = objectCache[key];
    if (!cached) {
      cached = createCanvas(size[0] + pad * 2, size[1] + pad * 2);
      original.drawObject.call(this, cached.ctx, code, pad, pad, time || 0);
      paintMasked(cached.ctx, cached.canvas.width, cached.canvas.height, objectRects[code] || objectRects.rock, .58);
      objectCache[key] = cached.canvas;
    }
    ctx.drawImage(cached, Math.round(x - pad), Math.round(y - pad));
  };

  L.Asset.drawPlayer = function (ctx, x, y, dir, moving, running, time, avatar) {
    if (!ready()) {
      original.drawPlayer.call(this, ctx, x, y, dir, moving, running, time, avatar);
      return;
    }
    var outfit = avatar && avatar.outfit || "guardian";
    var pad = 8;
    var off = createCanvas(34, 38);
    original.drawPlayer.call(this, off.ctx, pad, pad, dir, moving, running, time, avatar);
    paintMasked(off.ctx, off.canvas.width, off.canvas.height, npcRects[hash("player:" + outfit) % npcRects.length], .66);
    ctx.drawImage(off.canvas, Math.round(x - pad), Math.round(y - pad));
  };

  L.Asset.drawRemotePlayer = function (ctx, remote, x, y, time) {
    if (!ready()) {
      original.drawRemotePlayer.call(this, ctx, remote, x, y, time);
      return;
    }
    var pad = 8;
    var off = createCanvas(92, 58);
    original.drawRemotePlayer.call(this, off.ctx, remote, pad + 30, pad + 24, time);
    paintMasked(off.ctx, off.canvas.width, off.canvas.height, npcRects[hash(remote && remote.name || "remote") % npcRects.length], .54);
    ctx.drawImage(off.canvas, Math.round(x - pad - 30), Math.round(y - pad - 24));
  };

  L.Asset.drawNpc = function (ctx, npc, x, y, time) {
    if (!ready()) {
      original.drawNpc.call(this, ctx, npc, x, y, time);
      return;
    }
    var sprite = npc && (npc.sprite || npc.type) || "npc";
    var pad = 8;
    var off = createCanvas(36, 40);
    original.drawNpc.call(this, off.ctx, npc, pad, pad, time);
    paintMasked(off.ctx, off.canvas.width, off.canvas.height, npcRects[hash(sprite) % npcRects.length], .64);
    ctx.drawImage(off.canvas, Math.round(x - pad), Math.round(y - pad));
  };

  L.Asset.drawCreature = function (ctx, creatureOrBase, x, y, scale, flip, time) {
    if (!ready()) {
      original.drawCreature.call(this, ctx, creatureOrBase, x, y, scale, flip, time);
      return;
    }
    var safeScale = Math.max(.35, scale || 1);
    var pad = Math.ceil(12 * safeScale);
    var w = Math.ceil(42 * safeScale + pad * 2);
    var h = Math.ceil(42 * safeScale + pad * 2);
    var off = createCanvas(w, h);
    original.drawCreature.call(this, off.ctx, creatureOrBase, pad, pad, safeScale, flip, time);
    paintMasked(off.ctx, w, h, creatureRect(creatureOrBase), creatureOrBase && creatureOrBase.shiny ? .74 : .62);
    if (creatureOrBase && creatureOrBase.primeActive) {
      off.ctx.save();
      off.ctx.globalCompositeOperation = "lighter";
      off.ctx.globalAlpha = .25;
      off.ctx.fillStyle = creatureOrBase.primeAura || "#f2b94b";
      off.ctx.fillRect(0, 0, w, h);
      off.ctx.restore();
    }
    ctx.drawImage(off.canvas, Math.round(x - pad), Math.round(y - pad));
  };
})();
