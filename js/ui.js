(function () {
  var L = window.LUMA = window.LUMA || {};

  function fmtTime(seconds) {
    seconds = Math.floor(seconds || 0);
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    return (h ? h + "s " : "") + m + "d";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[ch];
    });
  }

  var dexElements = ["Yaprak", "Alev", "Su", "Kaya", "Rüzgar", "Elektrik", "Gölge", "Işık"];

  function elementMatchups(element) {
    var strong = [];
    var weakTo = [];
    dexElements.forEach(function (other) {
      if (L.Abilities.effectiveness(element, other) > 1.1) strong.push(other);
      if (L.Abilities.effectiveness(other, element) > 1.1) weakTo.push(other);
    });
    return {
      strong: strong.length ? strong.join(", ") : "Nötr",
      weakTo: weakTo.length ? weakTo.join(", ") : "Nötr"
    };
  }

  function drawCreatureCard(canvas, creature, unknown) {
    if (!canvas || !L.Asset) return;
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#9adbea";
    ctx.fillRect(0, 0, canvas.width, Math.floor(canvas.height * .52));
    ctx.fillStyle = "#72c55f";
    ctx.fillRect(0, Math.floor(canvas.height * .52), canvas.width, canvas.height);
    ctx.fillStyle = "rgba(18, 28, 42, .22)";
    ctx.fillRect(18, canvas.height - 12, canvas.width - 36, 6);
    if (unknown) {
      ctx.fillStyle = "#28364f";
      ctx.fillRect(canvas.width / 2 - 12, 17, 24, 21);
      ctx.fillRect(canvas.width / 2 - 5, 10, 10, 8);
      ctx.fillStyle = "#fff4d2";
      ctx.font = "12px monospace";
      ctx.fillText("?", canvas.width / 2 - 4, 31);
      return;
    }
    L.Asset.drawCreature(ctx, creature, Math.floor(canvas.width / 2 - 18), 13, 1.45, false, Date.now() / 1000);
  }

  L.UiController = function (game) {
    this.game = game;
    this.mainMenu = document.getElementById("mainMenu");
    this.panel = document.getElementById("panelScreen");
    this.panelTitle = document.getElementById("panelTitle");
    this.panelContent = document.getElementById("panelContent");
    this.panelClose = document.getElementById("panelClose");
    this.starterScreen = document.getElementById("starterScreen");
    this.starterCanvas = document.getElementById("starterCanvas");
    this.starterCtx = this.starterCanvas.getContext("2d");
    this.starterIds = L.Creatures.starters();
    this.starterIndex = 0;
    this.returnMode = "world";
    this.inventoryCategory = "İyileştirme";
    this.bind();
    L.UI = this;
  };

  L.UiController.prototype.bind = function () {
    var self = this;
    this.mainMenu.addEventListener("click", function (event) {
      var button = event.target.closest("[data-menu-action]");
      if (!button) return;
      try {
        var action = button.getAttribute("data-menu-action");
        if (L.Audio) L.Audio.play("confirm");
        if (action === "new") self.game.newGame();
        if (action === "continue") self.game.continueLatest();
        if (action === "slots") self.showSlots("load", "menu");
        if (action === "multiplayer") self.showMultiplayer("menu");
        if (action === "settings") self.showSettings("menu");
        if (action === "controls") self.showControls("menu");
        if (action === "about") self.showAbout("menu");
      } catch (err) {
        self.handleUiError(err);
      }
    });

    this.panelClose.addEventListener("click", function () { self.closePanel(); });
    this.panelContent.addEventListener("click", function (event) {
      var target = event.target.closest("button");
      if (!target) return;
      try {
        if (L.Shop.handleClick && L.Shop.handleClick(target)) return;
        self.handlePanelClick(target);
      } catch (err) {
        self.handleUiError(err);
      }
    });
    this.panelContent.addEventListener("input", function (event) {
      self.handleSettingInput(event.target);
    });

    this.starterScreen.addEventListener("click", function (event) {
      var button = event.target.closest("[data-starter-action]");
      if (!button) return;
      try {
        var action = button.getAttribute("data-starter-action");
        if (action === "prev") self.starterIndex = (self.starterIndex + self.starterIds.length - 1) % self.starterIds.length;
        if (action === "next") self.starterIndex = (self.starterIndex + 1) % self.starterIds.length;
        if (action === "select") self.game.chooseStarter(self.starterIds[self.starterIndex]);
        if (action === "back") self.closeStarter();
        if (action === "prev" || action === "next") {
          if (L.Audio) L.Audio.play("menu");
          self.renderStarter();
        }
      } catch (err) {
        self.handleUiError(err);
      }
    });
  };

  L.UiController.prototype.handleUiError = function (err) {
    console.error(err);
    this.notify("Buton takıldı; kayıt silinmedi. Sayfayı yenileyip tekrar dene.");
    if (L.Audio) L.Audio.play("error");
    if (this.game) this.game.updateBodyMode();
  };

  L.UiController.prototype.showMain = function () {
    this.mainMenu.classList.remove("hidden");
    document.getElementById("worldHud").classList.add("hidden");
    this.game.mode = "menu";
    if (L.Audio) L.Audio.stopMusic();
  };

  L.UiController.prototype.hideMain = function () {
    this.mainMenu.classList.add("hidden");
    document.getElementById("worldHud").classList.remove("hidden");
  };

  L.UiController.prototype.notify = function (text) {
    var stack = document.getElementById("notificationStack");
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    stack.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 4100);
  };

  L.UiController.prototype.updateHud = function () {
    if (!this.game.state || !this.game.map) return;
    document.getElementById("hudMap").textContent = this.game.map.name;
    document.getElementById("hudMoney").textContent = this.game.state.money + " Luma";
    var active = L.Quests.active(this.game.state)[0];
    document.getElementById("hudQuest").textContent = active ? active.title + ": " + active.state.objectives.filter(function (o) { return !o.done; }).map(function (o) { return o.text; })[0] : "Görev yok";
    var fps = document.getElementById("hudFps");
    fps.textContent = Math.round(this.game.fps || 60) + " FPS";
    fps.classList.toggle("hidden", !this.game.state.settings.showFps);
    document.body.classList.toggle("touch-enabled", !!this.game.state.settings.touchControls);
  };

  L.UiController.prototype.showPanel = function (title, html, context, returnMode) {
    this.returnMode = returnMode || (this.game.mode === "menu" ? "menu" : "world");
    this.panelTitle.textContent = title;
    this.panelContent.innerHTML = html;
    this.panel.dataset.context = context || "";
    this.panel.classList.remove("hidden");
    if (this.game.mode !== "menu") this.game.mode = "panel";
  };

  L.UiController.prototype.closePanel = function () {
    this.panel.classList.add("hidden");
    this.panelContent.innerHTML = "";
    if (this.returnMode === "menu") this.game.mode = "menu";
    else this.game.mode = "world";
  };

  L.UiController.prototype.renderPanelCreatureArt = function () {
    var state = this.game.state || {};
    this.panelContent.querySelectorAll("[data-team-art]").forEach(function (canvas) {
      var creature = state.team && state.team[Number(canvas.getAttribute("data-team-art"))];
      if (creature) drawCreatureCard(canvas, creature, false);
    });
    this.panelContent.querySelectorAll("[data-storage-art]").forEach(function (canvas) {
      var creature = state.storage && state.storage[Number(canvas.getAttribute("data-storage-art"))];
      if (creature) drawCreatureCard(canvas, creature, false);
    });
    this.panelContent.querySelectorAll("[data-dex-art]").forEach(function (canvas) {
      var id = canvas.getAttribute("data-dex-art");
      var base = window.LUMA_DATA.creatures[id];
      if (!base) return;
      var known = !!(state.dex && (state.dex.seen[id] || state.dex.caught[id]));
      drawCreatureCard(canvas, base, !known);
    });
  };

  L.UiController.prototype.showPause = function () {
    var html = "<div class='panel-grid'>" +
      "<button class='panel-row' data-pause='team'>Yaratıklar</button>" +
      "<button class='panel-row' data-pause='bag'>Çanta</button>" +
      "<button class='panel-row' data-pause='quests'>Görevler</button>" +
      "<button class='panel-row' data-pause='daily'>Günlük</button>" +
      "<button class='panel-row' data-pause='crafting'>Atolye</button>" +
      "<button class='panel-row' data-pause='minigames'>Mini Oyunlar</button>" +
      "<button class='panel-row' data-pause='weather'>Hava ve Pasifler</button>" +
      "<button class='panel-row' data-pause='bosses'>Dev Bosslar</button>" +
      "<button class='panel-row' data-pause='map'>Harita</button>" +
      "<button class='panel-row' data-pause='dex'>Lumadex</button>" +
      "<button class='panel-row' data-pause='badges'>Rozetler</button>" +
      "<button class='panel-row' data-pause='multiplayer'>Çok Oyunculu</button>" +
      "<button class='panel-row' data-pause='jobs'>Meslekler</button>" +
      "<button class='panel-row' data-pause='housing'>Evler</button>" +
      "<button class='panel-row' data-pause='eggs'>Yumurtalar</button>" +
      "<button class='panel-row' data-pause='market'>Pazar</button>" +
      "<button class='panel-row' data-pause='unstuck'>Sıkışmadan Kurtul</button>" +
      "<button class='panel-row' data-pause='settings'>Ayarlar</button>" +
      "<button class='panel-row' data-pause='save'>Kaydet</button>" +
      "<button class='panel-row danger' data-pause='main'>Ana Menü</button>" +
      "</div>";
    this.showPanel("Duraklat", html, "pause", "world");
  };

  L.UiController.prototype.openStarter = function () {
    this.starterScreen.classList.remove("hidden");
    this.game.mode = "starter";
    this.renderStarter();
  };

  L.UiController.prototype.closeStarter = function () {
    this.starterScreen.classList.add("hidden");
    this.game.mode = "world";
  };

  L.UiController.prototype.renderStarter = function () {
    var id = this.starterIds[this.starterIndex];
    var base = L.Creatures.getBase(id);
    document.getElementById("starterName").textContent = base.name;
    document.getElementById("starterType").textContent = base.element;
    document.getElementById("starterType").style.background = L.Abilities.elementColor(base.element);
    document.getElementById("starterDesc").textContent = base.description;
    document.getElementById("starterStats").innerHTML = [
      ["HP", base.baseStats.hp], ["Saldırı", base.baseStats.attack],
      ["Savunma", base.baseStats.defense], ["Hız", base.baseStats.speed]
    ].map(function (s) { return "<span>" + s[0] + ": " + s[1] + "</span>"; }).join("");
    document.getElementById("starterAbilities").innerHTML = base.abilities.slice(0, 3).map(function (aid) {
      var a = L.Abilities.get(aid);
      return "<div><strong>" + a.name + "</strong> - " + a.description + "</div>";
    }).join("");
    this.starterCtx.clearRect(0, 0, 160, 120);
    this.starterCtx.fillStyle = "#9adbea";
    this.starterCtx.fillRect(0, 0, 160, 62);
    this.starterCtx.fillStyle = "#66bd65";
    this.starterCtx.fillRect(0, 62, 160, 58);
    L.Asset.drawCreature(this.starterCtx, base, 48, 28, 2.2, false, this.game.time);
  };

  L.UiController.prototype.showTeam = function () {
    var state = this.game.state;
    var html = "<div class='panel-grid'>";
    state.team.forEach(function (c, i) {
      var evo = L.Evolution && L.Evolution.nextInfo(c);
      var friend = L.Progression ? L.Progression.friendship(state, c) : 0;
      var passive = L.Progression ? L.Progression.passiveFor(c) : null;
      html += "<div class='team-card'><strong>" + (i === state.activeIndex ? "▶ " : "") + c.displayName + "</strong><br>" +
        "<canvas class='creature-card-art' width='96' height='66' data-team-art='" + i + "'></canvas>" +
        "<small>" + c.element + " • Sv. " + c.level + " • HP " + c.hp + "/" + c.maxHp + " • EXP " + c.exp + "/" + c.expToNext + "</small><br>" +
        "<small>Güç " + c.attack + " • Savunma " + c.defense + " • Hız " + c.speed + "</small><br>" +
        "<small>" + c.abilities.map(function (a) { return a.name; }).join(", ") + "</small><br>" +
        (passive ? "<small>Dostluk " + friend + "/100 • Pasif: " + passive.name + "</small><br>" : "") +
        (evo ? "<small>Evrim: " + evo.to.name + " • Sv. " + evo.level + "</small><br>" : "") +
        "<button data-team-active='" + i + "'>Aktif Yap</button>" +
        (evo && evo.ready ? "<button data-team-evolve='" + i + "' class='primary'>Evrimle</button>" : "") +
        "<button data-team-tree='" + i + "'>Evrim Agaci</button>" +
        "<button data-team-moves='" + i + "'>Yetenekler</button>" +
        "<button data-team-up='" + i + "'>Yukarı</button><button data-team-down='" + i + "'>Aşağı</button>" +
        "<button data-team-heal='" + i + "'>İksir Kullan</button>" +
        "<button data-team-store='" + i + "'>Depoya Gönder</button></div>";
    });
    html += "</div>";
    if (state.storage.length) {
      html += "<h3>Depo</h3><div class='panel-grid'>";
      state.storage.forEach(function (c, i) {
        html += "<div class='team-card'><strong>" + c.displayName + "</strong><br><canvas class='creature-card-art' width='96' height='66' data-storage-art='" + i + "'></canvas><small>" + c.element + " • Sv. " + c.level + "</small><br>" +
          "<button data-storage-take='" + i + "'>Ekibe Al</button></div>";
      });
      html += "</div>";
    }
    this.showPanel("Yaratıklar", html, "team", "world");
    this.renderPanelCreatureArt();
  };

  L.UiController.prototype.showInventory = function () {
    var state = this.game.state;
    var cat = this.inventoryCategory;
    var html = "<div class='panel-row'>" + L.Inventory.categories().map(function (c) {
      return "<button data-inventory-cat='" + c + "'" + (c === cat ? " class='primary'" : "") + ">" + c + "</button>";
    }).join("") + "</div><div class='panel-grid'>";
    var entries = L.Inventory.entries(state.inventory, cat);
    if (!entries.length) html += "<div class='item-row'>Bu kategoride eşya yok.</div>";
    entries.forEach(function (item) {
      html += "<div class='item-row'><strong>" + item.name + " x" + item.qty + "</strong><br><small>" + item.description + "</small><br>";
      if (item.category === "İyileştirme") html += "<button data-inventory-use='" + item.id + "'>Aktif yaratığa kullan</button>";
      if (item.category === "Yakalama") html += "<small>Savaşta kullanılabilir.</small>";
      html += "</div>";
    });
    html += "</div>";
    this.showPanel("Çanta", html, "inventory", "world");
  };

  L.UiController.prototype.showQuests = function () {
    var html = "<div class='panel-grid'>";
    L.Quests.allForJournal(this.game.state).forEach(function (q) {
      var status = q.state ? (q.state.status === "completed" ? "Tamamlandı" : "Aktif") : "Başlamadı";
      html += "<div class='quest-row'><strong>" + q.title + "</strong><br><small>" + status + " • " + q.giver + "</small><p>" + q.description + "</p>";
      if (q.state) {
        q.state.objectives.forEach(function (o) {
          html += "<small>" + (o.done ? "✓ " : "□ ") + o.text + " (" + o.count + "/" + o.target + ")</small><br>";
        });
      }
      html += "</div>";
    });
    html += "</div>";
    this.showPanel("Görevler", html, "quests", "world");
  };

  L.UiController.prototype.showDaily = function () {
    var state = this.game.state;
    if (!L.Daily) return;
    var daily = L.Daily.ensureState(state);
    var complete = L.Daily.isComplete(state);
    var html = "<div class='panel-row'><strong>Günlük seri:</strong> " + (daily.streak || 0) + "<br><small>" + daily.date + " için yenilenir.</small></div>";
    html += "<div class='panel-grid'>";
    L.Daily.tasks.forEach(function (task) {
      var value = Math.min(task.target, daily.tasks[task.id] || 0);
      html += "<div class='quest-row'><strong>" + task.label + "</strong><br><small>" + value + "/" + task.target + " • " + task.reward + "</small>" +
        "<div class='progress-shell'><span style='width:" + Math.round(value / task.target * 100) + "%'></span></div></div>";
    });
    html += "</div><div class='panel-row'><button class='primary' data-daily-claim='1'" + (!complete || daily.claimed ? " disabled" : "") + ">" +
      (daily.claimed ? "Bugün alındı" : (complete ? "Ödülü Al" : "Görevleri Bitir")) + "</button></div>";
    this.showPanel("Günlük", html, "daily", "world");
  };

  L.UiController.prototype.showEggs = function () {
    var state = this.game.state;
    if (!L.Eggs) return;
    var eggs = L.Eggs.ensureState(state);
    var html = "<div class='panel-row'><strong>Çatlayan:</strong> " + eggs.hatched + "<br><small>Yürüdükçe yumurtalar ilerler. Günlük ödül ve pazardan bulunur.</small></div>";
    html += "<div class='panel-grid'>";
    if (!eggs.inventory.length) html += "<div class='item-row'>Henüz yumurta yok.</div>";
    eggs.inventory.forEach(function (egg) {
      var percent = Math.min(100, Math.round((egg.steps || 0) / egg.stepsNeeded * 100));
      html += "<div class='item-row'><strong>" + L.Eggs.labelFor(egg.element) + " Yumurtası</strong><br><small>" + escapeHtml(egg.source || "gizemli") + "</small>" +
        "<div class='progress-shell'><span style='width:" + percent + "%'></span></div><small>" + percent + "%</small></div>";
    });
    html += "</div>";
    this.showPanel("Yumurtalar", html, "eggs", "world");
  };

  L.UiController.prototype.showMarket = function () {
    var state = this.game.state;
    L.Economy.ensureState(state);
    var mapId = this.game.map && this.game.map.id;
    var html = "<div class='panel-row'><strong>Konum:</strong> " + (this.game.map ? this.game.map.name : "") + "<br><strong>Para:</strong> " + state.money + " Luma<br><small>Ucuz aldığını pahalı bölgede sat.</small></div>";
    html += "<div class='panel-grid'>";
    L.Economy.tradeGoods.forEach(function (good) {
      var qty = state.market.goods[good.id] || 0;
      var buy = L.Economy.tradePrice(good.id, mapId, "buy");
      var sell = L.Economy.tradePrice(good.id, mapId, "sell");
      html += "<div class='item-row'><strong>" + good.name + "</strong><br><small>Elinde: " + qty + " • Al " + buy + " • Sat " + sell + "</small><br>" +
        "<button data-market-buy='" + good.id + "'>Al</button><button data-market-sell='" + good.id + "'" + (!qty ? " disabled" : "") + ">Sat</button></div>";
    });
    html += "<div class='item-row'><strong>Gizemli Luma Yumurtası</strong><br><small>420 Luma • yürüyerek çatlar</small><br><button data-egg-buy='1'>Yumurta Al</button></div>";
    html += "</div>";
    this.showPanel("Pazar", html, "market", "world");
  };

  L.UiController.prototype.showCrafting = function () {
    var state = this.game.state;
    if (!L.Progression) return;
    L.Progression.ensureState(state);
    var html = "<div class='panel-row resource-bank'>";
    Object.keys(L.Progression.resources).forEach(function (id) {
      var info = L.Progression.resources[id];
      html += "<span class='resource-chip' style='--chip:" + info.color + "'>" + info.name + ": " + (state.resources[id] || 0) + "</span>";
    });
    html += "<br><button class='primary' data-gather='1'>Burada Topla</button><small>Konuma gore ot, cevher, dal ya da kristal bulursun.</small></div>";
    html += "<div class='panel-grid'>";
    L.Progression.recipes.forEach(function (recipe) {
      var cost = Object.keys(recipe.cost).map(function (id) {
        return L.Progression.resourceName(id) + " x" + recipe.cost[id];
      }).join(", ");
      var canCraft = Object.keys(recipe.cost).every(function (id) {
        return (state.resources[id] || 0) >= recipe.cost[id];
      });
      html += "<div class='item-row'><strong>" + recipe.name + "</strong><br><small>" + recipe.description + "</small><br>" +
        "<small>Gerekli: " + cost + "</small><br><button data-craft='" + recipe.id + "'" + (!canCraft ? " disabled" : "") + ">Uret</button></div>";
    });
    html += "</div>";
    this.showPanel("Atolye", html, "crafting", "world");
  };

  L.UiController.prototype.showMinigames = function () {
    var state = this.game.state;
    if (!L.Progression) return;
    L.Progression.ensureState(state);
    var games = [
      { id: "race", name: "Ruzgar Kosusu", desc: "Aktif Luma ile refleks skoru. Ruzgar pasifi bonus verir." },
      { id: "garden", name: "Bahce Ritmi", desc: "Dogru zamanda hasat; ot ve dal kazandirir." },
      { id: "mining", name: "Kristal Madeni", desc: "Cevher ve kristal bulma mini isi." }
    ];
    var html = "<div class='panel-row'><strong>Oynanan:</strong> " + state.minigames.played + " • <strong>Galibiyet:</strong> " + state.minigames.wins +
      " • <strong>En iyi:</strong> " + state.minigames.bestScore + "</div><div class='panel-grid'>";
    games.forEach(function (game) {
      html += "<div class='item-row'><strong>" + game.name + "</strong><br><small>" + game.desc + "</small><br>" +
        "<button data-minigame='" + game.id + "'>Oyna</button></div>";
    });
    html += "</div>";
    this.showPanel("Mini Oyunlar", html, "minigames", "world");
  };

  L.UiController.prototype.showWeather = function () {
    var state = this.game.state;
    if (!L.Progression) return;
    L.Progression.ensureState(state);
    var creature = state.team[state.activeIndex] || state.team[0];
    var passive = creature ? L.Progression.passiveFor(creature) : null;
    var html = "<div class='panel-row'><strong>" + L.Progression.weatherLabel(state) + "</strong><br><small>Hava savasta element pasiflerini, gece/gunduz da Gölge ve Işık bonuslarini etkiler.</small></div>";
    if (creature && passive) {
      html += "<div class='panel-row'><strong>" + creature.displayName + "</strong><br><small>Dostluk: " + L.Progression.friendship(state, creature) + "/100</small><br>" +
        "<strong>" + passive.name + "</strong><br><small>" + passive.description + "</small></div>";
    }
    html += "<div class='panel-grid'>";
    L.Progression.weatherTypes.forEach(function (w) {
      html += "<div class='item-row'><strong>" + w.name + "</strong><br><small>Farkli Luma elementleri bu havada ufak savas bonuslari alir.</small></div>";
    });
    html += "</div>";
    this.showPanel("Hava ve Pasifler", html, "weather", "world");
  };

  L.UiController.prototype.showBosses = function () {
    var state = this.game.state;
    if (!L.Progression) return;
    L.Progression.ensureState(state);
    var html = "<div class='panel-row'><strong>Dev Boss Hikayesi</strong><br><small>Cusseli bosslar tek Luma ile gelir; kazandiginda para, malzeme ve boss yumurtasi verir.</small></div><div class='panel-grid'>";
    L.Progression.storyBosses.forEach(function (boss) {
      var defeated = !!state.storyBosses.defeated[boss.id];
      var map = window.LUMA_DATA.maps[boss.map];
      html += "<div class='item-row boss-card'><strong>" + boss.title + "</strong><br><small>" + boss.element + " • Sv. " + boss.level + " • " + (map ? map.name : boss.map) + "</small><br>" +
        "<small>" + boss.subtitle + "</small><br><span class='status-pill " + (defeated ? "done" : "") + "'>" + (defeated ? "Yenildi" : "Hazir") + "</span><br>" +
        "<button data-boss-story='" + boss.id + "'" + (defeated ? "" : " class='primary'") + ">" + (defeated ? "Tekrar Savas" : "Meydan Oku") + "</button></div>";
    });
    html += "</div>";
    this.showPanel("Dev Bosslar", html, "bosses", "world");
  };

  L.UiController.prototype.showEvolutionTree = function (index) {
    var creature = this.game.state.team[index];
    if (!creature || !L.Progression) return this.showTeam();
    var passive = L.Progression.passiveFor(creature);
    var html = "<div class='panel-row'><strong>" + creature.displayName + "</strong><br><small>" + creature.element + " • Sv. " + creature.level +
      " • Dostluk " + L.Progression.friendship(this.game.state, creature) + "/100</small><br><strong>" + passive.name + "</strong><br><small>" + passive.description + "</small></div>";
    html += L.Progression.evolutionTreeHtml(creature);
    html += "<button data-move-back='1'>Takima Don</button>";
    this.showPanel("Evrim Agaci", html, "evolutionTree", "world");
  };

  L.UiController.prototype.showMoveTutor = function (index) {
    var creature = this.game.state.team[index];
    if (!creature) return this.showTeam();
    var unlocked = L.Creatures.unlockedAbilityIds(creature);
    var active = {};
    creature.abilities.forEach(function (move) { active[move.id] = true; });
    var html = "<div class='panel-row'><strong>" + creature.displayName + "</strong><br><small>En fazla 4 yetenek aktif olabilir.</small></div><div class='panel-grid'>";
    unlocked.forEach(function (id) {
      var ability = L.Abilities.get(id);
      var selected = !!active[id];
      var full = creature.abilities.length >= 4 && !selected;
      html += "<div class='item-row'><strong>" + ability.name + "</strong><br><small>" + ability.element + " • " + ability.power + " güç • " + ability.description + "</small><br>" +
        "<button data-move-toggle='" + index + ":" + id + "'" + (full ? " disabled" : "") + ">" + (selected ? "Çıkar" : "Aktif Et") + "</button></div>";
    });
    html += "</div><button data-move-back='1'>Takıma Dön</button>";
    this.showPanel("Yetenekler", html, "moves", "world");
  };

  L.UiController.prototype.showMap = function () {
    var state = this.game.state;
    L.WorldMap.ensureState(state);
    var questTarget = L.WorldMap.questTarget(state);
    var nodes = L.WorldMap.allNodes();
    var links = L.WorldMap.allLinks();
    var html = "<div class='world-map-wrap'><div class='world-map'>";
    html += "<svg class='world-map-lines' viewBox='0 0 100 100' preserveAspectRatio='none'>";
    links.forEach(function (pair) {
      var a = L.WorldMap.positions[pair[0]];
      var b = L.WorldMap.positions[pair[1]];
      var known = state.world.discovered[pair[0]] || state.world.discovered[pair[1]];
      html += "<line x1='" + a[0] + "' y1='" + a[1] + "' x2='" + b[0] + "' y2='" + b[1] + "' class='" + (known ? "known" : "") + "'></line>";
    });
    html += "</svg>";
    nodes.forEach(function (node) {
      var discovered = !!state.world.discovered[node.id];
      var classes = ["map-node"];
      if (discovered) classes.push("discovered");
      if (node.id === state.mapId) classes.push("current");
      if (state.world.targetMapId === node.id) classes.push("target");
      if (questTarget && questTarget.mapId === node.id) classes.push("quest");
      html += "<button class='" + classes.join(" ") + "' style='left:" + node.x + "%;top:" + node.y + "%' data-map-target='" + node.id + "' title='" + node.name + "'>" +
        "<span>" + (node.id === state.mapId ? "▲" : (questTarget && questTarget.mapId === node.id ? "!" : "•")) + "</span></button>";
    });
    html += "</div><div class='map-side'>";
    var selected = state.world.targetMapId || (questTarget && questTarget.mapId) || state.mapId;
    var selectedMap = window.LUMA_DATA.maps[selected];
    html += "<div class='panel-row'><strong>Konum:</strong> " + this.game.map.name + "<br><strong>Hedef:</strong> " + (selectedMap ? selectedMap.name : "Yok") + "</div>";
    if (questTarget) html += "<div class='panel-row'><strong>Görev işareti:</strong><br><small>" + questTarget.label + "</small></div>";
    if (selectedMap) {
      var cost = L.WorldMap.fastTravelCost(state.mapId, selected);
      html += "<div class='panel-row'><strong>" + selectedMap.name + "</strong><br><small>" + selectedMap.w + "x" + selectedMap.h + " karo</small><br>" +
        "<button data-map-target='" + selected + "'>Hedef Yap</button>" +
        (selected !== state.mapId && L.WorldMap.canFastTravel(state, selected) ? "<button data-map-travel='" + selected + "'>Hızlı Git " + cost + "</button>" : "") +
        "</div>";
    }
    html += "<div class='panel-row'><small>▲ sen, ! görev, sarı halka hedef. Keşfedilen bölgelere hızlı seyahat açılır.</small></div>";
    html += "</div></div>";
    this.showPanel("Harita", html, "map", "world");
  };

  L.UiController.prototype.showLumadex = function () {
    var state = this.game.state;
    L.WorldMap.ensureState(state);
    var ids = Object.keys(window.LUMA_DATA.creatures);
    var seen = ids.filter(function (id) { return state.dex.seen[id]; }).length;
    var caught = ids.filter(function (id) { return state.dex.caught[id]; }).length;
    var html = "<div class='panel-row'><strong>Lumadex:</strong> " + caught + "/" + ids.length + " yakalandı • " + seen + "/" + ids.length + " görüldü</div>";
    html += "<div class='panel-grid dex-grid'>";
    ids.forEach(function (id, index) {
      var base = window.LUMA_DATA.creatures[id];
      var isSeen = !!state.dex.seen[id] || !!state.dex.caught[id];
      var isCaught = !!state.dex.caught[id];
      var colors = base.sprite && base.sprite.colors || ["#8a8f91", "#fff4d2", "#172033"];
      var habitats = L.WorldMap.habitats(id);
      var habitatNames = habitats.map(function (mapId) {
        return window.LUMA_DATA.maps[mapId] ? window.LUMA_DATA.maps[mapId].name : mapId;
      });
      var chain = L.Evolution ? L.Evolution.chainFor(id).map(function (cid) { return window.LUMA_DATA.creatures[cid].name; }).join(" > ") : base.name;
      var match = elementMatchups(base.element);
      html += "<div class='dex-card " + (isCaught ? "caught" : (isSeen ? "seen" : "unknown")) + "'>" +
        "<span class='dex-no'>#" + String(index + 1).padStart(3, "0") + "</span>" +
        "<span class='dex-dot' style='background:linear-gradient(135deg," + colors[0] + "," + colors[1] + "," + colors[2] + ")'></span>" +
        "<canvas class='dex-art' width='104' height='72' data-dex-art='" + id + "'></canvas>" +
        "<strong>" + (isSeen ? base.name : "???") + "</strong><br>" +
        "<small>" + (isSeen ? base.element + " • " + base.rarity : "Henüz görülmedi") + "</small><br>" +
        (isSeen ? "<small>Evrim: " + chain + "</small><br>" : "") +
        (isSeen ? "<small>Güçlü: " + match.strong + "</small><br><small>Zayıf olduğu: " + match.weakTo + "</small><br>" : "") +
        (isSeen && habitatNames.length ? "<small>Habitat: " + habitatNames.slice(0, 2).join(", ") + "</small><br>" : "") +
        (isCaught ? "<small class='dex-lore'>" + escapeHtml(base.description || "Bu Luma hakkinda bilgi az.") + "</small><br>" : "") +
        (habitats[0] ? "<button data-map-target='" + habitats[0] + "'>Habitat</button>" : "") +
        "</div>";
    });
    html += "</div>";
    this.showPanel("Lumadex", html, "dex", "world");
    this.renderPanelCreatureArt();
  };

  L.UiController.prototype.showBadges = function () {
    var state = this.game.state;
    L.WorldMap.ensureState(state);
    var badges = [
      ["leaf", "Yaprak Rozeti", "Botanik Bahçe"],
      ["ember", "Köz Rozeti", "Lav Kanyonu"],
      ["tide", "Dalga Rozeti", "Sahil Rotası"],
      ["stone", "Kristal Rozeti", "Kristal Maden"],
      ["wind", "Gök Rozeti", "Gök Kulesi"],
      ["spark", "Volt Rozeti", "Meteor Tepesi"],
      ["shadow", "Gece Rozeti", "Gece Korusu"],
      ["light", "Şafak Rozeti", "Arena Meydanı"]
    ];
    var count = badges.filter(function (b) { return state.badges[b[0]]; }).length;
    var html = "<div class='panel-row'><strong>Rozetler:</strong> " + count + "/" + badges.length + "<br><small>Arena liderlerini yenerek açılır.</small></div><div class='panel-grid'>";
    badges.forEach(function (badge) {
      var owned = !!state.badges[badge[0]];
      html += "<div class='badge-card " + (owned ? "owned" : "") + "'><span class='badge-medal'>" + (owned ? "◆" : "◇") + "</span><strong>" + badge[1] + "</strong><br><small>" + badge[2] + "</small><br><button data-boss-arena='" + badge[0] + "'>Arena İçine Gir</button></div>";
    });
    html += "</div>";
    this.showPanel("Rozetler", html, "badges", "world");
  };

  L.UiController.prototype.showAvatarShop = function () {
    var self = this;
    var state = this.game.state;
    L.Economy.ensureState(state);
    var html = "<div class='panel-row'><strong>Para:</strong> " + state.money + " Luma<br><small>Kilitli kıyafetleri bir kez alınca hep kullanabilirsin.</small></div>";
    html += "<div class='panel-grid'>";
    L.Economy.avatars.forEach(function (option) {
      var owned = !!state.avatar.unlocked[option.id];
      var active = state.avatar.outfit === option.id;
      html += "<div class='item-row avatar-card'><strong>" + option.name + "</strong><br>" +
        "<span class='avatar-swatch' data-outfit='" + option.id + "'></span><br>" +
        "<small>" + (owned ? "Açık" : option.price + " Luma") + (active ? " • Üzerinde" : "") + "</small><br>" +
        "<button data-avatar-outfit='" + option.id + "'" + (active ? " disabled" : "") + ">" + (owned ? "Giy" : "Al ve Giy") + "</button></div>";
    });
    html += "</div>";
    this.showPanel("Karakter Dükkanı", html, "avatar", "world");
    setTimeout(function () {
      self.panelContent.querySelectorAll(".avatar-swatch").forEach(function (swatch) {
        swatch.classList.add("outfit-" + swatch.getAttribute("data-outfit"));
      });
    }, 0);
  };

  L.UiController.prototype.showJobs = function () {
    var state = this.game.state;
    L.Economy.ensureState(state);
    var html = "<div class='panel-row'><strong>Toplam vardiya:</strong> " + state.jobs.shifts + "<br><strong>Kazanılan:</strong> " + state.jobs.earned + " Luma</div>";
    if (state.jobs.active) {
      var activeJob = L.Economy.jobs.find(function (job) { return job.id === state.jobs.active.jobId; });
      html += "<div class='panel-row job-challenge'><strong>" + (activeJob ? activeJob.name : "Vardiya") + "</strong><br>" +
        "<small>" + escapeHtml(state.jobs.active.question) + "</small><div class='choice-stack'>";
      state.jobs.active.choices.forEach(function (choice, index) {
        html += "<button data-work-answer='" + index + "'>" + escapeHtml(choice) + "</button>";
      });
      html += "</div></div>";
      this.showPanel("Meslekler", html, "jobs", "world");
      return;
    }
    html += "<div class='panel-grid'>";
    L.Economy.jobs.forEach(function (job) {
      var done = state.jobs.completed[job.id] || 0;
      html += "<div class='item-row'><strong>" + job.name + "</strong><br><small>" + job.place + " • " + done + " vardiya</small><br>" +
        "<span>" + job.pay + "+ Luma</span><br><button data-work-job='" + job.id + "'>Mini Vardiya</button></div>";
    });
    html += "</div>";
    this.showPanel("Meslekler", html, "jobs", "world");
  };

  L.UiController.prototype.showHousing = function () {
    var state = this.game.state;
    L.Economy.ensureState(state);
    var current = state.housing.status === "none" ? "Yok" : (state.housing.name + " • " + (state.housing.status === "owned" ? "Satın alındı" : "Kiralık"));
    var html = "<div class='panel-row'><strong>Mevcut ev:</strong> " + current + "<br><strong>Para:</strong> " + state.money + " Luma</div>";
    if (state.housing.status !== "none") {
      html += "<div class='panel-row'><button class='primary' data-home-visit='1'>Evime Git</button><br><small>Evde yatakla iyileşebilir, dekor masasıyla düzenleme yapabilirsin.</small></div>";
      if (L.Progression) {
        L.Progression.ensureState(state);
        var growth = Math.min(100, Math.floor((state.farm.growth || 0) / 80 * 100));
        html += "<div class='panel-row farm-row'><strong>Bahce</strong><br><small>Dikili: " + state.farm.planted + " • Hazir hasat: " + state.farm.harvestReady + " • Toplam hasat: " + state.farm.harvests + "</small>" +
          "<div class='progress-shell'><span style='width:" + growth + "%'></span></div>" +
          "<button data-farm-plant='1'>Fide Dik</button><button data-farm-harvest='1'" + (!state.farm.harvestReady ? " disabled" : "") + ">Hasat Al</button></div>";
      }
      html += "<div class='panel-grid'>";
      L.Economy.furniture.forEach(function (item) {
        var owned = !!state.housing.furniture[item.id];
        html += "<div class='item-row'><strong>" + item.name + "</strong><br><small>" + item.perk + "</small><br>" +
          "<span>" + (owned ? "Evde" : item.price + " Luma") + "</span><br><button data-home-decor='" + item.id + "'" + (owned ? " disabled" : "") + ">" + (owned ? "Yerleşti" : "Satın Al") + "</button></div>";
      });
      html += "</div>";
    }
    html += "<div class='panel-grid'>";
    L.Economy.homes.forEach(function (home) {
      html += "<div class='item-row'><strong>" + home.name + "</strong><br><small>" + home.district + "</small><br>" +
        "<span>Kira " + home.rent + " • Satın al " + home.buy + " Luma</span><br>" +
        "<button data-home-rent='" + home.id + "'>Kirala</button><button data-home-buy='" + home.id + "'>Satın Al</button></div>";
    });
    html += "</div>";
    this.showPanel("Emlak Ofisi", html, "housing", "world");
  };

  L.UiController.prototype.showMultiplayer = function (returnMode) {
    var mp = this.game.multiplayer;
    var hasGame = !!this.game.state;
    var html = "";
    if (!hasGame) {
      html += "<div class='panel-row'><strong>Önce oyuna gir</strong><br><small>Oda kurmak veya katılmak için Yeni Oyun başlat ya da bir kayıt yükle.</small></div>";
      html += "<button data-mp-new='1'>Yeni Oyun Başlat</button>";
      html += "<button data-mp-slots='1'>Kayıt Seç</button>";
      this.showPanel("Çok Oyunculu", html, "multiplayer", returnMode || "menu");
      return;
    }
    if (mp && mp.roomCode) {
      var meta = this.game.state.multiplayerMeta || {};
      html += "<div class='panel-row'><strong>Oda: " + mp.roomCode + "</strong><br><small>Bu kodu arkadaşına ver. Aynı haritadaysanız birbirinizi görebilirsiniz.</small></div>";
      html += "<div class='panel-row'><strong>Adın:</strong> " + escapeHtml(mp.playerName) + "<br><strong>Bağlı oyuncu:</strong> " + (Object.keys(mp.remotePlayers).length + 1) +
        "<br><small>PvP: " + (this.game.state.pvp && this.game.state.pvp.wins || 0) + "G / " + (this.game.state.pvp && this.game.state.pvp.losses || 0) + "M • " + (meta.ready ? "Hazır" : "Beklemede") + "</small></div>";
      html += "<div class='panel-grid mp-actions'><button data-mp-emote='Selam!'>Selam</button><button data-mp-ready='1'" + (meta.ready ? " class='primary'" : "") + ">" + (meta.ready ? "Hazır Değilim" : "Hazırım") + "</button><button data-mp-invite='trade'>Takas İste</button><button data-mp-invite='pvp'>PvP İste</button></div>";
      Object.keys(mp.remotePlayers).forEach(function (id) {
        var remote = mp.remotePlayers[id];
        if (remote && remote.invite) {
          html += "<div class='panel-row'><strong>" + escapeHtml(remote.name || "Oyuncu") + ":</strong> " + escapeHtml(remote.invite.label || "İstek") + " isteği gönderdi." +
            (remote.invite.kind === "pvp" ? "<br><button class='primary' data-mp-accept-pvp='" + escapeHtml(id) + "'>PvP Kabul Et</button>" : "") + "</div>";
        } else if (remote) {
          var preview = (remote.team || []).slice(0, 3).map(function (entry) {
            return escapeHtml((entry.displayName || entry.id || "Luma") + " Sv. " + (entry.level || 1));
          }).join("<br>");
          html += "<div class='panel-row'><strong>" + escapeHtml(remote.name || "Oyuncu") + "</strong><br><small>" + escapeHtml(remote.creature || "Takım hazır") + " • " + (remote.ready ? "Hazır" : "Beklemede") + "</small>" +
            (preview ? "<div class='mp-team-preview'>" + preview + "</div>" : "") + "</div>";
        }
      });
      html += "<button data-mp-leave='1' class='danger'>Odadan Çık</button>";
    } else {
      html += "<div class='panel-row'><label>Oyuncu adı<br><input data-mp-name maxlength='16' value='" + escapeHtml(mp ? mp.playerName : "Oyuncu") + "'></label></div>";
      html += "<div class='panel-grid'><button class='primary' data-mp-create='1'>Oda Kur</button></div>";
      html += "<div class='panel-row'><label>Oda kodu<br><input data-mp-code maxlength='8' placeholder='ABCDE'></label><br><button data-mp-join='1'>Odaya Katıl</button></div>";
      html += "<div class='panel-row'><small>Firebase bağlantısı için internet gerekir. Veritabanı kuralları izin vermiyorsa hata mesajı gösterilir.</small></div>";
    }
    this.showPanel("Çok Oyunculu", html, "multiplayer", returnMode || "world");
  };

  L.UiController.prototype.showSettings = function (returnMode) {
    var s = this.game.state ? this.game.state.settings : L.Save.loadSettings();
    var row = function (label, key, type) {
      if (type === "check") return "<label class='settings-row'><span>" + label + "</span><input type='checkbox' data-setting='" + key + "'" + (s[key] ? " checked" : "") + "></label>";
      return "<label class='settings-row'><span>" + label + "</span><input type='range' min='0' max='1' step='.05' value='" + s[key] + "' data-setting='" + key + "'></label>";
    };
    var html = row("Ana ses", "mainVolume") + row("Müzik", "musicVolume") + row("Efekt", "sfxVolume") +
      "<label class='settings-row'><span>Yazı hızı</span><input type='range' min='12' max='70' step='1' value='" + s.textSpeed + "' data-setting='textSpeed'></label>" +
      row("Ekran sarsıntısı", "screenShake", "check") + row("Dokunmatik kontroller", "touchControls", "check") +
      row("FPS göster", "showFps", "check") + row("Kontrol ipuçları", "showControls", "check") + row("Otomatik kayıt", "autosave", "check") +
      "<button data-setting-fullscreen='1'>Tam ekranı değiştir</button>";
    this.showPanel("Ayarlar", html, "settings", returnMode || "world");
  };

  L.UiController.prototype.showControls = function (returnMode) {
    var html = "<div class='panel-row'><strong>Masaüstü</strong><br>WASD / Oklar: Hareket<br>Sol Shift: Koş<br>E / Enter: Etkileşim<br>Escape: Menü<br>Q: Hızlı eşya<br>U: Sıkışmadan kurtul<br>F5: Hızlı kayıt<br>F9: Hızlı yükleme</div>" +
      "<div class='panel-row'><strong>Mobil</strong><br>Joystick hareket, A etkileşim, Koş koşma, Q hızlı eşya, Menü duraklatma içindir. Menüden Sıkışmadan Kurtul'u kullanabilirsin.</div>";
    this.showPanel("Kontroller", html, "controls", returnMode || "world");
  };

  L.UiController.prototype.showAbout = function (returnMode) {
    var html = "<div class='panel-row'><strong>Işık Muhafızları: Luma Yolu</strong><br>HTML5 Canvas, vanilla JavaScript ve programatik pixel art ile hazırlanmış özgün Türkçe yaratık toplama RPG'si.</div>";
    this.showPanel("Hakkında", html, "about", returnMode || "world");
  };

  L.UiController.prototype.showSlots = function (mode, returnMode) {
    var slots = L.Save.listSlots();
    var html = "<div class='panel-grid'>";
    slots.forEach(function (slot) {
      html += "<div class='slot-card'><strong>Kayıt " + slot.slot + "</strong><br>";
      if (slot.exists) {
        html += "<small>" + slot.mapName + " • " + slot.starter + " Sv. " + slot.level + " • " + fmtTime(slot.playTime) + "</small><br>";
        html += "<small>" + slot.money + " Luma • Rozet " + slot.badges + " • Dex " + slot.caught + " • PvP " + slot.pvpWins + "/" + slot.pvpLosses + " • Yumurta " + slot.eggs + "</small><br>";
        html += "<button data-slot-load='" + slot.slot + "'>Yükle</button><button data-slot-delete='" + slot.slot + "' class='danger'>Sil</button>";
      } else {
        html += "<small>Boş slot</small><br>";
      }
      if (mode === "save" && L.UI.game.state) html += "<button data-slot-save='" + slot.slot + "'>Buraya Kaydet</button>";
      html += "</div>";
    });
    html += "</div>";
    this.showPanel(mode === "save" ? "Kaydet" : "Kayıt Seç", html, "slots", returnMode || "menu");
  };

  L.UiController.prototype.handlePanelClick = function (button) {
    var pause = button.getAttribute("data-pause");
    if (pause) {
      if (pause === "team") this.showTeam();
      if (pause === "bag") this.showInventory();
      if (pause === "quests") this.showQuests();
      if (pause === "daily") this.showDaily();
      if (pause === "crafting") this.showCrafting();
      if (pause === "minigames") this.showMinigames();
      if (pause === "weather") this.showWeather();
      if (pause === "bosses") this.showBosses();
      if (pause === "map") this.showMap();
      if (pause === "dex") this.showLumadex();
      if (pause === "badges") this.showBadges();
      if (pause === "multiplayer") this.showMultiplayer("world");
      if (pause === "jobs") this.showJobs();
      if (pause === "housing") this.showHousing();
      if (pause === "eggs") this.showEggs();
      if (pause === "market") this.showMarket();
      if (pause === "unstuck") {
        this.closePanel();
        this.game.unstuckPlayer();
      }
      if (pause === "settings") this.showSettings("world");
      if (pause === "save") this.showSlots("save", "world");
      if (pause === "main" && confirm("Ana menüye dönmek istiyor musun? Kaydedilmemiş ilerleme kaybolabilir.")) {
        this.closePanel();
        this.showMain();
      }
      return;
    }
    var mapTarget = button.getAttribute("data-map-target");
    if (mapTarget) {
      L.WorldMap.setTarget(this.game.state, mapTarget);
      this.notify((window.LUMA_DATA.maps[mapTarget] ? window.LUMA_DATA.maps[mapTarget].name : mapTarget) + " hedeflendi.");
      if (this.panel.dataset.context === "map") this.showMap();
      return;
    }
    var mapTravel = button.getAttribute("data-map-travel");
    if (mapTravel) {
      if (this.game.fastTravelTo(mapTravel)) this.closePanel();
      return;
    }
    if (button.hasAttribute("data-daily-claim")) {
      if (L.Daily && L.Daily.claim(this.game)) {
        this.notify("Günlük ödül alındı.");
        if (L.Audio) L.Audio.play("confirm");
      } else {
        this.notify("Günlük ödül henüz hazır değil.");
        if (L.Audio) L.Audio.play("error");
      }
      this.showDaily();
      return;
    }
    if (button.hasAttribute("data-gather")) {
      if (L.Progression) this.notify(L.Progression.gather(this.game));
      if (L.Audio) L.Audio.play("pickup");
      this.showCrafting();
      return;
    }
    var craftId = button.getAttribute("data-craft");
    if (craftId) {
      var craftResult = L.Progression ? L.Progression.craft(this.game, craftId) : { ok: false, message: "Atolye hazir degil." };
      this.notify(craftResult.message);
      if (craftResult.ok && L.Audio) L.Audio.play("confirm");
      if (!craftResult.ok && L.Audio) L.Audio.play("error");
      this.showCrafting();
      return;
    }
    var minigame = button.getAttribute("data-minigame");
    if (minigame) {
      if (L.Progression) this.notify(L.Progression.playMinigame(this.game, minigame));
      if (L.Audio) L.Audio.play("confirm");
      this.showMinigames();
      return;
    }
    var storyBoss = button.getAttribute("data-boss-story");
    if (storyBoss) {
      var bossResult = L.Progression ? L.Progression.challengeStoryBoss(this.game, storyBoss) : { ok: false, message: "Boss sistemi hazir degil." };
      if (!bossResult.ok) {
        this.notify(bossResult.message);
        if (L.Audio) L.Audio.play("error");
      }
      return;
    }
    if (button.hasAttribute("data-farm-plant")) {
      var plantResult = L.Progression ? L.Progression.plant(this.game) : { ok: false, message: "Bahce hazir degil." };
      this.notify(plantResult.message);
      if (plantResult.ok && L.Audio) L.Audio.play("confirm");
      if (!plantResult.ok && L.Audio) L.Audio.play("error");
      this.showHousing();
      return;
    }
    if (button.hasAttribute("data-farm-harvest")) {
      var harvestResult = L.Progression ? L.Progression.harvest(this.game) : { ok: false, message: "Hasat hazir degil." };
      this.notify(harvestResult.message);
      if (harvestResult.ok && L.Audio) L.Audio.play("pickup");
      if (!harvestResult.ok && L.Audio) L.Audio.play("error");
      this.showHousing();
      return;
    }
    var bossArena = button.getAttribute("data-boss-arena");
    if (bossArena) {
      this.game.enterBossArena(bossArena);
      return;
    }
    var marketBuy = button.getAttribute("data-market-buy");
    if (marketBuy) {
      var buyTrade = L.Economy.buyTradeGood(this.game, marketBuy);
      this.notify(buyTrade.message);
      if (buyTrade.ok && L.Audio) L.Audio.play("confirm");
      if (!buyTrade.ok && L.Audio) L.Audio.play("error");
      this.showMarket();
      return;
    }
    var marketSell = button.getAttribute("data-market-sell");
    if (marketSell) {
      var sellTrade = L.Economy.sellTradeGood(this.game, marketSell);
      this.notify(sellTrade.message);
      if (sellTrade.ok && L.Audio) L.Audio.play("pickup");
      if (!sellTrade.ok && L.Audio) L.Audio.play("error");
      this.showMarket();
      return;
    }
    if (button.hasAttribute("data-egg-buy")) {
      if (this.game.state.money >= 420 && L.Eggs) {
        this.game.state.money -= 420;
        L.Eggs.grant(this.game, null, "pazar");
        this.notify("Gizemli Luma yumurtası alındı.");
        this.game.autosaveSoon();
        if (L.Audio) L.Audio.play("confirm");
      } else {
        this.notify("Yumurta için 420 Luma gerekiyor.");
        if (L.Audio) L.Audio.play("error");
      }
      this.showMarket();
      return;
    }
    if (button.hasAttribute("data-mp-new")) {
      this.closePanel();
      this.game.newGame();
      return;
    }
    if (button.hasAttribute("data-mp-slots")) {
      this.showSlots("load", "menu");
      return;
    }
    if (button.hasAttribute("data-mp-create")) {
      this.startMultiplayerCreate();
      return;
    }
    if (button.hasAttribute("data-mp-join")) {
      this.startMultiplayerJoin();
      return;
    }
    if (button.hasAttribute("data-mp-leave")) {
      this.game.multiplayer.leaveRoom().then(function () {
        L.UI.notify("Odadan çıkıldı.");
        L.UI.showMultiplayer("world");
      });
      return;
    }
    var mpEmote = button.getAttribute("data-mp-emote");
    if (mpEmote) {
      if (this.game.multiplayer.sendEmote(mpEmote)) this.notify("Mesaj gönderildi.");
      else this.notify("Önce bir odaya bağlan.");
      this.showMultiplayer("world");
      return;
    }
    if (button.hasAttribute("data-mp-ready")) {
      if (this.game.multiplayer.toggleReady()) this.notify("Hazır durumu güncellendi.");
      else this.notify("Önce bir odaya bağlan.");
      this.showMultiplayer("world");
      return;
    }
    var mpInvite = button.getAttribute("data-mp-invite");
    if (mpInvite) {
      var inviteResult = this.game.multiplayer.sendInvite(mpInvite);
      this.notify(inviteResult.message || (inviteResult.ok ? "İstek gönderildi." : "İstek gönderilemedi."));
      if (inviteResult.ok && L.Audio) L.Audio.play("confirm");
      if (!inviteResult.ok && L.Audio) L.Audio.play("error");
      this.showMultiplayer("world");
      return;
    }
    var acceptPvp = button.getAttribute("data-mp-accept-pvp");
    if (acceptPvp) {
      var acceptResult = this.game.multiplayer.acceptPvp(acceptPvp);
      this.notify(acceptResult.message);
      if (acceptResult.ok && L.Audio) L.Audio.play("confirm");
      if (!acceptResult.ok && L.Audio) L.Audio.play("error");
      if (!acceptResult.ok) this.showMultiplayer("world");
      return;
    }
    var outfit = button.getAttribute("data-avatar-outfit");
    if (outfit) {
      var avatarResult = L.Economy.setAvatar(this.game, outfit);
      this.notify(avatarResult.message);
      if (avatarResult.ok && L.Audio) L.Audio.play("confirm");
      if (!avatarResult.ok && L.Audio) L.Audio.play("error");
      this.showAvatarShop();
      return;
    }
    var job = button.getAttribute("data-work-job");
    if (job) {
      var workResult = L.Economy.startWork(this.game, job);
      this.notify(workResult.message);
      if (workResult.ok && L.Audio) L.Audio.play("confirm");
      if (!workResult.ok && L.Audio) L.Audio.play("error");
      this.showJobs();
      return;
    }
    var workAnswer = button.getAttribute("data-work-answer");
    if (workAnswer != null) {
      var shiftResult = L.Economy.finishWork(this.game, workAnswer);
      this.notify(shiftResult.message);
      if (shiftResult.ok && L.Audio) L.Audio.play(shiftResult.correct ? "confirm" : "pickup");
      if (!shiftResult.ok && L.Audio) L.Audio.play("error");
      this.showJobs();
      return;
    }
    if (button.hasAttribute("data-home-visit")) {
      this.closePanel();
      this.game.visitHome();
      return;
    }
    var decor = button.getAttribute("data-home-decor");
    if (decor) {
      var decorResult = L.Economy.decorateHome(this.game, decor);
      this.notify(decorResult.message);
      if (decorResult.ok && L.Audio) L.Audio.play("confirm");
      if (!decorResult.ok && L.Audio) L.Audio.play("error");
      this.showHousing();
      return;
    }
    var rent = button.getAttribute("data-home-rent");
    if (rent) {
      if (!this.game.state.quests.ilkEvAnahtari) L.Quests.start(this.game.state, "ilkEvAnahtari");
      var rentResult = L.Economy.rentHome(this.game, rent);
      this.notify(rentResult.message);
      if (rentResult.ok && L.Audio) L.Audio.play("confirm");
      if (!rentResult.ok && L.Audio) L.Audio.play("error");
      this.showHousing();
      return;
    }
    var buyHome = button.getAttribute("data-home-buy");
    if (buyHome) {
      if (!this.game.state.quests.ilkEvAnahtari) L.Quests.start(this.game.state, "ilkEvAnahtari");
      var buyResult = L.Economy.buyHome(this.game, buyHome);
      this.notify(buyResult.message);
      if (buyResult.ok && L.Audio) L.Audio.play("confirm");
      if (!buyResult.ok && L.Audio) L.Audio.play("error");
      this.showHousing();
      return;
    }
    var active = button.getAttribute("data-team-active");
    if (active != null) {
      this.game.state.activeIndex = Number(active);
      this.notify("Aktif yaratık değişti.");
      this.showTeam();
      return;
    }
    var evolve = button.getAttribute("data-team-evolve");
    if (evolve != null) {
      var evoCreature = this.game.state.team[Number(evolve)];
      if (L.Evolution && L.Evolution.evolveNow(this.game, evoCreature)) this.showTeam();
      else this.notify("Bu Luma henüz evrimleşemiyor.");
      return;
    }
    var teamTree = button.getAttribute("data-team-tree");
    if (teamTree != null) {
      this.showEvolutionTree(Number(teamTree));
      return;
    }
    var moveTeamIndex = button.getAttribute("data-team-moves");
    if (moveTeamIndex != null) {
      this.showMoveTutor(Number(moveTeamIndex));
      return;
    }
    var moveToggle = button.getAttribute("data-move-toggle");
    if (moveToggle) {
      var parts = moveToggle.split(":");
      var creatureIndex = Number(parts[0]);
      var moveId = parts[1];
      var moveCreature = this.game.state.team[creatureIndex];
      if (!moveCreature) return this.showTeam();
      var ids = moveCreature.abilities.map(function (move) { return move.id; });
      var current = ids.indexOf(moveId);
      if (current >= 0) {
        if (ids.length <= 1) this.notify("En az bir yetenek kalmalı.");
        else ids.splice(current, 1);
      } else if (ids.length < 4) {
        ids.push(moveId);
      }
      L.Creatures.setAbilityLoadout(moveCreature, ids);
      this.game.autosaveSoon();
      this.showMoveTutor(creatureIndex);
      return;
    }
    if (button.hasAttribute("data-move-back")) {
      this.showTeam();
      return;
    }
    var up = button.getAttribute("data-team-up");
    var down = button.getAttribute("data-team-down");
    if (up != null || down != null) {
      var i = Number(up != null ? up : down);
      var j = up != null ? i - 1 : i + 1;
      var team = this.game.state.team;
      if (j >= 0 && j < team.length) {
        var tmp = team[i];
        team[i] = team[j];
        team[j] = tmp;
        this.game.state.activeIndex = Math.max(0, Math.min(team.length - 1, this.game.state.activeIndex === i ? j : this.game.state.activeIndex));
      }
      this.showTeam();
      return;
    }
    var heal = button.getAttribute("data-team-heal");
    if (heal != null) {
      var target = this.game.state.team[Number(heal)];
      var itemId = this.game.state.inventory.kucukIksir > 0 ? "kucukIksir" : (this.game.state.inventory.buyukIksir > 0 ? "buyukIksir" : "tamIksir");
      var result = L.Inventory.useOnCreature(this.game.state, itemId, target);
      this.notify(result.message);
      if (result.ok && L.Audio) L.Audio.play("heal");
      this.showTeam();
      return;
    }
    var store = button.getAttribute("data-team-store");
    if (store != null) {
      var idx = Number(store);
      if (this.game.state.team.length <= 1) {
        this.notify("En az bir yaratık yanında kalmalı.");
      } else {
        this.game.state.storage.push(this.game.state.team.splice(idx, 1)[0]);
        this.game.state.activeIndex = 0;
      }
      this.showTeam();
      return;
    }
    var take = button.getAttribute("data-storage-take");
    if (take != null) {
      if (this.game.state.team.length >= 6) this.notify("Ekip dolu.");
      else this.game.state.team.push(this.game.state.storage.splice(Number(take), 1)[0]);
      this.showTeam();
      return;
    }
    var cat = button.getAttribute("data-inventory-cat");
    if (cat) {
      this.inventoryCategory = cat;
      this.showInventory();
      return;
    }
    var use = button.getAttribute("data-inventory-use");
    if (use) {
      var creature = this.game.state.team[this.game.state.activeIndex] || this.game.state.team[0];
      var useResult = L.Inventory.useOnCreature(this.game.state, use, creature);
      this.notify(useResult.message);
      if (useResult.ok && L.Audio) L.Audio.play("heal");
      this.showInventory();
      return;
    }
    var load = button.getAttribute("data-slot-load");
    if (load) {
      this.closePanel();
      this.game.loadSlot(Number(load));
      return;
    }
    var save = button.getAttribute("data-slot-save");
    if (save) {
      if (L.Save.getSlot(Number(save)) && !confirm("Bu kaydın üzerine yazılsın mı?")) return;
      this.game.saveSlot(Number(save));
      this.showSlots("save", "world");
      return;
    }
    var del = button.getAttribute("data-slot-delete");
    if (del) {
      if (confirm("Kayıt " + del + " silinsin mi?")) {
        L.Save.deleteSlot(Number(del));
        this.notify("Kayıt silindi.");
        this.showSlots("load", this.returnMode);
      }
      return;
    }
    if (button.hasAttribute("data-setting-fullscreen")) {
      this.game.toggleFullscreen();
    }
  };

  L.UiController.prototype.handleSettingInput = function (input) {
    var key = input.getAttribute("data-setting");
    if (!key) return;
    var state = this.game.state;
    var settings = state ? state.settings : L.Save.loadSettings();
    if (input.type === "checkbox") settings[key] = input.checked;
    else settings[key] = Number(input.value);
    if (state) state.settings = settings;
    L.Save.saveSettings(settings);
    L.Audio.applySettings(settings);
    document.body.classList.toggle("touch-enabled", !!settings.touchControls);
  };

  L.UiController.prototype.multiplayerNameValue = function () {
    var input = this.panelContent.querySelector("[data-mp-name]");
    return input ? input.value.trim() : "Oyuncu";
  };

  L.UiController.prototype.startMultiplayerCreate = function () {
    var self = this;
    this.notify("Oda kuruluyor...");
    this.game.multiplayer.createRoom(this.multiplayerNameValue()).then(function (code) {
      self.notify("Oda kuruldu: " + code);
      self.showMultiplayer("world");
    }).catch(function (err) {
      self.notify("Oda kurulamadı: " + err.message);
    });
  };

  L.UiController.prototype.startMultiplayerJoin = function () {
    var self = this;
    var codeInput = this.panelContent.querySelector("[data-mp-code]");
    var code = codeInput ? codeInput.value.trim() : "";
    this.notify("Odaya bağlanılıyor...");
    this.game.multiplayer.joinRoom(code, this.multiplayerNameValue()).then(function (roomCode) {
      self.notify("Odaya katıldın: " + roomCode);
      self.showMultiplayer("world");
    }).catch(function (err) {
      self.notify("Odaya katılamadın: " + err.message);
    });
  };
})();
