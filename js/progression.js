(function () {
  var L = window.LUMA = window.LUMA || {};

  var weatherTypes = [
    { id: "clear", name: "Acik hava", color: null },
    { id: "rain", name: "Yagmur", color: "rgba(52, 117, 168, .16)" },
    { id: "ember", name: "Kor esintisi", color: "rgba(226, 94, 48, .12)" },
    { id: "fog", name: "Sis", color: "rgba(225, 232, 220, .18)" },
    { id: "snow", name: "Kristal kari", color: "rgba(215, 244, 255, .16)" },
    { id: "storm", name: "Kivilcim firtinasi", color: "rgba(88, 86, 160, .16)" }
  ];

  var resourceInfo = {
    herb: { name: "Sifa Otu", color: "#62b85f" },
    ore: { name: "Tas Cevheri", color: "#8b919b" },
    wood: { name: "Esnek Dal", color: "#a87845" },
    crystal: { name: "Luma Kristali", color: "#7ed8ee" }
  };

  var recipes = [
    {
      id: "potion",
      name: "2 Kucuk Iksir",
      cost: { herb: 2 },
      description: "Saha toplamasindan temel iyilestirme uret.",
      craft: function (game) {
        L.Inventory.add(game.state, "kucukIksir", 2);
        return "2 Kucuk Iksir uretildi.";
      }
    },
    {
      id: "ball",
      name: "2 Luma Kuresi",
      cost: { ore: 1, crystal: 1 },
      description: "Gezici Luma yakalamak icin guvenli kure.",
      craft: function (game) {
        L.Inventory.add(game.state, "lumaKuresi", 2);
        return "2 Luma Kuresi uretildi.";
      }
    },
    {
      id: "strongBall",
      name: "Guclu Kure",
      cost: { ore: 2, crystal: 2 },
      description: "Nadir Luma ve boss sonrasi avlar icin.",
      craft: function (game) {
        L.Inventory.add(game.state, "gucluLumaKuresi", 1);
        return "Guclu Luma Kuresi hazir.";
      }
    },
    {
      id: "egg",
      name: "Gizemli Yumurta",
      cost: { herb: 2, wood: 1, crystal: 2 },
      description: "Yuvada isi toplayan Luma yumurtasi.",
      craft: function (game) {
        if (L.Eggs) L.Eggs.grant(game, null, "atolye");
        return "Gizemli Luma yumurtasi yuvaya eklendi.";
      }
    },
    {
      id: "bond",
      name: "Yoldas Bakimi",
      cost: { herb: 1, wood: 1 },
      description: "Aktif Luma ile dostlugu hizli artirir.",
      craft: function (game) {
        var creature = activeCreature(game);
        if (creature) addFriendship(game, creature, 8);
        return creature ? creature.displayName + " daha yakin hissediyor." : "Once ekibe bir Luma al.";
      }
    }
  ];

  var storyBosses = [
    { id: "leafTitan", title: "Taçorman Devi", element: "Yaprak", creatureId: "crownlex", level: 34, reward: 680, resource: "wood", map: "yesilova", subtitle: "Koklerden kalkan dev tacli Luma" },
    { id: "sparkTitan", title: "Barbo Yildirim Krali", element: "Elektrik", creatureId: "barbo", level: 35, reward: 720, resource: "crystal", map: "trenIstasyonu", subtitle: "Raylarin ustunde buyuyen kivilcim hukumdari" },
    { id: "stoneTitan", title: "Kristalor Magara Lordu", element: "Kaya", creatureId: "kristalik", level: 37, reward: 760, resource: "ore", map: "magara", subtitle: "Eski tasin icinde uyuyan agir basli dev" },
    { id: "lightTitan", title: "Lumeru Safak Nöbetcisi", element: "Işık", creatureId: "lumeru", level: 40, reward: 900, resource: "crystal", map: "buyukArena", subtitle: "Arenayi gun gibi aydinlatan final sinavi" }
  ];

  function emptyResources() {
    return { herb: 0, ore: 0, wood: 0, crystal: 0 };
  }

  function ensureState(state) {
    state.friendship = state.friendship && typeof state.friendship === "object" ? state.friendship : {};
    state.friendship.values = Object.assign({}, state.friendship.values || {});
    state.friendship.total = Number(state.friendship.total) || 0;
    state.resources = Object.assign(emptyResources(), state.resources || {});
    state.crafting = Object.assign({ crafted: 0 }, state.crafting || {});
    state.weather = Object.assign({ type: "clear", timer: 0, day: 1, phase: "day", season: "Bahar" }, state.weather || {});
    state.farm = Object.assign({ planted: 0, growth: 0, harvestReady: 0, harvests: 0 }, state.farm || {});
    state.minigames = Object.assign({ played: 0, wins: 0, bestScore: 0 }, state.minigames || {});
    state.storyBosses = state.storyBosses && typeof state.storyBosses === "object" ? state.storyBosses : {};
    state.storyBosses.defeated = Object.assign({}, state.storyBosses.defeated || {});
    return state;
  }

  function activeCreature(game) {
    if (!game || !game.state || !game.state.team) return null;
    return game.state.team[game.state.activeIndex] || game.state.team[0] || null;
  }

  function creatureKey(creature) {
    return creature ? (creature.uid || creature.id) : "";
  }

  function friendship(state, creature) {
    ensureState(state);
    return Math.max(0, Math.min(100, Number(state.friendship.values[creatureKey(creature)]) || 0));
  }

  function addFriendship(game, creature, amount) {
    if (!game || !game.state || !creature) return 0;
    var state = ensureState(game.state);
    var key = creatureKey(creature);
    var before = friendship(state, creature);
    var next = Math.max(0, Math.min(100, before + amount));
    state.friendship.values[key] = next;
    state.friendship.total += Math.max(0, next - before);
    return next - before;
  }

  function passiveFor(creature) {
    var element = creature && creature.element;
    if (element === "Alev") return { name: "Kor Gururu", description: "Kor esintisinde ve yuksek dostlukta saldiri artar." };
    if (element === "Su") return { name: "Akis Nefesi", description: "Yagmurda daha sert vurur, zafer sonrasi az can toplar." };
    if (element === "Yaprak") return { name: "Kok Baglari", description: "Toplama odullerini ve dostluk kazancini artirir." };
    if (element === "Kaya") return { name: "Tas Zirh", description: "Savunmasi kalinlasir, boss vuruslarina daha iyi dayanir." };
    if (element === "Rüzgar") return { name: "Hafif Adim", description: "Kritik sansi ve mini oyun skoru artar." };
    if (element === "Elektrik") return { name: "Kivilcim Refleksi", description: "Firtinada hizli ve keskin saldirir." };
    if (element === "Gölge") return { name: "Gece Avcisi", description: "Gece savaslarinda daha tehlikeli olur." };
    if (element === "Işık") return { name: "Parilti Kalbi", description: "Dostluk hizli artar, zaferde takima moral verir." };
    return { name: "Yoldas Ruhu", description: "Dostluk arttikca savasta guclenir." };
  }

  function currentWeather(state) {
    ensureState(state);
    for (var i = 0; i < weatherTypes.length; i += 1) {
      if (weatherTypes[i].id === state.weather.type) return weatherTypes[i];
    }
    return weatherTypes[0];
  }

  function weatherLabel(state) {
    var w = currentWeather(state);
    return w.name + " / " + (state.weather.phase === "night" ? "Gece" : "Gunduz") + " " + state.weather.day + " / " + state.weather.season;
  }

  function updateWeather(game, dt) {
    var state = ensureState(game.state);
    state.weather.timer += dt;
    state.weather.day = 1 + Math.floor((state.playTime || 0) / 160);
    state.weather.phase = Math.floor((state.playTime || 0) / 80) % 2 ? "night" : "day";
    state.weather.season = ["Bahar", "Yaz", "Sonbahar", "Kis"][Math.floor((state.weather.day - 1) / 4) % 4];
    if (state.weather.timer >= 70) {
      state.weather.timer = 0;
      var seed = Math.floor((state.playTime || 0) / 7) + state.weather.day * 3;
      var next = weatherTypes[seed % weatherTypes.length].id;
      if (next !== state.weather.type) {
        state.weather.type = next;
        if (game.ui) game.ui.notify("Hava degisti: " + currentWeather(state).name);
      }
    }
  }

  function drawWeather(game, ctx) {
    if (!game || !game.state || !ctx) return;
    var state = ensureState(game.state);
    var w = currentWeather(state);
    if (state.weather.phase === "night") {
      ctx.fillStyle = "rgba(8, 18, 42, .18)";
      ctx.fillRect(0, 0, 480, 270);
    }
    if (w.color) {
      ctx.fillStyle = w.color;
      ctx.fillRect(0, 0, 480, 270);
    }
    var t = game.time || 0;
    if (state.weather.type === "rain" || state.weather.type === "storm") {
      ctx.strokeStyle = state.weather.type === "storm" ? "rgba(190, 220, 255, .55)" : "rgba(160, 214, 235, .45)";
      ctx.lineWidth = 1;
      for (var r = 0; r < 36; r += 1) {
        var x = (r * 37 + Math.floor(t * 95)) % 520 - 20;
        var y = (r * 19 + Math.floor(t * 145)) % 300 - 20;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y + 9);
        ctx.stroke();
      }
    }
    if (state.weather.type === "snow") {
      ctx.fillStyle = "rgba(244, 252, 255, .72)";
      for (var s = 0; s < 28; s += 1) {
        ctx.fillRect((s * 41 + Math.floor(t * 24)) % 500 - 10, (s * 23 + Math.floor(t * 38)) % 290 - 10, 2, 2);
      }
    }
    if (state.weather.type === "fog") {
      ctx.fillStyle = "rgba(229, 235, 221, .12)";
      for (var f = 0; f < 5; f += 1) {
        ctx.fillRect((f * 118 + Math.floor(t * 12)) % 620 - 120, 42 + f * 38, 160, 18);
      }
    }
  }

  function resourceName(id) {
    return resourceInfo[id] ? resourceInfo[id].name : id;
  }

  function canPay(resources, cost) {
    return Object.keys(cost).every(function (id) { return (resources[id] || 0) >= cost[id]; });
  }

  function pay(resources, cost) {
    Object.keys(cost).forEach(function (id) { resources[id] -= cost[id]; });
  }

  function addResource(state, id, amount) {
    ensureState(state);
    state.resources[id] = (state.resources[id] || 0) + amount;
  }

  function gather(game) {
    var state = ensureState(game.state);
    var mapId = game.map && game.map.id || "";
    var pool = ["herb", "wood"];
    if (/magara|maden|arena_stone|kristal/i.test(mapId)) pool = ["ore", "crystal"];
    else if (/orman|yesil|park|bahce|ev/i.test(mapId)) pool = ["herb", "wood", "herb"];
    else if (/gol|liman|nehir|su|ada/i.test(mapId)) pool = ["herb", "crystal"];
    else if (/istasyon|fabrika|sehir/i.test(mapId)) pool = ["ore", "wood", "crystal"];
    if (state.weather.season === "Bahar") pool.push("herb");
    if (state.weather.season === "Yaz") pool.push("wood");
    if (state.weather.season === "Sonbahar") pool.push("ore");
    if (state.weather.season === "Kis") pool.push("crystal");
    var creature = activeCreature(game);
    var key = pool[Math.floor(Math.random() * pool.length)];
    var amount = 1 + (Math.random() < .22 ? 1 : 0);
    if (creature && creature.element === "Yaprak" && Math.random() < .45) amount += 1;
    addResource(state, key, amount);
    addFriendship(game, creature, creature && creature.element === "Yaprak" ? 2 : 1);
    if (L.Daily) L.Daily.progress(state, "earnMoney", 5);
    game.autosaveSoon();
    return amount + " " + resourceName(key) + " toplandi.";
  }

  function craft(game, recipeId) {
    var state = ensureState(game.state);
    var recipe = recipes.filter(function (r) { return r.id === recipeId; })[0];
    if (!recipe) return { ok: false, message: "Tarif bulunamadi." };
    if (recipe.id === "bond" && !activeCreature(game)) return { ok: false, message: "Once ekibe bir Luma al." };
    if (!canPay(state.resources, recipe.cost)) return { ok: false, message: "Malzeme eksik." };
    pay(state.resources, recipe.cost);
    state.crafting.crafted += 1;
    var message = recipe.craft(game);
    if (L.Daily) L.Daily.progress(state, "earnMoney", 10);
    game.autosaveSoon();
    return { ok: true, message: message };
  }

  function playMinigame(game, kind) {
    var state = ensureState(game.state);
    var creature = activeCreature(game);
    var friend = creature ? friendship(state, creature) : 0;
    var passive = creature && creature.element === "Rüzgar" ? 12 : 0;
    var score = Math.floor(30 + Math.random() * 66 + friend * .28 + passive);
    var won = score >= 64;
    state.minigames.played += 1;
    state.minigames.bestScore = Math.max(state.minigames.bestScore || 0, score);
    if (won) state.minigames.wins += 1;
    var money = won ? 95 + Math.floor(score / 3) : 35;
    state.money += money;
    if (kind === "mining") addResource(state, Math.random() < .45 ? "crystal" : "ore", won ? 2 : 1);
    if (kind === "garden") addResource(state, Math.random() < .55 ? "herb" : "wood", won ? 2 : 1);
    if (kind === "race") addFriendship(game, creature, won ? 5 : 2);
    if (L.Quests) L.Quests.progress(state, "earnMoney", money);
    game.autosaveSoon();
    return (won ? "Kazandin! " : "Fena degil. ") + score + " skor, +" + money + " Luma.";
  }

  function plant(game) {
    var state = ensureState(game.state);
    if (!state.housing || state.housing.status === "none") return { ok: false, message: "Once ev kirala ya da satin al." };
    if (state.farm.planted >= 3) return { ok: false, message: "Bahcede zaten 3 fide var." };
    if (state.resources.herb > 0) state.resources.herb -= 1;
    else if (state.money >= 40) state.money -= 40;
    else return { ok: false, message: "Fide icin 1 Sifa Otu veya 40 Luma gerekiyor." };
    state.farm.planted += 1;
    game.autosaveSoon();
    return { ok: true, message: "Bahceye fide dikildi." };
  }

  function walk(game, tiles) {
    var state = ensureState(game.state);
    if (!state.farm.planted) return;
    state.farm.growth += Math.max(0, tiles || 0) * state.farm.planted;
    if (state.farm.growth >= 80) {
      state.farm.harvestReady += state.farm.planted;
      state.farm.planted = 0;
      state.farm.growth = 0;
      if (game.ui) game.ui.notify("Bahcedeki urunler hazir.");
    }
  }

  function harvest(game) {
    var state = ensureState(game.state);
    if (!state.farm.harvestReady) return { ok: false, message: "Henuz hasat yok." };
    var count = state.farm.harvestReady;
    state.farm.harvestReady = 0;
    state.farm.harvests += count;
    addResource(state, "herb", count + 1);
    addResource(state, "wood", Math.max(1, Math.floor(count / 2)));
    state.money += count * 45;
    if (count >= 3 && L.Eggs && Math.random() < .55) L.Eggs.grant(game, "Yaprak", "bahce");
    game.autosaveSoon();
    return { ok: true, message: count + " hasat alindi, bahce para ve malzeme verdi." };
  }

  function damageMultiplier(game, user, move) {
    if (!game || !game.state || !user) return 1;
    var state = ensureState(game.state);
    var w = state.weather.type;
    var mult = 1;
    var friend = friendship(state, user);
    if (friend >= 35) mult += .03;
    if (friend >= 70) mult += .05;
    if (user.element === "Alev" && (w === "ember" || move.element === "Alev")) mult += .06;
    if (user.element === "Su" && w === "rain") mult += .08;
    if (user.element === "Elektrik" && w === "storm") mult += .1;
    if (user.element === "Gölge" && state.weather.phase === "night") mult += .08;
    if (user.element === "Işık" && state.weather.phase !== "night") mult += .04;
    return mult;
  }

  function defenseMultiplier(game, target) {
    if (!game || !game.state || !target) return 1;
    var mult = 1;
    if (target.element === "Kaya") mult += .08;
    if (target.element === "Yaprak" && game.state.weather.type === "rain") mult += .04;
    return mult;
  }

  function critBonus(game, user) {
    if (!game || !game.state || !user) return 0;
    return user.element === "Rüzgar" ? .05 : (friendship(game.state, user) >= 80 ? .03 : 0);
  }

  function afterBattleWin(game, active, battle) {
    if (!game || !game.state || !active) return null;
    var state = ensureState(game.state);
    var gained = addFriendship(game, active, active.element === "Işık" ? 5 : 3);
    if (active.element === "Su" && active.hp > 0) active.hp = Math.min(active.maxHp, active.hp + Math.ceil(active.maxHp * .08));
    if (battle && battle.trainer && battle.trainer.storyBossId) {
      var bossId = battle.trainer.storyBossId;
      var spec = storyBosses.filter(function (b) { return b.id === bossId; })[0];
      if (spec && !state.storyBosses.defeated[bossId]) {
        state.storyBosses.defeated[bossId] = { at: Date.now(), title: spec.title };
        state.money += spec.reward;
        addResource(state, spec.resource, 4);
        if (L.Eggs) L.Eggs.grant(game, spec.element, "boss");
        return spec.title + " dustu! +" + spec.reward + " Luma, 4 " + resourceName(spec.resource) + " ve boss yumurtasi.";
      }
    }
    if (gained && game.ui) game.ui.notify(active.displayName + " dostluk +" + gained);
    return null;
  }

  function afterCapture(game, creature) {
    if (!game || !creature) return;
    addFriendship(game, creature, creature.element === "Işık" ? 6 : 4);
  }

  function challengeStoryBoss(game, id) {
    var state = ensureState(game.state);
    var spec = storyBosses.filter(function (b) { return b.id === id; })[0];
    if (!spec) return { ok: false, message: "Boss bulunamadi." };
    if (!game.state.team || !game.state.team.length) return { ok: false, message: "Once ekibine bir Luma al." };
    var boss = L.Creatures.create(spec.creatureId, spec.level, { shiny: id === "lightTitan" });
    boss.maxHp = Math.floor(boss.maxHp * 1.75);
    boss.hp = boss.maxHp;
    boss.attack = Math.floor(boss.attack * 1.22);
    boss.defense = Math.floor(boss.defense * 1.15);
    var trainer = {
      id: "story_boss_" + spec.id,
      name: spec.title,
      type: "boss",
      boss: true,
      giant: true,
      storyBossId: spec.id,
      money: state.storyBosses.defeated[spec.id] ? Math.floor(spec.reward * .25) : 0,
      afterDialogue: [spec.title + " saygiyla geri cekildi. Sehirde adin yankilaniyor."]
    };
    game.ui.closePanel();
    game.battle.startTrainer(trainer, [boss]);
    return { ok: true, message: spec.title + " savasi basladi." };
  }

  function evolutionTreeHtml(creature) {
    if (!creature || !L.Evolution) return "";
    var chain = L.Evolution.chainFor(creature.id);
    if (!chain.length) return "<div class='panel-row'>Bu Luma icin evrim agaci yok.</div>";
    var html = "<div class='evo-tree'>";
    chain.forEach(function (node, index) {
      var nodeId = typeof node === "string" ? node : node.id;
      var base = L.Creatures.getBase(nodeId);
      var current = nodeId === creature.id;
      html += "<div class='evo-node" + (current ? " current" : "") + "'><strong>" + (base ? base.name : nodeId) + "</strong>";
      if (base && base.evolution && index < chain.length - 1) html += "<small>Sv. " + base.evolution.level + "</small>";
      if (index < chain.length - 1) html += "<span>></span>";
      html += "</div>";
    });
    html += "</div>";
    return html;
  }

  L.Progression = {
    weatherTypes: weatherTypes,
    resources: resourceInfo,
    recipes: recipes,
    storyBosses: storyBosses,
    ensureState: ensureState,
    friendship: friendship,
    addFriendship: addFriendship,
    passiveFor: passiveFor,
    currentWeather: currentWeather,
    weatherLabel: weatherLabel,
    update: updateWeather,
    drawWeather: drawWeather,
    gather: gather,
    craft: craft,
    playMinigame: playMinigame,
    plant: plant,
    walk: walk,
    harvest: harvest,
    damageMultiplier: damageMultiplier,
    defenseMultiplier: defenseMultiplier,
    critBonus: critBonus,
    afterBattleWin: afterBattleWin,
    afterCapture: afterCapture,
    challengeStoryBoss: challengeStoryBoss,
    evolutionTreeHtml: evolutionTreeHtml,
    resourceName: resourceName
  };
})();
