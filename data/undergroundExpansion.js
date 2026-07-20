(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  var creatures = window.LUMA_DATA.creatures = window.LUMA_DATA.creatures || {};
  var items = window.LUMA_DATA.items = window.LUMA_DATA.items || {};
  var quests = window.LUMA_DATA.quests = window.LUMA_DATA.quests || {};
  var maps = window.LUMA_DATA.maps = window.LUMA_DATA.maps || {};
  var npcs = window.LUMA_DATA.npcs = window.LUMA_DATA.npcs || {};

  Object.assign(items, {
    primeTasi: { id: "primeTasi", name: "Prime Tasi", category: "Özel", price: 0, sell: 0, protected: true, primeStone: true, description: "Kilitli bir Prime formunu kalici olarak uyandiran nadir tas." },
    haritaParcasi: { id: "haritaParcasi", name: "Harita Parçasi", category: "Görev", price: 0, sell: 0, protected: true, description: "Gizli define odasinin yerini gosteren parca." },
    mantarAnahtari: { id: "mantarAnahtari", name: "Fosfor Anahtari", category: "Görev", price: 0, sell: 0, protected: true, description: "Fosfor mantar bilmecesini cozenlere verilen yumusak isikli anahtar." },
    kristalMuhur: { id: "kristalMuhur", name: "Kristal Muhur", category: "Görev", price: 0, sell: 0, protected: true, description: "Kristal akintilarini sakinlestiren soguk muhur." },
    kralinGolgesi: { id: "kralinGolgesi", name: "Kralin Golgesi", category: "Define", price: 0, sell: 1600, description: "Gizli bossun ardinda kalan karanlik tac parcasi." }
  });

  function addCreature(id, name, element, rarity, hp, attack, defense, speed, abilities, body, colors, extra) {
    creatures[id] = Object.assign({
      id: id,
      name: name,
      element: element,
      rarity: rarity,
      captureDifficulty: rarity === "Çok Nadir" ? 78 : (rarity === "Nadir" ? 62 : 45),
      baseStats: { hp: hp, attack: attack, defense: defense, speed: speed },
      abilities: abilities,
      description: name + ", Yeraltı Krallığı'nin " + element + " isigini tasiyan yeni bir Luma turudur.",
      evolution: null,
      sprite: { body: body, colors: colors, variant: hp % 13, mark: "gem" }
    }, extra || {});
  }

  addCreature("lavcik", "Lavcik", "Alev", "Yaygın", 37, 14, 9, 15, ["kozSicramasi", "alevPencesi", "korPerdesi", "lavAkisi"], "lizard", ["#4b201d", "#ff6b34", "#ffd27c"], { evolution: { level: 20, into: "lavsirt" } });
  addCreature("lavsirt", "Lavsirt", "Alev", "Nadir", 55, 21, 16, 18, ["magmaYumrugu", "lavAkisi", "korFirtinasi", "volkanKukremesi"], "wolf", ["#2a2022", "#b94b31", "#ffcc67"], { prime: { name: "Prime Lavsirt", minLevel: 20, unlockKey: "primeWarden", boosts: { attack: 1.33, defense: 1.18, speed: 1.18 }, aura: "#ff8b45" } });
  addCreature("korbaykus", "Korbaykus", "Alev", "Nadir", 44, 17, 12, 23, ["kozSicramasi", "hizKanadi", "korFirtinasi", "firinNefesi"], "owl", ["#3b2430", "#f06b34", "#ffe0a3"], { prime: { name: "Prime Korbaykus", minLevel: 22, unlockKey: "primeWarden", boosts: { attack: 1.25, speed: 1.38, defense: 1.1 }, aura: "#ffd067" } });
  addCreature("korboynuz", "Korboynuz", "Alev", "Çok Nadir", 68, 25, 20, 15, ["magmaYumrugu", "lavAkisi", "korFirtinasi", "volkanKukremesi"], "rhino", ["#31272d", "#a83b2d", "#f2b94b"], { prime: { name: "Prime Korboynuz", minLevel: 28, unlockKey: "crownGuard", boosts: { attack: 1.38, defense: 1.3, speed: 1.04 }, aura: "#ffdd67" } });
  addCreature("spormin", "Spormin", "Yaprak", "Yaygın", 38, 10, 14, 10, ["yaprakDarbesi", "kokKapani", "camKalkan", "polenUykusu"], "mushroom", ["#274331", "#8ad46f", "#f08bb0"], { evolution: { level: 19, into: "sporkral" } });
  addCreature("sporkral", "Sporkral", "Yaprak", "Nadir", 60, 16, 23, 10, ["kokKapani", "camKalkan", "polenUykusu", "yaprakDarbesi"], "mushroom", ["#1f3028", "#9be070", "#93d4e8"], { prime: { name: "Prime Sporkral", minLevel: 23, unlockKey: "fungusPuzzle", boosts: { attack: 1.12, defense: 1.42, speed: 1.08 }, aura: "#8ad46f" } });
  addCreature("kristalpin", "Kristalpin", "Kaya", "Yaygın", 42, 12, 17, 9, ["tasYumruk", "kristalSavunma", "magaraCokusu"], "crystal", ["#27394f", "#93d4e8", "#fff4d2"], { evolution: { level: 21, into: "nehiryal" } });
  addCreature("nehiryal", "Nehiryal", "Su", "Nadir", 53, 17, 15, 21, ["kopukAtisi", "dalgaCarpmasi", "inciAkimi", "yagmurNabzi"], "jelly", ["#1e5c83", "#7ed8ee", "#fff4d2"], { prime: { name: "Prime Nehiryal", minLevel: 24, unlockKey: "crystalSeal", boosts: { attack: 1.2, defense: 1.18, speed: 1.34 }, aura: "#93d4e8" } });
  addCreature("buzkirpi", "Buzkirpi", "Su", "Yaygın", 40, 12, 15, 13, ["kopukAtisi", "yagmurNabzi", "inciAkimi"], "penguin", ["#d8f4ff", "#5bb9dc", "#28364f"]);
  addCreature("kemikdis", "Kemikdis", "Kaya", "Nadir", 57, 20, 20, 9, ["tasYumruk", "magaraCokusu", "kristalSavunma"], "scorpion", ["#d9ceb4", "#8a7f6d", "#302b2b"], { prime: { name: "Prime Kemikdis", minLevel: 24, unlockKey: "treasureVault", boosts: { attack: 1.28, defense: 1.32, speed: 1.08 }, aura: "#efe2b8" } });
  addCreature("kumruh", "Kumruh", "Gölge", "Yaygın", 36, 14, 10, 18, ["golgeIsirigi", "gecePerdesi", "hizKanadi"], "bat", ["#231d2d", "#7a63d8", "#d7c7ff"]);
  addCreature("obsigoz", "Obsigoz", "Gölge", "Nadir", 48, 19, 14, 18, ["golgeIsirigi", "gecePerdesi", "magmaYumrugu", "korFirtinasi"], "orb", ["#171923", "#7d351f", "#f2b94b"], { prime: { name: "Prime Obsigoz", minLevel: 26, unlockKey: "crownGuard", boosts: { attack: 1.34, defense: 1.16, speed: 1.24 }, aura: "#a067ff" } });
  addCreature("tacmantar", "Tacmantar", "Işık", "Çok Nadir", 54, 18, 22, 14, ["isikHalesi", "safakPatlamasi", "camKalkan", "polenUykusu"], "mushroom", ["#fff4d2", "#f2b94b", "#8ad46f"], { prime: { name: "Prime Tacmantar", minLevel: 30, unlockKey: "shadowKing", boosts: { attack: 1.22, defense: 1.34, speed: 1.16 }, aura: "#fff4d2" } });
  addCreature("tahtkor", "Tahtkor", "Alev", "Çok Nadir", 72, 27, 21, 20, ["lavAkisi", "korFirtinasi", "volkanKukremesi", "magmaYumrugu"], "golem", ["#171923", "#7d2d35", "#ffdd67"], { prime: { name: "Prime Tahtkor", minLevel: 32, unlockKey: "shadowKing", boosts: { attack: 1.42, defense: 1.24, speed: 1.16 }, aura: "#ffdd67" } });
  addCreature("gizlibuz", "Gizlibuz", "Su", "Nadir", 50, 16, 19, 16, ["kopukAtisi", "inciAkimi", "yagmurNabzi", "gecePerdesi"], "sprite", ["#d8f4ff", "#93d4e8", "#7a63d8"]);
  addCreature("haritakurt", "Haritakurt", "Rüzgar", "Nadir", 46, 17, 12, 24, ["ruzgarKesisi", "hizKanadi", "firtinaDonusu", "golgeIsirigi"], "wolf", ["#45394f", "#c7b37a", "#fff4d2"]);

  Object.assign(quests, {
    biyomBulmacalari: {
      id: "biyomBulmacalari", title: "Biyom Bulmacalari", giver: "Haritaci Nira",
      description: "Yeraltı biyomlarindaki mekanikleri coz ve krallik haritasini tamamla.",
      objectives: [
        { id: "solveFungusPuzzle", text: "Fosfor mantar siralamasini coz", target: 1 },
        { id: "rideCrystalCurrent", text: "Kristal akintisindan gec", target: 1 },
        { id: "crossLavaBridge", text: "Lav Denizi'nde zamanli kopruyu gec", target: 1 },
        { id: "surviveBonePit", text: "Kemik Kumlari'ndaki gizli cukuru atlat", target: 1 },
        { id: "slideIcePath", text: "Soguk Derinlik'te buz kayisini tamamla", target: 1 }
      ],
      rewards: [{ type: "money", amount: 900 }, { type: "item", itemId: "primeTasi", qty: 1 }]
    },
    gizliDefineOdasi: {
      id: "gizliDefineOdasi", title: "Gizli Define Odasi", giver: "Defineci Sera",
      description: "Harita parcalarini ve kraliyet reliclerini toplayip mahzendeki gizli odayi ac.",
      objectives: [
        { id: "collectMapPiece", text: "Harita parcasi topla", target: 4 },
        { id: "collectRoyalRelic", text: "Kraliyet relicleri topla", target: 8 },
        { id: "openSecretVault", text: "Define Mahzeni'ndeki gizli odayi ac", target: 1 }
      ],
      rewards: [{ type: "money", amount: 1800 }, { type: "item", itemId: "kralinGolgesi", qty: 1 }]
    },
    kralinGolgesiGorevi: {
      id: "kralinGolgesiGorevi", title: "Kralin Golgesi", giver: "Taht Yaziti",
      description: "Taht Muhafizi dustukten sonra uyanan gizli Prime bossu bul.",
      objectives: [
        { id: "beatUnderworldCrown", text: "Taht Muhafizi Varkan'i yen", target: 1 },
        { id: "beatShadowKing", text: "Kralin Golgesi'ni yen", target: 1 }
      ],
      rewards: [{ type: "money", amount: 2200 }, { type: "item", itemId: "primeTasi", qty: 2 }]
    },
    primeKilidi: {
      id: "primeKilidi", title: "Prime Kilitleri", giver: "Prime Yaziti",
      description: "Bosslar ve Prime taslariyla yeni Prime formlarini ac.",
      objectives: [
        { id: "unlockPrimeSpecies", text: "Yeni bir Prime tur kilidi ac", target: 5 },
        { id: "usePrimeStone", text: "Prime Tasi kullan", target: 1 }
      ],
      rewards: [{ type: "money", amount: 760 }, { type: "item", itemId: "kristalLumaKuresi", qty: 2 }]
    }
  });

  function addChest(mapId, id, x, y, itemId, qty, objective, hidden) {
    if (!maps[mapId]) return;
    maps[mapId].items.push({ id: id, x: x, y: y, itemId: itemId, qty: qty || 1, questObjective: objective, hidden: !!hidden });
  }

  addChest("lavDenizi", "harita_parcasi_lav", 53, 33, "haritaParcasi", 1, "collectMapPiece", true);
  addChest("mantarOrmani", "harita_parcasi_mantar", 8, 30, "haritaParcasi", 1, "collectMapPiece", true);
  addChest("kristalNehir", "harita_parcasi_kristal", 44, 29, "haritaParcasi", 1, "collectMapPiece", true);
  addChest("kemikKumlari", "harita_parcasi_kemik", 50, 11, "haritaParcasi", 1, "collectMapPiece", true);
  addChest("defineMahzeni", "gizli_oda_odulu", 31, 8, "primeTasi", 1, "openSecretVault", true);

  if (maps.mantarOrmani) {
    maps.mantarOrmani.interactions.push(
      { x: 16, y: 10, type: "undergroundPuzzle", puzzle: "fungus", key: "kor", text: "Kor mantari sicak turuncu parliyor." },
      { x: 31, y: 12, type: "undergroundPuzzle", puzzle: "fungus", key: "ay", text: "Ay mantari mavi yesil parliyor." },
      { x: 45, y: 31, type: "undergroundPuzzle", puzzle: "fungus", key: "kok", text: "Kok mantari topraga yakin hafifce titriyor." }
    );
  }
  if (maps.defineMahzeni) {
    maps.defineMahzeni.interactions.push({ x: 31, y: 10, type: "secretVault", text: "Sekiz relic ve dort harita parcasi isteyen gizli oda kapisi." });
  }
  if (maps.primeOcagi) {
    maps.primeOcagi.interactions.push({ x: 33, y: 25, type: "primeStone", text: "Prime tas yuvasi kizil isikla donuyor." });
  }
  if (maps.tahtSalonu) {
    maps.tahtSalonu.interactions.push({ x: 32, y: 11, type: "shadowBoss", text: "Tahtin golgesi hala kipirdiyor." });
  }

  function pushNpc(mapId, npc) {
    npcs[mapId] = npcs[mapId] || [];
    npcs[mapId].push(npc);
  }

  pushNpc("lavDenizi", { id: "trainer_lav_sicrama", name: "Kopru Kosucusu Yigit", type: "trainer", x: 48, y: 31, dir: "left", action: "trainer", sprite: "trainer",
    team: [{ creatureId: "lavcik", level: 13 }, { creatureId: "korbaykus", level: 15 }], money: 300, dialogue: ["Kopru acilip kapanirken kosmak cesaret ister!"], afterDialogue: ["Zamanlaman fena degil."] });
  pushNpc("mantarOrmani", { id: "trainer_spor_bilge", name: "Spor Bilgesi Ekin", type: "trainer", x: 33, y: 29, dir: "up", action: "trainer", sprite: "ranger",
    team: [{ creatureId: "spormin", level: 14 }, { creatureId: "sporkral", level: 16 }], money: 320, dialogue: ["Mantar bilmecesini bilen, savasin ritmini de bilir."], afterDialogue: ["Fosfor sirasi aklinda kalsin."] });
  pushNpc("kristalNehir", { id: "trainer_akinti_mert", name: "Akinti Mert", type: "trainer", x: 45, y: 20, dir: "left", action: "trainer", sprite: "trainer",
    team: [{ creatureId: "kristalpin", level: 16 }, { creatureId: "nehiryal", level: 18 }], money: 360, dialogue: ["Akintiya karsi degil, akintiyla birlikte savas."], afterDialogue: ["Nehir seni tasir artik."] });
  pushNpc("buzulMagara", { id: "trainer_buz_kayici", name: "Buz Kayicisi Ela", type: "trainer", x: 17, y: 28, dir: "right", action: "trainer", sprite: "trainer2",
    team: [{ creatureId: "buzkirpi", level: 19 }, { creatureId: "gizlibuz", level: 21 }], money: 440, dialogue: ["Kaymaya baslarsan durmak kolay degil."], afterDialogue: ["Buz yolunu ezberledin."] });
  pushNpc("kemikKumlari", { id: "trainer_cukur_naz", name: "Cukur Naz", type: "trainer", x: 38, y: 11, dir: "down", action: "trainer", sprite: "guard",
    team: [{ creatureId: "kemikdis", level: 19 }, { creatureId: "kumruh", level: 20 }], money: 420, dialogue: ["Kumun altindaki bosluklari dinle."], afterDialogue: ["Cukurlar seni bir daha kolay yutamaz."] });
  pushNpc("defineMahzeni", { id: "trainer_relic_sena", name: "Relic Sena", type: "trainer", x: 18, y: 29, dir: "right", action: "trainer", sprite: "collector",
    team: [{ creatureId: "obsigoz", level: 22 }, { creatureId: "haritakurt", level: 23 }, { creatureId: "kemikdis", level: 24 }], money: 560, dialogue: ["Her relic bir hikaye saklar; benden gecmeden okuyamazsin."], afterDialogue: ["Hikayeler sende toplansin."] });

  Object.keys(maps).forEach(function (mapId) {
    var map = maps[mapId];
    if (!map || !map.encounters) return;
    if (mapId === "lavDenizi") map.encounters.push({ id: "lavcik", min: 11, max: 15, weight: 5 }, { id: "korbaykus", min: 13, max: 16, weight: 2 });
    if (mapId === "mantarOrmani") map.encounters.push({ id: "spormin", min: 9, max: 14, weight: 5 }, { id: "sporkral", min: 14, max: 17, weight: 2 }, { id: "tacmantar", min: 18, max: 20, weight: 1 });
    if (mapId === "kristalNehir") map.encounters.push({ id: "kristalpin", min: 13, max: 17, weight: 5 }, { id: "nehiryal", min: 15, max: 18, weight: 2 });
    if (mapId === "buzulMagara") map.encounters.push({ id: "buzkirpi", min: 17, max: 21, weight: 5 }, { id: "gizlibuz", min: 19, max: 22, weight: 2 });
    if (mapId === "kemikKumlari") map.encounters.push({ id: "kemikdis", min: 16, max: 21, weight: 4 }, { id: "kumruh", min: 15, max: 20, weight: 5 });
    if (mapId === "primeOcagi") map.encounters.push({ id: "lavsirt", min: 22, max: 25, weight: 3 }, { id: "korboynuz", min: 24, max: 27, weight: 1 });
    if (mapId === "defineMahzeni") map.encounters.push({ id: "obsigoz", min: 20, max: 24, weight: 4 }, { id: "haritakurt", min: 19, max: 23, weight: 3 });
    if (mapId === "tahtSalonu") map.encounters.push({ id: "tahtkor", min: 26, max: 30, weight: 2 }, { id: "korboynuz", min: 25, max: 29, weight: 2 });
  });
})();
