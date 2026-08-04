(function () {
  var L = window.LUMA = window.LUMA || {};
  if (!L.Battle) return;

  var CANVAS_W = 960;
  var CANVAS_H = 540;
  var FIELD_H = 392;

  var biomeAssets = {
    meadow: "assets/battle/biomes/meadow-village.png",
    lake: "assets/battle/biomes/crystal-lake.png",
    cave: "assets/battle/biomes/old-stone-cave.png",
    city: "assets/battle/biomes/luma-city-plaza.png",
    harbor: "assets/battle/biomes/harbor-coast.png",
    factory: "assets/battle/biomes/factory-district.png",
    ruin: "assets/battle/biomes/ancient-ruins.png",
    snow: "assets/battle/biomes/snow-ridge.png",
    lava: "assets/battle/biomes/lava-canyon.png",
    shadow: "assets/battle/biomes/shadow-forest.png",
    garden: "assets/battle/biomes/botanical-garden.png",
    sky: "assets/battle/biomes/sky-tower.png"
  };

  var biomeImages = {};
  Object.keys(biomeAssets).forEach(function (key) {
    var image = new Image();
    biomeImages[key] = { image: image, ready: false };
    image.onload = function () { biomeImages[key].ready = true; };
    image.onerror = function () { biomeImages[key].ready = false; };
    image.src = biomeAssets[key];
  });

  var elementMeta = {
    "Yaprak": { key: "leaf", label: "YAPRAK", glyph: "leaf", color: "#75d95f", dark: "#244b32" },
    "Alev": { key: "fire", label: "ATEŞ", glyph: "fire", color: "#f06b34", dark: "#5c261f" },
    "Su": { key: "water", label: "SU", glyph: "water", color: "#4aa8d8", dark: "#173d5b" },
    "Kaya": { key: "stone", label: "KAYA", glyph: "stone", color: "#b4a58d", dark: "#40382f" },
    "Rüzgar": { key: "wind", label: "RÜZGAR", glyph: "wind", color: "#9de8e6", dark: "#24505a" },
    "RÃ¼zgar": { key: "wind", label: "RÜZGAR", glyph: "wind", color: "#9de8e6", dark: "#24505a" },
    "Elektrik": { key: "electric", label: "ELEKTRİK", glyph: "bolt", color: "#f2d54a", dark: "#574214" },
    "Gölge": { key: "shadow", label: "GÖLGE", glyph: "shadow", color: "#9a7adf", dark: "#24213f" },
    "GÃ¶lge": { key: "shadow", label: "GÖLGE", glyph: "shadow", color: "#9a7adf", dark: "#24213f" },
    "Işık": { key: "light", label: "IŞIK", glyph: "light", color: "#fff0a0", dark: "#5b4d1b" },
    "IÅŸÄ±k": { key: "light", label: "IŞIK", glyph: "light", color: "#fff0a0", dark: "#5b4d1b" },
    "Normal": { key: "normal", label: "NORMAL", glyph: "slash", color: "#d7d1c0", dark: "#3f4248" }
  };

  function metaFor(element) {
    return elementMeta[element] || elementMeta.Normal;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r || 8, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function fillRound(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
  }

  function strokeRound(ctx, x, y, w, h, r, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2;
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();
  }

  function drawFallbackBackdrop(ctx, biome, time) {
    var palettes = {
      meadow: ["#68cde9", "#bdefff", "#75c965", "#4d9d4f"],
      lake: ["#7ad9f4", "#d9fbff", "#3f9fd3", "#2c74a5"],
      cave: ["#202737", "#465060", "#3b4451", "#242a36"],
      city: ["#79d4ee", "#dff7ff", "#b9c7ca", "#6d7f88"],
      harbor: ["#66c9ea", "#e9f8ff", "#3d95ca", "#8a5a36"],
      factory: ["#697685", "#a5b0ba", "#4b5360", "#2a303a"],
      ruin: ["#7ed0ee", "#e9f8ff", "#918573", "#5e6d55"],
      snow: ["#b8e9ff", "#ffffff", "#dbeaff", "#7ba2c7"],
      lava: ["#4b2026", "#d86b3c", "#5c2420", "#26131a"],
      shadow: ["#201a3a", "#46366e", "#2d244c", "#111827"],
      garden: ["#7adbea", "#e8fbff", "#6fc666", "#d57bb0"],
      sky: ["#8fe6ff", "#ffffff", "#bfc9d8", "#f2d54a"]
    };
    var p = palettes[biome] || palettes.meadow;
    rect(ctx, 0, 0, CANVAS_W, FIELD_H, p[0]);
    rect(ctx, 0, 76, CANVAS_W, 36, p[1]);
    for (var m = 0; m < 7; m += 1) {
      ctx.fillStyle = m % 2 ? "rgba(60, 99, 127, .42)" : "rgba(42, 84, 112, .34)";
      ctx.beginPath();
      ctx.moveTo(m * 160 - 40, 200);
      ctx.lineTo(m * 160 + 80, 76 + (m % 3) * 24);
      ctx.lineTo(m * 160 + 190, 200);
      ctx.closePath();
      ctx.fill();
    }
    rect(ctx, 0, 210, CANVAS_W, 190, p[2]);
    for (var g = 0; g < 60; g += 1) {
      rect(ctx, (g * 53 + Math.floor(time * 8)) % 1000 - 20, 258 + (g % 5) * 25, 16, 4, p[3]);
    }
  }

  function drawAiBackdrop(ctx, biome, time) {
    var entry = biomeImages[biome] || biomeImages.meadow;
    if (entry && entry.ready) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(entry.image, 0, 0, CANVAS_W, FIELD_H);
      ctx.restore();
      rect(ctx, 0, FIELD_H - 24, CANVAS_W, 24, "rgba(10, 17, 28, .18)");
    } else {
      drawFallbackBackdrop(ctx, biome || "meadow", time || 0);
    }
    var grd = ctx.createLinearGradient(0, 0, 0, FIELD_H);
    grd.addColorStop(0, "rgba(255,255,255,.05)");
    grd.addColorStop(.55, "rgba(255,255,255,0)");
    grd.addColorStop(1, "rgba(8, 13, 24, .28)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, CANVAS_W, FIELD_H);
  }

  function drawPlatform(ctx, x, y, w, h, color, rim) {
    ctx.save();
    ctx.fillStyle = "rgba(7, 12, 20, .33)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + 5, y + h / 2 + 11, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rim;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.globalAlpha = .3;
    ctx.fillStyle = "#fff4d2";
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 18, y + h / 2 - 10, w / 3, h / 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function resolveBattleBiome(map, enemy, trainer) {
    var id = String(map && map.id || "").toLowerCase();
    var name = String(map && map.name || "").toLowerCase();
    var hay = id + " " + name;
    if (/lav|ember|alev|volkan|canyon/.test(hay)) return "lava";
    if (/snow|buz|kutup|kar|ice/.test(hay)) return "snow";
    if (/g[öo]lge|gece|sis|batak|shadow|batik/.test(hay)) return "shadow";
    if (/magara|mağara|cave|kristalmaden|derin|stone/.test(hay)) return "cave";
    if (/kristal|g[öo]l|lake/.test(hay)) return "lake";
    if (/liman|sahil|harbor|coast|deniz/.test(hay)) return "harbor";
    if (/sanayi|factory|tren|station|istasyon/.test(hay)) return "factory";
    if (/harabe|ruin|antika|mahzen/.test(hay)) return "ruin";
    if (/g[öo]k|sky|meteor|kule/.test(hay)) return "sky";
    if (/botanik|bahce|bahçe|rengarenk/.test(hay)) return "garden";
    if (/şehir|sehir|luma|pazar|belediye|akademi|arena|city/.test(hay)) return "city";
    if (trainer && (trainer.boss || trainer.storyBossId || trainer.giant)) {
      return elementBiome(enemy && enemy.element);
    }
    return elementBiome(enemy && enemy.element) || "meadow";
  }

  function elementBiome(element) {
    var key = metaFor(element).key;
    if (key === "fire") return "lava";
    if (key === "water") return "lake";
    if (key === "stone") return "cave";
    if (key === "shadow") return "shadow";
    if (key === "wind") return "sky";
    if (key === "light") return "city";
    if (key === "leaf") return "garden";
    return "meadow";
  }

  function drawMoveIcon(ctx, move) {
    var meta = metaFor(move && move.element);
    ctx.clearRect(0, 0, 64, 64);
    fillRound(ctx, 3, 3, 58, 58, 9, "#111a24");
    strokeRound(ctx, 4, 4, 56, 56, 9, meta.color, 3);
    rect(ctx, 10, 48, 44, 3, "rgba(255,255,255,.12)");
    ctx.save();
    ctx.translate(32, 31);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = meta.color;
    ctx.fillStyle = meta.color;
    var anim = move && move.animation || meta.glyph;
    if (anim === "guard" || anim === "veil" || anim === "boost") {
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(18, -10);
      ctx.lineTo(14, 14);
      ctx.lineTo(0, 22);
      ctx.lineTo(-14, 14);
      ctx.lineTo(-18, -10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.38)";
      ctx.fillRect(-6, -10, 12, 22);
    } else if (meta.key === "leaf") {
      ctx.rotate(-.45);
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e3ffd0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
      ctx.stroke();
    } else if (meta.key === "fire") {
      ctx.fillStyle = "#f06b34";
      ctx.beginPath();
      ctx.moveTo(-11, 19);
      ctx.quadraticCurveTo(-24, 2, -6, -7);
      ctx.quadraticCurveTo(-2, -23, 10, -27);
      ctx.quadraticCurveTo(7, -10, 20, -4);
      ctx.quadraticCurveTo(24, 10, 8, 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffe07a";
      ctx.fillRect(-2, -2, 10, 20);
    } else if (meta.key === "water") {
      ctx.fillStyle = "#4aa8d8";
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.quadraticCurveTo(20, 0, 12, 15);
      ctx.quadraticCurveTo(0, 29, -13, 15);
      ctx.quadraticCurveTo(-20, 0, 0, -24);
      ctx.fill();
      ctx.strokeStyle = "#dff8ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-4, 5, 13, -1, 1.3);
      ctx.stroke();
    } else if (meta.key === "stone") {
      ctx.fillStyle = "#9c927e";
      ctx.beginPath();
      ctx.moveTo(-18, -3);
      ctx.lineTo(-4, -20);
      ctx.lineTo(18, -12);
      ctx.lineTo(20, 12);
      ctx.lineTo(0, 23);
      ctx.lineTo(-20, 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.22)";
      ctx.fillRect(-5, -13, 12, 6);
    } else if (meta.key === "wind") {
      ctx.strokeStyle = "#9de8e6";
      for (var w = 0; w < 3; w += 1) {
        ctx.beginPath();
        ctx.arc(-4 + w * 3, 3, 13 + w * 6, Math.PI * .15, Math.PI * 1.45);
        ctx.stroke();
      }
    } else if (meta.key === "electric") {
      ctx.fillStyle = "#f2d54a";
      ctx.beginPath();
      ctx.moveTo(6, -27);
      ctx.lineTo(-13, 2);
      ctx.lineTo(0, 2);
      ctx.lineTo(-7, 27);
      ctx.lineTo(19, -7);
      ctx.lineTo(4, -7);
      ctx.closePath();
      ctx.fill();
    } else if (meta.key === "shadow") {
      ctx.fillStyle = "#8d6de0";
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 16, .2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#151727";
      ctx.beginPath();
      ctx.arc(7, -3, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (meta.key === "light") {
      ctx.strokeStyle = "#fff0a0";
      ctx.lineWidth = 4;
      for (var s = 0; s < 8; s += 1) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(0, -25);
        ctx.stroke();
      }
      ctx.fillStyle = "#fff4d2";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = "#d7d1c0";
      ctx.beginPath();
      ctx.moveTo(-22, 17);
      ctx.lineTo(22, -17);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, 22);
      ctx.lineTo(18, 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawItemIcon(ctx, item) {
    item = item || {};
    ctx.clearRect(0, 0, 64, 64);
    fillRound(ctx, 3, 3, 58, 58, 9, "#101a23");
    strokeRound(ctx, 4, 4, 56, 56, 9, "#5d6a78", 2);
    var id = item.id || "";
    if (item.category === "Yakalama" || /Kuresi|KÃ¼resi/.test(item.name || "")) {
      ctx.fillStyle = id.indexOf("kristal") >= 0 ? "#9b70d9" : (id.indexOf("guclu") >= 0 ? "#2d79b8" : "#d7d1c0");
      ctx.beginPath();
      ctx.arc(32, 32, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#172033";
      ctx.fillRect(12, 30, 40, 5);
      ctx.fillStyle = "#fff4d2";
      ctx.beginPath();
      ctx.arc(32, 32, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#172033";
      ctx.lineWidth = 3;
      ctx.stroke();
      if (id.indexOf("kristal") >= 0) {
        ctx.strokeStyle = "#fff0a0";
        ctx.beginPath(); ctx.moveTo(32, 13); ctx.lineTo(42, 32); ctx.lineTo(32, 51); ctx.lineTo(22, 32); ctx.closePath(); ctx.stroke();
      }
    } else if (item.effect && (item.effect.heal || item.effect.fullHeal || item.effect.cure)) {
      var liquid = item.effect.fullHeal ? "#e46d45" : (item.effect.heal && item.effect.heal > 30 ? "#4aa8d8" : "#54b86b");
      ctx.fillStyle = "#d7d1c0";
      ctx.fillRect(25, 11, 14, 9);
      ctx.fillStyle = "#6d4029";
      ctx.fillRect(23, 8, 18, 5);
      ctx.fillStyle = "#dbe8e8";
      ctx.beginPath(); ctx.moveTo(18, 22); ctx.lineTo(46, 22); ctx.lineTo(51, 50); ctx.lineTo(13, 50); ctx.closePath(); ctx.fill();
      ctx.fillStyle = liquid;
      ctx.fillRect(18, 34, 28, 13);
      if (item.effect.cure) {
        ctx.fillStyle = "#fff4d2";
        ctx.fillRect(29, 34, 6, 14);
        ctx.fillRect(25, 38, 14, 6);
      }
    } else if (/anahtar|key/i.test(item.name || id)) {
      ctx.strokeStyle = "#f2d54a";
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(24, 27, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(33, 35); ctx.lineTo(50, 52); ctx.moveTo(43, 45); ctx.lineTo(50, 39); ctx.stroke();
    } else if (/fener|lantern/i.test(item.name || id)) {
      ctx.fillStyle = "#5c3b28";
      ctx.fillRect(22, 18, 20, 31);
      ctx.fillStyle = "#f2b94b";
      ctx.fillRect(25, 25, 14, 18);
      ctx.strokeStyle = "#d7d1c0";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(32, 18, 12, Math.PI, Math.PI * 2); ctx.stroke();
    } else if (/kristal|crystal/i.test(item.name || id)) {
      ctx.fillStyle = "#93d4e8";
      ctx.beginPath(); ctx.moveTo(32, 8); ctx.lineTo(48, 29); ctx.lineTo(38, 54); ctx.lineTo(20, 54); ctx.lineTo(15, 29); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff4d2";
      ctx.fillRect(29, 16, 7, 26);
    } else {
      ctx.fillStyle = "#8a8f91";
      ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#9de8e6";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(32, 32, 12, .3, Math.PI * 1.65); ctx.stroke();
    }
  }

  function drawCreaturePortrait(canvas, creature) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var meta = metaFor(creature && creature.element);
    fillRound(ctx, 2, 2, canvas.width - 4, canvas.height - 4, 10, "#111a24");
    strokeRound(ctx, 3, 3, canvas.width - 6, canvas.height - 6, 10, meta.color, creature && creature.hp > 0 ? 3 : 1);
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2 - 6, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = meta.dark;
    ctx.fillRect(6, 6, canvas.width - 12, canvas.height - 12);
    if (creature) L.Asset.drawCreature(ctx, creature, canvas.width / 2 - 20, canvas.height / 2 - 18, 1.55, false, Date.now() / 1000);
    ctx.restore();
    if (creature && creature.hp <= 0) {
      ctx.fillStyle = "rgba(7,10,18,.62)";
      ctx.fillRect(5, 5, canvas.width - 10, canvas.height - 10);
    }
  }

  function renderMoveCard(move, index) {
    var meta = metaFor(move.element);
    var power = move.power > 0 ? move.power : "-";
    var accuracy = move.accuracy ? move.accuracy + "%" : "-";
    return "<button class='battle-card move-card element-" + meta.key + "' data-move='" + index + "' style='--accent:" + meta.color + "'>" +
      "<canvas class='battle-card-icon' width='64' height='64' data-move-icon='" + escapeHtml(move.id) + "'></canvas>" +
      "<strong>" + escapeHtml(move.name) + "</strong>" +
      "<span class='element-badge'>" + meta.label + "</span>" +
      "<small>Güç <b>" + power + "</b></small>" +
      "<small>İsabet <b>" + accuracy + "</b></small>" +
      "<span class='pp-line'>PP <b>" + move.ppLeft + "/" + move.pp + "</b></span>" +
      "</button>";
  }

  function renderCommandButton(action, label, icon, cls) {
    return "<button class='battle-command " + cls + "' data-battle-action='" + action + "'>" +
      "<span class='battle-command-icon'>" + icon + "</span><strong>" + label + "</strong></button>";
  }

  function renderActions(includeBack) {
    var html = "<div class='battle-command-grid'>" +
      renderCommandButton("attack", "Savaş", "⚔", "fight") +
      renderCommandButton("attack", "Yetenek", "✦", "skills") +
      renderCommandButton("bag", "Çanta", "▣", "items") +
      renderCommandButton("team", "Değiş", "⇄", "switch") +
      "</div>";
    html += "<div class='battle-dpad' aria-hidden='true'><span></span><i></i><b></b><em></em></div>";
    if (includeBack) html += "<button class='battle-back' data-battle-action='back'>Geri</button>";
    return html;
  }

  function menuMessageForMove(creature) {
    var first = creature && creature.abilities && creature.abilities[0];
    if (!first) return "Ne yapacaksın?";
    return first.name + ": " + (first.description || "Hamleni seç.");
  }

  function ensureModernChrome(battle) {
    if (battle.modernChromeReady) return;
    battle.modernChromeReady = true;
    battle.screen.classList.add("battle-modern");

    var badge = document.createElement("div");
    badge.className = "battle-turn-badge";
    badge.innerHTML = "<span>TUR</span><strong>01</strong>";
    battle.screen.appendChild(badge);
    battle.turnBadge = badge;

    var party = document.createElement("div");
    party.className = "battle-party-strip";
    party.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-party-switch]");
      if (!button || !battle.active || battle.busy) return;
      battle.switchCreature(Number(button.getAttribute("data-party-switch")));
    });
    battle.screen.appendChild(party);
    battle.partyStrip = party;

    var burger = document.createElement("button");
    burger.className = "battle-burger";
    burger.type = "button";
    burger.setAttribute("aria-label", "Menü");
    burger.innerHTML = "<span></span><span></span><span></span>";
    burger.addEventListener("click", function () { battle.renderMainMenu(); });
    battle.screen.appendChild(burger);
  }

  function syncModernChrome(battle) {
    ensureModernChrome(battle);
    battle.screen.dataset.biome = battle.currentBiome || "meadow";
    if (battle.turnBadge) {
      var turn = String(Math.max(1, battle.turnNumber || 1));
      if (turn.length < 2) turn = "0" + turn;
      battle.turnBadge.querySelector("strong").textContent = turn;
    }
    var player = battle.playerCreature && battle.playerCreature();
    var enemy = battle.enemy;
    var enemyBox = battle.screen.querySelector(".combatant.enemy");
    var playerBox = battle.screen.querySelector(".combatant.player");
    if (enemyBox && enemy) {
      enemyBox.style.setProperty("--accent", metaFor(enemy.element).color);
      enemyBox.dataset.element = metaFor(enemy.element).label;
    }
    if (playerBox && player) {
      playerBox.style.setProperty("--accent", metaFor(player.element).color);
      playerBox.dataset.element = metaFor(player.element).label;
    }
    updatePartyStrip(battle);
  }

  function updatePartyStrip(battle) {
    if (!battle.partyStrip) return;
    var team = battle.game && battle.game.state && battle.game.state.team || [];
    var html = team.map(function (creature, index) {
      var active = index === battle.game.state.activeIndex ? " active" : "";
      var disabled = !creature || creature.hp <= 0 ? " disabled" : "";
      return "<button class='party-token" + active + disabled + "' data-party-switch='" + index + "'" + (disabled ? " disabled" : "") + ">" +
        "<canvas width='58' height='58' data-party-art='" + index + "'></canvas></button>";
    }).join("");
    battle.partyStrip.innerHTML = html;
    battle.partyStrip.querySelectorAll("canvas[data-party-art]").forEach(function (canvas) {
      drawCreaturePortrait(canvas, team[Number(canvas.getAttribute("data-party-art"))]);
    });
  }

  function drawMenuCanvases(battle) {
    var player = battle.playerCreature && battle.playerCreature();
    var moves = player && player.abilities || [];
    battle.menu.querySelectorAll("canvas[data-move-icon]").forEach(function (canvas) {
      var id = canvas.getAttribute("data-move-icon");
      var move = moves.filter(function (entry) { return entry.id === id; })[0] || (window.LUMA_DATA.abilities && window.LUMA_DATA.abilities[id]);
      drawMoveIcon(canvas.getContext("2d"), move);
    });
    battle.menu.querySelectorAll("canvas[data-item-icon]").forEach(function (canvas) {
      var item = L.Inventory && L.Inventory.get(canvas.getAttribute("data-item-icon"));
      drawItemIcon(canvas.getContext("2d"), item);
    });
    battle.menu.querySelectorAll("canvas[data-switch-art]").forEach(function (canvas) {
      var creature = battle.game.state.team[Number(canvas.getAttribute("data-switch-art"))];
      drawCreaturePortrait(canvas, creature);
    });
  }

  var originalStartCommon = L.Battle.prototype.startCommon;
  L.Battle.prototype.startCommon = function (message) {
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.ctx.imageSmoothingEnabled = false;
    this.currentBiome = resolveBattleBiome(this.game && this.game.map, this.enemy, this.trainer);
    this.turnNumber = 1;
    ensureModernChrome(this);
    return originalStartCommon.call(this, message);
  };

  L.Battle.prototype.renderMainMenu = function () {
    var creature = this.playerCreature();
    var moves = creature && creature.abilities || [];
    this.menu.className = "battle-menu battle-main-grid";
    this.menu.innerHTML = "<div class='battle-move-grid'>" + moves.map(renderMoveCard).join("") + "</div>" + renderActions(false);
    this.setMessage(menuMessageForMove(creature));
    syncModernChrome(this);
    drawMenuCanvases(this);
  };

  L.Battle.prototype.renderMoves = function () {
    var creature = this.playerCreature();
    var moves = creature && creature.abilities || [];
    this.menu.className = "battle-menu battle-main-grid battle-focus-moves";
    this.menu.innerHTML = "<div class='battle-move-grid'>" + moves.map(renderMoveCard).join("") + "</div>" + renderActions(true);
    this.setMessage("Hamleni seç.");
    syncModernChrome(this);
    drawMenuCanvases(this);
  };

  L.Battle.prototype.renderBag = function () {
    var state = this.game.state;
    var ids = Object.keys(state.inventory).filter(function (id) {
      var item = L.Inventory.get(id);
      return item && (item.category === "Yakalama" || item.category === "İyileştirme" || item.category === "Ä°yileÅŸtirme" || item.effect && item.effect.escape) && state.inventory[id] > 0;
    });
    this.menu.className = "battle-menu battle-list-grid";
    var html = ids.map(function (id) {
      var item = L.Inventory.get(id);
      return "<button class='battle-card item-card' data-item='" + id + "'>" +
        "<canvas class='battle-card-icon' width='64' height='64' data-item-icon='" + id + "'></canvas>" +
        "<strong>" + escapeHtml(item.name) + " x" + state.inventory[id] + "</strong>" +
        "<small>" + escapeHtml(item.description) + "</small>" +
        "</button>";
    }).join("");
    if (!html) html = "<button class='battle-card item-card' disabled><strong>Çantada uygun eşya yok</strong><small>Yakalama, iyileştirme veya kaçış eşyası taşı.</small></button>";
    html += "<button class='battle-card battle-back-card' data-battle-action='back'><strong>Geri</strong><small>Savaş ekranına dön.</small></button>";
    this.menu.innerHTML = html;
    this.setMessage("Çantadan kullanacağın aleti seç.");
    syncModernChrome(this);
    drawMenuCanvases(this);
  };

  L.Battle.prototype.renderTeam = function () {
    var state = this.game.state;
    this.menu.className = "battle-menu battle-list-grid team-list-grid";
    var html = state.team.map(function (c, index) {
      var disabled = c.hp <= 0 || index === state.activeIndex ? " disabled" : "";
      var meta = metaFor(c.element);
      return "<button class='battle-card team-card element-" + meta.key + "' data-switch='" + index + "' style='--accent:" + meta.color + "'" + disabled + ">" +
        "<canvas class='team-card-art' width='84' height='64' data-switch-art='" + index + "'></canvas>" +
        "<strong>" + escapeHtml(c.displayName) + "</strong>" +
        "<span class='element-badge'>" + meta.label + "</span>" +
        "<small>Sv. " + c.level + " • HP " + c.hp + "/" + c.maxHp + "</small>" +
        "</button>";
    }).join("");
    html += "<button class='battle-card battle-back-card' data-battle-action='back'><strong>Geri</strong><small>Savaş ekranına dön.</small></button>";
    this.menu.innerHTML = html;
    this.setMessage("Göndereceğin Luma'yı seç.");
    syncModernChrome(this);
    drawMenuCanvases(this);
  };

  var originalUpdateBars = L.Battle.prototype.updateBars;
  L.Battle.prototype.updateBars = function () {
    originalUpdateBars.call(this);
    syncModernChrome(this);
  };

  function wrapTurn(methodName, validator) {
    var original = L.Battle.prototype[methodName];
    L.Battle.prototype[methodName] = async function () {
      var shouldCount = validator ? validator.apply(this, arguments) : true;
      var result = await original.apply(this, arguments);
      if (shouldCount && this.active && !this.busy) {
        this.turnNumber = Math.min(99, (this.turnNumber || 1) + 1);
        syncModernChrome(this);
      }
      return result;
    };
  }

  wrapTurn("useMove", function (moveIndex) {
    var player = this.playerCreature();
    var move = player && player.abilities && player.abilities[moveIndex];
    return !this.busy && !!(move && move.ppLeft > 0);
  });

  wrapTurn("switchCreature", function (index) {
    var state = this.game.state;
    return !this.busy && !!(state.team[index] && state.team[index].hp > 0 && index !== state.activeIndex);
  });

  wrapTurn("useItem", function (itemId) {
    var state = this.game.state;
    var item = L.Inventory.get(itemId);
    return !this.busy && !!(item && state.inventory[itemId] > 0);
  });

  L.Battle.prototype.popDamage = function (target, amount) {
    var el = document.createElement("div");
    el.className = "damage-number modern-damage";
    el.textContent = "-" + amount;
    el.style.left = target === "enemy" ? "70%" : "25%";
    el.style.top = target === "enemy" ? "34%" : "56%";
    this.screen.appendChild(el);
    setTimeout(function () { el.remove(); }, 820);
  };

  L.Battle.prototype.drawBattleEffects = function (ctx, time) {
    var active = [];
    for (var e = 0; e < this.effects.length; e += 1) {
      var fx = this.effects[e];
      var p = (time - fx.start) / fx.duration;
      if (p < 0 || p > 1) continue;
      active.push(fx);
      var targetEnemy = fx.side === "player";
      var x = targetEnemy ? 684 : 266;
      var y = targetEnemy ? 214 : 332;
      var alpha = 1 - p;
      var spread = 20 + p * 76;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      var meta = metaFor(fx.element);
      ctx.strokeStyle = meta.color;
      ctx.fillStyle = meta.color;
      if (meta.key === "fire") {
        for (var f = 0; f < 9; f += 1) rect(ctx, x - 70 + f * 17, y + Math.sin(f + fx.seed) * 16 - p * 62, 12, 28, f % 2 ? "#ffd05d" : "#f06b34");
      } else if (meta.key === "water") {
        for (var s = 0; s < 8; s += 1) {
          ctx.beginPath(); ctx.arc(x - 70 + s * 22, y - 18 + p * 52, 10 + p * 10, 0, Math.PI * 2); ctx.stroke();
        }
      } else if (meta.key === "electric") {
        ctx.beginPath();
        ctx.moveTo(x - 72, y - 58); ctx.lineTo(x - 28, y - 4); ctx.lineTo(x - 50, y - 2); ctx.lineTo(x + 8, y + 62); ctx.lineTo(x - 4, y + 12); ctx.lineTo(x + 68, y + 34);
        ctx.stroke();
        ctx.strokeStyle = "#fff4d2"; ctx.lineWidth = 2; ctx.stroke();
      } else if (meta.key === "stone") {
        for (var r = 0; r < 11; r += 1) rect(ctx, x - 76 + r * 15, y - 34 + (r % 4) * 18 + p * 22, 14, 11, r % 2 ? "#c0b49b" : "#8a8f91");
      } else if (meta.key === "leaf") {
        for (var l = 0; l < 13; l += 1) rect(ctx, x - 72 + l * 13 + Math.sin(p * 7 + l) * 18, y - 42 + l % 5 * 18, 17, 7, l % 2 ? "#d4ff91" : "#54b86b");
      } else if (meta.key === "wind") {
        for (var w = 0; w < 5; w += 1) { ctx.beginPath(); ctx.arc(x, y, spread + w * 18, Math.PI * .08, Math.PI * 1.34); ctx.stroke(); }
      } else if (meta.key === "shadow") {
        ctx.fillStyle = "rgba(28, 26, 49, .72)";
        ctx.beginPath(); ctx.ellipse(x, y + 14, spread, 30 + p * 24, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#9a7adf"; ctx.stroke();
      } else if (meta.key === "light") {
        ctx.save();
        ctx.translate(x, y);
        for (var star = 0; star < 8; star += 1) {
          ctx.rotate(Math.PI / 8);
          ctx.beginPath(); ctx.moveTo(-spread, 0); ctx.lineTo(spread, 0); ctx.stroke();
        }
        ctx.restore();
      } else {
        ctx.beginPath(); ctx.moveTo(x - spread, y + spread * .42); ctx.lineTo(x + spread, y - spread * .42); ctx.stroke();
      }
      ctx.restore();
    }
    this.effects = active;
  };

  L.Battle.prototype.draw = function () {
    if (!this.active) return;
    var ctx = this.ctx;
    var t = this.game.time || 0;
    if (this.canvas.width !== CANVAS_W || this.canvas.height !== CANVAS_H) {
      this.canvas.width = CANVAS_W;
      this.canvas.height = CANVAS_H;
    }
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.imageSmoothingEnabled = false;
    drawAiBackdrop(ctx, this.currentBiome || "meadow", t);
    drawPlatform(ctx, 86, 312, 300, 82, "rgba(194, 151, 89, .82)", "rgba(255,244,210,.34)");
    drawPlatform(ctx, 564, 218, 300, 78, "rgba(198, 159, 94, .82)", "rgba(255,244,210,.32)");

    var player = this.playerCreature();
    var bossMode = !!(this.trainer && (this.trainer.boss || this.trainer.giant || this.trainer.storyBossId));
    if (player) {
      L.Asset.drawCreature(ctx, player, 132 + (this.flashSide === "player" ? 18 : 0), 252, 5.2, false, t);
    }
    if (this.enemy) {
      if (bossMode) {
        ctx.save();
        ctx.globalAlpha = .62 + Math.sin(t * 5) * .12;
        ctx.fillStyle = "rgba(242, 185, 75, .28)";
        ctx.beginPath(); ctx.ellipse(714, 222, 158, 72, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255, 244, 210, .72)"; ctx.lineWidth = 5; ctx.stroke();
        ctx.restore();
        L.Asset.drawCreature(ctx, this.enemy, 610 - (this.flashSide === "enemy" ? 22 : 0), 104, 6.15, true, t);
      } else {
        L.Asset.drawCreature(ctx, this.enemy, 624 - (this.flashSide === "enemy" ? 18 : 0), 136, 4.75, true, t);
      }
    }
    this.drawBattleEffects(ctx, t);
    rect(ctx, 0, FIELD_H - 8, CANVAS_W, 24, "rgba(8, 13, 24, .34)");
  };
})();