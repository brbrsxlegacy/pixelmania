(function () {
  var L = window.LUMA = window.LUMA || {};

  L.Particles = function () {
    this.items = [];
  };

  L.Particles.prototype.spawn = function (x, y, color, count) {
    for (var i = 0; i < (count || 6); i += 1) {
      this.items.push({
        x: x,
        y: y,
        vx: (Math.random() - .5) * 28,
        vy: -16 - Math.random() * 24,
        life: .45 + Math.random() * .45,
        color: color || "#fff4d2"
      });
    }
  };

  L.Particles.prototype.update = function (dt) {
    for (var i = this.items.length - 1; i >= 0; i -= 1) {
      var p = this.items[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 52 * dt;
      if (p.life <= 0) this.items.splice(i, 1);
    }
  };

  L.Particles.prototype.draw = function (ctx, camera) {
    for (var i = 0; i < this.items.length; i += 1) {
      var p = this.items[i];
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2));
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - camera.x), Math.round(p.y - camera.y), 2, 2);
      ctx.globalAlpha = 1;
    }
  };
})();
