(function () {
  var L = window.LUMA = window.LUMA || {};
  var data = window.LUMA_DATA.quests;

  function cloneObjectives(q) {
    return q.objectives.map(function (o) {
      return { id: o.id, text: o.text, target: o.target, count: 0, done: false };
    });
  }

  L.Quests = {
    createState: function () {
      return {};
    },

    get: function (id) {
      return data[id];
    },

    start: function (state, id, silent) {
      if (state.quests[id]) return false;
      var q = data[id];
      if (!q) return false;
      state.quests[id] = {
        id: id,
        status: "active",
        objectives: cloneObjectives(q),
        completedAt: null
      };
      if (!silent && L.UI) L.UI.notify("Yeni görev: " + q.title);
      if (!silent && L.Audio) L.Audio.play("quest");
      return true;
    },

    progress: function (state, objectiveId, amount) {
      var changed = false;
      Object.keys(state.quests).forEach(function (qid) {
        var questState = state.quests[qid];
        if (questState.status !== "active") return;
        questState.objectives.forEach(function (obj) {
          if (obj.id !== objectiveId || obj.done) return;
          obj.count = Math.min(obj.target, obj.count + (amount || 1));
          obj.done = obj.count >= obj.target;
          changed = true;
          if (L.UI) L.UI.notify("Görev güncellendi: " + obj.text);
        });
        if (questState.objectives.every(function (o) { return o.done; })) {
          L.Quests.complete(state, qid);
        }
      });
      return changed;
    },

    complete: function (state, id) {
      var questState = state.quests[id];
      var q = data[id];
      if (!questState || !q || questState.status === "completed") return false;
      questState.status = "completed";
      questState.completedAt = Date.now();
      q.rewards.forEach(function (reward) {
        if (reward.type === "money") state.money += reward.amount;
        if (reward.type === "item") L.Inventory.add(state, reward.itemId, reward.qty);
      });
      if (L.UI) L.UI.notify("Görev tamamlandı: " + q.title);
      if (L.Audio) L.Audio.play("victory");
      return true;
    },

    active: function (state) {
      return Object.keys(state.quests).filter(function (id) {
        return state.quests[id].status === "active";
      }).map(function (id) {
        return Object.assign({}, data[id], { state: state.quests[id] });
      });
    },

    allForJournal: function (state) {
      return Object.keys(data).map(function (id) {
        return Object.assign({}, data[id], { state: state.quests[id] || null });
      });
    },

    hasCompleted: function (state, id) {
      return state.quests[id] && state.quests[id].status === "completed";
    }
  };
})();
