(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  window.LUMA_DATA.quests = {
    ilkYolArkadasin: {
      id: "ilkYolArkadasin", title: "İlk Yol Arkadaşın", giver: "Profesör Liora",
      description: "Profesör Liora senden laboratuvara uğrayıp bir Luma yoldaşı seçmeni istedi.",
      objectives: [
        { id: "chooseStarter", text: "Laboratuvarda bir başlangıç yaratığı seç", target: 1 },
        { id: "beatRival", text: "Arven'in dostluk maçını tamamla", target: 1 }
      ],
      rewards: [{ type: "money", amount: 250 }, { type: "item", itemId: "lumaKuresi", qty: 5 }]
    },
    kayipKristal: {
      id: "kayipKristal", title: "Kayıp Kristal", giver: "Köy Muhtarı Belgin",
      description: "Köy kuyusunun parlak kristali Yeşilova Yolu'nda kayboldu.",
      objectives: [{ id: "findCrystal", text: "Yeşilova Yolu'nda Parlak Kristal'i bul", target: 1 }],
      rewards: [{ type: "money", amount: 180 }, { type: "item", itemId: "buyukIksir", qty: 1 }]
    },
    ormandakiSes: {
      id: "ormandakiSes", title: "Ormandaki Ses", giver: "Korucu Selin",
      description: "Fısıltı Ormanı'nda gece duyulan garip sesin kaynağını araştır.",
      objectives: [{ id: "talkRanger", text: "Korucu Selin ile ormanda konuş", target: 1 }, { id: "defeatForestTrainer", text: "Ormandaki meydan okumayı kazan", target: 1 }],
      rewards: [{ type: "money", amount: 220 }, { type: "item", itemId: "ormanAnahtari", qty: 1 }]
    },
    golKenariGizemi: {
      id: "golKenariGizemi", title: "Göl Kenarındaki Gizem", giver: "Balıkçı Nadir",
      description: "Kristal Göl yüzeyindeki ışık halkalarının nedenini öğren.",
      objectives: [{ id: "reachLake", text: "Kristal Göl'e ulaş", target: 1 }, { id: "catchWater", text: "Su elementli bir yaratık yakala", target: 1 }],
      rewards: [{ type: "money", amount: 260 }, { type: "item", itemId: "kristalLumaKuresi", qty: 1 }]
    },
    magaraninDerinlikleri: {
      id: "magaraninDerinlikleri", title: "Mağaranın Derinlikleri", giver: "Kaşif Mira",
      description: "Eski Taş Mağarası'ndaki kristal titreşimlerini incele.",
      objectives: [{ id: "enterCave", text: "Eski Taş Mağarası'na gir", target: 1 }, { id: "findLantern", text: "Mağara Feneri'ni al", target: 1 }],
      rewards: [{ type: "money", amount: 360 }, { type: "item", itemId: "gucluLumaKuresi", qty: 3 }]
    }
  };

  (function expandQuestBoard() {
    var quests = window.LUMA_DATA.quests;
    var maps = [
      ["lumaSehir", "Luma Şehri"], ["pazarMeydani", "Pazar Meydanı"], ["belediyeBahcesi", "Belediye Bahçesi"],
      ["lumaAkademi", "Luma Akademisi"], ["trenIstasyonu", "Tren İstasyonu"], ["liman", "Kristal Liman"],
      ["sanayi", "Sanayi Bölgesi"], ["arenaMeydan", "Arena Meydanı"], ["botanikBahce", "Botanik Bahçe"],
      ["meteorTepesi", "Meteor Tepesi"], ["kutupPatikasi", "Kutup Patikası"], ["lavKanyonu", "Lav Kanyonu"],
      ["kumruCukuru", "Kumru Çukuru"], ["sisBatakligi", "Sis Bataklığı"], ["buzulKiyi", "Buzul Kıyısı"],
      ["gokKulesi", "Gök Kulesi"], ["antikaHarabe", "Antika Harabe"], ["sahilRotasi", "Sahil Rotası"],
      ["rengarenkCayir", "Rengarenk Çayır"], ["geceKorusu", "Gece Korusu"], ["kristalMaden", "Kristal Maden"]
    ];
    var elements = ["Yaprak", "Alev", "Su", "Kaya", "Rüzgar", "Elektrik", "Gölge", "Işık"];
    var patrons = ["Muhtar", "Akademi", "Lonca", "Pazar Esnafı", "Arena", "Demiryolu", "Liman", "Korucular"];
    var templates = [
      function (i) {
        var map = maps[i % maps.length];
        return {
          title: map[1] + " Keşfi",
          giver: patrons[i % patrons.length],
          description: map[1] + " bölgesini gezip yerel kristal işaretlerini kontrol et.",
          objectives: [{ id: "visit_" + map[0], text: map[1] + " bölgesine git", target: 1 }]
        };
      },
      function (i) {
        var element = elements[i % elements.length];
        return {
          title: element + " Araştırması",
          giver: "Luma Akademisi",
          description: element + " elementli Luma davranışları için yeni gözlem kaydı gerekiyor.",
          objectives: [{ id: "catch_" + element, text: element + " elementli Luma yakala", target: 1 + i % 3 }]
        };
      },
      function (i) {
        return {
          title: "Vahşi Maç Serisi " + (i + 1),
          giver: "Arena Meydanı",
          description: "Sahadaki Luma dengesini ölçmek için vahşi karşılaşmalarda galibiyet al.",
          objectives: [{ id: "winWild", text: "Vahşi Luma savaşı kazan", target: 2 + i % 4 }]
        };
      },
      function (i) {
        return {
          title: "Şehir Vardiyası " + (i + 1),
          giver: "Meslek Panosu",
          description: "Şehir loncası kısa vardiyalar için güvenilir yardımcı arıyor.",
          objectives: [{ id: "workShift", text: "Herhangi bir meslekte vardiya çalış", target: 1 + i % 4 }]
        };
      },
      function (i) {
        return {
          title: "Luma Katalog Kaydı " + (i + 1),
          giver: "Koleksiyoncu Kulübü",
          description: "Katalog için yeni yakalama kayıtları isteniyor.",
          objectives: [{ id: "catchAny", text: "Herhangi bir Luma yakala", target: 1 + i % 5 }]
        };
      },
      function (i) {
        return {
          title: "Kazanç Defteri " + (i + 1),
          giver: "Pazar Esnafı",
          description: "Ekonomi defteri için günlük Luma para akışını canlı tut.",
          objectives: [{ id: "earnMoney", text: "Çalışma, maç veya görevlerden Luma kazan", target: 180 + i % 7 * 60 }]
        };
      }
    ];
    for (var i = 0; i < 108; i += 1) {
      var id = "sehirGorevi" + String(i + 1).padStart(3, "0");
      if (quests[id]) continue;
      var built = templates[i % templates.length](i);
      quests[id] = {
        id: id,
        title: built.title,
        giver: built.giver,
        generated: true,
        description: built.description,
        objectives: built.objectives,
        rewards: [
          { type: "money", amount: 120 + i % 9 * 35 },
          { type: "item", itemId: i % 5 === 0 ? "gucluLumaKuresi" : "lumaKuresi", qty: 1 + i % 2 }
        ]
      };
    }
    quests.sehirPasaportu = quests.sehirPasaportu || {
      id: "sehirPasaportu",
      title: "Şehir Pasaportu",
      giver: "Başkan Nermin",
      description: "Luma Şehri'ne resmen kayıt olmak için belediyede Başkan Nermin ile görüş.",
      objectives: [{ id: "talkMayor", text: "Başkan Nermin ile konuş", target: 1 }],
      rewards: [{ type: "money", amount: 300 }, { type: "item", itemId: "kristalLumaKuresi", qty: 1 }]
    };
    quests.ilkEvAnahtari = quests.ilkEvAnahtari || {
      id: "ilkEvAnahtari",
      title: "İlk Anahtar",
      giver: "Emlak Ofisi",
      description: "Şehirde kendine ait bir üs kurmak için ev kirala veya satın al.",
      objectives: [{ id: "rentHome", text: "Bir ev kirala", target: 1 }, { id: "buyHome", text: "Bir ev satın al", target: 1 }],
      rewards: [{ type: "money", amount: 450 }]
    };
  })();
})();
