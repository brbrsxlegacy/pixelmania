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
    return {
      id: this.playerId,
      name: this.playerName || "Oyuncu",
      mapId: this.game.map ? this.game.map.id : state.mapId || "isikpinar",
      x: Math.round(this.game.player.x),
      y: Math.round(this.game.player.y),
      dir: this.game.player.dir || "down",
      mode: this.game.mode,
      creature: active ? active.displayName + " Sv. " + active.level : "",
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
