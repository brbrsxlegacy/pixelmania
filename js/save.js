(function () {
  var L = window.LUMA = window.LUMA || {};
  var SETTINGS_KEY = "lumaQuest.settings.v1";
  var SLOT_PREFIX = "lumaQuest.slot.";
  var QUICK_SLOT = 1;

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function nowText() {
    try {
      return new Date().toLocaleString("tr-TR");
    } catch (err) {
      return String(Date.now());
    }
  }

  function defaultSettings() {
    return {
      mainVolume: .75,
      musicVolume: .35,
      sfxVolume: .8,
      fullscreen: false,
      windowScale: 1,
      textSpeed: 28,
      screenShake: true,
      touchControls: false,
      showFps: false,
      showControls: true,
      autosave: true
    };
  }

  function safeParse(raw) {
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch (err) {
      return null;
    }
  }

  L.clone = clone;
  L.Save = {
    defaultSettings: defaultSettings,

    loadSettings: function () {
      var parsed = safeParse(localStorage.getItem(SETTINGS_KEY));
      return Object.assign(defaultSettings(), parsed || {});
    },

    saveSettings: function (settings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(Object.assign(defaultSettings(), settings || {})));
    },

    saveSlot: function (slot, state) {
      var copy = clone(state);
      copy.savedAt = Date.now();
      copy.version = 1;
      localStorage.setItem(SLOT_PREFIX + slot, JSON.stringify(copy));
      return this.preview(copy, slot);
    },

    getSlot: function (slot) {
      var parsed = safeParse(localStorage.getItem(SLOT_PREFIX + slot));
      if (!parsed || !parsed.player || !parsed.mapId) return null;
      return parsed;
    },

    deleteSlot: function (slot) {
      localStorage.removeItem(SLOT_PREFIX + slot);
    },

    preview: function (state, slot) {
      var first = state.team && state.team[0] ? state.team[0] : null;
      var badges = state.badges ? Object.keys(state.badges).length : 0;
      var caught = state.dex && state.dex.caught ? Object.keys(state.dex.caught).length : 0;
      var eggs = state.eggs && Array.isArray(state.eggs.inventory) ? state.eggs.inventory.length : 0;
      var pvp = Object.assign({ wins: 0, losses: 0 }, state.pvp || {});
      return {
        slot: slot,
        exists: true,
        mapId: state.mapId || "isikpinar",
        mapName: window.LUMA_DATA.maps[state.mapId] ? window.LUMA_DATA.maps[state.mapId].name : "Bilinmeyen",
        playerName: state.playerName || "Oyuncu",
        starter: first ? first.name : "Yok",
        level: first ? first.level : 1,
        money: state.money || 0,
        badges: badges,
        caught: caught,
        eggs: eggs,
        pvpWins: pvp.wins || 0,
        pvpLosses: pvp.losses || 0,
        streak: state.daily && state.daily.streak || 0,
        playTime: state.playTime || 0,
        savedAt: state.savedAt || Date.now(),
        savedText: nowText()
      };
    },

    listSlots: function () {
      var result = [];
      for (var i = 1; i <= 3; i += 1) {
        var state = this.getSlot(i);
        result.push(state ? this.preview(state, i) : { slot: i, exists: false });
      }
      return result;
    },

    latestSlot: function () {
      var slots = [];
      for (var i = 1; i <= 3; i += 1) {
        var s = this.getSlot(i);
        if (s) slots.push({ slot: i, state: s, savedAt: s.savedAt || 0 });
      }
      slots.sort(function (a, b) { return b.savedAt - a.savedAt; });
      return slots[0] || null;
    },

    quickSave: function (state) {
      return this.saveSlot(state.quickSlot || QUICK_SLOT, state);
    },

    quickLoad: function (state) {
      return this.getSlot((state && state.quickSlot) || QUICK_SLOT);
    }
  };
})();
