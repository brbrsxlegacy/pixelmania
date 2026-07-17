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
})();
