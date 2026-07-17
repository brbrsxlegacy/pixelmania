(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};

  function layer(w, h, value) {
    return Array.from({ length: w * h }, function () { return value; });
  }

  function idx(map, x, y) {
    return y * map.w + x;
  }

  function inBounds(map, x, y) {
    return x >= 0 && y >= 0 && x < map.w && y < map.h;
  }

  function setRect(map, layerName, x, y, w, h, value) {
    for (var yy = y; yy < y + h; yy += 1) {
      for (var xx = x; xx < x + w; xx += 1) {
        if (inBounds(map, xx, yy)) map[layerName][idx(map, xx, yy)] = value;
      }
    }
  }

  function makeMap(id, name, w, h, ground) {
    var map = {
      id: id, name: name, w: w, h: h,
      ground: layer(w, h, ground),
      decoration: layer(w, h, null),
      collision: layer(w, h, 0),
      encounter: layer(w, h, 0),
      foreground: layer(w, h, null),
      exits: [],
      interactions: [],
      items: [],
      encounters: []
    };
    setRect(map, "collision", 0, 0, w, 1, 1);
    setRect(map, "collision", 0, h - 1, w, 1, 1);
    setRect(map, "collision", 0, 0, 1, h, 1);
    setRect(map, "collision", w - 1, 0, 1, h, 1);
    return map;
  }

  function put(map, x, y, code, blockW, blockH) {
    if (!inBounds(map, x, y)) return;
    map.decoration[idx(map, x, y)] = code;
    if (blockW && blockH) setRect(map, "collision", x, y, blockW, blockH, 1);
  }

  function trees(map, points) {
    points.forEach(function (p) { put(map, p[0], p[1], p[2] || "tree", 2, 2); });
  }

  function borderTrees(map, gapFn) {
    for (var x = 2; x < map.w - 3; x += 3) {
      if (!gapFn || !gapFn(x, 2)) put(map, x, 1, "tree", 2, 2);
      if (!gapFn || !gapFn(x, map.h - 4)) put(map, x, map.h - 4, "tree", 2, 2);
    }
    for (var y = 4; y < map.h - 5; y += 3) {
      if (!gapFn || !gapFn(2, y)) put(map, 1, y, "tree", 2, 2);
      if (!gapFn || !gapFn(map.w - 4, y)) put(map, map.w - 4, y, "tree", 2, 2);
    }
  }

  function scatter(map, code, count, area) {
    for (var i = 0; i < count; i += 1) {
      var x = area.x + Math.floor(Math.random() * area.w);
      var y = area.y + Math.floor(Math.random() * area.h);
      if (!map.collision[idx(map, x, y)]) map.decoration[idx(map, x, y)] = code;
    }
  }

  function makeVillage() {
    var m = makeMap("isikpinar", "Işıkpınar Köyü", 58, 42, "grass");
    setRect(m, "ground", 5, 18, 49, 4, "road");
    setRect(m, "ground", 26, 8, 4, 29, "road");
    setRect(m, "ground", 18, 26, 14, 5, "plaza");
    setRect(m, "ground", 45, 30, 7, 8, "water");
    setRect(m, "collision", 45, 30, 7, 8, 1);
    setRect(m, "ground", 28, 21, 7, 2, "bridge");
    setRect(m, "collision", 28, 21, 7, 2, 0);
    put(m, 21, 10, "lab", 8, 6);
    put(m, 9, 13, "houseBlue", 6, 5);
    put(m, 36, 14, "houseRed", 6, 5);
    put(m, 15, 27, "healingStation", 4, 3);
    put(m, 33, 27, "shop", 5, 4);
    put(m, 20, 19, "sign", 1, 1);
    put(m, 42, 24, "well", 2, 2);
    trees(m, [[5, 6], [9, 7], [14, 5], [39, 7], [45, 8], [50, 12], [6, 31], [10, 34], [40, 34], [53, 26]]);
    borderTrees(m, function (x, y) { return x > 50 && y > 12 && y < 26; });
    scatter(m, "flowerPink", 26, { x: 5, y: 22, w: 48, h: 15 });
    scatter(m, "flowerYellow", 20, { x: 5, y: 5, w: 48, h: 12 });
    m.interactions.push(
      { x: 24, y: 16, type: "lab", text: "Liora'nın laboratuvarı. İçeride başlangıç yoldaşları bekliyor." },
      { x: 20, y: 19, type: "sign", text: "Işıkpınar Köyü - Kristal ışığın sıcak kaldığı yer." },
      { x: 16, y: 30, type: "heal", text: "Şifa İstasyonu" },
      { x: 35, y: 30, type: "shop", text: "Kadir'in Dükkanı" },
      { x: 42, y: 24, type: "well", text: "Kuyunun kristal yuvası boş görünüyor." }
    );
    m.exits.push({ x: 56, y: 18, w: 2, h: 4, to: "yesilova", spawnX: 3, spawnY: 20 });
    m.items.push({ id: "villagePotion", x: 47, y: 28, itemId: "kucukIksir", qty: 1, hidden: true });
    m.encounters = [{ id: "cimsirik", min: 2, max: 4, weight: 6 }, { id: "minsu", min: 2, max: 3, weight: 2 }];
    return m;
  }

  function makeRoad() {
    var m = makeMap("yesilova", "Yeşilova Yolu", 66, 40, "meadow");
    setRect(m, "ground", 0, 18, 66, 5, "road");
    setRect(m, "ground", 34, 20, 5, 16, "road");
    setRect(m, "ground", 47, 8, 4, 13, "road");
    setRect(m, "ground", 26, 7, 14, 7, "tallGrass");
    setRect(m, "encounter", 26, 7, 14, 7, 1);
    setRect(m, "ground", 9, 25, 16, 8, "tallGrass");
    setRect(m, "encounter", 9, 25, 16, 8, 1);
    setRect(m, "ground", 44, 24, 13, 8, "tallGrass");
    setRect(m, "encounter", 44, 24, 13, 8, 1);
    setRect(m, "ground", 39, 0, 6, 18, "water");
    setRect(m, "collision", 39, 0, 6, 18, 1);
    setRect(m, "ground", 39, 18, 6, 5, "bridge");
    setRect(m, "collision", 39, 18, 6, 5, 0);
    trees(m, [[7, 6], [12, 8], [19, 10], [56, 6], [59, 9], [4, 30], [28, 30], [58, 29]]);
    borderTrees(m, function (x, y) { return (x < 5 && y > 16 && y < 25) || (x > 60 && y > 15 && y < 25) || (x > 31 && x < 41 && y > 34); });
    scatter(m, "flowerYellow", 28, { x: 5, y: 5, w: 55, h: 29 });
    put(m, 30, 16, "sign", 1, 1);
    m.interactions.push({ x: 30, y: 16, type: "sign", text: "Uzun otlar yaratıkların saklanma yeridir. Ekibini iyileştirmeyi unutma." });
    m.items.push({ id: "lostCrystal", x: 14, y: 31, itemId: "parlakKristal", qty: 1, questObjective: "findCrystal" });
    m.items.push({ id: "roadSphere", x: 53, y: 12, itemId: "lumaKuresi", qty: 2, hidden: true });
    m.exits.push(
      { x: 0, y: 18, w: 2, h: 5, to: "isikpinar", spawnX: 54, spawnY: 20 },
      { x: 64, y: 18, w: 2, h: 5, to: "fisilti", spawnX: 3, spawnY: 22 },
      { x: 34, y: 36, w: 5, h: 3, to: "kristalGol", spawnX: 31, spawnY: 4 }
    );
    m.encounters = [
      { id: "cimsirik", min: 3, max: 6, weight: 7 },
      { id: "minsu", min: 3, max: 5, weight: 4 },
      { id: "ruzgocuk", min: 4, max: 6, weight: 3 },
      { id: "voltik", min: 5, max: 7, weight: 1 }
    ];
    return m;
  }

  function makeForest() {
    var m = makeMap("fisilti", "Fısıltı Ormanı", 64, 44, "forest");
    setRect(m, "ground", 0, 20, 64, 4, "leafRoad");
    setRect(m, "ground", 16, 20, 4, 18, "leafRoad");
    setRect(m, "ground", 40, 8, 4, 16, "leafRoad");
    setRect(m, "ground", 8, 9, 16, 8, "tallGrass");
    setRect(m, "encounter", 8, 9, 16, 8, 1);
    setRect(m, "ground", 30, 25, 21, 10, "tallGrass");
    setRect(m, "encounter", 30, 25, 21, 10, 1);
    setRect(m, "ground", 48, 11, 9, 8, "tallGrass");
    setRect(m, "encounter", 48, 11, 9, 8, 1);
    for (var i = 0; i < 62; i += 1) {
      var x = 3 + (i * 7) % 56;
      var y = 3 + (i * 11) % 36;
      if (m.ground[idx(m, x, y)] !== "leafRoad" && Math.random() > .22) put(m, x, y, i % 3 ? "tree" : "pine", 2, 2);
    }
    borderTrees(m, function (x, y) { return (x < 4 && y > 18 && y < 26) || (x > 58 && y > 18 && y < 26); });
    put(m, 28, 18, "log", 2, 1);
    put(m, 52, 8, "sign", 1, 1);
    scatter(m, "mushroom", 24, { x: 5, y: 5, w: 52, h: 33 });
    m.interactions.push({ x: 52, y: 8, type: "sign", text: "Fısıltı Ormanı: Rüzgar kesilirse yapraklara kulak ver." });
    m.items.push({ id: "forestKeyCache", x: 46, y: 31, itemId: "gucluLumaKuresi", qty: 1, hidden: true });
    m.exits.push(
      { x: 0, y: 20, w: 2, h: 4, to: "yesilova", spawnX: 62, spawnY: 20 },
      { x: 61, y: 20, w: 3, h: 4, to: "kristalGol", spawnX: 4, spawnY: 18 }
    );
    m.encounters = [
      { id: "cimsirik", min: 5, max: 8, weight: 5 },
      { id: "ruzgocuk", min: 5, max: 8, weight: 4 },
      { id: "agackulak", min: 7, max: 9, weight: 2 },
      { id: "golgemir", min: 8, max: 10, weight: 1 },
      { id: "parilti", min: 8, max: 10, weight: 1 }
    ];
    return m;
  }

  function makeLake() {
    var m = makeMap("kristalGol", "Kristal Göl", 62, 42, "sandGrass");
    setRect(m, "ground", 14, 9, 29, 20, "water");
    setRect(m, "collision", 14, 9, 29, 20, 1);
    setRect(m, "ground", 27, 0, 5, 42, "road");
    setRect(m, "ground", 27, 15, 5, 7, "bridge");
    setRect(m, "collision", 27, 15, 5, 7, 0);
    setRect(m, "ground", 45, 7, 12, 9, "tallGrass");
    setRect(m, "encounter", 45, 7, 12, 9, 1);
    setRect(m, "ground", 5, 25, 12, 8, "tallGrass");
    setRect(m, "encounter", 5, 25, 12, 8, 1);
    put(m, 19, 28, "dock", 5, 1);
    setRect(m, "collision", 19, 28, 5, 1, 0);
    trees(m, [[4, 7], [8, 9], [50, 26], [53, 29], [7, 35], [44, 34]]);
    borderTrees(m, function (x, y) { return (x > 25 && x < 34 && (y < 5 || y > 36)) || (x < 5 && y > 15 && y < 22); });
    scatter(m, "flowerPink", 20, { x: 4, y: 5, w: 52, h: 32 });
    put(m, 48, 20, "caveMouth", 4, 3);
    m.interactions.push({ x: 48, y: 23, type: "cave", text: "Eski Taş Mağarası'nın serin ağzı." });
    m.items.push({ id: "lakeCrystalSphere", x: 50, y: 12, itemId: "kristalLumaKuresi", qty: 1, hidden: true });
    m.exits.push(
      { x: 0, y: 16, w: 2, h: 6, to: "fisilti", spawnX: 59, spawnY: 22 },
      { x: 27, y: 0, w: 5, h: 2, to: "yesilova", spawnX: 36, spawnY: 34 },
      { x: 48, y: 22, w: 4, h: 3, to: "magara", spawnX: 6, spawnY: 20 }
    );
    m.encounters = [
      { id: "minsu", min: 7, max: 10, weight: 4 },
      { id: "nilperi", min: 8, max: 11, weight: 3 },
      { id: "voltik", min: 8, max: 10, weight: 2 },
      { id: "parilti", min: 9, max: 11, weight: 1 }
    ];
    return m;
  }

  function makeCave() {
    var m = makeMap("magara", "Eski Taş Mağarası", 58, 40, "cave");
    setRect(m, "ground", 0, 0, 58, 40, "cave");
    setRect(m, "collision", 0, 0, 58, 40, 1);
    setRect(m, "collision", 4, 15, 48, 16, 0);
    setRect(m, "collision", 8, 8, 18, 8, 0);
    setRect(m, "collision", 31, 8, 18, 10, 0);
    setRect(m, "collision", 18, 28, 30, 8, 0);
    setRect(m, "ground", 4, 15, 48, 16, "caveFloor");
    setRect(m, "ground", 8, 8, 18, 8, "caveFloor");
    setRect(m, "ground", 31, 8, 18, 10, "caveFloor");
    setRect(m, "ground", 18, 28, 30, 8, "caveFloor");
    setRect(m, "ground", 20, 19, 15, 5, "tallGrass");
    setRect(m, "encounter", 20, 19, 15, 5, 1);
    setRect(m, "ground", 36, 29, 10, 5, "tallGrass");
    setRect(m, "encounter", 36, 29, 10, 5, 1);
    for (var y = 2; y < m.h - 2; y += 4) {
      for (var x = 2; x < m.w - 2; x += 5) {
        if (m.collision[idx(m, x, y)]) put(m, x, y, "caveWall", 1, 1);
      }
    }
    put(m, 22, 11, "crystalBlue", 1, 1);
    put(m, 42, 12, "crystalPink", 1, 1);
    put(m, 29, 30, "crystalBlue", 1, 1);
    put(m, 46, 32, "chest", 1, 1);
    m.interactions.push({ x: 46, y: 32, type: "itemChest", itemId: "magaraFeneri", qty: 1, objective: "findLantern", text: "Sandığın içinde Mağara Feneri var." });
    m.items.push({ id: "cavePotion", x: 12, y: 11, itemId: "tamIksir", qty: 1 });
    m.exits.push({ x: 4, y: 18, w: 2, h: 5, to: "kristalGol", spawnX: 49, spawnY: 24 });
    m.encounters = [
      { id: "tasburun", min: 9, max: 12, weight: 5 },
      { id: "golgemir", min: 9, max: 12, weight: 3 },
      { id: "kristalik", min: 10, max: 13, weight: 2 },
      { id: "lumeru", min: 12, max: 14, weight: 1 }
    ];
    return m;
  }

  window.LUMA_DATA.maps = {
    isikpinar: makeVillage(),
    yesilova: makeRoad(),
    fisilti: makeForest(),
    kristalGol: makeLake(),
    magara: makeCave()
  };
})();
