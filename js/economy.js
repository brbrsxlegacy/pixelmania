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

  function ensureState(state) {
    state.avatar = Object.assign({ outfit: "guardian", unlocked: { guardian: true } }, state.avatar || {});
    state.avatar.unlocked = Object.assign({ guardian: true }, state.avatar.unlocked || {});
    state.jobs = Object.assign({ shifts: 0, earned: 0, completed: {} }, state.jobs || {});
    state.housing = Object.assign({ status: "none", homeId: null }, state.housing || {});
  }

  L.Economy = {
    avatars: avatarOptions,
    jobs: jobs,
    homes: homes,

    ensureState: ensureState,

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
      var job = jobs.find(function (j) { return j.id === jobId; });
      if (!job) return { ok: false, message: "Bu vardiya bulunamadı." };
      var bonus = Math.min(70, Math.floor((state.jobs.shifts || 0) / 3) * 5);
      var pay = job.pay + bonus;
      state.money += pay;
      state.jobs.shifts += 1;
      state.jobs.earned += pay;
      state.jobs.completed[job.id] = (state.jobs.completed[job.id] || 0) + 1;
      L.Quests.progress(state, "workShift", 1);
      L.Quests.progress(state, job.objective, 1);
      L.Quests.progress(state, "earnMoney", pay);
      game.autosaveSoon();
      return { ok: true, message: job.name + " vardiyası bitti. +" + pay + " Luma" };
    },

    rentHome: function (game, homeId) {
      var state = game.state;
      ensureState(state);
      var home = homes.find(function (h) { return h.id === homeId; });
      if (!home) return { ok: false, message: "Bu ev bulunamadı." };
      if (state.money < home.rent) return { ok: false, message: "Kira için yeterli Luma yok." };
      state.money -= home.rent;
      state.housing = { status: "rented", homeId: home.id, name: home.name, district: home.district };
      L.Quests.progress(state, "rentHome", 1);
      game.autosaveSoon();
      return { ok: true, message: home.name + " kiralandı." };
    },

    buyHome: function (game, homeId) {
      var state = game.state;
      ensureState(state);
      var home = homes.find(function (h) { return h.id === homeId; });
      if (!home) return { ok: false, message: "Bu ev bulunamadı." };
      if (state.money < home.buy) return { ok: false, message: "Satın almak için yeterli Luma yok." };
      state.money -= home.buy;
      state.housing = { status: "owned", homeId: home.id, name: home.name, district: home.district };
      L.Quests.progress(state, "buyHome", 1);
      game.autosaveSoon();
      return { ok: true, message: home.name + " satın alındı." };
    }
  };
})();
