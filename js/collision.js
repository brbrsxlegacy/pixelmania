(function () {
  var L = window.LUMA = window.LUMA || {};
  var TILE = 16;

  function tileAt(map, px, py) {
    return { x: Math.floor(px / TILE), y: Math.floor(py / TILE) };
  }

  L.Collision = {
    blockedTile: function (map, tx, ty) {
      if (tx < 0 || ty < 0 || tx >= map.w || ty >= map.h) return true;
      return !!map.collision[ty * map.w + tx];
    },

    rectBlocked: function (map, x, y, w, h, npcs, ignoreNpcId) {
      var points = [
        tileAt(map, x, y),
        tileAt(map, x + w - 1, y),
        tileAt(map, x, y + h - 1),
        tileAt(map, x + w - 1, y + h - 1)
      ];
      for (var i = 0; i < points.length; i += 1) {
        if (this.blockedTile(map, points[i].x, points[i].y)) return true;
      }
      if (npcs) {
        for (var n = 0; n < npcs.length; n += 1) {
          var npc = npcs[n];
          if (npc.id === ignoreNpcId) continue;
          var nx = npc.x * TILE + 2;
          var ny = npc.y * TILE + 4;
          if (x < nx + 12 && x + w > nx && y < ny + 12 && y + h > ny) return true;
        }
      }
      return false;
    },

    facingTile: function (player) {
      var cx = player.x + player.w / 2;
      var cy = player.y + player.h - 5;
      if (player.dir === "up") cy -= 14;
      if (player.dir === "down") cy += 12;
      if (player.dir === "left") cx -= 13;
      if (player.dir === "right") cx += 13;
      return tileAt(null, cx, cy);
    },

    tileAtPixel: tileAt
  };
})();
