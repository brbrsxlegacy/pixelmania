(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  window.LUMA_DATA.npcs = {
    kraliyetKapisi: [
      { id: "nira_haritaci", name: "Haritaci Nira", type: "explorer", x: 32, y: 27, dir: "down", action: "talk", sprite: "explorer",
        dialogue: ["Yeraltı Krallığı eski haritadan cok daha buyuk. Dört nokta degil; lav, mantar, kristal, kul, buz ve kemik biyomlari birbirine bagli.", "Kapinin ortasindaki sandikta Kraliyet Haritasi var. Onu al, sonra Carsı yolunu isaretle."] },
      { id: "kapi_sifaci", name: "Kapı Sifacisi Elif", type: "healer", x: 15, y: 33, dir: "down", action: "heal", sprite: "healer",
        dialogue: ["Derine inmeden ekibini toparlayalim."] },
      { id: "kapi_tuccar", name: "Kadir", type: "shopkeeper", x: 48, y: 33, dir: "down", action: "shop", sprite: "merchant",
        dialogue: ["Yeni krallikta her biyomun huyu ayri. Iksir ve kure stoklamak iyi fikir."] },
      { id: "trainer_kapi_muhafizi", name: "Kapı Muhafızı Deniz", type: "trainer", x: 32, y: 17, dir: "down", action: "trainer", sprite: "guard",
        team: [{ creatureId: "korcik", level: 6 }, { creatureId: "iskurdu", level: 7 }], money: 150,
        dialogue: ["Kralliga giren herkes once sicak tasin ritmini ogrenmeli."], afterDialogue: ["Gecis sende. Harita sandigini unutma."] }
    ],
    lavDenizi: [
      { id: "trainer_lav_kaptani", name: "Lav Kaptani Rauf", type: "trainer", x: 31, y: 23, dir: "down", action: "trainer", sprite: "trainer",
        badgeId: "lava", badgeName: "Lav Rozeti",
        team: [{ creatureId: "kulkerten", level: 11 }, { creatureId: "tutsukanat", level: 12 }, { creatureId: "lavakurt", level: 14 }], money: 260,
        dialogue: ["Bu denizde dalga yok, kopru var. Kopruyu da ben korurum!"], afterDialogue: ["Lav Denizi yolunu taniyor artik."] },
      { id: "lav_isaretci", name: "Kopru Isaretcisi", type: "explorer", x: 13, y: 31, dir: "right", action: "talk", sprite: "explorer",
        dialogue: ["Kizil zemin vahsi Luma ceker. Siyah obsidyen kopruler daha guvenlidir."] }
    ],
    mantarOrmani: [
      { id: "trainer_mantar_suna", name: "Mantar Bekcisi Suna", type: "trainer", x: 21, y: 18, dir: "right", action: "trainer", sprite: "ranger",
        badgeId: "fungus", badgeName: "Fosfor Rozeti",
        team: [{ creatureId: "magmantar", level: 12 }, { creatureId: "cimsirik", level: 12 }, { creatureId: "korsinek", level: 13 }], money: 240,
        dialogue: ["Burasi sadece orman degil; mantarlar sicagi icinde saklar."], afterDialogue: ["Fosfor isigi sana yol verdi."] },
      { id: "mantar_toplayici", name: "Spor Toplayici Cem", type: "explorer", x: 43, y: 28, dir: "left", action: "talk", sprite: "collector",
        dialogue: ["Buyuk mantarlarin diplerini yokla. Bazen inci gibi define saklarlar."] }
    ],
    kristalNehir: [
      { id: "trainer_kristal_lina", name: "Kristalci Lina", type: "trainer", x: 31, y: 17, dir: "down", action: "trainer", sprite: "trainer2",
        badgeId: "crystal", badgeName: "Nehir Rozeti",
        team: [{ creatureId: "kristalik", level: 14 }, { creatureId: "nilperi", level: 15 }, { creatureId: "parilti", level: 15 }], money: 300,
        dialogue: ["Nehir sesi savasta bile yön gosterir."], afterDialogue: ["Kristal akisina kulak vermeyi biliyorsun."] },
      { id: "nehir_arastirmaci", name: "Akis Arastirmacisi", type: "explorer", x: 49, y: 25, dir: "left", action: "talk", sprite: "explorer",
        dialogue: ["Mavi kristaller suyu sogutur; kuzeyde Soguk Derinlik bu yüzden dogdu."] }
    ],
    obsidyenCarsisi: [
      { id: "carsı_sifaci", name: "Carsı Sifacisi", type: "healer", x: 17, y: 31, dir: "down", action: "heal", sprite: "healer",
        dialogue: ["Carsiya gelen yolcu once nefeslenir."] },
      { id: "carsı_tuccar", name: "Obsidyen Esnafi Kadir", type: "shopkeeper", x: 48, y: 31, dir: "down", action: "shop", sprite: "merchant",
        dialogue: ["Define satarsan yeni kure alirsin; krallik ekonomisi boyle donuyor."] },
      { id: "yer_alti_panosu", name: "Yeraltı Panosu", type: "board", x: 31, y: 22, dir: "down", action: "quest_board", sprite: "sign",
        dialogue: ["Carsı panosunda yeni biyom devriyeleri var."] },
      { id: "trainer_carsi_usta", name: "Carsı Ustasi Melis", type: "trainer", x: 32, y: 15, dir: "down", action: "trainer", sprite: "trainer",
        badgeId: "market", badgeName: "Obsidyen Rozeti",
        team: [{ creatureId: "tasburun", level: 15 }, { creatureId: "kulkerten", level: 16 }, { creatureId: "magmerten", level: 17 }], money: 340,
        dialogue: ["Obsidyen sadece taş degil; sicagi tutan hafiza."], afterDialogue: ["Carsı muhru sana yakisti."] }
    ],
    kulBahcesi: [
      { id: "trainer_kul_bahcivan", name: "Kul Bahcivani Ilay", type: "trainer", x: 36, y: 25, dir: "left", action: "trainer", sprite: "ranger",
        badgeId: "ash", badgeName: "Kul Rozeti",
        team: [{ creatureId: "iskurdu", level: 13 }, { creatureId: "magmantar", level: 15 }, { creatureId: "agackulak", level: 15 }], money: 280,
        dialogue: ["Kulun altinda yeni hayat cikar. Bakalim senin takim da cikacak mi?"], afterDialogue: ["Kul Bahcesi seni kabul etti."] },
      { id: "kul_yaziti", name: "Kul Yaziti", type: "sign", x: 18, y: 16, dir: "down", action: "talk", sprite: "sign",
        dialogue: ["Yazıt: Biyom Pusulasi kulde kararir, kristalde parlar."] }
    ],
    kemikKumlari: [
      { id: "trainer_kemik_arda", name: "Kemik İzci Arda", type: "trainer", x: 24, y: 22, dir: "right", action: "trainer", sprite: "guard",
        badgeId: "bone", badgeName: "Kemik Rozeti",
        team: [{ creatureId: "tasburun", level: 16 }, { creatureId: "golgemir", level: 17 }, { creatureId: "volkobra", level: 18 }], money: 360,
        dialogue: ["Kum burada sicak degil, eski. Eski seyler de dislidir."], afterDialogue: ["Kemik Anahtari'na giden izleri gordun."] },
      { id: "kemik_defineci", name: "Defineci Sera", type: "explorer", x: 45, y: 30, dir: "left", action: "talk", sprite: "collector",
        dialogue: ["Mahzene giden anahtar kemiklerin arasinda. Sandiklari ve gizli noktalari yokla."] }
    ],
    buzulMagara: [
      { id: "trainer_buzul_ece", name: "Soguk Derinlik Ece", type: "trainer", x: 31, y: 18, dir: "down", action: "trainer", sprite: "trainer2",
        badgeId: "frost", badgeName: "Buzul Rozeti",
        team: [{ creatureId: "nilperi", level: 18 }, { creatureId: "kristalik", level: 19 }, { creatureId: "luma035", level: 20 }], money: 420,
        dialogue: ["Yanardagin icinde buz olur mu? Krallikta her sey olur."], afterDialogue: ["Soguk Derinlik artık rotanda."] },
      { id: "buzul_notcu", name: "Titreyen Not", type: "sign", x: 42, y: 25, dir: "down", action: "talk", sprite: "sign",
        dialogue: ["Not: Kristal Nehir'in kuzeyi donar; Prime Ocagi'nin batisi cozer."] }
    ],
    primeOcagi: [
      { id: "trainer_prime_muhafiz", name: "Prime Muhafizi İdil", type: "trainer", x: 31, y: 18, dir: "down", action: "trainer", sprite: "trainer2",
        prime: true, primeIndex: 2, boss: true, badgeId: "prime", badgeName: "Prime Rozeti", questObjective: "beatPrimeWarden",
        team: [{ creatureId: "lavakurt", level: 21 }, { creatureId: "magmerten", level: 22 }, { creatureId: "lavagon", level: 24 }], money: 680,
        dialogue: ["Prime Ocagi bag olmadan parlamaz. Bagini kanitla."], afterDialogue: ["Prime Ocagi senin ismini hatirlayacak. Kuzey yolu acik."] },
      { id: "prime_yaziti", name: "Prime Yaziti", type: "sign", x: 31, y: 23, dir: "down", action: "talk", sprite: "sign",
        dialogue: ["Yazıt: Prime, mega degil; kralligin kendi kor adidir. Savas basina bir kez parlar."] }
    ],
    defineMahzeni: [
      { id: "trainer_mahzen_bora", name: "Mahzenci Bora", type: "trainer", x: 34, y: 22, dir: "left", action: "trainer", sprite: "collector",
        team: [{ creatureId: "golgemir", level: 19 }, { creatureId: "kristalik", level: 20 }, { creatureId: "volkobra", level: 21 }], money: 440,
        dialogue: ["Define mahzeninde en agir sandigi en sessiz Luma korur."], afterDialogue: ["Sessizlik bozuldu; sandiklar sana kaldi."] }
    ],
    tahtSalonu: [
      { id: "trainer_taht_muhafiz", name: "Taht Muhafizi Varkan", type: "trainer", x: 31, y: 17, dir: "down", action: "trainer", sprite: "guard",
        prime: true, primeIndex: 2, boss: true, badgeId: "crown", badgeName: "Taht Rozeti", questObjective: "beatUnderworldCrown",
        team: [{ creatureId: "alevanka", level: 25 }, { creatureId: "obsidikurt", level: 27 }, { creatureId: "volkobra", level: 29 }], money: 980,
        dialogue: ["Yeraltı Krallığı'nin tacini isteyen önce lavin sesini susturur."], afterDialogue: ["Taht seni dusman degil, kaşif olarak tanidi."] },
      { id: "taht_nira", name: "Haritaci Nira", type: "explorer", x: 25, y: 26, dir: "right", action: "talk", sprite: "explorer",
        dialogue: ["Bu salon eski oyundaki dort noktanin cok otesinde. Artik kralligin haritasi gercekten nefes aliyor."] }
    ]
  };
})();
