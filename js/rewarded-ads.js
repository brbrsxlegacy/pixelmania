(function () {
  "use strict";
  var L = window.LUMA = window.LUMA || {};
  var ready = false, failed = false, initTimedOut = false, active = null, lastAttempt = 0;
  window.adsbygoogle = window.adsbygoogle || [];
  window.adBreak = window.adConfig = function (options) { window.adsbygoogle.push(options); };
  var messages = {
    notReady: "Google reklam sistemi yükleniyor. Biraz sonra tekrar dene.",
    initTimeout: "Google ödüllü reklam sistemi henüz hazır olmadı. Daha sonra tekrar dene.",
    timeout: "Google reklam isteği zaman aşımına uğradı. Bağlantını kontrol edip tekrar dene.",
    blocked: "Google reklam sistemi yüklenemedi. Bağlantını veya reklam engelleyicini kontrol et.",
    noAdPreloaded: "Google şu an gösterilecek ödüllü reklam sağlayamadı. Biraz sonra tekrar dene.",
    frequencyCapped: "Google reklam sıklığı sınırına ulaşıldı. Daha sonra tekrar dene.",
    other: "Google şu an uygun bir ödüllü reklam sağlayamadı. Daha sonra tekrar dene.",
    busy: "Bir reklam isteği zaten devam ediyor.",
    cooldown: "Yeni reklam istemeden önce birkaç saniye bekle.",
    dismissed: "Reklam tamamlanmadı; ödül verilmedi.",
    ignored: "Reklam isteği iptal edildi; ödül verilmedi.",
    error: "Ödüllü reklam açılamadı. İlerlemen değişmedi.",
    invalid: "Google ödüllü reklam isteğini kabul etmedi."
  };
  L.RewardedAds = {
    message: function (reason) { return messages[reason] || messages.other; },
    loadFailed: function () { failed = true; },
    status: function () { return failed ? "blocked" : ready ? "ready" : "notReady"; }
  };
  window.adConfig({ preloadAdBreaks: "on", onReady: function () { ready = true; failed = false; } });
  setTimeout(function () { if (!ready) initTimedOut = true; }, 15000);
  window.addEventListener("DOMContentLoaded", function () {
    var script = document.getElementById("googleAdsScript");
    if (script) script.addEventListener("error", function () { failed = true; });
  });

  window.showRewardedAd = function (callback, placementName) {
    if (active) return Promise.resolve({ rewarded: false, reason: "busy" });
    if (failed) return Promise.resolve({ rewarded: false, reason: "blocked" });
    if (!ready) return Promise.resolve({ rewarded: false, reason: initTimedOut ? "initTimeout" : "notReady" });
    if (lastAttempt && Date.now() - lastAttempt < 10000) return Promise.resolve({ rewarded: false, reason: "cooldown" });
    lastAttempt = Date.now();
    return new Promise(function (resolve) {
      var request = { done: false, viewed: false, shown: false, paused: false };
      active = request;
      var dialog = null, timer = null, previousFocus = document.activeElement;
      var game, audio, oldEnabled, oldVolume, oldPaused;
      function removePrompt() {
        if (dialog) { dialog.remove(); dialog = null; }
        if (previousFocus && previousFocus.isConnected) previousFocus.focus();
      }
      function resume() {
        if (!request.paused) return;
        request.paused = false;
        if (game) game.adPaused = oldPaused;
        if (audio) {
          if (audio.outputGain && audio.ctx) audio.outputGain.gain.setValueAtTime(1, audio.ctx.currentTime);
          audio.enabled = oldEnabled;
          audio.settings.mainVolume = oldVolume;
          audio.updateMusicVolume(true);
          if (audio.ctx && audio.ctx.state === "suspended") audio.ctx.resume().catch(function () {});
        }
      }
      function finish(reason) {
        if (request.done) return;
        request.done = true;
        clearTimeout(timer);
        removePrompt();
        resume();
        if (active === request) active = null;
        resolve({ shown: request.shown, rewarded: request.viewed, reason: reason });
      }
      timer = setTimeout(function () { finish("timeout"); }, 20000);
      try {
        audio = L.Audio;
        window.adConfig({ sound: audio && audio.enabled && audio.settings.mainVolume > 0 ? "on" : "off" });
        window.adBreak({
          type: "reward", name: placementName || "market-coin",
          beforeReward: function (showAd) {
            if (request.done) return;
            clearTimeout(timer);
            dialog = document.createElement("dialog");
            dialog.className = "rewarded-ad-prompt";
            dialog.innerHTML = '<h2>Ödüllü reklam</h2><p>' + (placementName === "legendary-progress" ? "Reklamı tamamla: Efsane Yemi için +1/2 ilerleme kazan." : "Reklamı tamamla: +1 Reklam Coini kazan.") + '</p><button type="button" data-watch>Reklamı İzle</button> <button type="button" data-cancel>Vazgeç</button>';
            document.body.appendChild(dialog);
            dialog.querySelector("[data-watch]").addEventListener("click", function () {
              if (request.done) return;
              removePrompt();
              clearTimeout(timer);
              timer = setTimeout(function () { finish("timeout"); }, 20000);
              try { showAd(); } catch (err) { finish("error"); }
            }, { once: true });
            dialog.querySelector("[data-cancel]").addEventListener("click", function () { finish("ignored"); });
            dialog.addEventListener("cancel", function (event) { event.preventDefault(); finish("ignored"); });
            timer = setTimeout(function () { finish("ignored"); }, 60000);
            dialog.showModal();
          },
          beforeAd: function () {
            if (request.done) return;
            clearTimeout(timer);
            removePrompt();
            request.shown = true;
            request.paused = true;
            game = L.game;
            oldPaused = game && game.adPaused;
            if (game) game.adPaused = true;
            if (audio) {
              oldEnabled = audio.enabled;
              oldVolume = audio.settings.mainVolume;
              if (audio.outputGain && audio.ctx) audio.outputGain.gain.setValueAtTime(0, audio.ctx.currentTime);
              audio.enabled = false;
              audio.settings.mainVolume = 0;
              audio.updateMusicVolume(true);
              if (audio.ctx) audio.ctx.suspend().catch(function () {});
            }
          },
          adViewed: function () {
            if (request.done || request.viewed || !request.shown) return;
            request.viewed = true;
            if (typeof callback === "function") callback();
          },
          adDismissed: function () { /* No reward on dismissal. */ },
          afterAd: resume,
          adBreakDone: function (info) { finish(info && info.breakStatus || "other"); }
        });
      } catch (err) { finish("error"); }
    });
  };
}());
