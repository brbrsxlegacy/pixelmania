(function () {
  var L = window.LUMA = window.LUMA || {};
  var TILE = 16;

  function weightedEntry(pool, salt) {
    var total = pool.reduce(function (sum, entry) { return sum + entry.weight; }, 0);
    var roll = (Math.random() * total + salt) % total;
    for (var i = 0; i < pool.length; i += 1) {
      roll -= pool[i].weight;
      if (roll <= 0) return pool[i];
    }
    return pool[0];
  }

  function roamerFoot(x, y) {
    return { x: x + 3, y: y + 11, w: 10, h: 7 };
  }

  function blocked(map, x, y) {
    var foot = roamerFoot(x, y);
    return L.Collision.rectBlocked(map, foot.x, foot.y, foot.w, foot.h, []);
  }

  L.RoamerManager = function () {
    this.current = [];
    this.mapId = null;
  };

  L.RoamerManager.prototype.load = function (map) {
    this.current = [];
    this.mapId = map ? map.id : null;
    if (!map || !map.encounters || !map.encounters.length) return;
    var spots = [];
    for (var y = 1; y < map.h - 1; y += 1) {
      for (var x = 1; x < map.w - 1; x += 1) {
        if (!map.encounter[y * map.w + x] || map.collision[y * map.w + x]) continue;
        spots.push({ x: x, y: y });
      }
    }
    if (!spots.length) return;
    var count = Math.min(map.roamerCount || 3, spots.length);
    for (var i = 0; i < count; i += 1) {
      var spot = spots[(i * 23 + map.id.length * 7) % spots.length];
      var entry = weightedEntry(map.encounters, i * 13);
      var level = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
      this.current.push({
        id: "roamer_" + map.id + "_" + i + "_" + Date.now().toString(36),
        creatureId: entry.id,
        level: level,
        x: spot.x * TILE + 1,
        y: spot.y * TILE - 2,
        dir: ["down", "left", "right", "up"][i % 4],
        vx: 0,
        vy: 0,
        moveTimer: .4 + i * .2,
        idleTimer: .5
      });
    }
  };

  L.RoamerManager.prototype.update = function (dt, map) {
    if (!map || map.id !== this.mapId) return;
    var dirs = [
      { x: 0, y: -1, dir: "up" },
      { x: 0, y: 1, dir: "down" },
      { x: -1, y: 0, dir: "left" },
      { x: 1, y: 0, dir: "right" },
      { x: 0, y: 0, dir: "down" }
    ];
    this.current.forEach(function (r, index) {
      r.moveTimer -= dt;
      if (r.moveTimer <= 0) {
        var pick = dirs[(Math.floor(Date.now() / 700) + index * 2 + map.id.length) % dirs.length];
        r.vx = pick.x;
        r.vy = pick.y;
        if (pick.x || pick.y) r.dir = pick.dir;
        r.moveTimer = .65 + index * .08;
      }
      if (!r.vx && !r.vy) return;
      var speed = 18;
      var nx = r.x + r.vx * speed * dt;
      var ny = r.y + r.vy * speed * dt;
      if (!blocked(map, nx, ny)) {
        r.x = nx;
        r.y = ny;
      } else {
        r.vx = 0;
        r.vy = 0;
        r.moveTimer = .35;
      }
    });
  };

  L.RoamerManager.prototype.atFacingTile = function (player) {
    var tile = L.Collision.facingTile(player);
    for (var i = 0; i < this.current.length; i += 1) {
      var r = this.current[i];
      var rx = Math.floor((r.x + 7) / TILE);
      var ry = Math.floor((r.y + 16) / TILE);
      if (Math.abs(rx - tile.x) <= 1 && Math.abs(ry - tile.y) <= 1) return r;
    }
    return null;
  };

  L.RoamerManager.prototype.remove = function (id) {
    this.current = this.current.filter(function (r) { return r.id !== id; });
  };
})();
