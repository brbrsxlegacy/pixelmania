(function () {
  var L = window.LUMA;
  if (!L) return;

  function dateKey(date) {
    var now = date || new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function yesterdayKey() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateKey(yesterday);
  }

  var dailyTasks = [
    { id: 'winWild', label: '3 vahşi savaş kazan', target: 3, reward: '75 Luma' },
    { id: 'catchAny', label: '2 Luma yakala', target: 2, reward: '2 Luma Küresi' },
    { id: 'workShift', label: '1 vardiya çalış', target: 1, reward: '100 Luma' }
  ];

  var loginRewards = [
    { day: 1, label: '100 Luma', money: 100 },
    { day: 2, label: '125 Luma + 1 Luma Küresi', money: 125, item: 'lumaKuresi', qty: 1 },
    { day: 3, label: '175 Luma + 2 Küçük İksir', money: 175, item: 'kucukIksir', qty: 2 },
    { day: 4, label: '225 Luma + Luma Yumurtası', money: 225, egg: true },
    { day: 5, label: '300 Luma + 2 Luma Küresi', money: 300, item: 'lumaKuresi', qty: 2 },
    { day: 6, label: '400 Luma + Luma Yumurtası', money: 400, egg: true },
    { day: 7, label: '600 Luma + Efsane Yemi + Yumurta', money: 600, egg: true, lure: 1 }
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

  function ensureLoginReward(state) {
    state.loginReward = state.loginReward && typeof state.loginReward === 'object' ? state.loginReward : {};
    state.loginReward.lastClaim = state.loginReward.lastClaim || null;
    state.loginReward.streak = Math.max(0, Number(state.loginReward.streak) || 0);
    state.loginReward.totalClaims = Math.max(0, Number(state.loginReward.totalClaims) || 0);
    return state.loginReward;
  }

  function addMoney(state, amount) {
    state.money = Math.max(0, Math.floor((state.money || 0) + amount));
  }

  function loginDayFor(state) {
    var login = ensureLoginReward(state);
    var nextStreak = login.lastClaim === yesterdayKey() ? login.streak + 1 : (login.lastClaim === todayKey() ? login.streak : 1);
    return ((Math.max(1, nextStreak) - 1) % loginRewards.length) + 1;
  }

  function loginInfo(state) {
    var login = ensureLoginReward(state);
    var day = loginDayFor(state);
    return {
      canClaim: login.lastClaim !== todayKey(),
      streak: login.streak,
      day: day,
      reward: loginRewards[day - 1],
      lastClaim: login.lastClaim,
      totalClaims: login.totalClaims
    };
  }

  function claimLogin(game) {
    if (!game || !game.state) return { ok: false, message: 'Oyun kaydı hazır değil.' };
    var state = game.state;
    var login = ensureLoginReward(state);
    var key = todayKey();
    if (login.lastClaim === key) return { ok: false, message: 'Bugünkü giriş ödülünü zaten aldın.' };

    if (login.lastClaim === yesterdayKey()) login.streak += 1;
    else login.streak = 1;

    var day = ((login.streak - 1) % loginRewards.length) + 1;
    var reward = loginRewards[day - 1];
    login.lastClaim = key;
    login.totalClaims += 1;

    addMoney(state, reward.money || 0);
    if (reward.item && L.Inventory) L.Inventory.add(state, reward.item, reward.qty || 1);
    if (reward.egg && L.Eggs) L.Eggs.grant(game, null, 'günlük giriş ' + day);
    if (reward.lure) {
      if (L.Progression && L.Progression.ensureState) L.Progression.ensureState(state);
      if (state.legendaryHunts) state.legendaryHunts.lures = (state.legendaryHunts.lures || 0) + reward.lure;
    }

    if (game.autosaveSoon) game.autosaveSoon();
    return { ok: true, day: day, reward: reward, message: day + '. gün giriş ödülü: ' + reward.label };
  }

  L.Daily = {
    tasks: dailyTasks,
    loginRewards: loginRewards,
    ensureState: ensureTaskBag,
    ensureLoginReward: ensureLoginReward,
    loginInfo: loginInfo,
    claimLogin: claimLogin,
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
      addMoney(state, 300 + daily.streak * 25);
      if (L.Inventory) {
        L.Inventory.add(state, 'lumaKuresi', 3);
        L.Inventory.add(state, 'kucukIksir', 2);
      }
      if (L.Eggs) L.Eggs.grant(game, null, 'günlük görev serisi ' + daily.streak);
      if (game && game.ui && game.ui.notify) game.ui.notify('3 günlük görev tamamlandı: para, eşya ve Luma yumurtası kazandın!');
      if (game && game.autosaveSoon) game.autosaveSoon();
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
      return base && base.id !== 'lumeru' && base.id !== 'crownlex' && !base.crateExclusive;
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
    if (game && game.ui && game.ui.notify) game.ui.notify('Yumurta çatladı! ' + creature.nickname + ' koleksiyonuna katıldı.');
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
