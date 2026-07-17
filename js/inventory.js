(function () {
  var L = window.LUMA = window.LUMA || {};
  var items = window.LUMA_DATA.items;

  function ensure(inv, id) {
    if (inv[id] == null) inv[id] = 0;
  }

  L.Inventory = {
    createInitial: function () {
      return {
        kucukIksir: 4,
        buyukIksir: 1,
        tamIksir: 0,
        panzehir: 2,
        lumaKuresi: 6,
        gucluLumaKuresi: 1,
        kristalLumaKuresi: 0,
        kacisTasi: 1,
        parlakKristal: 0,
        ormanAnahtari: 0,
        magaraFeneri: 0
      };
    },

    get: function (id) {
      return items[id];
    },

    categories: function () {
      return ["İyileştirme", "Yakalama", "Görev", "Özel"];
    },

    entries: function (inventory, category) {
      return Object.keys(items).filter(function (id) {
        return items[id].category === category && (inventory[id] || 0) > 0;
      }).map(function (id) {
        return Object.assign({ qty: inventory[id] || 0 }, items[id]);
      });
    },

    add: function (state, id, qty) {
      ensure(state.inventory, id);
      state.inventory[id] += qty || 1;
    },

    remove: function (state, id, qty) {
      ensure(state.inventory, id);
      var amount = qty || 1;
      if (state.inventory[id] < amount) return false;
      state.inventory[id] -= amount;
      return true;
    },

    has: function (state, id, qty) {
      return (state.inventory[id] || 0) >= (qty || 1);
    },

    useOnCreature: function (state, id, creature) {
      var item = items[id];
      if (!item || !item.effect || !creature) return { ok: false, message: "Bu eşya burada kullanılamaz." };
      if ((state.inventory[id] || 0) <= 0) return { ok: false, message: "Bu eşyadan kalmadı." };
      if (item.effect.heal || item.effect.fullHeal) {
        if (creature.hp >= creature.maxHp && !creature.status) return { ok: false, message: creature.displayName + " zaten iyi durumda." };
        creature.hp = item.effect.fullHeal ? creature.maxHp : Math.min(creature.maxHp, creature.hp + item.effect.heal);
        if (item.effect.cure || item.effect.fullHeal) creature.status = null;
        this.remove(state, id, 1);
        return { ok: true, message: item.name + " kullanıldı." };
      }
      if (item.effect.cure) {
        if (!creature.status) return { ok: false, message: "Temizlenecek durum yok." };
        creature.status = null;
        this.remove(state, id, 1);
        return { ok: true, message: creature.displayName + " toparlandı." };
      }
      return { ok: false, message: "Bu eşya şu an kullanılamaz." };
    }
  };
})();
