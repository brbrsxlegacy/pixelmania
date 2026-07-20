(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};

  function layer(w, h, value) {
    var arr = [];
    for (var i = 0; i < w * h; i += 1) arr[i] = value;
    return arr;
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

  function makeMap(id, name, w, h, ground, biome) {
    var map = {
      id: id,
      name: name,
      w: w,
      h: h,
      region: "underground",
      biome: biome,
      ground: layer(w, h, ground || "ash"),
      decoration: layer(w, h, null),
      collision: layer(w, h, 0),
      encounter: layer(w, h, 0),
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

  function paint(map, x, y, w, h, tile) {
    setRect(map, "ground", x, y, w, h, tile);
  }

  function open(map, x, y, w, h, tile) {
    setRect(map, "collision", x, y, w, h, 0);
    if (tile) setRect(map, "ground", x, y, w, h, tile);
  }

  function block(map, x, y, w, h, tile) {
    if (tile) setRect(map, "ground", x, y, w, h, tile);
    setRect(map, "collision", x, y, w, h, 1);
  }

  function put(map, x, y, code, w, h) {
    if (!inBounds(map, x, y)) return;
    map.decoration[idx(map, x, y)] = code;
    if (w && h) setRect(map, "collision", x, y, w, h, 1);
  }

  function scatter(map, code, count, area, salt, solid) {
    for (var i = 0; i < count; i += 1) {
      var x = area.x + (i * 17 + salt * 11) % area.w;
      var y = area.y + (i * 13 + salt * 7) % area.h;
      if (!inBounds(map, x, y) || map.collision[idx(map, x, y)]) continue;
      put(map, x, y, code, solid ? 1 : 0, solid ? 1 : 0);
    }
  }

  function lava(map, x, y, w, h) {
    block(map, x, y, w, h, "lava");
  }

  function encounter(map, x, y, w, h, tile) {
    if (tile) paint(map, x, y, w, h, tile);
    setRect(map, "encounter", x, y, w, h, 1);
  }

  function exit(map, x, y, w, h, to, spawnX, spawnY, tile) {
    map.exits.push({ x: x, y: y, w: w, h: h, to: to, spawnX: spawnX, spawnY: spawnY });
    open(map, x, y, w, h, tile || "obsidian");
  }

  function sign(map, x, y, text) {
    put(map, x, y, "sign", 1, 1);
    map.interactions.push({ x: x, y: y, type: "sign", text: text });
  }

  function note(map, x, y, text) {
    map.interactions.push({ x: x, y: y, type: "note", text: text });
  }

  function chest(map, id, x, y, itemId, qty, objective, hidden) {
    map.items.push({ id: id, x: x, y: y, itemId: itemId, qty: qty || 1, questObjective: objective, hidden: !!hidden });
  }

  function borders(map, code, salt) {
    scatter(map, code || "caveWall", 20, { x: 2, y: 2, w: map.w - 4, h: 5 }, salt || 1, true);
    scatter(map, code || "caveWall", 20, { x: 2, y: map.h - 7, w: map.w - 4, h: 5 }, salt || 2, true);
    scatter(map, code || "caveWall", 18, { x: 2, y: 7, w: 6, h: map.h - 14 }, salt || 3, true);
    scatter(map, code || "caveWall", 18, { x: map.w - 8, y: 7, w: 6, h: map.h - 14 }, salt || 4, true);
  }

  function firePool(min, max) {
    return [
      { id: "iskurdu", min: min, max: max, weight: 7 },
      { id: "kulkerten", min: min, max: max + 1, weight: 6 },
      { id: "tutsukanat", min: min + 1, max: max + 1, weight: 4 },
      { id: "korsinek", min: min, max: max + 2, weight: 4 },
      { id: "magmantar", min: min + 2, max: max + 3, weight: 2 }
    ];
  }

  function makeRoyalGate() {
    var m = makeMap("kraliyetKapisi", "Kraliyet Kapisi", 64, 44, "royalStone", "royal");
    paint(m, 29, 0, 7, 44, "obsidian");
    paint(m, 0, 20, 64, 6, "obsidian");
    paint(m, 23, 27, 18, 11, "caveFloor");
    lava(m, 4, 8, 17, 3);
    lava(m, 43, 8, 17, 3);
    lava(m, 6, 35, 12, 3);
    lava(m, 46, 35, 12, 3);
    open(m, 29, 0, 7, 44, "obsidian");
    open(m, 0, 20, 64, 6, "obsidian");
    put(m, 28, 6, "ruinGate", 4, 4);
    put(m, 14, 29, "healingStation", 4, 3);
    put(m, 45, 28, "shop", 5, 4);
    put(m, 31, 18, "primeAltar", 2, 2);
    put(m, 24, 18, "royalBanner", 0, 0);
    put(m, 39, 18, "royalBanner", 0, 0);
    put(m, 22, 31, "campfire", 1, 1);
    put(m, 41, 31, "campfire", 1, 1);
    scatter(m, "basaltPillar", 14, { x: 6, y: 12, w: 52, h: 24 }, 2, true);
    encounter(m, 5, 12, 16, 6, "emberPatch");
    encounter(m, 43, 12, 15, 6, "ash");
    m.encounters = [{ id: "korcik", min: 3, max: 5, weight: 5 }, { id: "iskurdu", min: 4, max: 6, weight: 5 }, { id: "tasburun", min: 3, max: 5, weight: 2 }];
    chest(m, "kraliyet_haritasi", 32, 24, "kraliyetHaritasi", 1, "findRoyalMap");
    chest(m, "kapı_sikke", 51, 34, "antikSikke", 2, "collectRoyalRelic", true);
    sign(m, 33, 21, "Kraliyet Kapisi: Lav Denizi kuzeyde, Mantar Ormani batida, Obsidyen Carsisi doguda, Kul Bahcesi guneyde.");
    note(m, 31, 17, "Prime sunağı sıcak ama sessiz. Bag kurdugun Luma savasta kisa sureli Prime forma gecebilir.");
    m.interactions.push({ x: 15, y: 33, type: "heal" });
    m.interactions.push({ x: 48, y: 33, type: "shop" });
    exit(m, 29, 0, 6, 2, "lavDenizi", 31, 37, "obsidian");
    exit(m, 0, 20, 2, 5, "mantarOrmani", 56, 22, "obsidian");
    exit(m, 62, 20, 2, 5, "obsidyenCarsisi", 4, 22, "obsidian");
    exit(m, 29, 42, 6, 2, "kulBahcesi", 31, 4, "obsidian");
    return m;
  }

  function makeRoyalHome() {
    var m = makeMap("kraliyetEvi", "Kraliyet Evi", 18, 14, "woodFloor", "interior");
    setRect(m, "ground", 0, 0, 18, 3, "roomWall");
    setRect(m, "collision", 0, 0, 18, 3, 1);
    open(m, 8, 12, 2, 2, "woodFloor");
    put(m, 3, 5, "bedBlue", 2, 2);
    put(m, 12, 4, "bookshelf", 2, 2);
    put(m, 7, 6, "table", 2, 2);
    put(m, 6, 9, "rug", 0, 0);
    m.interactions.push({ x: 4, y: 7, type: "homeBed", text: "Kraliyet Evi'nin sicak yataginda dinleniyorsun." });
    m.interactions.push({ x: 12, y: 6, type: "homeDecor" });
    m.interactions.push({ x: 8, y: 12, type: "door", to: "kraliyetKapisi", spawnX: 16, spawnY: 33 });
    exit(m, 8, 12, 2, 2, "kraliyetKapisi", 16, 33, "woodFloor");
    return m;
  }

  function makeFungusForest() {
    var m = makeMap("mantarOrmani", "Fosfor Mantar Ormani", 60, 42, "fungusFloor", "fungus");
    paint(m, 0, 20, 60, 6, "caveFloor");
    paint(m, 27, 0, 7, 42, "caveFloor");
    paint(m, 9, 9, 14, 8, "swamp");
    paint(m, 38, 27, 15, 7, "swamp");
    block(m, 11, 11, 10, 4, "water");
    block(m, 41, 29, 10, 3, "water");
    open(m, 0, 20, 60, 6, "caveFloor");
    open(m, 27, 0, 7, 42, "caveFloor");
    scatter(m, "glowFungus", 38, { x: 4, y: 5, w: 52, h: 31 }, 5, false);
    scatter(m, "mushroom", 34, { x: 5, y: 6, w: 50, h: 30 }, 9, false);
    scatter(m, "basaltPillar", 12, { x: 7, y: 8, w: 45, h: 25 }, 11, true);
    encounter(m, 6, 7, 20, 9, "fungusFloor");
    encounter(m, 35, 26, 19, 9, "fungusFloor");
    encounter(m, 8, 29, 17, 6, "swamp");
    m.encounters = [
      { id: "magmantar", min: 9, max: 13, weight: 6 },
      { id: "korsinek", min: 8, max: 12, weight: 5 },
      { id: "cimsirik", min: 8, max: 12, weight: 4 },
      { id: "agackulak", min: 11, max: 14, weight: 2 }
    ];
    chest(m, "mantar_incisi", 17, 12, "mantarIncisi", 1, "collectRoyalRelic");
    chest(m, "mantar_kure", 45, 31, "gucluLumaKuresi", 1, null, true);
    sign(m, 28, 25, "Fosfor Mantar Ormani: Isik guzel, sporlar inatcidir.");
    exit(m, 58, 20, 2, 5, "kraliyetKapisi", 4, 22, "caveFloor");
    exit(m, 27, 0, 7, 2, "kristalNehir", 31, 37, "caveFloor");
    exit(m, 0, 20, 2, 5, "kemikKumlari", 56, 20, "caveFloor");
    return m;
  }

  function makeCrystalRiver() {
    var m = makeMap("kristalNehir", "Kristal Nehir", 62, 40, "crystalFloor", "crystal");
    block(m, 0, 17, 62, 6, "water");
    block(m, 19, 0, 5, 40, "water");
    paint(m, 27, 0, 8, 40, "cityStone");
    paint(m, 0, 19, 62, 3, "cityStone");
    open(m, 27, 0, 8, 40, "cityStone");
    open(m, 0, 19, 62, 3, "cityStone");
    scatter(m, "crystalBlue", 28, { x: 5, y: 5, w: 52, h: 30 }, 6, true);
    scatter(m, "crystalPink", 18, { x: 6, y: 6, w: 50, h: 29 }, 13, true);
    encounter(m, 5, 6, 12, 8, "crystalFloor");
    encounter(m, 39, 6, 15, 8, "crystalFloor");
    encounter(m, 38, 26, 17, 8, "crystalFloor");
    m.encounters = [
      { id: "kristalik", min: 12, max: 16, weight: 6 },
      { id: "nilperi", min: 12, max: 16, weight: 5 },
      { id: "parilti", min: 13, max: 17, weight: 3 },
      { id: "minsu", min: 11, max: 15, weight: 3 }
    ];
    chest(m, "kristal_yadigar", 49, 10, "kristalYadigar", 1, "collectRoyalRelic");
    chest(m, "kristal_sikke", 10, 31, "antikSikke", 3, "collectRoyalRelic", true);
    sign(m, 30, 23, "Kristal Nehir: Kuzeyde soguk, doguda carsı, guneyde mantar ormani.");
    exit(m, 27, 38, 8, 2, "mantarOrmani", 30, 3, "cityStone");
    exit(m, 60, 19, 2, 3, "obsidyenCarsisi", 4, 18, "cityStone");
    exit(m, 27, 0, 8, 2, "buzulMagara", 31, 36, "cityStone");
    return m;
  }

  function makeLavaSea() {
    var m = makeMap("lavDenizi", "Lav Denizi", 64, 42, "ash", "lava");
    lava(m, 3, 5, 22, 10);
    lava(m, 39, 4, 20, 11);
    lava(m, 5, 27, 54, 8);
    paint(m, 29, 0, 7, 42, "obsidian");
    paint(m, 0, 20, 64, 6, "obsidian");
    paint(m, 10, 31, 44, 3, "obsidian");
    open(m, 29, 0, 7, 42, "obsidian");
    open(m, 0, 20, 64, 6, "obsidian");
    open(m, 10, 31, 44, 3, "obsidian");
    scatter(m, "lavaRock", 32, { x: 5, y: 6, w: 54, h: 29 }, 14, true);
    scatter(m, "campfire", 8, { x: 9, y: 16, w: 47, h: 18 }, 4, false);
    encounter(m, 7, 16, 17, 8, "emberPatch");
    encounter(m, 40, 16, 17, 8, "emberPatch");
    encounter(m, 13, 34, 38, 5, "ash");
    m.encounters = firePool(10, 15);
    chest(m, "lav_obsidyen_define", 50, 11, "obsidyenDefine", 1, "collectRoyalRelic");
    chest(m, "lav_prime_kivilcim", 14, 33, "primeKivilcimi", 1, "collectRoyalRelic", true);
    sign(m, 31, 26, "Lav Denizi: Koyu obsidyen kopruler guvenli, parlak lav akintilari degil.");
    exit(m, 29, 40, 6, 2, "kraliyetKapisi", 32, 3, "obsidian");
    exit(m, 0, 20, 2, 5, "obsidyenCarsisi", 56, 22, "obsidian");
    exit(m, 29, 0, 6, 2, "primeOcagi", 50, 36, "obsidian");
    return m;
  }

  function makeObsidianBazaar() {
    var m = makeMap("obsidyenCarsisi", "Obsidyen Carsisi", 62, 40, "obsidian", "market");
    paint(m, 7, 8, 48, 24, "marketTile");
    paint(m, 0, 19, 62, 5, "royalStone");
    paint(m, 28, 0, 7, 40, "royalStone");
    open(m, 7, 8, 48, 24, "marketTile");
    open(m, 0, 19, 62, 5, "royalStone");
    open(m, 28, 0, 7, 40, "royalStone");
    put(m, 14, 27, "healingStation", 4, 3);
    put(m, 44, 26, "shop", 5, 4);
    put(m, 30, 20, "guildBoard", 1, 2);
    put(m, 9, 10, "stall", 3, 3);
    put(m, 48, 10, "stall", 3, 3);
    put(m, 12, 15, "royalBanner", 0, 0);
    put(m, 48, 15, "royalBanner", 0, 0);
    scatter(m, "basaltPillar", 12, { x: 8, y: 9, w: 46, h: 22 }, 7, true);
    encounter(m, 10, 32, 42, 5, "ash");
    m.encounters = [
      { id: "tasburun", min: 12, max: 16, weight: 5 },
      { id: "kulkerten", min: 13, max: 17, weight: 4 },
      { id: "magmerten", min: 15, max: 18, weight: 2 }
    ];
    chest(m, "carsi_muhur", 51, 11, "obsidyenMuhur", 1, "collectRoyalRelic");
    chest(m, "carsi_harita_odulu", 12, 12, "biyomPusulasi", 1, null);
    m.interactions.push({ x: 17, y: 31, type: "heal" });
    m.interactions.push({ x: 48, y: 31, type: "shop" });
    sign(m, 31, 23, "Obsidyen Carsisi: Pano, sifa, dukkan ve dort farkli cikis burada.");
    exit(m, 0, 19, 2, 5, "kraliyetKapisi", 59, 22, "royalStone");
    exit(m, 60, 19, 2, 5, "lavDenizi", 4, 22, "royalStone");
    exit(m, 28, 0, 7, 2, "primeOcagi", 31, 36, "royalStone");
    exit(m, 28, 38, 7, 2, "defineMahzeni", 31, 4, "royalStone");
    exit(m, 0, 16, 2, 3, "kristalNehir", 57, 20, "royalStone");
    return m;
  }

  function makeAshGarden() {
    var m = makeMap("kulBahcesi", "Kul Bahcesi", 60, 40, "sulfur", "ashGarden");
    paint(m, 27, 0, 7, 40, "ash");
    paint(m, 0, 18, 60, 7, "ash");
    paint(m, 8, 8, 16, 8, "emberPatch");
    paint(m, 37, 27, 15, 7, "emberPatch");
    open(m, 27, 0, 7, 40, "ash");
    open(m, 0, 18, 60, 7, "ash");
    scatter(m, "flowerYellow", 32, { x: 5, y: 7, w: 50, h: 28 }, 3, false);
    scatter(m, "glowFungus", 12, { x: 6, y: 8, w: 48, h: 26 }, 17, false);
    scatter(m, "basaltPillar", 14, { x: 6, y: 6, w: 48, h: 28 }, 19, true);
    encounter(m, 8, 8, 16, 8, "emberPatch");
    encounter(m, 37, 27, 15, 7, "emberPatch");
    encounter(m, 9, 27, 16, 7, "sulfur");
    m.encounters = [
      { id: "iskurdu", min: 11, max: 15, weight: 5 },
      { id: "magmantar", min: 12, max: 16, weight: 5 },
      { id: "agackulak", min: 13, max: 16, weight: 2 },
      { id: "korsinek", min: 11, max: 15, weight: 4 }
    ];
    chest(m, "kul_pusula", 17, 13, "biyomPusulasi", 1, null);
    chest(m, "kul_sikke", 46, 31, "antikSikke", 4, "collectRoyalRelic", true);
    sign(m, 30, 25, "Kul Bahcesi: Lavdan sonra gelen sessiz biyom.");
    exit(m, 27, 0, 7, 2, "kraliyetKapisi", 32, 39, "ash");
    exit(m, 58, 18, 2, 7, "kemikKumlari", 4, 20, "ash");
    return m;
  }

  function makeBoneSands() {
    var m = makeMap("kemikKumlari", "Kemik Kumlari", 60, 40, "boneSand", "bone");
    paint(m, 0, 18, 60, 6, "desert");
    paint(m, 27, 0, 7, 40, "desert");
    open(m, 0, 18, 60, 6, "desert");
    open(m, 27, 0, 7, 40, "desert");
    scatter(m, "bonePile", 30, { x: 5, y: 6, w: 50, h: 29 }, 21, true);
    scatter(m, "rock", 12, { x: 6, y: 8, w: 48, h: 26 }, 16, true);
    encounter(m, 6, 7, 16, 9, "boneSand");
    encounter(m, 38, 8, 16, 8, "boneSand");
    encounter(m, 10, 27, 42, 7, "desert");
    m.encounters = [
      { id: "tasburun", min: 14, max: 18, weight: 5 },
      { id: "golgemir", min: 15, max: 19, weight: 4 },
      { id: "volkobra", min: 17, max: 20, weight: 2 },
      { id: "kristalik", min: 14, max: 18, weight: 3 }
    ];
    chest(m, "kemik_anahtar", 43, 30, "kemikAnahtar", 1, "collectRoyalRelic");
    chest(m, "kemik_define", 13, 12, "obsidyenMuhur", 1, "collectRoyalRelic", true);
    sign(m, 29, 24, "Kemik Kumlari: Bati kul, kuzey mantar, dogu mahzen.");
    exit(m, 0, 18, 2, 6, "kulBahcesi", 55, 21, "desert");
    exit(m, 27, 0, 7, 2, "mantarOrmani", 4, 22, "desert");
    exit(m, 58, 18, 2, 6, "defineMahzeni", 4, 22, "desert");
    return m;
  }

  function makeFrostCave() {
    var m = makeMap("buzulMagara", "Soguk Derinlik", 62, 40, "snow", "frost");
    paint(m, 27, 0, 8, 40, "crystalFloor");
    paint(m, 0, 18, 62, 5, "crystalFloor");
    block(m, 7, 8, 18, 6, "water");
    block(m, 40, 27, 15, 5, "water");
    open(m, 27, 0, 8, 40, "crystalFloor");
    open(m, 0, 18, 62, 5, "crystalFloor");
    scatter(m, "iceRock", 34, { x: 5, y: 5, w: 52, h: 30 }, 24, true);
    scatter(m, "crystalBlue", 16, { x: 5, y: 5, w: 52, h: 30 }, 29, true);
    encounter(m, 7, 25, 18, 8, "snow");
    encounter(m, 39, 7, 17, 8, "snow");
    encounter(m, 38, 25, 16, 8, "crystalFloor");
    m.encounters = [
      { id: "nilperi", min: 16, max: 20, weight: 5 },
      { id: "kristalik", min: 17, max: 21, weight: 5 },
      { id: "parilti", min: 18, max: 21, weight: 3 },
      { id: "luma035", min: 18, max: 22, weight: 2 }
    ];
    chest(m, "buzul_yadigar", 48, 30, "kristalYadigar", 1, "collectRoyalRelic");
    chest(m, "buzul_iksir", 12, 11, "tamIksir", 1, null, true);
    sign(m, 31, 23, "Soguk Derinlik: Yanardagin icindeki buz damari.");
    exit(m, 27, 38, 8, 2, "kristalNehir", 31, 3, "crystalFloor");
    exit(m, 60, 18, 2, 5, "primeOcagi", 4, 20, "crystalFloor");
    return m;
  }

  function makePrimeForge() {
    var m = makeMap("primeOcagi", "Prime Ocagi", 64, 42, "obsidian", "prime");
    lava(m, 5, 5, 18, 9);
    lava(m, 41, 5, 18, 9);
    lava(m, 6, 29, 52, 7);
    paint(m, 29, 0, 7, 42, "royalStone");
    paint(m, 0, 18, 64, 6, "royalStone");
    paint(m, 11, 32, 42, 3, "royalStone");
    open(m, 29, 0, 7, 42, "royalStone");
    open(m, 0, 18, 64, 6, "royalStone");
    open(m, 11, 32, 42, 3, "royalStone");
    put(m, 29, 11, "primeAltar", 2, 2);
    put(m, 33, 11, "primeAltar", 2, 2);
    put(m, 31, 25, "primeAltar", 2, 2);
    scatter(m, "basaltPillar", 18, { x: 6, y: 6, w: 52, h: 29 }, 31, true);
    encounter(m, 8, 14, 16, 8, "emberPatch");
    encounter(m, 40, 14, 17, 8, "emberPatch");
    encounter(m, 13, 33, 38, 6, "ash");
    m.encounters = [
      { id: "lavakurt", min: 18, max: 23, weight: 5 },
      { id: "magmerten", min: 19, max: 24, weight: 4 },
      { id: "lavagon", min: 20, max: 25, weight: 3 },
      { id: "alevanka", min: 21, max: 25, weight: 2 },
      { id: "volkobra", min: 22, max: 26, weight: 2 }
    ];
    chest(m, "prime_kivilcimi", 31, 28, "primeKivilcimi", 1, "collectRoyalRelic");
    chest(m, "prime_kure", 50, 33, "kristalLumaKuresi", 2, null, true);
    sign(m, 31, 24, "Prime Ocagi: Bag gucu burada kizil hale gelir.");
    exit(m, 29, 40, 7, 2, "obsidyenCarsisi", 31, 3, "royalStone");
    exit(m, 62, 18, 2, 6, "lavDenizi", 31, 3, "royalStone");
    exit(m, 0, 18, 2, 6, "buzulMagara", 57, 20, "royalStone");
    exit(m, 29, 0, 7, 2, "tahtSalonu", 31, 36, "royalStone");
    return m;
  }

  function makeTreasureVault() {
    var m = makeMap("defineMahzeni", "Define Mahzeni", 62, 40, "ruinFloor", "treasure");
    paint(m, 0, 19, 62, 5, "royalStone");
    paint(m, 28, 0, 7, 40, "royalStone");
    open(m, 0, 19, 62, 5, "royalStone");
    open(m, 28, 0, 7, 40, "royalStone");
    put(m, 8, 8, "ruinGate", 4, 4);
    put(m, 48, 8, "ruinGate", 4, 4);
    put(m, 12, 28, "bookshelf", 2, 2);
    put(m, 46, 28, "bookshelf", 2, 2);
    scatter(m, "bonePile", 16, { x: 7, y: 8, w: 48, h: 24 }, 37, true);
    scatter(m, "crystalPink", 14, { x: 7, y: 8, w: 48, h: 24 }, 38, true);
    encounter(m, 7, 12, 16, 7, "ruinFloor");
    encounter(m, 39, 12, 16, 7, "ruinFloor");
    encounter(m, 10, 27, 42, 7, "boneSand");
    m.encounters = [
      { id: "golgemir", min: 18, max: 22, weight: 5 },
      { id: "kristalik", min: 18, max: 23, weight: 4 },
      { id: "volkobra", min: 20, max: 24, weight: 3 },
      { id: "parilti", min: 19, max: 23, weight: 2 }
    ];
    chest(m, "mahzen_tac_parca", 49, 10, "tahtTaci", 1, "collectRoyalRelic");
    chest(m, "mahzen_obsidyen", 12, 10, "obsidyenDefine", 2, "collectRoyalRelic");
    chest(m, "mahzen_gizli_sikke", 31, 32, "antikSikke", 5, "collectRoyalRelic", true);
    sign(m, 30, 24, "Define Mahzeni: Bati kemik, kuzey carsı, dogu taht salonu.");
    exit(m, 28, 0, 7, 2, "obsidyenCarsisi", 31, 36, "royalStone");
    exit(m, 0, 19, 2, 5, "kemikKumlari", 55, 21, "royalStone");
    exit(m, 60, 19, 2, 5, "tahtSalonu", 4, 24, "royalStone");
    return m;
  }

  function makeThroneRoom() {
    var m = makeMap("tahtSalonu", "Yeraltı Taht Salonu", 64, 42, "royalStone", "throne");
    lava(m, 5, 7, 18, 7);
    lava(m, 41, 7, 18, 7);
    lava(m, 8, 32, 48, 5);
    paint(m, 29, 0, 7, 42, "obsidian");
    paint(m, 0, 22, 64, 6, "obsidian");
    open(m, 29, 0, 7, 42, "obsidian");
    open(m, 0, 22, 64, 6, "obsidian");
    put(m, 28, 7, "ruinGate", 4, 4);
    put(m, 31, 12, "royalBanner", 0, 0);
    put(m, 24, 20, "primeAltar", 2, 2);
    put(m, 38, 20, "primeAltar", 2, 2);
    scatter(m, "basaltPillar", 18, { x: 7, y: 8, w: 50, h: 26 }, 43, true);
    encounter(m, 7, 15, 17, 7, "emberPatch");
    encounter(m, 40, 15, 17, 7, "emberPatch");
    encounter(m, 13, 30, 38, 6, "ash");
    m.encounters = [
      { id: "alevanka", min: 22, max: 27, weight: 4 },
      { id: "obsidikurt", min: 23, max: 28, weight: 4 },
      { id: "volkobra", min: 24, max: 29, weight: 3 },
      { id: "lavagon", min: 23, max: 28, weight: 3 }
    ];
    chest(m, "taht_taci", 32, 13, "tahtTaci", 1, "collectRoyalRelic");
    chest(m, "taht_son_define", 51, 34, "primeKivilcimi", 1, "collectRoyalRelic", true);
    sign(m, 31, 28, "Taht Salonu: Yeraltı Krallığı'nin son muhafizi burada bekler.");
    exit(m, 29, 40, 7, 2, "primeOcagi", 31, 3, "obsidian");
    exit(m, 0, 22, 2, 6, "defineMahzeni", 57, 21, "obsidian");
    return m;
  }

  window.LUMA_DATA.maps = {
    kraliyetKapisi: makeRoyalGate(),
    kraliyetEvi: makeRoyalHome(),
    lavDenizi: makeLavaSea(),
    mantarOrmani: makeFungusForest(),
    kristalNehir: makeCrystalRiver(),
    obsidyenCarsisi: makeObsidianBazaar(),
    kulBahcesi: makeAshGarden(),
    kemikKumlari: makeBoneSands(),
    buzulMagara: makeFrostCave(),
    primeOcagi: makePrimeForge(),
    defineMahzeni: makeTreasureVault(),
    tahtSalonu: makeThroneRoom()
  };
})();
