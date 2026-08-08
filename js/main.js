(function () {
  var L = window.LUMA = window.LUMA || {};

  L.Ads = L.Ads || {};

  function getSlot(id) {
    return document.getElementById(id);
  }

  function hasFilledAd(slot) {
    if (!slot) return false;
    var unit = slot.querySelector("ins.adsbygoogle");
    if (!unit) return false;
    return unit.getAttribute("data-ad-status") === "filled" || !!slot.querySelector("iframe");
  }

  L.Ads.showSlot = function (id) {
    var slot = getSlot(id);
    if (!slot) return false;
    slot.classList.remove("hidden");
    return true;
  };

  L.Ads.hideSlot = function (id) {
    var slot = getSlot(id);
    if (!slot) return false;
    slot.classList.add("hidden");
    return true;
  };

  L.Ads.showResultSlot = function () {
    return L.Ads.showSlot("ad-result");
  };

  L.Ads.hideResultSlot = function () {
    return L.Ads.hideSlot("ad-result");
  };

  L.Ads.markLoaded = function (id) {
    var slot = getSlot(id);
    if (!slot) return;
    slot.classList.remove("hidden");
    slot.setAttribute("data-ad-loaded", "true");
  };

  L.Ads.markFailed = function (id) {
    var slot = getSlot(id);
    if (!slot) return;
    slot.removeAttribute("data-ad-loaded");
    slot.classList.add("hidden");
  };

  L.Ads.prepareSlot = function (slot) {
    if (!slot) return;

    var unit = slot.querySelector("ins.adsbygoogle");
    if (!unit) return;

    var placeholder = slot.querySelector(".ad-placeholder");
    if (placeholder) placeholder.classList.add("hidden");

    function syncStatus() {
      var status = unit.getAttribute("data-ad-status");
      if (status === "unfilled") {
        L.Ads.markFailed(slot.id);
        return;
      }
      if (status === "filled" || hasFilledAd(slot)) L.Ads.markLoaded(slot.id);
    }

    syncStatus();

    if (window.MutationObserver) {
      var observer = new MutationObserver(syncStatus);
      observer.observe(unit, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ["data-ad-status", "style"]
      });
    }

    setTimeout(function () {
      if (!hasFilledAd(slot)) L.Ads.markFailed(slot.id);
    }, 12000);
  };

  L.Ads.init = function () {
    var slots = document.querySelectorAll(".ad-container");
    for (var i = 0; i < slots.length; i += 1) L.Ads.prepareSlot(slots[i]);
  };

  // Gerçek ödüllü reklam sağlayıcısı bağlandığında bu fonksiyon değiştirilir.
  // callback yalnızca reklam gerçekten tamamlanıp ödül hak edildiğinde çağrılmalıdır.
  window.showRewardedAd = window.showRewardedAd || function (callback) {
    return Promise.resolve({
      shown: false,
      rewarded: false,
      reason: "placeholder",
      onReward: typeof callback === "function" ? callback : null
    });
  };

  function registerCrateCreatures() {
    if (!window.LUMA_DATA || !window.LUMA_DATA.creatures || !L.Creatures) return;
    var data = window.LUMA_DATA.creatures;
    var additions = {
      astralya: {
        id: "astralya", name: "Astralya", element: "Işık", rarity: "Kasa Özel", crateExclusive: true, captureDifficulty: 76,
        baseStats: { hp: 48, attack: 17, defense: 13, speed: 18 },
        abilities: ["isikHalesi", "safakPatlamasi", "hizKanadi", "inciAkimi"],
        description: "Gökyüzü kristallerinden doğduğu söylenen yıldız biçimli çok nadir bir Luma.",
        evolution: null,
        sprite: { body: "star", mark: "gem", colors: ["#6f63d8", "#fff2a8", "#f2d86b"] }
      },
      voltaris: {
        id: "voltaris", name: "Voltaris", element: "Elektrik", rarity: "Kasa Özel", crateExclusive: true, captureDifficulty: 78,
        baseStats: { hp: 46, attack: 19, defense: 12, speed: 20 },
        abilities: ["voltKivilcimi", "simsekZiplamasi", "hizKanadi", "ruzgarKesisi"],
        description: "Fırtına bulutlarını takip eden, sırtında parlak enerji izleri taşıyan hızlı bir kurt Luma.",
        evolution: null,
        sprite: { body: "wolf", mark: "stripes", colors: ["#28364f", "#f3cf3f", "#9de8e6"] }
      },
      noctyra: {
        id: "noctyra", name: "Noctyra", element: "Gölge", rarity: "Kasa Özel", crateExclusive: true, captureDifficulty: 79,
        baseStats: { hp: 50, attack: 18, defense: 15, speed: 16 },
        abilities: ["golgeIsirigi", "gecePerdesi", "hizKanadi", "safakPatlamasi"],
        description: "Gece kulelerinin tepesinde sessizce bekleyen maskeli baykuş Luma.",
        evolution: null,
        sprite: { body: "owl", mark: "mask", colors: ["#25243f", "#7a63d8", "#c8c6ff"] }
      }
    };

    Object.keys(additions).forEach(function (id) {
      if (data[id]) return;
      data[id] = additions[id];
      L.Creatures.list.push(additions[id]);
    });
  }

  function ensureRewardState(state) {
    if (!state) return null;
    state.adRewards = state.adRewards && typeof state.adRewards === "object" ? state.adRewards : {};
    state.adRewards.legendary = state.adRewards.legendary && typeof state.adRewards.legendary === "object" ? state.adRewards.legendary : {};
    state.adRewards.legendary.watched = Math.max(0, Math.min(1, Number(state.adRewards.legendary.watched) || 0));
    return state.adRewards.legendary;
  }

  L.AdEconomy = L.AdEconomy || {};
  L.AdEconomy.crates = [
    { id: "luma", name: "Luma Kasası", cost: 2, tier: "luma", description: "Luma ve yakalama küreleri verir." },
    { id: "crystal", name: "Kristal Kasa", cost: 5, tier: "crystal", description: "Daha büyük para, kristal ve yumurta verir." },
    { id: "legend", name: "Efsane Kasa", cost: 10, tier: "legend", description: "Kasa-özel Astralya, Voltaris veya Noctyra verir." }
  ];

  L.AdEconomy.ensureState = function (state) {
    if (!state) return null;
    state.adEconomy = state.adEconomy && typeof state.adEconomy === "object" ? state.adEconomy : {};
    state.adEconomy.coins = Math.max(0, Math.floor(Number(state.adEconomy.coins) || 0));
    state.adEconomy.lifetimeCoins = Math.max(state.adEconomy.coins, Math.floor(Number(state.adEconomy.lifetimeCoins) || 0));
    state.adEconomy.cratesOpened = Math.max(0, Math.floor(Number(state.adEconomy.cratesOpened) || 0));
    return state.adEconomy;
  };

  L.AdEconomy.grantCoin = function (game) {
    var wallet = L.AdEconomy.ensureState(game && game.state);
    if (!wallet) return false;
    wallet.coins += 1;
    wallet.lifetimeCoins += 1;
    if (game.autosaveSoon) game.autosaveSoon();
    return true;
  };

  L.AdEconomy.openCrate = function (game, crateId) {
    if (!game || !game.state) return { ok: false, message: "Oyun kaydı hazır değil." };
    var crate = L.AdEconomy.crates.filter(function (entry) { return entry.id === crateId; })[0];
    if (!crate) return { ok: false, message: "Kasa bulunamadı." };
    var wallet = L.AdEconomy.ensureState(game.state);
    if (wallet.coins < crate.cost) return { ok: false, message: crate.name + " için " + crate.cost + " Reklam Coini gerekiyor." };

    wallet.coins -= crate.cost;
    wallet.cratesOpened += 1;

    if (crate.id === "luma") {
      var money = 180 + Math.floor(Math.random() * 121);
      game.state.money += money;
      if (L.Inventory) L.Inventory.add(game.state, "lumaKuresi", 2);
      if (game.autosaveSoon) game.autosaveSoon();
      return { ok: true, message: crate.name + " açıldı: +" + money + " Luma ve 2 Luma Küresi." };
    }

    if (crate.id === "crystal") {
      var crystalMoney = 360 + Math.floor(Math.random() * 181);
      game.state.money += crystalMoney;
      if (L.Progression && L.Progression.ensureState) L.Progression.ensureState(game.state);
      if (game.state.resources) game.state.resources.crystal = (game.state.resources.crystal || 0) + 2;
      if (L.Eggs) L.Eggs.grant(game, null, "Kristal Kasa");
      if (game.autosaveSoon) game.autosaveSoon();
      return { ok: true, message: crate.name + " açıldı: +" + crystalMoney + " Luma, 2 kristal ve 1 yumurta." };
    }

    var exclusiveIds = ["astralya", "voltaris", "noctyra"];
    var chosenId = exclusiveIds[Math.floor(Math.random() * exclusiveIds.length)];
    var level = 12 + Math.floor(Math.random() * 7);
    var creature = L.Creatures.create(chosenId, level, { shiny: Math.random() < 0.12 });
    var destination = L.Creatures.addToCollection(game.state, creature);
    if (L.WorldMap && L.WorldMap.recordCaught) L.WorldMap.recordCaught(game.state, creature.id);
    if (L.Progression && L.Progression.ensureState) L.Progression.ensureState(game.state);
    if (game.state.legendaryHunts) game.state.legendaryHunts.lures = (game.state.legendaryHunts.lures || 0) + 1;
    if (game.autosaveSoon) game.autosaveSoon();
    return {
      ok: true,
      message: crate.name + " açıldı: " + creature.displayName + " Sv. " + level + (destination === "team" ? " ekibine" : " depoya") + " katıldı ve +1 Efsane Yemi kazandın."
    };
  };

  function rewardedAdAttempt(ui, busyKey, onReward, onDone) {
    if (!ui || ui[busyKey]) return;
    ui[busyKey] = true;
    var granted = false;

    function grantOnce() {
      if (granted) return;
      granted = true;
      onReward();
    }

    Promise.resolve(window.showRewardedAd(grantOnce)).then(function (result) {
      if (result && result.rewarded) grantOnce();
      if (!granted) {
        ui.notify("Ödüllü reklam şu anda hazır değil.");
        if (L.Audio) L.Audio.play("error");
      }
    }).catch(function () {
      ui.notify("Ödüllü reklam açılamadı. İlerlemen değişmedi.");
      if (L.Audio) L.Audio.play("error");
    }).then(function () {
      ui[busyKey] = false;
      if (onDone) onDone();
    });
  }

  function installResponsiveHardening() {
    if (document.getElementById("pixelmaniaResponsiveHardening")) return;
    var style = document.createElement("style");
    style.id = "pixelmaniaResponsiveHardening";
    style.textContent = [
      "html,body{max-width:100%;overflow-x:hidden}",
      ".panel-window,.panel-content,.panel-grid,.item-row,.panel-row{min-width:0}",
      ".panel-content *{max-width:100%;overflow-wrap:anywhere}",
      ".login-reward-track{display:grid;grid-template-columns:repeat(7,minmax(42px,1fr));gap:5px;margin:8px 0}",
      ".login-day{min-width:0;padding:6px 3px;border:1px solid rgba(16,21,33,.35);text-align:center;font-size:10px;background:rgba(255,248,223,.6)}",
      ".login-day.current{outline:2px solid #f2b94b;background:#fff4d2}",
      ".reward-crate-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}",
      ".reward-crate-card{min-width:0;padding:8px;border:2px solid #101521;background:#fff8df;color:#172033;text-align:center}",
      ".reward-crate-art{position:relative;width:72px;height:54px;margin:2px auto 8px;border:3px solid #101521;background:linear-gradient(180deg,#8b5a37 0 35%,#d29a55 35% 78%,#6f432b 78%);box-shadow:inset 0 0 0 4px rgba(255,244,210,.16),0 3px 0 rgba(0,0,0,.2)}",
      ".reward-crate-art:before{content:'';position:absolute;left:27px;top:16px;width:14px;height:18px;border:2px solid #101521;background:#f2b94b}",
      ".reward-crate-art.crystal{background:linear-gradient(135deg,#28364f,#6aa9c8 45%,#93d4e8 46% 66%,#31324f 67%)}",
      ".reward-crate-art.legend{background:linear-gradient(135deg,#25243f,#7a63d8 42%,#f2d86b 43% 58%,#172033 59%)}",
      ".reward-crate-card button,.login-reward-card button,.rewarded-legendary-ad button{min-height:44px;margin-top:6px}",
      ".ad-coin-count{display:inline-block;margin:5px 0;padding:4px 7px;border:2px solid #101521;background:#f2b94b;color:#172033}",
      "@media(max-width:600px){.panel-window{width:calc(100vw - 12px);max-width:calc(100vw - 12px)}.panel-content{padding:8px}.panel-content button{min-height:44px}.reward-crate-grid{grid-template-columns:1fr}.login-reward-track{grid-template-columns:repeat(7,minmax(38px,1fr));overflow-x:auto;overscroll-behavior-x:contain}.reward-crate-art{width:64px;height:48px}.ad-container{max-width:calc(100vw - 16px)}}",
      "@media(max-width:390px){.login-reward-track{grid-template-columns:repeat(7,40px)}.world-hud{left:4px;right:4px;gap:3px}.world-hud span{padding:3px 5px}}",
      "@media(prefers-reduced-motion:reduce){.cloud,.toast,.boss-intro,.damage-number{animation:none!important}}"
    ].join("");
    document.head.appendChild(style);
  }

  function patchUiExtensions() {
    if (!L.UiController || !L.UiController.prototype) return;
    var proto = L.UiController.prototype;
    if (proto.__adContentPatchApplied) return;
    proto.__adContentPatchApplied = true;

    var baseShowLegendary = proto.showLegendary;
    var baseShowDaily = proto.showDaily;
    var baseShowMarket = proto.showMarket;
    var baseHandlePanelClick = proto.handlePanelClick;

    proto.showDaily = function () {
      baseShowDaily.call(this);
      if (!L.Daily || !L.Daily.loginInfo || !this.game || !this.game.state) return;
      var info = L.Daily.loginInfo(this.game.state);
      var card = document.createElement("div");
      card.className = "panel-row login-reward-card";
      var track = L.Daily.loginRewards.map(function (reward) {
        return "<div class='login-day " + (reward.day === info.day ? "current" : "") + "'><strong>G" + reward.day + "</strong><br><small>" + reward.label + "</small></div>";
      }).join("");
      card.innerHTML =
        "<strong>Günlük Giriş Ödülü</strong><br><small>Her gün geri gel, 7 günlük seriyi tamamla.</small>" +
        "<div class='login-reward-track'>" + track + "</div>" +
        "<small>Sıradaki: " + info.reward.label + "</small><br>" +
        "<button class='primary' data-daily-login-claim='1'" + (!info.canClaim ? " disabled" : "") + ">" + (info.canClaim ? "Bugünkü Ödülü Al" : "Bugün Alındı") + "</button>";
      this.panelContent.insertBefore(card, this.panelContent.firstChild);
    };

    proto.showMarket = function () {
      baseShowMarket.call(this);
      if (!this.game || !this.game.state) return;
      var wallet = L.AdEconomy.ensureState(this.game.state);
      var section = document.createElement("div");
      section.className = "panel-row ad-crate-shop";
      var cards = L.AdEconomy.crates.map(function (crate) {
        var disabled = wallet.coins < crate.cost ? " disabled" : "";
        return "<div class='reward-crate-card'><div class='reward-crate-art " + crate.tier + "' aria-hidden='true'></div><strong>" + crate.name + "</strong><br><small>" + crate.description + "</small><br><small>Fiyat: " + crate.cost + " Reklam Coini</small><br><button data-ad-crate='" + crate.id + "'" + disabled + ">Kasayı Aç</button></div>";
      }).join("");
      section.innerHTML =
        "<strong>Ödüllü Reklam Kasaları</strong><br>" +
        "<span class='ad-coin-count'>Reklam Coini: " + wallet.coins + "</span><br>" +
        "<small>Bu coin yalnızca tamamlanan isteğe bağlı ödüllü reklamlardan kazanılır. Banner reklamlara dokunmak coin vermez.</small><br>" +
        "<button class='primary' data-ad-coin-watch='1'>Ödüllü Reklam İzle → +1 Coin</button>" +
        "<div class='reward-crate-grid'>" + cards + "</div>";
      var firstGrid = this.panelContent.querySelector(".panel-grid");
      if (firstGrid) this.panelContent.insertBefore(section, firstGrid);
      else this.panelContent.appendChild(section);
    };

    proto.showLegendary = function () {
      baseShowLegendary.call(this);
      var reward = ensureRewardState(this.game && this.game.state);
      if (!reward || !this.panelContent) return;
      var progress = reward.watched || 0;
      var row = document.createElement("div");
      row.className = "panel-row rewarded-legendary-ad";
      row.innerHTML =
        "<strong>İsteğe bağlı Efsane Yemi:</strong> " + progress + "/2" +
        "<br><small>2 ödüllü reklamı tamamen izleyince 1 Efsane Yemi kazanırsın. Tamamlanmayan reklam sayılmaz.</small><br>" +
        "<button class='primary' data-legendary-reward-ad='1'>Ödüllü Reklam İzle (" + progress + "/2)</button>";
      var firstGrid = this.panelContent.querySelector(".panel-grid");
      if (firstGrid) this.panelContent.insertBefore(row, firstGrid);
      else this.panelContent.appendChild(row);
    };

    proto.handlePanelClick = function (button) {
      if (button && button.hasAttribute("data-daily-login-claim")) {
        var loginResult = L.Daily && L.Daily.claimLogin ? L.Daily.claimLogin(this.game) : { ok: false, message: "Giriş ödülü hazır değil." };
        this.notify(loginResult.message);
        if (L.Audio) L.Audio.play(loginResult.ok ? "confirm" : "error");
        this.showDaily();
        return;
      }

      if (button && button.hasAttribute("data-ad-coin-watch")) {
        var selfCoin = this;
        button.disabled = true;
        button.textContent = "Reklam hazırlanıyor...";
        rewardedAdAttempt(this, "_adCoinBusy", function () {
          L.AdEconomy.grantCoin(selfCoin.game);
          selfCoin.notify("+1 Reklam Coini kazandın.");
          if (L.Audio) L.Audio.play("confirm");
        }, function () {
          if (selfCoin.panel && selfCoin.panel.dataset.context === "market") selfCoin.showMarket();
        });
        return;
      }

      var crateId = button && button.getAttribute("data-ad-crate");
      if (crateId) {
        var crateResult = L.AdEconomy.openCrate(this.game, crateId);
        this.notify(crateResult.message);
        if (L.Audio) L.Audio.play(crateResult.ok ? "victory" : "error");
        this.showMarket();
        return;
      }

      if (button && button.hasAttribute("data-legendary-reward-ad")) {
        var selfLegend = this;
        button.disabled = true;
        button.textContent = "Reklam hazırlanıyor...";
        rewardedAdAttempt(this, "_legendaryRewardAdBusy", function () {
          var current = ensureRewardState(selfLegend.game && selfLegend.game.state);
          if (!current || !selfLegend.game || !selfLegend.game.state) return;
          current.watched += 1;
          if (current.watched >= 2) {
            current.watched = 0;
            if (L.Progression) L.Progression.ensureState(selfLegend.game.state);
            selfLegend.game.state.legendaryHunts.lures += 1;
            selfLegend.notify("2/2 tamamlandı! +1 Efsane Yemi kazandın.");
            if (L.Audio) L.Audio.play("victory");
          } else {
            selfLegend.notify("Ödüllü reklam tamamlandı: 1/2.");
            if (L.Audio) L.Audio.play("confirm");
          }
          selfLegend.game.autosaveSoon();
        }, function () {
          if (selfLegend.panel && selfLegend.panel.dataset.context === "legendary") selfLegend.showLegendary();
        });
        return;
      }

      return baseHandlePanelClick.call(this, button);
    };
  }

  registerCrateCreatures();
  installResponsiveHardening();
  patchUiExtensions();

  window.addEventListener("DOMContentLoaded", function () {
    L.Ads.init();
    var game = new L.Game();
    L.game = game;
    game.start();
  });
})();
