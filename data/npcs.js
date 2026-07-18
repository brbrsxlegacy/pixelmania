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
    labInterior: [
      { id: "liora_lab", name: "Profesör Liora", type: "professor", x: 8, y: 6, dir: "down", action: "professor", sprite: "professor",
        dialogue: ["Laboratuvara hoş geldin! Işık masasındaki üç yoldaştan birini seçebilirsin.", "Başlangıç seçimin yolculuğunun tonunu belirler, ama ekip dengesi sonradan kurulur."] }
    ],
    houseBlueInterior: [
      { id: "ada_home", name: "Ada", type: "child", x: 5, y: 6, dir: "right", action: "talk", sprite: "child",
        dialogue: ["Evimize hoş geldin! Annem çizmelerimi sakladı ama ben yine de maceraya hazırlanıyorum."] }
    ],
    houseRedInterior: [
      { id: "belgin_home", name: "Muhtar Belgin", type: "elder", x: 6, y: 6, dir: "right", action: "quest_kayipKristal", sprite: "elder",
        dialogue: ["Kayıp kristal meselesi hâlâ aklımda. Yeşilova Yolu'nu kontrol etmeyi unutma."] }
    ],
    clinicInterior: [
      { id: "healer_clinic", name: "Şifacı Duru", type: "healer", x: 8, y: 6, dir: "down", action: "heal", sprite: "healer",
        dialogue: ["Revir güvenli. Ekibini iyileştirip seni kapının önündeki güvenli noktaya kaydederim."] }
    ],
    shopInterior: [
      { id: "shopkeeper_inside", name: "Esnaf Kadir", type: "shopkeeper", x: 9, y: 5, dir: "down", action: "shop", sprite: "merchant",
        dialogue: ["Rafları yeni dizdim. Luma Küresi stokları taze!"] }
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

  (function addCityNpcs() {
    var npcs = window.LUMA_DATA.npcs;
    function creatureByElement(element, offset) {
      var ids = Object.keys(window.LUMA_DATA.creatures || {}).filter(function (id) {
        var c = window.LUMA_DATA.creatures[id];
        return c && !c.starter && c.element === element;
      });
      return ids.length ? ids[offset % ids.length] : "cimsirik";
    }
    npcs.lumaSehir = [
      { id: "city_guide", name: "Şehir Rehberi İpek", type: "traveler", x: 30, y: 26, dir: "down", action: "talk", sprite: "clerk",
        dialogue: ["Luma Şehri'ne hoş geldin. Batıda pazar, doğuda akademi, kuzeyde belediye var.", "Pano görevleri, meslekler ve görünen Luma'lar burada oyunun kalbidir."] },
      { id: "city_quest_board", name: "Şehir Görev Panosu", type: "board", x: 39, y: 29, dir: "down", action: "quest_board", sprite: "sign",
        dialogue: ["Pano yeni görevlerle dolu. Aynı anda birkaç iş almak iyi fikir."] },
      { id: "city_job_board", name: "Meslek Panosu", type: "board", x: 20, y: 30, dir: "down", action: "job_board", sprite: "sign",
        dialogue: ["Bugünkü vardiyalar hazır: kurye, araştırmacı, liman işçisi, arena hakemi ve daha fazlası."] }
    ];
    npcs.pazarMeydani = [
      { id: "stylist_mina", name: "Stilist Mina", type: "stylist", x: 10, y: 13, dir: "down", action: "avatar_shop", sprite: "stylist",
        dialogue: ["Tarzını yenileyelim mi? Kıyafet değişimi ücretsiz; şehirde görünüş de maceranın parçası."] },
      { id: "broker_taner", name: "Emlakçı Taner", type: "broker", x: 46, y: 14, dir: "down", action: "real_estate", sprite: "broker",
        dialogue: ["Kiralık stüdyo da var, satın alınacak daire de. Anahtarın olunca şehirde bir üssün olur."] },
      { id: "market_kadir", name: "Pazar Kadir", type: "shopkeeper", x: 47, y: 25, dir: "left", action: "shop", sprite: "merchant",
        dialogue: ["Şehir stokları geniştir. Uzun keşfe çıkmadan kürelerini tamamla."] }
    ];
    npcs.belediyeBahcesi = [
      { id: "mayor_nermin", name: "Başkan Nermin", type: "mayor", x: 31, y: 14, dir: "down", action: "mayor", sprite: "mayor",
        dialogue: ["Luma Şehri'ne resmi kaydını açalım. Çalış, görev al, evini kur; şehir yaşayan oyuncuyu sever."] },
      { id: "belediye_board", name: "Belediye Panosu", type: "board", x: 49, y: 28, dir: "down", action: "quest_board", sprite: "sign",
        dialogue: ["Belediye işleri: keşif, yakalama, vardiya ve bölge raporu."] }
    ];
    npcs.lumaAkademi = [
      { id: "akademi_aylin", name: "Araştırmacı Aylin", type: "collector", x: 28, y: 29, dir: "down", action: "quest_board", sprite: "collector",
        dialogue: ["Akademi panosu yeni Luma kayıtları istiyor. Katalog büyüdükçe şehir de büyür."] },
      { id: "trainer_akademi", name: "Öğrenci Bora", type: "trainer", x: 43, y: 22, dir: "left", action: "trainer", sprite: "trainer",
        team: [{ creatureId: creatureByElement("Elektrik", 3), level: 12 }, { creatureId: creatureByElement("Işık", 4), level: 12 }], money: 220,
        dialogue: ["Akademide teori biterse sıra pratiğe gelir!"], afterDialogue: ["Notlarımı güncellemem lazım."] }
    ];
    npcs.trenIstasyonu = [
      { id: "station_worker", name: "Makinist Rıza", type: "worker", x: 44, y: 30, dir: "left", action: "job_board", sprite: "worker",
        dialogue: ["Ray kontrol vardiyası kısa sürer ama iyi kazandırır."] }
    ];
    npcs.liman = [
      { id: "port_worker", name: "Liman Ustası Selma", type: "worker", x: 27, y: 30, dir: "up", action: "job_board", sprite: "worker",
        dialogue: ["Sandık taşımak basit iştir; dikkatli olan daha çok kazanır."] }
    ];
    npcs.sanayi = [
      { id: "factory_master", name: "Usta Cem", type: "worker", x: 29, y: 30, dir: "up", action: "job_board", sprite: "worker",
        dialogue: ["Atölye vardiyası için sağlam bot ve sağlam sabır yeter."] }
    ];
    npcs.arenaMeydan = [
      { id: "arena_board", name: "Arena Panosu", type: "board", x: 46, y: 29, dir: "down", action: "quest_board", sprite: "sign",
        dialogue: ["Maç serileri ve vahşi Luma denge görevleri burada yayınlanır."] },
      { id: "arena_guard", name: "Arena Gözcüsü Tuna", type: "trainer", x: 32, y: 24, dir: "down", action: "trainer", sprite: "guard",
        team: [{ creatureId: creatureByElement("Alev", 5), level: 15 }, { creatureId: creatureByElement("Kaya", 6), level: 15 }], money: 260,
        dialogue: ["Arena meydanına adım atan ritmini göstermeli."], afterDialogue: ["Geçiş sende."] }
    ];
    [
      ["botanikBahce", "Botanikçi Nehir", "Yaprak", 13],
      ["rengarenkCayir", "Gezgin Lalin", "Rüzgar", 14],
      ["geceKorusu", "Gececi Doruk", "Gölge", 16],
      ["sisBatakligi", "Sis Korucusu Ece", "Su", 17],
      ["meteorTepesi", "Meteorcu Baran", "Elektrik", 16],
      ["lavKanyonu", "Kanyoncu İdil", "Alev", 19],
      ["kumruCukuru", "Çölcü Kaan", "Kaya", 18],
      ["kristalMaden", "Madenci Sarp", "Kaya", 21],
      ["sahilRotasi", "Sahilci Defne", "Su", 15],
      ["buzulKiyi", "Buzulcu Nisa", "Su", 20],
      ["gokKulesi", "Kuleci Alp", "Rüzgar", 20],
      ["antikaHarabe", "Harabeci Mine", "Gölge", 17],
      ["kutupPatikasi", "Kutupçu Eren", "Elektrik", 19]
    ].forEach(function (row, index) {
      if (!npcs[row[0]]) npcs[row[0]] = [];
      npcs[row[0]].push({
        id: "trainer_" + row[0],
        name: row[1],
        type: "trainer",
        x: 32 + index % 3 * 4,
        y: 18 + index % 4,
        dir: index % 2 ? "left" : "down",
        action: "trainer",
        sprite: index % 2 ? "trainer2" : "trainer",
        team: [
          { creatureId: creatureByElement(row[2], index + 2), level: row[3] },
          { creatureId: creatureByElement(row[2], index + 8), level: row[3] + 1 }
        ],
        money: 180 + row[3] * 12,
        dialogue: ["Bu bölgenin Luma'ları kolay kolay yabancı sevmez. Önce benimle ısın."],
        afterDialogue: ["Tamam, bölge seni tanıdı."]
      });
    });
    [
      ["botanikBahce", "Lider Defne", "leaf", "Yaprak Rozeti", "Yaprak", 22, "ranger"],
      ["lavKanyonu", "Lider Koray", "ember", "Alev Rozeti", "Alev", 24, "trainer2"],
      ["sahilRotasi", "Lider Derya", "tide", "Su Rozeti", "Su", 23, "fisher"],
      ["kristalMaden", "Lider Sarp", "stone", "Kaya Rozeti", "Kaya", 27, "explorer"],
      ["gokKulesi", "Lider Alp", "wind", "Rüzgar Rozeti", "Rüzgar", 28, "trainer"],
      ["meteorTepesi", "Lider Baran", "spark", "Elektrik Rozeti", "Elektrik", 26, "worker"],
      ["geceKorusu", "Lider Mine", "shadow", "Gölge Rozeti", "Gölge", 25, "collector"],
      ["arenaMeydan", "Lider Nermin", "light", "Işık Rozeti", "Işık", 30, "mayor"]
    ].forEach(function (row, index) {
      if (!npcs[row[0]]) npcs[row[0]] = [];
      npcs[row[0]].push({
        id: "boss_" + row[2],
        name: row[1],
        type: "trainer",
        boss: true,
        badgeId: row[2],
        badgeName: row[3],
        x: index % 2 ? 35 : 31,
        y: 13 + index % 3 * 3,
        dir: "down",
        action: "trainer",
        sprite: row[6],
        team: [
          { creatureId: creatureByElement(row[4], index + 11), level: row[5] },
          { creatureId: creatureByElement(row[4], index + 19), level: row[5] + 1 },
          { creatureId: creatureByElement(row[4], index + 27), level: row[5] + 2 }
        ],
        money: 520 + index * 90,
        dialogue: [row[3] + " için önce ritmini göster. Bu maç bölgenin gerçek sınavı."],
        afterDialogue: [row[3] + " sende. Şehir seni artık liderler listesinde konuşuyor."]
      });
    });
    [
      ["bossArena_leaf", "Lider Defne", "leaf", "Yaprak Rozeti", "Yaprak", 22, "ranger"],
      ["bossArena_ember", "Lider Koray", "ember", "Alev Rozeti", "Alev", 24, "trainer2"],
      ["bossArena_tide", "Lider Derya", "tide", "Su Rozeti", "Su", 23, "fisher"],
      ["bossArena_stone", "Lider Sarp", "stone", "Kaya Rozeti", "Kaya", 27, "explorer"],
      ["bossArena_wind", "Lider Alp", "wind", "Rüzgar Rozeti", "Rüzgar", 28, "trainer"],
      ["bossArena_spark", "Lider Baran", "spark", "Elektrik Rozeti", "Elektrik", 26, "worker"],
      ["bossArena_shadow", "Lider Mine", "shadow", "Gölge Rozeti", "Gölge", 25, "collector"],
      ["bossArena_light", "Lider Nermin", "light", "Işık Rozeti", "Işık", 30, "mayor"]
    ].forEach(function (row, index) {
      if (!npcs[row[0]]) npcs[row[0]] = [];
      npcs[row[0]].push({
        id: "boss_" + row[2],
        name: row[1],
        type: "trainer",
        boss: true,
        badgeId: row[2],
        badgeName: row[3],
        x: 8,
        y: 5,
        dir: "down",
        action: "trainer",
        sprite: row[6],
        team: [
          { creatureId: creatureByElement(row[4], index + 11), level: row[5] },
          { creatureId: creatureByElement(row[4], index + 19), level: row[5] + 1 },
          { creatureId: creatureByElement(row[4], index + 27), level: row[5] + 2 }
        ],
        money: 520 + index * 90,
        dialogue: [row[3] + " arena sınavı başlıyor. Hazırsan ritmini göster."],
        afterDialogue: [row[3] + " sende. Bu arenada iz bıraktın."]
      });
    });
  })();
})();
