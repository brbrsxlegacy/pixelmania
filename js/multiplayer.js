(function () {
  var L = window.LUMA = window.LUMA || {};

  var FIREBASE = {
    apiKey: "AIzaSyABqkhpL1SMRzRJ9GQLjjZE2IryqpAvMPw",
    databaseURL: "https://pixelroom-ae218-default-rtdb.europe-west1.firebasedatabase.app"
  };

  function cleanRoomCode(code) {
    return String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  }

  function randomCode() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var code = "";
    for (var i = 0; i < 5; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    return code;
  }

  function now() {
    return Date.now();
  }

  function healthyTeamSnapshot(state) {
    return (state.team || []).filter(function (creature) {
      return creature && creature.hp > 0 && window.LUMA_DATA.creatures[creature.id];
    }).slice(0, 6).map(function (creature) {
      return {
        id: creature.id,
        level: Math.max(1, Math.min(50, Number(creature.level) || 1)),
        shiny: !!creature.shiny,
        displayName: creature.displayName || creature.name || creature.id
      };
    });
  }

  function partyFromSnapshot(snapshot) {
    return (snapshot || []).map(function (entry) {
      if (!entry || !window.LUMA_DATA.creatures[entry.id]) return null;
      var creature = L.Creatures.create(entry.id, Math.max(1, Math.min(50, Number(entry.level) || 1)), { shiny: !!entry.shiny });
      if (entry.displayName) creature.displayName = String(entry.displayName).slice(0, 28);
      return creature;
    }).filter(Boolean);
  }

  function inviteKey(invite) {
    return invite ? String(invite.id || invite.at || "") : "";
  }

  L.Multiplayer = function (game) {
    this.game = game;
    this.roomCode = null;
    this.playerId = localStorage.getItem("lumaQuest.mp.playerId") || ("p_" + Math.random().toString(36).slice(2, 10));
    this.playerName = localStorage.getItem("lumaQuest.mp.name") || "Oyuncu";
    this.remotePlayers = {};
    this.enabled = false;
    this.pushTimer = 0;
    this.pollTimer = 0;
    this.errorShown = false;
    this.handledPvpResponses = {};
    localStorage.setItem("lumaQuest.mp.playerId", this.playerId);
    this.bindUnload();
  };

  L.Multiplayer.prototype.bindUnload = function () {
    var self = this;
    window.addEventListener("beforeunload", function () {
      if (!self.roomCode) return;
      try {
        fetch(self.url("/rooms/" + self.roomCode + "/players/" + self.playerId), { method: "DELETE", keepalive: true });
      } catch (err) {}
    });
  };

  L.Multiplayer.prototype.ensureAuth = async function () {
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem("lumaQuest.mp.auth") || "null"); } catch (err) {}
    if (cached && cached.idToken && cached.expiresAt > now() + 60000) return cached.idToken;
    try {
      var response = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + encodeURIComponent(FIREBASE.apiKey), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnSecureToken: true })
      });
      if (!response.ok) return null;
      var data = await response.json();
      if (!data.idToken) return null;
      localStorage.setItem("lumaQuest.mp.auth", JSON.stringify({
        idToken: data.idToken,
        expiresAt: now() + Math.max(60, Number(data.expiresIn || 3600) - 60) * 1000
      }));
      return data.idToken;
    } catch (err) {
      return null;
    }
  };

  L.Multiplayer.prototype.url = function (path, withAuth) {
    var url = FIREBASE.databaseURL.replace(/\/$/, "") + path + ".json";
    if (withAuth === false) return url;
    if (this.idToken) url += "?auth=" + encodeURIComponent(this.idToken);
    return url;
  };

  L.Multiplayer.prototype.request = async function (method, path, body) {
    this.idToken = await this.ensureAuth();
    var options = { method: method, headers: { "Content-Type": "application/json" } };
    if (body !== undefined) options.body = JSON.stringify(body);
    var response = await fetch(this.url(path), options);
    var text = await response.text();
    var data = text ? JSON.parse(text) : null;
    if (!response.ok || data && data.error) {
      throw new Error((data && data.error) || ("Firebase " + response.status));
    }
    return data;
  };

  L.Multiplayer.prototype.payload = function () {
    var state = this.game.state || {};
    var active = state.team && state.team[state.activeIndex || 0];
    var meta = state.multiplayerMeta || {};
    var freshEmote = meta.emote && now() - (meta.emoteAt || 0) < 5500;
    var freshInvite = meta.lastInvite && now() - (meta.lastInvite.at || 0) < 30000;
    var freshResponse = meta.inviteResponse && now() - (meta.inviteResponse.at || 0) < 30000;
    var team = healthyTeamSnapshot(state);
    return {
      id: this.playerId,
      name: this.playerName || "Oyuncu",
      mapId: this.game.map ? this.game.map.id : state.mapId || "isikpinar",
      x: Math.round(this.game.player.x),
      y: Math.round(this.game.player.y),
      dir: this.game.player.dir || "down",
      mode: this.game.mode,
      creature: active ? active.displayName + " Sv. " + active.level : "",
      team: team,
      pvp: Object.assign({ wins: 0, losses: 0 }, state.pvp || {}),
      emote: freshEmote ? String(meta.emote).slice(0, 18) : "",
      emoteAt: meta.emoteAt || 0,
      invite: freshInvite ? meta.lastInvite : null,
      inviteResponse: freshResponse ? meta.inviteResponse : null,
      updatedAt: now()
    };
  };

  L.Multiplayer.prototype.createRoom = async function (name) {
    if (!this.game.state) throw new Error("Önce oyuna başla veya kayıt yükle.");
    this.playerName = String(name || this.playerName || "Oyuncu").slice(0, 16);
    localStorage.setItem("lumaQuest.mp.name", this.playerName);
    var code = randomCode();
    this.idToken = await this.ensureAuth();
    await this.request("PUT", "/rooms/" + code, {
      code: code,
      hostId: this.playerId,
      createdAt: now(),
      players: {}
    });
    this.roomCode = code;
    this.enabled = true;
    await this.pushNow();
    return code;
  };

  L.Multiplayer.prototype.joinRoom = async function (code, name) {
    if (!this.game.state) throw new Error("Önce oyuna başla veya kayıt yükle.");
    code = cleanRoomCode(code);
    if (!code) throw new Error("Oda kodu boş.");
    this.playerName = String(name || this.playerName || "Oyuncu").slice(0, 16);
    localStorage.setItem("lumaQuest.mp.name", this.playerName);
    var room = await this.request("GET", "/rooms/" + code);
    if (!room) throw new Error("Oda bulunamadı.");
    this.roomCode = code;
    this.enabled = true;
    await this.pushNow();
    return code;
  };

  L.Multiplayer.prototype.leaveRoom = async function () {
    if (!this.roomCode) return;
    var code = this.roomCode;
    this.enabled = false;
    this.roomCode = null;
    this.remotePlayers = {};
    try {
      await this.request("DELETE", "/rooms/" + code + "/players/" + this.playerId);
    } catch (err) {}
  };

  L.Multiplayer.prototype.pushNow = async function () {
    if (!this.roomCode || !this.game.state) return;
    await this.request("PATCH", "/rooms/" + this.roomCode + "/players/" + this.playerId, this.payload());
  };

  L.Multiplayer.prototype.sendEmote = function (text) {
    if (!this.roomCode || !this.game.state) return false;
    this.game.state.multiplayerMeta = Object.assign({}, this.game.state.multiplayerMeta || {}, {
      emote: String(text || "Selam").slice(0, 18),
      emoteAt: now()
    });
    this.pushNow().catch(this.handleError.bind(this));
    return true;
  };

  L.Multiplayer.prototype.sendInvite = function (kind) {
    if (!this.roomCode || !this.game.state) return { ok: false, message: "Önce bir odaya bağlan." };
    var team = healthyTeamSnapshot(this.game.state);
    if (kind === "pvp" && !team.length) return { ok: false, message: "PvP için en az bir sağlıklı Luma lazım." };
    var label = kind === "trade" ? "Takas" : "PvP";
    var invite = {
      id: "inv_" + now().toString(36) + "_" + Math.random().toString(36).slice(2, 6),
      kind: kind,
      label: label,
      from: this.playerName || "Oyuncu",
      fromId: this.playerId,
      at: now()
    };
    if (kind === "pvp") invite.team = team;
    this.game.state.multiplayerMeta = Object.assign({}, this.game.state.multiplayerMeta || {}, {
      lastInvite: invite,
      emote: label + " isteği",
      emoteAt: now()
    });
    this.pushNow().catch(this.handleError.bind(this));
    return { ok: true, message: label + " isteği gönderildi." };
  };

  L.Multiplayer.prototype.acceptPvp = function (remoteId) {
    if (!this.roomCode || !this.game.state) return { ok: false, message: "Önce bir odaya bağlan." };
    var remote = this.remotePlayers[remoteId];
    var invite = remote && remote.invite;
    if (!remote || !invite || invite.kind !== "pvp") return { ok: false, message: "Geçerli PvP isteği bulunamadı." };
    var team = healthyTeamSnapshot(this.game.state);
    if (!team.length) return { ok: false, message: "PvP için en az bir sağlıklı Luma lazım." };
    var key = inviteKey(invite);
    this.game.state.multiplayerMeta = Object.assign({}, this.game.state.multiplayerMeta || {}, {
      inviteResponse: {
        id: "resp_" + key + "_" + now().toString(36),
        kind: "pvp",
        inviteId: key,
        to: remote.id || remoteId,
        accepted: true,
        from: this.playerName || "Oyuncu",
        fromId: this.playerId,
        team: team,
        at: now()
      },
      emote: "PvP kabul",
      emoteAt: now()
    });
    this.pushNow().catch(this.handleError.bind(this));
    if (!this.startPvpBattle(remote, key, "accepted")) return { ok: false, message: "PvP savaşı başlatılamadı." };
    return { ok: true, message: "PvP kabul edildi. Maç başladı!" };
  };

  L.Multiplayer.prototype.startPvpBattle = function (remote, key) {
    if (!remote || !this.game.state || this.game.battle.active) return false;
    if (!healthyTeamSnapshot(this.game.state).length) {
      if (this.game.ui) this.game.ui.notify("PvP için sağlıklı Luma lazım.");
      return false;
    }
    var snapshot = remote.inviteResponse && remote.inviteResponse.team || remote.invite && remote.invite.team || remote.team;
    var party = partyFromSnapshot(snapshot);
    if (!party.length) {
      if (this.game.ui) this.game.ui.notify("Rakibin takım bilgisi alınamadı.");
      return false;
    }
    if (this.game.mode === "panel" && this.game.ui) this.game.ui.closePanel();
    var trainer = {
      id: "pvp_" + String(remote.id || "remote").replace(/[^a-zA-Z0-9_]/g, "") + "_" + (key || now()),
      name: "PvP " + String(remote.name || "Oyuncu").slice(0, 16),
      pvp: true,
      money: 0,
      afterDialogue: [String(remote.name || "Rakip").slice(0, 16) + " ile PvP maçını kazandın!"]
    };
    this.game.battle.startTrainer(trainer, party);
    return true;
  };

  L.Multiplayer.prototype.handlePvpResponses = function () {
    Object.keys(this.remotePlayers).forEach(function (id) {
      var player = this.remotePlayers[id];
      var response = player && player.inviteResponse;
      if (!response || response.kind !== "pvp" || !response.accepted || response.to !== this.playerId) return;
      var key = String(response.id || response.inviteId || id);
      if (this.handledPvpResponses[key]) return;
      player.team = response.team || player.team;
      player.inviteResponse = response;
      if (this.startPvpBattle(player, key) && this.game.ui) {
        this.handledPvpResponses[key] = true;
        this.game.ui.notify((player.name || "Oyuncu") + " PvP isteğini kabul etti.");
      }
    }, this);
  };

  L.Multiplayer.prototype.pollNow = async function () {
    if (!this.roomCode) return;
    var players = await this.request("GET", "/rooms/" + this.roomCode + "/players");
    var fresh = {};
    Object.keys(players || {}).forEach(function (id) {
      var player = players[id];
      if (!player || id === this.playerId) return;
      if (now() - (player.updatedAt || 0) > 12000) return;
      fresh[id] = player;
    }, this);
    this.remotePlayers = fresh;
    this.handlePvpResponses();
  };

  L.Multiplayer.prototype.update = function (dt) {
    if (!this.enabled || !this.roomCode || !this.game.state || this.game.mode === "menu") return;
    this.pushTimer -= dt;
    this.pollTimer -= dt;
    if (this.pushTimer <= 0) {
      this.pushTimer = .55;
      this.pushNow().catch(this.handleError.bind(this));
    }
    if (this.pollTimer <= 0) {
      this.pollTimer = 1.1;
      this.pollNow().catch(this.handleError.bind(this));
    }
  };

  L.Multiplayer.prototype.handleError = function (err) {
    if (this.errorShown) return;
    this.errorShown = true;
    if (this.game.ui) this.game.ui.notify("Multiplayer bağlantısı kurulamadı: " + err.message);
  };

  L.Multiplayer.prototype.sameMapPlayers = function (mapId) {
    return Object.keys(this.remotePlayers).map(function (id) {
      return this.remotePlayers[id];
    }, this).filter(function (player) {
      return player.mapId === mapId;
    });
  };
})();
