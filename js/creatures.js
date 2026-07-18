(function () {
  var L = window.LUMA = window.LUMA || {};
  var data = window.LUMA_DATA.creatures;

  function stat(base, level, key, shiny) {
    var scale = key === "hp" ? 4 : 1.55;
    var value = Math.floor(base[key] + level * scale);
    return shiny ? Math.floor(value * 1.06) : value;
  }

  function xpNeeded(level) {
    return 24 + level * level * 7;
  }

  function abilityIdsFor(creature, level) {
    var ids = creature.abilities.slice(0, Math.min(4, 2 + Math.floor(level / 6)));
    return ids.slice(-4);
  }

  L.Creatures = {
    getBase: function (id) {
      return data[id];
    },

    starters: function () {
      return Object.keys(data).filter(function (id) { return data[id].starter; });
    },

    create: function (id, level, options) {
      var base = data[id];
      var shiny = !!(options && options.shiny);
      var maxHp = stat(base.baseStats, level, "hp", shiny);
      return {
        uid: "cr_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7),
        id: id,
        name: base.name,
        displayName: shiny ? "Parıltılı " + base.name : base.name,
        element: base.element,
        level: level,
        shiny: shiny,
        rarity: base.rarity,
        captureDifficulty: base.captureDifficulty,
        description: base.description,
        evolution: base.evolution,
        maxHp: maxHp,
        hp: maxHp,
        attack: stat(base.baseStats, level, "attack", shiny),
        defense: stat(base.baseStats, level, "defense", shiny),
        speed: stat(base.baseStats, level, "speed", shiny),
        exp: 0,
        expToNext: xpNeeded(level),
        status: null,
        abilities: abilityIdsFor(base, level).map(function (abilityId) { return L.Abilities.createMove(abilityId); }),
        statStages: { attack: 0, defense: 0, speed: 0, evasion: 0 }
      };
    },

    recalc: function (creature) {
      var base = data[creature.id];
      if (!base) return null;
      creature.level = Math.max(1, Math.min(50, Number(creature.level) || 1));
      creature.shiny = !!creature.shiny;
      creature.name = base.name;
      creature.displayName = creature.shiny ? "Parıltılı " + base.name : base.name;
      creature.element = base.element;
      creature.rarity = base.rarity;
      creature.captureDifficulty = base.captureDifficulty;
      creature.description = base.description;
      creature.evolution = base.evolution;
      creature.abilities = Array.isArray(creature.abilities) ? creature.abilities : [];
      var ratio = creature.maxHp > 0 ? creature.hp / creature.maxHp : 1;
      creature.maxHp = stat(base.baseStats, creature.level, "hp", creature.shiny);
      creature.attack = stat(base.baseStats, creature.level, "attack", creature.shiny);
      creature.defense = stat(base.baseStats, creature.level, "defense", creature.shiny);
      creature.speed = stat(base.baseStats, creature.level, "speed", creature.shiny);
      creature.hp = Math.max(1, Math.min(creature.maxHp, Math.ceil(creature.maxHp * ratio)));
      creature.expToNext = xpNeeded(creature.level);
      var known = {};
      creature.abilities.forEach(function (a) { known[a.id] = a.ppLeft; });
      creature.abilities = abilityIdsFor(base, creature.level).map(function (id) {
        var move = L.Abilities.createMove(id);
        if (known[id] != null) move.ppLeft = Math.min(move.pp, known[id]);
        return move;
      });
      return creature;
    },

    unlockedAbilityIds: function (creature) {
      var base = data[creature && creature.id];
      if (!base) return [];
      return abilityIdsFor(base, creature.level || 1);
    },

    setAbilityLoadout: function (creature, ids) {
      var base = data[creature && creature.id];
      if (!base) return false;
      var unlocked = {};
      abilityIdsFor(base, creature.level || 1).forEach(function (id) { unlocked[id] = true; });
      var existing = {};
      (creature.abilities || []).forEach(function (move) { existing[move.id] = move.ppLeft; });
      var chosen = (ids || []).filter(function (id, index, list) {
        return unlocked[id] && list.indexOf(id) === index;
      }).slice(0, 4);
      if (!chosen.length) chosen = abilityIdsFor(base, creature.level || 1).slice(0, 1);
      creature.abilities = chosen.map(function (id) {
        var move = L.Abilities.createMove(id);
        if (existing[id] != null) move.ppLeft = Math.min(move.pp, existing[id]);
        return move;
      });
      return true;
    },

    heal: function (creature) {
      creature.hp = creature.maxHp;
      creature.status = null;
      creature.statStages = { attack: 0, defense: 0, speed: 0, evasion: 0 };
      creature.abilities.forEach(function (a) { a.ppLeft = a.pp; });
    },

    healTeam: function (team) {
      team.forEach(this.heal);
    },

    isFainted: function (creature) {
      return !creature || creature.hp <= 0;
    },

    firstHealthy: function (team) {
      for (var i = 0; i < team.length; i += 1) {
        if (team[i].hp > 0) return i;
      }
      return -1;
    },

    gainExp: function (creature, amount) {
      var messages = [];
      creature.exp += amount;
      messages.push(creature.displayName + " " + amount + " deneyim kazandı.");
      while (creature.exp >= creature.expToNext && creature.level < 50) {
        creature.exp -= creature.expToNext;
        creature.level += 1;
        this.recalc(creature);
        creature.hp = creature.maxHp;
        messages.push(creature.displayName + " Sv. " + creature.level + " oldu!");
      }
      return messages;
    },

    addToCollection: function (state, creature) {
      if (state.team.length < 6) {
        state.team.push(creature);
        return "team";
      }
      state.storage.push(creature);
      return "storage";
    },

    serializeFix: function (state) {
      function fixList(list) {
        return (Array.isArray(list) ? list : []).map(function (c) {
          if (!c || !data[c.id]) return null;
          if (!c.uid) c.uid = "cr_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
          return L.Creatures.recalc(c);
        }).filter(Boolean);
      }
      state.team = fixList(state.team);
      state.storage = fixList(state.storage);
      state.activeIndex = Math.max(0, Math.min(Math.max(0, state.team.length - 1), Number(state.activeIndex) || 0));
    }
  };
})();
