(function () {
  var L = window.LUMA = window.LUMA || {};

  var C3 = 130.81;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function freqFor(theme, degree, octaveShift) {
    var scale = theme.scale || [0, 2, 4, 7, 9, 12];
    var length = scale.length;
    var octave = Math.floor(degree / length) + (octaveShift || 0);
    var index = ((degree % length) + length) % length;
    return theme.root * Math.pow(2, (scale[index] + octave * 12) / 12);
  }

  var themes = {
    village: {
      bpm: 96, root: C3, lead: "triangle", bassWave: "sine", drum: "soft",
      scale: [0, 2, 4, 7, 9, 12],
      melody: [7, null, 9, null, 10, 9, 7, null, 4, null, 5, 7, 5, null, 4, null],
      bass: [0, null, null, null, 3, null, null, null, 4, null, null, null, 3, null, null, null],
      chords: [[0, 2, 4], [3, 5, 7], [4, 6, 8], [3, 5, 7]]
    },
    field: {
      bpm: 108, root: C3 * Math.pow(2, 2 / 12), lead: "square", bassWave: "triangle", drum: "soft",
      scale: [0, 2, 4, 5, 7, 9, 12],
      melody: [7, 9, null, 11, 9, 7, 5, null, 4, 5, 7, null, 9, 7, 5, null],
      bass: [0, null, 0, null, 4, null, 4, null, 5, null, 5, null, 4, null, 3, null],
      chords: [[0, 2, 4], [4, 6, 8], [5, 7, 9], [3, 5, 7]]
    },
    forest: {
      bpm: 92, root: C3 * Math.pow(2, -2 / 12), lead: "triangle", bassWave: "sine", drum: "none",
      scale: [0, 2, 3, 5, 7, 10, 12],
      melody: [7, null, 10, null, 9, null, 5, null, 7, 5, null, 3, 5, null, 7, null],
      bass: [0, null, null, null, 5, null, null, null, 3, null, null, null, 5, null, null, null],
      chords: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [5, 7, 10]]
    },
    water: {
      bpm: 84, root: C3 * Math.pow(2, 5 / 12), lead: "sine", bassWave: "triangle", drum: "none",
      scale: [0, 2, 4, 7, 9, 11, 12],
      melody: [7, null, 9, 11, null, 9, 7, null, 4, null, 7, 9, null, 11, 9, null],
      bass: [0, null, null, null, 4, null, null, null, 5, null, null, null, 4, null, null, null],
      chords: [[0, 2, 4], [4, 6, 8], [5, 7, 9], [2, 4, 6]]
    },
    cave: {
      bpm: 76, root: C3 * Math.pow(2, -5 / 12), lead: "sawtooth", bassWave: "sine", drum: "low",
      scale: [0, 3, 5, 6, 7, 10, 12],
      melody: [7, null, 6, null, 5, null, 3, null, 0, null, 3, null, 5, 6, null, null],
      bass: [0, null, null, null, -1, null, null, null, 0, null, null, null, 3, null, null, null],
      chords: [[0, 2, 4], [-1, 1, 3], [3, 5, 7], [0, 3, 5]]
    },
    city: {
      bpm: 118, root: C3 * Math.pow(2, 4 / 12), lead: "square", bassWave: "triangle", drum: "tick",
      scale: [0, 2, 4, 7, 9, 12],
      melody: [7, 9, 10, null, 12, 10, 9, null, 7, 9, 7, 5, 4, null, 5, null],
      bass: [0, null, 0, null, 4, null, 4, null, 5, null, 5, null, 4, null, 4, null],
      chords: [[0, 2, 4], [4, 6, 8], [5, 7, 9], [4, 6, 8]]
    },
    machine: {
      bpm: 124, root: C3 * Math.pow(2, 7 / 12), lead: "square", bassWave: "sawtooth", drum: "tick",
      scale: [0, 2, 3, 6, 7, 10, 12],
      melody: [7, null, 7, 10, null, 9, 7, null, 3, null, 6, null, 7, 9, 10, null],
      bass: [0, null, 0, null, 3, null, 3, null, 4, null, 4, null, 3, null, 0, null],
      chords: [[0, 3, 5], [3, 5, 7], [4, 6, 8], [0, 2, 4]]
    },
    ember: {
      bpm: 116, root: C3 * Math.pow(2, -3 / 12), lead: "sawtooth", bassWave: "square", drum: "low",
      scale: [0, 3, 5, 7, 8, 10, 12],
      melody: [7, 8, 10, null, 8, 7, 5, null, 3, 5, 7, null, 10, 8, 7, null],
      bass: [0, null, 0, null, 5, null, 5, null, 3, null, 3, null, 5, null, 0, null],
      chords: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [0, 4, 6]]
    },
    snow: {
      bpm: 82, root: C3 * Math.pow(2, 9 / 12), lead: "sine", bassWave: "triangle", drum: "none",
      scale: [0, 2, 5, 7, 9, 12],
      melody: [7, null, 9, null, 12, null, 9, null, 7, null, 5, null, 4, null, 2, null],
      bass: [0, null, null, null, 4, null, null, null, 5, null, null, null, 4, null, null, null],
      chords: [[0, 2, 4], [4, 6, 8], [5, 7, 9], [2, 4, 6]]
    },
    ruin: {
      bpm: 88, root: C3 * Math.pow(2, -4 / 12), lead: "triangle", bassWave: "sine", drum: "low",
      scale: [0, 2, 3, 6, 7, 10, 12],
      melody: [7, null, 6, null, 10, null, 7, null, 3, null, 6, null, 5, null, 3, null],
      bass: [0, null, null, null, 6, null, null, null, 3, null, null, null, 6, null, null, null],
      chords: [[0, 2, 4], [6, 8, 10], [3, 5, 7], [6, 8, 10]]
    },
    home: {
      bpm: 72, root: C3 * Math.pow(2, 2 / 12), lead: "sine", bassWave: "triangle", drum: "none",
      scale: [0, 2, 4, 7, 9, 12],
      melody: [7, null, null, 9, null, 7, null, null, 4, null, 5, null, 7, null, null, null],
      bass: [0, null, null, null, 3, null, null, null, 4, null, null, null, 3, null, null, null],
      chords: [[0, 2, 4], [3, 5, 7], [4, 6, 8], [3, 5, 7]]
    },
    arena: {
      bpm: 128, root: C3, lead: "square", bassWave: "sawtooth", drum: "tick",
      scale: [0, 2, 4, 7, 9, 12],
      melody: [7, 9, 12, null, 14, 12, 9, null, 7, 9, 12, 14, 12, null, 9, null],
      bass: [0, null, 0, null, 4, null, 4, null, 5, null, 5, null, 4, null, 0, null],
      chords: [[0, 2, 4], [4, 6, 8], [5, 7, 9], [0, 4, 7]]
    },
    battle: {
      bpm: 150, root: C3 * Math.pow(2, -2 / 12), lead: "square", bassWave: "sawtooth", drum: "battle",
      scale: [0, 2, 3, 5, 7, 8, 10, 12],
      melody: [7, 8, 10, 12, 10, 8, 7, 5, 7, 10, 12, 14, 12, 10, 8, 7],
      bass: [0, 0, null, 0, 5, 5, null, 5, 3, 3, null, 3, 5, 5, 0, 0],
      chords: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [5, 8, 10]]
    },
    boss: {
      bpm: 164, root: C3 * Math.pow(2, -5 / 12), lead: "sawtooth", bassWave: "square", drum: "battle",
      scale: [0, 1, 3, 5, 6, 8, 10, 12],
      melody: [7, 10, 12, 15, 14, 12, 10, 7, 5, 7, 10, 12, 15, 14, 12, 10],
      bass: [0, 0, 0, null, 5, 5, 5, null, 3, 3, 3, null, 6, 6, 5, null],
      chords: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [6, 8, 10]]
    }
  };

  function trackForMap(map) {
    var id = String(map && map.id || "");
    if (!id) return "field";
    if (/bossArena|arenaMeydan/i.test(id)) return "arena";
    if (/home|Interior|labInterior|house|clinic|shop/i.test(id)) return "home";
    if (/isikpinar/i.test(id)) return "village";
    if (/yesilova|fisilti|botanik|rengarenk|geceKorusu|sisBatakligi/i.test(id)) return "forest";
    if (/kutup|buzul/i.test(id)) return "snow";
    if (/kristalGol|liman|sahil/i.test(id)) return "water";
    if (/lav|meteor|kumru/i.test(id)) return "ember";
    if (/magara|maden/i.test(id)) return "cave";
    if (/antika|gece/i.test(id)) return "ruin";
    if (/tren|sanayi|gokKulesi/i.test(id)) return "machine";
    if (/lumaSehir|pazar|belediye|akademi/i.test(id)) return "city";
    return "field";
  }

  L.Audio = {
    ctx: null,
    enabled: true,
    unlocked: false,
    settings: { mainVolume: .75, musicVolume: .35, sfxVolume: .8 },
    musicGain: null,
    music: { track: null, timer: null, nextAt: 0, step: 0, lastMapTrack: null },

    applySettings: function (settings) {
      this.settings = Object.assign({}, this.settings, settings || {});
      this.updateMusicVolume();
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
        this.ensureMusicGain();
      } catch (err) {
        this.enabled = false;
      }
    },

    ensureMusicGain: function () {
      if (!this.ctx || this.musicGain) return;
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
      this.updateMusicVolume(true);
    },

    updateMusicVolume: function (instant) {
      if (!this.ctx || !this.musicGain) return;
      var target = clamp((this.settings.mainVolume || 0) * (this.settings.musicVolume || 0), 0, 1);
      var now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      if (instant) this.musicGain.gain.setValueAtTime(target, now);
      else this.musicGain.gain.linearRampToValueAtTime(target, now + .18);
    },

    unlock: function () {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume().catch(function () {});
      this.unlocked = true;
      if (this.music.track) this.startMusic();
    },

    noteAt: function (freq, duration, type, gain, at, slide) {
      if (!this.ctx) return;
      try {
        this.ensureMusicGain();
        var osc = this.ctx.createOscillator();
        var amp = this.ctx.createGain();
        osc.type = type || "square";
        osc.frequency.setValueAtTime(Math.max(20, freq), at);
        if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), at + duration);
        amp.gain.setValueAtTime(0, at);
        amp.gain.linearRampToValueAtTime(gain || .035, at + .012);
        amp.gain.exponentialRampToValueAtTime(.0001, at + duration);
        osc.connect(amp);
        amp.connect(this.musicGain);
        osc.start(at);
        osc.stop(at + duration + .04);
      } catch (err) {
        this.enabled = false;
      }
    },

    percussionAt: function (kind, step, at) {
      if (kind === "none") return;
      if (kind === "soft" && step % 8 === 0) this.noteAt(92, .08, "triangle", .014, at, 55);
      if (kind === "low" && step % 4 === 0) this.noteAt(70, .11, "sine", .022, at, 42);
      if (kind === "tick" && step % 2 === 0) this.noteAt(step % 4 === 0 ? 92 : 420, .045, "square", step % 4 === 0 ? .022 : .01, at, step % 4 === 0 ? 52 : 300);
      if (kind === "battle") {
        if (step % 4 === 0) this.noteAt(78, .1, "sine", .033, at, 42);
        if (step % 4 === 2) this.noteAt(210, .045, "square", .018, at, 155);
        if (step % 2 === 1) this.noteAt(560, .025, "square", .008, at, 420);
      }
    },

    scheduleStep: function (theme, step, at) {
      var eighth = 60 / theme.bpm / 2;
      var bassDegree = theme.bass[step % theme.bass.length];
      var melodyDegree = theme.melody[step % theme.melody.length];
      if (bassDegree != null) {
        var bassFreq = freqFor(theme, bassDegree, -1);
        this.noteAt(bassFreq, eighth * 1.55, theme.bassWave || "triangle", .032, at);
      }
      if (step % 8 === 0 && theme.chords && theme.chords.length) {
        var chord = theme.chords[Math.floor(step / 8) % theme.chords.length];
        for (var c = 0; c < chord.length; c += 1) {
          this.noteAt(freqFor(theme, chord[c], 1), eighth * 5.2, "triangle", .009, at + c * .01);
        }
      }
      if (melodyDegree != null) {
        this.noteAt(freqFor(theme, melodyDegree, 1), eighth * .82, theme.lead || "square", .024, at);
      }
      if (theme.drum) this.percussionAt(theme.drum, step, at);
    },

    scheduleMusic: function () {
      if (!this.ctx || !this.music.track) return;
      var theme = themes[this.music.track] || themes.field;
      var now = this.ctx.currentTime;
      var lookAhead = now + .55;
      var eighth = 60 / theme.bpm / 2;
      if (!this.music.nextAt || this.music.nextAt < now) this.music.nextAt = now + .04;
      while (this.music.nextAt < lookAhead) {
        this.scheduleStep(theme, this.music.step, this.music.nextAt);
        this.music.nextAt += eighth;
        this.music.step = (this.music.step + 1) % 64;
      }
    },

    startMusic: function () {
      if (!this.enabled || !this.music.track) return;
      this.init();
      if (!this.ctx || !this.unlocked) return;
      this.ensureMusicGain();
      this.updateMusicVolume();
      if (this.music.timer) return;
      this.music.nextAt = this.ctx.currentTime + .04;
      this.scheduleMusic();
      var self = this;
      this.music.timer = setInterval(function () { self.scheduleMusic(); }, 90);
    },

    setMusic: function (track) {
      if (!track) return this.stopMusic();
      if (this.music.track === track) {
        if (!this.music.timer && this.unlocked) this.startMusic();
        return;
      }
      if (this.music.timer) {
        clearInterval(this.music.timer);
        this.music.timer = null;
      }
      this.music.track = track;
      this.music.step = 0;
      this.music.nextAt = 0;
      if (this.unlocked) this.startMusic();
    },

    stopMusic: function () {
      if (this.music.timer) {
        clearInterval(this.music.timer);
        this.music.timer = null;
      }
      this.music.track = null;
      this.music.step = 0;
      this.music.nextAt = 0;
      if (this.ctx && this.musicGain) {
        var now = this.ctx.currentTime;
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.linearRampToValueAtTime(0, now + .16);
      }
    },

    playMapMusic: function (map) {
      var track = trackForMap(map);
      this.music.lastMapTrack = track;
      this.setMusic(track);
    },

    playBattleMusic: function (boss) {
      this.setMusic(boss ? "boss" : "battle");
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
