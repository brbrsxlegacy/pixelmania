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
    if (!unit) return; // Şimdilik yalnızca placeholder var; gerçek reklam birimi eklendiğinde izleme otomatik başlar.

    var placeholder = slot.querySelector(".ad-placeholder");
    if (placeholder) placeholder.classList.add("hidden");

    function syncStatus() {
      var status = unit.getAttribute("data-ad-status");
      if (status === "unfilled") {
        L.Ads.markFailed(slot.id);
        return;
      }
      if (status === "filled" || hasFilledAd(slot)) {
        L.Ads.markLoaded(slot.id);
      }
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

    // Ağ/reklam sağlayıcısı uzun süre hiçbir içerik üretmezse boş kutu bırakma.
    setTimeout(function () {
      if (!hasFilledAd(slot)) L.Ads.markFailed(slot.id);
    }, 12000);
  };

  L.Ads.init = function () {
    var slots = document.querySelectorAll(".ad-container");
    for (var i = 0; i < slots.length; i += 1) {
      L.Ads.prepareSlot(slots[i]);
    }
  };

  // Ödüllü reklam için hazırlık noktası.
  // Gerçek sağlayıcı bağlandığında callback yalnızca reklam başarıyla tamamlanıp ödül hak edildiğinde çağrılmalı.
  window.showRewardedAd = function (callback) {
    return Promise.resolve({
      shown: false,
      rewarded: false,
      reason: "placeholder",
      onReward: typeof callback === "function" ? callback : null
    });
  };

  function ensureRewardState(state) {
    if (!state) return null;
    state.adRewards = state.adRewards && typeof state.adRewards === "object" ? state.adRewards : {};
    state.adRewards.legendary = state.adRewards.legendary && typeof state.adRewards.legendary === "object" ? state.adRewards.legendary : {};
    state.adRewards.legendary.watched = Math.max(0, Math.min(1, Number(state.adRewards.legendary.watched) || 0));
    return state.adRewards.legendary;
  }

  function patchLegendaryRewardAds() {
    if (!L.UiController || !L.UiController.prototype) return;

    var proto = L.UiController.prototype;
    if (proto.__legendaryRewardAdsPatched) return;
    proto.__legendaryRewardAdsPatched = true;

    var baseShowLegendary = proto.showLegendary;
    var baseHandlePanelClick = proto.handlePanelClick;

    proto.showLegendary = function () {
      baseShowLegendary.call(this);

      var reward = ensureRewardState(this.game && this.game.state);
      if (!reward || !this.panelContent) return;

      var progress = reward.watched || 0;
      var row = document.createElement("div");
      row.className = "panel-row rewarded-legendary-ad";
      row.innerHTML =
        "<strong>İsteğe bağlı ödüllü reklam:</strong> " + progress + "/2" +
        "<br><small>2 ödüllü reklamı tamamen izleyince 1 Efsane Yemi kazanırsın. Reklam açılmazsa veya tamamlanmazsa ilerleme sayılmaz.</small><br>" +
        "<button class='primary' data-legendary-reward-ad='1'>Ödüllü Reklam İzle (" + progress + "/2)</button>";

      var firstGrid = this.panelContent.querySelector(".panel-grid");
      if (firstGrid) this.panelContent.insertBefore(row, firstGrid);
      else this.panelContent.appendChild(row);
    };

    proto.handlePanelClick = function (button) {
      if (!button || !button.hasAttribute("data-legendary-reward-ad")) {
        return baseHandlePanelClick.call(this, button);
      }

      if (this._legendaryRewardAdBusy) return;

      var self = this;
      var state = this.game && this.game.state;
      var reward = ensureRewardState(state);
      if (!reward) return;

      this._legendaryRewardAdBusy = true;
      button.disabled = true;
      button.textContent = "Reklam hazırlanıyor...";

      var rewardGranted = false;

      function grantReward() {
        if (rewardGranted) return;
        rewardGranted = true;

        var current = ensureRewardState(self.game && self.game.state);
        if (!current || !self.game || !self.game.state) return;

        current.watched += 1;

        if (current.watched >= 2) {
          current.watched = 0;
          if (L.Progression) L.Progression.ensureState(self.game.state);
          self.game.state.legendaryHunts.lures += 1;
          self.notify("2/2 tamamlandı! +1 Efsane Yemi kazandın.");
          if (L.Audio) L.Audio.play("victory");
        } else {
          self.notify("Ödüllü reklam tamamlandı: 1/2.");
          if (L.Audio) L.Audio.play("confirm");
        }

        self.game.autosaveSoon();
      }

      Promise.resolve(window.showRewardedAd(grantReward)).then(function (result) {
        if (result && result.rewarded) grantReward();
        if (!rewardGranted) {
          self.notify("Ödüllü reklam şu anda hazır değil.");
          if (L.Audio) L.Audio.play("error");
        }
      }).catch(function () {
        self.notify("Ödüllü reklam açılamadı. İlerlemen değişmedi.");
        if (L.Audio) L.Audio.play("error");
      }).then(function () {
        self._legendaryRewardAdBusy = false;
        if (self.panel && self.panel.dataset.context === "legendary") self.showLegendary();
      });
    };
  }

  patchLegendaryRewardAds();

  window.addEventListener("DOMContentLoaded", function () {
    L.Ads.init();
    var game = new L.Game();
    L.game = game;
    game.start();
  });
})();
