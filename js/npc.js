(function () {
  var L = window.LUMA = window.LUMA || {};
  var TILE = 16;

  L.NpcManager = function () {
    this.current = [];
    this.mapId = null;
  };

  L.NpcManager.prototype.load = function (mapId) {
    this.mapId = mapId;
    var rows = window.LUMA_DATA.npcs[mapId] || [];
    this.current = L.clone(rows);
  };

  L.NpcManager.prototype.atFacingTile = function (player) {
    var tile = L.Collision.facingTile(player);
    for (var i = 0; i < this.current.length; i += 1) {
      var npc = this.current[i];
      if (npc.x === tile.x && npc.y === tile.y) return npc;
      if (Math.abs(npc.x - tile.x) <= 1 && Math.abs(npc.y - tile.y) <= 1 && npc.type !== "trainer") return npc;
    }
    return null;
  };

  L.NpcManager.prototype.inLineOfSightTrainer = function (player, state) {
    var ptx = Math.floor((player.x + player.w / 2) / TILE);
    var pty = Math.floor((player.y + player.h - 4) / TILE);
    for (var i = 0; i < this.current.length; i += 1) {
      var npc = this.current[i];
      if (npc.type !== "trainer") continue;
      if (state.defeatedTrainers[npc.id]) continue;
      var dx = ptx - npc.x;
      var dy = pty - npc.y;
      var sees = (npc.dir === "left" && dy === 0 && dx < 0 && dx >= -4) ||
        (npc.dir === "right" && dy === 0 && dx > 0 && dx <= 4) ||
        (npc.dir === "up" && dx === 0 && dy < 0 && dy >= -4) ||
        (npc.dir === "down" && dx === 0 && dy > 0 && dy <= 4);
      if (sees) return npc;
    }
    return null;
  };

  L.NpcManager.prototype.facePlayer = function (npc, player) {
    var dx = player.x / TILE - npc.x;
    var dy = player.y / TILE - npc.y;
    if (Math.abs(dx) > Math.abs(dy)) npc.dir = dx < 0 ? "left" : "right";
    else npc.dir = dy < 0 ? "up" : "down";
  };
})();
