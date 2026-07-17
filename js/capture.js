(function () {
  var L = window.LUMA = window.LUMA || {};

  var rarityPenalty = {
    "Başlangıç": .55,
    "Yaygın": 1,
    "Nadir": .72,
    "Çok Nadir": .45
  };

  L.Capture = {
    chance: function (creature, item) {
      var hpMissing = 1 - creature.hp / creature.maxHp;
      var hpFactor = .22 + hpMissing * .58;
      var rarity = rarityPenalty[creature.rarity] || .7;
      var statusBonus = creature.status ? .12 : 0;
      var shinyPenalty = creature.shiny ? .84 : 1;
      var chance = (hpFactor + statusBonus) * rarity * (item.capturePower || 1) * shinyPenalty;
      return Math.max(.04, Math.min(.94, chance));
    },

    roll: function (creature, item) {
      var chance = this.chance(creature, item);
      var stages = [];
      for (var i = 0; i < 3; i += 1) {
        stages.push(Math.random() < chance + i * .04);
      }
      return {
        success: stages.every(Boolean),
        chance: chance,
        stages: stages
      };
    }
  };
})();
