(function () {
  var L = window.LUMA = window.LUMA || {};

  L.Player = function (tileX, tileY) {
    this.w = 14;
    this.h = 20;
    this.x = tileX * 16 + 1;
    this.y = tileY * 16 - 2;
    this.dir = "down";
    this.moving = false;
    this.running = false;
    this.stepTimer = 0;
  };

  L.Player.prototype.setTile = function (tileX, tileY) {
    this.x = tileX * 16 + 1;
    this.y = tileY * 16 - 2;
  };

  L.Player.prototype.footRect = function (x, y) {
    return { x: x + 2, y: y + 11, w: 10, h: 8 };
  };

  L.Player.prototype.update = function (dt, input, map, npcs) {
    var axis = input.axis();
    this.moving = axis.x !== 0 || axis.y !== 0;
    this.running = !!input.down.run;
    if (this.moving) {
      this.dir = input.lastDirection;
      var speed = this.running ? 92 : 58;
      var nx = this.x + axis.x * speed * dt;
      var ny = this.y + axis.y * speed * dt;
      var footX = this.footRect(nx, this.y);
      if (!L.Collision.rectBlocked(map, footX.x, footX.y, footX.w, footX.h, npcs)) this.x = nx;
      var footY = this.footRect(this.x, ny);
      if (!L.Collision.rectBlocked(map, footY.x, footY.y, footY.w, footY.h, npcs)) this.y = ny;
      this.stepTimer += dt;
      if (this.stepTimer > (this.running ? .22 : .32)) {
        this.stepTimer = 0;
        if (L.Audio) L.Audio.play("step");
      }
    } else {
      this.stepTimer = 0;
    }
  };

  L.Player.prototype.draw = function (ctx, camera, time, avatar) {
    L.Asset.drawPlayer(ctx, Math.round(this.x - camera.x), Math.round(this.y - camera.y), this.dir, this.moving, this.running, time, avatar);
  };
})();
