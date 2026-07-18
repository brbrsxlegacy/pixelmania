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
      "<button class='panel-row' data-pause='dex'>Lumadex</button>" +
      "<button class='panel-row' data-pause='badges'>Rozetler</button>" +
      "<button class='panel-row' data-pause='multiplayer'>Çok Oyunculu</button>" +
      "<button class='panel-row' data-pause='jobs'>Meslekler</button>" +
      "<button class='panel-row' data-pause='housing'>Evler</button>" +
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
      html += "<div class='team-card'><strong>" + (i === state.activeIndex ? "▶ " : "") + c.displayName + "</strong><br>" +
        "<small>" + c.element + " • Sv. " + c.level + " • HP " + c.hp + "/" + c.maxHp + " • EXP " + c.exp + "/" + c.expToNext + "</small><br>" +
        "<small>Güç " + c.attack + " • Savunma " + c.defense + " • Hız " + c.speed + "</small><br>" +
        "<small>" + c.abilities.map(function (a) { return a.name; }).join(", ") + "</small><br>" +
        (evo ? "<small>Evrim: " + evo.to.name + " • Sv. " + evo.level + "</small><br>" : "") +
        "<button data-team-active='" + i + "'>Aktif Yap</button>" +
        (evo && evo.ready ? "<button data-team-evolve='" + i + "' class='primary'>Evrimle</button>" : "") +
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
      var chain = L.Evolution ? L.Evolution.chainFor(id).map(function (cid) { return window.LUMA_DATA.creatures[cid].name; }).join(" > ") : base.name;
      html += "<div class='dex-card " + (isCaught ? "caught" : (isSeen ? "seen" : "unknown")) + "'>" +
        "<span class='dex-no'>#" + String(index + 1).padStart(3, "0") + "</span>" +
        "<span class='dex-dot' style='background:linear-gradient(135deg," + colors[0] + "," + colors[1] + "," + colors[2] + ")'></span>" +
        "<strong>" + (isSeen ? base.name : "???") + "</strong><br>" +
        "<small>" + (isSeen ? base.element + " • " + base.rarity : "Henüz görülmedi") + "</small><br>" +
        (isSeen ? "<small>Evrim: " + chain + "</small><br>" : "") +
        (habitats[0] ? "<button data-map-target='" + habitats[0] + "'>Habitat</button>" : "") +
        "</div>";
    });
    html += "</div>";
    this.showPanel("Lumadex", html, "dex", "world");
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
      html += "<div class='badge-card " + (owned ? "owned" : "") + "'><span class='badge-medal'>" + (owned ? "◆" : "◇") + "</span><strong>" + badge[1] + "</strong><br><small>" + badge[2] + "</small></div>";
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
      html += "<div class='panel-row'><strong>Oda: " + mp.roomCode + "</strong><br><small>Bu kodu arkadaşına ver. Aynı haritadaysanız birbirinizi görebilirsiniz.</small></div>";
      html += "<div class='panel-row'><strong>Adın:</strong> " + escapeHtml(mp.playerName) + "<br><strong>Bağlı oyuncu:</strong> " + (Object.keys(mp.remotePlayers).length + 1) + "</div>";
      html += "<div class='panel-grid mp-actions'><button data-mp-emote='Selam!'>Selam</button><button data-mp-invite='trade'>Takas İste</button><button data-mp-invite='pvp'>PvP İste</button></div>";
      Object.keys(mp.remotePlayers).forEach(function (id) {
        var remote = mp.remotePlayers[id];
        if (remote && remote.invite) {
          html += "<div class='panel-row'><strong>" + escapeHtml(remote.name || "Oyuncu") + ":</strong> " + escapeHtml(remote.invite.label || "İstek") + " isteği gönderdi.</div>";
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
      if (pause === "dex") this.showLumadex();
      if (pause === "badges") this.showBadges();
      if (pause === "multiplayer") this.showMultiplayer("world");
      if (pause === "jobs") this.showJobs();
      if (pause === "housing") this.showHousing();
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
    var mpInvite = button.getAttribute("data-mp-invite");
    if (mpInvite) {
      if (this.game.multiplayer.sendInvite(mpInvite)) this.notify((mpInvite === "trade" ? "Takas" : "PvP") + " isteği gönderildi.");
      else this.notify("Önce bir odaya bağlan.");
      this.showMultiplayer("world");
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
