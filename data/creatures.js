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

  (function expandLumaCatalog() {
    var creatures = window.LUMA_DATA.creatures;
    var elementMoves = {
      "Yaprak": ["yaprakDarbesi", "kokKapani", "camKalkan", "polenUykusu"],
      "Alev": ["kozSicramasi", "magmaYumrugu", "lavAkisi", "korFirtinasi"],
      "Su": ["kopukAtisi", "dalgaCarpmasi", "yagmurNabzi", "inciAkimi"],
      "Kaya": ["tasYumruk", "kristalSavunma", "magaraCokusu", "tasYumruk"],
      "Rüzgar": ["ruzgarKesisi", "hizKanadi", "firtinaDonusu", "ruzgarKesisi"],
      "Elektrik": ["voltKivilcimi", "simsekZiplamasi", "hizKanadi", "voltKivilcimi"],
      "Gölge": ["golgeIsirigi", "gecePerdesi", "golgeIsirigi", "gecePerdesi"],
      "Işık": ["isikHalesi", "safakPatlamasi", "hizKanadi", "isikHalesi"]
    };
    var elements = Object.keys(elementMoves);
    var bodies = [
      "sprout", "cat", "otter", "drop", "beetle", "bird", "fox", "mouse", "bat", "orb", "crystal", "fish", "deer",
      "turtle", "moth", "lizard", "serpent", "golem", "crab", "owl", "rabbit", "frog", "jelly", "mantis",
      "wolf", "flower", "snail", "sprite", "mushroom", "rhino", "penguin", "scorpion", "star"
    ];
    var prefixes = [
      "Nara", "Mavi", "Kıvıl", "Pırı", "Gümüş", "Çın", "Yosun", "Bora", "Kum", "Sedef", "Lal", "Sis",
      "Uğur", "Koral", "Doru", "Misk", "Kara", "Yıldız", "Köpük", "Çakıl", "Safir", "Mercan", "Aykır", "Zümra"
    ];
    var suffixes = [
      "kuş", "pati", "kuyruk", "burun", "kanat", "göz", "çen", "mır", "taş", "su", "çik", "peri",
      "zor", "min", "göl", "kır", "pul", "çap", "yürek", "gölge", "ışık", "diken", "tüy", "kök"
    ];
    var nameMarks = ["a", "on", "is", "el", "or", "ya", "um", "ek", "ir", "as", "en", "il", "os", "ur", "ia", "an", "et"];
    var palettes = {
      "Yaprak": [["#2f8548", "#8bd36b", "#fff4d2"], ["#456f3f", "#a8d46a", "#e0c974"], ["#1f6f55", "#54b86b", "#d9ffd1"]],
      "Alev": [["#9f3d2e", "#f06b34", "#ffd28a"], ["#b94b31", "#f2b94b", "#fff4d2"], ["#7d351f", "#e46d45", "#f8a05f"]],
      "Su": [["#2778b9", "#9de8e6", "#fff4d2"], ["#2d79b8", "#74d0ed", "#dff8ff"], ["#355f9f", "#4aa8d8", "#aef2ff"]],
      "Kaya": [["#555b66", "#aeb3a5", "#fff4d2"], ["#62666b", "#93d4e8", "#f2d54a"], ["#443d47", "#8a8f91", "#d7d1c0"]],
      "Rüzgar": [["#6fb6d9", "#e7fbff", "#576a8a"], ["#7cc7aa", "#fff4d2", "#4f76b9"], ["#8ab7df", "#f4fbff", "#7b89a6"]],
      "Elektrik": [["#f3cf3f", "#fff2a8", "#2e3959"], ["#f2b94b", "#fff4d2", "#6f63d8"], ["#d7e354", "#ffffff", "#4467a7"]],
      "Gölge": [["#31324f", "#67649b", "#c8c6ff"], ["#20243a", "#7a63d8", "#f08bb0"], ["#172033", "#59547c", "#a08ac8"]],
      "Işık": [["#f2d86b", "#fff6b8", "#f08bb0"], ["#fff4d2", "#93d4e8", "#f2b94b"], ["#f7e7b2", "#ffffff", "#54b86b"]]
    };
    var marks = ["crest", "stripes", "spots", "horn", "wings", "tail", "gem", "mask", "none"];
    var count = Object.keys(creatures).length;
    var serial = count + 1;
    while (count < 131) {
      var element = elements[(serial * 5 + serial % 7) % elements.length];
      var body = bodies[(serial - 16) % bodies.length];
      var paletteSet = palettes[element];
      var colors = paletteSet[(serial + Math.floor(serial / 3)) % paletteSet.length];
      var id = "luma" + String(serial).padStart(3, "0");
      if (!creatures[id]) {
        var name = prefixes[(serial * 7) % prefixes.length] + suffixes[(serial * 13) % suffixes.length] + nameMarks[(serial * 5) % nameMarks.length];
        var tier = serial % 19 === 0 ? "Çok Nadir" : (serial % 7 === 0 ? "Nadir" : "Yaygın");
        creatures[id] = {
          id: id,
          name: name,
          element: element,
          rarity: tier,
          captureDifficulty: tier === "Çok Nadir" ? 72 : (tier === "Nadir" ? 56 : 38),
          baseStats: {
            hp: 31 + serial % 22,
            attack: 8 + serial % 11,
            defense: 8 + (serial * 3) % 12,
            speed: 7 + (serial * 5) % 14
          },
          abilities: elementMoves[element],
          description: name + ", " + element + " ışığını taşıyan özgün bir Luma türüdür. Bölgesine göre rengi, duruşu ve huyu değişir.",
          evolution: null,
          sprite: { body: body, colors: colors, variant: serial % 12, mark: marks[serial % marks.length] }
        };
        count += 1;
      }
      serial += 1;
    }

    (function wireEvolutionChains() {
      var generated = Object.keys(creatures).filter(function (id) { return /^luma\d+/.test(id); }).sort();
      var named = ["minsu", "cimsirik", "tasburun", "ruzgocuk", "korcik", "voltik", "golgemir", "parilti", "kristalik", "nilperi", "agackulak"];
      var starterTargets = { filizik: "luma016", kozpati: "luma017", kopukcu: "luma018" };
      Object.keys(starterTargets).forEach(function (id) {
        if (creatures[id] && creatures[starterTargets[id]]) creatures[id].evolution = { level: 16, into: starterTargets[id] };
      });
      named.forEach(function (id, index) {
        var target = generated[3 + index * 2];
        if (creatures[id] && creatures[target]) creatures[id].evolution = { level: 18 + index % 6, into: target };
      });
      for (var i = 0; i < generated.length - 2; i += 3) {
        if (creatures[generated[i]]) creatures[generated[i]].evolution = { level: 14 + i % 9, into: generated[i + 1] };
        if (creatures[generated[i + 1]]) creatures[generated[i + 1]].evolution = { level: 28 + i % 7, into: generated[i + 2] };
      }
    })();

    Object.assign(creatures, {
      crownlex: {
        id: "crownlex", name: "Crownlex", element: "Yaprak", rarity: "Nadir", captureDifficulty: 58,
        baseStats: { hp: 39, attack: 13, defense: 11, speed: 17 },
        abilities: ["yaprakDarbesi", "hizKanadi", "camKalkan", "polenUykusu"],
        description: "Başındaki yaprak tacıyla orman rüzgarını dinleyen özgün bir Luma. Sessiz kanat çırpışıyla iz bırakmadan süzülür.",
        evolution: null,
        sprite: { body: "owl", colors: ["#365f42", "#e0c974", "#fff4d2"], variant: 7, mark: "crest" }
      },
      barbo: {
        id: "barbo", name: "Barbo", element: "Elektrik", rarity: "Nadir", captureDifficulty: 57,
        baseStats: { hp: 35, attack: 14, defense: 9, speed: 20 },
        abilities: ["voltKivilcimi", "simsekZiplamasi", "hizKanadi", "voltKivilcimi"],
        description: "Bıyık tüyleri statik kıvılcımla kabaran çevik bir Luma. Neşeli görünür ama kuyruğu şarj olunca yaklaşanı zıplatır.",
        evolution: null,
        sprite: { body: "mouse", colors: ["#d79531", "#ffe66b", "#2e3959"], variant: 5, mark: "tail" }
      },
      alevpati: {
        id: "alevpati", name: "Alevpati", element: "Alev", rarity: "Nadir", captureDifficulty: 58,
        baseStats: { hp: 52, attack: 19, defense: 13, speed: 19 },
        abilities: ["alevPencesi", "magmaYumrugu", "korPerdesi", "lavAkisi"],
        description: "Patilerindeki köz artık adım attığı taşı kısa süre kızdıracak kadar güçlüdür.",
        evolution: { level: 32, into: "korleopar" },
        prime: { name: "Prime Alevpati", minLevel: 16, boosts: { attack: 1.3, defense: 1.12, speed: 1.2 }, aura: "#f2b94b" },
        sprite: { body: "cat", colors: ["#8f3428", "#f28c45", "#ffd28a"], variant: 2, mark: "stripes" }
      },
      korleopar: {
        id: "korleopar", name: "Korleopar", element: "Alev", rarity: "Çok Nadir", captureDifficulty: 72,
        baseStats: { hp: 66, attack: 25, defense: 18, speed: 24 },
        abilities: ["magmaYumrugu", "lavAkisi", "korFirtinasi", "volkanKukremesi"],
        description: "Kor Dağı'nın sıcak taşlarında iz bırakmadan koşan efsanevi bir avcı.",
        evolution: null,
        prime: { name: "Prime Korleopar", minLevel: 28, boosts: { attack: 1.42, defense: 1.16, speed: 1.28 }, aura: "#ffdd67" },
        sprite: { body: "wolf", colors: ["#7b261f", "#e46d45", "#ffdd67"], variant: 7, mark: "crest" }
      },
      iskurdu: {
        id: "iskurdu", name: "İskurdu", element: "Alev", rarity: "Yaygın", captureDifficulty: 42,
        baseStats: { hp: 38, attack: 14, defense: 10, speed: 13 },
        abilities: ["kozSicramasi", "alevPencesi", "korPerdesi", "magmaYumrugu"],
        description: "Kül tabakasının altında yuvarlanıp sıcaklığını saklayan minik bir kurtçuk.",
        evolution: { level: 18, into: "lavakurt" },
        sprite: { body: "lizard", colors: ["#6d2a22", "#f06b34", "#ffd28a"], variant: 3, mark: "spots" }
      },
      lavakurt: {
        id: "lavakurt", name: "Lavakurt", element: "Alev", rarity: "Nadir", captureDifficulty: 58,
        baseStats: { hp: 52, attack: 19, defense: 15, speed: 17 },
        abilities: ["magmaYumrugu", "lavAkisi", "korPerdesi", "korFirtinasi"],
        description: "Sırtındaki çatlaklardan lav çizgileri akar; tünel duvarlarını kokusundan tanır.",
        evolution: { level: 34, into: "obsidikurt" },
        prime: { name: "Prime Lavakurt", minLevel: 16, boosts: { attack: 1.34, defense: 1.2, speed: 1.15 }, aura: "#e46d45" },
        sprite: { body: "wolf", colors: ["#4b2a2a", "#e46d45", "#f2b94b"], variant: 9, mark: "tail" }
      },
      obsidikurt: {
        id: "obsidikurt", name: "Obsidikurt", element: "Alev", rarity: "Çok Nadir", captureDifficulty: 76,
        baseStats: { hp: 72, attack: 27, defense: 22, speed: 19 },
        abilities: ["lavAkisi", "magmaYumrugu", "korFirtinasi", "volkanKukremesi"],
        description: "Obsidyen zırhı soğumuş gibi görünür; içindeki lav en zor anda parlar.",
        evolution: null,
        prime: { name: "Prime Obsidikurt", minLevel: 30, boosts: { attack: 1.38, defense: 1.28, speed: 1.12 }, aura: "#f06b34" },
        sprite: { body: "wolf", colors: ["#272432", "#7d351f", "#ffdd67"], variant: 11, mark: "gem" }
      },
      kulkerten: {
        id: "kulkerten", name: "Külkerten", element: "Alev", rarity: "Yaygın", captureDifficulty: 45,
        baseStats: { hp: 42, attack: 13, defense: 13, speed: 11 },
        abilities: ["kozSicramasi", "korPerdesi", "magmaYumrugu", "lavAkisi"],
        description: "Kül rengine bürünerek sıcak taşların arasında görünmez olan bir kertenkele.",
        evolution: { level: 22, into: "magmerten" },
        sprite: { body: "lizard", colors: ["#4d3d3d", "#c65642", "#f8a05f"], variant: 4, mark: "mask" }
      },
      magmerten: {
        id: "magmerten", name: "Magmerten", element: "Alev", rarity: "Nadir", captureDifficulty: 62,
        baseStats: { hp: 58, attack: 20, defense: 17, speed: 16 },
        abilities: ["magmaYumrugu", "lavAkisi", "korFirtinasi", "volkanKukremesi"],
        description: "Kuyruğundaki magma kıvrımı mağara duvarlarını aydınlatan canlı bir meşaledir.",
        evolution: null,
        prime: { name: "Prime Magmerten", minLevel: 20, boosts: { attack: 1.3, defense: 1.22, speed: 1.16 }, aura: "#f2b94b" },
        sprite: { body: "serpent", colors: ["#5c1f21", "#e46d45", "#ffd28a"], variant: 8, mark: "tail" }
      },
      tutsukanat: {
        id: "tutsukanat", name: "Tutuşkanat", element: "Alev", rarity: "Yaygın", captureDifficulty: 44,
        baseStats: { hp: 36, attack: 14, defense: 9, speed: 18 },
        abilities: ["kozSicramasi", "alevPencesi", "hizKanadi", "korFirtinasi"],
        description: "Kısa uçuşlarında ardında turuncu kıvılcım izleri bırakır.",
        evolution: { level: 24, into: "alevanka" },
        sprite: { body: "bird", colors: ["#8f3428", "#f06b34", "#ffe0a3"], variant: 6, mark: "wings" }
      },
      alevanka: {
        id: "alevanka", name: "Alevanka", element: "Alev", rarity: "Çok Nadir", captureDifficulty: 78,
        baseStats: { hp: 61, attack: 23, defense: 15, speed: 27 },
        abilities: ["hizKanadi", "lavAkisi", "korFirtinasi", "volkanKukremesi"],
        description: "Volkan bacasından yükselen sıcak rüzgarları okuyarak kaçış yollarını bulur.",
        evolution: null,
        prime: { name: "Prime Alevanka", minLevel: 22, boosts: { attack: 1.28, defense: 1.12, speed: 1.42 }, aura: "#ffdd67" },
        sprite: { body: "bird", colors: ["#b94b31", "#ff9d45", "#fff4d2"], variant: 10, mark: "crest" }
      },
      korsinek: {
        id: "korsinek", name: "Korsinek", element: "Alev", rarity: "Yaygın", captureDifficulty: 46,
        baseStats: { hp: 34, attack: 13, defense: 9, speed: 20 },
        abilities: ["kozSicramasi", "korPerdesi", "magmaYumrugu", "korFirtinasi"],
        description: "Lav kabarcıklarının üstünde sekerek yaşayan kıvılcım kanatlı bir Luma.",
        evolution: null,
        sprite: { body: "moth", colors: ["#5c1f21", "#f2b94b", "#ffd28a"], variant: 1, mark: "spots" }
      },
      magmantar: {
        id: "magmantar", name: "Magmantar", element: "Alev", rarity: "Nadir", captureDifficulty: 60,
        baseStats: { hp: 56, attack: 16, defense: 22, speed: 8 },
        abilities: ["korPerdesi", "magmaYumrugu", "lavAkisi", "firinNefesi"],
        description: "Isı çatlaklarında büyür; şapkası değerli kül minerallerini saklar.",
        evolution: null,
        prime: { name: "Prime Magmantar", minLevel: 18, boosts: { attack: 1.22, defense: 1.38, speed: 1.08 }, aura: "#f06b34" },
        sprite: { body: "mushroom", colors: ["#7d351f", "#e46d45", "#fff4d2"], variant: 2, mark: "gem" }
      },
      lavagon: {
        id: "lavagon", name: "Lavagon", element: "Alev", rarity: "Nadir", captureDifficulty: 64,
        baseStats: { hp: 64, attack: 22, defense: 20, speed: 11 },
        abilities: ["tasYumruk", "magmaYumrugu", "lavAkisi", "korFirtinasi"],
        description: "Sırtındaki kaya plakaları lav basıncıyla ileri geri oynayan ağır bir koruma sağlar.",
        evolution: null,
        prime: { name: "Prime Lavagon", minLevel: 21, boosts: { attack: 1.32, defense: 1.34, speed: 1.04 }, aura: "#ff8b45" },
        sprite: { body: "golem", colors: ["#3d3334", "#9f3d2e", "#f2b94b"], variant: 5, mark: "horn" }
      },
      volkobra: {
        id: "volkobra", name: "Volkobra", element: "Alev", rarity: "Çok Nadir", captureDifficulty: 80,
        baseStats: { hp: 62, attack: 24, defense: 17, speed: 25 },
        abilities: ["lavAkisi", "korFirtinasi", "gecePerdesi", "volkanKukremesi"],
        description: "Magma Kalbi'nde define kapılarının çevresine sarılan eski bir koruyucu.",
        evolution: null,
        prime: { name: "Prime Volkobra", minLevel: 24, boosts: { attack: 1.36, defense: 1.18, speed: 1.32 }, aura: "#f2b94b" },
        sprite: { body: "serpent", colors: ["#2b2028", "#e46d45", "#ffdd67"], variant: 12, mark: "crest" }
      }
    });
    creatures.kozpati.evolution = { level: 16, into: "alevpati" };
    creatures.filizik.prime = { name: "Prime Filizik", minLevel: 5, boosts: { attack: 1.18, defense: 1.24, speed: 1.12 }, aura: "#8ed35f" };
    creatures.kozpati.prime = { name: "Prime Közpati", minLevel: 5, boosts: { attack: 1.25, defense: 1.08, speed: 1.18 }, aura: "#f2b94b" };
    creatures.kopukcu.prime = { name: "Prime Köpükçü", minLevel: 5, boosts: { attack: 1.16, defense: 1.18, speed: 1.22 }, aura: "#81d7f0" };
    creatures.korcik.prime = { name: "Prime Korcik", minLevel: 12, boosts: { attack: 1.28, defense: 1.08, speed: 1.22 }, aura: "#f06b34" };
  })();
})();
