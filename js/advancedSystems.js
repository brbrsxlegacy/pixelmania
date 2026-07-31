(function () {
  var L = window.LUMA = window.LUMA || {};
  if (!L.Progression) return;

  var P = L.Progression;
  var baseEnsure = P.ensureState;
  var baseUpdate = P.update;
  var baseDamageMultiplier = P.damageMultiplier;
  var baseCritBonus = P.critBonus;
  var baseAfterBattleWin = P.afterBattleWin;
  var baseAfterCapture = P.afterCapture;

  var worldAbilities = [
    { id: "leaf", element: "Yaprak", name: "Kok Yolu", description: "Sarmasik, gizli gecit ve orman kilitlerini acar." },
    { id: "water", element: "Su", name: "Akis Gecidi", description: "Su kapilari ve batik mekanizmalari sakinlestirir." },
    { id: "stone", element: "Kaya", name: "Tas Kiran", description: "Catlak duvarlari, kristal bloklari ve maden damarlarini kirar." },
    { id: "spark", element: "Elektrik", name: "Kivilcim Devresi", description: "Terminal, tren ve enerji kapilarini calistirir." },
    { id: "wind", element: "Rüzgar", name: "Hafif Sıçrayis", description: "Dar patikalarda gizli sandiklara ulasmayi kolaylastirir." },
    { id: "shadow", element: "Gölge", name: "Gece Perdesi", description: "Karanlik muhurlari ve harabe perdelerini cozer." },
    { id: "light", element: "Işık", name: "Safak Feneri", description: "Karanlik zindanlari, efsane izlerini ve kutsal kapilari aydinlatir." }
  ];

  var homeUpgrades = [
    { id: "gardenBeds", name: "Genis Bahce", money: 520, cost: { wood: 5, herb: 3 }, description: "Ayni anda 6 fide dikilebilir." },
    { id: "incubator", name: "Kuluçka Makinesi", money: 760, cost: { crystal: 4, ore: 2 }, description: "Yumurtalar iki kat hizli ilerler." },
    { id: "trophyRoom", name: "Kupa Rafi", money: 640, cost: { wood: 3, crystal: 2 }, description: "Trainer ve boss zaferleri ekstra Luma kazandirir." },
    { id: "musicPlayer", name: "Ev Müzik Çalari", money: 420, cost: { wood: 2, crystal: 1 }, description: "Evde dinlenmek Luma ruh halini yukari ceker." },
    { id: "coopBeacon", name: "Co-op Isaret Feneri", money: 900, cost: { crystal: 5, ore: 3 }, description: "Oda arkadasinla co-op zindan ve boss akislarini acar." }
  ];

  var tournamentRounds = [
    { name: "Çeyrek Final Ada", element: "Yaprak", level: 18, sprite: "trainer", reward: 240 },
    { name: "Yari Final Riza", element: "Elektrik", level: 22, sprite: "worker", reward: 360 },
    { name: "Final Şampiyonu Nermin", element: "Işık", level: 27, sprite: "mayor", reward: 720, boss: true }
  ];

  var legendaryHunts = [
    { id: "moonLumeru", name: "Ay Izi Lumeru", creatureId: "lumeru", element: "Işık", level: 36, condition: "Gece + yağmur/sis veya 1 efsane yemi", shiny: true },
    { id: "crownlexGrove", name: "Taç Yaprak Crownlex", creatureId: "crownlex", element: "Yaprak", level: 33, condition: "Kök Labirenti bossu veya 1 efsane yemi" },
    { id: "stormBarbo", name: "Fırtına Barbo", creatureId: "barbo", element: "Elektrik", level: 34, condition: "Turnuva şampiyonluğu/fırtına veya 1 efsane yemi" }
  ];

  function ensureState(state) {
    baseEnsure(state);
    state.worldAbilities = state.worldAbilities && typeof state.worldAbilities === "object" ? state.worldAbilities : {};
    state.worldAbilities.used = Object.assign({}, state.worldAbilities.used || {});
    state.questTrack = Object.assign({ activeId: null }, state.questTrack || {});
    state.tournament = Object.assign({ active: false, champion: false, season: 0, round: 0, wins: 0, bestStreak: 0, pendingRound: 0 }, state.tournament || {});
    state.dungeons = state.dungeons && typeof state.dungeons === "object" ? state.dungeons : {};
    state.dungeons.cleared = Object.assign({}, state.dungeons.cleared || {});
    state.legendaryHunts = state.legendaryHunts && typeof state.legendaryHunts === "object" ? state.legendaryHunts : {};
    state.legendaryHunts.defeated = Object.assign({}, state.legendaryHunts.defeated || {});
    state.legendaryHunts.caught = Object.assign({}, state.legendaryHunts.caught || {});
    state.legendaryHunts.lures = Number(state.legendaryHunts.lures) || 0;
    state.homeUpgrades = state.homeUpgrades && typeof state.homeUpgrades === "object" ? state.homeUpgrades : {};
    state.homeUpgrades.owned = Object.assign({}, state.homeUpgrades.owned || {});
    state.lumaMood = state.lumaMood && typeof state.lumaMood === "object" ? state.lumaMood : {};
    state.lumaMood.values = Object.assign({}, state.lumaMood.values || {});
    state.coop = Object.assign({ dungeonRuns: 0, bossClears: 0 }, state.coop || {});
    return state;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function keyFor(creature) {
    return creature ? (creature.uid || creature.id) : "";
  }

  function activeCreature(game) {
    return game && game.state && game.state.team && (game.state.team[game.state.activeIndex] || game.state.team[0]);
  }

  function teamHasElement(game, element) {
    return !!(game && game.state && game.state.team || []).some(function (creature) {
      return creature && creature.element === element && creature.hp > 0;
    });
  }

  function addResource(state, id, amount) {
    ensureState(state);
    state.resources[id] = (state.resources[id] || 0) + amount;
  }

  function canPay(state, cost, money) {
    if ((state.money || 0) < (money || 0)) return false;
    return Object.keys(cost || {}).every(function (id) { return (state.resources[id] || 0) >= cost[id]; });
  }

  function payCost(state, cost, money) {
    state.money -= money || 0;
    Object.keys(cost || {}).forEach(function (id) { state.resources[id] -= cost[id]; });
  }

  function moodData(state, creature) {
    ensureState(state);
    var key = keyFor(creature);
    if (!state.lumaMood.values[key]) state.lumaMood.values[key] = { hunger: 12, energy: 82, excitement: 20 };
    return state.lumaMood.values[key];
  }

  function moodFor(state, creature) {
    if (!creature) return { id: "none", label: "Yok", bonus: "Ekipte Luma yok." };
    var data = moodData(state, creature);
    var hpRatio = creature.maxHp ? creature.hp / creature.maxHp : 1;
    var friend = P.friendship ? P.friendship(state, creature) : 0;
    if (hpRatio < .32 || data.energy < 25) return { id: "tired", label: "Yorgun", bonus: "Hasar biraz duser; evde dinlenmek iyi gelir." };
    if (data.hunger > 70) return { id: "hungry", label: "Aç", bonus: "Dostluk ve savas odağı duser; beslemek lazim." };
    if (data.excitement > 70) return { id: "excited", label: "Heyecanli", bonus: "Kritik sansi artar." };
    if (friend >= 70 || data.energy > 82) return { id: "happy", label: "Mutlu", bonus: "Savas hasari ve dostluk artisi guclenir." };
    return { id: "calm", label: "Sakin", bonus: "Dengeli ruh hali." };
  }

  function updateMood(game, dt) {
    if (!game || !game.state || !game.state.team) return;
    var state = ensureState(game.state);
    state.team.forEach(function (creature) {
      if (!creature) return;
      var data = moodData(state, creature);
      data.hunger = clamp(data.hunger + dt * .55, 0, 100);
      data.energy = clamp(data.energy - dt * .18, 0, 100);
      data.excitement = clamp(data.excitement - dt * .32, 0, 100);
      if (state.homeUpgrades.owned.musicPlayer && game.map && /home.*Interior/i.test(game.map.id)) {
        data.energy = clamp(data.energy + dt * .9, 0, 100);
        data.excitement = clamp(data.excitement + dt * .28, 0, 100);
      }
    });
  }

  function feedActive(game) {
    var creature = activeCreature(game);
    if (!creature) return { ok: false, message: "Once ekibe bir Luma al." };
    var state = ensureState(game.state);
    if ((state.resources.herb || 0) > 0) state.resources.herb -= 1;
    else if (state.money >= 35) state.money -= 35;
    else return { ok: false, message: "Beslemek icin 1 Sifa Otu veya 35 Luma gerekiyor." };
    var data = moodData(state, creature);
    data.hunger = clamp(data.hunger - 38, 0, 100);
    data.energy = clamp(data.energy + 16, 0, 100);
    data.excitement = clamp(data.excitement + 8, 0, 100);
    P.addFriendship(game, creature, 3);
    game.autosaveSoon();
    return { ok: true, message: creature.displayName + " beslendi ve keyfi yerine geldi." };
  }

  function chapterStatus(state) {
    ensureState(state);
    var badgeCount = Object.keys(state.badges || {}).length;
    var dungeonCount = Object.keys(state.dungeons.cleared || {}).length;
    var titanCount = Object.keys(state.storyBosses.defeated || {}).length;
    var legendaryCount = Object.keys(state.legendaryHunts.caught || {}).length + Object.keys(state.legendaryHunts.defeated || {}).length;
    var chapters = [
      { id: "starter", title: "Bölüm 1: İlk Yoldaş", done: !!(state.story && state.story.starterChosen), objective: "Laboratuvardan başlangıç Luma'sını seç." },
      { id: "city", title: "Bölüm 2: Şehir Kapısı", done: !!(state.world && state.world.discovered && state.world.discovered.lumaSehir), objective: "Luma Şehri Merkez'e ulaş." },
      { id: "badges", title: "Bölüm 3: Lider Ritmi", done: badgeCount >= 3, objective: "En az 3 arena rozeti kazan. Şu an: " + badgeCount + "/3" },
      { id: "dungeons", title: "Bölüm 4: Zindan Anahtarları", done: dungeonCount >= 3, objective: "3 özel zindanın bossunu yen. Şu an: " + dungeonCount + "/3" },
      { id: "tournament", title: "Bölüm 5: Şehir Turnuvası", done: !!state.tournament.champion, objective: "Arena turnuvasında 3 maçı üst üste kazan." },
      { id: "titans", title: "Bölüm 6: Titanlar", done: titanCount >= 4, objective: "4 dev story bossu yen. Şu an: " + titanCount + "/4" },
      { id: "legend", title: "Final: Efsane Avı", done: legendaryCount >= 1, objective: "En az 1 efsanevi Luma'yı yakala veya yen." }
    ];
    var current = chapters.filter(function (chapter) { return !chapter.done; })[0] || chapters[chapters.length - 1];
    return { chapters: chapters, current: current, completed: chapters.filter(function (c) { return c.done; }).length };
  }

  function useWorldAbility(game, interaction) {
    var state = ensureState(game.state);
    var id = interaction.id || ((game.map && game.map.id || "map") + "_" + interaction.x + "_" + interaction.y);
    if (state.worldAbilities.used[id]) return { ok: false, message: "Bu nokta zaten çözüldü." };
    if (!teamHasElement(game, interaction.element)) return { ok: false, message: interaction.element + " elementli sağlıklı bir Luma lazım." };
    state.worldAbilities.used[id] = { at: Date.now(), element: interaction.element };
    var reward = interaction.reward || {};
    Object.keys(reward.resources || {}).forEach(function (res) { addResource(state, res, reward.resources[res]); });
    if (reward.money) state.money += reward.money;
    if (reward.item && L.Inventory) L.Inventory.add(state, reward.item, reward.qty || 1);
    if (reward.lure) state.legendaryHunts.lures += reward.lure;
    P.addFriendship(game, activeCreature(game), 4);
    if (L.Quests) L.Quests.progress(state, "worldAbility", 1);
    game.autosaveSoon();
    var successText = interaction.success || ((interaction.label || "Yetenek") + " çözüldü.");
    return { ok: true, message: successText };
  }

  function farmLimit(state) {
    ensureState(state);
    return state.homeUpgrades.owned.gardenBeds ? 6 : 3;
  }

  function eggProgressMultiplier(state) {
    ensureState(state);
    return state.homeUpgrades.owned.incubator ? 2 : 1;
  }

  function buyHomeUpgrade(game, id) {
    var state = ensureState(game.state);
    if (!state.housing || state.housing.status === "none") return { ok: false, message: "Önce ev kirala ya da satın al." };
    var upgrade = homeUpgrades.filter(function (item) { return item.id === id; })[0];
    if (!upgrade) return { ok: false, message: "Yükseltme bulunamadı." };
    if (state.homeUpgrades.owned[id]) return { ok: false, message: "Bu yükseltme zaten evde." };
    if (!canPay(state, upgrade.cost, upgrade.money)) return { ok: false, message: "Para veya malzeme eksik." };
    payCost(state, upgrade.cost, upgrade.money);
    state.homeUpgrades.owned[id] = { at: Date.now(), name: upgrade.name };
    if (id === "musicPlayer") {
      (state.team || []).forEach(function (creature) {
        var data = moodData(state, creature);
        data.energy = clamp(data.energy + 20, 0, 100);
      });
    }
    game.autosaveSoon();
    return { ok: true, message: upgrade.name + " eve kuruldu." };
  }

  function creatureForElement(element, offset) {
    var list = (L.Creatures.list || []).filter(function (base) { return base.element === element; });
    return list.length ? list[offset % list.length].id : "cimsirik";
  }

  function startTournamentRound(game, round) {
    var state = ensureState(game.state);
    var spec = tournamentRounds[round - 1];
    if (!spec) return false;
    var trainer = {
      id: "tournament_" + state.tournament.season + "_" + round,
      name: spec.name,
      type: "trainer",
      boss: !!spec.boss,
      tournamentRound: round,
      money: 0,
      afterDialogue: ["Tur " + round + " tamam."]
    };
    var party = [
      L.Creatures.create(creatureForElement(spec.element, round * 3), spec.level),
      L.Creatures.create(creatureForElement(spec.element, round * 5 + 1), spec.level + 1)
    ];
    if (spec.boss) party.push(L.Creatures.create(creatureForElement(spec.element, round * 7 + 2), spec.level + 2));
    game.ui.closePanel();
    game.battle.startTrainer(trainer, party);
    return true;
  }

  function startTournament(game) {
    var state = ensureState(game.state);
    if (!game.state.team || !game.state.team.some(function (c) { return c.hp > 0; })) return { ok: false, message: "Turnuva için sağlıklı ekip lazım." };
    state.tournament.active = true;
    state.tournament.season += 1;
    state.tournament.round = 0;
    state.tournament.pendingRound = 0;
    startTournamentRound(game, 1);
    return { ok: true, message: "Turnuva başladı." };
  }

  function resumeTournament(game) {
    var state = ensureState(game.state);
    var next = state.tournament.pendingRound || state.tournament.round + 1;
    if (!state.tournament.active || next < 1 || next > tournamentRounds.length) return { ok: false, message: "Devam eden turnuva turu yok." };
    state.tournament.pendingRound = 0;
    startTournamentRound(game, next);
    return { ok: true, message: "Turnuva turu başladı." };
  }

  function legendaryAvailable(state, hunt) {
    ensureState(state);
    if (state.legendaryHunts.caught[hunt.id] || state.legendaryHunts.defeated[hunt.id]) return true;
    if (hunt.id === "moonLumeru") return state.weather.phase === "night" && ["rain", "fog"].indexOf(state.weather.type) >= 0 || state.legendaryHunts.lures > 0;
    if (hunt.id === "crownlexGrove") return !!state.dungeons.cleared.kokLabirenti || state.legendaryHunts.lures > 0;
    if (hunt.id === "stormBarbo") return !!state.tournament.champion || state.weather.type === "storm" || state.legendaryHunts.lures > 0;
    return false;
  }

  function startLegendaryHunt(game, id) {
    var state = ensureState(game.state);
    var hunt = legendaryHunts.filter(function (h) { return h.id === id; })[0];
    if (!hunt) return { ok: false, message: "Efsane izi bulunamadı." };
    if (!legendaryAvailable(state, hunt)) return { ok: false, message: "Şart eksik: " + hunt.condition };
    if (!(hunt.id === "moonLumeru" && state.weather.phase === "night" && ["rain", "fog"].indexOf(state.weather.type) >= 0) &&
        !(hunt.id === "crownlexGrove" && state.dungeons.cleared.kokLabirenti) &&
        !(hunt.id === "stormBarbo" && (state.tournament.champion || state.weather.type === "storm")) &&
        state.legendaryHunts.lures > 0) {
      state.legendaryHunts.lures -= 1;
    }
    var creature = L.Creatures.create(hunt.creatureId, hunt.level, { shiny: !!hunt.shiny || Math.random() < 1 / 24 });
    creature.legendaryHuntId = hunt.id;
    creature.maxHp = Math.floor(creature.maxHp * 1.25);
    creature.hp = creature.maxHp;
    game.ui.closePanel();
    game.battle.startWild(creature);
    return { ok: true, message: hunt.name + " ortaya çıktı." };
  }

  function startCoopDungeon(game) {
    var state = ensureState(game.state);
    if (!game.multiplayer || !game.multiplayer.roomCode) return { ok: false, message: "Önce multiplayer odasına bağlan." };
    state.coop.dungeonRuns += 1;
    game.ui.closePanel();
    game.loadMap("batikMahzen");
    game.player.setTile(22, 34);
    game.ensurePlayerSafe("coop");
    game.resetFollower();
    game.camera.follow(game.player, game.map, 1);
    game.autosaveSoon();
    return { ok: true, message: "Co-op zindan çağrısı açıldı." };
  }

  function startCoopBoss(game) {
    var state = ensureState(game.state);
    if (!game.multiplayer || !game.multiplayer.roomCode) return { ok: false, message: "Önce multiplayer odasına bağlan." };
    var level = 30 + Math.min(12, state.coop.bossClears * 2);
    var boss = L.Creatures.create("barbo", level, { shiny: true });
    boss.maxHp = Math.floor(boss.maxHp * 1.65);
    boss.hp = boss.maxHp;
    var trainer = {
      id: "coop_boss_" + Date.now(),
      name: "Co-op Fırtına Yankısı",
      type: "boss",
      boss: true,
      giant: true,
      coopBoss: true,
      money: 0,
      afterDialogue: ["Oda enerjisi sakinleşti."]
    };
    game.ui.closePanel();
    game.battle.startTrainer(trainer, [boss]);
    return { ok: true, message: "Co-op boss başladı." };
  }

  P.ensureState = ensureState;
  P.worldAbilities = worldAbilities;
  P.homeUpgrades = homeUpgrades;
  P.tournamentRounds = tournamentRounds;
  P.legendaryHunts = legendaryHunts;
  P.moodFor = moodFor;
  P.feedActive = feedActive;
  P.chapterStatus = chapterStatus;
  P.useWorldAbility = useWorldAbility;
  P.farmLimit = farmLimit;
  P.eggProgressMultiplier = eggProgressMultiplier;
  P.buyHomeUpgrade = buyHomeUpgrade;
  P.startTournament = startTournament;
  P.resumeTournament = resumeTournament;
  P.startTournamentRound = startTournamentRound;
  P.legendaryAvailable = legendaryAvailable;
  P.startLegendaryHunt = startLegendaryHunt;
  P.startCoopDungeon = startCoopDungeon;
  P.startCoopBoss = startCoopBoss;

  P.recipes.push(
    {
      id: "crystalBall",
      name: "Kristal Luma Küresi",
      cost: { crystal: 4, ore: 2 },
      description: "Efsane ve nadir Luma avlari icin ust seviye kure.",
      craft: function (game) {
        L.Inventory.add(game.state, "kristalLumaKuresi", 1);
        return "Kristal Luma Küresi üretildi.";
      }
    },
    {
      id: "fullPotion",
      name: "Tam İksir",
      cost: { herb: 3, crystal: 2 },
      description: "Zindan ve turnuva oncesi tam iyilestirme.",
      craft: function (game) {
        L.Inventory.add(game.state, "tamIksir", 1);
        return "Tam İksir üretildi.";
      }
    },
    {
      id: "legendLure",
      name: "Efsane Yemi",
      cost: { crystal: 3, ore: 2, wood: 2 },
      description: "Efsanevi Luma şartlarından birini atlamak icin kullanilir.",
      craft: function (game) {
        ensureState(game.state).legendaryHunts.lures += 1;
        return "Efsane Yemi hazırlandı.";
      }
    }
  );

  P.update = function (game, dt) {
    baseUpdate(game, dt);
    updateMood(game, dt);
  };

  P.damageMultiplier = function (game, user, move, target) {
    var mult = baseDamageMultiplier(game, user, move, target);
    var mood = game && game.state ? moodFor(game.state, user).id : "calm";
    if (mood === "happy") mult += .04;
    if (mood === "excited") mult += .03;
    if (mood === "hungry") mult -= .03;
    if (mood === "tired") mult -= .05;
    return Math.max(.75, mult);
  };

  P.critBonus = function (game, user, move) {
    var bonus = baseCritBonus(game, user, move);
    if (game && game.state && moodFor(game.state, user).id === "excited") bonus += .04;
    return bonus;
  };

  P.afterBattleWin = function (game, active, battle) {
    var messages = [];
    var baseMessage = baseAfterBattleWin(game, active, battle);
    if (baseMessage) messages.push(baseMessage);
    var state = ensureState(game.state);
    if (active) {
      var mood = moodData(state, active);
      mood.energy = clamp(mood.energy + 10, 0, 100);
      mood.excitement = clamp(mood.excitement + 18, 0, 100);
      mood.hunger = clamp(mood.hunger + 6, 0, 100);
    }
    if (state.homeUpgrades.owned.trophyRoom && battle.type === "trainer" && !battle.trainer.pvp) {
      state.money += 45;
      messages.push("Kupa rafi +45 Luma bonus verdi.");
    }
    if (battle.trainer && battle.trainer.id && battle.trainer.id.indexOf("dungeon_boss_") === 0) {
      var dungeonId = battle.trainer.id.replace("dungeon_boss_", "");
      if (!state.dungeons.cleared[dungeonId]) {
        state.dungeons.cleared[dungeonId] = { at: Date.now(), name: battle.trainer.name };
        state.legendaryHunts.lures += 1;
        messages.push("Zindan temizlendi. 1 Efsane Yemi kazandin.");
      }
    }
    if (battle.trainer && battle.trainer.tournamentRound) {
      var round = battle.trainer.tournamentRound;
      var roundReward = tournamentRounds[round - 1] ? tournamentRounds[round - 1].reward : 180;
      state.tournament.round = Math.max(state.tournament.round, round);
      state.tournament.wins += 1;
      state.money += roundReward;
      if (round >= tournamentRounds.length) {
        state.tournament.active = false;
        state.tournament.champion = true;
        state.tournament.bestStreak = Math.max(state.tournament.bestStreak, tournamentRounds.length);
        state.money += 1100;
        if (L.Eggs) L.Eggs.grant(game, null, "turnuva");
        messages.push("Turnuva sampiyonu oldun! +" + (roundReward + 1100) + " Luma ve nadir yumurta.");
      } else {
        state.tournament.pendingRound = round + 1;
        messages.push("Tur " + round + " kazanildi. +" + roundReward + " Luma. Siradaki mac geliyor.");
      }
    }
    if (battle.trainer && battle.trainer.coopBoss) {
      state.coop.bossClears += 1;
      state.money += 650;
      addResource(state, "crystal", 3);
      messages.push("Co-op boss temizlendi. +650 Luma ve 3 Luma Kristali.");
    }
    if (battle.type === "wild" && battle.enemy && battle.enemy.legendaryHuntId) {
      state.legendaryHunts.defeated[battle.enemy.legendaryHuntId] = { at: Date.now(), name: battle.enemy.displayName };
      messages.push("Efsane izi kayda gecti: " + battle.enemy.displayName + ".");
    }
    return messages.join(" ");
  };

  P.afterCapture = function (game, creature) {
    baseAfterCapture(game, creature);
    if (creature && creature.legendaryHuntId) {
      ensureState(game.state).legendaryHunts.caught[creature.legendaryHuntId] = { at: Date.now(), name: creature.displayName };
      if (game.ui) game.ui.notify("Efsane Lumadex'e islendi.");
    }
  };

  P.afterBattleEnd = function (game) {
    var state = ensureState(game.state);
    if (!state.tournament.pendingRound) return;
    var next = state.tournament.pendingRound;
    var tries = 0;
    function tryStart() {
      if (!game.state) return;
      if (game.mode !== "world") {
        tries += 1;
        if (tries < 12) setTimeout(tryStart, 700);
        return;
      }
      ensureState(game.state).tournament.pendingRound = 0;
      startTournamentRound(game, next);
    }
    setTimeout(tryStart, 900);
  };
})();
