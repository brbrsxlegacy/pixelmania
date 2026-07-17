(function () {
  var L = window.LUMA = window.LUMA || {};

  var stock = ["kucukIksir", "buyukIksir", "panzehir", "lumaKuresi", "gucluLumaKuresi", "kacisTasi"];

  L.Shop = {
    open: function (game) {
      this.game = game;
      this.mode = "buy";
      this.render();
    },

    render: function () {
      var state = this.game.state;
      var html = "<div class='panel-row'><strong>Para:</strong> " + state.money + " Luma " +
        "<button data-shop-mode='buy'>Satın Al</button><button data-shop-mode='sell'>Sat</button></div>";
      if (this.mode === "buy") {
        html += "<div class='panel-grid'>";
        stock.forEach(function (id) {
          var item = L.Inventory.get(id);
          html += "<div class='item-row'><strong>" + item.name + "</strong><br><small>" + item.description + "</small><br>" +
            "<span>" + item.price + " Luma</span><br><button data-shop-buy='" + id + "'>Al</button></div>";
        });
        html += "</div>";
      } else {
        html += "<div class='panel-grid'>";
        Object.keys(state.inventory).forEach(function (id) {
          var qty = state.inventory[id] || 0;
          var item = L.Inventory.get(id);
          if (!item || qty <= 0 || item.protected || item.sell <= 0) return;
          html += "<div class='item-row'><strong>" + item.name + " x" + qty + "</strong><br><small>" + item.description + "</small><br>" +
            "<span>" + item.sell + " Luma</span><br><button data-shop-sell='" + id + "'>Sat</button></div>";
        });
        html += "</div>";
      }
      L.UI.showPanel("Kadir'in Dükkanı", html, "shop");
    },

    handleClick: function (target) {
      if (!this.game) return false;
      var state = this.game.state;
      var mode = target.getAttribute("data-shop-mode");
      if (mode) {
        this.mode = mode;
        if (L.Audio) L.Audio.play("menu");
        this.render();
        return true;
      }
      var buy = target.getAttribute("data-shop-buy");
      if (buy) {
        var item = L.Inventory.get(buy);
        if (state.money < item.price) {
          L.UI.notify("Yeterli Luma yok.");
          if (L.Audio) L.Audio.play("error");
          return true;
        }
        state.money -= item.price;
        L.Inventory.add(state, buy, 1);
        L.UI.notify(item.name + " alındı.");
        if (L.Audio) L.Audio.play("pickup");
        this.render();
        return true;
      }
      var sell = target.getAttribute("data-shop-sell");
      if (sell) {
        var sItem = L.Inventory.get(sell);
        if (L.Inventory.remove(state, sell, 1)) {
          state.money += sItem.sell;
          L.UI.notify(sItem.name + " satıldı.");
          if (L.Audio) L.Audio.play("confirm");
          this.render();
        }
        return true;
      }
      return false;
    }
  };
})();
