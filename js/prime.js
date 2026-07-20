(function () {
  var L = window.LUMA = window.LUMA || {};

  function baseFor(creature) {
    return creature && creature.id && window.LUMA_DATA.creatures[creature.id];
  }

  function infoFor(creature) {
    var base = baseFor(creature);
    if (!base || !base.prime) return null;
    return Object.assign({
      name: "Prime " + base.name,
      minLevel: 20,
      boosts: { hp: 1.12, attack: 1.3, defense: 1.16, speed: 1.16 },
      aura: "#f2b94b"
    }, base.prime);
  }

  function hasPrimeKey(game) {
    var state = game && game.state;
    if (!state) return false;
    if (state.prime && state.prime.unlocked) return true;
    return !!(state.inventory && state.inventory.primeCekirdegi > 0);
  }

  function canPrime(game, creature) {
    var info = infoFor(creature);
    if (!info) return { ok: false, message: "Bu Luma'nın Prime formu yok." };
    if (!creature || creature.hp <= 0) return { ok: false, message: "Bayılmış Luma Prime olamaz." };
    if (creature.primeActive) return { ok: false, message: creature.displayName + " zaten Prime formunda." };
    if ((creature.level || 1) < info.minLevel) return { ok: false, message: "Prime için Sv. " + info.minLevel + " gerekiyor." };
    if (!hasPrimeKey(game)) return { ok: false, message: "Prime Çekirdeği gerekiyor." };
    if (info.unlockKey && L.Underground && !L.Underground.hasPrimeSpecies(game.state, creature.id)) {
      return { ok: false, message: "Bu Prime formu henuz kilitli. Boss, puzzle veya Prime Tasi gerekiyor." };
    }
    if (game && game.battle && game.battle.primeUsed) return { ok: false, message: "Bu savaşta Prime hakkını kullandın." };
    return { ok: true, info: info };
  }

  function applyBoost(creature, info, source) {
    var boosts = Object.assign({ hp: 1.12, attack: 1.3, defense: 1.16, speed: 1.16 }, info.boosts || {});
    var hpRatio = creature.maxHp ? creature.hp / creature.maxHp : 1;
    creature.primeActive = true;
    creature.primeName = info.name;
    creature.primeAura = info.aura || "#f2b94b";
    creature.primeSource = source || "player";
    creature.displayName = info.name;
    creature.maxHp = Math.max(1, Math.floor(creature.maxHp * boosts.hp));
    creature.hp = Math.max(1, Math.min(creature.maxHp, Math.ceil(creature.maxHp * hpRatio)));
    creature.attack = Math.max(1, Math.floor(creature.attack * boosts.attack));
    creature.defense = Math.max(1, Math.floor(creature.defense * boosts.defense));
    creature.speed = Math.max(1, Math.floor(creature.speed * boosts.speed));
    creature.statStages = { attack: 0, defense: 0, speed: 0, evasion: 0 };
    return creature;
  }

  function restoreCreature(creature) {
    if (!creature || !creature.primeActive) return false;
    var wasFainted = creature.hp <= 0;
    var hpRatio = creature.maxHp ? creature.hp / creature.maxHp : 1;
    delete creature.primeActive;
    delete creature.primeName;
    delete creature.primeAura;
    delete creature.primeSource;
    if (L.Creatures && L.Creatures.recalc) L.Creatures.recalc(creature);
    creature.hp = wasFainted ? 0 : Math.max(1, Math.min(creature.maxHp, Math.ceil(creature.maxHp * hpRatio)));
    return true;
  }

  L.Prime = {
    info: infoFor,

    canPrime: canPrime,

    canEnemyPrime: function (creature, trainer) {
      var info = infoFor(creature);
      if (!info || !trainer || !trainer.prime) return null;
      if (!creature || creature.hp <= 0 || creature.primeActive) return null;
      if ((creature.level || 1) < info.minLevel) return null;
      return info;
    },

    activate: function (game, creature, options) {
      options = options || {};
      var info = options.enemy ? this.canEnemyPrime(creature, options.trainer) : canPrime(game, creature).info;
      if (!info) return { ok: false, message: "Prime şu an açılamıyor." };
      applyBoost(creature, info, options.enemy ? "enemy" : "player");
      if (!options.enemy && game && game.battle) game.battle.primeUsed = true;
      if (!options.enemy && game && game.state) {
        game.state.prime = Object.assign({ unlocked: true, activations: 0 }, game.state.prime || {});
        game.state.prime.unlocked = true;
        game.state.prime.activations += 1;
        if (L.Quests) L.Quests.progress(game.state, "usePrime", 1);
        if (game.autosaveSoon) game.autosaveSoon();
      }
      return { ok: true, message: creature.displayName + " formuna geçti!", info: info };
    },

    restore: restoreCreature,

    restoreBattle: function (creatures) {
      (creatures || []).forEach(restoreCreature);
    }
  };
})();
