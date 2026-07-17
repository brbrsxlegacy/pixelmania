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
    this.particles = new L.Particles();
    this.ui = new L.UiController(this);
    this.dialogue = new L.Dialogue(this);
    this.battle = new L.Battle(this);
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
    this.state = Object.assign(defaultState(L.Save.loadSettings()), state);
    this.state.settings = Object.assign(L.Save.defaultSettings(), L.Save.loadSettings(), this.state.settings || {});
    L.Creatures.serializeFix(this.state);
    L.Audio.applySettings(this.state.settings);
    this.loadMap(this.state.mapId || "isikpinar");
    this.player.x = this.state.player.x || 25 * 16 + 1;
    this.player.y = this.state.player.y || 30 * 16 - 2;
    this.player.dir = this.state.player.dir || "down";
    this.state.activeIndex = Math.max(0, Math.min(this.state.team.length - 1, this.state.activeIndex || 0));
    this.ui.hideMain();
    this.ui.closePanel();
    this.mode = "world";
    this.camera.follow(this.player, this.map, 1);
    this.ui.notify("Kayıt yüklendi.");
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
    this.npcs.load(mapId);
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
      self.camera.follow(self.player, self.map, 1);
      self.syncState();
      self.autosaveSoon();
    }, 260);
    setTimeout(function () {
      document.getElementById("fadeLayer").classList.remove("active");
      self.mode = "world";
    }, 520);
  };

  L.Game.prototype.returnToCheckpoint = function () {
    var cp = this.state.checkpoint || { mapId: "isikpinar", x: 25, y: 30 };
    this.loadMap(cp.mapId);
    this.player.setTile(cp.x, cp.y);
    this.camera.follow(this.player, this.map, 1);
    this.autosaveSoon();
  };

  L.Game.prototype.chooseStarter = function (starterId) {
    if (this.state.story.starterChosen) {
      this.ui.closeStarter();
      return;
    }
    var starter = L.Creatures.create(starterId, 5);
    L.Creatures.addToCollection(this.state, starter);
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
        self.state.checkpoint = { mapId: self.map.id, x: Math.floor(self.player.x / 16), y: Math.floor(self.player.y / 16) };
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
    var interaction = this.mapSystem.interactionAt(this.map, tile.x, tile.y);
    if (!interaction) return;
    var self = this;
    if (interaction.type === "lab") {
      if (!this.state.story.starterChosen) this.dialogue.show("Laboratuvar", [interaction.text, "Üç yoldaş ışık masasında seni bekliyor."], function () { self.ui.openStarter(); });
      else this.dialogue.show("Laboratuvar", ["Liora'nın notları masada. Farklı elementleri dengelemek ekibi güçlendirir."]);
      return;
    }
    if (interaction.type === "heal") return this.healTeam({ name: "Şifa İstasyonu" });
    if (interaction.type === "shop") return L.Shop.open(this);
    if (interaction.type === "itemChest") {
      this.collectItem({ id: "chest_" + interaction.itemId, itemId: interaction.itemId, qty: interaction.qty || 1, questObjective: interaction.objective });
      return;
    }
    this.dialogue.show(interaction.type === "sign" ? "Tabela" : "Bilgi", [interaction.text]);
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

  L.Game.prototype.update = function (dt) {
    if (this.mode === "dialogue") this.dialogue.update(dt);
    if (this.mode === "battle") this.battle.update(dt);
    if (!this.state) return;
    this.state.playTime += this.mode === "world" ? dt : 0;
    this.transitionCooldown = Math.max(0, this.transitionCooldown - dt);
    this.encounterCooldown = Math.max(0, this.encounterCooldown - dt);
    if (this.input.consume("quickSave")) this.quickSave();
    if (this.input.consume("quickLoad")) this.quickLoad();
    if (this.mode === "world") {
      if (this.input.consume("menu")) this.ui.showPause();
      if (this.input.consume("quick")) this.quickUse();
      if (this.input.consume("action")) this.handleInteraction();
      if (this.mode === "world") {
        this.player.update(dt, this.input, this.map, this.npcs.current);
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
    if (this.state && this.state.settings.showControls && this.mode === "world") {
      this.ctx.fillStyle = "rgba(23, 32, 51, .72)";
      this.ctx.fillRect(8, 238, 260, 23);
      this.ctx.fillStyle = "#fff4d2";
      this.ctx.font = "10px monospace";
      this.ctx.fillText("E: konuş/al • Esc: menü • Shift: koş • F5: kayıt", 14, 253);
    }
  };
})();
