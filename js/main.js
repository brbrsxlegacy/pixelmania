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

  window.addEventListener("DOMContentLoaded", function () {
    L.Ads.init();
    var game = new L.Game();
    L.game = game;
    game.start();
  });
})();
