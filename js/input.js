(function () {
  var L = window.LUMA = window.LUMA || {};

  function normalizeControl(key) {
    var map = {
      ArrowUp: "up", KeyW: "up",
      ArrowDown: "down", KeyS: "down",
      ArrowLeft: "left", KeyA: "left",
      ArrowRight: "right", KeyD: "right",
      ShiftLeft: "run", ShiftRight: "run",
      Enter: "action", KeyE: "action",
      Escape: "menu",
      KeyQ: "quick",
      F5: "quickSave",
      F9: "quickLoad"
    };
    return map[key] || null;
  }

  L.Input = function () {
    this.down = {};
    this.just = {};
    this.lastDirection = "down";
    this.bindKeyboard();
    this.bindTouch();
  };

  L.Input.prototype.bindKeyboard = function () {
    var self = this;
    window.addEventListener("keydown", function (event) {
      var control = normalizeControl(event.code);
      if (!control) return;
      if (["up", "down", "left", "right", "action", "menu", "quick", "quickSave", "quickLoad"].indexOf(control) >= 0) {
        event.preventDefault();
      }
      if (!self.down[control]) self.just[control] = true;
      self.down[control] = true;
      if (L.Audio) L.Audio.unlock();
    });
    window.addEventListener("keyup", function (event) {
      var control = normalizeControl(event.code);
      if (!control) return;
      event.preventDefault();
      self.down[control] = false;
    });
  };

  L.Input.prototype.bindTouch = function () {
    var self = this;
    var buttons = document.querySelectorAll("[data-control]");
    buttons.forEach(function (button) {
      var control = button.getAttribute("data-control");
      var start = function (event) {
        event.preventDefault();
        self.down[control] = true;
        self.just[control] = true;
        if (control === "menu") self.just.menu = true;
        if (L.Audio) L.Audio.unlock();
      };
      var end = function (event) {
        event.preventDefault();
        self.down[control] = false;
      };
      button.addEventListener("pointerdown", start);
      button.addEventListener("pointerup", end);
      button.addEventListener("pointercancel", end);
      button.addEventListener("pointerleave", end);
    });
    document.addEventListener("touchmove", function (event) {
      if (event.target.closest(".touch-controls")) event.preventDefault();
    }, { passive: false });
  };

  L.Input.prototype.axis = function () {
    var dx = 0;
    var dy = 0;
    if (this.down.left) dx -= 1;
    if (this.down.right) dx += 1;
    if (this.down.up) dy -= 1;
    if (this.down.down) dy += 1;
    if (dx && dy) {
      var inv = Math.SQRT1_2;
      dx *= inv;
      dy *= inv;
    }
    if (Math.abs(dx) > Math.abs(dy)) this.lastDirection = dx < 0 ? "left" : "right";
    else if (dy) this.lastDirection = dy < 0 ? "up" : "down";
    return { x: dx, y: dy };
  };

  L.Input.prototype.consume = function (control) {
    var value = !!this.just[control];
    this.just[control] = false;
    return value;
  };

  L.Input.prototype.endFrame = function () {
    this.just = {};
  };
})();
