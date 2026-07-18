(function () {
  var L = window.LUMA = window.LUMA || {};

  function targetId(creature) {
    var base = L.Creatures.getBase(creature && creature.id);
    if (!base || !base.evolution) return null;
    var into = base.evolution.into;
    if (window.LUMA_DATA.creatures[into]) return into;
    var byName = Object.keys(window.LUMA_DATA.creatures).filter(function (id) {
      return window.LUMA_DATA.creatures[id].name === into;
    })[0];
    return byName || null;
  }

  function ready(creature) {
    var base = L.Creatures.getBase(creature && creature.id);
    var into = targetId(creature);
    if (!base || !base.evolution || !into) return null;
    if (creature.level < base.evolution.level) return null;
    return { from: base, to: L.Creatures.getBase(into), toId: into, level: base.evolution.level };
  }

  function evolveCreature(game, creature, toId) {
    var target = L.Creatures.getBase(toId);
    if (!target) return false;
    var hpRatio = creature.maxHp ? creature.hp / creature.maxHp : 1;
    creature.id = toId;
    creature.name = target.name;
    creature.displayName = creature.shiny ? "Parıltılı " + target.name : target.name;
    creature.element = target.element;
    creature.rarity = target.rarity;
    creature.captureDifficulty = target.captureDifficulty;
    creature.description = target.description;
    creature.evolution = target.evolution;
    L.Creatures.recalc(creature);
    creature.hp = Math.max(1, Math.ceil(creature.maxHp * hpRatio));
    if (game && game.state) {
      L.WorldMap.recordSeen(game.state, toId);
      L.WorldMap.recordCaught(game.state, toId);
      game.autosaveSoon();
    }
    return true;
  }

  L.Evolution = {
    ready: ready,

    canEvolve: function (creature) {
      return !!ready(creature);
    },

    nextInfo: function (creature) {
      var base = L.Creatures.getBase(creature && creature.id);
      var into = targetId(creature);
      if (!base || !base.evolution || !into) return null;
      return { toId: into, to: L.Creatures.getBase(into), level: base.evolution.level, ready: creature.level >= base.evolution.level };
    },

    evolveNow: function (game, creature) {
      var info = ready(creature);
      if (!info) return false;
      var oldName = creature.displayName;
      var ok = evolveCreature(game, creature, info.toId);
      if (ok && game && game.ui) game.ui.notify(oldName + " evrimleşti: " + creature.displayName + "!");
      if (ok && L.Audio) L.Audio.play("victory");
      return ok;
    },

    prompt: function (game, creature) {
      var info = ready(creature);
      if (!info || !game || !game.dialogue) return false;
      game.dialogue.show("Evrim", [
        creature.displayName + " değişmeye hazır.",
        info.to.name + " formuna evrimleşsin mi?"
      ], null, [
        { label: "Evrimle", onChoose: function () { L.Evolution.evolveNow(game, creature); } },
        { label: "Şimdilik kalsın", onChoose: function () { if (game.ui) game.ui.notify("Evrim ertelendi."); } }
      ]);
      return true;
    },

    chainFor: function (id) {
      var chain = [id];
      var guard = {};
      var current = id;
      while (current && !guard[current]) {
        guard[current] = true;
        var base = L.Creatures.getBase(current);
        if (!base || !base.evolution) break;
        current = targetId({ id: current, level: 99 });
        if (current) chain.push(current);
      }
      return chain;
    }
  };
})();
