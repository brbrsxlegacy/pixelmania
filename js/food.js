(function () {
  var L = window.LUMA = window.LUMA || {};
  var ingredients = ["isikMeyvesi", "ormanMantari", "altinTahil"];
  var recipes = [
    { id: "ekmek", itemId: "koyEkmegi", cost: { altinTahil: 2 } },
    { id: "corba", itemId: "lumaCorbasi", cost: { ormanMantari: 2, isikMeyvesi: 1 } },
    { id: "piknik", itemId: "piknikTabagi", cost: { isikMeyvesi: 2, ormanMantari: 1, koyEkmegi: 1 } }
  ];
  var colors = { isikMeyvesi: "#b983e8", ormanMantari: "#ee9c69", altinTahil: "#f2ca66", koyEkmegi: "#dfa15b", lumaCorbasi: "#90cdb1", piknikTabagi: "#f4bc72" };

  function ensure(state) {
    state.food = Object.assign({ collected: {}, gathered: 0, cooked: 0, fed: 0, rewardClaimed: false, lastFed: {} }, state.food || {});
    state.food.collected = Object.assign({}, state.food.collected || {});
    state.food.lastFed = Object.assign({}, state.food.lastFed || {});
    return state.food;
  }

  function key(creature) { return creature.uid || creature.id; }
  function item(id) { return L.Inventory.get(id); }
  function name(creature) { return creature.displayName || creature.name || "Luma"; }
  function finish(game) {
    game.autosaveSoon();
    if (L.Audio) L.Audio.play("pickup");
  }

  function nodes(map) {
    if (map.foodNodes) return map.foodNodes;
    map.foodNodes = [];
    if (map.w < 30 || map.aiPiece || /arena|boss|dungeon|magara|maden|interior/i.test(map.id)) return map.foodNodes;
    var candidates = map.id === "isikpinar" ? [[23, 32], [29, 25], [31, 32], [19, 24], [40, 22]] : [];
    if (!candidates.length) {
      for (var y = 5; y < map.h - 4; y += 3) {
        for (var x = 5; x < map.w - 4; x += 3) candidates.push([x, y]);
      }
      candidates.sort(function (a, b) {
        return ((a[0] * 37 + a[1] * 61) % 101) - ((b[0] * 37 + b[1] * 61) % 101);
      });
    }
    var npcs = window.LUMA_DATA.npcs[map.id] || [];
    candidates.forEach(function (p) {
      if (map.foodNodes.length >= 5) return;
      var x = p[0], y = p[1];
      if (map.collision[y * map.w + x] || map.decoration[y * map.w + x]) return;
      if (map.interactions.some(function (it) { return Math.abs(it.x - x) < 3 && Math.abs(it.y - y) < 3; })) return;
      if (npcs.some(function (npc) { return Math.abs(npc.x - x) < 2 && Math.abs(npc.y - y) < 2; })) return;
      if (map.exits.some(function (e) { return x >= e.x - 2 && x <= e.x + e.w + 2 && y >= e.y - 2 && y <= e.y + e.h + 2; })) return;
      if (map.foodNodes.some(function (n) { return Math.hypot(n.x - x, n.y - y) < 5; })) return;
      var open = [[0, 1], [0, -1], [1, 0], [-1, 0]].some(function (v) { return !map.collision[(y + v[1]) * map.w + x + v[0]]; });
      if (!open) return;
      var index = map.foodNodes.length;
      map.foodNodes.push({ id: map.id + ":food:" + x + ":" + y, x: x, y: y, itemId: ingredients[index % 3] });
    });
    return map.foodNodes;
  }

  function remaining(state, node) {
    var collected = ensure(state).collected[node.id];
    return collected == null ? 0 : Math.max(0, 120 - ((state.playTime || 0) - collected));
  }
  function nearest(game) {
    var tx = (game.player.x + 8) / 16;
    var ty = (game.player.y + 16) / 16;
    var near = nodes(game.map).filter(function (n) { return Math.hypot(n.x + .5 - tx, n.y + .5 - ty) <= 1.6; });
    near.sort(function (a, b) {
      return Math.hypot(a.x + .5 - tx, a.y + .5 - ty) - Math.hypot(b.x + .5 - tx, b.y + .5 - ty);
    });
    return near[0] || null;
  }
  function gather(game, node) {
    if (!node || nodes(game.map).indexOf(node) < 0 || nearest(game) !== node) return { ok: false, message: "Bitkiye biraz daha yaklaş." };
    var wait = remaining(game.state, node);
    if (wait > 0) return { ok: false, message: "Bu bitki " + Math.ceil(wait) + " saniye keşiften sonra yeniden büyür." };
    var food = ensure(game.state);
    food.collected[node.id] = game.state.playTime || 0;
    food.gathered += 1;
    L.Inventory.add(game.state, node.itemId, 2);
    finish(game);
    return { ok: true, message: "+2 " + item(node.itemId).name + "! F / Mutfak ile yemek hazırla." };
  }
  function canCook(state, recipe) {
    return Object.keys(recipe.cost).every(function (id) { return L.Inventory.has(state, id, recipe.cost[id]); });
  }
  function cook(game, recipeId) {
    if (game.mode !== "panel" || game.ui.panel.dataset.context !== "food") return { ok: false, message: "Önce mutfağı aç." };
    var recipe = recipes.filter(function (r) { return r.id === recipeId; })[0];
    if (!recipe) return { ok: false, message: "Tarif bulunamadı." };
    if (!canCook(game.state, recipe)) return { ok: false, message: "Bu tarif için malzeme eksik." };
    Object.keys(recipe.cost).forEach(function (id) { L.Inventory.remove(game.state, id, recipe.cost[id]); });
    L.Inventory.add(game.state, recipe.itemId, 1);
    ensure(game.state).cooked += 1;
    finish(game);
    return { ok: true, message: item(recipe.itemId).name + " hazır! Çantana eklendi." };
  }

  function mood(state, creature) {
    L.Progression.moodFor(state, creature);
    return state.lumaMood.values[key(creature)];
  }
  function feed(game, id, index) {
    var state = game.state;
    if (game.mode !== "panel" || game.ui.panel.dataset.context !== "food") return { ok: false, message: "Yemekleri savaş dışında Mutfak'tan kullan." };
    var creature = state.team[index];
    var foodItem = item(id);
    if (!creature) return { ok: false, message: "Önce bir Luma yoldaşı seç." };
    if (!foodItem || !foodItem.food || !L.Inventory.has(state, id)) return { ok: false, message: "Bu yiyecek çantanda yok." };
    var food = ensure(state);
    var last = food.lastFed[key(creature)];
    if (last != null && (state.playTime || 0) - last < 15) return { ok: false, message: "Luma yemeğini bitiriyor. 15 saniye keşiften sonra tekrar besleyebilirsin." };
    var data = mood(state, creature);
    var friend = L.Progression.friendship(state, creature);
    if (creature.hp >= creature.maxHp && data.hunger < 5 && data.energy >= 95 && friend >= 100 && !creature.status) return { ok: false, message: name(creature) + " tok ve iyi durumda; yiyeceğini sakla." };
    var before = creature.hp;
    var effect = foodItem.food;
    creature.hp = Math.min(creature.maxHp, creature.hp + effect.heal);
    if (effect.cure) creature.status = null;
    data.hunger = Math.max(0, data.hunger - effect.hunger);
    data.energy = Math.min(100, data.energy + effect.energy);
    data.excitement = Math.min(100, data.excitement + 8);
    var gain = L.Progression.addFriendship(game, creature, effect.friendship);
    L.Inventory.remove(state, id, 1);
    food.fed += 1;
    food.lastFed[key(creature)] = state.playTime || 0;
    finish(game);
    return { ok: true, message: name(creature) + " beslendi: +" + (creature.hp - before) + " can, +" + gain + " dostluk." };
  }
  function claim(game) {
    var food = ensure(game.state);
    if (food.rewardClaimed || food.gathered < 3 || food.cooked < 2 || food.fed < 1) return { ok: false, message: "Piknik görevini önce tamamla." };
    food.rewardClaimed = true;
    game.state.money += 150;
    L.Inventory.add(game.state, "piknikTabagi", 1);
    finish(game);
    return { ok: true, message: "İlk Piknik tamamlandı! +150 Luma ve 1 Piknik Tabağı." };
  }

  // Pixel art stays in code: no downloaded image sheet or WebGL dependency.
  function drawNode(ctx, node, game) {
    var x = Math.round(node.x * 16 - game.camera.x);
    var y = Math.round(node.y * 16 - game.camera.y);
    var ready = remaining(game.state, node) <= 0;
    ctx.save();
    ctx.fillStyle = "rgba(13,30,24,.2)"; ctx.fillRect(x + 1, y + 14, 15, 3);
    ctx.fillStyle = "#36684c"; ctx.fillRect(x + 6, y + 6, 3, 9);
    ctx.fillStyle = "#64a967"; ctx.fillRect(x + 1, y + 8, 6, 4); ctx.fillRect(x + 9, y + 5, 5, 4);
    if (ready) {
      ctx.fillStyle = colors[node.itemId];
      if (node.itemId === "altinTahil") {
        ctx.fillRect(x + 4, y + 2, 3, 8); ctx.fillRect(x + 10, y, 3, 9); ctx.fillRect(x + 7, y + 1, 2, 12);
      } else if (node.itemId === "ormanMantari") {
        ctx.fillStyle = "#ffe6c5"; ctx.fillRect(x + 7, y + 7, 4, 7);
        ctx.fillStyle = colors[node.itemId]; ctx.fillRect(x + 3, y + 4, 12, 5); ctx.fillRect(x + 5, y + 2, 8, 4);
        ctx.fillStyle = "#fff4d2"; ctx.fillRect(x + 5, y + 4, 2, 2); ctx.fillRect(x + 11, y + 6, 2, 2);
      } else {
        ctx.fillRect(x + 2, y + 6, 4, 4); ctx.fillRect(x + 10, y + 3, 4, 4); ctx.fillRect(x + 7, y + 9, 4, 4);
        ctx.fillStyle = "#f0d5ff"; ctx.fillRect(x + 3, y + 6, 1, 1); ctx.fillRect(x + 11, y + 3, 1, 1);
      }
    }
    ctx.restore();
  }
  function drawHint(ctx, game) {
    if (game.mode !== "world") return;
    var node = nearest(game);
    if (!node) return;
    var ready = remaining(game.state, node) <= 0;
    var label = ready ? "E / Etkileş: " + item(node.itemId).name : "Yeniden büyüyor…";
    var w = Math.min(game.canvas.width - 16, label.length * 5 + 12);
    var x = Math.max(8, Math.min(game.canvas.width - w - 8, node.x * 16 - game.camera.x - w / 2));
    var y = Math.max(55, node.y * 16 - game.camera.y - 24);
    ctx.fillStyle = "#172b27"; ctx.fillRect(x, y, w, 19);
    ctx.fillStyle = "#fff4d2"; ctx.font = "9px monospace"; ctx.fillText(label, x + 6, y + 13);
  }
  function icon(id) {
    var path = id === "isikMeyvesi" ? '<path fill="#75a967" d="M14 3h8v5h-8zM9 8h6v5H9z"/><path d="M4 13h11v11H4zM17 10h11v12H17zM11 23h11v7H11z"/>' :
      id === "ormanMantari" ? '<path fill="#ffe6c5" d="M13 16h7v14h-7z"/><path d="M4 10h25v10H4zM8 5h17v5H8z"/><path fill="#fff4d2" d="M8 12h4v4H8zM21 14h4v4h-4z"/>' :
      id === "altinTahil" ? '<path d="M15 4h3v26h-3zM6 7h7v5H6zM20 4h7v5h-7zM6 15h7v5H6zM20 13h7v5h-7z"/>' :
      id === "koyEkmegi" ? '<path d="M3 11h27v16H3zM7 5h19v6H7z"/><path fill="#ffdc97" d="M9 9h3v9H9zM17 9h3v9h-3z"/>' :
      id === "lumaCorbasi" ? '<path d="M3 13h27v9H3zM7 22h19v6H7z"/><path fill="#e8b572" d="M6 13h21v4H6z"/><path fill="#fff4d2" d="M10 3h3v7h-3zM20 5h3v5h-3z"/>' :
      '<path fill="#fff4d2" d="M2 7h28v23H2z"/><path d="M5 10h11v8H5z"/><path fill="#8cc787" d="M19 10h8v8h-8z"/><path fill="#b983e8" d="M6 21h7v6H6z"/><path fill="#dfa15b" d="M17 21h10v6H17z"/>';
    return '<svg class="food-icon" viewBox="0 0 32 32" aria-hidden="true" fill="' + colors[id] + '" shape-rendering="crispEdges">' + path + '</svg>';
  }

  L.Food = { ensure: ensure, nodes: nodes, nearest: nearest, remaining: remaining, gather: gather, recipes: recipes, canCook: canCook, cook: cook, feed: feed, claim: claim, mood: mood, drawNode: drawNode, drawHint: drawHint, icon: icon };
})();
