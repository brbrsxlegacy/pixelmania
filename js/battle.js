(function () {
  var L = window.LUMA = window.LUMA || {};

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function stageMultiplier(stage) {
    stage = Math.max(-3, Math.min(3, stage || 0));
    return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
  }

  L.Battle = function (game) {
    this.game = game;
    this.screen = document.getElementById("battleScreen");
    this.canvas = document.getElementById("battleCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.menu = document.getElementById("battleMenu");
    this.messageEl = document.getElementById("battleMessage");
    this.active = false;
    this.busy = false;
    this.type = "wild";
    this.enemyParty = [];
    this.enemyIndex = 0;
    this.enemy = null;
    this.trainer = null;
    this.bind();
  };

  L.Battle.prototype.bind = function () {
    var self = this;
    this.menu.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button || !self.active || self.busy) return;
      var action = button.getAttribute("data-battle-action");
      var move = button.getAttribute("data-move");
      var item = button.getAttribute("data-item");
      var switchTo = button.getAttribute("data-switch");
      if (action) self.handleAction(action);
      if (move != null) self.useMove(Number(move));
      if (item) self.useItem(item);
      if (switchTo != null) self.switchCreature(Number(switchTo));
    });
  };

  L.Battle.prototype.playerCreature = function () {
    return this.game.state.team[this.game.state.activeIndex] || this.game.state.team[0];
  };

  L.Battle.prototype.startWild = function (enemy) {
    this.type = "wild";
    this.trainer = null;
    this.enemyParty = [enemy];
    this.enemyIndex = 0;
    this.enemy = enemy;
    if (L.WorldMap && this.game.state) L.WorldMap.recordSeen(this.game.state, enemy.id);
    this.startCommon("Vahşi " + enemy.displayName + " ortaya çıktı!");
  };

  L.Battle.prototype.startTrainer = function (trainer, party) {
    this.type = "trainer";
    this.trainer = trainer;
    this.enemyParty = party;
    this.enemyIndex = 0;
    this.enemy = this.enemyParty[0];
    if (L.WorldMap && this.game.state) {
      this.enemyParty.forEach(function (enemy) { L.WorldMap.recordSeen(this.game.state, enemy.id); }, this);
    }
    this.startCommon(trainer.name + " meydan okuyor!");
  };

  L.Battle.prototype.startCommon = function (message) {
    this.active = true;
    this.busy = false;
    document.body.classList.add("battle-active");
    this.screen.classList.remove("hidden");
    this.game.mode = "battle";
    this.setMessage(message);
    if (L.Audio) L.Audio.play("encounter");
    this.renderMainMenu();
    this.updateBars();
    this.draw();
  };

  L.Battle.prototype.end = function () {
    this.active = false;
    this.busy = false;
    document.body.classList.remove("battle-active");
    this.screen.classList.add("hidden");
    this.game.mode = "world";
    this.game.encounterCooldown = 4;
    this.game.autosaveSoon();
  };

  L.Battle.prototype.setMessage = function (message) {
    this.messageEl.textContent = message;
  };

  L.Battle.prototype.renderMainMenu = function () {
    this.menu.innerHTML = [
      "<button data-battle-action='attack'>Saldır</button>",
      "<button data-battle-action='team'>Yaratıklar</button>",
      "<button data-battle-action='bag'>Çanta</button>",
      "<button data-battle-action='run'>Kaç</button>"
    ].join("");
  };

  L.Battle.prototype.handleAction = function (action) {
    if (action === "attack") return this.renderMoves();
    if (action === "team") return this.renderTeam();
    if (action === "bag") return this.renderBag();
    if (action === "run") return this.tryRun();
    if (action === "back") return this.renderMainMenu();
  };

  L.Battle.prototype.renderMoves = function () {
    var creature = this.playerCreature();
    var html = creature.abilities.map(function (a, index) {
      return "<button class='ability-button' data-move='" + index + "'>" + a.name +
        "<small>" + a.element + " • Güç " + a.power + " • İsabet " + a.accuracy + " • " + a.ppLeft + "/" + a.pp + "</small></button>";
    }).join("");
    html += "<button data-battle-action='back'>Geri</button>";
    this.menu.innerHTML = html;
  };

  L.Battle.prototype.renderBag = function () {
    var state = this.game.state;
    var ids = Object.keys(state.inventory).filter(function (id) {
      var item = L.Inventory.get(id);
      return item && (item.category === "Yakalama" || item.category === "İyileştirme" || item.effect && item.effect.escape) && state.inventory[id] > 0;
    });
    var html = ids.map(function (id) {
      var item = L.Inventory.get(id);
      return "<button class='ability-button' data-item='" + id + "'>" + item.name + " x" + state.inventory[id] +
        "<small>" + item.description + "</small></button>";
    }).join("");
    if (!html) html = "<button disabled>Çantada uygun eşya yok</button>";
    html += "<button data-battle-action='back'>Geri</button>";
    this.menu.innerHTML = html;
  };

  L.Battle.prototype.renderTeam = function () {
    var state = this.game.state;
    var html = state.team.map(function (c, index) {
      var disabled = c.hp <= 0 || index === state.activeIndex ? " disabled" : "";
      return "<button class='ability-button' data-switch='" + index + "'" + disabled + ">" + c.displayName + " Sv. " + c.level +
        "<small>" + c.element + " • HP " + c.hp + "/" + c.maxHp + "</small></button>";
    }).join("");
    html += "<button data-battle-action='back'>Geri</button>";
    this.menu.innerHTML = html;
  };

  L.Battle.prototype.enemyMove = function () {
    var usable = this.enemy.abilities.filter(function (a) { return a.ppLeft > 0; });
    if (!usable.length) usable = this.enemy.abilities;
    return usable[Math.floor(Math.random() * usable.length)];
  };

  L.Battle.prototype.useMove = async function (moveIndex) {
    if (this.busy) return;
    var player = this.playerCreature();
    var move = player.abilities[moveIndex];
    if (!move || move.ppLeft <= 0) {
      this.setMessage("Bu yeteneğin kullanım hakkı kalmadı.");
      if (L.Audio) L.Audio.play("error");
      return;
    }
    this.busy = true;
    this.menu.innerHTML = "";
    var enemyMove = this.enemyMove();
    var firstPlayer = (player.speed * stageMultiplier(player.statStages.speed)) >= (this.enemy.speed * stageMultiplier(this.enemy.statStages.speed));
    var turns = firstPlayer ? [
      { user: player, target: this.enemy, move: move, side: "player" },
      { user: this.enemy, target: player, move: enemyMove, side: "enemy" }
    ] : [
      { user: this.enemy, target: player, move: enemyMove, side: "enemy" },
      { user: player, target: this.enemy, move: move, side: "player" }
    ];
    for (var i = 0; i < turns.length; i += 1) {
      if (!this.active) return;
      if (turns[i].user.hp <= 0 || turns[i].target.hp <= 0) continue;
      await this.performMove(turns[i]);
      if (await this.checkFaints()) return;
      await delay(240);
    }
    await this.applyEndStatuses();
    if (await this.checkFaints()) return;
    this.busy = false;
    this.renderMainMenu();
  };

  L.Battle.prototype.performMove = async function (turn) {
    var user = turn.user;
    var target = turn.target;
    var move = turn.move;
    if (move.ppLeft > 0) move.ppLeft -= 1;
    if (user.status === "sleep" && Math.random() < .5) {
      this.setMessage(user.displayName + " uykulu kaldı.");
      await delay(520);
      return;
    }
    var hitChance = move.accuracy / 100;
    hitChance *= 1 / stageMultiplier(target.statStages.evasion || 0);
    if (Math.random() > hitChance) {
      this.setMessage(user.displayName + " ıskaladı!");
      if (L.Audio) L.Audio.play("cancel");
      await delay(560);
      return;
    }
    this.animateAttack(turn.side, move.animation);
    if (move.power <= 0) {
      this.applyEffect(user, target, move.effect, true);
      this.setMessage(user.displayName + " " + move.name + " kullandı.");
      await delay(620);
      return;
    }
    var atk = user.attack * stageMultiplier(user.statStages.attack || 0);
    var def = target.defense * stageMultiplier(target.statStages.defense || 0);
    var mult = L.Abilities.effectiveness(move.element, target.element);
    var crit = Math.random() < .08 ? 1.65 : 1;
    var rand = .88 + Math.random() * .18;
    var damage = Math.max(1, Math.floor((((2 * user.level / 5 + 2) * move.power * atk / Math.max(1, def)) / 12 + 2) * mult * crit * rand));
    target.hp = Math.max(0, target.hp - damage);
    var msg = user.displayName + " " + move.name + " kullandı. " + damage + " hasar!";
    var eff = L.Abilities.effectivenessText(mult);
    if (eff) msg += " " + eff;
    if (crit > 1) msg += " Kritik vuruş!";
    this.setMessage(msg);
    this.popDamage(turn.side === "player" ? "enemy" : "player", damage);
    if (L.Audio) L.Audio.play("attack");
    if (this.game.state.settings.screenShake) this.screen.classList.add("shake");
    setTimeout(this.screen.classList.remove.bind(this.screen.classList, "shake"), 190);
    this.applyEffect(user, target, move.effect, false);
    this.updateBars();
    await delay(740);
  };

  L.Battle.prototype.applyEffect = function (user, target, effect, pureStatus) {
    if (!effect || Math.random() > effect.chance) return;
    if (effect.type === "defenseUp") user.statStages.defense = Math.min(3, user.statStages.defense + 1);
    if (effect.type === "attackUp") user.statStages.attack = Math.min(3, user.statStages.attack + 1);
    if (effect.type === "speedUp") user.statStages.speed = Math.min(3, user.statStages.speed + 1);
    if (effect.type === "evasionUp") user.statStages.evasion = Math.min(3, user.statStages.evasion + 1);
    if (effect.type === "attackDown") target.statStages.attack = Math.max(-3, target.statStages.attack - 1);
    if (effect.type === "slow") target.statStages.speed = Math.max(-3, target.statStages.speed - 1);
    if (["burn", "sleep", "stun", "blind"].indexOf(effect.type) >= 0 && !target.status) target.status = effect.type;
    if (effect.type === "selfHeal") user.hp = Math.min(user.maxHp, user.hp + Math.ceil(user.maxHp * .22));
    if (pureStatus) this.updateBars();
  };

  L.Battle.prototype.applyEndStatuses = async function () {
    var actors = [this.playerCreature(), this.enemy];
    for (var i = 0; i < actors.length; i += 1) {
      var c = actors[i];
      if (!c || c.hp <= 0) continue;
      if (c.status === "burn") {
        var damage = Math.max(1, Math.floor(c.maxHp * .06));
        c.hp = Math.max(0, c.hp - damage);
        this.setMessage(c.displayName + " yanık acısı çekti.");
        this.updateBars();
        await delay(420);
      }
    }
  };

  L.Battle.prototype.checkFaints = async function () {
    var player = this.playerCreature();
    if (this.enemy.hp <= 0) {
      this.setMessage(this.enemy.displayName + " bayıldı!");
      await delay(620);
      if (this.type === "trainer" && this.enemyIndex < this.enemyParty.length - 1) {
        this.enemyIndex += 1;
        this.enemy = this.enemyParty[this.enemyIndex];
        this.setMessage(this.trainer.name + " " + this.enemy.displayName + " gönderdi!");
        this.updateBars();
        await delay(650);
        return false;
      }
      await this.win();
      return true;
    }
    if (player.hp <= 0) {
      this.setMessage(player.displayName + " bayıldı!");
      await delay(620);
      var next = L.Creatures.firstHealthy(this.game.state.team);
      if (next >= 0) {
        this.game.state.activeIndex = next;
        this.setMessage(this.playerCreature().displayName + " öne çıktı!");
        this.updateBars();
        await delay(620);
        this.busy = false;
        this.renderMainMenu();
        return true;
      }
      await this.lose();
      return true;
    }
    return false;
  };

  L.Battle.prototype.win = async function () {
    var state = this.game.state;
    var active = this.playerCreature();
    var isPvp = this.type === "trainer" && this.trainer && this.trainer.pvp;
    var exp = isPvp ? Math.max(8, this.enemy.level * 6) : Math.max(12, this.enemy.level * 16 + (this.type === "trainer" ? 20 : 0));
    var messages = L.Creatures.gainExp(active, exp);
    for (var i = 0; i < messages.length; i += 1) {
      this.setMessage(messages[i]);
      await delay(650);
    }
    if (this.type === "wild") {
      L.Quests.progress(state, "winWild", 1);
      L.Quests.progress(state, "defeat_" + this.enemy.id, 1);
      if (L.Daily) L.Daily.progress(state, "winWild", 1);
    }
    if (this.type === "trainer" && this.trainer && isPvp) {
      state.pvp = Object.assign({ wins: 0, losses: 0 }, state.pvp || {});
      state.pvp.wins += 1;
      if (L.Daily) L.Daily.progress(state, "pvpBattle", 1);
      this.setMessage((this.trainer.afterDialogue && this.trainer.afterDialogue[0]) || "PvP maçını kazandın!");
      await delay(800);
    } else if (this.type === "trainer" && this.trainer) {
      state.defeatedTrainers[this.trainer.id] = true;
      state.money += this.trainer.money || 80;
      L.Quests.progress(state, "winTrainer", 1);
      L.Quests.progress(state, "earnMoney", this.trainer.money || 80);
      if (this.trainer.questObjective) L.Quests.progress(state, this.trainer.questObjective, 1);
      this.setMessage((this.trainer.afterDialogue && this.trainer.afterDialogue[0]) || "Rakibini yendin!");
      await delay(800);
      if (this.trainer.badgeId) {
        state.badges = state.badges || {};
        if (!state.badges[this.trainer.badgeId]) {
          state.badges[this.trainer.badgeId] = { name: this.trainer.badgeName || "Rozet", wonAt: Date.now() };
          L.Quests.progress(state, "badge_" + this.trainer.badgeId, 1);
          this.setMessage((this.trainer.badgeName || "Rozet") + " kazandın!");
          await delay(820);
        }
      }
    }
    if (L.Audio) L.Audio.play("victory");
    this.end();
    if (L.Evolution && active && active.hp > 0) {
      setTimeout(function () { L.Evolution.prompt(this.game, active); }.bind(this), 80);
    }
  };

  L.Battle.prototype.lose = async function () {
    if (this.type === "trainer" && this.trainer && this.trainer.pvp) {
      this.setMessage("PvP maçını kaybettin. Ekip maç sonrası iyileştiriliyor...");
      await delay(900);
      this.game.state.pvp = Object.assign({ wins: 0, losses: 0 }, this.game.state.pvp || {});
      this.game.state.pvp.losses += 1;
      if (L.Daily) L.Daily.progress(this.game.state, "pvpBattle", 1);
      L.Creatures.healTeam(this.game.state.team);
      this.end();
      if (this.game.ui) this.game.ui.notify("PvP bitti. Ekip iyileşti, kayıt güvende.");
      return;
    }
    this.setMessage("Ekip yoruldu. Son şifa noktasına dönüyorsun...");
    await delay(900);
    L.Creatures.healTeam(this.game.state.team);
    this.end();
    this.game.returnToCheckpoint();
  };

  L.Battle.prototype.tryRun = async function () {
    if (this.type === "trainer") {
      this.setMessage("Antrenör maçından kaçamazsın.");
      if (L.Audio) L.Audio.play("error");
      return;
    }
    this.busy = true;
    var player = this.playerCreature();
    var chance = .48 + (player.speed - this.enemy.speed) * .025;
    if (Math.random() < Math.max(.18, Math.min(.88, chance))) {
      this.setMessage("Güvenle kaçtın.");
      await delay(520);
      this.end();
    } else {
      this.setMessage("Kaçamadın!");
      await delay(520);
      await this.performMove({ user: this.enemy, target: player, move: this.enemyMove(), side: "enemy" });
      if (!(await this.checkFaints())) {
        this.busy = false;
        this.renderMainMenu();
      }
    }
  };

  L.Battle.prototype.useItem = async function (itemId) {
    var state = this.game.state;
    var item = L.Inventory.get(itemId);
    if (!item) return;
    if (item.category === "Yakalama") {
      if (this.type === "trainer") {
        this.setMessage("Antrenör yaratıkları yakalanamaz.");
        if (L.Audio) L.Audio.play("error");
        return;
      }
      if (!L.Inventory.remove(state, itemId, 1)) return;
      this.busy = true;
      this.menu.innerHTML = "";
      if (L.Audio) L.Audio.play("capture");
      var roll = L.Capture.roll(this.enemy, item);
      this.setMessage(item.name + " fırlatıldı!");
      await delay(520);
      for (var i = 0; i < 3; i += 1) {
        this.setMessage((i + 1) + ". ışık halkası...");
        await delay(480);
        if (!roll.stages[i]) break;
      }
      if (roll.success) {
        this.setMessage(this.enemy.displayName + " yakalandı!");
        var where = L.Creatures.addToCollection(state, this.enemy);
        if (L.WorldMap) L.WorldMap.recordCaught(state, this.enemy.id);
        L.Quests.progress(state, "catchAny", 1);
        if (L.Daily) L.Daily.progress(state, "catchAny", 1);
        L.Quests.progress(state, "catch_" + this.enemy.element, 1);
        L.Quests.progress(state, "catch_" + this.enemy.id, 1);
        if (this.enemy.element === "Su") L.Quests.progress(state, "catchWater", 1);
        if (L.Audio) L.Audio.play("victory");
        await delay(740);
        L.UI.notify(where === "team" ? "Ekibe katıldı." : "Depoya gönderildi.");
        this.end();
      } else {
        this.setMessage(this.enemy.displayName + " ışık küresinden çıktı!");
        await delay(620);
        await this.performMove({ user: this.enemy, target: this.playerCreature(), move: this.enemyMove(), side: "enemy" });
        if (!(await this.checkFaints())) {
          this.busy = false;
          this.renderMainMenu();
        }
      }
      return;
    }
    if (item.effect && item.effect.escape) {
      if (this.type === "trainer") {
        this.setMessage("Bu maçta kullanılamaz.");
        return;
      }
      L.Inventory.remove(state, itemId, 1);
      this.setMessage("Kaçış Taşı parladı.");
      await delay(520);
      this.end();
      return;
    }
    var result = L.Inventory.useOnCreature(state, itemId, this.playerCreature());
    this.setMessage(result.message);
    if (result.ok) {
      if (L.Audio) L.Audio.play("heal");
      this.updateBars();
      this.busy = true;
      await delay(520);
      await this.performMove({ user: this.enemy, target: this.playerCreature(), move: this.enemyMove(), side: "enemy" });
      if (!(await this.checkFaints())) {
        this.busy = false;
        this.renderMainMenu();
      }
    } else if (L.Audio) {
      L.Audio.play("error");
    }
  };

  L.Battle.prototype.switchCreature = async function (index) {
    var state = this.game.state;
    if (!state.team[index] || state.team[index].hp <= 0 || index === state.activeIndex) return;
    state.activeIndex = index;
    this.busy = true;
    this.menu.innerHTML = "";
    this.setMessage(state.team[index].displayName + " öne çıktı!");
    this.updateBars();
    await delay(560);
    await this.performMove({ user: this.enemy, target: this.playerCreature(), move: this.enemyMove(), side: "enemy" });
    if (!(await this.checkFaints())) {
      this.busy = false;
      this.renderMainMenu();
    }
  };

  L.Battle.prototype.animateAttack = function (side) {
    this.flashSide = side;
    setTimeout(function (battle) { battle.flashSide = null; }, 160, this);
  };

  L.Battle.prototype.popDamage = function (target, amount) {
    var el = document.createElement("div");
    el.className = "damage-number";
    el.textContent = "-" + amount;
    el.style.left = target === "enemy" ? "330px" : "128px";
    el.style.top = target === "enemy" ? "72px" : "132px";
    this.screen.appendChild(el);
    setTimeout(function () { el.remove(); }, 800);
  };

  L.Battle.prototype.updateBars = function () {
    var player = this.playerCreature();
    var enemy = this.enemy;
    if (!player || !enemy) return;
    document.getElementById("enemyName").textContent = enemy.displayName;
    document.getElementById("enemyLevel").textContent = "Sv. " + enemy.level;
    document.getElementById("enemyHpBar").style.width = Math.max(0, enemy.hp / enemy.maxHp * 100) + "%";
    document.getElementById("enemyHpText").textContent = enemy.hp + "/" + enemy.maxHp;
    document.getElementById("playerCreatureName").textContent = player.displayName;
    document.getElementById("playerLevel").textContent = "Sv. " + player.level;
    document.getElementById("playerHpBar").style.width = Math.max(0, player.hp / player.maxHp * 100) + "%";
    document.getElementById("playerHpText").textContent = player.hp + "/" + player.maxHp;
    document.getElementById("playerXpBar").style.width = Math.max(0, player.exp / player.expToNext * 100) + "%";
  };

  L.Battle.prototype.draw = function () {
    if (!this.active) return;
    var ctx = this.ctx;
    var t = this.game.time;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#8ed6e9";
    ctx.fillRect(0, 0, 480, 170);
    ctx.fillStyle = "#72bf65";
    ctx.fillRect(0, 93, 480, 77);
    ctx.fillStyle = "#4aa8d8";
    for (var i = 0; i < 16; i += 1) {
      ctx.fillRect((i * 35 + Math.floor(t * 18)) % 520 - 40, 118 + (i % 3) * 7, 18, 2);
    }
    ctx.fillStyle = "rgba(13, 27, 33, .18)";
    ctx.fillRect(54, 124, 132, 12);
    ctx.fillRect(298, 76, 132, 12);
    var player = this.playerCreature();
    if (player) L.Asset.drawCreature(ctx, player, 78 + (this.flashSide === "player" ? 8 : 0), 73, 2.2, false, t);
    if (this.enemy) L.Asset.drawCreature(ctx, this.enemy, 320 - (this.flashSide === "enemy" ? 8 : 0), 32, 2, true, t);
  };

  L.Battle.prototype.update = function () {
    this.draw();
  };
})();
