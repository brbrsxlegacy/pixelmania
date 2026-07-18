(function () {
  var L = window.LUMA;
  if (!L) return;

  function todayKey() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  var dailyTasks = [
    { id: 'winWild', label: '3 vahşi savaş kazan', target: 3, reward: '60 Luma' },
    { id: 'catchAny', label: '2 Luma yakala', target: 2, reward: '1 Luma Küresi' },
    { id: 'workShift', label: '1 vardiya çalış', target: 1, reward: '90 Luma' },
    { id: 'pvpBattle', label: '1 PvP maçı bitir', target: 1, reward: 'PvP puanı' }
  ];

  function ensureTaskBag(state) {
    var key = todayKey();
    state.daily = state.daily || {};
    if (state.daily.date !== key) {
      state.daily.date = key;
      state.daily.claimed = false;
      state.daily.tasks = {};
    }
    state.daily.tasks = state.daily.tasks || {};
    if (typeof state.daily.streak !== 'number') state.daily.streak = 0;
    dailyTasks.forEach(function (task) {
      if (typeof state.daily.tasks[task.id] !== 'number') state.daily.tasks[task.id] = 0;
    });
    return state.daily;
  }

  function addMoney(state, amount) {
    state.money = Math.max(0, Math.floor((state.money || 0) + amount));
  }

  L.Daily = {
    tasks: dailyTasks,
    ensureState: ensureTaskBag,
    progress: function (state, id, amount) {
      var daily = ensureTaskBag(state);
      var task = dailyTasks.find(function (entry) { return entry.id === id; });
      if (!task) return false;
      var before = daily.tasks[id] || 0;
      daily.tasks[id] = Math.min(task.target, before + (amount || 1));
      return daily.tasks[id] !== before;
    },
    isComplete: function (state) {
      var daily = ensureTaskBag(state);
      return dailyTasks.every(function (task) { return (daily.tasks[task.id] || 0) >= task.target; });
    },
    claim: function (game) {
      var state = game.state;
      var daily = ensureTaskBag(state);
      if (daily.claimed || !this.isComplete(state)) return false;
      daily.claimed = true;
      daily.streak = (daily.streak || 0) + 1;
      addMoney(state, 250 + daily.streak * 25);
      if (L.Inventory) {
        L.Inventory.add(state, 'lumaKuresi', 3);
        L.Inventory.add(state, 'kucukIksir', 2);
      }
      if (L.Eggs) L.Eggs.grant(game, null, 'günlük seri ' + daily.streak);
      if (game && game.dialogue) {
        game.dialogue.show('Günlük ödül alındı: para, eşya ve yeni bir Luma yumurtası!');
      }
      return true;
    }
  };

  var eggElements = ['Yaprak', 'Alev', 'Su', 'Elektrik', 'Kaya', 'Rüzgar', 'Gölge', 'Işık'];

  function ensureEggs(state) {
    state.eggs = state.eggs || {};
    state.eggs.inventory = Array.isArray(state.eggs.inventory) ? state.eggs.inventory : [];
    if (typeof state.eggs.hatched !== 'number') state.eggs.hatched = 0;
    return state.eggs;
  }

  function randomId() {
    return 'egg_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  function candidatesFor(element) {
    if (!L.Creatures || !L.Creatures.list) return [];
    var list = L.Creatures.list.filter(function (base) {
      return base && base.id !== 'lumeru' && base.id !== 'crownlex';
    });
    var filtered = element ? list.filter(function (base) { return base.element === element; }) : list;
    return filtered.length ? filtered : list;
  }

  function tryHatch(game) {
    var eggs = ensureEggs(game.state);
    var ready = eggs.inventory.find(function (egg) { return egg.steps >= egg.stepsNeeded; });
    if (!ready) return false;
    eggs.inventory = eggs.inventory.filter(function (egg) { return egg.id !== ready.id; });
    eggs.hatched += 1;

    var pool = candidatesFor(ready.element);
    if (!pool.length || !L.Creatures) return false;
    var base = pool[Math.floor(Math.random() * pool.length)];
    var creature = L.Creatures.create(base.id, Math.max(2, Math.min(8, 3 + Math.floor(eggs.hatched / 2))));
    creature.nickname = base.name;
    L.Creatures.addToCollection(game.state, creature);
    if (L.WorldMap && L.WorldMap.recordCaught) L.WorldMap.recordCaught(game.state, creature.id);
    if (game.dialogue) game.dialogue.show('Yumurta çatladı! ' + creature.nickname + ' takımına katıldı.');
    if (game.autosaveSoon) game.autosaveSoon();
    return true;
  }

  L.Eggs = {
    ensureState: ensureEggs,
    grant: function (game, element, source) {
      var eggs = ensureEggs(game.state);
      var chosen = element || eggElements[Math.floor(Math.random() * eggElements.length)];
      eggs.inventory.push({
        id: randomId(),
        element: chosen,
        source: source || 'gizemli hediye',
        steps: 0,
        stepsNeeded: 520
      });
      return eggs.inventory[eggs.inventory.length - 1];
    },
    progress: function (game, amount) {
      var eggs = ensureEggs(game.state);
      if (!eggs.inventory.length) return false;
      var moved = Math.max(0, amount || 0);
      if (!moved) return false;
      eggs.inventory.forEach(function (egg) {
        egg.steps = Math.min(egg.stepsNeeded, (egg.steps || 0) + moved);
      });
      return tryHatch(game);
    },
    tryHatch: tryHatch,
    labelFor: function (element) {
      if (L.Types && L.Types[element]) return L.Types[element].name;
      return element || 'Gizem';
    }
  };
})();
