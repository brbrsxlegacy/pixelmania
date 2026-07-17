(function () {
  var L = window.LUMA = window.LUMA || {};

  L.Camera = function (width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
  };

  L.Camera.prototype.follow = function (target, map, dt) {
    var desiredX = target.x + target.w / 2 - this.width / 2;
    var desiredY = target.y + target.h / 2 - this.height / 2;
    var maxX = Math.max(0, map.w * L.Asset.TILE - this.width);
    var maxY = Math.max(0, map.h * L.Asset.TILE - this.height);
    desiredX = Math.max(0, Math.min(maxX, desiredX));
    desiredY = Math.max(0, Math.min(maxY, desiredY));
    var t = Math.min(1, dt * 8);
    this.x += (desiredX - this.x) * t;
    this.y += (desiredY - this.y) * t;
  };
})();
