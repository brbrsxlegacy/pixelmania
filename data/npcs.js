(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  window.LUMA_DATA.npcs = {
    isikpinar: [
      { id: "liora", name: "Profesör Liora", type: "professor", x: 24, y: 18, dir: "down", action: "professor", sprite: "professor",
        dialogue: ["Günaydın! Kristaller bugün çok canlı. Laboratuvara uğra; sana uygun bir yol arkadaşı seçelim.", "Yaratıklarla bağ kurmak güçten önce sabır ister."] },
      { id: "belgin", name: "Muhtar Belgin", type: "elder", x: 15, y: 21, dir: "right", action: "quest_kayipKristal", sprite: "elder",
        dialogue: ["Köy kuyusunun Parlak Kristal'i kayıp. Yeşilova Yolu'na bakabilir misin?", "Kristal köyün gece lambası gibidir; onsuz meydan sönük kalır."] },
      { id: "healer", name: "Şifacı Duru", type: "healer", x: 20, y: 28, dir: "down", action: "heal", sprite: "healer",
        dialogue: ["Yorgun görünüyorsunuz. Şifa ışıkları birazdan ekibini toparlar."] },
      { id: "shopkeeper", name: "Esnaf Kadir", type: "shopkeeper", x: 32, y: 25, dir: "left", action: "shop", sprite: "merchant",
        dialogue: ["Çantanda boş yer varsa birkaç Luma Küresi iyi gider."] },
      { id: "child_ada", name: "Ada", type: "child", x: 29, y: 16, dir: "down", action: "talk", sprite: "child",
        dialogue: ["Ben büyüyünce Parıltı yakalayacağım! Ama önce annem koşmamı yasaklamayı bırakmalı."] },
      { id: "traveler_efe", name: "Gezgin Efe", type: "traveler", x: 10, y: 30, dir: "right", action: "talk", sprite: "traveler",
        dialogue: ["F5 hızlı kayıt, F9 hızlı yükleme. Eski gezgin numarasıdır, hayat kurtarır."] }
    ],
    yesilova: [
      { id: "trainer_pelin", name: "Yolcu Pelin", type: "trainer", x: 24, y: 18, dir: "left", action: "trainer", sprite: "trainer",
        team: [{ creatureId: "cimsirik", level: 4 }, { creatureId: "minsu", level: 4 }], money: 90,
        dialogue: ["Yeşilova'da ilk kural: Uzun otlara hazırlıksız girme!"], afterDialogue: ["Güzel maçtı. Otlar seni artık tanıyordur."] },
      { id: "collector_onur", name: "Koleksiyoncu Onur", type: "collector", x: 38, y: 15, dir: "down", action: "talk", sprite: "collector",
        dialogue: ["Parıltılı varyasyonlar çok nadirdir. Renkleri farklıdır ve yakalanınca kayıtta yıldızla görünür."] },
      { id: "sign_road", name: "Yol Tabelası", type: "sign", x: 8, y: 20, dir: "down", action: "talk", sprite: "sign",
        dialogue: ["Batı: Işıkpınar Köyü. Doğu: Fısıltı Ormanı. Güney: Kristal Göl."] }
    ],
    fisilti: [
      { id: "ranger_selin", name: "Korucu Selin", type: "ranger", x: 18, y: 20, dir: "down", action: "quest_ormandakiSes", sprite: "ranger",
        dialogue: ["Ağaçlar bu sabah başka fısıldıyor. Kuzey açıklıkta gölgeli bir yaratık görüldü.", "Ormanda yürürken çiçeklerin yönüne bak; güvenli patikayı gösterirler."] },
      { id: "trainer_arda", name: "Korucu Arda", type: "trainer", x: 34, y: 22, dir: "left", action: "trainer", sprite: "trainer2",
        team: [{ creatureId: "ruzgocuk", level: 7 }, { creatureId: "agackulak", level: 8 }], money: 140, questObjective: "defeatForestTrainer",
        dialogue: ["Sesin peşindeysen önce ritmini görelim!"], afterDialogue: ["Tamam, orman sana geçiş verdi."] },
      { id: "hermit_oya", name: "Oya Nine", type: "elder", x: 45, y: 12, dir: "left", action: "talk", sprite: "elder",
        dialogue: ["Kök Kapanı hızlı yaratıkları yavaşlatır. Sabırlı olan kazanır yavrum."] },
      { id: "kid_mert", name: "Mert", type: "child", x: 12, y: 32, dir: "up", action: "talk", sprite: "child",
        dialogue: ["Ağaçların arkasına saklanmış eşyalar var. Her parıltıya bak!"] }
    ],
    kristalGol: [
      { id: "fisher_nadir", name: "Balıkçı Nadir", type: "fisher", x: 20, y: 19, dir: "right", action: "quest_golKenariGizemi", sprite: "fisher",
        dialogue: ["Göl halkaları Nilperi'nin dansı olabilir. Su elementli bir dost yakalarsan ışığın dilini anlarsın."] },
      { id: "trainer_deniz", name: "Kıyı Deniz", type: "trainer", x: 34, y: 26, dir: "up", action: "trainer", sprite: "trainer",
        team: [{ creatureId: "nilperi", level: 9 }, { creatureId: "voltik", level: 8 }], money: 160,
        dialogue: ["Köprüden geçen herkes dalga sesini duymalı!"], afterDialogue: ["Dalgaların ritmini yakaladın."] },
      { id: "traveler_lale", name: "Lale", type: "traveler", x: 44, y: 15, dir: "left", action: "talk", sprite: "traveler",
        dialogue: ["Mağara yolu doğuda. İçerisi serin, ama kristaller yolu aydınlatıyor."] }
    ],
    magara: [
      { id: "explorer_mira", name: "Kaşif Mira", type: "explorer", x: 15, y: 16, dir: "down", action: "quest_magara", sprite: "explorer",
        dialogue: ["Mağaranın nabzı hızlandı. Feneri bulursan derinlere güvenle inebiliriz."] },
      { id: "trainer_kaya", name: "Taşçı Kaya", type: "trainer", x: 34, y: 20, dir: "left", action: "trainer", sprite: "trainer2",
        team: [{ creatureId: "tasburun", level: 10 }, { creatureId: "kristalik", level: 11 }], money: 210,
        dialogue: ["Taş sessizdir ama maçı serttir!"], afterDialogue: ["Kristaller bile alkışladı sanki."] },
      { id: "rival_arven_cave", name: "Arven", type: "rival", x: 45, y: 30, dir: "left", action: "rival_late", sprite: "rival",
        dialogue: ["Yine mi buradasın? Güzel. Demek final ışığını beraber göreceğiz."] }
    ]
  };
})();
