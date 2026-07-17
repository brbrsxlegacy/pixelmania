(function () {
  var L = window.LUMA = window.LUMA || {};
  var data = window.LUMA_DATA.abilities;

  var strong = {
    Alev: ["Yaprak"],
    Yaprak: ["Su"],
    Su: ["Alev"],
    Kaya: ["Elektrik"],
    Elektrik: ["Su"],
    Işık: ["Gölge"],
    Gölge: ["Işık"],
    Rüzgar: []
  };

  var weak = {
    Alev: ["Su", "Kaya"],
    Yaprak: ["Alev"],
    Su: ["Yaprak", "Elektrik"],
    Kaya: ["Yaprak", "Su"],
    Elektrik: ["Kaya"],
    Işık: ["Işık"],
    Gölge: ["Gölge"],
    Rüzgar: []
  };

  L.Abilities = {
    get: function (id) {
      return data[id];
    },

    all: function () {
      return data;
    },

    createMove: function (id) {
      var a = data[id];
      return Object.assign({}, a, { ppLeft: a.pp });
    },

    effectiveness: function (attackElement, defendElement) {
      if ((strong[attackElement] || []).indexOf(defendElement) >= 0) return 1.6;
      if ((weak[attackElement] || []).indexOf(defendElement) >= 0) return .65;
      return 1;
    },

    effectivenessText: function (multiplier) {
      if (multiplier > 1.1) return "Çok etkili!";
      if (multiplier < .9) return "Pek etkili değil.";
      return "";
    },

    elementColor: function (element) {
      return {
        Yaprak: "#54b86b",
        Alev: "#e46d45",
        Su: "#4aa8d8",
        Kaya: "#8a8f91",
        Rüzgar: "#9ed7e7",
        Elektrik: "#f2d54a",
        Gölge: "#59547c",
        Işık: "#f2d86b"
      }[element] || "#fff4d2";
    }
  };
})();
