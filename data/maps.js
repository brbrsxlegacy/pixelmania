(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  var extraMaps = {};

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

  function makeInterior(id, name, floor, exit) {
    var m = makeMap(id, name, 18, 12, floor);
    setRect(m, "ground", 0, 0, 18, 2, "roomWall");
    setRect(m, "collision", 0, 0, 18, 2, 1);
    setRect(m, "ground", 7, 10, 4, 2, "rug");
    setRect(m, "collision", 8, 11, 2, 1, 0);
    m.exits.push({ x: 8, y: 11, w: 2, h: 1, to: exit.mapId || "isikpinar", spawnX: exit.x, spawnY: exit.y });
    return m;
  }

  function makeLabInterior() {
    var m = makeInterior("labInterior", "Liora Laboratuvarı", "labFloor", { x: 25, y: 17 });
    put(m, 3, 3, "bookshelf", 2, 2);
    put(m, 12, 3, "bookshelf", 2, 2);
    put(m, 7, 3, "labDesk", 4, 2);
    put(m, 4, 7, "table", 2, 2);
    put(m, 12, 7, "crystalBlue", 1, 1);
    m.interactions.push({ x: 8, y: 5, type: "lab", text: "Üç yoldaş ışık masasının üzerinde bekliyor." });
    return m;
  }

  function makeHouseBlueInterior() {
    var m = makeInterior("houseBlueInterior", "Ada'nın Evi", "woodFloor", { x: 12, y: 19 });
    put(m, 3, 3, "bedBlue", 2, 2);
    put(m, 11, 3, "bookshelf", 2, 2);
    put(m, 7, 6, "table", 2, 2);
    m.interactions.push({ x: 7, y: 6, type: "note", text: "Masada çocuk çizimleri var: Parıltı ve kocaman bir Luma Küresi." });
    return m;
  }

  function makeHouseRedInterior() {
    var m = makeInterior("houseRedInterior", "Belgin'in Evi", "woodFloor", { x: 39, y: 20 });
    put(m, 3, 3, "bedRed", 2, 2);
    put(m, 11, 3, "bookshelf", 2, 2);
    put(m, 7, 6, "table", 2, 2);
    m.interactions.push({ x: 11, y: 3, type: "note", text: "Raflarda köy kristalleriyle ilgili eski kayıtlar duruyor." });
    return m;
  }

  function makeClinicInterior() {
    var m = makeInterior("clinicInterior", "Işıkpınar Reviri", "clinicFloor", { x: 17, y: 31 });
    put(m, 3, 4, "healingBed", 3, 2);
    put(m, 11, 4, "healingBed", 3, 2);
    put(m, 7, 3, "healingCore", 3, 2);
    m.interactions.push({ x: 8, y: 5, type: "heal", text: "Şifa çekirdeği ekibini yeniler." });
    return m;
  }

  function makeShopInterior() {
    var m = makeInterior("shopInterior", "Kadir'in Dükkanı", "shopFloor", { x: 35, y: 31 });
    put(m, 4, 3, "shelfGoods", 2, 2);
    put(m, 12, 3, "shelfGoods", 2, 2);
    put(m, 6, 6, "shopCounter", 6, 2);
    m.interactions.push({ x: 9, y: 7, type: "shop", text: "Dükkan tezgahı düzenli ve dolu." });
    return m;
  }

  function makePlayerHomeInterior(id, name, exit) {
    var m = makeInterior(id, name, "woodFloor", exit);
    put(m, 3, 3, "bedBlue", 2, 2);
    put(m, 11, 3, "bookshelf", 2, 2);
    put(m, 7, 6, "table", 2, 2);
    put(m, 13, 7, "crystalBlue", 1, 1);
    m.interactions.push(
      { x: 4, y: 5, type: "homeBed", text: "Kendi yatağında dinleniyorsun." },
      { x: 8, y: 8, type: "homeDecor", text: "Ev dekorlarını düzenle." },
      { x: 13, y: 8, type: "note", text: "Küçük Luma yuvası evin sıcak noktasına kurulmuş." }
    );
    return m;
  }

  var buildingLabels = {
    lab: "Araştırma Salonu",
    cityTower: "Şehir Kulesi",
    apartment: "Apartman Lobisi",
    styleShop: "Stil Dükkanı",
    realEstate: "Emlak Ofisi",
    shop: "Pazar Dükkanı",
    mayorHall: "Belediye Binası",
    station: "İstasyon Ofisi",
    factory: "Atölye Holü",
    arena: "Arena Holü"
  };

  function makeBuildingInterior(id, name, exit, code) {
    var floor = code === "factory" || code === "station" || code === "arena" ? "cityStone" : (code === "lab" ? "labFloor" : "woodFloor");
    var m = makeInterior(id, name, floor, exit);
    put(m, 3, 3, code === "shop" || code === "styleShop" ? "shelfGoods" : "bookshelf", 2, 2);
    put(m, 11, 3, code === "factory" || code === "arena" ? "labDesk" : "bookshelf", code === "factory" || code === "arena" ? 4 : 2, 2);
    put(m, 7, 6, code === "realEstate" || code === "mayorHall" ? "table" : "shopCounter", code === "realEstate" || code === "mayorHall" ? 2 : 6, 2);
    if (code === "station") put(m, 5, 7, "crystalBlue", 1, 1);
    if (code === "arena") put(m, 13, 7, "crystalPink", 1, 1);
    m.interactions.push({ x: 8, y: 7, type: "buildingInfo", text: name + " açık. İçerideki panolar ve eşyalar yeni şehir sistemlerine bağlı." });
    return m;
  }

  function addBuildingDoor(map, spec, object, objectIndex) {
    if (!buildingLabels[object.code]) return;
    var doorX = object.x + Math.max(1, Math.floor((object.w || 2) / 2));
    var doorY = object.y + (object.h || 2);
    if (!inBounds(map, doorX, doorY)) return;
    var interiorId = spec.id + "_" + object.code + "_" + objectIndex + "Interior";
    var label = buildingLabels[object.code];
    extraMaps[interiorId] = makeBuildingInterior(interiorId, spec.name + " " + label, {
      mapId: spec.id,
      x: doorX,
      y: Math.min(map.h - 2, doorY + 1)
    }, object.code);
    map.interactions.push({ x: doorX, y: doorY, type: "door", to: interiorId, spawnX: 8, spawnY: 9, text: label + " içine giriyorsun." });
  }

  function makeVillage() {
    var m = makeMap("isikpinar", "Işıkpınar Köyü", 58, 42, "grass");
    setRect(m, "ground", 5, 18, 49, 4, "road");
    setRect(m, "ground", 26, 8, 4, 29, "road");
    setRect(m, "ground", 26, 0, 4, 8, "road");
    setRect(m, "collision", 26, 0, 4, 2, 0);
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
      { x: 24, y: 16, type: "door", to: "labInterior", spawnX: 8, spawnY: 9, text: "Liora'nın laboratuvarına giriyorsun." },
      { x: 12, y: 18, type: "door", to: "houseBlueInterior", spawnX: 8, spawnY: 9, text: "Mavi çatılı eve giriyorsun." },
      { x: 39, y: 19, type: "door", to: "houseRedInterior", spawnX: 8, spawnY: 9, text: "Kırmızı çatılı eve giriyorsun." },
      { x: 20, y: 19, type: "sign", text: "Işıkpınar Köyü - Kristal ışığın sıcak kaldığı yer." },
      { x: 16, y: 30, type: "door", to: "clinicInterior", spawnX: 8, spawnY: 9, text: "Işıkpınar Reviri'ne giriyorsun." },
      { x: 35, y: 30, type: "door", to: "shopInterior", spawnX: 8, spawnY: 9, text: "Kadir'in Dükkanı'na giriyorsun." },
      { x: 42, y: 24, type: "well", text: "Kuyunun kristal yuvası boş görünüyor." }
    );
    m.exits.push(
      { x: 56, y: 18, w: 2, h: 4, to: "yesilova", spawnX: 3, spawnY: 20 },
      { x: 26, y: 0, w: 4, h: 2, to: "lumaSehir", spawnX: 31, spawnY: 38 }
    );
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
      { id: "voltik", min: 5, max: 7, weight: 1 },
      { id: "barbo", min: 6, max: 8, weight: 1 }
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
      { id: "parilti", min: 8, max: 10, weight: 1 },
      { id: "crownlex", min: 8, max: 11, weight: 1 }
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
    setRect(m, "ground", 52, 18, 6, 5, "caveFloor");
    setRect(m, "collision", 56, 18, 2, 5, 0);
    m.exits.push(
      { x: 4, y: 18, w: 2, h: 5, to: "kristalGol", spawnX: 49, spawnY: 24 },
      { x: 56, y: 18, w: 2, h: 5, to: "kristalMaden", spawnX: 31, spawnY: 38 }
    );
    m.encounters = [
      { id: "tasburun", min: 9, max: 12, weight: 5 },
      { id: "golgemir", min: 9, max: 12, weight: 3 },
      { id: "kristalik", min: 10, max: 13, weight: 2 },
      { id: "lumeru", min: 12, max: 14, weight: 1 }
    ];
    return m;
  }

  function patternedScatter(map, code, count, area, salt) {
    for (var i = 0; i < count; i += 1) {
      var x = area.x + (i * 7 + salt * 3 + i * i) % area.w;
      var y = area.y + (i * 11 + salt * 5 + i * 2) % area.h;
      if (!map.collision[idx(map, x, y)]) map.decoration[idx(map, x, y)] = code;
    }
  }

  function addDirectionalExit(map, side, to, spawnX, spawnY, roadTile) {
    roadTile = roadTile || "road";
    var e = { to: to, spawnX: spawnX, spawnY: spawnY };
    if (side === "north") {
      Object.assign(e, { x: 28, y: 0, w: 8, h: 2 });
      setRect(map, "ground", 28, 0, 8, 5, roadTile);
      setRect(map, "collision", 28, 0, 8, 2, 0);
    }
    if (side === "south") {
      Object.assign(e, { x: 28, y: map.h - 2, w: 8, h: 2 });
      setRect(map, "ground", 28, map.h - 5, 8, 5, roadTile);
      setRect(map, "collision", 28, map.h - 2, 8, 2, 0);
    }
    if (side === "west") {
      Object.assign(e, { x: 0, y: 18, w: 2, h: 7 });
      setRect(map, "ground", 0, 18, 8, 7, roadTile);
      setRect(map, "collision", 0, 18, 2, 7, 0);
    }
    if (side === "east") {
      Object.assign(e, { x: map.w - 2, y: 18, w: 2, h: 7 });
      setRect(map, "ground", map.w - 8, 18, 8, 7, roadTile);
      setRect(map, "collision", map.w - 2, 18, 2, 7, 0);
    }
    map.exits.push(e);
  }

  function addLinks(map, links, roadTile) {
    (links || []).forEach(function (link) {
      addDirectionalExit(map, link.side, link.to, link.spawnX, link.spawnY, roadTile);
    });
  }

  function encounterPool(elements, min, max, salt) {
    var all = window.LUMA_DATA.creatures || {};
    var buckets = {};
    Object.keys(all).forEach(function (id) {
      var c = all[id];
      if (!c || c.starter) return;
      if (!buckets[c.element]) buckets[c.element] = [];
      buckets[c.element].push(id);
    });
    var pool = [];
    elements.forEach(function (element, elementIndex) {
      var ids = buckets[element] || ["cimsirik"];
      for (var i = 0; i < 3; i += 1) {
        var id = ids[(salt + i * 7 + elementIndex * 11) % ids.length];
        pool.push({ id: id, min: min + elementIndex, max: max + elementIndex, weight: Math.max(1, 6 - i - elementIndex) });
      }
    });
    return pool;
  }

  function makeCityDistrict(spec) {
    var m = makeMap(spec.id, spec.name, 64, 42, spec.ground || "cityStone");
    setRect(m, "ground", 0, 18, 64, 7, "asphalt");
    setRect(m, "ground", 28, 0, 8, 42, "asphalt");
    setRect(m, "ground", 22, 14, 20, 15, spec.centerTile || "cityStone");
    setRect(m, "collision", 0, 18, 64, 7, 0);
    setRect(m, "collision", 28, 0, 8, 42, 0);
    (spec.objects || []).forEach(function (o, objectIndex) {
      put(m, o.x, o.y, o.code, o.w, o.h);
      addBuildingDoor(m, spec, o, objectIndex);
    });
    for (var i = 0; i < 9; i += 1) {
      put(m, 8 + i * 6, i % 2 ? 29 : 10, "cityLamp", 1, 2);
    }
    patternedScatter(m, spec.flower || "flowerYellow", 18, { x: 5, y: 5, w: 54, h: 31 }, spec.salt || 1);
    addLinks(m, spec.links, "asphalt");
    m.interactions.push({ x: 31, y: 20, type: "sign", text: spec.name + " - Luma Şehri bağlantı noktası." });
    return m;
  }

  function makeWildRegion(spec) {
    var m = makeMap(spec.id, spec.name, 64, 42, spec.ground);
    setRect(m, "ground", 0, 18, 64, 6, spec.path || "road");
    setRect(m, "ground", 29, 0, 6, 42, spec.path || "road");
    setRect(m, "collision", 0, 18, 64, 6, 0);
    setRect(m, "collision", 29, 0, 6, 42, 0);
    setRect(m, "ground", 7, 7, 17, 9, "tallGrass");
    setRect(m, "encounter", 7, 7, 17, 9, 1);
    setRect(m, "ground", 39, 8, 16, 9, "tallGrass");
    setRect(m, "encounter", 39, 8, 16, 9, 1);
    setRect(m, "ground", 12, 28, 38, 8, "tallGrass");
    setRect(m, "encounter", 12, 28, 38, 8, 1);
    if (spec.water) {
      setRect(m, "ground", 43, 24, 14, 11, spec.water);
      setRect(m, "collision", 43, 24, 14, 11, 1);
    }
    if (spec.objects) spec.objects.forEach(function (o) { put(m, o.x, o.y, o.code, o.w, o.h); });
    var borderCode = spec.border || (spec.ground === "snow" ? "iceRock" : (spec.ground === "desert" ? "palm" : (spec.ground === "cave" ? "rock" : "tree")));
    for (var bx = 2; bx < m.w - 3; bx += 4) {
      if (!(bx > 27 && bx < 37)) {
        put(m, bx, 1, borderCode, borderCode === "tree" || borderCode === "pine" ? 2 : 1, borderCode === "tree" || borderCode === "pine" ? 2 : 1);
        put(m, bx, m.h - 4, borderCode, borderCode === "tree" || borderCode === "pine" ? 2 : 1, borderCode === "tree" || borderCode === "pine" ? 2 : 1);
      }
    }
    for (var by = 4; by < m.h - 5; by += 4) {
      if (!(by > 16 && by < 26)) {
        put(m, 1, by, borderCode, borderCode === "tree" || borderCode === "pine" ? 2 : 1, borderCode === "tree" || borderCode === "pine" ? 2 : 1);
        put(m, m.w - 4, by, borderCode, borderCode === "tree" || borderCode === "pine" ? 2 : 1, borderCode === "tree" || borderCode === "pine" ? 2 : 1);
      }
    }
    patternedScatter(m, spec.scatter || "flowerPink", 28, { x: 4, y: 5, w: 56, h: 32 }, spec.salt || 2);
    addLinks(m, spec.links, spec.path || "road");
    m.encounters = encounterPool(spec.elements, spec.min, spec.max, spec.salt || 1);
    m.roamerCount = spec.roamerCount || 4;
    m.interactions.push({ x: 31, y: 20, type: "sign", text: spec.name + " bölgesinde görünen Luma'lara yaklaşınca A/E ile savaşabilirsin." });
    return m;
  }

  window.LUMA_DATA.maps = {
    isikpinar: makeVillage(),
    labInterior: makeLabInterior(),
    houseBlueInterior: makeHouseBlueInterior(),
    houseRedInterior: makeHouseRedInterior(),
    clinicInterior: makeClinicInterior(),
    shopInterior: makeShopInterior(),
    homeStudioInterior: makePlayerHomeInterior("homeStudioInterior", "Pazar Stüdyosu", { mapId: "pazarMeydani", x: 44, y: 12 }),
    homeGardenFlatInterior: makePlayerHomeInterior("homeGardenFlatInterior", "Bahçe Dairesi", { mapId: "belediyeBahcesi", x: 26, y: 12 }),
    homeHarborRoomInterior: makePlayerHomeInterior("homeHarborRoomInterior", "Liman Odası", { mapId: "liman", x: 42, y: 13 }),
    homeAcademyLoftInterior: makePlayerHomeInterior("homeAcademyLoftInterior", "Akademi Loftu", { mapId: "lumaAkademi", x: 47, y: 13 }),
    yesilova: makeRoad(),
    fisilti: makeForest(),
    kristalGol: makeLake(),
    magara: makeCave(),
    lumaSehir: makeCityDistrict({
      id: "lumaSehir", name: "Luma Şehri Merkez", centerTile: "plaza", salt: 3,
      objects: [
        { x: 6, y: 7, code: "cityTower", w: 4, h: 5 },
        { x: 45, y: 6, code: "apartment", w: 5, h: 5 },
        { x: 23, y: 15, code: "fountain", w: 3, h: 2 },
        { x: 39, y: 27, code: "guildBoard", w: 2, h: 2 },
        { x: 19, y: 28, code: "jobBoard", w: 2, h: 2 }
      ],
      links: [
        { side: "south", to: "isikpinar", spawnX: 28, spawnY: 2 },
        { side: "west", to: "pazarMeydani", spawnX: 58, spawnY: 20 },
        { side: "east", to: "lumaAkademi", spawnX: 4, spawnY: 20 },
        { side: "north", to: "belediyeBahcesi", spawnX: 31, spawnY: 38 }
      ]
    }),
    pazarMeydani: makeCityDistrict({
      id: "pazarMeydani", name: "Pazar Meydanı", centerTile: "marketTile", flower: "flowerPink", salt: 4,
      objects: [
        { x: 7, y: 7, code: "styleShop", w: 4, h: 4 },
        { x: 42, y: 7, code: "realEstate", w: 5, h: 4 },
        { x: 10, y: 28, code: "stall", w: 3, h: 3 },
        { x: 25, y: 28, code: "stall", w: 3, h: 3 },
        { x: 44, y: 28, code: "shop", w: 5, h: 4 }
      ],
      links: [
        { side: "east", to: "lumaSehir", spawnX: 5, spawnY: 20 },
        { side: "west", to: "liman", spawnX: 58, spawnY: 20 },
        { side: "north", to: "trenIstasyonu", spawnX: 31, spawnY: 38 },
        { side: "south", to: "sanayi", spawnX: 31, spawnY: 4 }
      ]
    }),
    belediyeBahcesi: makeCityDistrict({
      id: "belediyeBahcesi", name: "Belediye Bahçesi", centerTile: "gardenTile", salt: 5,
      objects: [
        { x: 22, y: 5, code: "mayorHall", w: 6, h: 5 },
        { x: 9, y: 26, code: "fountain", w: 3, h: 2 },
        { x: 48, y: 26, code: "guildBoard", w: 2, h: 2 }
      ],
      links: [
        { side: "south", to: "lumaSehir", spawnX: 31, spawnY: 4 },
        { side: "north", to: "gokKulesi", spawnX: 31, spawnY: 38 },
        { side: "west", to: "antikaHarabe", spawnX: 58, spawnY: 20 },
        { side: "east", to: "meteorTepesi", spawnX: 4, spawnY: 20 }
      ]
    }),
    lumaAkademi: makeCityDistrict({
      id: "lumaAkademi", name: "Luma Akademisi", centerTile: "labFloor", flower: "flowerYellow", salt: 6,
      objects: [
        { x: 7, y: 6, code: "lab", w: 7, h: 5 },
        { x: 44, y: 6, code: "cityTower", w: 4, h: 5 },
        { x: 27, y: 28, code: "guildBoard", w: 2, h: 2 }
      ],
      links: [
        { side: "west", to: "lumaSehir", spawnX: 58, spawnY: 20 },
        { side: "east", to: "arenaMeydan", spawnX: 4, spawnY: 20 },
        { side: "north", to: "botanikBahce", spawnX: 31, spawnY: 38 },
        { side: "south", to: "sahilRotasi", spawnX: 31, spawnY: 4 }
      ]
    }),
    trenIstasyonu: makeCityDistrict({
      id: "trenIstasyonu", name: "Tren İstasyonu", centerTile: "cityStone", salt: 7,
      objects: [{ x: 18, y: 7, code: "station", w: 6, h: 4 }, { x: 45, y: 27, code: "jobBoard", w: 2, h: 2 }],
      links: [
        { side: "south", to: "pazarMeydani", spawnX: 31, spawnY: 4 },
        { side: "north", to: "kutupPatikasi", spawnX: 31, spawnY: 38 }
      ]
    }),
    liman: makeCityDistrict({
      id: "liman", name: "Kristal Liman", centerTile: "marketTile", salt: 8,
      objects: [{ x: 7, y: 7, code: "dock", w: 5, h: 1 }, { x: 39, y: 7, code: "station", w: 6, h: 4 }, { x: 26, y: 28, code: "jobBoard", w: 2, h: 2 }],
      links: [
        { side: "east", to: "pazarMeydani", spawnX: 5, spawnY: 20 },
        { side: "north", to: "sahilRotasi", spawnX: 31, spawnY: 38 }
      ]
    }),
    sanayi: makeCityDistrict({
      id: "sanayi", name: "Sanayi Bölgesi", ground: "asphalt", centerTile: "cityStone", salt: 9,
      objects: [{ x: 6, y: 6, code: "factory", w: 6, h: 4 }, { x: 42, y: 8, code: "factory", w: 6, h: 4 }, { x: 28, y: 28, code: "jobBoard", w: 2, h: 2 }],
      links: [
        { side: "north", to: "pazarMeydani", spawnX: 31, spawnY: 38 },
        { side: "east", to: "arenaMeydan", spawnX: 4, spawnY: 20 }
      ]
    }),
    arenaMeydan: makeCityDistrict({
      id: "arenaMeydan", name: "Arena Meydanı", centerTile: "plaza", salt: 10,
      objects: [{ x: 19, y: 6, code: "arena", w: 6, h: 5 }, { x: 45, y: 28, code: "guildBoard", w: 2, h: 2 }],
      links: [
        { side: "west", to: "lumaAkademi", spawnX: 58, spawnY: 20 },
        { side: "south", to: "sanayi", spawnX: 58, spawnY: 20 }
      ]
    }),
    botanikBahce: makeWildRegion({
      id: "botanikBahce", name: "Botanik Bahçe", ground: "gardenTile", path: "leafRoad", elements: ["Yaprak", "Işık"], min: 10, max: 14, salt: 11,
      objects: [{ x: 46, y: 26, code: "fountain", w: 3, h: 2 }],
      links: [{ side: "south", to: "lumaAkademi", spawnX: 31, spawnY: 4 }, { side: "east", to: "rengarenkCayir", spawnX: 4, spawnY: 20 }]
    }),
    rengarenkCayir: makeWildRegion({
      id: "rengarenkCayir", name: "Rengarenk Çayır", ground: "meadow", path: "road", elements: ["Yaprak", "Rüzgar", "Işık"], min: 11, max: 15, salt: 12,
      links: [{ side: "west", to: "botanikBahce", spawnX: 58, spawnY: 20 }, { side: "north", to: "geceKorusu", spawnX: 31, spawnY: 38 }]
    }),
    geceKorusu: makeWildRegion({
      id: "geceKorusu", name: "Gece Korusu", ground: "forest", path: "leafRoad", elements: ["Gölge", "Yaprak", "Rüzgar"], min: 13, max: 17, salt: 13,
      links: [{ side: "south", to: "rengarenkCayir", spawnX: 31, spawnY: 4 }, { side: "east", to: "sisBatakligi", spawnX: 4, spawnY: 20 }]
    }),
    sisBatakligi: makeWildRegion({
      id: "sisBatakligi", name: "Sis Bataklığı", ground: "swamp", path: "leafRoad", water: "swamp", elements: ["Gölge", "Su", "Yaprak"], min: 14, max: 19, salt: 14,
      links: [{ side: "west", to: "geceKorusu", spawnX: 58, spawnY: 20 }]
    }),
    meteorTepesi: makeWildRegion({
      id: "meteorTepesi", name: "Meteor Tepesi", ground: "caveFloor", path: "road", elements: ["Kaya", "Elektrik", "Işık"], min: 12, max: 16, salt: 15,
      objects: [{ x: 45, y: 27, code: "crystalBlue", w: 1, h: 1 }, { x: 18, y: 31, code: "crystalPink", w: 1, h: 1 }],
      links: [{ side: "west", to: "belediyeBahcesi", spawnX: 58, spawnY: 20 }, { side: "east", to: "lavKanyonu", spawnX: 4, spawnY: 20 }]
    }),
    lavKanyonu: makeWildRegion({
      id: "lavKanyonu", name: "Lav Kanyonu", ground: "cave", path: "caveFloor", water: "lava", scatter: "lavaRock", elements: ["Alev", "Kaya", "Elektrik"], min: 15, max: 20, salt: 16,
      objects: [{ x: 12, y: 8, code: "lavaRock", w: 1, h: 1 }, { x: 50, y: 13, code: "lavaRock", w: 1, h: 1 }],
      links: [{ side: "west", to: "meteorTepesi", spawnX: 58, spawnY: 20 }, { side: "south", to: "kumruCukuru", spawnX: 31, spawnY: 4 }, { side: "east", to: "kristalMaden", spawnX: 4, spawnY: 20 }]
    }),
    kumruCukuru: makeWildRegion({
      id: "kumruCukuru", name: "Kumru Çukuru", ground: "desert", path: "road", scatter: "rock", elements: ["Kaya", "Alev", "Rüzgar"], min: 14, max: 18, salt: 17,
      objects: [{ x: 8, y: 30, code: "palm", w: 1, h: 2 }, { x: 53, y: 10, code: "palm", w: 1, h: 2 }],
      links: [{ side: "north", to: "lavKanyonu", spawnX: 31, spawnY: 38 }]
    }),
    kristalMaden: makeWildRegion({
      id: "kristalMaden", name: "Kristal Maden", ground: "cave", path: "caveFloor", scatter: "crystalBlue", elements: ["Kaya", "Gölge", "Işık"], min: 17, max: 22, salt: 18,
      objects: [{ x: 47, y: 9, code: "caveMouth", w: 4, h: 3 }, { x: 17, y: 31, code: "crystalPink", w: 1, h: 1 }],
      links: [{ side: "west", to: "lavKanyonu", spawnX: 58, spawnY: 20 }, { side: "south", to: "magara", spawnX: 54, spawnY: 20 }]
    }),
    sahilRotasi: makeWildRegion({
      id: "sahilRotasi", name: "Sahil Rotası", ground: "sandGrass", path: "road", water: "water", scatter: "palm", elements: ["Su", "Rüzgar", "Işık"], min: 11, max: 16, salt: 19,
      links: [{ side: "north", to: "lumaAkademi", spawnX: 31, spawnY: 38 }, { side: "west", to: "liman", spawnX: 31, spawnY: 4 }, { side: "east", to: "buzulKiyi", spawnX: 4, spawnY: 20 }]
    }),
    buzulKiyi: makeWildRegion({
      id: "buzulKiyi", name: "Buzul Kıyısı", ground: "snow", path: "cityStone", water: "water", scatter: "iceRock", elements: ["Su", "Kaya", "Rüzgar"], min: 16, max: 21, salt: 20,
      objects: [{ x: 16, y: 10, code: "iceRock", w: 1, h: 1 }, { x: 51, y: 30, code: "iceRock", w: 1, h: 1 }],
      links: [{ side: "west", to: "sahilRotasi", spawnX: 58, spawnY: 20 }]
    }),
    gokKulesi: makeWildRegion({
      id: "gokKulesi", name: "Gök Kulesi", ground: "cityStone", path: "asphalt", scatter: "cityLamp", elements: ["Rüzgar", "Elektrik", "Işık"], min: 15, max: 21, salt: 21,
      objects: [{ x: 24, y: 6, code: "cityTower", w: 4, h: 5 }, { x: 41, y: 26, code: "crystalBlue", w: 1, h: 1 }],
      links: [{ side: "south", to: "belediyeBahcesi", spawnX: 31, spawnY: 4 }]
    }),
    antikaHarabe: makeWildRegion({
      id: "antikaHarabe", name: "Antika Harabe", ground: "ruinFloor", path: "road", scatter: "rock", elements: ["Gölge", "Kaya", "Işık"], min: 13, max: 18, salt: 22,
      objects: [{ x: 23, y: 7, code: "ruinGate", w: 4, h: 4 }, { x: 46, y: 28, code: "crystalPink", w: 1, h: 1 }],
      links: [{ side: "east", to: "belediyeBahcesi", spawnX: 5, spawnY: 20 }]
    }),
    kutupPatikasi: makeWildRegion({
      id: "kutupPatikasi", name: "Kutup Patikası", ground: "snow", path: "cityStone", scatter: "iceRock", elements: ["Su", "Rüzgar", "Elektrik"], min: 14, max: 20, salt: 23,
      links: [{ side: "south", to: "trenIstasyonu", spawnX: 31, spawnY: 4 }]
    })
  };
  Object.keys(extraMaps).forEach(function (id) {
    window.LUMA_DATA.maps[id] = extraMaps[id];
  });
})();
