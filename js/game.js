(function () {
  var L = window.LUMA = window.LUMA || {};

  function defaultState(settings) {
    return {
      version: 1,
      playerName: "Oyuncu",
      mapId: "isikpinar",
      player: { x: 25 * 16 + 1, y: 30 * 16 - 2, dir: "down" },
      checkpoint: { mapId: "isikpinar", x: 25, y: 30 },
      team: [],
      storage: [],
      activeIndex: 0,
      inventory: L.Inventory.createInitial(),
      money: 500,
      quests: L.Quests.createState(),
      avatar: { outfit: "guardian", unlocked: { guardian: true } },
      jobs: { shifts: 0, earned: 0, completed: {}, active: null },
      housing: { status: "none", homeId: null, furniture: {} },
      city: { mayorMet: false },
      world: { targetMapId: null, discovered: { isikpinar: true } },
      dex: { seen: {}, caught: {} },
      badges: {},
      story: { introSeen: false, starterChosen: false, rivalFirstDone: false },
      defeatedTrainers: {},
      collectedItems: {},
      settings: Object.assign(L.Save.defaultSettings(), settings || {}),
      playTime: 0,
      quickSlot: 1,
      savedAt: 0
    };
  }

  L.Game = function () {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.mode = "menu";
    this.time = 0;
    this.fps = 60;
    this.state = null;
    this.mapSystem = new L.MapSystem();
    this.map = null;
    this.input = new L.Input();
    this.camera = new L.Camera(480, 270);
    this.player = new L.Player(25, 30);
    this.npcs = new L.NpcManager();
    this.roamers = new L.RoamerManager();
    this.particles = new L.Particles();
    this.ui = new L.UiController(this);
    this.dialogue = new L.Dialogue(this);
    this.battle = new L.Battle(this);
    this.multiplayer = new L.Multiplayer(this);
    this.encounterCooldown = 0;
    this.transitionCooldown = 0;
    this.autosaveTimer = 0;
    this.lastFrame = performance.now();
    this.pendingTrainer = null;
    this.settings = L.Save.loadSettings();
    L.Audio.applySettings(this.settings);
    document.body.classList.toggle("touch-enabled", !!this.settings.touchControls);
    this.ui.showMain();
  };

  L.Game.prototype.start = function () {
    var self = this;
    requestAnimationFrame(function frame(now) {
      var dt = Math.min(.05, (now - self.lastFrame) / 1000);
      self.lastFrame = now;
      self.time += dt;
      self.fps = self.fps * .9 + (1 / Math.max(dt, .001)) * .1;
      self.update(dt);
      self.render();
      self.input.endFrame();
      requestAnimationFrame(frame);
    });
  };

  L.Game.prototype.newGame = function () {
    this.state = defaultState(L.Save.loadSettings());
    L.Audio.applySettings(this.state.settings);
    this.loadMap("isikpinar");
    this.player.x = this.state.player.x;
    this.player.y = this.state.player.y;
    this.player.dir = "down";
    this.ui.hideMain();
    L.Quests.start(this.state, "ilkYolArkadasin", true);
    this.state.story.introSeen = true;
    var self = this;
    this.dialogue.show("Profesör Liora", [
      "Günaydın! Işıkpınar Köyü'nün kristalleri bugün erkenden uyandı.",
      "Laboratuvara uğra. Yolculuğa başlamadan önce sana uygun bir Luma yoldaşı seçelim.",
      "Kontrolleri unutma: WASD ya da ok tuşlarıyla yürü, E ile konuş, Escape ile menüyü aç."
    ], function () {
      self.autosaveSoon();
    });
  };

  L.Game.prototype.continueLatest = function () {
    var latest = L.Save.latestSlot();
    if (!latest) {
      this.ui.notify("Kayıt bulunamadı.");
      if (L.Audio) L.Audio.play("error");
      return;
    }
    this.loadState(latest.state);
  };

  L.Game.prototype.loadSlot = function (slot) {
    var state = L.Save.getSlot(slot);
    if (!state) {
      this.ui.notify("Bu slot boş ya da bozuk.");
      return;
    }
    this.loadState(state);
  };

  L.Game.prototype.loadState = function (state) {
    state = state && typeof state === "object" ? state : {};
    var base = defaultState(L.Save.loadSettings());
    this.state = Object.assign(base, state);
    if (!this.mapSystem.get(this.state.mapId)) this.state.mapId = "isikpinar";
    this.state.player = Object.assign({}, base.player, state.player || {});
    this.state.checkpoint = Object.assign({}, base.checkpoint, state.checkpoint || {});
    this.state.team = Array.isArray(state.team) ? state.team : [];
    this.state.storage = Array.isArray(state.storage) ? state.storage : [];
    this.state.inventory = Object.assign(L.Inventory.createInitial(), state.inventory || {});
    this.state.quests = state.quests && typeof state.quests === "object" ? state.quests : L.Quests.createState();
    this.state.defeatedTrainers = Object.assign({}, state.defeatedTrainers || {});
    this.state.collectedItems = Object.assign({}, state.collectedItems || {});
    this.state.story = Object.assign({}, base.story, state.story || {});
    this.state.settings = Object.assign(L.Save.defaultSettings(), L.Save.loadSettings(), this.state.settings || {});
    this.state.avatar = Object.assign(base.avatar, state.avatar || {});
    this.state.avatar.unlocked = Object.assign({ guardian: true }, this.state.avatar.unlocked || {});
    this.state.jobs = Object.assign(base.jobs, state.jobs || {});
    this.state.jobs.completed = Object.assign({}, base.jobs.completed, this.state.jobs.completed || {});
    this.state.housing = Object.assign(base.housing, state.housing || {});
    this.state.city = Object.assign(base.city, state.city || {});
    if (L.Economy) L.Economy.ensureState(this.state);
    if (L.WorldMap) L.WorldMap.ensureState(this.state);
    L.Creatures.serializeFix(this.state);
    L.Audio.applySettings(this.state.settings);
    this.loadMap(this.state.mapId || "isikpinar");
    this.player.x = this.state.player.x || 25 * 16 + 1;
    this.player.y = this.state.player.y || 30 * 16 - 2;
    this.player.dir = this.state.player.dir || "down";
    this.ensurePlayerSafe("load");
    this.state.activeIndex = Math.max(0, Math.min(this.state.team.length - 1, this.state.activeIndex || 0));
    this.ui.hideMain();
    this.ui.closePanel();
    this.mode = "world";
    this.camera.follow(this.player, this.map, 1);
    this.ui.notify("Kayıt yüklendi.");
  };

  L.Game.prototype.updateBodyMode = function () {
    document.body.classList.toggle("world-input-active", !!this.state && this.mode === "world");
  };

  L.Game.prototype.syncState = function () {
    if (!this.state) return;
    this.state.mapId = this.map ? this.map.id : this.state.mapId;
    this.state.player = { x: this.player.x, y: this.player.y, dir: this.player.dir };
  };

  L.Game.prototype.saveSlot = function (slot) {
    if (!this.state) return;
    this.syncState();
    this.state.quickSlot = slot;
    L.Save.saveSlot(slot, this.state);
    this.ui.notify("Kayıt " + slot + " kaydedildi.");
    if (L.Audio) L.Audio.play("confirm");
  };

  L.Game.prototype.quickSave = function () {
    if (!this.state) return;
    this.syncState();
    L.Save.quickSave(this.state);
    this.ui.notify("Hızlı kayıt tamam.");
    if (L.Audio) L.Audio.play("confirm");
  };

  L.Game.prototype.quickLoad = function () {
    var state = L.Save.quickLoad(this.state || { quickSlot: 1 });
    if (!state) {
      this.ui.notify("Hızlı kayıt bulunamadı.");
      if (L.Audio) L.Audio.play("error");
      return;
    }
    this.loadState(state);
  };

  L.Game.prototype.autosaveSoon = function () {
    if (this.state && this.state.settings.autosave) this.autosaveTimer = .8;
  };

  L.Game.prototype.loadMap = function (mapId) {
    this.map = this.mapSystem.get(mapId);
    this.state.mapId = mapId;
    if (L.WorldMap) L.WorldMap.discover(this.state, mapId);
    this.npcs.load(mapId);
    if (this.roamers) this.roamers.load(this.map, this.state);
    L.Quests.progress(this.state, "visit_" + mapId, 1);
    if (mapId === "kristalGol") L.Quests.progress(this.state, "reachLake", 1);
    if (mapId === "magara") L.Quests.progress(this.state, "enterCave", 1);
  };

  L.Game.prototype.changeMap = function (exit) {
    var self = this;
    if (this.transitionCooldown > 0) return;
    this.transitionCooldown = .75;
    this.mode = "transition";
    document.getElementById("fadeLayer").classList.add("active");
    setTimeout(function () {
      self.loadMap(exit.to);
      self.player.setTile(exit.spawnX, exit.spawnY);
      self.ensurePlayerSafe("transition");
      self.camera.follow(self.player, self.map, 1);
      self.syncState();
      self.autosaveSoon();
    }, 260);
    setTimeout(function () {
      document.getElementById("fadeLayer").classList.remove("active");
      self.mode = "world";
    }, 520);
  };

  L.Game.prototype.findSafeCheckpoint = function (mapId, tileX, tileY) {
    var map = this.mapSystem.get(mapId);
    if (!map) return { mapId: "isikpinar", x: 25, y: 30 };
    for (var radius = 0; radius <= 14; radius += 1) {
      for (var yy = tileY - radius; yy <= tileY + radius; yy += 1) {
        for (var xx = tileX - radius; xx <= tileX + radius; xx += 1) {
          if (xx < 1 || yy < 1 || xx >= map.w - 1 || yy >= map.h - 1) continue;
          if (this.isSafeTile(map, xx, yy)) return { mapId: mapId, x: xx, y: yy };
        }
      }
    }
    return { mapId: mapId, x: 1, y: 1 };
  };

  L.Game.prototype.isSafeTile = function (map, tileX, tileY) {
    if (!map || tileX < 1 || tileY < 1 || tileX >= map.w - 1 || tileY >= map.h - 1) return false;
    var px = tileX * 16 + 1;
    var py = tileY * 16 - 2;
    var foot = this.player.footRect(px, py);
    var blockers = this.map && map.id === this.map.id ? this.npcs.current : [];
    return !L.Collision.rectBlocked(map, foot.x, foot.y, foot.w, foot.h, blockers);
  };

  L.Game.prototype.playerTile = function () {
    var foot = this.player.footRect(this.player.x, this.player.y);
    return L.Collision.tileAtPixel(this.map, foot.x + foot.w / 2, foot.y + foot.h / 2);
  };

  L.Game.prototype.playerBlocked = function () {
    if (!this.map) return false;
    var foot = this.player.footRect(this.player.x, this.player.y);
    return L.Collision.rectBlocked(this.map, foot.x, foot.y, foot.w, foot.h, this.npcs.current);
  };

  L.Game.prototype.ensurePlayerSafe = function (reason) {
    if (!this.map || !this.playerBlocked()) return false;
    var tile = this.playerTile();
    var safe = this.findSafeCheckpoint(this.map.id, tile.x, tile.y);
    this.player.setTile(safe.x, safe.y);
    this.player.dir = "down";
    this.camera.follow(this.player, this.map, 1);
    this.syncState();
    if (reason === "load" || reason === "manual") this.autosaveSoon();
    if (reason === "manual" && this.ui) this.ui.notify("Sıkışmadan kurtuldun.");
    if (reason === "load" && this.ui) this.ui.notify("Kayıttaki sıkışma düzeltildi.");
    return true;
  };

  L.Game.prototype.hasMovementRoom = function (map, tileX, tileY) {
    if (!this.isSafeTile(map, tileX, tileY)) return false;
    var px = tileX * 16 + 1;
    var py = tileY * 16 - 2;
    var foot = this.player.footRect(px, py);
    var blockers = this.map && map.id === this.map.id ? this.npcs.current : [];
    var offsets = [[0, -10], [0, 10], [-10, 0], [10, 0]];
    for (var i = 0; i < offsets.length; i += 1) {
      if (!L.Collision.rectBlocked(map, foot.x + offsets[i][0], foot.y + offsets[i][1], foot.w, foot.h, blockers)) return true;
    }
    return false;
  };

  L.Game.prototype.findSafeMoveTile = function (mapId, tileX, tileY) {
    var map = this.mapSystem.get(mapId);
    if (!map) return { mapId: "isikpinar", x: 25, y: 30 };
    for (var radius = 0; radius <= 16; radius += 1) {
      for (var yy = tileY - radius; yy <= tileY + radius; yy += 1) {
        for (var xx = tileX - radius; xx <= tileX + radius; xx += 1) {
          if (xx < 1 || yy < 1 || xx >= map.w - 1 || yy >= map.h - 1) continue;
          if (this.hasMovementRoom(map, xx, yy)) return { mapId: mapId, x: xx, y: yy };
        }
      }
    }
    return this.findSafeCheckpoint(mapId, tileX, tileY);
  };

  L.Game.prototype.unstuckPlayer = function () {
    if (!this.state || !this.map) return;
    if (!this.ensurePlayerSafe("manual")) {
      var tile = this.playerTile();
      var safe = this.findSafeMoveTile(this.map.id, tile.x, tile.y);
      this.player.setTile(safe.x, safe.y);
      this.player.dir = "down";
      this.camera.follow(this.player, this.map, 1);
      this.syncState();
      this.autosaveSoon();
      this.ui.notify("En yakın güvenli noktaya alındın.");
    }
  };

  L.Game.prototype.healingCheckpoint = function () {
    return this.findSafeCheckpoint("isikpinar", 17, 31);
  };

  L.Game.prototype.returnToCheckpoint = function () {
    var cp = this.state.checkpoint || { mapId: "isikpinar", x: 25, y: 30 };
    var safe = this.findSafeCheckpoint(cp.mapId, cp.x, cp.y);
    this.loadMap(safe.mapId);
    this.player.setTile(safe.x, safe.y);
    this.player.dir = "down";
    this.camera.follow(this.player, this.map, 1);
    this.syncState();
    this.autosaveSoon();
  };

  L.Game.prototype.chooseStarter = function (starterId) {
    if (this.state.story.starterChosen) {
      this.ui.closeStarter();
      return;
    }
    var starter = L.Creatures.create(starterId, 5);
    L.Creatures.addToCollection(this.state, starter);
    if (L.WorldMap) L.WorldMap.recordCaught(this.state, starterId);
    this.state.activeIndex = 0;
    this.state.story.starterChosen = true;
    L.Quests.progress(this.state, "chooseStarter", 1);
    this.ui.closeStarter();
    var self = this;
    this.dialogue.show("Arven", [
      "Demek " + starter.displayName + " seçtin! Güzel seçim, ama benimki de fena değil.",
      "Hadi küçük bir dostluk maçı yapalım. Kaybeden laboratuvar masalarını toplar!"
    ], function () {
      self.startRivalBattle(starterId);
    });
  };

  L.Game.prototype.startRivalBattle = function (starterId) {
    var rivalStarter = { filizik: "kopukcu", kozpati: "filizik", kopukcu: "kozpati" }[starterId] || "filizik";
    var trainer = {
      id: "rival_first",
      name: "Arven",
      money: 120,
      questObjective: "beatRival",
      afterDialogue: ["Tamam tamam, masaları ben toplarım. Sen de yola çık; Yeşilova seni bekliyor."]
    };
    this.battle.startTrainer(trainer, [L.Creatures.create(rivalStarter, 5)]);
  };

  L.Game.prototype.trainerParty = function (npc) {
    return (npc.team || []).map(function (entry) {
      return L.Creatures.create(entry.creatureId, entry.level);
    });
  };

  L.Game.prototype.handleNpc = function (npc) {
    var self = this;
    this.npcs.facePlayer(npc, this.player);
    if (npc.type === "trainer") {
      if (this.state.defeatedTrainers[npc.id]) {
        this.dialogue.show(npc.name, npc.afterDialogue || ["Tekrar savaşmak için biraz çalışmam lazım."]);
      } else {
        this.dialogue.show(npc.name, npc.dialogue || ["Maç zamanı!"], function () {
          self.battle.startTrainer(npc, self.trainerParty(npc));
        });
      }
      return;
    }
    if (npc.action === "professor") {
      if (!this.state.story.starterChosen) {
        this.dialogue.show(npc.name, npc.dialogue, function () { self.ui.openStarter(); });
      } else {
        this.dialogue.show(npc.name, ["Ekibin güzel görünüyor. Yeni bölgelerde farklı elementlere yer açmayı unutma."]);
      }
      return;
    }
    if (npc.action === "heal") return this.healTeam(npc);
    if (npc.action === "shop") {
      this.dialogue.show(npc.name, npc.dialogue, function () { L.Shop.open(self); });
      return;
    }
    if (npc.action === "mayor") {
      if (!this.state.quests.sehirPasaportu) L.Quests.start(this.state, "sehirPasaportu");
      this.state.city.mayorMet = true;
      L.Quests.progress(this.state, "talkMayor", 1);
      this.dialogue.show(npc.name, npc.dialogue || ["Şehrin kapısı sana açık."], function () {
        L.Quests.startBoardBatch(self.state, 2);
      });
      return;
    }
    if (npc.action === "quest_board") {
      this.dialogue.show(npc.name, npc.dialogue || ["Panodaki işleri inceleyelim."], function () {
        var started = L.Quests.startBoardBatch(self.state, 4);
        self.ui.notify(started.length ? "Yeni işler çantanda." : "Şimdilik alınacak yeni pano görevi yok.");
      });
      return;
    }
    if (npc.action === "avatar_shop") {
      this.dialogue.show(npc.name, npc.dialogue || ["Yeni bir tarz seçelim."], function () { self.ui.showAvatarShop(); });
      return;
    }
    if (npc.action === "job_board") {
      this.dialogue.show(npc.name, npc.dialogue || ["Bugünkü vardiyalara bakalım."], function () { self.ui.showJobs(); });
      return;
    }
    if (npc.action === "real_estate") {
      if (!this.state.quests.ilkEvAnahtari) L.Quests.start(this.state, "ilkEvAnahtari");
      this.dialogue.show(npc.name, npc.dialogue || ["Ev seçeneklerine bakalım."], function () { self.ui.showHousing(); });
      return;
    }
    if (npc.action === "quest_kayipKristal") {
      if (!this.state.quests.kayipKristal) L.Quests.start(this.state, "kayipKristal");
      this.dialogue.show(npc.name, npc.dialogue);
      return;
    }
    if (npc.action === "quest_ormandakiSes") {
      if (!this.state.quests.ormandakiSes) L.Quests.start(this.state, "ormandakiSes");
      L.Quests.progress(this.state, "talkRanger", 1);
      this.dialogue.show(npc.name, npc.dialogue);
      return;
    }
    if (npc.action === "quest_golKenariGizemi") {
      if (!this.state.quests.golKenariGizemi) L.Quests.start(this.state, "golKenariGizemi");
      L.Quests.progress(this.state, "reachLake", 1);
      this.dialogue.show(npc.name, npc.dialogue);
      return;
    }
    if (npc.action === "quest_magara") {
      if (!this.state.quests.magaraninDerinlikleri) L.Quests.start(this.state, "magaraninDerinlikleri");
      L.Quests.progress(this.state, "enterCave", 1);
      this.dialogue.show(npc.name, npc.dialogue);
      return;
    }
    if (npc.action === "rival_late") {
      if (this.state.defeatedTrainers.rival_cave) this.dialogue.show(npc.name, ["Bir dahaki sefere daha sert geleceğim."]);
      else {
        this.dialogue.show(npc.name, npc.dialogue, function () {
          self.battle.startTrainer({ id: "rival_cave", name: "Arven", money: 240, afterDialogue: ["Yine iyisin. Derinlerdeki ışık sende kalsın."] }, [
            L.Creatures.create("kozpati", 11),
            L.Creatures.create("ruzgocuk", 10)
          ]);
        });
      }
      return;
    }
    this.dialogue.show(npc.name, npc.dialogue || ["Merhaba!"]);
  };

  L.Game.prototype.healTeam = function (npc) {
    var self = this;
    this.dialogue.show(npc ? npc.name : "Şifa İstasyonu", ["Şifa ışıkları ekibini sarıyor..."], function () {
      document.getElementById("fadeLayer").classList.add("active");
      setTimeout(function () {
        L.Creatures.healTeam(self.state.team);
        self.state.checkpoint = self.healingCheckpoint();
        self.autosaveSoon();
        if (L.Audio) L.Audio.play("heal");
        self.ui.notify("Ekip tamamen iyileşti.");
        document.getElementById("fadeLayer").classList.remove("active");
      }, 420);
    });
  };

  L.Game.prototype.collectItem = function (item) {
    if (this.state.collectedItems[item.id]) return;
    this.state.collectedItems[item.id] = true;
    L.Inventory.add(this.state, item.itemId, item.qty || 1);
    var base = L.Inventory.get(item.itemId);
    if (item.questObjective) L.Quests.progress(this.state, item.questObjective, 1);
    this.ui.notify(base.name + " x" + (item.qty || 1) + " alındı.");
    if (L.Audio) L.Audio.play("pickup");
  };

  L.Game.prototype.handleInteraction = function () {
    var tile = L.Collision.facingTile(this.player);
    var npc = this.npcs.atFacingTile(this.player);
    if (npc) return this.handleNpc(npc);
    var item = this.mapSystem.itemAt(this.map, tile.x, tile.y, this.state);
    if (!item) {
      var foot = L.Collision.tileAtPixel(this.map, this.player.x + this.player.w / 2, this.player.y + this.player.h - 3);
      item = this.mapSystem.itemAt(this.map, foot.x, foot.y, this.state);
    }
    if (item) return this.collectItem(item);
    var roamer = this.roamers && this.roamers.atFacingTile(this.player);
    if (roamer) return this.startRoamerBattle(roamer);
    var interaction = this.mapSystem.interactionAt(this.map, tile.x, tile.y);
    if (!interaction) return;
    var self = this;
    if (interaction.type === "door") {
      this.changeMap({ to: interaction.to, spawnX: interaction.spawnX, spawnY: interaction.spawnY });
      return;
    }
    if (interaction.type === "lab") {
      if (!this.state.story.starterChosen) this.dialogue.show("Laboratuvar", [interaction.text, "Üç yoldaş ışık masasında seni bekliyor."], function () { self.ui.openStarter(); });
      else this.dialogue.show("Laboratuvar", ["Liora'nın notları masada. Farklı elementleri dengelemek ekibi güçlendirir."]);
      return;
    }
    if (interaction.type === "heal") return this.healTeam({ name: "Şifa İstasyonu" });
    if (interaction.type === "homeBed") {
      this.dialogue.show("Ev", [interaction.text, "Ekip dinlendi; burası yeni güvenli noktan oldu."], function () {
        L.Creatures.healTeam(self.state.team);
        self.state.checkpoint = self.findSafeCheckpoint(self.map.id, 8, 9);
        self.autosaveSoon();
        self.ui.notify("Evde dinlendin. Ekip tamamen iyileşti.");
        if (L.Audio) L.Audio.play("heal");
      });
      return;
    }
    if (interaction.type === "homeDecor") {
      this.ui.showHousing();
      return;
    }
    if (interaction.type === "shop") return L.Shop.open(this);
    if (interaction.type === "itemChest") {
      this.collectItem({ id: "chest_" + interaction.itemId, itemId: interaction.itemId, qty: interaction.qty || 1, questObjective: interaction.objective });
      return;
    }
    if (interaction.type === "note") {
      this.dialogue.show("Not", [interaction.text]);
      return;
    }
    this.dialogue.show(interaction.type === "sign" ? "Tabela" : "Bilgi", [interaction.text]);
  };

  L.Game.prototype.startRoamerBattle = function (roamer) {
    if (!this.state.team.length) {
      this.ui.notify("Önce bir Luma yoldaşı seçmelisin.");
      if (L.Audio) L.Audio.play("error");
      return;
    }
    if (this.roamers) this.roamers.remove(roamer.id);
    this.encounterCooldown = 4;
    this.battle.startWild(L.Creatures.create(roamer.creatureId, roamer.level, { shiny: Math.random() < 1 / 96 }));
  };

  L.Game.prototype.pickEncounter = function () {
    var pool = this.map.encounters || [];
    var total = pool.reduce(function (sum, entry) { return sum + entry.weight; }, 0);
    var roll = Math.random() * total;
    for (var i = 0; i < pool.length; i += 1) {
      roll -= pool[i].weight;
      if (roll <= 0) {
        var entry = pool[i];
        var level = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
        return L.Creatures.create(entry.id, level, { shiny: Math.random() < 1 / 72 });
      }
    }
    return L.Creatures.create(pool[0].id, pool[0].min);
  };

  L.Game.prototype.tryEncounter = function (dt) {
    if (!this.state.team.length || this.encounterCooldown > 0) return;
    if (!this.player.moving || !this.mapSystem.encounterTile(this.map, this.player)) return;
    if (Math.random() < dt * .34) {
      this.encounterCooldown = 5;
      this.battle.startWild(this.pickEncounter());
    }
  };

  L.Game.prototype.quickUse = function () {
    if (!this.state || !this.state.team.length) return;
    var creature = this.state.team[this.state.activeIndex] || this.state.team[0];
    var itemId = this.state.inventory.kucukIksir > 0 ? "kucukIksir" : (this.state.inventory.buyukIksir > 0 ? "buyukIksir" : "tamIksir");
    var result = L.Inventory.useOnCreature(this.state, itemId, creature);
    this.ui.notify(result.message);
    if (result.ok && L.Audio) L.Audio.play("heal");
  };

  L.Game.prototype.toggleFullscreen = function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen().catch(function () {});
    }
  };

  L.Game.prototype.fastTravelTo = function (mapId) {
    if (!this.state || !this.map || !L.WorldMap) return false;
    if (mapId === this.map.id) {
      this.ui.notify("Zaten buradasın.");
      return false;
    }
    if (!L.WorldMap.canFastTravel(this.state, mapId)) {
      this.ui.notify("Bu bölge henüz keşfedilmedi.");
      if (L.Audio) L.Audio.play("error");
      return false;
    }
    var target = this.mapSystem.get(mapId);
    if (!target) return false;
    var cost = L.WorldMap.fastTravelCost(this.map.id, mapId);
    if (this.state.money < cost) {
      this.ui.notify("Hızlı seyahat için " + cost + " Luma gerekiyor.");
      if (L.Audio) L.Audio.play("error");
      return false;
    }
    this.state.money -= cost;
    var safe = this.findSafeMoveTile(mapId, Math.floor(target.w / 2), Math.floor(target.h / 2));
    this.loadMap(mapId);
    this.player.setTile(safe.x, safe.y);
    this.player.dir = "down";
    this.camera.follow(this.player, this.map, 1);
    this.syncState();
    this.autosaveSoon();
    this.ui.notify(target.name + " bölgesine hızlı seyahat edildi.");
    if (L.Audio) L.Audio.play("confirm");
    return true;
  };

  L.Game.prototype.visitHome = function () {
    if (!this.state || !L.Economy) return false;
    L.Economy.ensureState(this.state);
    if (this.state.housing.status === "none") {
      this.ui.notify("Önce bir ev kirala veya satın al.");
      if (L.Audio) L.Audio.play("error");
      return false;
    }
    var mapId = L.Economy.homeInteriorId(this.state);
    var safe = this.findSafeMoveTile(mapId, 8, 9);
    this.loadMap(mapId);
    this.player.setTile(safe.x, safe.y);
    this.player.dir = "down";
    this.camera.follow(this.player, this.map, 1);
    this.syncState();
    this.autosaveSoon();
    this.ui.notify(L.Economy.homeName(this.state) + " içine girdin.");
    if (L.Audio) L.Audio.play("confirm");
    return true;
  };

  L.Game.prototype.drawTargetArrow = function () {
    if (!this.state || !this.map || !L.WorldMap) return;
    var target = L.WorldMap.targetForHud(this);
    if (!target || !target.exit) return;
    var ctx = this.ctx;
    var ex = (target.exit.x + target.exit.w / 2) * 16 - this.camera.x;
    var ey = (target.exit.y + target.exit.h / 2) * 16 - this.camera.y;
    var cx = Math.max(24, Math.min(456, ex));
    var cy = Math.max(36, Math.min(238, ey));
    var angle = Math.atan2(ey - 135, ex - 240);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = "#f2b94b";
    ctx.strokeStyle = "#101521";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(-9, -8);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-9, 8);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(23, 32, 51, .78)";
    ctx.fillRect(Math.max(8, cx - 54), Math.max(28, cy - 24), 108, 14);
    ctx.fillStyle = "#fff4d2";
    ctx.font = "8px monospace";
    ctx.fillText(target.label.slice(0, 18), Math.max(12, cx - 50), Math.max(38, cy - 14));
  };

  L.Game.prototype.update = function (dt) {
    this.updateBodyMode();
    if (this.mode === "dialogue") this.dialogue.update(dt);
    if (this.mode === "battle") this.battle.update(dt);
    if (!this.state) return;
    this.multiplayer.update(dt);
    this.state.playTime += this.mode === "world" ? dt : 0;
    this.transitionCooldown = Math.max(0, this.transitionCooldown - dt);
    this.encounterCooldown = Math.max(0, this.encounterCooldown - dt);
    if (this.input.consume("quickSave")) this.quickSave();
    if (this.input.consume("quickLoad")) this.quickLoad();
    if (this.input.consume("unstuck")) this.unstuckPlayer();
    if (this.mode === "world") {
      if (this.input.consume("menu")) this.ui.showPause();
      if (this.input.consume("quick")) this.quickUse();
      if (this.input.consume("action")) this.handleInteraction();
      if (this.mode === "world") {
        this.player.update(dt, this.input, this.map, this.npcs.current);
        if (this.roamers) this.roamers.update(dt, this.map);
        this.camera.follow(this.player, this.map, dt);
        this.particles.update(dt);
        var exit = this.mapSystem.exitAt(this.map, this.player.footRect(this.player.x, this.player.y));
        if (exit) this.changeMap(exit);
        var trainer = this.npcs.inLineOfSightTrainer(this.player, this.state);
        if (trainer && this.state.team.length) this.handleNpc(trainer);
        this.tryEncounter(dt);
      }
    }
    if (this.autosaveTimer > 0) {
      this.autosaveTimer -= dt;
      if (this.autosaveTimer <= 0) {
        this.syncState();
        L.Save.quickSave(this.state);
      }
    }
    this.ui.updateHud();
  };

  L.Game.prototype.render = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.map) {
      this.ctx.fillStyle = "#172033";
      this.ctx.fillRect(0, 0, 480, 270);
      return;
    }
    this.mapSystem.draw(this.ctx, this);
    this.drawTargetArrow();
    if (this.state && this.state.settings.showControls && this.mode === "world") {
      this.ctx.fillStyle = "rgba(23, 32, 51, .72)";
      this.ctx.fillRect(8, 238, 260, 23);
      this.ctx.fillStyle = "#fff4d2";
      this.ctx.font = "10px monospace";
      this.ctx.fillText("E: konuş/al • Esc: menü • U: kurtul • F5: kayıt", 14, 253);
    }
  };
})();
