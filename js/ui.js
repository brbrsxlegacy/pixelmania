(function () {
  var L = window.LUMA = window.LUMA || {};

  function fmtTime(seconds) {
    seconds = Math.floor(seconds || 0);
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    return (h ? h + "s " : "") + m + "d";
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
      var action = button.getAttribute("data-menu-action");
      if (L.Audio) L.Audio.play("confirm");
      if (action === "new") self.game.newGame();
      if (action === "continue") self.game.continueLatest();
      if (action === "slots") self.showSlots("load", "menu");
      if (action === "settings") self.showSettings("menu");
      if (action === "controls") self.showControls("menu");
      if (action === "about") self.showAbout("menu");
    });

    this.panelClose.addEventListener("click", function () { self.closePanel(); });
    this.panelContent.addEventListener("click", function (event) {
      var target = event.target.closest("button");
      if (!target) return;
      if (L.Shop.handleClick && L.Shop.handleClick(target)) return;
      self.handlePanelClick(target);
    });
    this.panelContent.addEventListener("input", function (event) {
      self.handleSettingInput(event.target);
    });

    this.starterScreen.addEventListener("click", function (event) {
      var button = event.target.closest("[data-starter-action]");
      if (!button) return;
      var action = button.getAttribute("data-starter-action");
      if (action === "prev") self.starterIndex = (self.starterIndex + self.starterIds.length - 1) % self.starterIds.length;
      if (action === "next") self.starterIndex = (self.starterIndex + 1) % self.starterIds.length;
      if (action === "select") self.game.chooseStarter(self.starterIds[self.starterIndex]);
      if (action === "back") self.closeStarter();
      if (action === "prev" || action === "next") {
        if (L.Audio) L.Audio.play("menu");
        self.renderStarter();
      }
    });
  };

  L.UiController.prototype.showMain = function () {
    this.mainMenu.classList.remove("hidden");
    document.getElementById("worldHud").classList.add("hidden");
    this.game.mode = "menu";
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

  L.UiController.prototype.showPause = function () {
    var html = "<div class='panel-grid'>" +
      "<button class='panel-row' data-pause='team'>Yaratıklar</button>" +
      "<button class='panel-row' data-pause='bag'>Çanta</button>" +
      "<button class='panel-row' data-pause='quests'>Görevler</button>" +
      "<button class='panel-row' data-pause='map'>Harita</button>" +
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
      html += "<div class='team-card'><strong>" + (i === state.activeIndex ? "▶ " : "") + c.displayName + "</strong><br>" +
        "<small>" + c.element + " • Sv. " + c.level + " • HP " + c.hp + "/" + c.maxHp + " • EXP " + c.exp + "/" + c.expToNext + "</small><br>" +
        "<small>Güç " + c.attack + " • Savunma " + c.defense + " • Hız " + c.speed + "</small><br>" +
        "<small>" + c.abilities.map(function (a) { return a.name; }).join(", ") + "</small><br>" +
        "<button data-team-active='" + i + "'>Aktif Yap</button>" +
        "<button data-team-up='" + i + "'>Yukarı</button><button data-team-down='" + i + "'>Aşağı</button>" +
        "<button data-team-heal='" + i + "'>İksir Kullan</button>" +
        "<button data-team-store='" + i + "'>Depoya Gönder</button></div>";
    });
    html += "</div>";
    if (state.storage.length) {
      html += "<h3>Depo</h3><div class='panel-grid'>";
      state.storage.forEach(function (c, i) {
        html += "<div class='team-card'><strong>" + c.displayName + "</strong><br><small>" + c.element + " • Sv. " + c.level + "</small><br>" +
          "<button data-storage-take='" + i + "'>Ekibe Al</button></div>";
      });
      html += "</div>";
    }
    this.showPanel("Yaratıklar", html, "team", "world");
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

  L.UiController.prototype.showMap = function () {
    var state = this.game.state;
    var html = "<div class='panel-grid'>";
    Object.keys(window.LUMA_DATA.maps).forEach(function (id) {
      var m = window.LUMA_DATA.maps[id];
      html += "<div class='panel-row'><strong>" + (state.mapId === id ? "▶ " : "") + m.name + "</strong><br><small>" + m.w + "x" + m.h + " karo</small></div>";
    });
    html += "</div>";
    this.showPanel("Harita", html, "map", "world");
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
    var html = "<div class='panel-row'><strong>Masaüstü</strong><br>WASD / Oklar: Hareket<br>Sol Shift: Koş<br>E / Enter: Etkileşim<br>Escape: Menü<br>Q: Hızlı eşya<br>F5: Hızlı kayıt<br>F9: Hızlı yükleme</div>" +
      "<div class='panel-row'><strong>Mobil</strong><br>Yön pedi hareket, A etkileşim, Koş koşma, Q hızlı eşya, Menü duraklatma içindir.</div>";
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
      if (pause === "map") this.showMap();
      if (pause === "settings") this.showSettings("world");
      if (pause === "save") this.showSlots("save", "world");
      if (pause === "main" && confirm("Ana menüye dönmek istiyor musun? Kaydedilmemiş ilerleme kaybolabilir.")) {
        this.closePanel();
        this.showMain();
      }
      return;
    }
    var active = button.getAttribute("data-team-active");
    if (active != null) {
      this.game.state.activeIndex = Number(active);
      this.notify("Aktif yaratık değişti.");
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
})();
