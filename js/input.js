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
    this.touchAxis = { x: 0, y: 0 };
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
    this.bindTouchStick();
    document.addEventListener("touchmove", function (event) {
      if (event.target.closest(".touch-controls")) event.preventDefault();
    }, { passive: false });
  };

  L.Input.prototype.bindTouchStick = function () {
    var self = this;
    var stick = document.getElementById("touchStick");
    var knob = document.getElementById("touchKnob");
    if (!stick || !knob) return;
    var activePointer = null;
    var radius = 42;

    function reset() {
      activePointer = null;
      self.touchAxis.x = 0;
      self.touchAxis.y = 0;
      knob.style.transform = "translate(0px, 0px)";
    }

    function update(event) {
      if (activePointer !== null && event.pointerId !== activePointer) return;
      var rect = stick.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = event.clientX - cx;
      var dy = event.clientY - cy;
      var dist = Math.max(1, Math.hypot(dx, dy));
      var clamped = Math.min(radius, dist);
      var nx = dx / dist;
      var ny = dy / dist;
      var strength = clamped / radius;
      self.touchAxis.x = Math.abs(nx * strength) < .16 ? 0 : nx * strength;
      self.touchAxis.y = Math.abs(ny * strength) < .16 ? 0 : ny * strength;
      knob.style.transform = "translate(" + Math.round(nx * clamped) + "px, " + Math.round(ny * clamped) + "px)";
    }

    stick.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      activePointer = event.pointerId;
      if (stick.setPointerCapture) stick.setPointerCapture(event.pointerId);
      if (L.Audio) L.Audio.unlock();
      update(event);
    });
    stick.addEventListener("pointermove", function (event) {
      if (activePointer === null) return;
      event.preventDefault();
      update(event);
    });
    stick.addEventListener("pointerup", function (event) {
      event.preventDefault();
      reset();
    });
    stick.addEventListener("pointercancel", function (event) {
      event.preventDefault();
      reset();
    });
  };

  L.Input.prototype.axis = function () {
    var dx = this.touchAxis.x;
    var dy = this.touchAxis.y;
    if (this.down.left) dx -= 1;
    if (this.down.right) dx += 1;
    if (this.down.up) dy -= 1;
    if (this.down.down) dy += 1;
    var length = Math.hypot(dx, dy);
    if (length > 1) {
      dx /= length;
      dy /= length;
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
