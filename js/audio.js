(function () {
  var L = window.LUMA = window.LUMA || {};

  L.Audio = {
    ctx: null,
    enabled: true,
    unlocked: false,
    settings: { mainVolume: .75, musicVolume: .35, sfxVolume: .8 },

    applySettings: function (settings) {
      this.settings = Object.assign({}, this.settings, settings || {});
    },

    init: function () {
      if (this.ctx || !this.enabled) return;
      try {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          this.enabled = false;
          return;
        }
        this.ctx = new AudioContext();
      } catch (err) {
        this.enabled = false;
      }
    },

    unlock: function () {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume().catch(function () {});
      this.unlocked = true;
    },

    tone: function (freq, duration, type, gain, slide) {
      if (!this.enabled) return;
      this.unlock();
      if (!this.ctx) return;
      try {
        var now = this.ctx.currentTime;
        var osc = this.ctx.createOscillator();
        var amp = this.ctx.createGain();
        var volume = (gain || .08) * this.settings.mainVolume * this.settings.sfxVolume;
        osc.type = type || "square";
        osc.frequency.setValueAtTime(freq, now);
        if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), now + duration);
        amp.gain.setValueAtTime(0, now);
        amp.gain.linearRampToValueAtTime(volume, now + .01);
        amp.gain.exponentialRampToValueAtTime(.0001, now + duration);
        osc.connect(amp);
        amp.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration + .02);
      } catch (err) {
        this.enabled = false;
      }
    },

    chord: function (notes, duration, type, gain) {
      for (var i = 0; i < notes.length; i += 1) {
        this.tone(notes[i], duration, type, gain);
      }
    },

    play: function (name) {
      var sounds = {
        menu: [520, .055, "square", .035],
        confirm: [760, .08, "triangle", .05],
        cancel: [210, .09, "sawtooth", .04, 140],
        dialogue: [420, .025, "square", .018],
        step: [135, .035, "triangle", .018],
        encounter: [180, .18, "sawtooth", .06, 720],
        attack: [500, .11, "square", .055, 220],
        damage: [110, .12, "sawtooth", .06, 70],
        capture: [680, .16, "triangle", .05, 360],
        heal: [620, .16, "sine", .055, 900],
        victory: [880, .12, "triangle", .055],
        pickup: [720, .08, "square", .045],
        quest: [540, .11, "triangle", .05],
        error: [160, .12, "sawtooth", .05]
      };
      var s = sounds[name] || sounds.menu;
      this.tone(s[0], s[1], s[2], s[3], s[4]);
      if (name === "victory") {
        var self = this;
        setTimeout(function () { self.tone(990, .12, "triangle", .045); }, 120);
        setTimeout(function () { self.tone(1320, .18, "triangle", .04); }, 240);
      }
      if (name === "quest") {
        var self2 = this;
        setTimeout(function () { self2.tone(760, .12, "triangle", .04); }, 110);
      }
    }
  };
})();
