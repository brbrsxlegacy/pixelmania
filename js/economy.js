(function () {
  var L = window.LUMA = window.LUMA || {};

  var avatarOptions = [
    { id: "guardian", name: "Muhafız Mavisi", price: 0 },
    { id: "ranger", name: "Korucu Yeşili", price: 60 },
    { id: "courier", name: "Kurye Kırmızısı", price: 60 },
    { id: "night", name: "Gece Moru", price: 90 },
    { id: "scholar", name: "Akademi Beyazı", price: 90 },
    { id: "ember", name: "Köz Ceketi", price: 120 },
    { id: "aqua", name: "Sahil Mavisi", price: 120 },
    { id: "crystal", name: "Kristal Zırhı", price: 160 }
  ];

  var jobs = [
    { id: "kurye", name: "Şehir Kuryesi", place: "Luma Şehri", pay: 95, objective: "work_kurye" },
    { id: "akademi", name: "Akademi Asistanı", place: "Luma Akademisi", pay: 130, objective: "work_akademi" },
    { id: "liman", name: "Liman İşçisi", place: "Kristal Liman", pay: 150, objective: "work_liman" },
    { id: "sanayi", name: "Atölye Ustası", place: "Sanayi Bölgesi", pay: 170, objective: "work_sanayi" },
    { id: "arena", name: "Arena Hakemi", place: "Arena Meydanı", pay: 190, objective: "work_arena" },
    { id: "emlak", name: "Emlak Stajyeri", place: "Pazar Meydanı", pay: 115, objective: "work_emlak" }
  ];

  var homes = [
    { id: "studio", name: "Pazar Stüdyosu", district: "Pazar Meydanı", rent: 350, buy: 2400 },
    { id: "gardenFlat", name: "Bahçe Dairesi", district: "Belediye Bahçesi", rent: 520, buy: 4200 },
    { id: "harborRoom", name: "Liman Odası", district: "Kristal Liman", rent: 460, buy: 3600 },
    { id: "academyLoft", name: "Akademi Loftu", district: "Luma Akademisi", rent: 680, buy: 6200 }
  ];

  var furniture = [
    { id: "softBed", name: "Yumuşak Yatak", price: 180, perk: "Evde uyuyunca ekibin iyileşir." },
    { id: "plantCorner", name: "Bitki Köşesi", price: 120, perk: "Evin daha sıcak görünür." },
    { id: "bookShelf", name: "Araştırma Rafı", price: 220, perk: "Lumadex notlarını toparlar." },
    { id: "lumaNest", name: "Luma Yuvası", price: 260, perk: "Yoldaşların için dinlenme alanı." },
    { id: "badgeWall", name: "Rozet Duvarı", price: 320, perk: "Lider zaferlerini sergiler." }
  ];

  var tradeGoods = [
    { id: "limanTuzu", name: "Liman Tuzu", base: 70, cheap: ["liman", "sahilRotasi"], expensive: ["sanayi", "gokKulesi"] },
    { id: "kristalCevheri", name: "Kristal Cevheri", base: 125, cheap: ["kristalMaden", "magara"], expensive: ["pazarMeydani", "lumaAkademi"] },
    { id: "akademiNotu", name: "Akademi Notu", base: 95, cheap: ["lumaAkademi"], expensive: ["belediyeBahcesi", "arenaMeydan"] },
    { id: "lavCamuru", name: "Lav Camuru", base: 110, cheap: ["lavKanyonu"], expensive: ["botanikBahce", "buzulKiyi"] },
    { id: "bahceTohumu", name: "Bahçe Tohumu", base: 82, cheap: ["botanikBahce", "belediyeBahcesi"], expensive: ["liman", "sanayi"] }
  ];

  var jobChallenges = {
    kurye: [
      { question: "Paket etiketi: batı pazar, mavi çatı. Nereye götürürsün?", choices: ["Pazar Meydanı", "Meteor Tepesi", "Gece Korusu"], answer: 0 },
      { question: "Kurye rotasında en hızlı bağlantı hangisi?", choices: ["Merkez > Pazar", "Merkez > Mağara", "Liman > Buzul"], answer: 0 }
    ],
    akademi: [
      { question: "Alev elementi genelde hangi elemente baskı kurar?", choices: ["Yaprak", "Su", "Kaya"], answer: 0 },
      { question: "Yeni bir Luma yakalanınca hangi kayıt güncellenir?", choices: ["Lumadex", "Kira defteri", "Arena zemini"], answer: 0 }
    ],
    liman: [
      { question: "Kırılgan kristal sandığı nasıl taşınır?", choices: ["Yavaş ve dengeli", "Koşarak", "Suya atarak"], answer: 0 },
      { question: "Liman vardiyasında önce ne kontrol edilir?", choices: ["Etiket", "Rozet", "Kıyafet"], answer: 0 }
    ],
    sanayi: [
      { question: "Atölyede kıvılcım görünce ilk hamle?", choices: ["Şalteri kapat", "Daha hızlı çalış", "Kapıyı kilitle"], answer: 0 },
      { question: "Kırık makine ses çıkarıyorsa ne yapılır?", choices: ["Ustaya bildir", "Yok say", "Üstüne eşya koy"], answer: 0 }
    ],
    arena: [
      { question: "Hakem olarak ilk kural?", choices: ["Bayılan Luma çekilir", "Kaçmak serbest", "İksir yasak"], answer: 0 },
      { question: "Arena maçında haksız komut duyarsan?", choices: ["Maçı durdur", "Para al", "Seyirciye sor"], answer: 0 }
    ],
    emlak: [
      { question: "Kiralanacak evde en önce ne kontrol edilir?", choices: ["Anahtar ve çıkış", "Çim rengi", "Roamer sayısı"], answer: 0 },
      { question: "Satın alınan evin avantajı nedir?", choices: ["Kalıcı üs", "Daha çok hasar", "Savaş kaçışı"], answer: 0 }
    ]
  };

  function ensureState(state) {
    state.avatar = Object.assign({ outfit: "guardian", unlocked: { guardian: true } }, state.avatar || {});
    state.avatar.unlocked = Object.assign({ guardian: true }, state.avatar.unlocked || {});
    state.jobs = Object.assign({ shifts: 0, earned: 0, completed: {}, active: null }, state.jobs || {});
    state.jobs.completed = Object.assign({}, state.jobs.completed || {});
    state.housing = Object.assign({ status: "none", homeId: null, furniture: {} }, state.housing || {});
    state.housing.furniture = Object.assign({}, state.housing.furniture || {});
    state.market = Object.assign({ goods: {}, profit: 0 }, state.market || {});
    state.market.goods = Object.assign({}, state.market.goods || {});
  }

  function findJob(jobId) {
    return jobs.find(function (j) { return j.id === jobId; });
  }

  function findHome(homeId) {
    return homes.find(function (h) { return h.id === homeId; });
  }

  function findFurniture(furnitureId) {
    return furniture.find(function (f) { return f.id === furnitureId; });
  }

  function shiftPay(state, job, correct) {
    var bonus = Math.min(70, Math.floor((state.jobs.shifts || 0) / 3) * 5);
    var pay = job.pay + bonus;
    return correct ? pay + 25 : Math.max(35, Math.floor(pay * .6));
  }

  function completeShift(game, job, correct) {
    var state = game.state;
    var pay = shiftPay(state, job, correct);
    state.money += pay;
    state.jobs.shifts += 1;
    state.jobs.earned += pay;
    state.jobs.completed[job.id] = (state.jobs.completed[job.id] || 0) + 1;
    state.jobs.active = null;
    L.Quests.progress(state, "workShift", 1);
    L.Quests.progress(state, job.objective, 1);
    L.Quests.progress(state, "earnMoney", pay);
    if (L.Daily) L.Daily.progress(state, "workShift", 1);
    game.autosaveSoon();
    return {
      ok: true,
      correct: correct,
      message: job.name + " vardiyası bitti. " + (correct ? "Tam isabet! " : "İş görüldü. ") + "+" + pay + " Luma"
    };
  }

  function challengeFor(jobId) {
    var list = jobChallenges[jobId] || jobChallenges.kurye;
    var challenge = list[Math.floor(Math.random() * list.length)];
    return {
      jobId: jobId,
      question: challenge.question,
      choices: challenge.choices.slice(),
      answer: challenge.answer,
      startedAt: Date.now()
    };
  }

  function findGood(goodId) {
    return tradeGoods.find(function (good) { return good.id === goodId; });
  }

  function priceFor(good, mapId, side) {
    var modifier = 1;
    if (good.cheap.indexOf(mapId) >= 0) modifier = .72;
    if (good.expensive.indexOf(mapId) >= 0) modifier = 1.42;
    if (side === "sell") modifier -= .12;
    return Math.max(12, Math.round(good.base * modifier));
  }

  L.Economy = {
    avatars: avatarOptions,
    jobs: jobs,
    homes: homes,
    furniture: furniture,
    tradeGoods: tradeGoods,

    ensureState: ensureState,

    tradePrice: function (goodId, mapId, side) {
      var good = findGood(goodId);
      return good ? priceFor(good, mapId, side) : 0;
    },

    buyTradeGood: function (game, goodId) {
      var state = game.state;
      ensureState(state);
      var good = findGood(goodId);
      if (!good) return { ok: false, message: "Bu ticaret ürünü bulunamadı." };
      var price = priceFor(good, game.map && game.map.id, "buy");
      if (state.money < price) return { ok: false, message: "Bu alım için yeterli Luma yok." };
      state.money -= price;
      state.market.goods[good.id] = (state.market.goods[good.id] || 0) + 1;
      game.autosaveSoon();
      return { ok: true, message: good.name + " alındı. -" + price + " Luma" };
    },

    sellTradeGood: function (game, goodId) {
      var state = game.state;
      ensureState(state);
      var good = findGood(goodId);
      if (!good) return { ok: false, message: "Bu ticaret ürünü bulunamadı." };
      if (!state.market.goods[good.id]) return { ok: false, message: "Elinde bu üründen yok." };
      var price = priceFor(good, game.map && game.map.id, "sell");
      state.market.goods[good.id] -= 1;
      state.money += price;
      state.market.profit += price;
      L.Quests.progress(state, "earnMoney", price);
      game.autosaveSoon();
      return { ok: true, message: good.name + " satıldı. +" + price + " Luma" };
    },

    setAvatar: function (game, outfit) {
      var state = game.state;
      ensureState(state);
      var option = avatarOptions.find(function (o) { return o.id === outfit; });
      if (!option) return { ok: false, message: "Bu kıyafet bulunamadı." };
      if (!state.avatar.unlocked[outfit]) {
        if (state.money < option.price) return { ok: false, message: "Bu kıyafet için yeterli Luma yok." };
        state.money -= option.price;
        state.avatar.unlocked[outfit] = true;
      }
      state.avatar.outfit = outfit;
      game.autosaveSoon();
      return { ok: true, message: option.name + " giyildi." };
    },

    work: function (game, jobId) {
      var state = game.state;
      ensureState(state);
      var job = findJob(jobId);
      if (!job) return { ok: false, message: "Bu vardiya bulunamadı." };
      return completeShift(game, job, true);
    },

    startWork: function (game, jobId) {
      var state = game.state;
      ensureState(state);
      var job = findJob(jobId);
      if (!job) return { ok: false, message: "Bu vardiya bulunamadı." };
      state.jobs.active = challengeFor(jobId);
      game.autosaveSoon();
      return { ok: true, message: job.name + " vardiyası başladı.", challenge: state.jobs.active };
    },

    finishWork: function (game, choiceIndex) {
      var state = game.state;
      ensureState(state);
      if (!state.jobs.active) return { ok: false, message: "Aktif vardiya yok." };
      var job = findJob(state.jobs.active.jobId);
      if (!job) {
        state.jobs.active = null;
        return { ok: false, message: "Bu vardiya bozulmuş, yenisini seç." };
      }
      return completeShift(game, job, Number(choiceIndex) === Number(state.jobs.active.answer));
    },

    rentHome: function (game, homeId) {
      var state = game.state;
      ensureState(state);
      var home = findHome(homeId);
      if (!home) return { ok: false, message: "Bu ev bulunamadı." };
      if (state.money < home.rent) return { ok: false, message: "Kira için yeterli Luma yok." };
      state.money -= home.rent;
      state.housing = { status: "rented", homeId: home.id, name: home.name, district: home.district, furniture: state.housing.furniture || {} };
      L.Quests.progress(state, "rentHome", 1);
      game.autosaveSoon();
      return { ok: true, message: home.name + " kiralandı." };
    },

    buyHome: function (game, homeId) {
      var state = game.state;
      ensureState(state);
      var home = findHome(homeId);
      if (!home) return { ok: false, message: "Bu ev bulunamadı." };
      if (state.money < home.buy) return { ok: false, message: "Satın almak için yeterli Luma yok." };
      state.money -= home.buy;
      state.housing = { status: "owned", homeId: home.id, name: home.name, district: home.district, furniture: state.housing.furniture || {} };
      L.Quests.progress(state, "buyHome", 1);
      game.autosaveSoon();
      return { ok: true, message: home.name + " satın alındı." };
    },

    decorateHome: function (game, furnitureId) {
      var state = game.state;
      ensureState(state);
      if (state.housing.status === "none") return { ok: false, message: "Önce bir ev kirala veya satın al." };
      var item = findFurniture(furnitureId);
      if (!item) return { ok: false, message: "Bu dekor bulunamadı." };
      if (state.housing.furniture[item.id]) return { ok: false, message: item.name + " zaten evinde." };
      if (state.money < item.price) return { ok: false, message: "Bu dekor için yeterli Luma yok." };
      state.money -= item.price;
      state.housing.furniture[item.id] = true;
      L.Quests.progress(state, "decorateHome", 1);
      game.autosaveSoon();
      return { ok: true, message: item.name + " eve yerleştirildi." };
    },

    homeName: function (state) {
      ensureState(state);
      var home = findHome(state.housing.homeId);
      return home ? home.name : (state.housing.name || "Ev");
    },

    homeInteriorId: function (state) {
      ensureState(state);
      return {
        studio: "homeStudioInterior",
        gardenFlat: "homeGardenFlatInterior",
        harborRoom: "homeHarborRoomInterior",
        academyLoft: "homeAcademyLoftInterior"
      }[state.housing.homeId] || "homeStudioInterior";
    }
  };
})();
