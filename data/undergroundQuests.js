(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  window.LUMA_DATA.quests = {
    krallikHaritasi: {
      id: "krallikHaritasi", title: "Yeraltı Haritasi", giver: "Haritaci Nira",
      description: "Eski kralligin ana levhasini bul ve Obsidyen Carsisi'na giden yolu ac.",
      objectives: [
        { id: "findRoyalMap", text: "Kraliyet Kapisi'ndaki harita sandigini ac", target: 1 },
        { id: "visit_obsidyenCarsisi", text: "Obsidyen Carsisi'na ulas", target: 1 }
      ],
      rewards: [{ type: "money", amount: 320 }, { type: "item", itemId: "gucluLumaKuresi", qty: 2 }]
    },
    biyomKesfi: {
      id: "biyomKesfi", title: "Yeni Biyomlar", giver: "Kesif Loncası",
      description: "Yeraltı Krallığı'nin birbirinden farkli biyomlarini isaretle.",
      objectives: [
        { id: "visit_mantarOrmani", text: "Fosfor Mantar Ormani'ni kesfet", target: 1 },
        { id: "visit_kristalNehir", text: "Kristal Nehir'e in", target: 1 },
        { id: "visit_lavDenizi", text: "Lav Denizi koprulerinden gec", target: 1 },
        { id: "visit_kulBahcesi", text: "Kul Bahcesi'ne ulas", target: 1 },
        { id: "visit_buzulMagara", text: "Soguk Derinlik'i bul", target: 1 },
        { id: "visit_kemikKumlari", text: "Kemik Kumlari'na gir", target: 1 }
      ],
      rewards: [{ type: "money", amount: 740 }, { type: "item", itemId: "kristalLumaKuresi", qty: 2 }]
    },
    primeOcagiGorevi: {
      id: "primeOcagiGorevi", title: "Prime Ocagi", giver: "Kor Ustalari",
      description: "Prime formlarinin kaynagini bul, Prime kullanan muhafizi yen ve kendi Prime gucunu kullan.",
      objectives: [
        { id: "visit_primeOcagi", text: "Prime Ocagi'na gir", target: 1 },
        { id: "beatPrimeWarden", text: "Prime muhafizini yen", target: 1 },
        { id: "usePrime", text: "Bir savasta Prime formunu kullan", target: 1 }
      ],
      rewards: [{ type: "money", amount: 860 }, { type: "item", itemId: "primeKivilcimi", qty: 1 }]
    },
    primeSirriniAc: {
      id: "primeSirriniAc", title: "Prime Sirri", giver: "Prime Yaziti",
      description: "Prime, Yeraltı Krallığı'nin savas icinde parlayan gecici ust formudur.",
      objectives: [{ id: "usePrime", text: "Savas sirasinda bir Luma'yi Prime formuna gecir", target: 1 }],
      rewards: [{ type: "money", amount: 360 }, { type: "item", itemId: "gucluLumaKuresi", qty: 2 }]
    },
    tahtDefineleri: {
      id: "tahtDefineleri", title: "Tahtin Defineleri", giver: "Defineci Sera",
      description: "Biyomlara dagilmis kraliyet definelerini topla ve Taht Salonu'ndaki son muhafizi yen.",
      objectives: [
        { id: "collectRoyalRelic", text: "Yeraltı defineleri topla", target: 8 },
        { id: "visit_tahtSalonu", text: "Yeraltı Taht Salonu'na gir", target: 1 },
        { id: "beatUnderworldCrown", text: "Taht muhafizini yen", target: 1 }
      ],
      rewards: [{ type: "money", amount: 1400 }, { type: "item", itemId: "tamIksir", qty: 3 }]
    },
    kacisRotasi: {
      id: "kacisRotasi", title: "Lavdan Kacis Rotasi", giver: "Acil Durum Ekibi",
      description: "Yanardag basinci artmadan kralligin kuzey cikis rotasini isaretle.",
      objectives: [
        { id: "visit_lavDenizi", text: "Lav Denizi'nin ana koprusunu gec", target: 1 },
        { id: "visit_primeOcagi", text: "Prime Ocagi'ndan kuzeye cik", target: 1 },
        { id: "visit_tahtSalonu", text: "Taht Salonu'ndaki cikis izini bul", target: 1 }
      ],
      rewards: [{ type: "money", amount: 620 }, { type: "item", itemId: "kacisTasi", qty: 2 }]
    }
  };

  (function expandUndergroundBoard() {
    var quests = window.LUMA_DATA.quests;
    var maps = [
      ["lavDenizi", "Lav Denizi"], ["mantarOrmani", "Fosfor Mantar Ormani"], ["kristalNehir", "Kristal Nehir"],
      ["obsidyenCarsisi", "Obsidyen Carsisi"], ["kulBahcesi", "Kul Bahcesi"], ["kemikKumlari", "Kemik Kumlari"],
      ["buzulMagara", "Soguk Derinlik"], ["defineMahzeni", "Define Mahzeni"], ["primeOcagi", "Prime Ocagi"]
    ];
    var creatures = ["iskurdu", "kulkerten", "tutsukanat", "korsinek", "magmantar", "lavagon", "volkobra", "kristalik", "nilperi"];
    for (var i = 0; i < 36; i += 1) {
      var map = maps[i % maps.length];
      var creature = creatures[(i * 5) % creatures.length];
      var id = "yerAltiPano" + String(i + 1).padStart(2, "0");
      quests[id] = {
        id: id,
        title: i % 2 ? map[1] + " Devriyesi" : map[1] + " Define Isareti",
        giver: "Yeraltı Panosu",
        generated: true,
        description: map[1] + " bolgesinde yeni isaretler ve Luma hareketleri rapor edildi.",
        objectives: i % 2 ?
          [{ id: "visit_" + map[0], text: map[1] + " bolgesine git", target: 1 }, { id: "catch_" + creature, text: creature + " yakala", target: 1 }] :
          [{ id: "visit_" + map[0], text: map[1] + " bolgesini kontrol et", target: 1 }, { id: "winWild", text: "Yeraltinda vahsi mac kazan", target: 2 + i % 3 }],
        rewards: [{ type: "money", amount: 180 + i * 18 }, { type: "item", itemId: i % 4 === 0 ? "kristalLumaKuresi" : "lumaKuresi", qty: 1 + i % 2 }]
      };
    }
  })();
})();
