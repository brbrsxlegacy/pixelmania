(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  window.LUMA_DATA.creatures = {
    filizik: {
      id: "filizik", name: "Filizik", element: "Yaprak", starter: true, rarity: "Başlangıç", captureDifficulty: 80,
      baseStats: { hp: 42, attack: 12, defense: 11, speed: 12 },
      abilities: ["yaprakDarbesi", "kokKapani", "camKalkan", "polenUykusu"],
      description: "Yaprak kuyruklu, meraklı bir orman dostu. Işığı görünce kuyruğu kıpırdar.",
      evolution: { level: 16, into: "Filizor" }, sprite: { body: "sprout", colors: ["#4e9f4d", "#8ed35f", "#f7e7b2"] }
    },
    kozpati: {
      id: "kozpati", name: "Közpati", element: "Alev", starter: true, rarity: "Başlangıç", captureDifficulty: 80,
      baseStats: { hp: 40, attack: 14, defense: 9, speed: 13 },
      abilities: ["kozSicramasi", "alevPencesi", "korPerdesi", "firinNefesi"],
      description: "Patilerinde minik közler taşıyan çevik bir sokak yoldaşı.",
      evolution: { level: 16, into: "Alevpati" }, sprite: { body: "cat", colors: ["#b94b31", "#f28c45", "#ffe0a3"] }
    },
    kopukcu: {
      id: "kopukcu", name: "Köpükçü", element: "Su", starter: true, rarity: "Başlangıç", captureDifficulty: 80,
      baseStats: { hp: 44, attack: 11, defense: 12, speed: 11 },
      abilities: ["kopukAtisi", "dalgaCarpmasi", "yagmurNabzi", "inciAkimi"],
      description: "Köpük kulaklarıyla sesleri dinleyen neşeli bir göl yaratığı.",
      evolution: { level: 16, into: "Dalgakuş" }, sprite: { body: "otter", colors: ["#3b8fc2", "#81d7f0", "#fff4d2"] }
    },
    minsu: {
      id: "minsu", name: "Minsu", element: "Su", rarity: "Yaygın", captureDifficulty: 38,
      baseStats: { hp: 34, attack: 9, defense: 9, speed: 12 },
      abilities: ["kopukAtisi", "ruzgarKesisi", "yagmurNabzi"], description: "Dere kenarlarında zıplayan su benekli minik canlı.",
      evolution: { level: 14, into: "Sulara" }, sprite: { body: "drop", colors: ["#2d79b8", "#74d0ed", "#dff8ff"] }
    },
    cimsirik: {
      id: "cimsirik", name: "Çimsırık", element: "Yaprak", rarity: "Yaygın", captureDifficulty: 36,
      baseStats: { hp: 36, attack: 10, defense: 10, speed: 10 },
      abilities: ["yaprakDarbesi", "kokKapani"], description: "Uzun otların arasında saklanan sivri burunlu bir filiz.",
      evolution: { level: 15, into: "Çimkuyruk" }, sprite: { body: "sprout", colors: ["#357a3f", "#72c850", "#e7ffd0"] }
    },
    tasburun: {
      id: "tasburun", name: "Taşburun", element: "Kaya", rarity: "Yaygın", captureDifficulty: 42,
      baseStats: { hp: 44, attack: 12, defense: 15, speed: 6 },
      abilities: ["tasYumruk", "kristalSavunma"], description: "Toprağı koklayarak kristal damarlarını bulur.",
      evolution: { level: 18, into: "Granitburun" }, sprite: { body: "beetle", colors: ["#62666b", "#aeb3a5", "#fff4d2"] }
    },
    ruzgocuk: {
      id: "ruzgocuk", name: "Rüzgoçuk", element: "Rüzgar", rarity: "Yaygın", captureDifficulty: 40,
      baseStats: { hp: 32, attack: 11, defense: 8, speed: 17 },
      abilities: ["ruzgarKesisi", "hizKanadi"], description: "Kuyruğu dönerek tozları havalandıran hafif bir yaratık.",
      evolution: { level: 17, into: "Poyrazan" }, sprite: { body: "bird", colors: ["#6fb6d9", "#e7fbff", "#576a8a"] }
    },
    korcik: {
      id: "korcik", name: "Korcik", element: "Alev", rarity: "Yaygın", captureDifficulty: 43,
      baseStats: { hp: 35, attack: 13, defense: 8, speed: 13 },
      abilities: ["kozSicramasi", "korPerdesi"], description: "Kurutulmuş yaprakları ısıtarak yuva yapar.",
      evolution: { level: 17, into: "Korçalı" }, sprite: { body: "fox", colors: ["#9f3d2e", "#f06b34", "#ffd28a"] }
    },
    voltik: {
      id: "voltik", name: "Voltik", element: "Elektrik", rarity: "Nadir", captureDifficulty: 52,
      baseStats: { hp: 33, attack: 13, defense: 8, speed: 18 },
      abilities: ["voltKivilcimi", "simsekZiplamasi"], description: "Kristal tellerdeki statik enerjiyi sever.",
      evolution: { level: 20, into: "Voltaran" }, sprite: { body: "mouse", colors: ["#f3cf3f", "#fff2a8", "#2e3959"] }
    },
    golgemir: {
      id: "golgemir", name: "Gölgemir", element: "Gölge", rarity: "Nadir", captureDifficulty: 56,
      baseStats: { hp: 38, attack: 14, defense: 10, speed: 14 },
      abilities: ["golgeIsirigi", "gecePerdesi"], description: "Ay ışığı zayıflayınca mağara girişlerinde görünür.",
      evolution: { level: 22, into: "Sispençe" }, sprite: { body: "bat", colors: ["#31324f", "#67649b", "#c8c6ff"] }
    },
    parilti: {
      id: "parilti", name: "Parıltı", element: "Işık", rarity: "Nadir", captureDifficulty: 60,
      baseStats: { hp: 36, attack: 12, defense: 12, speed: 15 },
      abilities: ["isikHalesi", "safakPatlamasi"], description: "Çiğ tanelerinin içinde doğan yumuşak ışıklı canlı.",
      evolution: { level: 21, into: "Halemir" }, sprite: { body: "orb", colors: ["#f2d86b", "#fff6b8", "#f08bb0"] }
    },
    kristalik: {
      id: "kristalik", name: "Kristalik", element: "Kaya", rarity: "Nadir", captureDifficulty: 58,
      baseStats: { hp: 42, attack: 12, defense: 18, speed: 8 },
      abilities: ["tasYumruk", "kristalSavunma", "magaraCokusu"], description: "Sırtındaki kristaller bölgenin ışığını kaydeder.",
      evolution: { level: 24, into: "Kristalor" }, sprite: { body: "crystal", colors: ["#5d6e9d", "#93d4e8", "#fff4d2"] }
    },
    nilperi: {
      id: "nilperi", name: "Nilperi", element: "Su", rarity: "Nadir", captureDifficulty: 55,
      baseStats: { hp: 39, attack: 11, defense: 12, speed: 16 },
      abilities: ["kopukAtisi", "inciAkimi", "yagmurNabzi"], description: "Kristal Göl yüzeyinde zarif halkalar bırakır.",
      evolution: { level: 22, into: "Gölperi" }, sprite: { body: "fish", colors: ["#2778b9", "#9de8e6", "#fff4d2"] }
    },
    agackulak: {
      id: "agackulak", name: "Ağaçkulak", element: "Yaprak", rarity: "Nadir", captureDifficulty: 57,
      baseStats: { hp: 48, attack: 12, defense: 15, speed: 7 },
      abilities: ["yaprakDarbesi", "camKalkan", "kokKapani"], description: "Kulakları yaprak gibi hışırdar; orman yolunu ezbere bilir.",
      evolution: { level: 25, into: "Ormanyürek" }, sprite: { body: "deer", colors: ["#456f3f", "#8ccf63", "#eacb8b"] }
    },
    lumeru: {
      id: "lumeru", name: "Lumeru", element: "Işık", rarity: "Çok Nadir", captureDifficulty: 74,
      baseStats: { hp: 45, attack: 16, defense: 13, speed: 17 },
      abilities: ["isikHalesi", "safakPatlamasi", "hizKanadi"], description: "Efsanelerde kayıp kristalleri yuvasına götüren yol gösterici.",
      evolution: null, sprite: { body: "fox", colors: ["#f2d86b", "#fff2a8", "#6fb6d9"] }
    }
  };
})();
