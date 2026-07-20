(function () {
  var L = window.LUMA = window.LUMA || {};
  var TILE = 16;

  var primeUnlockGroups = {
    starter: ["filizik", "kozpati", "kopukcu", "korcik"],
    primeWarden: ["lavsirt", "korbaykus", "sporkral", "lavagon", "magmerten", "lavakurt"],
    fungusPuzzle: ["sporkral", "tacmantar"],
    crystalSeal: ["nehiryal", "kristalpin"],
    treasureVault: ["kemikdis", "obsigoz"],
    crownGuard: ["korboynuz", "obsigoz", "nehiryal", "kemikdis"],
    shadowKing: ["tahtkor", "tacmantar", "korboynuz"]
  };

  var eventText = {
    lavDenizi: ["Lav seviyesi yukseliyor. Obsidyen kopruler araliklarla soguyup tekrar eriyecek.", "Kopru kararinca ustunde kalma; sarsinti seni guvenli noktaya atar."],
    mantarOrmani: ["Fosfor mantarlari bir sira istiyor: ay isigi, kor isigi, kok isigi.", "Dogru sirayi bulursan gizli Prime kilidi acilir."],
    kristalNehir: ["Kristal akintilari zemini tasir. Parlayan akinti ustunde durursan saga veya sola suruklenirsin."],
    buzulMagara: ["Soguk Derinlik'te buz yolu kaygandir. Bir yöne girince kayis seni devam ettirir."],
    kemikKumlari: ["Kemik Kumlari'nin alti bos. Koyu cukurlar seni geri savurur ama gizli define izini de verir."],
    primeOcagi: ["Prime Ocagi kilitli formlarin kaynagi. Prime Muhafizi yenilmeden kuzeydeki taht yolu tam acilmaz."],
    tahtSalonu: ["Taht Salonu'nda lav sesi kesildi. Son muhafiz dusunce tahtin golgesi uyanabilir."]
  };

  function ensureState(state) {
    state.underground = Object.assign({
      events: {},
      puzzle: { fungus: [] },
      flags: {},
      cooldowns: {},
      bridgeOpen: true,
      bridgeLast: null,
      secretVaultOpen: false,
      shadowBossDefeated: false
    }, state.underground || {});
    state.underground.events = Object.assign({}, state.underground.events || {});
    state.underground.puzzle = Object.assign({ fungus: [] }, state.underground.puzzle || {});
    state.underground.puzzle.fungus = Array.isArray(state.underground.puzzle.fungus) ? state.underground.puzzle.fungus : [];
    state.underground.flags = Object.assign({}, state.underground.flags || {});
    state.underground.cooldowns = Object.assign({}, state.underground.cooldowns || {});
    state.prime = Object.assign({ unlocked: true, activations: 0, unlockedSpecies: {} }, state.prime || {});
    state.prime.unlockedSpecies = Object.assign({}, state.prime.unlockedSpecies || {});
    primeUnlockGroups.starter.forEach(function (id) {
      if (window.LUMA_DATA.creatures[id]) state.prime.unlockedSpecies[id] = true;
    });
    return state.underground;
  }

  function setRect(map, layerName, x, y, w, h, value) {
    for (var yy = y; yy < y + h; yy += 1) {
      for (var xx = x; xx < x + w; xx += 1) {
        if (xx >= 0 && yy >= 0 && xx < map.w && yy < map.h) map[layerName][yy * map.w + xx] = value;
      }
    }
  }

  function inRect(tile, rect) {
    return tile.x >= rect.x && tile.y >= rect.y && tile.x < rect.x + rect.w && tile.y < rect.y + rect.h;
  }

  function playerTile(game) {
    var foot = game.player.footRect(game.player.x, game.player.y);
    return L.Collision.tileAtPixel(game.map, foot.x + foot.w / 2, foot.y + foot.h / 2);
  }

  function questObjectiveCount(state, objectiveId) {
    var count = 0;
    Object.keys(state.quests || {}).forEach(function (qid) {
      var q = state.quests[qid];
      (q.objectives || []).forEach(function (obj) {
        if (obj.id === objectiveId) count = Math.max(count, obj.count || 0);
      });
    });
    return count;
  }

  function questCompleted(state, id) {
    return state.quests && state.quests[id] && state.quests[id].status === "completed";
  }

  function unlockSpecies(state, ids, silent) {
    ensureState(state);
    var changed = 0;
    ids.forEach(function (id) {
      if (!window.LUMA_DATA.creatures[id] || state.prime.unlockedSpecies[id]) return;
      state.prime.unlockedSpecies[id] = true;
      changed += 1;
    });
    if (changed && !silent && L.Quests) L.Quests.progress(state, "unlockPrimeSpecies", changed);
    return changed;
  }

  function hasPrimeSpecies(state, id) {
    ensureState(state);
    return !!state.prime.unlockedSpecies[id];
  }

  function usePrimeStone(game, creature) {
    var state = game.state;
    ensureState(state);
    creature = creature || (state.team && (state.team[state.activeIndex] || state.team[0]));
    if (!creature) return { ok: false, message: "Once ekibine bir Luma al." };
    var base = window.LUMA_DATA.creatures[creature.id];
    if (!base || !base.prime) return { ok: false, message: creature.displayName + " icin Prime formu yok." };
    if (hasPrimeSpecies(state, creature.id)) return { ok: false, message: creature.displayName + " Prime kilidi zaten acik." };
    if ((state.inventory.primeTasi || 0) <= 0) return { ok: false, message: "Prime Tasi gerekiyor." };
    if (!L.Inventory.remove(state, "primeTasi", 1)) return { ok: false, message: "Prime Tasi bulunamadi." };
    unlockSpecies(state, [creature.id]);
    if (L.Quests) L.Quests.progress(state, "usePrimeStone", 1);
    game.autosaveSoon();
    return { ok: true, message: creature.displayName + " icin Prime kilidi acildi." };
  }

  function applyMapMarks(map) {
    if (!map || map._undergroundMarksApplied) return;
    map._undergroundMarksApplied = true;
    if (map.id === "kristalNehir") {
      setRect(map, "ground", 35, 19, 14, 3, "crystalCurrent");
      setRect(map, "ground", 8, 19, 12, 3, "crystalCurrent");
      setRect(map, "ground", 28, 7, 6, 7, "crystalCurrent");
    }
    if (map.id === "buzulMagara") {
      setRect(map, "ground", 8, 25, 19, 8, "icePath");
      setRect(map, "ground", 37, 7, 18, 8, "icePath");
      setRect(map, "ground", 38, 25, 16, 8, "icePath");
    }
    if (map.id === "kemikKumlari") {
      setRect(map, "ground", 13, 10, 3, 3, "bonePit");
      setRect(map, "ground", 43, 29, 3, 3, "bonePit");
      setRect(map, "ground", 37, 13, 4, 3, "bonePit");
    }
    if (map.id === "defineMahzeni") {
      setRect(map, "ground", 28, 6, 7, 5, "secretFloor");
      setRect(map, "collision", 28, 6, 7, 5, 1);
      setRect(map, "collision", 31, 10, 1, 1, 0);
    }
  }

  function refreshMapState(game) {
    if (!game || !game.map || !game.state) return;
    var underground = ensureState(game.state);
    if (game.map.id === "defineMahzeni" && underground.secretVaultOpen) {
      setRect(game.map, "collision", 28, 6, 7, 5, 0);
    }
  }

  function setLavaBridge(game) {
    var map = game.map;
    if (!map || map.id !== "lavDenizi") return;
    var state = game.state;
    var underground = ensureState(state);
    var open = Math.floor((game.time || 0) / 3.2) % 2 === 0;
    underground.bridgeOpen = open;
    var bridges = [
      { x: 11, y: 31, w: 17, h: 3 },
      { x: 36, y: 31, w: 17, h: 3 }
    ];
    bridges.forEach(function (rect) {
      setRect(map, "ground", rect.x, rect.y, rect.w, rect.h, open ? "obsidian" : "lava");
      setRect(map, "collision", rect.x, rect.y, rect.w, rect.h, open ? 0 : 1);
    });
    var tile = playerTile(game);
    var onBridge = bridges.some(function (rect) { return inRect(tile, rect); });
    if (underground.bridgeLast !== open) {
      underground.bridgeLast = open;
      if (game.mode === "world" && game.ui) game.ui.notify(open ? "Lav koprusu sogudu: gecis acik." : "Lav koprusu eridi: bekle!");
    }
    if (open && onBridge && !underground.flags.lavaBridgeCrossed) {
      underground.flags.lavaBridgeCrossed = true;
      if (L.Quests) L.Quests.progress(state, "crossLavaBridge", 1);
      if (game.ui) game.ui.notify("Zamanli lav koprusunu astin.");
    }
    if (!open) {
      if (onBridge && !underground.cooldowns.bridgeKick) {
        underground.cooldowns.bridgeKick = 1.2;
        var safe = game.findSafeMoveTile("lavDenizi", 31, 23);
        game.player.setTile(safe.x, safe.y);
        game.resetFollower();
        game.syncState();
        if (game.particles) game.particles.spawn(game.player.x, game.player.y, "#ff8b45", 16);
        if (game.ui) game.ui.notify("Lav yukselince kopruden geri savruldun.");
      }
    }
  }

  function movePlayer(game, vx, vy, dt) {
    var nx = game.player.x + vx * dt;
    var ny = game.player.y + vy * dt;
    var foot = game.player.footRect(nx, ny);
    if (!L.Collision.rectBlocked(game.map, foot.x, foot.y, foot.w, foot.h, game.npcs.current)) {
      game.player.x = nx;
      game.player.y = ny;
      return true;
    }
    return false;
  }

  function updateCrystalCurrent(game, dt) {
    if (!game.map || game.map.id !== "kristalNehir") return;
    var tile = playerTile(game);
    var currents = [
      { x: 35, y: 19, w: 14, h: 3, vx: 72, vy: 0 },
      { x: 8, y: 19, w: 12, h: 3, vx: -72, vy: 0 },
      { x: 28, y: 7, w: 6, h: 7, vx: 0, vy: -72 }
    ];
    for (var i = 0; i < currents.length; i += 1) {
      if (inRect(tile, currents[i])) {
        movePlayer(game, currents[i].vx, currents[i].vy, dt);
        if (!game.state.underground.flags.crystalCurrent) {
          game.state.underground.flags.crystalCurrent = true;
          if (L.Quests) L.Quests.progress(game.state, "rideCrystalCurrent", 1);
          if (game.ui) game.ui.notify("Kristal akintisi seni tasidi.");
        }
        return;
      }
    }
  }

  function updateIceSlide(game, dt) {
    if (!game.map || game.map.id !== "buzulMagara") return;
    var tile = playerTile(game);
    var ice = [
      { x: 8, y: 25, w: 19, h: 8 },
      { x: 37, y: 7, w: 18, h: 8 },
      { x: 38, y: 25, w: 16, h: 8 }
    ];
    if (!ice.some(function (rect) { return inRect(tile, rect); })) return;
    var dir = game.player.dir || "down";
    var vx = dir === "left" ? -82 : (dir === "right" ? 82 : 0);
    var vy = dir === "up" ? -82 : (dir === "down" ? 82 : 0);
    if (vx || vy) movePlayer(game, vx, vy, dt);
    if (!game.state.underground.flags.iceSlide) {
      game.state.underground.flags.iceSlide = true;
      if (L.Quests) L.Quests.progress(game.state, "slideIcePath", 1);
      if (game.ui) game.ui.notify("Buz yolu seni kaydirdi.");
    }
  }

  function updateBonePits(game) {
    if (!game.map || game.map.id !== "kemikKumlari") return;
    var underground = ensureState(game.state);
    if (underground.cooldowns.pit > 0) return;
    var tile = playerTile(game);
    var pits = [
      { x: 13, y: 10, w: 3, h: 3, safe: [29, 23] },
      { x: 43, y: 29, w: 3, h: 3, safe: [42, 23] },
      { x: 37, y: 13, w: 4, h: 3, safe: [31, 20] }
    ];
    for (var i = 0; i < pits.length; i += 1) {
      if (!inRect(tile, pits[i])) continue;
      underground.cooldowns.pit = 2.2;
      game.player.setTile(pits[i].safe[0], pits[i].safe[1]);
      game.resetFollower();
      game.syncState();
      game.state.money = Math.max(0, game.state.money - 25);
      if (L.Quests) L.Quests.progress(game.state, "surviveBonePit", 1);
      if (game.particles) game.particles.spawn(game.player.x, game.player.y, "#d8cfb4", 12);
      if (game.ui) game.ui.notify("Gizli cukura dustun. -25 Luma, ama izleri ogrendin.");
      return;
    }
  }

  function cooldowns(state, dt) {
    var cd = ensureState(state).cooldowns;
    Object.keys(cd).forEach(function (key) { cd[key] = Math.max(0, cd[key] - dt); });
  }

  function showMapEvent(game, mapId) {
    var underground = ensureState(game.state);
    if (underground.events[mapId] || !eventText[mapId] || game.mode !== "world") return;
    underground.events[mapId] = true;
    game.dialogue.show(mapId === "tahtSalonu" ? "Taht Salonu" : "Haritaci Nira", eventText[mapId], function () {
      if (mapId === "tahtSalonu" && !game.state.defeatedTrainers.trainer_taht_muhafiz && game.ui) {
        game.ui.notify("Final muhafiz seni bekliyor.");
      }
      game.autosaveSoon();
    });
  }

  function handleFungusPuzzle(game, interaction) {
    var underground = ensureState(game.state);
    var order = ["ay", "kor", "kok"];
    var seq = underground.puzzle.fungus;
    var expected = order[seq.length];
    if (interaction.key !== expected) {
      underground.puzzle.fungus = [];
      game.dialogue.show("Fosfor Mantari", ["Sira bozuldu. Mantarlar yeniden karardi.", "Ipucu: once ay isigi, sonra kor, en son kok."]);
      if (L.Audio) L.Audio.play("error");
      return true;
    }
    seq.push(interaction.key);
    if (seq.length < order.length) {
      game.dialogue.show("Fosfor Mantari", [interaction.text || "Mantar cevap verdi.", "Sira dogru. Bir sonraki isigi bul."]);
      if (L.Audio) L.Audio.play("quest");
      return true;
    }
    underground.flags.fungusPuzzle = true;
    underground.puzzle.fungus = [];
    L.Inventory.add(game.state, "mantarAnahtari", 1);
    unlockSpecies(game.state, primeUnlockGroups.fungusPuzzle);
    if (L.Quests) L.Quests.progress(game.state, "solveFungusPuzzle", 1);
    game.dialogue.show("Fosfor Mantari", ["Uc isik ayni anda yandi. Fosfor Anahtari cantana dustu.", "Sporkral ve Tacmantar Prime kilitleri aralandi."]);
    if (L.Audio) L.Audio.play("victory");
    game.autosaveSoon();
    return true;
  }

  function handleSecretVault(game) {
    var state = game.state;
    var underground = ensureState(state);
    if (underground.secretVaultOpen) {
      game.dialogue.show("Gizli Oda", ["Kapı zaten acik. Icindeki eski Prime izi artik sende."]);
      return true;
    }
    var pieces = state.inventory.haritaParcasi || 0;
    var relics = questObjectiveCount(state, "collectRoyalRelic");
    if (pieces < 4 || relics < 8) {
      game.dialogue.show("Gizli Oda", ["Kapı kipirdiyor ama acilmiyor.", "Gereken: 4 harita parcasi ve 8 kraliyet relici. Sende: " + pieces + "/4 parca, " + relics + "/8 relic."]);
      if (L.Audio) L.Audio.play("error");
      return true;
    }
    underground.secretVaultOpen = true;
    setRect(game.map, "collision", 28, 6, 7, 5, 0);
    L.Inventory.add(state, "primeTasi", 1);
    L.Inventory.add(state, "kralinGolgesi", 1);
    unlockSpecies(state, primeUnlockGroups.treasureVault);
    if (L.Quests) L.Quests.progress(state, "openSecretVault", 1);
    game.dialogue.show("Gizli Oda", ["Sekiz relic ayni anda parladı. Gizli define odasi acildi.", "Prime Tasi ve Kralin Golgesi relici cantana eklendi."]);
    if (L.Audio) L.Audio.play("victory");
    game.autosaveSoon();
    return true;
  }

  function handleShadowBoss(game) {
    var state = game.state;
    ensureState(state);
    if (!state.defeatedTrainers.trainer_taht_muhafiz) {
      game.dialogue.show("Taht Gölgesi", ["Golgenin uyanmasi icin once Taht Muhafizi Varkan'i yenmelisin."]);
      if (L.Audio) L.Audio.play("error");
      return true;
    }
    if (state.defeatedTrainers.trainer_kralin_golgesi) {
      game.dialogue.show("Taht Gölgesi", ["Kralin Golgesi sustu. Taht artik yalnizca lav sesi cikarıyor."]);
      return true;
    }
    var trainer = {
      id: "trainer_kralin_golgesi",
      name: "Kralin Golgesi",
      type: "boss",
      boss: true,
      giant: true,
      prime: true,
      primeIndex: 1,
      money: 1600,
      questObjective: "beatShadowKing",
      afterDialogue: ["Golge tacın icine cekildi. Yeraltı Krallığı seni kabul etti."]
    };
    game.dialogue.show("Taht Yaziti", ["Tahtin altindan siyah bir Prime isigi cikiyor.", "Kralin Golgesi uyandi."], function () {
      game.battle.startTrainer(trainer, [L.Creatures.create("obsigoz", 32), L.Creatures.create("tahtkor", 35)]);
    });
    return true;
  }

  function canUseExit(game, exit) {
    if (!game || !exit || !game.state) return { ok: true };
    var state = game.state;
    ensureState(state);
    if (exit.to === "primeOcagi" && !questCompleted(state, "krallikHaritasi") && !(state.inventory.biyomPusulasi > 0)) {
      return { ok: false, title: "Kiltili Ocak Yolu", message: "Prime Ocagi yolu icin once Kraliyet Haritasi'ni tamamla ya da Biyom Pusulasi bul." };
    }
    if (exit.to === "tahtSalonu" && !state.defeatedTrainers.trainer_prime_muhafiz) {
      return { ok: false, title: "Taht Kapisi", message: "Taht Salonu kapisi Prime Muhafizi yenilmeden acilmiyor." };
    }
    if (game.map && game.map.id === "defineMahzeni" && exit.to === "tahtSalonu" && !(state.inventory.kemikAnahtar > 0)) {
      return { ok: false, title: "Kemik Kilidi", message: "Mahzenden Taht Salonu'na gecmek icin Kemik Anahtar gerekiyor." };
    }
    return { ok: true };
  }

  L.Underground = {
    primeUnlockGroups: primeUnlockGroups,
    ensureState: ensureState,
    unlockSpecies: unlockSpecies,
    hasPrimeSpecies: hasPrimeSpecies,
    usePrimeStone: usePrimeStone,

    onNewGame: function (game) {
      ensureState(game.state);
      ["biyomBulmacalari", "gizliDefineOdasi", "kralinGolgesiGorevi", "primeKilidi"].forEach(function (id) {
        if (L.Quests) L.Quests.start(game.state, id, true);
      });
    },

    onLoadMap: function (game, mapId) {
      ensureState(game.state);
      applyMapMarks(game.map);
      refreshMapState(game);
      setLavaBridge(game);
      setTimeout(function () {
        if (game.state && game.map && game.map.id === mapId) showMapEvent(game, mapId);
      }, 80);
    },

    canUseExit: canUseExit,

    handleInteraction: function (game, interaction) {
      if (!interaction) return false;
      if (interaction.type === "undergroundPuzzle" && interaction.puzzle === "fungus") return handleFungusPuzzle(game, interaction);
      if (interaction.type === "secretVault") return handleSecretVault(game);
      if (interaction.type === "primeStone") {
        var result = usePrimeStone(game);
        game.dialogue.show("Prime Tas Yuvasi", [result.message]);
        if (L.Audio) L.Audio.play(result.ok ? "victory" : "error");
        return true;
      }
      if (interaction.type === "shadowBoss") return handleShadowBoss(game);
      return false;
    },

    onCollectItem: function (game, item) {
      ensureState(game.state);
      if (item.itemId === "haritaParcasi" && (game.state.inventory.haritaParcasi || 0) >= 4 && !game.state.underground.flags.mapComplete) {
        game.state.underground.flags.mapComplete = true;
        if (game.ui) game.ui.notify("Nira'nin haritasi tamamlandi. Gizli oda konumu belirdi.");
      }
      if (item.itemId === "kristalMuhur") {
        unlockSpecies(game.state, primeUnlockGroups.crystalSeal);
      }
    },

    afterBattleWin: function (game, battle) {
      if (!game || !battle || !battle.trainer) return null;
      var id = battle.trainer.id;
      var state = game.state;
      ensureState(state);
      if (id === "trainer_prime_muhafiz") {
        var a = unlockSpecies(state, primeUnlockGroups.primeWarden);
        L.Inventory.add(state, "primeTasi", 1);
        return "Prime Muhafizi dustu. " + a + " Prime kilidi acildi ve 1 Prime Tasi kazandin.";
      }
      if (id === "trainer_taht_muhafiz") {
        var b = unlockSpecies(state, primeUnlockGroups.crownGuard);
        if (L.Quests) L.Quests.start(state, "kralinGolgesiGorevi", true);
        return "Taht Muhafizi yenildi. " + b + " yeni Prime kilidi acildi; tahtin golgesi kipirdiyor.";
      }
      if (id === "trainer_kralin_golgesi") {
        var c = unlockSpecies(state, primeUnlockGroups.shadowKing);
        state.underground.shadowBossDefeated = true;
        L.Inventory.add(state, "kralinGolgesi", 1);
        L.Inventory.add(state, "primeTasi", 1);
        return "Kralin Golgesi sustu. " + c + " efsane Prime kilidi acildi.";
      }
      return null;
    },

    update: function (game, dt) {
      if (!game || !game.state || !game.map || game.mode !== "world") return;
      ensureState(game.state);
      cooldowns(game.state, dt);
      applyMapMarks(game.map);
      refreshMapState(game);
      showMapEvent(game, game.map.id);
      setLavaBridge(game);
      updateCrystalCurrent(game, dt);
      updateIceSlide(game, dt);
      updateBonePits(game);
    },

    drawOverlay: function (game, ctx) {
      if (!game || !game.map || !game.state || game.map.region !== "underground") return;
      var underground = ensureState(game.state);
      ctx.save();
      ctx.font = "8px monospace";
      ctx.fillStyle = "rgba(23,32,51,.72)";
      ctx.fillRect(8, 92, 124, 24);
      ctx.fillStyle = "#fff4d2";
      var pieces = game.state.inventory.haritaParcasi || 0;
      var relics = questObjectiveCount(game.state, "collectRoyalRelic");
      ctx.fillText("Relic " + relics + "/8  Harita " + pieces + "/4", 13, 103);
      if (game.map.id === "lavDenizi") ctx.fillText(underground.bridgeOpen ? "Kopru: acik" : "Kopru: eriyor", 13, 113);
      else ctx.fillText("Biyom: " + (game.map.biome || "yeraltı"), 13, 113);
      ctx.restore();
    }
  };
})();
